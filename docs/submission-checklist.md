# CodeRunway submission checklist

Maps the current build to the published Nebius x NVIDIA Global AI Hackathon requirements and the
Stage Two judging criteria. Verified against the repository on the
`feat/coderunway-tokenfactory-workflow` branch.

Status key: **Done** — evidenced in the repo. **Gap** — not satisfied yet. **Partial** — satisfied
narrowly; read the note before claiming it.

## 1. Hard submission requirements

| Rule requirement | Status | Evidence |
| --- | --- | --- |
| Working software running on Nebius Token Factory or AI Cloud | Partial | `src/lib/provider.ts` makes a runtime call to `https://api.tokenfactory.nebius.com/v1`. No AI Cloud compute is used. The call only happens with a server-side key, so a judge without one sees the deterministic fallback. |
| Uses at least one NVIDIA open source model | Done | `nvidia/Nemotron-3_5-Lightning` is fixed in server code (`src/lib/provider.ts:7`) and asserted in `tests/safety.test.ts`. |
| Public repository on GitHub | Done | `https://github.com/DevHuang1/CodeRunway` |
| Open source license visible at repo top | Done | `LICENSE` (MIT) |
| Repository has all source, assets, and instructions | Done | Full `src/`, `tests/`, `fixtures/`, `README.md`, `.env.example` |
| README with setup and run guidance | Done | `README.md` — requirements, install, env, mode selection, limits, boundaries |
| Highlight NVIDIA Nemotron usage | Done | `README.md` intro, `/api/health`, the connection card on `/run`, and `docs/demo-script.md` |
| Highlight where Token Factory helped | Partial | The two call sites are documented. Claims are limited to plan and patch generation; no claim of sandbox or test execution. |
| URL to a working demo or test build | Gap | No hosted URL yet. Deployment path is prepared: `ENABLE_EXPERIMENTAL_COREPACK=1` plus provider env vars on Vercel, and `next.config.ts` disables standalone output there (see README). Rules require a URL; a deployed fallback or live build satisfies this. |
| Text description of features | Done | `README.md` plus `docs/business-requirements.md` |
| Demonstration video under 3 minutes | Gap | Scripted in `docs/demo-script.md` (target 2:15–2:30). Video not yet recorded or uploaded. |
| Video public on YouTube | Gap | Follows from recording. |
| Track identified | Done | See `docs/track-fit.md`. Recommendation is Best Apps and Agents; this does not change your current selection. |
| Feedback on Token Factory, AI Cloud, NVIDIA tools | Gap | Devpost form section, not repository content. |
| Explanation of significant updates if pre-existing | Gap | Devpost form section. |
| All materials in English | Done | All repository and submission copy is English. |
| Available free of charge during judging | Partial | No authentication and no paywall in the app. A host with its own limits is fine. |

## 2. Stage One viability

> "The ideas meet a baseline level of viability… reasonably fits the theme and reasonably applies
> the required APIs/SDKs."

The app makes a genuine runtime Token Factory call and uses a Nemotron model, which satisfies the
API requirement directly. Stage One is the one gate where the no-sandbox decision is not fatal;
it becomes a scoring risk in Stage Two under Technological Implementation.

## 3. Stage Two judging criteria (equally weighted)

### Technological Implementation

> "How well is the project built, and how effectively does it use Nebius Token Factory or AI Cloud
> model(s), and NVIDIA Nemotron or other NVIDIA open source models as part of the solution?"

- **Strong:** real server-side Token Factory integration with the OpenAI-compatible client, fixed
  host and model, `enable_thinking: false` for Nemotron, `response_format: json_object`, strict Zod
  contracts, output-token and timeout ceilings, `maxRetries: 0`.
- **Strong:** a two-file edit allowlist and a regex rejection of model-supplied shell commands,
  with tests (`tests/safety.test.ts`).
- **Strong:** rate limits enforced server-side (5/client/minute, 20/process/hour, 2 concurrent) and
  documented as a guardrail rather than a billing quota.
- **Weak:** the model is used for plan and patch *generation* only. No code is executed, compiled,
  or tested, so the model is not used the way a coding-agent track envisions.
- **Answer this directly in the submission text.** Do not let a judge infer execution that does not
  happen.

### Design

> "Does the project deliver a complete, coherent product experience not just a technical proof of
> concept?"

- **Strong:** a coherent five-page flow (`/issue` → `/plan` → `/run` → `/review` → `/verify`) with an
  editorial landing page, each page with one job.
