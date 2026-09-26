import type { InterceptaReport } from "../_components/intercepta-report-card";

export type { InterceptaReport };

function shortAddr(address?: string | null) {
  if (!address) return "—";
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function buildInterceptaReport(args: {
  outcome: "allow" | "refuse" | "hold" | "error";
  title?: string;
  buyer?: {
    decision?: string;
    toxicScore?: number | null;
    source?: string;
    address?: string;
    reasons?: string[];
  };
  merchant?: {
    decision?: string;
    toxicScore?: number | null;
    source?: string;
    address?: string;
    reasons?: string[];
  };
}): InterceptaReport {
  const rows: InterceptaReport["rows"] = [];
  if (args.buyer) {
    rows.push(
      { label: "Buyer gate", value: "payTo · before sign" },
      {
        label: "payTo",
        value: shortAddr(args.buyer.address),
      },
      {
        label: "Buyer decision",
        value: `${args.buyer.decision ?? "—"} · score ${args.buyer.toxicScore ?? "?"} · ${args.buyer.source ?? "quick-scan"}`,
      },
    );
  }
  if (args.merchant) {
    rows.push(
      { label: "Merchant gate", value: "payer · before settle" },
      {
        label: "Screened payer",
        value: args.merchant.address || "—",
      },
      {
        label: "Merchant decision",
        value: `${args.merchant.decision ?? "—"} · score ${args.merchant.toxicScore ?? "?"} · ${args.merchant.source ?? "—"}`,
      },
    );
  }
  const reasons = [
    ...(args.merchant?.reasons ?? []),
    ...(args.buyer?.reasons ?? []),
  ].filter(Boolean);

  return {
    title:
      args.title ||
      (args.outcome === "allow"
        ? "Intercepta · payment allowed"
        : "Intercepta · payment blocked"),
    outcome: args.outcome,
    rows,
    reasons: reasons.length ? reasons : undefined,
  };
}
