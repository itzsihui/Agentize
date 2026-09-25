import { requireMerchantUid } from "@/lib/world/auth";
import { getMerchantVerification } from "@/lib/world/registry";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const uid = await requireMerchantUid(request);
  if (!uid) return Response.json({ verified: false }, { status: 401 });
  const rec = await getMerchantVerification(uid);
  return Response.json({
    verified: Boolean(rec),
    credential: rec?.credential ?? null,
    verifiedAt: rec?.verifiedAt ?? null,
  });
}
