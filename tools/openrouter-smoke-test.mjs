#!/usr/bin/env node
/**
 * Minimal OpenRouter connectivity check for Agentrix.
 *
 * - Dry run is the default: no API call, no secret required.
 * - Live run requires --live AND OPENROUTER_API_KEY.
 * - The model is locked to OpenRouter's free router. No paid fallbacks.
 * - Fixed, non-sensitive prompt. Never logs the API key or model output.
 * - No dependencies, file uploads, or repository contents transmitted.
 */
const FREE_MODEL = "openrouter/free";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const live = process.argv.includes("--live");
const unexpectedArgs = process.argv.slice(2).filter((arg) => !["--live", "--dry-run"].includes(arg));

if (unexpectedArgs.length || (live && process.argv.includes("--dry-run"))) {
  console.error("Usage: node tools/openrouter-smoke-test.mjs [--dry-run | --live]");
  process.exitCode = 2;
} else if (!live) {
  console.log("PASS dry-run: only openrouter/free is configured; no network call or API credentials used.");
} else {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) {
    console.error("FAIL: OPENROUTER_API_KEY is missing from the workflow's environment.");
    process.exitCode = 2;
  } else {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/pauloflp/Agentrix",
          "X-Title": "Agentrix free model smoke test",
        },
        body: JSON.stringify({
          model: FREE_MODEL,
          messages: [
            { role: "system", content: "This is a connectivity check. Respond briefly." },
            { role: "user", content: "Reply with the exact text AGENTRIX_OK." },
          ],
          // Some free-router models spend tokens reasoning before producing visible text.
          max_tokens: 512,
          temperature: 0,
          stream: false,
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (!response.ok) {
        // Avoid logging upstream bodies/headers, which may contain sensitive information.
        console.error(`FAIL: OpenRouter returned HTTP ${response.status}.`);
        process.exitCode = 1;
      } else {
        const result = await response.json();
        const completion = result?.choices?.[0];
        const content = completion?.message?.content;
        const text = typeof content === "string"
          ? content
          : Array.isArray(content)
            ? content.filter((part) => part?.type === "text" && typeof part.text === "string")
                .map((part) => part.text).join("")
            : "";
        if (!text.trim()) {
          const safeFinishReasons = new Set(["stop", "length", "content_filter", "tool_calls"]);
          const reason = safeFinishReasons.has(completion?.finish_reason)
            ? completion.finish_reason : "unknown";
          const tokens = result?.usage?.completion_tokens;
          const safeTokens = Number.isSafeInteger(tokens) && tokens >= 0 ? tokens : "unknown";
          const reasoningPresent = Boolean(completion?.message?.reasoning);
          console.error(`FAIL: HTTP 200 but no visible text (finish_reason=${reason}, completion_tokens=${safeTokens}, reasoning_present=${reasoningPresent}, choices=${Array.isArray(result?.choices) ? result.choices.length : "unknown"}).`);
          process.exitCode = 1;
        } else {
          console.log("PASS: authenticated free-model request returned a text completion.");
          console.log("Note: no prompt, response text, key, or repository source was logged.");
        }
      }
    } catch (error) {
      console.error(`FAIL: connection or JSON error (${error?.name || "unknown"}).`);
      process.exitCode = 1;
    }
  }
}
