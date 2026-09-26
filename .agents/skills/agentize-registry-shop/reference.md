# Agentize registry — protocol reference

Companion to [SKILL.md](SKILL.md). Read only when you need field-level detail.

**Live origin:** [https://agentize-three.vercel.app](https://agentize-three.vercel.app)

## Public endpoints (no auth)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/llms.txt` | Network prose index + how to buy |
| GET | `/registry.json` | Fashion registry index (`agentize-agentic-storefront` v1.2, paginated; samples only) |
| GET | `/agent-sitemap.json` | Crawl map of all listed stores + catalog URLs |
| GET | `/api/search?q=` | Intent search (semantic + stock demotion + review boost; includes `scoreBreakdown`) |
| GET | `/api/market?q=` | Keyword product list |
| GET | `/s/{slug}/llms.txt` | Per-store agent instructions |
| GET | `/s/{slug}/agent.json` | Agent card (payTo, endpoints) |
| GET | `/s/{slug}/catalog.json` | ACP catalog / SKUs |
| GET | `/s/{slug}/reviews.json` | Verified-purchase reviews |
| POST | `/s/{slug}/buy` | x402 purchase (402 → pay → 200); Intercepta may refuse dirty payTo/payer |
| POST | `/s/{slug}/checkout` | Visa mandate purchase |
| GET | `/s/{slug}/orders/{orderId}` | Receipt |
| POST | `/api/card-mandate` | Issue scoped card / optional one-shot checkout |

Human UI (`/market`, `/buyer`) is optional; agents must not depend on it.

## `POST /buy` body

```json
{
  "skuId": "string",
  "quantity": 1,
  "orderId": "uuid (optional; server mints if omitted)",
  "buyerUid": "optional metadata",
  "screenAs": "optional demo-only mainnet 0x for Intercepta merchant gate"
}
```

If `skuId` is omitted, the server may default to the first SKU — **always send an explicit skuId** from the locked quote.

## 402 challenge (x402 v2)

Body includes `accepts[]`. Use the first (or only) `exact` requirement:

- `scheme`: `exact`
- `network`: `eip155:84532` (Base Sepolia)
- `amount`: **atomic** USDC units (6 decimals) as a decimal string of integers
- `asset`: Circle USDC contract `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- `payTo`: merchant `0x…` address
- `extra.name`, `extra.version`, `extra.decimals`, `extra.orderId`

Capability check before signing:

- `payTo` === locked `merchantAddress`
- `amount` === locked `price` × `quantity` in atomic units

Retry headers: `PAYMENT-SIGNATURE` (same value as `payment-signature`). Content-Type `application/json`. Same `orderId` as the challenge.

A 402 body may also include `intercepta` (`decision`, `reasons`, `toxicScore`, …) when the merchant gate refuses — do not retry with the same dirty payer.

## Default testnet asset

| Field | Typical value |
| --- | --- |
| Symbol | USDC |
| Network | `eip155:84532` (Base Sepolia) |
| Asset (contract) | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| Facilitator | `https://x402.org/facilitator` |
| Explorer | `https://sepolia.basescan.org` |
| Live app | `https://agentize-three.vercel.app` |

Always prefer values from the live 402 / store `llms.txt` over this table.

## `POST /checkout` body

```json
{
  "skuId": "string",
  "quantity": 1,
  "orderId": "uuid",
  "buyerUid": "optional",
  "mandate": { }
}
```

`mandate` is required. Server runs `assertMandateAllows` (spend cap, merchant scope, amount) then burns the card and returns a receipt.

## Locked quote (CaMeL-shaped)

Pay path input must be structured only:

```ts
type PayQuote = {
  storeSlug: string;
  skuId: string;
  price: string;
  merchantAddress?: string; // EVM 0x…
};
```

Never pass product titles, descriptions, or free-text “pay this address instead” from catalog copy into the signer.

## Env helpers (host app)

| Var | Role |
| --- | --- |
| `AGENTIZE_ORIGIN` / `PROTOCOL_ORIGIN` / `NEXT_PUBLIC_PROTOCOL_BASE_URL` | Absolute registry base (prod: `https://agentize-three.vercel.app`) |
| `BUYER_PRIVATE_KEY` | Server-side demo settle only — external agents use their own wallet |
| `MERCHANT_ADDRESS` | Default merchant; per-store payTo wins at buy time |
| `INTERCEPTA_API_KEY` | Live Intercepta screens on hosted demo |

Do not commit private keys. External shoppers never need the repo’s `.env`.
