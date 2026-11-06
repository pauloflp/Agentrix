# Refund Overpayment Audit

Find orders where the sum of refund records exceeds the amount paid. The tool compares two CSV exports locally, using integer cents, and reports the lines of affected orders without including order IDs or amounts in the output.

**R$79 BRL, one-time purchase.** [Buy Refund Overpayment Audit on Stripe](https://buy.stripe.com/5kQ28ra6c8Az1PU4GfgjC07).

## Requirements

- Python 3.10 or later and an AES ZIP-compatible extractor. No third-party Python packages are needed.
- Two UTF-8 CSV files. Orders require `order_id,paid_amount`. Refunds require `refund_id,order_id,refund_amount`.
- Amounts must be in BRL, without currency symbols or thousands separators, with a decimal period and exactly two decimal places. Each file can contain up to 50,000 data rows and 2 MiB.

## Download and try

Save the download address and password shown on the Stripe confirmation page after payment. For help recovering access, contact the merchant through your Stripe receipt.

Extract the encrypted ZIP and run this bundled example from the extracted directory:

```sh
python3 src/refund_audit.py examples/orders.csv examples/refunds.csv
```

The synthetic example reports one order on line 2 with cumulative refunds above the paid amount. Exit code `1` means findings, `0` means none, and `2` means invalid input.

This comparison covers the supplied exports. It does not check whether funds moved, connect to a bank or payment provider, or account for chargebacks, fees or settlement timing.

[Paid-use license](LICENSE.txt) · [Encrypted ZIP](Agentrix_Refund_Overpayment_Audit_0.1.0_AES.zip)
