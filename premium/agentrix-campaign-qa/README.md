# Agentrix Campaign QA Pro — Bulk UTM Checker and Campaign URL Audit

**Audit UTM campaign links in bulk, catch tracking inconsistencies before launch, and export actionable QA reports.** Agentrix Campaign QA Pro is an offline, browser-based tool for marketers, paid media teams, performance agencies, and analytics professionals.

**Price:** **US$29 one-time**, no subscription. [Checkout link will appear after secure delivery verification.]

## What Campaign QA Pro checks

- **Missing UTM parameters:** flags absent `utm_source`, `utm_medium`, and `utm_campaign`.
- **Duplicate UTM parameters:** spots repeated campaign tracking keys inside the same URL.
- **UTM naming consistency:** detects uppercase parameter names and capitalization drift across a batch of links.
- **UTM campaign conventions:** optional allowlists for source, medium, and campaign values.
- **Broken URL syntax:** highlights malformed links and unsupported URL schemes.
- **Empty values and whitespace:** flags blank or inconsistently formatted UTM values.
- **Bulk audit reports:** export spreadsheet-ready CSV findings with suggested corrections.

### Practical workflow

1. Collect campaign destination URLs from your ad platform, email campaign plan, social scheduling tool, or spreadsheet.
2. Paste up to **1,000 URLs** or import a CSV with a URL, Link, Destination, or Final URL column.
3. Optionally configure approved UTM source, medium, and campaign names.
4. Run the offline audit. Review issues by URL and severity, then export a CSV quality-control report.

The app runs **locally in your browser**. It does not upload your URLs to a server, query Google Analytics, test live landing-page availability, or promise to repair attribution. Its quality score is an explicitly documented internal heuristic, **not** a Google Analytics metric.

## Download and activation

The Pro edition is distributed as a self-contained **encrypted HTML tool** (no Node.js installation, account, or runtime subscription needed). On completing checkout, the buyer receives an unlock key on the Stripe payment confirmation page. Download the encrypted file, open it with a modern browser, and enter the key.

**Important:** Save the unlock key and payment receipt. The offline key is transferable if shared, so it is not a per-user online activation system. The public GitHub repository contains only a locked distribution file and public marketing materials, **not** the unencrypted paid source.

## Free UTM Audit vs. paid Campaign QA Pro

| | [Free Agentrix UTM Audit](../../products/agentrix-utm-audit/) | Campaign QA Pro |
|---|---|---|
| User interface | Node.js CLI | Local browser workspace |
| Bulk URL checks | Yes | Yes |
| CSV import and reports | Consult free tool documentation | Yes |
| Custom naming allowlists | Consult free tool documentation | Yes |
| Installation | Node.js | Open one HTML file |
| License | MIT | Proprietary, one-time purchase |

Existing [15 free agent skills](../../skills/) and [free microproducts](../../README.md#free-developer-microproducts) remain free.

## Frequently asked questions

**Is Agentrix Campaign QA Pro a UTM generator?** It audits supplied campaign URLs; it is not a URL shortening service or full attribution platform.

**Does it work with GA4 tracking links?** Yes, it checks the URL UTM conventions commonly used with GA4 campaign tagging. It does not connect to GA4 or certify live conversion attribution.

**Does it handle Google Ads, Meta Ads, and email campaign links?** It works on complete HTTP(S) URLs exported from any source. It does not connect to ad platform accounts.

**How private is my campaign data?** The offline file processes pasted/imported URLs in your browser and contains no network integration.

**Can I refund or transfer the product?** Purchase, refund, and license terms will be shown in the final checkout documentation. Contact the merchant using the support information provided on the Stripe receipt.

## Search terms & related topics

UTM checker, bulk UTM audit, UTM parameter validator, GA4 campaign tagging, campaign URL checker, marketing link audit, Google Analytics UTM naming, tracking link quality assurance, paid media campaign QA, URL tracking consistency, advertising campaign reporting.

> **Launch status:** Product build and automated core tests completed. **Checkout is not yet linked here until the encrypted download and post-payment delivery have been verified.** Do not send money through unrelated Agentrix links.

**Agentrix** — tools for people who build.
