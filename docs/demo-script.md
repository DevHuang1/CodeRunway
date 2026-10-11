# CodeRunway demo script (target length: 2:15–2:30)

Judges are not required to watch past three minutes. This script fits inside that budget and
never claims the app runs code or tests. It does.

Total runtime: about 2 minutes 20 seconds of screen recording plus narration.

Before recording: start the app with `AGENT_MODE=fallback` so the demo is reproducible without
spending Token Factory credits. Have a second terminal open to show one live run, if you have a
key available and want to show the live path. See the "Live segment" note at the end.

## 0:00–0:20 — The problem, in one line

Show the landing page, hero and the six-checkpoint runway.

> "CodeRunway is for students and solo builders who have one small coding issue and do not want to
> hand a repository to an agent. The gap in existing coding agents is that they show you a green
> checkmark and you have no idea what was actually checked. CodeRunway's answer is a six-step runway
> where progress only moves when evidence arrives, and where the evidence is labeled honestly."

Point at "Progress is based on evidence, not decoration."

## 0:20–0:50 — Where Token Factory and Nemotron are used

Show the issue page, then open the connection card on `/run` later. For this beat, state it plainly:

> "There are exactly two places this project calls Nebius. One, generating the six-checkpoint plan.
> Two, generating the patch. Both go to the Nebius Token Factory OpenAI-compatible endpoint at
> api.tokenfactory.nebius.com, running NVIDIA's nvidia/Nemotron-3_5-Lightning. Both are
> server-only. The key never reaches the browser. If there is no key, a deterministic fallback
> runs the same flow so the sample always works."

Show the provider chip reading "Local sample" and the connection card reading "Local sample mode /
Static fixture checks only; no code or test process runs."

## 0:50–1:25 — The fallback flow, end to end

Click through: Make a plan → Inspect a checkpoint → Approve this plan → Start the run → Pause →
Resume → Review the change → Continue to verify.

> "Plan first, and I approve it before anything changes. Pause works mid-run and keeps my place.
> Here is the diff on the review page, one file at a time, with a plain-language explanation."

On `/verify`, this is the beat that matters. Slow down.

## 1:25–2:05 — What the evaluator actually does

Point at the "STATIC FIXTURE CRITERIA" heading, then the "not executed tests" label, then the
"no code execution" status.

> "Be precise about this, because it is the honest core of the project. These three checks are
> static text and markup inspections against the fixed sample files. They are not executed tests.
> The app does not compile TypeScript, does not run Vitest, and does not execute the generated
> code in any sandbox. A match means the returned file contains the expected strings. It does not
> mean the code works. The Verify page and the copied run summary both say this, in both live and
> fallback mode."

Copy the run summary and show the line "Execution: no code or test process ran".

## 2:05–2:20 — What happens when it does not match

Show the failing-state screenshot or the mocked run from `tests/e2e/evaluator-truth.spec.ts`.

> "When a criterion fails, the gradient stops at 80 percent, the verify page shows a failure mark,
> and the summary tells you to treat the patch as unverified. A failed check can never be reported
> as passed. There are browser tests that assert exactly that."

## 2:20–2:30 — Close

> "No sandbox, no shell execution, no arbitrary repositories. A bounded agent that shows its work
> and tells the truth about what was checked. Code, README, and CI are public."

## Live segment (only if you have a key and choose to show it)

If you show one real Token Factory request, insert it at 0:50 and drop ~10 seconds elsewhere. Say
this while the live chip reads "Nebius Token Factory":

> "This is a real request. Token Factory is called twice per run and I capped it at five per minute
> per client, twenty per hour for this process, two at a time. Stopping a request does not
> guarantee the work already processed is not billed, and the UI says so."

Never show the key, the terminal command containing the key, or `.env.local`. Use a terminal that
starts the app without echoing the environment.

## Recording checklist

- Under three minutes, uploaded to YouTube, publicly visible, linked from the Devpost form.
- No third-party trademarks or copyrighted music.
- Fallback footage is the default; one live segment is optional.
- Every screen shown has honest labels visible, not cropped out.
- No credentials, no `.env.local`, no account dashboards.