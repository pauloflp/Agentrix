# Agentrix Webhook Delivery Inspector

**Free MIT-licensed local developer tool**, requiring only Node.js 20+.

Offline CLI for **webhook delivery metadata** exported as JSONL. Detects suspicious multiple successful deliveries, never-successful events, excessive attempts, conflicting attempt records, and high per-endpoint HTTP error rates. Designed for Node.js **20+** without runtime dependencies. Available as an independent microtool in the public Agentrix catalog.

## Run

```sh
npm test
node src/cli.js --input fixtures/healthy.jsonl --format json   # exit 0
node src/cli.js --input fixtures/mixed.jsonl --format json     # exit 1 (alerts)
node src/cli.js --input fixtures/invalid.jsonl --format json   # exit 2 (invalid)
npm run demo                                                  # exit 1 by design
```

`--format text` prints a short text report. `--max-attempts N` (default 3) and `--error-rate-threshold PERCENT` (default 50) customize alerting. Exit 0: no alerts; 1: alerts; 2: invalid file/options. Use `node src/cli.js --help` for usage. An exit 1 from the demo indicates successful alert detection, **not** a runtime failure.

## JSONL contract

One JSON object per line, exactly these five fields, without headers or payloads:

```json
{"event_id":"evt-123","endpoint_id":"billing-v1","attempt":1,"timestamp":"2026-10-20T12:00:00Z","status_code":503}
```

- `event_id`, `endpoint_id`: 1–128 ASCII characters, letters/digits/period/underscore/colon/hyphen. Identifiers may repeat across endpoints; grouping is by **both** fields.
- `attempt`: integer 1..100000. A retry uses a distinct attempt number for the same event/endpoint.
- `timestamp`: valid RFC3339 date/time with timezone and optional 1–3 fractional digits, 1970–9999.
- `status_code`: integer 100..599. HTTP 2xx is success, 4xx/5xx count as HTTP errors; 1xx/3xx are neither.
- Other fields, including `payload`, `headers`, and `token`, are **rejected**. The CLI never writes or prints raw input lines or file paths. Export only metadata, not production secrets.

## Rules and interpretation

- **MULTIPLE_SUCCESSES**: two or more *different attempt numbers* returned 2xx for the same event+endpoint. A single success after one or more failed attempts is legitimate and not flagged by this rule.
- **NO_SUCCESS**: no observed 2xx in the exported attempts. This means **no success in this file**, not proof of permanent failure outside the observation window.
- **EXCESSIVE_ATTEMPTS**: distinct attempt numbers exceed configured threshold.
- **ATTEMPT_CONFLICT**: the same event+endpoint+attempt appears with different timestamp or HTTP status. Conflicting later rows are not counted in metrics, but the conflict is reported. Byte-identical duplicate records are counted in `duplicate_log_rows`, not as another delivery.
- **HIGH_ERROR_RATE**: HTTP 4xx/5xx / distinct observed attempts exceeds threshold for an endpoint. Error rate is per **attempt**, not per unique event. Duplicate rows do not inflate it.

Alerts and endpoints are deterministically sorted. Event/endpoint references in output are truncated SHA-256 fingerprints (20 hex chars), not raw IDs. **Fingerprints are not a guarantee of anonymity** for low-entropy IDs. No payload content is retained or emitted. Avoid sharing reports if identifiers are sensitive. Input remains local; no network calls.

## Limits and non-goals

Maximum input file **5 MiB**, **10,000 lines**, **16 KiB per line**, **5,000 distinct event/endpoint groups**. Input is read only after checking file size; memory is bounded by these limits. Not a streaming collector, webhook receiver, retry scheduler, financial reconciliation tool, or replacement for generic JSONL validation. Does not contact endpoints, prove charges, or guarantee all deliveries are present. Source can be run directly from a clean extraction with Node >=20. No dependencies or install required.

## Testing and compatibility

Run `npm test` to check the included examples and error handling. The project also runs automated tests on Node.js 20, 22 and 24 in [GitHub Actions](../../.github/workflows/microproducts-ci.yml).

The examples use fictional webhook records. The tool has not been verified against every webhook provider, operating system or real-world export format. Check that your exported metadata matches the documented input format before relying on a report.
