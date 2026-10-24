# Agentrix JSONL Guard

**Validate newline-delimited JSON before shipping logs, data imports and AI datasets.** Find bad line numbers without exposing the records. A tiny, free, MIT-licensed Node.js 20+ CLI, with no dependencies, tracking or network calls.

## Quick start

Clone [Agentrix](https://github.com/pauloflp/Agentrix), then run from this directory:

```bash
node bin/jsonl-guard.mjs --file examples/valid.jsonl
node bin/jsonl-guard.mjs --file examples/invalid.jsonl
node bin/jsonl-guard.mjs --file examples/invalid.jsonl --json
node bin/jsonl-guard.mjs --file examples/valid.jsonl --objects-only
npm test
```

The invalid example produces:

```text
FAIL: 3 lines, 2 valid, 1 invalid
line 2: INVALID_JSON
```

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

```yaml
- name: Check JSONL format
  run: node products/agentrix-jsonl-guard/bin/jsonl-guard.mjs --file fixtures/events.jsonl --json
```

`JSONL Guard` complements [JSON Diff](../agentrix-json-diff/), which compares two JSON documents and may include original values in its JSON output. JSONL Guard validates individual records instead, and never prints their contents.

## Limits

- Local files only: no remote URL, stdin, compression or schema validation.
- Maximum file size: **20 MiB**. Reads a single file into memory, so it is not a streaming validator for massive datasets.
- A line can be any valid JSON value unless `--objects-only` is used.
- Error codes intentionally omit JSON parser exception details and input values to reduce accidental disclosure. They do not detect business-logic errors or secret fields in otherwise valid JSON.
- No external services, analytics, subscriptions, credentials or uploads.

## License

MIT, free for personal and commercial use. Created for the Agentrix open-source tool collection.
