import { signRequest } from "@worldcoin/idkit-core/signing";
import { requireMerchantUid } from "@/lib/world/auth";
import {
  WORLD_ACTION_PUBLISH_STOREFRONT,
  worldPublicConfig,
  worldRpSigningKey,
} from "@/lib/world/config";

export const runtime = "nodejs";

/** Signs an IDKit request for the publish-storefront action (server only). */
export async function POST(request: Request) {
  const uid = await requireMerchantUid(request);
  if (!uid) {
    return Response.json({ error: "Sign in as a merchant first." }, { status: 401 });
  }
  const key = worldRpSigningKey();
  const cfg = worldPublicConfig();
  if (!key || !cfg.configured) {
    return Response.json(
      { error: "World ID is not configured on this server." },
      { status: 503 },
    );
  }
  const { sig, nonce, createdAt, expiresAt } = signRequest({
    signingKeyHex: key,
    action: WORLD_ACTION_PUBLISH_STOREFRONT,
  });
  return Response.json({
    rp_id: cfg.rpId,
    nonce,
    created_at: createdAt,
    expires_at: expiresAt,
    signature: sig,
    // Signal binds the proof to this merchant account (checked in /verify).
    signal: uid,
  });
}
