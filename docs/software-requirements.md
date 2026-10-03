# Software Requirements: CodeRunway

## 1. Architecture

CodeRunway is a Next.js App Router application with a server-side backend-for-frontend layer:

```text
Browser workspace
    │
    ├── Next.js App Router pages and shared client session provider
    └── Route Handlers
          ├── deterministic fixture agent
          └── Nebius Token Factory OpenAI-compatible client
                    │
                    └── NVIDIA Nemotron model
```

The first MVP stores the sample run in memory and only operates on an allowlisted fixture. A submission-ready version moves patching and test execution into a Nebius Serverless Job or Token Factory Sandbox while preserving the browser event contract.

## 2. Functional requirements

| ID | Requirement |
| --- | --- |
| SRS-01 | `GET /api/demo/tasks` returns the sample issue and fixture metadata. |
| SRS-02 | `POST /api/agent/plan` accepts a known task ID and returns an ordered typed plan. |
| SRS-03 | `POST /api/agent/run` accepts a known task and approved plan ID and streams typed run events. |
| SRS-04 | The live provider uses a server-only OpenAI-compatible Nebius client. |
| SRS-05 | `AGENT_MODE=auto` selects live mode only when a key exists; otherwise it selects deterministic fallback. |
| SRS-06 | `AGENT_MODE=live` reports a safe actionable error for missing credentials, timeout, rejected model, or malformed output. |
| SRS-07 | Model output is schema-validated before it can affect the fixture. |
| SRS-08 | File edits are restricted to known sample paths; model-generated shell commands are rejected and never run. |
| SRS-09 | Tests are fixed, pre-registered evaluators and completion requires all required tests to pass. |
| SRS-10 | The UI derives progress from received evidence and never advances from animation alone. |
| SRS-11 | `GET /api/health` exposes only safe provider status and configured model metadata. |
| SRS-12 | The README documents local setup, provider configuration, safety boundaries, and Devpost evidence. |
| SRS-13 | Checkpoint selection reveals the associated evidence criterion without changing verified progress. |
| SRS-14 | A completed run exposes per-file diff navigation and client-side patch download/copy actions for allowlisted files. |
| SRS-15 | A completed run exposes a concise copyable summary containing mode, changed files, check results, and next step. |
| SRS-16 | The App Router exposes `/issue`, `/plan`, `/run`, `/review`, and `/verify`, while `/` redirects to `/issue`. |
| SRS-17 | A shared in-memory client provider owns task, plan, approval, stream evidence, result, and reset state without persisting secrets or claiming refresh continuity. |
| SRS-18 | A guided stepper and route guard allow revisiting evidence-backed pages and redirect direct access to locked pages to `/issue?reset=1`. |
| SRS-19 | Static, validated learning metadata provides checkpoint, file, and test explanations without a new model or API dependency. |
| SRS-20 | Pausing a run preserves verified checkpoint count and resumes without decreasing evidence-backed progress; cancelled SSE streams close safely. |
| SRS-21 | The copied run summary may include an optional client-only learner takeaway without exposing secrets or changing evaluator results. |

## 3. Runtime configuration

```text
AGENT_MODE=auto
NEBIUS_API_KEY=
NEBIUS_BASE_URL=https://api.tokenfactory.nebius.com/v1
NEBIUS_MODEL=nvidia/Nemotron-3_5-Lightning
MAX_AGENT_STEPS=6
MAX_OUTPUT_TOKENS=1200
REQUEST_TIMEOUT_MS=30000
```

The model ID is configurable because access and catalog availability can change. The default is the current Nemotron 3.5 Lightning identifier documented by Nebius; a live smoke test must verify the account can reach it.

## 4. Typed interfaces

### Plan request and response

```text
POST /api/agent/plan
Request:  { taskId: string }
Response: { id, taskId, goal, mode, model, milestones[] }
```

Each milestone contains `id`, `label`, `detail`, `evidence`, `state`, and `progress`.

### Run stream

```text
POST /api/agent/run
Request: { taskId: string, planId: string }
Content-Type: text/event-stream
```

Events are JSON objects with a `type` field:

- `run_started`: mode, model, task ID.
- `milestone_updated`: milestone ID, state, completed count, progress.
- `file_changed`: allowlisted path, summary, diff.
- `test_result`: fixed test name, status, and safe details.
- `run_completed`: final explanation, changed files, tests, next step.
- `run_error`: safe error code and user-facing message.

## 5. Non-functional requirements

- **Security:** never expose or log `NEBIUS_API_KEY`; reject unknown paths and commands; bound request size, steps, output tokens, and timeout.
- **Reliability:** fallback flow works without a network or provider key.
- **Accessibility:** semantic HTML, keyboard operation, visible focus, progress semantics, live announcements, and reduced-motion support.
- **Performance:** the fallback reaches a visible plan quickly; live calls use a bounded timeout and do not block the browser with a full-page loading state.
- **Cost:** unit, integration, and CI tests never call Nebius; live inference is opt-in.
- **Deployment:** production build uses Next.js standalone output and includes a Dockerfile for Nebius AI Cloud.

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
| BR-05 | UR-08 | SRS-06, SRS-08, SRS-09 | Safety validation tests |
| BR-06 | UR-08, UR-09, UR-10 | SRS-06, SRS-10 | Browser and reduced-motion checks |

## 7. Acceptance criteria

The MVP is accepted when a clean install can complete the fallback workflow without credentials, a live configuration reaches Nebius Token Factory, malformed or unsafe provider output is rejected, progress never advances without evidence, all automated checks pass, and the README explains the distinction between the safe MVP fixture and the sandboxed submission path.
