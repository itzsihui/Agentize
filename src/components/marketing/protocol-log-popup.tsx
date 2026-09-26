"use client";

import { useEffect, useState } from "react";
import { TerminalWindowIcon, XIcon } from "@phosphor-icons/react";
import { ProtocolLog } from "@/components/marketing/protocol-log";
import { cn } from "@/lib/utils";

export function ProtocolLogPopup({
  className,
  defaultOpen = false,
}: {
  className?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={cn("pointer-events-none fixed inset-x-0 bottom-0 z-40", className)}>
      <div className="pointer-events-auto absolute right-4 bottom-4 sm:right-6 sm:bottom-6">
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-100 shadow-lg transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            <TerminalWindowIcon className="size-4" weight="bold" aria-hidden />
            Protocol / Intercepta
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          className="pointer-events-auto fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Protocol and Intercepta log"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[min(80dvh,560px)] w-full max-w-3xl flex-col overflow-hidden rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-700 bg-neutral-950 px-3 py-2">
              <p className="text-xs font-medium text-neutral-300">
                Live protocol log · x402 + Intercepta
              </p>
              <button
                type="button"
                aria-label="Close protocol log"
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
              >
                <XIcon className="size-4" weight="bold" />
              </button>
            </div>
            <ProtocolLog
              className="min-h-0 flex-1 rounded-none border-0"
              bodyClassName="h-[min(60dvh,420px)]"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
