# Agentrix Campaign QA Pro — Bulk UTM Checker and Campaign URL Audit

<div align="center">
<img src="../../assets/agentrix-hero.svg" alt="Agentrix brand — Intelligence, put to work" width="900"/>
</div>

**Audit UTM campaign links in bulk, catch tracking inconsistencies before launch, and export actionable QA reports.** Agentrix Campaign QA Pro is an offline, browser-based tool for marketers, paid media teams, performance agencies, and analytics professionals.

**Status: release on hold. Not available to purchase.** The checkout is disabled until product functionality, activation, and customer delivery are verified.

[View a sample campaign CSV](sample-campaigns.csv) · [Read the proposed commercial license](LICENSE.md)

The intended distribution uses an encrypted offline HTML file with an unlock key presented on the Stripe confirmation page. This checkout and fulfillment journey has not passed end-to-end release verification, so purchases are disabled.

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

The planned Pro edition is a self-contained **encrypted HTML tool** (no Node.js installation, account, or runtime subscription needed). Product use, offline unlocking, compatible browsers, and the complete payment-to-delivery experience must pass customer-style tests before the checkout will be re-enabled.

**Important:** The future offline unlock key may be transferable if shared, so it is not a per-user online activation system. The public GitHub repository contains only a locked distribution file and public marketing materials, **not** the unencrypted paid source. Do not attempt purchases using a previously saved payment link while this release is on hold.

## Free UTM Audit vs. paid Campaign QA Pro

| | [Free Agentrix UTM Audit](../../products/agentrix-utm-audit/) | Campaign QA Pro |
|---|---|---|
| User interface | Node.js CLI | Local browser workspace |
| Bulk URL checks | Yes | Yes |
| CSV import and reports | Consult free tool documentation | Yes |
| Custom naming allowlists | Consult free tool documentation | Yes |
| Installation | Node.js | Open one HTML file |
| License | MIT | Proprietary, one-time purchase |

Existing [15 free agent skills](../../skills/) and [free microproducts](../../README.md#free-tools) remain free.

## Frequently asked questions

**Is Agentrix Campaign QA Pro a UTM generator?** It audits supplied campaign URLs; it is not a URL shortening service or full attribution platform.

**Does it work with GA4 tracking links?** Yes, it checks the URL UTM conventions commonly used with GA4 campaign tagging. It does not connect to GA4 or certify live conversion attribution.

**Does it handle Google Ads, Meta Ads, and email campaign links?** It works on complete HTTP(S) URLs exported from any source. It does not connect to ad platform accounts.

**How private is my campaign data?** The offline file processes pasted/imported URLs in your browser and contains no network integration.

**Can I refund or transfer the product?** This is a proprietary [one-time-purchase offline license](LICENSE.md), not a subscription. Applicable statutory refund rights remain in force. For payment or key-recovery questions, contact the merchant via the details on the Stripe receipt. Do not post an order email or unlock key in a public GitHub issue.

## Use cases: paid media QA, GA4 UTM validation, and bulk campaign link checking

Use this UTM parameter checker when reviewing tracking URLs for Google Ads, Meta Ads, email newsletters, social media, affiliate links, or GA4 reporting. Audit links before distribution, compare marketing campaign naming across channels, and export a practical campaign URL quality checklist for teammates.

**Purchases are currently disabled while release verification is completed.**

*Testing and scope:* 20 automated engine tests passed locally on Node.js 22. The encrypted file was verified against the original generated build. A full customer-style activation and successful live payment fulfillment have not been validated, and checkout remains disabled. No sale is offered.

**Agentrix** — tools for people who build.
