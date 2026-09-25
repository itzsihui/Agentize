import { getDemoPersonas } from "@/lib/intercepta/personas";

export const runtime = "nodejs";

export async function GET() {
  const demo =
    process.env.NEXT_PUBLIC_INTERCEPTA_DEMO !== "false";
  return Response.json({
    demo,
    honest: {
      id: "honest",
      label: "Honest buyer",
      blurb: "Screen the real Sepolia payer. Clean path — payment can settle.",
    },
    personas: getDemoPersonas(),
  });
}
