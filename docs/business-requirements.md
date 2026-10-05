# Business Requirements: CodeRunway

## 1. Context

CodeRunway helps students and solo builders move from a small coding issue to a reviewable, allowlisted sample patch. Its value is a clear plan, an understandable diff, and honest static content checks—not execution of arbitrary code or proof that a patch compiles.

The live generation path uses NVIDIA Nemotron through Nebius Token Factory. A deterministic local fallback keeps the sample flow available without credentials.

## 2. Business goals

| ID | Requirement | Success signal |
| --- | --- | --- |
| BR-01 | Help a learner move from a coding issue to a reviewable sample patch. | A first-time user can complete the sample flow without reading implementation documentation. |
| BR-02 | Make the plan and proposed change understandable. | Every completed checkpoint has visible evidence such as an approved plan, a changed file, or a static criterion result. |
| BR-03 | Use a goal-gradient runway as a supportive progress aid. | The product shows a finite remaining path and advances only after evidence arrives. |
| BR-04 | Demonstrate the hackathon technology honestly. | The app identifies Nemotron inference through Nebius Token Factory and distinguishes live model output from local fallback. |
| BR-05 | Protect the provider key and limit accidental usage. | The key remains server-only; per-client and app-level request caps, concurrency limits, output-token caps, and timeouts are enforced. |
| BR-06 | Preserve user autonomy and dignity. | Users can reject a plan, pause local runs, stop waiting on a live request, restart, and use reduced motion. |

## 3. Behavioral design position

The goal-gradient effect is treated as a UX hypothesis: people may find visible proximity to a meaningful goal motivating. CodeRunway should make the remaining work concrete without manufacturing urgency, hiding failure, or optimizing for time spent.

The product must not claim clinical, therapeutic, or scientifically proven psychological benefits. Its promise is narrower: a clear sequence, understandable edits, and a careful account of what the sample evaluator did and did not check.

## 4. Scope

### In scope

- A polished Next.js workspace for one fixed sample issue.
- Structured planning and patch generation through Nebius Token Factory in live mode.
- Strict validation and a two-file edit allowlist.
- Deterministic static fixture checks in both live and fallback modes.
- Server-side request limits, accessible progress, and honest evidence labels.

### Out of scope

- User accounts, GitHub OAuth, arbitrary repositories, or persistent project storage.
- Nebius AI Cloud resources, Serverless Jobs, Token Factory Sandboxes, or any other code-execution sandbox.
- Executing code, compiling TypeScript, or running tests in the app.
- Model-generated shell commands or arbitrary code execution in the Next.js process.
- Claims that static content matches prove correctness or runtime behavior.

## 5. Hackathon outcome and evidence limits

The workflow is issue → plan → allowlisted patch → static fixture criteria → review. The live path proves a Token Factory model request only when a deliberately run, authenticated request is observed. It does not prove that generated code compiles or passes tests because no code is executed.

This intentionally narrower implementation may not satisfy a track whose current rules require writing, running, and testing code inside Token Factory Sandboxes. The team must verify the current track requirements and choose a track that matches the actual demo rather than implying sandbox execution.

## 6. Operating constraints

- The Token Factory key is server-only, ignored by Git in `.env.local`, never logged, and never included in health responses or client bundles.
- The Token Factory host is fixed in server code to the official API endpoint.
- Live requests are limited to 5 per client per minute, 20 per app process per hour, and 2 concurrent requests. Output is capped at 8,192 tokens per request and request time at 120 seconds.
- The in-memory usage limiter resets on process restart and does not coordinate across app instances. It is not a provider billing quota; provider-side usage controls remain necessary.
- Unit, integration, and browser tests never call Token Factory.
