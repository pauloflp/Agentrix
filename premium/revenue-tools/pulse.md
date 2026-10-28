# Agentrix Revenue Pulse | Understand recurring revenue

**See whether subscription revenue is growing or shrinking, and which invoices need attention.** Turn exported subscription and payment records into an understandable view of recurring revenue, cancellations and overdue balances.

**Example:** At the end of the month, you export your subscription history, invoices and recorded payments. Revenue Pulse uses them to calculate revenue movements and identify outstanding invoices for review.

## What you get

- Monthly recurring revenue (MRR) and its movements over time.
- Churn and retention calculations using the supplied subscription history.
- Outstanding and overdue invoices, including how long balances have been open.
- Reports in local HTML, CSV or JSON formats.
- Processing on your computer without uploading financial records to Agentrix.

This is an **analysis tool**, not a hosted financial dashboard. It does not collect overdue payments, connect to an ERP or payment processor or automatically reconcile bank accounts.

## Who it is for

SaaS operators, subscription businesses, finance teams and consultants who already have complete, consistently formatted subscription and payment exports.

## Price and access

**R$99 BRL, one-time purchase.** No subscription for this version.

**[Buy Revenue Pulse securely on Stripe](https://buy.stripe.com/7sYaEX3HO9ED7aeegPgjC03)**

The Stripe confirmation page is configured to show a download address and the password needed to open the ZIP. **Save the password on that page.** Automatic email delivery of the password is not promised.

**[Download the encrypted Revenue Pulse ZIP](Agentrix_Revenue_Pulse_0.1.1_AES.zip)**. You will need the purchase password and an extractor that supports AES-encrypted ZIPs.

## Requirements and important limitations

- Requires **Python 3.10+**, a terminal and **three CSV files**: subscription events, invoices and separate payments.
- Requires a complete, normalized event history. It does not support prorations, discounts, taxes, refunds, credit notes or usage-based billing.
- Supports BRL, USD, EUR, GBP, CAD and AUD separately, without exchange-rate conversion.
- File limit: 10 MiB and 100,000 records per file.
- Results support human review; they are not accounting advice or a guarantee of improved revenue.

Software and archive tests passed on Linux with Python 3.12. **A complete real-money checkout and delivery was not verified end to end.**

[Full technical instructions, verification and support](README.md) · [Paid-use license](LICENSE.txt) · [All Agentrix products](../../README.md)
