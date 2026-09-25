import { checksumAddress } from "@/lib/config";
import { screenPayToForBuyer, screenPayerForMerchant } from "@/lib/intercepta/policy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      purpose?: string;
      address?: string;
      payTo?: string;
    };
    const raw = (body.address || body.payTo || "").trim();
    const address = checksumAddress(raw);
    if (!address) {
      return Response.json({ error: "valid 0x address required" }, { status: 400 });
    }

    const purpose = body.purpose || "buyer_preview";
    const verdict =
      purpose === "merchant"
        ? await screenPayerForMerchant(address)
        : await screenPayToForBuyer(address);

    return Response.json(verdict);
  } catch (error) {
    const message = error instanceof Error ? error.message : "screen failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
