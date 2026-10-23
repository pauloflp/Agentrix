# Agentrix UTM Audit

**Find inconsistent campaign links before publishing ads, newsletters, or social posts.** A free, offline, zero-dependency Node.js CLI for checking UTM tagging across a plain-text list of URLs.

<div align="center">
<img src="../../assets/agentrix-workflow.svg" alt="Agentrix workflow: discover, run locally, review and ship" width="900"/>
<br/><sub>Agentrix workflow illustration. Commands and limitations below describe this specific tool.</sub>
</div>

## Why

Google Analytics recommends consistent `utm_source`, `utm_medium`, and `utm_campaign` parameters. Their **values are case-sensitive**, so inconsistent capitalization can fragment campaign reporting. This tool spots common tagging mistakes before links go live.

## Requirements

Node.js 20+. No dependencies, account, analytics access, or network requests.

## Usage

Create a UTF-8 file `urls.txt` with **one absolute URL per line**. Blank lines and lines starting with `#` are ignored.

```text
https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=launch
https://example.com/?utm_source=newsletter&utm_medium=email&utm_campaign=launch
```

Run from the product directory:

```bash
node bin/utm-audit.mjs --file urls.txt
node bin/utm-audit.mjs --file urls.txt --json
node bin/utm-audit.mjs --file urls.txt --allow-untagged
npm test
```

Exit codes: `0` no findings, `1` validation findings, `2` file or argument error. Reports **line numbers and issue codes, never full URLs or parameter values**.

## Checks

- Missing recommended core UTMs (`utm_source`, `utm_medium`, `utm_campaign`)
- Duplicate UTM keys, incorrect key capitalization, empty values, and likely key typos
- Uppercase/mixed-case values, whitespace, and capitalization conflicts across URLs
- Untagged links (unless explicitly allowed) and UTMs placed in URL fragments
- Malformed links and non-HTTP(S) URL schemes

## Limitations

- This is a **naming consistency linter**, not a guarantee that analytics tracking works or that channel attribution is correct.
- Uppercase and whitespace rules are opinionated style warnings; some naming conventions intentionally use them.
- Supports local text input up to 2 MiB / 10,000 lines. It does not fetch destination pages, follow redirects, or connect to Google Analytics.
- Dynamic advertising platform macros are not expanded; validate their eventual values separately.
- Reports avoid printing full links, but input files remain on your machine. Treat links containing private tokens as sensitive.

## Reference

[Google Analytics: Collect campaign data with custom URLs](https://support.google.com/analytics/answer/10917952)

## License

MIT. Free for personal and commercial use. [Agentrix](https://github.com/pauloflp/Agentrix).
