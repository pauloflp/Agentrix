# Agentrix CSV Guard

Free, offline, zero-dependency CSV structural audit CLI for Node.js 20+.

<div align="center">
<img src="../../assets/agentrix-workflow.svg" alt="Agentrix workflow: discover, run locally, review and ship" width="900"/>
<br/><sub>Agentrix workflow illustration. Commands and limitations below describe this specific tool.</sub>
</div>

## Usage

```bash
node bin/csv-guard.mjs --file ./data.csv
node bin/csv-guard.mjs --file ./data.csv --delimiter semicolon --json
node bin/csv-guard.mjs --file ./data.csv --no-header --formula-risk
npm test
```

Detects inconsistent column counts, malformed quotes, empty/duplicate headers, blank rows, and optionally formula-like spreadsheet cells. Supports BOM, quoted multiline fields, CRLF and comma, semicolon, tab and pipe delimiters. Exit codes: 0 clean, 1 issues, 2 input/usage error. The JSON report contains counts and issue locations, not cell contents. Files are read locally; no upload or telemetry. Maximum file size: 10 MiB. Delimiter autodetection is heuristic; override it if needed. Formula detection is a warning heuristic, not sanitization; do not open untrusted CSVs in spreadsheet software without appropriate safeguards.

MIT licensed. Not a replacement for schema or data validation.
