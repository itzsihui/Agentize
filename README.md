<div align="center">

# Agentize

[![Base Sepolia](https://img.shields.io/badge/Base%20Sepolia%20Testnet-USDC%20x402-23292F?style=for-the-badge)](#agentize)
[![Protocol](https://img.shields.io/badge/Open%20protocol-any%20HTTP%20agent-0B6E4F?style=for-the-badge)](#agentize)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-agents-412991?style=for-the-badge&logo=openai&logoColor=white)](#try-it)

**One-sentence summary:** Agentize is an open agentic storefront protocol where we convert human catelogs into agent friendly storefronts safely. Merchants publish once to HTTP (`registry.json` / `llms.txt` / `/api/search`), and any agent can discover and buy with USDC x402 on Base Sepolia, with live Intercepta screening before sign and settle.

Repo → [github.com/itzsihui/Agentize](https://github.com/itzsihui/Agentize) · Landing → [http://localhost:3000](http://localhost:3000) · Architecture → [`architecture.drawio`](./architecture.drawio)

</div>

---

## Team

Built for EthGlobal Tokyo 2026.

| Name | GitHub | X |
|---|---|---|
| Ong Si Hui (Ariel) | [@itzsihui](https://github.com/itzsihui) | [@itzmeeariel](https://x.com/itzmeeariel) |
| Sumit Sanjay Shinde | [@sumitshinde0702](https://github.com/sumitshinde0702) | [@sumitshindeiru](https://x.com/sumitshindeiru) |

---

## MultiBaas (Curvegrid) — optional

**We did not use MultiBaas in this project.** Agentize talks to Base Sepolia via public RPC + the [x402](https://docs.x402.org) facilitator and Circle test USDC; contract/event indexing through MultiBaas was out of scope for this weekend

**If we had used it:** MultiBaas would have been a natural fit for merchant `payTo` binding, order receipt indexing, and a hosted explorer of x402 settle txs, we stayed on direct RPC + Basescan links instead.

---

## The problem

Agent commerce is happening — but **catalogs are walled**.

Stripe-style / Instant Checkout–class listings often live where **ChatGPT** and **Claude** can reach them. Procurement bots, local LLMs, personal agents, and custom runners get **blocked**. Merchants who only list there are invisible to the long tail of agents.

### Impact (structural)

| Signal | What it means |
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

## Setup and testing

### Prerequisites

- Node.js 20+ and npm  
- **OpenAI API key** — buyer / merchant agents   
- **Firebase** web config — auth / Firestore  
- **Base Sepolia** — funded buyer EOA + Circle test USDC (see [`scripts/setup-base-sepolia-usdc.md`](./scripts/setup-base-sepolia-usdc.md))  
- **Optional:** `INTERCEPTA_API_KEY` from [intercepta.io/ethglobal](https://intercepta.io/ethglobal) for live payer / payTo screening  

Without `OPENAI_API_KEY`, chat falls back to deterministic tools. Protocol endpoints (`llms.txt`, `/api/search`, HTTP **402**) still work.

### Install and run

```bash
npm install
cp .env.example .env.local
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

### Smoke tests

| Test | How |
|---|---|
| Protocol up | `curl -s localhost:3000/registry.json \| head` |
| Search | `curl -s "localhost:3000/api/search?q=linen+shirt"` |
| Intercepta key (1 credit) | `node scripts/smoke-intercepta.mjs` |
| Honest settle | `/buyer` → Honest buyer → authorize USDC → Basescan receipt |
| Blocked settle | `/buyer` → Pretend malicious → Sanctioned → authorize → Intercepta refuse table (no settle) |

### Env (see [`.env.example`](./.env.example))

| Var | Purpose |
|---|---|
| `OPENAI_API_KEY` | Agents + embeddings search |
| `NEXT_PUBLIC_FIREBASE_*` | Buyer + merchant auth |
| `BUYER_PRIVATE_KEY` | Server-side x402 settle (`0x…`) |
| `MERCHANT_ADDRESS` | Default merchant payTo (`0x…`) |
| `BASE_*` / `TOKEN_*` / `X402_FACILITATOR_URL` | Base Sepolia RPC, USDC, facilitator |
| `INTERCEPTA_API_KEY` | Live Intercepta / W3A key ([intercepta.io/ethglobal](https://intercepta.io/ethglobal)) |

---

## Intercepta — seller-first x402 screening

Merchant `/s/{slug}/buy` **refuses dirty payers before facilitator settle**. Buyer-side payTo scan is secondary. Verdicts are live — never mocked.

### Call sites

| File | What |
|---|---|
| [`src/lib/intercepta/client.ts`](./src/lib/intercepta/client.ts) | Live Quick Scan + Deep Scan (`X-API-KEY`) |
| [`src/lib/intercepta/policy.ts`](./src/lib/intercepta/policy.ts) | allow / hold / refuse |
| [`src/lib/protocol/handlers.ts`](./src/lib/protocol/handlers.ts) | **Seller gate** — screen payer (or demo `screenAs`) before `verifyAndSettle` |
| [`src/lib/agents/tools-buyer.ts`](./src/lib/agents/tools-buyer.ts) | Buyer Quick Scan of `payTo`; forwards `screenAs` |
| [`src/app/buyer/_components/intercepta-persona-picker.tsx`](./src/app/buyer/_components/intercepta-persona-picker.tsx) | Honest vs malicious buyer demo |

### Demo (pass + block)

1. Add `INTERCEPTA_API_KEY` from [intercepta.io/ethglobal](https://intercepta.io/ethglobal). Optional: paste Discord-pinned EOAs into `INTERCEPTA_DEMO_PERSONAS`. Defaults are public mainnet OFAC / scam fixtures.
2. **Pass:** `/buyer` → Demo persona **Honest buyer** → authorize USDC → 200 receipt.
3. **Block:** **Pretend to be malicious** → pick Sanctioned / Scammer → new chat banner → authorize → merchant **402** with Intercepta reasons (no settle). Short verdict in chat; full live lines in Protocol / Intercepta popup.

Settlement still uses `BUYER_PRIVATE_KEY` on Base Sepolia. Intercepta screens the **mainnet** persona address.

### API feedback (Intercepta)

Time to first live call was a few minutes after the api key arrived but it took a while to arrive: docs + `X-API-KEY` on `GET …/quick-scan` were enough. What confused us:The account endpoint expects an **EOA**; a contract address (e.g. mixer) can 404 as “EOA doesn’t exist,” which is easy to misread as safe. Missing from public docs: an official fixture list (pins live in Discord), `chainId` / testnet context on Quick Scan, and any public request/receipt URL to prove a call (you only get the response body + your own logs).

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local Next.js |
| `npm run build` / `npm start` | Production |
| `npm run lint` | ESLint |
