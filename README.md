<div align="center">

# Agentize

[![Base Sepolia](https://img.shields.io/badge/Base Sepolia%20Testnet-USDC%20x402-23292F?style=for-the-badge)](#agentize)
[![Protocol](https://img.shields.io/badge/Open%20protocol-any%20HTTP%20agent-0B6E4F?style=for-the-badge)](#agentize)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-agents-412991?style=for-the-badge&logo=openai&logoColor=white)](#try-it)

**Go agent-ready. Publish once. Any agent can shop you — not only ChatGPT or Claude.**

Landing pitch (merchant-first) → [http://localhost:3000](http://localhost:3000) · Architecture → [`architecture.drawio`](./architecture.drawio)

</div>

---

## The problem

Agent commerce is happening — but **catalogs are walled**.

Stripe-style / Instant Checkout–class listings often live where **ChatGPT** and **Claude** can reach them. Procurement bots, local LLMs, personal agents, and custom runners get **blocked**. Merchants who only list there are invisible to the long tail of agents.

### Impact (structural)

| | |
|---|---|
| **2** | Consumer chat apps get the closed catalog path (ChatGPT, Claude) |
| **0** | Open HTTP surface for everyone else on that same path |
| **∞** | Agent types locked out — procurement, local LLMs, personal agents, Cursor/custom |
| **1 → ~0.1** | For every **1** buyer agent that wants to shop, open protocol still exposes on the order of **~0.1** agent-readable catalogs — most inventory is HTML-only or trapped in those two apps |

> Numbers are structural scarcity, not invented GMV. The bottleneck is **open, machine-readable supply**, not demand for shopping agents.

### Why the closed path loses

1. Reach is **rented from two apps** — not owned as a protocol  
2. Personal / on-prem / procurement agents **cannot shop the same listings**  
3. Merchants stay **invisible** to the long tail of agents  

```mermaid
flowchart TB
  subgraph closed [Closed_catalog_gate]
    Merchants[Merchant_catalog] --> StripeSurface[Stripe_or_partner_surface]
    StripeSurface --> ChatGPT[ChatGPT_app]
    StripeSurface --> Claude[Claude_browser_or_app]
    LockedOut[Procurement_local_personal_agents] -.->|blocked| StripeSurface
  end
```

---

## Agentize

**Open protocol. Any agent. Same settle rails.**

Publish once → humans shop in chat → procurement / local / personal agents hit the same endpoints → settle **USDC** via **HTTP 402 / x402** on Base Sepolia.

```mermaid
flowchart LR
  publish[Publish_registry_llms_txt] --> search[GET_api_search]
  search --> anyAgent[Any_HTTP_agent]
  anyAgent --> settle[USDC_x402]
```

| Step | Surface |
|---|---|
| Index | `/registry.json`, `/llms.txt`, `/s/{slug}/llms.txt` |
| Discover | `GET /api/search?q=…` (same ranker for buyer UI + external agents) |
| Buy | `POST /s/{slug}/buy` → **402** → authorize → settle |
| Skill | [`.agents/skills/agentize-registry-shop`](./.agents/skills/agentize-registry-shop/SKILL.md) |

**Do not scrape HTML.** Catalog prose never enters the pay path — settle only sees a locked quote (`storeSlug`, `skuId`, `price`, `merchantAddress`).

---

## What you get

### Merchant-first

- Talk inventory, drop CSV, or paste a store URL → live agent storefront  
- Bind Base Sepolia wallet → list on the open registry  
- Reach **every** HTTP agent, not two chat apps  

### Buyer / any agent

- Fashion salesperson clarifies intent, then ranks via `/api/search`  
- Authorize in chat → USDC x402 on Base Sepolia  
- Injection-shaped listings quarantined; payee/amount stay locked  

### Governance

Buyer spend limits (per tx / day / week). Merchant rails, price floors, market listing — policies that gate checkout.

```mermaid
flowchart LR
  buyerPolicy[BuyerSpendLimits] --> auth[Authorize]
  merchantPolicy[MerchantRailsAndFloors] --> auth
  discover[Discover] --> quarantine[Quarantine]
  quarantine --> auth
  auth --> settle[USDC_x402]
```

---

## Try it

```bash
npm install
cp .env.example .env
# Fill BUYER_PRIVATE_KEY, MERCHANT_ADDRESS, Firebase, OPENAI — see scripts/setup-base-sepolia-usdc.md
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Path | What it is |
|---|---|
| `/` | Landing — problem → closed catalogs → open protocol |
| `/merchant` · `/onboard` | Seller chat → publish agent storefront |
| `/buyer` | Fashion chat → USDC x402 settle |
| `/market` | Human + agent marketplace index |
| `/api/search?q=` | Intent search (agents + buyer demo) |
| `/registry.json` | Network store index |
| `/s/{slug}/llms.txt` | Per-store agent discovery |

---

## Get running

### Prerequisites

- Node.js 20+ and npm  
- **OpenAI API key** — buyer / merchant agents (+ Whisper)  
- **Firebase** web config — auth / Firestore  
- **Base Sepolia** — funded buyer EOA + Circle test USDC (see [`scripts/setup-base-sepolia-usdc.md`](./scripts/setup-base-sepolia-usdc.md))

Without `OPENAI_API_KEY`, chat falls back to deterministic tools. Protocol endpoints (`llms.txt`, `/api/search`, HTTP **402**) still work.

### Env (see [`.env.example`](./.env.example))

| Var | Purpose |
|---|---|
| `OPENAI_API_KEY` | Agents + embeddings search |
| `NEXT_PUBLIC_FIREBASE_*` | Buyer + merchant auth |
| `BUYER_PRIVATE_KEY` | Server-side x402 settle (`0x…`) |
| `MERCHANT_ADDRESS` | Default merchant payTo (`0x…`) |
| `BASE_*` / `TOKEN_*` / `X402_FACILITATOR_URL` | Base Sepolia RPC, USDC, facilitator |

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local Next.js |
| `npm run build` / `npm start` | Production |
| `npm run lint` | ESLint |
