# Invoice Line Arithmetic Check

Check whether each invoice line total equals quantity multiplied by unit price. The tool reports physical lines with discrepancies and keeps invoice identifiers and amounts out of the result.

**US$19, one-time purchase.** [Buy on Stripe](https://buy.stripe.com/8x24gz6U06sr526goXgjC0b).

## Requirements

Python 3.10 or later and an extractor that supports AES ZIP. The tool runs locally and uses the Python standard library.

One UTF-8 CSV without a BOM containing `invoice_id`, `line_id`, `quantity`, `unit_price_cents` and `line_total_cents`. Use integer quantities and cents. Up to 2 MiB and 50,000 rows.

## Download and try

After payment, save the download address and password shown on the Stripe confirmation page. For help recovering access, contact the merchant through your Stripe receipt.

Extract the encrypted ZIP and run the bundled example:

```sh
python3 src/invoice_line_check.py examples/invoices.csv
```

The sample flags physical line 3, and the bundled clean example returns no findings. Exit code `0` means no findings, `1` means findings, and `2` means invalid input.

## Scope

The tool checks integer multiplication on exported data. It does not account for taxes, discounts, rounding, returns or fractional quantities.

[Paid-use license](LICENSE.txt) · [Encrypted ZIP](Agentrix_Invoice_Line_Arithmetic_Check_0.1.0_AES.zip)
