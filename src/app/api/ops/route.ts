import { getRecentEvents } from "@/lib/protocol/events";
import { repo } from "@/lib/store/repo";

export const runtime = "nodejs";

export async function GET() {
  const [stores, orders, reviews] = await Promise.all([
    repo.listStores(),
    repo.listOrders(),
    repo.listReviews(),
  ]);
  const interceptaEvents = getRecentEvents().filter((e) =>
    e.message.toLowerCase().includes("intercepta"),
  );
  const lastBlock = [...interceptaEvents]
    .reverse()
    .find((e) => e.status === 402);
  return Response.json({
    stores,
    orders,
    reviews,
    intercepta: {
      lastBlock: lastBlock
        ? {
            message: lastBlock.message,
            store: lastBlock.store,
            orderId: lastBlock.orderId,
            ts: lastBlock.ts,
          }
        : null,
      enabled: Boolean(process.env.INTERCEPTA_API_KEY?.trim()),
    },
    aws: {
      table: process.env.AISLE_TABLE || null,
      protocolBase:
        process.env.PROTOCOL_BASE_URL ||
        process.env.NEXT_PUBLIC_PROTOCOL_BASE_URL ||
        null,
      region: process.env.AWS_REGION || null,
    },
  });
}
