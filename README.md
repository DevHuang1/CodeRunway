# CodeRunway

CodeRunway is a goal-gradient coding agent for students and solo builders. It turns a small coding issue into a structured plan, an explainable patch, and verified tests inside a safe sample workspace.

The project is designed for the **Coding and Agentic Engineering** track of the [Nebius x NVIDIA Global AI Hackathon](https://nebiusglobalaihackathon.devpost.com/). The live provider path uses NVIDIA Nemotron through the OpenAI-compatible Nebius Token Factory API. The fallback path is deterministic and works without credentials, so the product demo remains reproducible.

## Requirements

- Node.js 22 or newer.
- pnpm 9 or newer.
- Optional: a Nebius Token Factory API key with access to the configured Nemotron model.

## Run locally

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The product is organized as a five-page guided workflow. `/` redirects to `/issue`; the flow then moves through `/plan`, `/run`, `/review`, and `/verify`. State is intentionally held in memory for the demo, so refreshing a workflow page returns to `/issue` with a truthful reset notice rather than implying that work was preserved.

With an empty `NEBIUS_API_KEY`, `AGENT_MODE=auto` uses the safe deterministic fallback. To use live inference, set `NEBIUS_API_KEY` in `.env.local`, confirm the model ID in the Token Factory model catalog, and restart the development server. Never expose the key through a `NEXT_PUBLIC_*` variable or commit `.env.local`.

## Verify the project

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The browser workflow can be run with:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

The live provider is not called by the automated test suite. Use a separately configured manual smoke test before a submission demo.

## Product boundaries

The MVP uses an allowlisted, in-memory sample workspace. It does not accept arbitrary repository paths, execute model-supplied shell commands, connect to GitHub, or run arbitrary user code in the Next.js process. The fallback evaluator uses fixed tests and pre-authored fixture evidence.

For a submission-ready deployment, move fixture patching and test execution into a Nebius Serverless Job or Token Factory Sandbox, capture the execution logs, and preserve the same typed event contract in the UI.

## Goal-gradient design

Progress is represented by six evidence-backed checkpoints: understand, plan, generate, inspect, test, and verify. A restrained sand/coral/teal gradient becomes more complete only as checkpoints are actually verified. It is a motivational visual aid, not a claim of therapeutic effect. Looping animation is disabled when the user prefers reduced motion.

Learning notes are deterministic, reviewable sample content rather than model-generated advice. They support understanding of the code change without claiming clinical, therapeutic, or scientifically proven psychological benefits.

## Demo features

- Work through one focused page at a time: issue, plan, run, review, and verify.
- Open concise learning notes for each checkpoint, changed file, and test without changing progress.
- Pause and resume the sample run while keeping previously verified checkpoints counted.
- Select any checkpoint to read the evidence that makes it meaningful.
- Inspect each changed allowlisted file through the diff tabs.
- Copy or download the verified patch.
- Copy a concise run summary with the provider mode, changed files, checks, and next step.

## Project documents

- [Business requirements](docs/business-requirements.md)
- [User requirements](docs/user-requirements.md)
- [Software requirements](docs/software-requirements.md)

## Devpost readiness

Before submitting, confirm that the public repository has an open-source license, setup instructions, the live Nebius/NVIDIA integration evidence, a demo URL or test build, and a public demonstration video. Explain any work that was created or significantly updated during the submission period in the Devpost entry.
