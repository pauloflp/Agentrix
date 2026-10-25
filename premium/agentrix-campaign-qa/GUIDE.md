# Campaign QA Pro workspace guide

**Release on hold. Purchases are unavailable while payment and delivery verification is completed.** These instructions describe the version 1.1 workspace and proposed buyer flow.

## Opening the workspace

Open [Campaign QA Pro](https://agentrix-campaign-qa.toastybard6.chatgpt.site/) in desktop Chrome. Paste your purchase key and select **Unlock the workspace**. A wrong key leaves the product locked. No app account or Node.js installation is required.

The supported workflow uses HTTPS. Internet access is needed to open or reload the tool. Offline file opening, mobile devices, and other browsers have not been verified for this release. Reloading clears the current campaign data and requires the key again.

## Auditing and exporting

1. Paste one complete HTTP(S) URL per line, or import a comma-delimited UTF-8 `.csv` file. UTF-8 BOM and Windows line endings are accepted.
2. Use a URL, Link, Destination, or Final URL column. Each nonempty record needs a destination URL and the same number of columns as the header. Quoted commas and multiline quoted cells are supported. Duplicate column names are rejected.
3. Use at most 1,000 destination URLs and 2 MiB of input per run. Split larger batches before importing.
4. Optionally enter comma-separated approved source, medium, or campaign values. Comparisons ignore case; capitalization drift is reported separately.
5. Run the audit and use **Issues only** to filter findings. **Export CSV report** includes the current audit results. Potential spreadsheet formulas are prefixed with an apostrophe for safer opening.

Changing URLs or naming rules invalidates the previous report. Invalid or oversized replacement files clear the old report and disable exports. Correct the input and run a new audit.

The score is an internal heuristic. The tool checks supplied URL syntax and naming conventions. It does not fetch destination pages, connect to advertising or analytics accounts, verify live conversions, or repair attribution.

## Purchase access and recovery

After sales are enabled and a payment succeeds, the proposed delivery page waits for server confirmation before providing the purchase key. Pending or failed payments do not grant access. Keep the key and paid invoice: the invoice contains the workspace address and key, so closing the confirmation page should not erase access instructions.

If a Stripe receipt link expires, follow [Stripe's email-based recovery prompt](https://docs.stripe.com/receipts#expired-receipt-urls). A previously saved invoice PDF and purchase key do not depend on that receipt link. If you cannot recover them, use the merchant contact details on your receipt. Never post purchase references, order emails, or keys in public issues.

The key is shared purchase access, not an individual online account or DRM system. Disclosing it can give another person access. Do not redistribute the key, unlocked app, or source. See [LICENSE.md](LICENSE.md). A one-time license does not include a promise of continuous maintenance or unlimited future upgrades.

## Privacy

Campaign URLs and CSV content stay in the audit tab. The audit has no external scripts, analytics, or campaign upload API. Stripe handles checkout and payment data. The delivery service stores a minimal paid-order reference for access verification; it does not store campaign data.
