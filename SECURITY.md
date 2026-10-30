# Security policy

## Reporting a vulnerability

Please open a private security advisory on the
[GitHub repository](https://github.com/DevHuang1/CodeRunway/security/advisories) rather than a
public issue. If that is unavailable, open an issue without including any exploit detail or
secret material and we will follow up privately.

## Scope

- The `NEBIUS_API_KEY` is a server-only secret. It must never appear in client bundles, API
  responses, logs, tests, or the repository history. `.env.local` is Git-ignored; never commit it.
- Live requests are bounded by in-memory rate limits, output-token caps, and timeouts. The
  limiter is a guardrail, not a provider-side billing quota.
- The evaluator performs static fixture checks only. It does not execute code, and model-supplied
  shell commands or non-allowlisted edit paths are rejected server-side.
- If you find a path that leaks the key, executes generated code, or bypasses the allowlist,
  please report it as a vulnerability.

## Supported versions

Only the latest commit on the default branch is supported.