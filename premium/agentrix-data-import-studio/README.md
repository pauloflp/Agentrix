# Agentrix Data Import Studio

**CSV column mapping and row validation in your browser.**

**Status: private technical preview. Not yet available to buy or download publicly.** No checkout or release date is currently offered.

Data Import Studio is being developed for teams that receive CSV files from customers, CRM exports, and internal spreadsheets, and need to inspect, map, validate, and normalize records before importing them into another system.

## The problem it addresses

CSV files often contain different column names, missing required values, malformed emails, invalid dates, and inconsistent number formats. Discovering these issues only after a CRM import can waste time and make cleanup harder.

## Features verified in the internal preview

- Load a CSV by file picker or drag-and-drop. Try an entirely synthetic example dataset.
- Handle quoted CSV fields, multiline values, UTF-8 BOM, and comma, semicolon, or tab delimiters.
- Select whether the first row contains column headers; preview the parsed data.
- Map source columns to a user-supplied JSON schema with required fields and string, email, number, or ISO date validation.
- Review errors by source line, export passing rows as a normalized CSV, and download a separate CSV error report.
- Run locally without an account, external scripts, telemetry, or API calls in the application.
- Use a responsive desktop/mobile interface.

**Internal validation:** 13 automated unit tests passed on Node.js 22, plus Chromium desktop and mobile smoke tests covering the demo, mapping, validation, downloads, and no external HTTP(S) requests. These results are not a substitute for an independent security review or cross-browser customer testing.

## What it does not do

Data Import Studio is **not** a hosted CSV import API, XLSX converter, database connector, or a direct CRM integration. It does not sync to cloud storage, deduplicate customers, or guarantee that a downstream system will accept an exported file.

Current preview limits: **5 MiB**, **20,000 data rows**, **80 columns**. CSV spreadsheet-formula risks are escaped by default, but spreadsheet programs can interpret content differently. Review untrusted data before opening exported files.

## How it differs from the free CSV Guard

[Agentrix CSV Guard](../../products/agentrix-csv-guard/README.md) is a **free MIT-licensed Node.js CLI** that audits CSV structure and warns about risky spreadsheet formulas.

Data Import Studio adds a visual **schema mapping and record validation workflow** with separate clean/error exports. It does not replace CSV Guard. CSV Guard remains freely available, with no paywall.

## FAQ

**Can I import into Salesforce, HubSpot, or another CRM directly?**  
No. The preview exports CSV files you can review and then import using the destination platform's own importer.

**Will it upload my customers' data?**  
The internal preview parses files in the browser and contains no network calls. The product has not yet undergone an independent security audit.

**Does it work offline?**  
The preview is packaged as a standalone HTML file with embedded assets. Automated browser tests exercised that HTML without external requests. Direct file-open behavior on customers' computers is still to be validated.

**Can I buy it now?**  
No. Scope, commercial license, pricing, and protected delivery have not yet been approved. No payment link is available for this product.

**Is the source open source?**  
No. This planned premium tool has not been released under an open-source license. The four existing free tools remain MIT-licensed, and the 15 free agent skills remain publicly accessible.

## Related resources

- [Free CSV Guard CLI](../../products/agentrix-csv-guard/README.md)
- [Free developer tools and agent skills](../../README.md)

*Agentrix is independent and is not affiliated with CRM platforms mentioned as examples.*
