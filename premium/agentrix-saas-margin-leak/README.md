# SaaS Margin Leak

Find customers and plans where API, infrastructure, support, payment fees or refunds consume too much of the billed revenue.

SaaS Margin Leak reads a monthly CSV with one row per customer and plan. It computes contribution margin, flags negative and below-threshold rows and summarizes results by plan. Review the results in a terminal or export CSV or JSON. The tool runs locally with no external dependencies.

**US$49 USD, one-time purchase.** [Buy SaaS Margin Leak on Stripe](https://buy.stripe.com/3cI28r6U01871PU7SrgjC06).

## What you need

- Node.js 20 or later and an extractor that supports AES-encrypted ZIP files.
- One UTF-8 CSV per month with pseudonymous customer and plan IDs, a single currency, billed revenue and allocated costs. The download includes the format and synthetic examples.
- Costs must be allocated in your source data. The tool does not estimate costs, calculate net profit or connect to accounting systems.

## Download and run

The Stripe confirmation page displays the download address and password after payment. Save both before closing the page. For purchase support, use the merchant contact in your Stripe receipt.

Open the encrypted archive and try the bundled example from its root:

```sh
node src/cli.js --input fixtures/sample.csv --threshold 20 --format table
```

The synthetic example reports two alerts. Exit code `1` means an alert, `0` means no alerts, and `2` means invalid input or options. Use the tool for review of attributed contribution margin.

[Paid-use license](LICENSE.txt) · [Encrypted download](Agentrix_SaaS_Margin_Leak_0.1.0_AES.zip)
