import { bearerToken, verifyFirebaseIdToken } from "@/lib/firebase/verify-id-token";

/** Merchant uid from a verified Firebase ID token — never from the request body. */
export async function requireMerchantUid(request: Request): Promise<string | null> {
  const token = bearerToken(request);
  if (!token) return null;
  const verified = await verifyFirebaseIdToken(token);
  return verified?.uid ?? null;
}
