import type { IDKitResult } from "@worldcoin/idkit-core";
import { hashSignal } from "@worldcoin/idkit-core/hashing";
import { requireMerchantUid } from "@/lib/world/auth";
import {
  ACCEPTED_DOCUMENT_CREDENTIALS,
  ACCEPTED_DOCUMENT_SCHEMA_IDS,
  WORLD_ACTION_PUBLISH_STOREFRONT,
  WORLD_VERIFY_BASE_URL,
  worldPublicConfig,
  worldStagingVerificationToken,
} from "@/lib/world/config";
import { claimNullifierForMerchant } from "@/lib/world/registry";

export const runtime = "nodejs";

type ResponseItem = IDKitResult["responses"][number] & {
  identifier: string;
  nullifier?: string;
  issuer_schema_id?: number;
  signal_hash?: string;
};

function verifyHeaders(environment: string): Record<string, string> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  const token = worldStagingVerificationToken();
  // Staging / Simulator proofs are only accepted inside an open staging window.
  if (environment !== "production" && token) {
    headers["x-staging-verification-token"] = token;
  }
  return headers;
}

function fail(status: number, code: string, message: string) {
  return Response.json({ ok: false, code, message }, { status });
}

/**
 * Validates an IDKit proof for the publish-storefront action and binds the
 * resulting nullifier to the signed-in merchant. The client result is never
 * trusted on its own: World's verify API checks the proof, and we check the
 * action, signal (merchant uid), credential type and nullifier uniqueness.
 */
export async function POST(request: Request) {
  const uid = await requireMerchantUid(request);
  if (!uid) return fail(401, "unauthenticated", "Sign in as a merchant first.");

  const cfg = worldPublicConfig();
  if (!cfg.configured) {
    return fail(503, "not_configured", "World ID is not configured on this server.");
  }

  let result: IDKitResult;
  try {
    ({ idkitResponse: result } = (await request.json()) as {
      idkitResponse: IDKitResult;
    });
  } catch {
    return fail(400, "bad_request", "Missing IDKit response.");
  }
  if (!result || !Array.isArray(result.responses) || result.responses.length === 0) {
    return fail(400, "bad_request", "Missing IDKit response.");
  }
  if ("session_id" in result && result.session_id) {
    return fail(400, "wrong_proof_type", "Expected a uniqueness proof, got a session proof.");
  }
  if ("action" in result && result.action && result.action !== WORLD_ACTION_PUBLISH_STOREFRONT) {
    return fail(400, "wrong_action", "Proof was generated for a different action.");
  }

  const item = (result.responses as ResponseItem[]).find(
    (r) =>
      ACCEPTED_DOCUMENT_CREDENTIALS.has(r.identifier) ||
      (r.issuer_schema_id !== undefined &&
        ACCEPTED_DOCUMENT_SCHEMA_IDS.has(r.issuer_schema_id)),
  );
  if (!item || !item.nullifier) {
    return fail(
      403,
      "credential_not_accepted",
      "Storefront listing needs a Passport, eID or My Number Card credential.",
    );
  }

  const expectedSignal = hashSignal(uid).toLowerCase();
  if (!item.signal_hash || item.signal_hash.toLowerCase() !== expectedSignal) {
    return fail(403, "signal_mismatch", "Proof is not bound to this merchant account.");
  }

  // Cryptographic verification by World (proof, root, RP signature, action).
  const worldRes = await fetch(
    `${WORLD_VERIFY_BASE_URL}/${encodeURIComponent(cfg.rpId)}`,
    {
      method: "POST",
      headers: verifyHeaders(String(result.environment || cfg.environment)),
      body: JSON.stringify(result),
    },
  ).catch(() => null);
  if (!worldRes) {
    return fail(502, "world_unreachable", "Could not reach World ID verification.");
  }
  if (!worldRes.ok) {
    const raw = await worldRes.text().catch(() => "");
    console.warn("[world-verify] rejected", worldRes.status, raw.slice(0, 500));
    let worldCode = "";
    let worldDetail = "";
    try {
      const parsed = JSON.parse(raw) as { code?: string; detail?: string };
      worldCode = parsed.code || "";
      worldDetail = parsed.detail || "";
    } catch {
      worldDetail = raw.slice(0, 200);
    }
    const reason = [worldCode, worldDetail].filter(Boolean).join(": ");
    return fail(
      403,
      "proof_rejected",
      `World ID rejected this proof (HTTP ${worldRes.status}${reason ? ` — ${reason}` : ""}).`,
    );
  }

  const claim = await claimNullifierForMerchant({
    uid,
    nullifier: item.nullifier,
    credential: item.identifier,
    issuerSchemaId: item.issuer_schema_id,
    environment: String(result.environment || cfg.environment),
  });
  if (!claim.ok) {
    return fail(
      409,
      "already_backing_another_merchant",
      "This document already backs another merchant account. One person, one storefront.",
    );
  }

  return Response.json({
    ok: true,
    credential: claim.record.credential,
    verifiedAt: claim.record.verifiedAt,
    alreadyVerified: claim.alreadyVerified,
  });
}
