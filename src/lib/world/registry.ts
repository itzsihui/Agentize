import { doc, getDoc, runTransaction } from "firebase/firestore";
import { getServerFirestore } from "@/lib/firebase/server";

/**
 * One human (World ID nullifier) ↔ one merchant account.
 *
 * - `world_nullifiers/{nullifier}` → which merchant uid claimed it
 * - `world_merchants/{uid}` → verification record for that merchant
 *
 * Firestore is best-effort (server uses the client SDK); the in-memory maps
 * are always written so a single dev server enforces the rule even when
 * Firestore rules reject unauthenticated server writes.
 */

export type MerchantHumanVerification = {
  uid: string;
  nullifier: string;
  credential: string;
  issuerSchemaId?: number;
  environment: string;
  verifiedAt: string;
};

const NULLIFIERS = "world_nullifiers";
const MERCHANTS = "world_merchants";

const g = globalThis as unknown as {
  __worldNullifiers?: Map<string, string>;
  __worldMerchants?: Map<string, MerchantHumanVerification>;
};
const memNullifiers = (g.__worldNullifiers ??= new Map());
const memMerchants = (g.__worldMerchants ??= new Map());

/** Normalize hex / decimal nullifiers to a canonical decimal string. */
export function normalizeNullifier(raw: string): string {
  const v = raw.trim();
  try {
    return BigInt(v.startsWith("0x") || v.startsWith("0X") ? v : v).toString(10);
  } catch {
    return v.toLowerCase();
  }
}

export async function getMerchantVerification(
  uid: string,
): Promise<MerchantHumanVerification | null> {
  const mem = memMerchants.get(uid);
  if (mem) return mem;
  const db = getServerFirestore();
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, MERCHANTS, uid));
    if (!snap.exists()) return null;
    const rec = snap.data() as MerchantHumanVerification;
    memMerchants.set(uid, rec);
    memNullifiers.set(rec.nullifier, uid);
    return rec;
  } catch {
    return null;
  }
}

export async function isMerchantHumanVerified(uid?: string | null) {
  if (!uid) return false;
  return Boolean(await getMerchantVerification(uid));
}

export type ClaimResult =
  | { ok: true; record: MerchantHumanVerification; alreadyVerified: boolean }
  | { ok: false; reason: "nullifier_taken"; ownerUid: string };

/**
 * Bind a nullifier to a merchant uid. Fails if the same human already backs
 * a different merchant account (the anti-storefront-flooding rule).
 */
export async function claimNullifierForMerchant(
  input: Omit<MerchantHumanVerification, "verifiedAt" | "nullifier"> & {
    nullifier: string;
  },
): Promise<ClaimResult> {
  const nullifier = normalizeNullifier(input.nullifier);
  const record: MerchantHumanVerification = {
    ...input,
    nullifier,
    verifiedAt: new Date().toISOString(),
  };

  const memOwner = memNullifiers.get(nullifier);
  if (memOwner && memOwner !== input.uid) {
    return { ok: false, reason: "nullifier_taken", ownerUid: memOwner };
  }

  const db = getServerFirestore();
  if (db) {
    try {
      const outcome = await runTransaction(db, async (tx) => {
        const nRef = doc(db, NULLIFIERS, nullifier);
        const nSnap = await tx.get(nRef);
        const owner = nSnap.exists()
          ? String((nSnap.data() as { uid?: string }).uid || "")
          : "";
        if (owner && owner !== input.uid) return { taken: owner };
        tx.set(nRef, { uid: input.uid, verifiedAt: record.verifiedAt });
        tx.set(doc(db, MERCHANTS, input.uid), record);
        return { taken: null as string | null, existed: Boolean(owner) };
      });
      if (outcome.taken) {
        memNullifiers.set(nullifier, outcome.taken);
        return { ok: false, reason: "nullifier_taken", ownerUid: outcome.taken };
      }
    } catch (err) {
      console.warn("[world-registry] Firestore write failed; memory only", err);
    }
  }

  const alreadyVerified = memOwner === input.uid;
  memNullifiers.set(nullifier, input.uid);
  memMerchants.set(input.uid, record);
  return { ok: true, record, alreadyVerified };
}
