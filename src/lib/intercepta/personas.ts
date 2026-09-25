import { getAddress, isAddress } from "viem";
import { interceptaConfig } from "@/lib/config";
import type { InterceptaDemoPersona } from "./types";

/**
 * Public mainnet fixtures Intercepta typically scores as high-risk
 * (OFAC / mixer-adjacent). Replace via INTERCEPTA_DEMO_PERSONAS with
 * Discord-pinned addresses from the EthGlobal booth channel.
 */
export const DEFAULT_DEMO_PERSONAS: InterceptaDemoPersona[] = [
  {
    id: "sanctioned",
    label: "Sanctioned",
    blurb: "OFAC-listed Hydra-related wallet — dirty-money / sanctions story.",
    address: "0x7F367cC41522cE07553e823bf3be79A889DEbe1B",
  },
  {
    id: "mixer",
    label: "Mixer-linked",
    blurb: "Tornado Cash router — mixer exposure before merchant settle.",
    address: "0x8589427373D6D84E98730D7795D8f6f8731FDA16",
  },
  {
    id: "scammer",
    label: "Known scammer cluster",
    blurb: "Public Lazarus-associated address — scam / stolen-funds exposure.",
    address: "0x098B716B8Aaf21512996dC57EB0615e2383E2f96",
  },
];

function normalizeAddress(value: string): string | null {
  try {
    if (!isAddress(value)) return null;
    return getAddress(value);
  } catch {
    return null;
  }
}

function parseEnvPersonas(): InterceptaDemoPersona[] | null {
  const raw = interceptaConfig.demoPersonasJson;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const out: InterceptaDemoPersona[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const address = normalizeAddress(String(row.address || ""));
      const id = String(row.id || "").trim();
      const label = String(row.label || "").trim();
      if (!address || !id || !label) continue;
      out.push({
        id,
        label,
        blurb: String(row.blurb || "").trim() || `${label} mainnet risk pin`,
        address,
      });
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

export function getDemoPersonas(): InterceptaDemoPersona[] {
  const fromEnv = parseEnvPersonas();
  const list = fromEnv ?? DEFAULT_DEMO_PERSONAS;
  return list
    .map((p) => {
      const address = normalizeAddress(p.address);
      if (!address) return null;
      return { ...p, address };
    })
    .filter((p): p is InterceptaDemoPersona => Boolean(p));
}

export function findPersonaByAddress(
  address: string | null | undefined,
): InterceptaDemoPersona | null {
  const normalized = address ? normalizeAddress(address) : null;
  if (!normalized) return null;
  return (
    getDemoPersonas().find(
      (p) => p.address.toLowerCase() === normalized.toLowerCase(),
    ) ?? null
  );
}

/** Only allowlisted demo personas (or env force) may override the screened payer. */
export function resolveAllowedScreenAs(
  candidate: string | null | undefined,
): string | null {
  const normalized = candidate ? normalizeAddress(candidate) : null;
  if (!normalized) return null;
  if (findPersonaByAddress(normalized)) return normalized;
  const force = interceptaConfig.forceScreenAddress;
  if (force && normalizeAddress(force) === normalized) return normalized;
  return null;
}
