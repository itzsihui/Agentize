/**
 * @deprecated Import from `@/lib/wallet/ethereum` — crypto settle is Base Sepolia USDC.
 * Re-exports kept so existing call sites compile during migration.
 */
export {
  type ClassicAddress,
  type HexAddress,
  type MerchantAuthProof,
  shortAddress,
  parseMerchantAddress,
  authenticateWithXrplSeed,
  authenticateWithMetaMask,
  generateMerchantWallet,
  verifyMerchantAuth,
  hasMetaMask,
  getMetaMaskAccounts,
  onMetaMaskAccountsChanged,
  BASE_SEPOLIA,
  FUJI,
} from "@/lib/wallet/ethereum";
