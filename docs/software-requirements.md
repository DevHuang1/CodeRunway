# Software Requirements: CodeRunway

## 1. Architecture

CodeRunway is a Next.js App Router application with a server-only Token Factory integration and an in-memory sample evaluator:

```text
Browser workspace
    │
    ├── Next.js App Router pages and shared client session provider
    └── Route Handlers
          ├── deterministic sample plan and patch
          ├── Nebius Token Factory OpenAI-compatible client (Nemotron)
          ├── schema validation and two-file allowlist
          ├── in-memory request/concurrency limiter
          └── static fixture-criteria evaluator (no code execution)
```

The user session and request limits are held in process memory. The app has no sandbox, no job runner, and no code/test execution path.

## 2. Functional requirements

| ID | Requirement |
| --- | --- |
| SRS-01 | `GET /api/demo/tasks` returns the fixed sample issue and fixture metadata. |
| SRS-02 | `POST /api/agent/plan` accepts a known task ID and returns an ordered typed plan. |
| SRS-03 | `POST /api/agent/run` accepts a known task and validated approved plan, then streams typed run events. |
| SRS-04 | Live planning and patch generation use a server-only OpenAI-compatible Nebius Token Factory client and a configured NVIDIA Nemotron model. |
| SRS-05 | `AGENT_MODE=auto` selects live mode when `NEBIUS_API_KEY` is configured; otherwise it selects deterministic fallback. |
| SRS-06 | `AGENT_MODE=live` reports safe actionable errors for a missing key, timeout, unavailable model, provider limit, or malformed output. |
| SRS-07 | Model output is schema-validated before it can affect the sample result. |
| SRS-08 | File edits are restricted to the two known sample paths; shell commands and dependencies are never accepted or run. |
| SRS-09 | Completion is based only on static fixture criteria. All UI and summary labels state that code and tests were not executed. |
| SRS-10 | The UI derives progress from received evidence and never advances from animation alone. |
| SRS-11 | `GET /api/health` reports safe provider status and fixed usage limits without exposing secrets. |
| SRS-12 | The README documents local setup, server-only provider configuration, request caps, safety boundaries, and evidence limitations. |
| SRS-13 | Checkpoint selection reveals its evidence criterion without changing verified progress. |
| SRS-14 | A completed run exposes per-file diff navigation and client-side patch download/copy for allowlisted files. |
| SRS-15 | A completed run exposes a concise copyable summary with mode, changed files, static criteria, and next step. |
| SRS-16 | The editorial landing page is at `/`; the workflow pages are `/issue`, `/plan`, `/run`, `/review`, and `/verify`. |
| SRS-17 | A shared in-memory client provider owns task, plan, approval, streamed evidence, result, and reset state without persisting secrets. |
| SRS-18 | Guided navigation allows revisiting evidence-backed pages and redirects direct access to locked pages to `/issue?reset=1`. |
| SRS-19 | Static, validated learning metadata explains checkpoints, files, and fixture criteria without additional provider calls. |
| SRS-20 | Pausing a local fallback run preserves verified checkpoints; stopping a live request preserves received evidence and warns that already-processed usage may still be billed. |
| SRS-21 | The copied run summary may include an optional client-only learner takeaway without changing evaluator results. |
| SRS-22 | Live requests are capped at 5 per client per minute, 20 per app process per hour, and 2 concurrent calls. The process-local limiter is documented as non-durable and non-distributed. |
| SRS-23 | Each provider call is limited to at most 8,192 output tokens and 120 seconds, with automatic SDK retries disabled. |
| SRS-24 | Agent POST bodies are streamed and rejected above 16 KiB before provider calls are made. |

## 3. Runtime configuration

```text
AGENT_MODE=auto
NEBIUS_API_KEY=
MAX_OUTPUT_TOKENS=8192
REQUEST_TIMEOUT_MS=120000
```

`NEBIUS_API_KEY` is read only in server code. `.env.local` is ignored by Git. The Token Factory base URL and cost-optimized Nemotron model ID are fixed in server code rather than being configurable. The output token and timeout environment values may reduce the defaults but cannot exceed the hard limits.

## 4. Typed interfaces

### Plan request and response

```text
POST /api/agent/plan
Request:  { taskId: string }
Response: { id, taskId, goal, mode, model, milestones[] }
```

### Run stream

```text
POST /api/agent/run
Request: { taskId: string, plan: AgentPlan }
Content-Type: text/event-stream
```

Events are JSON objects with a `type` field:

- `run_started`: mode, model, task ID.
- `milestone_updated`: milestone ID, state, completed count, progress, and evidence.
- `file_changed`: allowlisted path, summary, and diff.
- `check_result`: fixed static criterion name, status, and details; never an executed-test result.
- `run_completed`: explanation, changed files, static fixture criteria, `testsExecuted: false`, and next step.
- `run_error`: safe error code and user-facing message.

Live plan and run requests consume one rate-limit permit each. A retry is a new provider request and may be billed.

## 5. Non-functional requirements

- **Security:** never expose or log `NEBIUS_API_KEY`; use only the official fixed Token Factory host; reject unknown paths; bound request size, output tokens, and time; limit request rate and concurrency.
- **Reliability:** deterministic fallback works without a network or key; provider failures never masquerade as passing evidence.
- **Accessibility:** semantic HTML, keyboard operation, visible focus, progress semantics, live announcements, and reduced-motion support.
- **Performance:** fallback completes quickly; live requests time out after at most 120 seconds and can be stopped from the browser.
- **Cost:** tests never call Nebius; no automatic model retry or repair loop; the process-local limiter is not represented as a provider-side spend quota.
- **Deployment:** use a standard Next.js runtime. No cloud job, runner image, CLI identity, or sandbox setup is required.

## 6. Traceability matrix

| Business | User | Software | Verification |
| --- | --- | --- | --- |
| BR-01 | UR-01, UR-03, UR-05, UR-06 | SRS-01, SRS-02, SRS-03, SRS-09 | Playwright complete workflow |
| BR-02 | UR-02, UR-05, UR-07 | SRS-03, SRS-07, SRS-10 | Stream and schema unit tests |
| BR-02 | UR-11, UR-12 | SRS-13, SRS-14, SRS-15 | Playwright checkpoint and artifact workflow |
| BR-02 | UR-13 | SRS-16, SRS-17, SRS-18 | Route guard and refresh-reset tests |
| BR-02 | UR-14, UR-15 | SRS-19, SRS-20, SRS-21 | Learning catalog, pause/resume, and browser workflow tests |
| BR-03 | UR-02, UR-09, UR-10 | SRS-10 | Progress and accessibility tests |
| BR-04 | UR-07 | SRS-04, SRS-05, SRS-11 | Provider selection and health tests |
| BR-05 | UR-08 | SRS-06, SRS-07, SRS-08, SRS-22, SRS-23, SRS-24 | Safety, limiter, and mocked live-provider tests |
| BR-06 | UR-08, UR-09, UR-10 | SRS-06, SRS-10, SRS-20 | Browser and reduced-motion checks |

## 7. Acceptance criteria

The app is accepted when a clean install completes the fallback flow without credentials; with a configured key, live planning and patch generation call Token Factory; requests respect the fixed host, token/time caps, and rate limiter; malformed or unsafe output is rejected; the UI clearly reports static-only evidence; progress never advances without evidence; and automated checks pass without spending provider credits.
