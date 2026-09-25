# Base Sepolia + USDC setup (Agentize / EthGlobal Tokyo)

Agentize settles the crypto rail with **USDC on Base Sepolia** via x402 (EIP-3009).

## 1. Wallets

Create two EOAs (MetaMask or cast):

- **Merchant** — receives USDC (`MERCHANT_ADDRESS`)
- **Buyer** — server-side agent signer (`BUYER_PRIVATE_KEY`)

## 2. Fund Base Sepolia

1. Get Base Sepolia ETH (gas): [Base faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet) or Alchemy/QuickNode faucets.
2. Get Circle test USDC on Base Sepolia: [Circle faucet](https://faucet.circle.com/) — pick **Base Sepolia** / USDC.
3. Send some USDC to the **buyer** address (agent settles from this key).

## 3. Wire `.env.local`

```bash
BASE_RPC_URL=https://sepolia.base.org
BASE_NETWORK=eip155:84532
CHAIN_ID=84532
TOKEN_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
TOKEN_SYMBOL=USDC
TOKEN_DECIMALS=6
MERCHANT_ADDRESS=0xYourMerchant…
BUYER_PRIVATE_KEY=0xYourBuyerPrivateKey…
BUYER_ADDRESS=0xYourBuyer…
EXPLORER_BASE=https://sepolia.basescan.org
X402_FACILITATOR_URL=https://x402.org/facilitator
```

## 4. Smoke path

1. `npm run dev`
2. Merchant: MetaMask on Base Sepolia → bind wallet on `/merchant/setup` → publish store
3. Buyer agent: chat buy → expect `402` then receipt with Basescan `/tx/…` link

## Notes

- Facilitator `https://x402.org/facilitator` handles verify + settle (gasless for the payer via EIP-3009).
- Visa card rail is separate (`POST /checkout` + local mandate) — not on-chain USDC.
