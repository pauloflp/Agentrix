# Invoice Date Order Check

Check an invoice CSV for due dates that precede issue dates. The result contains physical CSV line numbers and counts, with invoice identifiers and dates omitted.

**US$19, one-time purchase.** [Buy on Stripe](https://buy.stripe.com/dRm4gz4LS8Az0LQ1u3gjC0e).

## Requirements

Python 3.10 or later and an extractor that supports AES ZIP. The tool runs locally and uses the Python standard library.

One UTF-8 CSV without a BOM, with unique `invoice_id`, `issue_date` and `due_date` headers. Dates use `YYYY-MM-DD`. Up to 2 MiB and 50,000 rows.

## Download and try

After payment, save the download address and password shown on the Stripe confirmation page. For help recovering access, contact the merchant through your Stripe receipt.

Extract the encrypted ZIP and run the bundled example:

```sh
python3 src/invoice_dates.py examples/invoices.csv
```

The sample flags physical invoice line 3. Exit code `0` means no findings, `1` means findings, and `2` means invalid input.

## Scope

The check covers date order in the supplied export. It does not validate taxes, invoice authenticity, payment status or contractual terms.

[Paid-use license](LICENSE.txt) · [Encrypted ZIP](Agentrix_Invoice_Date_Order_Check_0.1.0_AES.zip)
