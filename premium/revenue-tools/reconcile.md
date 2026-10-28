# Agentrix Revenue Reconcile | Find payment mismatches

**Know which expected payments need a closer look.** Compare what your business expected to receive with what its payment records show. Find missing receipts, duplicate records and amount or fee differences without checking every transaction manually.

**Example:** You export one list of expected sales from your business system and another list of received payments. Revenue Reconcile compares their transaction IDs and currency, then flags differences for review.

## What you get

- A review of expected receivables against settled receipts from **two CSV files**.
- Flags for unmatched receipts, duplicate records and amount or fee discrepancies.
- A local report in HTML, CSV or JSON format.
- Processing on your computer without uploading business records to Agentrix.

This tool **finds items to investigate**. It does not recover money, contact customers, alter accounting entries or connect directly to a bank, ERP or payment platform.

## Who it is for

Small businesses, finance teams, consultants and operators who can export payment records and want a more systematic review of discrepancies.

## Price and access

**US$149 USD, one-time purchase.** No subscription for this version.

**[Buy Revenue Reconcile securely on Stripe](https://buy.stripe.com/28EbJ17Y4g31gKOgoXgjC04)**

After purchase, the Stripe confirmation page is configured to show a password and download address. **Save that information before closing the page.** Email delivery of the password is not promised.

**[Download the encrypted Revenue Reconcile ZIP](Agentrix_Revenue_Reconcile_0.1.1_AES.zip)**. The archive needs the password from the purchase confirmation and an extractor that supports AES-encrypted ZIPs.

## Requirements and important limitations

- Requires **Python 3.10+**, a terminal and exported UTF-8, comma-delimited CSV files using the documented layout.
- Matches using exact transaction IDs and currencies. Split payments and imperfect identifiers require manual review; there is no approximate matching.
- Supports BRL, USD, EUR, GBP, CAD and AUD separately, without currency conversion.
- File limit: 10 MiB and 100,000 records per file.
- Not an accounting service or a guarantee of recovered revenue.

Software and archive tests passed on Linux with Python 3.12. **A complete real-money checkout and delivery was not verified end to end.**

[Full technical instructions, verification and support](README.md) · [Paid-use license](LICENSE.txt) · [All Agentrix products](../../README.md)
