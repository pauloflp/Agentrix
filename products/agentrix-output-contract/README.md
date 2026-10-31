# Agentrix Output Contract

**Free, MIT-licensed local developer tool.** No registration, payment, cloud API, or installation beyond Node.js 20+ is required.

A small, **offline** JSON contract validator for agent output and CI pipelines. Node.js **20+**, zero runtime dependencies, no network calls, no customer data needed.

## Quick start

Download the [Agentrix repository](https://github.com/pauloflp/Agentrix), open `products/agentrix-output-contract`, and run:

```bash
npm test
node src/cli.js --schema fixtures/contract.json --input fixtures/valid.json
node src/cli.js --schema fixtures/contract.json --input fixtures/invalid.json --format json
```

The first CLI command prints `VALID` and exits **0**. The second reports JSON Pointer paths (for example `/items/0/id`) and exits **1**. Invalid options, unreadable/malformed input, unsupported/invalid schema, or files larger than 1 MiB exit **2**.

## Contract

Accepted schema keywords: `type` (string or union array: null, boolean, object, array, number, integer, string), `properties`, `required`, `additionalProperties` (boolean or nested schema), `items` (single schema), and `enum`. Nested schemas are supported. All other keywords are rejected as **unsupported**, not silently ignored. The tool is **not a complete JSON Schema implementation** and does not support `$ref`, `format`, `pattern`, `oneOf`, constraints like `minLength`, or draft-specific behavior. Avoid claiming compliance with a full JSON Schema specification.

`--format text` (default) writes `VALID` to stdout or violations to stderr. `--format json` writes `{ "valid": boolean, "kind": string, "errors": [{"path", "code", "message"}] }` to stdout for contract/schema diagnostics. For unreadable/malformed files, the CLI prints a generic error to stderr, without echoing JSON content. JSON Pointer paths use RFC 6901 escaping (`~0`, `~1`); the root path is `/`. Errors are capped at 100; files are capped at 1 MiB; schemas at 10,000 nodes and 64 levels.

**Privacy:** only validation codes and property paths are printed, never raw values, enum contents, or secrets. Property names themselves can appear in JSON Pointers, so do not use secret values as JSON object keys. Paths supplied as CLI arguments are used locally; no data is uploaded. Inputs are not persisted by the program.

**Numeric caveat:** JavaScript JSON numbers use IEEE-754. Unsafe integers are rejected for `type: integer`; precision for other very large numbers cannot be guaranteed. JSON documents with duplicate object keys are handled by `JSON.parse` (last key wins). This tool does not detect duplicate keys.

## CI usage

```bash
node src/cli.js --schema fixtures/contract.json --input fixtures/valid.json --format json
# exit 0 => pass; exit 1 => output violates contract; exit 2 => pipeline configuration/input error
```

## Scope and differentiation

This validates **one JSON document against a schema subset**. JSONL Guard checks line-oriented JSON syntax; JSON Diff compares documents; neither supplies this exact contract check. No paid API, AI calls, webhooks, financial data, or remote integrations. Tests use synthetic fixtures. Initial LAB tests used Node 22 on Linux. See the public repository CI for Node 20/22/24 validation; other platforms are not yet independently verified.
