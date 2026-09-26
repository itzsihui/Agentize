"use client";

import { cn } from "@/lib/utils";

export type InterceptaReportRow = {
  label: string;
  value: string;
};

export type InterceptaReport = {
  title: string;
  outcome: "allow" | "refuse" | "hold" | "error";
  rows: InterceptaReportRow[];
  reasons?: string[];
};

export function InterceptaReportCard({ report }: { report: InterceptaReport }) {
  const tone =
    report.outcome === "refuse" || report.outcome === "error"
      ? "border-destructive/35 bg-destructive/5"
      : report.outcome === "hold"
        ? "border-amber-500/35 bg-amber-500/5"
        : "border-emerald-600/30 bg-emerald-500/5";

  const badge =
    report.outcome === "refuse"
      ? "bg-destructive/15 text-destructive"
      : report.outcome === "hold"
        ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
        : report.outcome === "error"
          ? "bg-destructive/15 text-destructive"
          : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200";

  return (
    <div
      className={cn(
        "mt-2 max-w-[min(90%,42rem)] overflow-hidden rounded-xl border",
        tone,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-3.5 py-2.5">
        <p className="text-sm font-medium tracking-tight">{report.title}</p>
        <span
          className={cn(
            "rounded px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide",
            badge,
          )}
        >
          {report.outcome}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse text-left text-xs">
          <tbody>
            {report.rows.map((row) => (
              <tr key={row.label} className="border-b border-border/40 last:border-b-0">
                <th
                  scope="row"
                  className="w-[38%] px-3.5 py-2 align-top font-medium text-foreground/55"
                >
                  {row.label}
                </th>
                <td className="px-3.5 py-2 font-mono text-[11px] leading-snug break-all text-foreground/85">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {report.reasons && report.reasons.length > 0 ? (
        <div className="border-t border-border/60 px-3.5 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-foreground/45">
            Reasons
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {report.reasons.map((reason, i) => (
              <li
                key={`${i}-${reason.slice(0, 48)}`}
                className="text-[12px] leading-snug text-foreground/75"
              >
                {reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
