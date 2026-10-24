# Agentrix JSONL Guard: JSONL / NDJSON validator

**Validate newline-delimited JSON before shipping logs, data imports and AI datasets.** Find bad line numbers without exposing the records. A tiny, free, MIT-licensed Node.js 20+ CLI, with no dependencies, tracking or network calls.

## Quick start

Requires **Git and Node.js 20+**. This JSON Lines checker runs from source; no `npm install` or global package is needed:

```bash
git clone --depth 1 https://github.com/pauloflp/Agentrix.git
cd Agentrix/products/agentrix-jsonl-guard
node bin/jsonl-guard.mjs --file examples/valid.jsonl
```

```text
PASS: 2 lines, 2 valid, 0 invalid
```

Try the [deliberately malformed file](examples/invalid.jsonl):

```jsonl
{"id":1,"event":"started"}
{"id":2,"event":}
{"id":3,"event":"completed"}
```

```bash
node bin/jsonl-guard.mjs --file examples/invalid.jsonl
```

The invalid example produces:

```text
FAIL: 3 lines, 2 valid, 1 invalid
line 2: INVALID_JSON
```

This intentionally exits `1`. Append `--json` for machine-readable diagnostics. From the repository root, `node scripts/demo.mjs jsonl-guard` runs four examples and checks their expected exit codes. Run `npm test` from this product directory for the unit and CLI tests.

### NDJSON and object-only records

`.jsonl` and `.ndjson` inputs use the same command. The [values sample](examples/values.ndjson) contains an object, a number and an array. All are valid JSON values under the [JSON Lines format](https://jsonlines.org/); `--objects-only` adds a stricter application rule:

```bash
node bin/jsonl-guard.mjs --file examples/values.ndjson
node bin/jsonl-guard.mjs --file examples/values.ndjson --objects-only
```

The first command exits `0`. The second exits `1`, reporting `NOT_OBJECT` on lines `2` and `3`. These format checks do not establish compatibility with a specific AI provider's dataset schema.

It **never displays original record values**, even when `JSON.parse` fails. Machine-readable `--json` reports only line numbers, error codes and counts. Safe for sharing diagnostics after reviewing filenames and workflow context.

## Options

| Flag | Behavior |
| --- | --- |
| `--file PATH` | Read a UTF-8 `.jsonl` or `.ndjson` file (required). |
| `--json` | Print a JSON summary for CI pipelines. |
| `--objects-only` | Reject valid JSON primitives and arrays, requiring one object per line. |
| `--max-issues N` | Show at most `N` per-line issues (1 to 100, default 20); totals always reflect all issues. |
| `--help` | Display usage. |

Exit codes: `0` all lines valid; `1` invalid or empty JSONL; `2` command, file access, oversize input or UTF-8 error. The tool handles UTF-8 BOM, LF and CRLF. A trailing newline is allowed. Empty lines **within** a file are reported as `EMPTY_LINE`. An empty file reports `EMPTY_FILE` at line `0`.

### CI example

After checking out Agentrix, run this from its root against the bundled valid records. For your project, replace the input path with an existing file and adapt the tool location; see the [complete GitHub Actions example](../../docs/local-validation.md#use-the-checks-in-github-actions).

```yaml
- name: Check JSONL format
  run: node products/agentrix-jsonl-guard/bin/jsonl-guard.mjs --file products/agentrix-jsonl-guard/examples/valid.jsonl --json
```

`JSONL Guard` complements [JSON Diff](../agentrix-json-diff/), which compares two JSON documents and may include original values in its JSON output. JSONL Guard validates individual records instead, and never prints their contents.

[CSV Guard](../agentrix-csv-guard/) checks CSV structure; [Env Contract](../agentrix-env-contract/) checks environment key drift. [Browse all six tools](../../README.md#free-tools) or [ask a usage question](https://github.com/pauloflp/Agentrix/discussions).

## Limits

- Local files only: no remote URL, stdin, compression or schema validation.
- Maximum file size: **20 MiB**. Reads a single file into memory, so it is not a streaming validator for massive datasets.
- A line can be any valid JSON value unless `--objects-only` is used.
- Error codes intentionally omit JSON parser exception details and input values to reduce accidental disclosure. They do not detect business-logic errors or secret fields in otherwise valid JSON.
- No external services, analytics, subscriptions, credentials or uploads.

## License

MIT, free for personal and commercial use. Created for the Agentrix open-source tool collection.
