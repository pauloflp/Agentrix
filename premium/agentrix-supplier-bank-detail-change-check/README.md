# Supplier Bank Detail Change Check

Compare two local supplier CSV snapshots and flag rows where the bank-account field changed. The report shows line numbers rather than bank details.

**US$29, one-time purchase.** [Buy on Stripe](https://buy.stripe.com/cNi3cv5PW6srgKOfkTgjC0c).

## Requirements

Python 3.10 or later and an extractor that supports AES ZIP. The tool runs locally and uses the Python standard library.

Two UTF-8 CSVs without a BOM, oldest first, each with unique `supplier_id` and `bank_account` headers. Each file supports up to 2 MiB and 50,000 records.

## Download and try

After payment, save the download address and password shown on the Stripe confirmation page. For help recovering access, contact the merchant through your Stripe receipt.

Extract the encrypted ZIP and run the bundled example:

```sh
python3 src/bank_change.py examples/previous.csv examples/current.csv
```

The sample flags physical line 3 of the current file. Exit code `0` means no findings, `1` means findings, and `2` means invalid input.

## Scope

Only suppliers present in both files are compared. The tool does not validate account details, determine fraud or authorize payments. Verify changes independently before payment.

[Paid-use license](LICENSE.txt) · [Encrypted ZIP](Agentrix_Supplier_Bank_Detail_Change_Check_0.1.0_AES.zip)
