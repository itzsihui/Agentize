import {
  createPublicClient,
  http,
  isAddress,
  getAddress,
  verifyMessage,
  type Hex,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { config } from "@/lib/config";

export type HexAddress = Address;
/** @deprecated Alias for EVM address. */
export type ClassicAddress = HexAddress;

export type MerchantAuthProof = {
  address: HexAddress;
  message: string;
  signature: Hex;
  network: string;
  authenticatedAt: string;
};

export const BASE_SEPOLIA = {
  chainId: 84532,
  chainIdHex: "0x14a34",
  chainName: "Base Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: [config.rpcUrl || "https://sepolia.base.org"],
  blockExplorerUrls: [config.explorerBase || "https://sepolia.basescan.org"],
} as const;

/** @deprecated Use BASE_SEPOLIA. */
export const FUJI = BASE_SEPOLIA;

type EthereumProvider = {
  request: (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (
    event: string,
    handler: (...args: unknown[]) => void,
  ) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function shortAddress(address: string, chars = 4) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function parseMerchantAddress(
  value: string | null | undefined,
): HexAddress | null {
  const raw = value?.trim();
  if (!raw || !isAddress(raw)) return null;
  try {
    return getAddress(raw);
  } catch {
    return null;
  }
}

function buildAuthMessage(address: HexAddress): string {
  const issuedAt = new Date().toISOString();
  return [
    "Agentize — merchant wallet authentication",
    "",
    "Sign this message to prove you control the payout address for USDC x402 on Base Sepolia.",
    "This does not move funds or submit a transaction.",
    "",
    `Address: ${address}`,
    `Network: ${config.network} (Base Sepolia)`,
    `Issued at: ${issuedAt}`,
  ].join("\n");
}

function getProvider(): EthereumProvider {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask (or another injected wallet) is required.");
  }
  return window.ethereum;
}

export function hasMetaMask(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export async function getMetaMaskAccounts(): Promise<HexAddress[]> {
  if (!hasMetaMask()) return [];
  const provider = getProvider();
  const accounts = (await provider.request({
    method: "eth_accounts",
  })) as string[];
  return accounts
    .filter((a) => isAddress(a))
    .map((a) => getAddress(a));
}

export function onMetaMaskAccountsChanged(
  handler: (accounts: HexAddress[]) => void,
): () => void {
  if (!hasMetaMask() || !window.ethereum?.on) return () => undefined;
  const listener = (...args: unknown[]) => {
    const accounts = (args[0] as string[] | undefined) || [];
    handler(
      accounts.filter((a) => isAddress(a)).map((a) => getAddress(a)),
    );
  };
  window.ethereum.on("accountsChanged", listener);
  return () => {
    window.ethereum?.removeListener?.("accountsChanged", listener);
  };
}

async function ensureBaseSepolia(provider: EthereumProvider) {
  const chainIdHex = (await provider.request({
    method: "eth_chainId",
  })) as string;
  if (chainIdHex.toLowerCase() === BASE_SEPOLIA.chainIdHex.toLowerCase()) {
    return;
  }
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BASE_SEPOLIA.chainIdHex }],
    });
  } catch (err) {
    const code = (err as { code?: number })?.code;
    if (code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: BASE_SEPOLIA.chainIdHex,
            chainName: BASE_SEPOLIA.chainName,
            nativeCurrency: BASE_SEPOLIA.nativeCurrency,
            rpcUrls: BASE_SEPOLIA.rpcUrls,
            blockExplorerUrls: BASE_SEPOLIA.blockExplorerUrls,
          },
        ],
      });
      return;
    }
    throw err;
  }
}

/**
 * Prove control of an EVM address via MetaMask personal_sign on Base Sepolia.
 */
export async function authenticateWithMetaMask(): Promise<MerchantAuthProof> {
  const provider = getProvider();
  await ensureBaseSepolia(provider);
  const accounts = (await provider.request({
    method: "eth_requestAccounts",
  })) as string[];
  const raw = accounts[0];
  if (!raw || !isAddress(raw)) {
    throw new Error("No MetaMask account available.");
  }
  const address = getAddress(raw);
  const message = buildAuthMessage(address);
  const signature = (await provider.request({
    method: "personal_sign",
    params: [message, address],
  })) as Hex;
  return {
    address,
    message,
    signature,
    network: config.network,
    authenticatedAt: new Date().toISOString(),
  };
}

/**
 * Prefer MetaMask for EthGlobal demos.
 * @deprecated Use authenticateWithMetaMask
 */
export async function authenticateWithXrplSeed(
  _seed: string,
): Promise<MerchantAuthProof> {
  return authenticateWithMetaMask();
}

/** Generate a fresh throwaway EOA for demos (show private key once). */
export function generateMerchantWallet(): {
  privateKey: Hex;
  address: HexAddress;
  /** @deprecated */
  seed: string;
} {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  const privateKey = `0x${hex}` as Hex;
  const account = privateKeyToAccount(privateKey);
  return {
    privateKey,
    address: account.address,
    seed: privateKey,
  };
}

/** Server-side: verify EIP-191 personal_sign proof before accepting payTo. */
export async function verifyMerchantAuth(
  proof: MerchantAuthProof | null | undefined,
): Promise<HexAddress | null> {
  if (!proof?.address || !proof.message || !proof.signature) {
    return null;
  }
  const address = parseMerchantAddress(proof.address);
  if (!address) return null;
  if (!proof.message.includes(address)) return null;
  const issued = proof.message.match(/Issued at:\s*(\S+)/)?.[1];
  if (issued) {
    const t = Date.parse(issued);
    if (!Number.isFinite(t) || Date.now() - t > 24 * 60 * 60 * 1000) {
      return null;
    }
  }
  try {
    const ok = await verifyMessage({
      address,
      message: proof.message,
      signature: proof.signature,
    });
    return ok ? address : null;
  } catch {
    return null;
  }
}

export function publicClient() {
  return createPublicClient({
    chain: baseSepolia,
    transport: http(config.rpcUrl),
  });
}
