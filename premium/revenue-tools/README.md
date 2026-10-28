# Agentrix Revenue Tools

**Revenue Reconcile:** Compare what a business expected to receive with the payments recorded as received. Spot missing receipts, duplicates and amount differences for review.

**Revenue Pulse:** Understand how subscription revenue changes over time. Review monthly recurring revenue, cancellations and overdue invoices from exported records.

**Example:** Export the required CSV files from your existing systems, run the relevant tool locally and review its report. Neither product automatically connects to an ERP, bank or payment provider.

Two paid, local Python tools for reviewing financial CSVs. **Python 3.10+ and a terminal are required.** These are not hosted dashboards and do not connect automatically to banks, Stripe or an ERP. Runtime dependencies: Python standard library only.

| Product | What it does | One-time price | Purchase |
| --- | --- | --- | --- |
| Revenue Reconcile 0.1.1 | Compares expected receivables and settled receipts; flags missing receipts, duplicates and amount/fee differences | R$149 BRL | [Buy Reconcile](https://buy.stripe.com/14AdR91zG9EDamqc8HgjC02) |
| Revenue Pulse 0.1.1 | Calculates recurring revenue movements, churn and invoice arrears from subscription events, invoices and payments | R$99 BRL | [Buy Pulse](https://buy.stripe.com/7sYaEX3HO9ED7aeegPgjC03) |

Each purchase includes that product's Python source, documentation, fictional CSV examples, sample HTML report and tests. The [paid license](LICENSE.txt) covers internal personal or commercial use by one person or organization, including reports prepared for clients. No subscription is needed for this version. Future upgrades and custom integration are not included.

## Download and unlock

1. Download the encrypted ZIP for the product you want. Downloading it is free; a purchase is required for its password.
2. Pay through the corresponding Stripe link above. **The Stripe confirmation page displays your password and download address. Save the password before closing the page.** Delivery is on that page; password delivery by email is not promised.
3. Extract with an application supporting AES-encrypted ZIPs, such as 7-Zip. Some operating systems' built-in ZIP extractors do not support AES. Enter the password when requested.
4. Open a terminal in the extracted folder. Follow README.md and first run the included fictional examples. Use `python3` if your system uses that command instead of `python`.

| Package | Public encrypted download | SHA-256 |
| --- | --- | --- |
| Reconcile | [Download ZIP](https://github.com/pauloflp/Agentrix/raw/afc8a0b7c0bf9958aa09697e0cb1c334bcaa10cd/premium/revenue-tools/Agentrix_Revenue_Reconcile_0.1.1_AES.zip) | `aecddf276a6857061b53e4f4561bf8d8bcf7f25823326bdda86952a2e35c535f` |
| Pulse | [Download ZIP](https://github.com/pauloflp/Agentrix/raw/afc8a0b7c0bf9958aa09697e0cb1c334bcaa10cd/premium/revenue-tools/Agentrix_Revenue_Pulse_0.1.1_AES.zip) | `5da9d135dc5f65e805621c173d1c6ba4d292c72c5ece02636af9409c68555541` |

The ZIP uses AES-256 encryption. Passwords are shared per product version, not a DRM system or a per-buyer license server. Do not redistribute the software or password. Keep your receipt for purchase support; never post payment details or passwords publicly.

## Inputs, outputs and limits

**Reconcile:** two CSVs, expected receivables and received payments. Matching uses exact transaction ID and currency. Split payments require review; there is no fuzzy matching, bank feed, accounting posting or collection automation.

**Pulse:** three CSVs, complete subscription event history, issued invoices and distinct payments. Computes MRR movement, retention, churn, outstanding/overdue balances and aging. Requires normalized complete history. Does not support prorations, discounts/taxes, refunds, credit notes or usage billing.

Both require UTF-8 comma-delimited CSVs matching the documented schemas. Amounts use integer minor currency units, never floating point. Supported currencies: BRL, USD, EUR, GBP, CAD and AUD; totals are separate by currency, with no exchange-rate conversion. Maximum input: 10 MiB and 100,000 records per file. Outputs: JSON, local HTML or CSV. Existing output files are not overwritten.

Processing happens locally without telemetry or network calls. You remain responsible for authorized data access and protecting input/output files. These tools support human review; outputs are not accounting advice, guaranteed recovered revenue or automated decisions.

## Verification and support

Release validation: 70 source tests passed; extracted Reconcile passed 29 product tests and Pulse passed 24. Both extracted demo commands passed. Missing/incorrect passwords were rejected and extracted file hashes matched. Each archive contains only its purchased product. See [verification.json](verification.json).

Verified on Linux with Python 3.12. Checkout configuration was read back from Stripe in live mode with quantity 1 and the stated BRL amounts. An end-to-end paid transaction has not been performed. Payment methods are limited to cards for this immediate confirmation delivery flow.

Report reproducible software problems through [Agentrix issues](https://github.com/pauloflp/Agentrix/issues), using fictional/sanitized examples. For purchase or missing-password help, use the merchant contact available in Stripe checkout/your receipt. No support response time is promised. Do not post private financial data or payment credentials in public issues.
