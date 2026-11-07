# Coupon Redemption Cap Check

Compare coupon policies with exported redemptions and flag policy rows whose usage exceeds the configured cap. The report excludes coupon codes and order IDs.

**R$79, one-time purchase.** [Buy on Stripe](https://buy.stripe.com/8x26oH7Y43gf9imdcLgjC0d).

## Requirements

Python 3.10 or later and an extractor that supports AES ZIP. The tool runs locally and uses the Python standard library.

Two UTF-8 CSVs without a BOM. Policies require `coupon_code,max_redemptions`, and redemptions require `coupon_code,order_id`. Each file supports up to 2 MiB and 50,000 rows.

## Download and try

After payment, save the download address and password shown on the Stripe confirmation page. For help recovering access, contact the merchant through your Stripe receipt.

Extract the encrypted ZIP and run the bundled example:

```sh
python3 src/coupon_cap.py examples/policies.csv examples/redemptions.csv
```

The sample flags policy line 2, where three orders used a coupon capped at two redemptions. Exit code `0` means no findings, `1` means findings, and `2` means invalid input.

## Scope

Each unique coupon and order pair counts once. The tool does not verify payments, order validity or promotional eligibility.

[Paid-use license](LICENSE.txt) · [Encrypted ZIP](Agentrix_Coupon_Redemption_Cap_Check_0.1.0_AES.zip)
