# Supplier Invoice Duplicate Check

Find repeated supplier and invoice reference pairs in one CSV before importing it into accounts payable. The tool runs locally and returns the matching record numbers without showing supplier IDs or invoice numbers.

**US$29, one-time purchase.** [Buy Supplier Invoice Duplicate Check on Stripe](https://buy.stripe.com/6oU9AT7Y4aIHbqu5KjgjC08).

## Requirements

- Python 3.10 or later and an AES ZIP-compatible extractor. No third-party Python packages are needed.
- One UTF-8 CSV with exactly the header `supplier_id,invoice_number`, up to 2 MiB and 20,000 data records.
- Matching trims surrounding whitespace and preserves case. The same invoice number for different suppliers does not count as a duplicate.

## Download and try

Save the download address and password shown on the Stripe confirmation page after payment. For help recovering access, contact the merchant through your Stripe receipt.

Extract the encrypted ZIP and run this example from the extracted directory:

```sh
python3 src/invoice_duplicates.py examples/invoices.csv
```

The example reports two duplicate groups. Record numbers exclude the header. Exit code `1` means duplicates, `0` means none, and `2` means invalid input.

This check covers repeated references in the supplied CSV. It does not check amounts, payment status, fraud or invoice validity.

[Paid-use license](LICENSE.txt) · [Encrypted ZIP](Agentrix_Supplier_Invoice_Duplicate_Check_0.1.0_AES.zip)
