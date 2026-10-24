# Agentrix Data Import Studio: local CSV mapping and validation

**Visual CSV column mapping, typed validation and clean/error exports, all locally in your browser.**

**Free, open source, MIT-licensed. No payment, login, analytics or remote data upload.** This tool is a visual alternative to the free [CSV Guard](../agentrix-csv-guard/), not a replacement for it.

## Get started

**Option A · Standalone file:** Download this folder and try opening `index.html` in a recent desktop browser. Browser policies and file-URL restrictions differ. The app is designed for standalone use, but direct file opening was blocked by the test environment and is not part of the verified tests.

**Option B · Local-server route (Node.js 20+):**

```bash
git clone https://github.com/pauloflp/Agentrix.git
cd Agentrix/products/agentrix-data-import-studio
npm start
```

Visit **http://127.0.0.1:4177/** in Chrome or Chromium. The server listens only on your own computer. No internet needed after the code is downloaded. Press **Load sample dataset**, **Validate rows**, then export the passing and failing CSV files.

For your data, select/drop a CSV and optionally import a JSON schema modeled on `examples/contacts-schema.json`. Your files are parsed inside your browser and are not sent to the local server; only the HTML application is served.

## Included

- `index.html`: self-contained HTML, CSS, JavaScript app
- `src/`, `build.mjs`: editable source and deterministic HTML builder
- `examples/`: synthetic CSV and JSON schema
- `tests/`: Node.js CSV unit tests and optional Playwright browser smoke suite
- `serve.mjs`: minimal local-only Node server, no npm dependencies

## Features and boundaries

- CSV comma/semicolon/tab detection, quotes and multiline values, BOM, header toggle, source preview.
- Visual column mapping to a user-defined JSON schema; string, email, number and YYYY-MM-DD date checks; required flags.
- Reports original row numbers and exports clean CSV + error report.
- Escapes some spreadsheet-formula risks by default in CSV exports, but this is **not** a guarantee across all spreadsheet products. Verify untrusted CSV before opening in spreadsheet software.
- Input limit 5 MiB, 20,000 rows, 80 columns. JSON schema limit 100 KiB.
- No XLSX, deduplication, CRM/database connectors, file upload, remote account, tracking or hosted import API. The output still requires human review and import via the destination platform.

## Build and test

```bash
npm test
npm run build
python tests/browser-smoke.py # optional, requires Playwright and Chromium installed
```

The browser suite fetches the HTML from a **loopback-only** server and exercises the same built HTML through Chromium injection using `page.set_content`, verifying file upload, mapping, exports and rejected replacements. In this environment, browser navigation to `http://127.0.0.1/` and `file://` was blocked by administrative browser policy; the local server HTTP response is validated separately but direct navigation remains **NOT TESTED**. Browser availability may differ on your machine. Node unit tests have no dependencies.

## License

MIT. See [LICENSE](LICENSE). All six Agentrix microtools and 15 skills remain free. This application provides a convenience workspace and is not a replacement for a production CRM import, security scan or compliance review.

## Related tools

Use [CSV Guard](../agentrix-csv-guard/) for a command-line CSV structure check before mapping columns. Use [JSONL Guard](../agentrix-jsonl-guard/) when records are stored as JSON Lines rather than CSV. [Browse all six tools](../../README.md#free-tools) or [ask a usage question](https://github.com/pauloflp/Agentrix/discussions).
