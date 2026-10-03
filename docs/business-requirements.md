# Business Requirements: CodeRunway

## 1. Context

CodeRunway is a hackathon product for students and solo builders who can describe a small coding task but struggle to turn that task into a verified change. Existing coding-agent experiences can feel opaque: the user sees an answer, but not the path from issue to plan, patch, evidence, and completion.

The product targets the Nebius x NVIDIA Global AI Hackathon Coding and Agentic Engineering track. The project must use Nebius Token Factory or Nebius AI Cloud and at least one NVIDIA open-source model. The MVP uses a safe sample workspace so the public demo is predictable and does not expose arbitrary code execution.

## 2. Business goals

| ID | Requirement | Success signal |
| --- | --- | --- |
| BR-01 | Help a learner move from a coding issue to a verified diff in one guided session. | A first-time user can complete the sample flow without reading implementation documentation. |
| BR-02 | Make agent work understandable and reviewable. | Every completed checkpoint has visible evidence: plan, changed file, or test result. |
| BR-03 | Use a goal-gradient runway as a supportive progress aid. | The product shows a finite remaining path and increases visual momentum only after real progress. |
| BR-04 | Demonstrate the hackathon technology clearly. | The UI and README identify provider mode, model, Nebius Token Factory usage, and fallback mode. |
| BR-05 | Keep the public demo safe, low-cost, and reproducible. | No arbitrary repository path, secret, or model-generated shell command is accepted. |
| BR-06 | Preserve user autonomy and dignity. | Users can reject a plan, pause a run, restart, and turn off looping motion. |

## 3. Behavioral design position

The goal-gradient effect is treated as a UX hypothesis: people may find visible proximity to a meaningful goal motivating. CodeRunway should make the remaining work concrete and achievable without manufacturing urgency, hiding failure, or optimizing for time spent.

The product must not claim that the interface provides clinical, therapeutic, or scientifically proven psychological benefits. Its measurable promise is narrower: clearer progress, more understandable agent behavior, and a more complete path from issue to verified change.

## 4. Scope

### In scope

- A polished Next.js workspace for one sample coding issue.
- Structured planning, patch explanation, and fixed test evidence.
- Live Nebius Token Factory integration through an NVIDIA Nemotron model.
- Deterministic fallback when the provider is unavailable.
- Progress, accessibility, safety, README, and Devpost evidence.

### Out of scope for the MVP

- User accounts, GitHub OAuth, arbitrary repositories, or persistent project storage.
- Model-generated shell commands.
- Arbitrary code execution inside the Next.js request process.
- Claims about mental-health outcomes or guaranteed productivity improvement.

## 5. Hackathon outcome

The submission should demonstrate one complete workflow rather than a generic chatbot: issue → milestones → explainable edits → fixed test run → verified completion. The submission narrative must distinguish the safe MVP fixture from the later Nebius Serverless Job or Token Factory Sandbox execution path.

## 6. Ownership and constraints

- Product owner: project team.
- Primary audience: students and solo builders.
- Primary track: Coding and Agentic Engineering.
- Operating constraint: the Token Factory key is server-only and must never be committed.
- Cost constraint: automated tests must not make live provider calls.
