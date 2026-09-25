export type InterceptaDecision = "allow" | "refuse" | "hold";

export type InterceptaTrait = {
  risk: number;
  name: string;
  txsCount?: number;
  description?: string;
};

export type InterceptaAddressScan = {
  toxicScore: number;
  traits: InterceptaTrait[];
};

export type InterceptaVerdict = {
  decision: InterceptaDecision;
  reasons: string[];
  toxicScore?: number;
  screenedAddress: string;
  traits?: string[];
  source: "quick-scan" | "deep-scan" | "unavailable";
};

export type InterceptaDemoPersona = {
  id: string;
  label: string;
  blurb: string;
  /** Mainnet 0x — screened live; never used as the Sepolia signer. */
  address: string;
};

export type InterceptaOrderNote = {
  decision: InterceptaDecision;
  reasons: string[];
  toxicScore?: number;
  screenedAddress?: string;
};
