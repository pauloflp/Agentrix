# Agentrix | OpenRouter free smoke test

Purpose: verify that a repository secret named `OPENROUTER_API_KEY` can authenticate one non-sensitive request to the OpenRouter free-model router, **without enabling any paid model**.

## Security design

- `tools/openrouter-smoke-test.mjs` uses only `openrouter/free`; it does not accept arbitrary model names or prompts.
- The test sends a **fixed, generic prompt**, never application source code, customer data, Notion content, or secret values.
- `--dry-run` makes **zero network calls** and requires no credential. This is the only mode run automatically on pull requests.
- A live request requires **manual workflow_dispatch confirmation** after this PR is reviewed and merged, and uses the secret only in that single step.
- Never print or copy the API key into GitHub Issues, workflows, files, logs, Notion, or chat.
- Run with `permissions: contents: read`. No GitHub write tokens and no auto-merge.
- The OpenRouter free router may route to different providers; do **not** send private material through it before separately reviewing provider retention/data policies.
- The OpenRouter free tier has request-rate/daily limits. A free-model call does not imply unlimited use or guaranteed availability.

## How to use

1. Configure the secret at **Repository → Settings → Secrets and variables → Actions**:
   `OPENROUTER_API_KEY` (the owner has reported this as configured; the connector cannot read or verify the value).
2. Review and merge the PR. Merely creating the PR does **not** prove the credential works.
3. Open **Actions → Agentrix OpenRouter Free Smoke Test → Run workflow**.
4. Select branch `main`, tick **call_free_api** and click **Run workflow**.
5. The run must show both jobs green, including **One free request, explicitly opted in**.
6. Read the logs. The live script only outputs an OK/FAIL status and never outputs the model's content or secret.
7. If the API returns HTTP 401, regenerate the OpenRouter key **on OpenRouter**, replace only the repository secret and rerun manually. If HTTP 429, observe provider quota, **do not purchase credits automatically**.

## Limits and next steps

This is a credential and free-inference smoke test, **not yet** a multi-agent executor or a reliable measure of ChatGPT quota savings. It does not publish products, invoke GitHub Copilot, touch Instagram, Make, Stripe, or any production automation.

Before further delegation: build a separate reviewed job queue and fixed allowlist of free model IDs, log provider/model/usage safely, cap request count, handle rate limits, and require human approval for any code merge or external publication.

## Troubleshooting HTTP 200 with empty text

The first manual live run on 24/10/2026 returned HTTP 200 but an empty assistant text field. The previous 40-token completion budget could be exhausted by a reasoning-capable free model before it emits visible content. The test now uses up to **512 completion tokens** and recognizes string or text-part-array responses. On further empty responses, it prints only safe metadata (finish reason, generated token count, whether reasoning exists), **never the generated content or key**. This is still one manually authorized request to `openrouter/free`; do not automatically retry or switch to paid models.
