# Track-fit recommendation

Short version: **submit to Best Apps and Agents, and do not change your current selection based on
this document.** This is a recommendation about where the build scores best, not an instruction to
re-enter.

## The decision that drives everything

CodeRunway makes two calls to Nebius Token Factory: one for the plan, one for the patch. It does
not execute, compile, or test the code it generates. There is no sandbox, no shell execution, and
no arbitrary repository support. That is a deliberate scope boundary, not a missing feature in the
current sprint.

## How each track reads against the current build

### Best Apps and Agents — recommended

The track asks for "any app or agent someone would actually use, from a productivity tool or copilot
to a workflow that runs itself," powered by Nemotron models through Token Factory. Serverless
Endpoints and Jobs are encouraged but explicitly not required.

CodeRunway fits this description closely. It is a complete product experience with a defined user
and a finished flow, it powers generation with Nemotron through Token Factory, and it needs no
serverless infrastructure. Nothing in this track's language requires executing the code the model
writes. The no-sandbox decision costs nothing here.

This is where the restrained design work, the honest labeling, and the failing-state behavior get
scored under Design and Potential Impact, where they are the strongest assets.

### Coding and Agentic Engineering — weakest fit

The track asks for "agents that write, run, and test code in Token Factory." CodeRunway writes but
does not run or test. Stage One asks whether a project "reasonably fits the theme… a genuine
attempt at the track's stated goal, not a superficial rebrand." A generation-only agent is a
genuine attempt at the theme, so it would likely clear Stage One, but it would then be scored
against a criterion it does not attempt. Technological Implementation is where this hurts, and that
criterion is weighted equally with the other three.

Do not enter this track and then describe the evaluator as running tests. That description would be
false, and the false claim is a larger problem than the track mismatch.

### Personal AI — not a fit

This track asks for an always-on private assistant with persistent memory, reusable skills, and
tool access across daily workflows. CodeRunway is a single-task, session-scoped workspace with
in-memory state that resets on refresh. There is no persistent memory and no always-on behavior.

### Physical AI — not a fit

No hardware, no sensors, no embodied agent. Not applicable.

## Why the narrow scope is defensible

If a judge asks why there is no sandbox, the honest answer is strong:

> We could have added a sandbox, but any executed code would run against a synthetic fixture, so it
> would produce evidence that looks like verification without being verification. We chose a
> bounded evaluator that reports exactly what it checked, and we enforced that boundary in code and
> in tests rather than describing it away.

That answer demonstrates understanding of the problem space, which is what Quality of the Idea
asks for. It is much stronger than a sandboxed demo that claims more than it shows.

## What would change this recommendation

A Token Factory Sandbox that actually runs the sample's Vitest suite would make Coding and
Agentic Engineering the stronger entry, because it would answer the "write, run, and test" language
directly. That is a real project, not a patch to this one. The rules referenced here are the
official rules page; re-check it before submitting, since track requirements can change.