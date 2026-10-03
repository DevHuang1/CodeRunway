# User Requirements: CodeRunway

## 1. Primary persona

### Student or solo builder

The user can write or understand basic code, has a small feature or bug to address, and wants help making progress without surrendering control of the repository or blindly accepting generated code.

## 2. Core journey

1. The user opens `/issue` and sees a concrete sample issue.
2. The user understands the intended outcome and asks CodeRunway to create a plan.
3. The user reviews checkpoint evidence on `/plan` and approves or rejects the plan.
4. The user watches the agent produce an explainable change on `/run`.
5. The user inspects changed files and the diff on `/review`.
6. The user sees fixed tests run and their result on `/verify`.
7. The user reaches a verified completion state and receives a clear next step.

## 3. User requirements

| ID | Requirement | Acceptance condition |
| --- | --- | --- |
| UR-01 | The user must understand the issue before starting. | The issue title, context, expected outcome, and sample stack are visible on first load. |
| UR-02 | The user must see the remaining path to completion. | A six-checkpoint runway displays the current checkpoint, completed count, and remaining work. |
| UR-03 | The user must approve a plan before the run changes the fixture. | The run action is unavailable until a plan is generated and approved. |
| UR-04 | The user must be able to reject or restart a plan. | Rejecting returns to the initial state without claiming progress. |
| UR-05 | The user must understand generated edits. | Changed file names, a readable diff, and a plain-language explanation are shown. |
| UR-06 | The user must see test evidence. | Each fixed test has a pass/fail state and concise output; completion requires passing tests. |
| UR-07 | The user must know whether the result is live or fallback. | Provider mode and model/fallback labels are visible and never ambiguous. |
| UR-08 | The user must retain control during execution. | The user can pause the stream, restart the demo, and continue from a known state. |
| UR-09 | The user must be able to use the product with reduced motion. | Looping animation is disabled by the operating-system preference; progress remains understandable. |
| UR-10 | The user must not be pressured by the interface. | No fake countdown, forced streak, hidden failure, or language implying a clinical benefit is used. |
| UR-11 | The user must be able to inspect why each checkpoint matters. | Selecting a checkpoint reveals its evidence criterion without changing progress. |
| UR-12 | The user must be able to take a verified result with them. | Each changed file can be inspected independently, and the patch and run summary can be copied or downloaded. |
| UR-13 | The user must always know where they are in the workflow. | A five-step guided stepper marks the current page, keeps future pages locked until evidence exists, and safely returns a refreshed session to `/issue`. |
| UR-14 | The user must be able to learn from the workflow without being forced through a quiz. | Each checkpoint, changed file, and test has a collapsed explanation that can be opened without changing progress or approval state. |
| UR-15 | The user must be able to resume a paused run honestly. | Previously verified checkpoints remain counted, unverified evidence is replayed visibly, and the interface never reports a regression. |

## 4. Content requirements

- Use plain language suitable for a learner.
- Prefer evidence statements such as “2 of 6 checkpoints verified.”
- Explain why a change matters before showing implementation detail.
- Explain what each test proves and what to inspect if it fails.
- Allow an optional learner takeaway to be included in the copied run summary.
- Label provider failures and fallback mode directly.
- Never display the API key, hidden prompt, or internal error body.

## 5. Accessibility requirements

- Use semantic headings, buttons, lists, and regions.
- Give the runway `role="progressbar"`, `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`.
- Announce meaningful run-state changes through an `aria-live` region.
- Preserve keyboard focus and visible focus indicators.
- Meet readable contrast for body text, status labels, and diff lines.
