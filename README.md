# CodeRunway

CodeRunway is a calm, goal-gradient workspace for moving one small coding issue to a reviewable patch. It guides students and solo builders through a plan, a bounded sample change, and honest static fixture checks.

The live model path uses NVIDIA Nemotron 3.5 Lightning through the Nebius Token Factory API. The deterministic fallback works without credentials. Both paths are limited to the fixed sample task. **The app does not run or compile code, execute tests, or create Nebius AI Cloud jobs.**

## Requirements

- Node.js 22 or newer.
- pnpm 11.19.0 (pinned through Corepack).
- Optional live use: a Nebius Token Factory API key with access to `nvidia/Nemotron-3_5-Lightning`.

## Run locally

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Put the API key in `.env.local` as `NEBIUS_API_KEY=...`; do not paste it into chat, source code, or a `NEXT_PUBLIC_*` variable. `.env.local` is Git-ignored. If you already have that file, do not overwrite it—just add any missing settings. Next.js reads it server-side as runtime environment configuration; the browser receives only safe provider status, never the key.

Open [http://localhost:3000](http://localhost:3000). The five-page flow is `/issue` → `/plan` → `/run` → `/review` → `/verify`; `/` is the editorial landing page. Session state is held in memory and resets on refresh.

With `AGENT_MODE=auto`, the app uses Token Factory when `NEBIUS_API_KEY` is present and otherwise runs the deterministic fallback. Use `AGENT_MODE=fallback` to prevent any model call. `AGENT_MODE=live` requires the server-only key. The Token Factory endpoint and model (`nvidia/Nemotron-3_5-Lightning`) are fixed in server code; no custom URL or higher-priced model override is accepted.

## Cost and key-protection limits

The app enforces these server-side limits before live API requests:

- 5 model requests per minute per client.
- 20 model requests per hour across this app process.
- At most 2 concurrent model requests.
- A maximum of 8,192 output tokens per model call and a 120-second request timeout.
- No automatic model retries or repair loop.

The in-memory rate limiter is a safety guardrail, not a billing quota: it resets when the server restarts and is separate for each app instance. Set the smallest available spending/usage limits in the Nebius account and monitor Token Factory usage. Stopping a request cannot guarantee that provider work already processed will not be billed; retries make new requests.

## Evidence and safety boundaries

The model can return only structured edits and explanations. The server validates output and accepts edits only to the fixed sample's two allowlisted files. No model-provided shell command is accepted. The evaluator checks for expected text and markup in those file contents; these are **static fixture criteria**, not executed tests, typechecks, or proof that the code compiles or works at runtime. The Verify page and copied summary say this explicitly in both live and fallback modes.

The app does not accept arbitrary repositories, execute user code in the Next.js process, run a sandbox, or connect to GitHub. Do not describe the current build as performing sandboxed coding or test execution in a Devpost submission. This narrower scope may be a weaker fit for a track requiring agents to write, run, and test code in a Token Factory Sandbox; check the current [hackathon rules](https://nebiusglobalaihackathon.devpost.com/rules) before choosing a track.

## Verify the project

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Automated tests use mocks and deterministic fallback behavior; they never spend Token Factory credits. Any live smoke check is opt-in and should be run deliberately after reviewing current model access and account usage controls.

## Product design

Progress is represented by six evidence-backed checkpoints: understand, plan, generate, inspect, check, and verify. The goal-gradient advances only when a real plan, patch, or static-check result arrives. Learning notes are fixed and reviewable; opening them never changes progress. The product makes no clinical or scientifically proven psychological-benefit claims.

## Project documents

- [Business requirements](docs/business-requirements.md)
- [User requirements](docs/user-requirements.md)
- [Software requirements](docs/software-requirements.md)

## Devpost readiness

Before submitting, confirm the chosen track matches the actual capabilities, and include an open-source license, setup instructions, live Nebius/NVIDIA integration evidence, a demo URL or test build, and a public demonstration video. Do not present static fixture matches as executed tests or sandbox evidence.
