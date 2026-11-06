# Retail SKU Price Floor Audit

Find SKUs whose selling prices leave less gross margin than your target after the channel fee. The tool audits an exported CSV locally and reports the SKUs that fall below your threshold.

**R$79 BRL, one-time purchase.** [Buy on Stripe](https://buy.stripe.com/6oUfZhemsg3166a0pZgjC09).

## Requirements

- Python 3.10 or later and an extractor that supports AES ZIP. No third-party Python packages are needed.
- A UTF-8 CSV with exactly the header `sku,cost_minor,price_minor,fee_bps`, up to 2 MiB and 10,000 SKU rows.
- Use integer minor units from a single currency. For example, use 1000 for R$10.00. A fee of 500 basis points means 5%.

## Download and try

After payment, save the download address and password shown on the Stripe confirmation page. For help recovering access, contact the merchant through your Stripe receipt.

Extract the encrypted ZIP and run the bundled example:

```sh
python3 src/sku_price_floor.py examples/prices.csv --min-margin-pct 25
```

The example flags `SKU-BELOW`. A SKU exactly at the threshold passes. Exit code `1` means findings, `0` means none, and `2` means invalid input.

The tool checks gross margin after a single channel fee. Taxes, shipping, discounts, fixed costs and net profit are outside its scope. It does not suggest prices or connect to a store.

[Paid-use license](LICENSE.txt) · [Encrypted ZIP](Agentrix_Retail_SKU_Price_Floor_Audit_0.1.0_AES.zip)
