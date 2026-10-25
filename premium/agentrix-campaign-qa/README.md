# Agentrix Campaign QA Pro — Bulk UTM Checker and Campaign URL Audit

<div align="center">
<img src="../../assets/agentrix-hero.svg" alt="Agentrix brand — Intelligence, put to work" width="900"/>
</div>

**Audit UTM campaign links in bulk, catch tracking inconsistencies before launch, and export actionable QA reports.** Agentrix Campaign QA Pro is a local browser workspace for marketers, paid media teams, performance agencies, and analytics professionals.

**[Buy Campaign QA Pro — US$29 one-time →](https://buy.stripe.com/9B69AT928eYX5264GfgjC01)** Proprietary license, no subscription. Desktop Chrome and internet access are required to open the workspace.

[View a sample campaign CSV](sample-campaigns.csv) · [Read the proposed commercial license](LICENSE.md) · [Workspace guide](GUIDE.md)

Version 1.1 uses an [encrypted workspace served over HTTPS](https://agentrix-campaign-qa.toastybard6.chatgpt.site/). A purchase key is required. Opening and auditing in the workspace have been verified in desktop Chrome. See the testing scope below for the remaining verification limit.

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
2. Paste up to **1,000 URLs** or import a comma-delimited UTF-8 CSV with a URL, Link, Destination, or Final URL column. The input and file limit is **2 MiB**. Every nonempty CSV record must have the same number of columns as its header and a nonempty destination URL. Duplicate column names are rejected.
3. Optionally configure approved UTM source, medium, and campaign names.
4. Run the audit. Review issues by URL and severity, then export a CSV quality-control report. Editing the input or naming rules invalidates the previous report, so exports always require a new audit.

The app runs **locally in your browser**. It does not upload your URLs to a server, query Google Analytics, test live landing-page availability, or promise to repair attribution. Its quality score is an explicitly documented internal heuristic, **not** a Google Analytics metric.

## Download and activation

The Pro edition is an **encrypted browser tool** with no Node.js installation or app account required. Use the HTTPS workspace in desktop Chrome. Internet access is required to open or reload the workspace; offline file opening and other browsers are not part of the verified supported workflow.

After payment, the delivery page waits for server confirmation before providing a key. Your paid invoice also retains the workspace address and key for recovery. See the [workspace guide](GUIDE.md) for limits and recovery details.

**Important:** The purchase key is shared and transferable if disclosed; it is not a per-user account or individual DRM. Keep it private. The public GitHub repository contains only a locked distribution file and public product documentation, **not** the unencrypted paid source.

## Free UTM Audit vs. paid Campaign QA Pro

| | [Free Agentrix UTM Audit](../../products/agentrix-utm-audit/) | Campaign QA Pro |
|---|---|---|
| User interface | Node.js CLI | Local browser workspace |
| Bulk URL checks | Yes | Yes |
| CSV import and reports | Consult free tool documentation | Yes |
| Custom naming allowlists | Consult free tool documentation | Yes |
| Installation | Node.js | Open HTTPS workspace in desktop Chrome |
| License | MIT | Proprietary, one-time purchase |

Existing [15 free agent skills](../../skills/) and [free microproducts](../../README.md#free-tools) remain free.

## Frequently asked questions

**Is Agentrix Campaign QA Pro a UTM generator?** It audits supplied campaign URLs; it is not a URL shortening service or full attribution platform.

**Does it work with GA4 tracking links?** Yes, it checks the URL UTM conventions commonly used with GA4 campaign tagging. It does not connect to GA4 or certify live conversion attribution.

**Does it handle Google Ads, Meta Ads, and email campaign links?** It works on complete HTTP(S) URLs exported from any source. It does not connect to ad platform accounts.

**How private is my campaign data?** The audit processes pasted/imported URLs in your browser. It does not transmit campaign data or contact destination websites. Hosting and checkout involve normal network requests; payment information is handled by Stripe. The audit source contains no analytics or external dependencies.

**Can I refund or transfer the product?** This is a proprietary [one-time-purchase license](LICENSE.md), not a subscription. Applicable statutory refund rights remain in force. For payment or key-recovery questions, contact the merchant via the details on the Stripe receipt. Do not post an order email, purchase reference, or unlock key in a public GitHub issue.

## Use cases: paid media QA, GA4 UTM validation, and bulk campaign link checking

Use this UTM parameter checker when reviewing tracking URLs for Google Ads, Meta Ads, email newsletters, social media, affiliate links, or GA4 reporting. Audit links before distribution, compare marketing campaign naming across channels, and export a practical campaign URL quality checklist for teammates.

**[Get Campaign QA Pro — US$29 one-time →](https://buy.stripe.com/9B69AT928eYX5264GfgjC01)**

*Testing and scope:* Version 1.1 passed 50 product tests on Node.js 24.22.1 and 21 delivery-handler tests. Desktop Chrome checks covered valid and invalid keys, CSV import/export, the 1,000-URL boundary, oversized and malformed CSV rejection, report invalidation, filtering, HTML input displayed as text, and spreadsheet-formula protection in downloaded CSV. A completed checkout, paid-invoice delivery, and recovery journey have not been verified end to end.

**Agentrix** — tools for people who build.