- **Strong:** restrained visual design, light and dark themes, keyboard focus, `progressbar` and
  `aria-live` semantics, reduced-motion support, and no mobile overflow.
- **Strong:** stage gating redirects direct access to locked pages to a truthful reset notice.
- **Strong:** honesty is a design property, not a disclaimer — the Verify page labels checks as
  static fixture criteria, and a failed result is never smoothed over.
- **Strong:** public About, Privacy, and Terms of Service pages plus a footer license link make the project
  presentable as a product rather than a demo; the privacy page documents exactly what leaves the
  browser.
- Covered by 20 Playwright tests.

### Potential Impact

> "Does the project make a credible, specific case for solving a real problem for a real audience
> and does the solution actually address it based on what's demonstrated?"

- **Strong:** specific audience — students and solo builders with one small issue who cannot
  evaluate generated code.
- **Strong:** specific problem — coding agents show confident green checkmarks for evidence the
  user cannot audit. CodeRunway's answer is a bounded, allowlisted sample plus explicit labeling.
- **Weak:** the audience is narrowed by the fixed sample task. There is no arbitrary repository and
  no persistent project state, so the demonstrated value is a designed interaction pattern rather
  than a general tool.
- Frame the contribution as the honest-evidence pattern, and show the failing-state screen.

### Quality of the Idea

> "Is this a creative, non-obvious use of Nebius Token Factory or AI Cloud model(s), and NVIDIA
> Nemotron or other NVIDIA open source models and does the team show genuine understanding of the
> problem space?"

- **Moderate:** calling Nemotron for structured plan and patch generation is a conventional use of
  Token Factory, not a novel one.
- **Stronger:** the differentiator is the evaluator contract — a model is used for generation while
  a separate, deliberately non-executing evaluator reports what it actually matched. That is a
  defensible position on the "green checkmark" problem, and it is enforced in code and tests rather
  than claimed in prose.
- **Strong:** the team demonstrates understanding of the boundaries it chose and states them
  plainly, including the fact that the build is not a sandbox.

## 4. Where Token Factory and Nemotron are used

| Location | Call | Purpose |
| --- | --- | --- |
| `POST /api/agent/plan` | `requestLivePlanOutput` | Generates the goal and six milestones as validated JSON. |
| `POST /api/agent/run` | `requestLivePatchOutput` | Generates the two-file patch and its explanation. |
| `GET /api/health` | none | Reports model, base URL, and limits to the browser without the key. |

Both generation calls are bounded by the rate limiter, capped at 8,192 output tokens, time out at
120 seconds, and never retry automatically. Deterministic fallback serves the same flow with no
network call.

## 5. Static checks, described honestly

Use this wording in the submission text:

> The evaluator performs three static fixture checks: it inspects the returned file contents for
> expected text and markup (`aria-describedby`, `aria-invalid`, `Strength`, `Use at least 8
> characters`, and that message in the fixture test file). These are content comparisons against a
> fixed sample. The application does not compile TypeScript, does not run Vitest, and does not
> execute generated code in any sandbox. Every result is labeled "Static fixture criteria (not
> executed tests)" in the UI and "Execution: no code or test process ran" in the copied summary.

Never write: "tests run", "tests passed", "verified code", "compiles", or "validated in a sandbox"
for this build.

## 6. Automated verification available to judges

`pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e` all pass locally, and the
same sequence runs in GitHub Actions on every push and pull request.

- 33 unit tests across 8 files. Provider tests stub `fetch`, so no Token Factory credit is spent.
- 20 Playwright tests: 9 in `tests/e2e/evaluator-truth.spec.ts` covering failed criteria,
  incomplete runs, provider failure states, and a scan of every page for executed-test claims;
  5 in `tests/e2e/public-pages.spec.ts` covering About, Privacy, Terms of Service, and their footer links.
- CI sets `AGENT_MODE=fallback`, so a pull request cannot spend credits or reach Nebius.
- CI fails if a key-shaped string or `.env.local` appears in the tracked tree.

## 7. Remaining gaps before submission

1. Record and upload the demo video under three minutes (`docs/demo-script.md` is the script).
2. Provide a working demo URL or hosted test build.
3. Complete the Devpost feedback section.
4. If the project predates the submission period, add the written update explanation.
5. Confirm the track selection against the live rules page; the recommendation is unchanged.
6. Re-read the submission text for banned phrases listed in section 5.