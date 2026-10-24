# Validate JSONL, environment keys and CSV before CI

Catch three common input problems locally: a malformed JSONL record, an environment key missing from a deployment file, and a CSV row with the wrong number of columns. These examples use the actual Agentrix CLIs with synthetic input. Nothing is uploaded and no package installation is required.

## Run the examples

Install **Git and Node.js 20+** if they are not already available, then:

```bash
git clone --depth 1 https://github.com/pauloflp/Agentrix.git
cd Agentrix
node scripts/demo.mjs
```

The runner prints each command, its output and its expected exit code. It runs 12 examples across five CLIs, including intentional failures. The runner itself exits `0` when all example exit codes match, and `1` if a demonstration behaves unexpectedly. It does not replace the product test suites.

To focus on one workflow, run `node scripts/demo.mjs jsonl-guard`, `node scripts/demo.mjs env-contract`, or `node scripts/demo.mjs csv-guard`. All paths in the following sections assume you are at the repository root.

## Check JSON Lines or NDJSON syntax

A JSON Lines file contains one JSON value per line. Unlike a JSON array, records do not have commas between lines. A blank record is invalid, while a final newline is allowed. See the [JSON Lines format](https://jsonlines.org/).

The [invalid fixture](../products/agentrix-jsonl-guard/examples/invalid.jsonl) has a missing value on line 2:

```jsonl
{"id":1,"event":"started"}
{"id":2,"event":}
{"id":3,"event":"completed"}
```

```bash
node products/agentrix-jsonl-guard/bin/jsonl-guard.mjs --file products/agentrix-jsonl-guard/examples/invalid.jsonl
```

```text
FAIL: 3 lines, 2 valid, 1 invalid
line 2: INVALID_JSON
```

This command exits `1` and does not print the record values. Use the [valid fixture](../products/agentrix-jsonl-guard/examples/valid.jsonl) for a passing case. Append `--json` for a report that contains counts, line numbers and issue codes. `.ndjson` works the same way. `--objects-only` adds an application constraint; numbers and arrays are valid JSON values by default.

**Boundary:** JSONL Guard checks syntax and optional object shape, not JSON Schema, AI provider requirements or the meaning of your data. The file size limit is 20 MiB; it reads the file into memory. [Full options and limits](../products/agentrix-jsonl-guard/README.md).

## Check `.env.example` against environment key names

Env Contract compares names in two local files. It does not read `process.env`, validate values or inspect application source code.

```bash
node products/agentrix-env-contract/bin/env-contract.mjs --example products/agentrix-env-contract/examples/expected.env --env products/agentrix-env-contract/examples/drift.env
```

```text
FAIL: environment key mismatch
Missing: API_BASE_URL
Undocumented: LOCAL_DEBUG
```

This command exits `1`. Replacing `drift.env` with `matching.env` passes even though the values differ. `--allow-extra` allows local-only names but still fails on missing expected names. `--json` prints names and status, never values.

For your project, pass your `.env.example` and an existing `.env` or sanitized `.env.ci` file. A missing file is an input error with exit `2`. Keep real credentials out of version control and public diagnostics. [Usage and parser limits](../products/agentrix-env-contract/README.md).

## Check CSV structure and formula-like cells

The [invalid CSV fixture](../products/agentrix-csv-guard/examples/invalid.csv) contains a two-column header, a row with one column and a formula-like cell:

```bash
node products/agentrix-csv-guard/bin/csv-guard.mjs --file products/agentrix-csv-guard/examples/invalid.csv --formula-risk
```

```text
CSV Guard: FAIL | 3 data rows | 2 columns | delimiter: comma
Line 3: COLUMN_COUNT (expected 2, got 1)
Line 4, column 2: POTENTIAL_FORMULA
```

This command exits `1`; the [valid CSV fixture](../products/agentrix-csv-guard/examples/valid.csv) passes. Use `--delimiter semicolon`, `tab`, `pipe` or `comma` when automatic delimiter selection does not match your file. `--json` omits cell contents from the report.

**Boundary:** CSV Guard checks structure, not email validity, required business fields or safe spreadsheet execution. `--formula-risk` is a heuristic for CSV formula injection risks, not a sanitizer; legitimate negative numbers can be flagged. Maximum input size is 10 MiB. Use [Data Import Studio](../products/agentrix-data-import-studio/) for visual column mapping, typed validation and clean/error exports. [Full CSV Guard options](../products/agentrix-csv-guard/README.md).

## Use the checks in GitHub Actions

When checking a separate project, check out both the project and the tool source. This example assumes your project commits sanitized fixtures at `fixtures/events.jsonl`, `fixtures/contacts.csv`, `.env.example` and `.env.ci`. Create those files or adjust the paths first. The `.env.ci` file represents key presence only and must contain placeholders, not production secrets.

```yaml
name: Check local input contracts
on: [push, pull_request]
permissions:
  contents: read
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          path: project
          persist-credentials: false
      - uses: actions/checkout@v4
        with:
          repository: pauloflp/Agentrix
          # Reviewed tool implementation; intentionally pinned, not latest main.
          ref: 8eb265c67ef4d6b5ee13c9461d69e66f9d10318c
          path: agentrix-tools
          persist-credentials: false
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          package-manager-cache: false
      - name: Validate JSON Lines
        run: node agentrix-tools/products/agentrix-jsonl-guard/bin/jsonl-guard.mjs --file project/fixtures/events.jsonl --json
      - name: Compare environment key names
        run: node agentrix-tools/products/agentrix-env-contract/bin/env-contract.mjs --example project/.env.example --env project/.env.ci --json
      - name: Check CSV structure and formula-like cells
        run: node agentrix-tools/products/agentrix-csv-guard/bin/csv-guard.mjs --file project/fixtures/contacts.csv --formula-risk --json
```

Review upstream changes before updating the pinned tool commit. Each validation command exits `0` on success, `1` on findings, and `2` for input/usage errors. GitHub Actions fails the step on either nonzero result; do not append `|| true` to a gate you intend to enforce. This workflow checks the supplied files, not whether the runtime deployment actually has the same environment keys.

## Pick the next check

- [JSON Diff](../products/agentrix-json-diff/): compare JSON snapshots by path. Text output shows paths; `--json` includes original values.
- [UTM Audit](../products/agentrix-utm-audit/): check naming consistency in a text list of campaign URLs without fetching their destinations.
- [Browse all six free tools](../README.md#free-tools), [ask a usage question](https://github.com/pauloflp/Agentrix/discussions), or [report a reproducible bug](https://github.com/pauloflp/Agentrix/issues/new/choose).
