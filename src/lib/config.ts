import { isAddress, getAddress, type Hex } from "viem";

/** Circle USDC on Base Sepolia. */
export const USDC_BASE_SEPOLIA =
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;

export type ChainNetwork = "eip155:84532";

function env(name: string, fallback: string) {
  return process.env[name] || fallback;
}

export const config = {
  rpcUrl: env("BASE_RPC_URL", "https://sepolia.base.org"),
  network: env("BASE_NETWORK", "eip155:84532") as ChainNetwork,
  facilitatorUrl: env(
    "X402_FACILITATOR_URL",
    "https://x402.org/facilitator",
  ),
  chainId: Number(env("CHAIN_ID", "84532")),
  tokenAddress: env("TOKEN_ADDRESS", USDC_BASE_SEPOLIA),
  tokenSymbol: env("TOKEN_SYMBOL", "USDC"),
  tokenDecimals: Number(env("TOKEN_DECIMALS", "6")),
  /** Demo unit price in USDC on Base Sepolia. */
  demoUnitPriceXsgd: "0.01",
  merchantAddress: env(
    "MERCHANT_ADDRESS",
    "0x0000000000000000000000000000000000000001",
  ),
  /** Buyer EOA private key for server-side x402 settle (EIP-3009). */
  get buyerPrivateKey(): Hex | undefined {
    const raw =
      process.env.BUYER_PRIVATE_KEY?.trim().replace(/^["']|["']$/g, "") ||
      undefined;
    if (!raw) return undefined;
    const key = (raw.startsWith("0x") ? raw : `0x${raw}`) as Hex;
    return key;
  },
  explorerBase: env("EXPLORER_BASE", "https://sepolia.basescan.org"),
  /** Optional legacy Card MCP URL — unused when empty; Visa rail uses local mandate. */
  straitsxMcpUrl: env("STRAITSX_MCP_URL", ""),
  get straitsxMcpToken() {
    return (
      process.env.STRAITSX_MCP_TOKEN?.trim() ||
      process.env.STRAITSX_API_KEY?.trim() ||
      undefined
    );
  },
  bedrockRegion: env("AWS_REGION", "ap-southeast-1"),
  bedrockModel: env(
    "BEDROCK_MODEL_ID",
    "anthropic.claude-3-haiku-20240307-v1:0",
  ),
  /** When set, buyer/card agents hit API Gateway instead of the Next origin. */
  get protocolBaseUrl() {
    return (
      process.env.PROTOCOL_BASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_PROTOCOL_BASE_URL?.trim() ||
      undefined
    );
  },
};

export function explorerTx(hash: string) {
  return `${config.explorerBase}/tx/${hash}`;
}

/** Human decimal amount string (display / logs). */
export function toPaymentAmount(price: string, quantity = 1) {
  const n = Number(price) * quantity;
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Invalid price: ${price}`);
  }
  return n.toFixed(config.tokenDecimals).replace(/\.?0+$/, "") || n.toFixed(2);
}

/** Integer micro-units for x402 exact amount + order storage. */
export function toAtomic(price: string) {
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Invalid price: ${price}`);
  }
  return BigInt(Math.round(n * 10 ** config.tokenDecimals)).toString();
}

export function fromAtomic(atomic: string) {
  if (atomic.includes(".")) {
    return Number(atomic).toFixed(2);
  }
  const v = Number(atomic) / 10 ** config.tokenDecimals;
  return v.toFixed(2);
}

export function isEvmAddress(value: string | null | undefined): boolean {
  return Boolean(value && isAddress(value));
}

export function checksumAddress(value: string): string | null {
  try {
    if (!isAddress(value)) return null;
    return getAddress(value);
  } catch {
    return null;
  }
}
