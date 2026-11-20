# Inventory Lot Expiration Check

Find expired lots and lots approaching a chosen date in a stock export. The tool runs locally with Python 3.10 or later and uses no external packages.

**Included with Retail SKU Price Floor Audit for R$79, paid once.** Existing buyers can unlock this ZIP with the password from their retail purchase. New buyers receive access to both tools through the same checkout.

[Download the encrypted inventory tool](https://raw.githubusercontent.com/pauloflp/Agentrix/inventory-lot-expiration-check-v0.1.0/premium/agentrix-retail-sku-price-floor-audit/Agentrix_Inventory_Lot_Expiration_Check_0.1.0_AES.zip) · [Buy the retail tools](https://buy.stripe.com/6oUfZhemsg3166a0pZgjC09) · [What the pricing tool checks](README.md)

## Run the example

Open the ZIP with a program that supports AES-256 archives. Extract it into its own folder, open a terminal there and run:

```sh
python3 src/lot_expiration.py examples/lots.csv --as-of 2026-10-31 --warn-days 30
```

The example reports three lots. LOT-A expired the day before the reference date, LOT-B expires on that date and LOT-C expires within 30 days. A later lot stays out of the report.

## Use your own export

Use a UTF-8 CSV with the exact header below. The SKU and lot together identify each row. Supply the reference date explicitly to make repeat runs reproducible.

```csv
sku,lot_id,expires_on,quantity
TEA-01,LOT-A,2026-10-30,20
```

Set `--warn-days` from 0 to 365. The default is 30. Dates use YYYY-MM-DD. Quantities must be nonnegative whole units up to one billion. The checker reads up to 10,000 data rows and 2 MiB. It prints JSON sorted by SKU and lot, and exits with 0 for no alerts, 1 for alerts and 2 for invalid input.

Use the results to review dates with your stock team. The tool does not assess product safety or decide whether goods can be sold or discarded. It is unsuitable for medication inventory. It works from a local export and makes no changes to stock records.

[Paid-use license](LICENSE.txt) · [Version 0.1.0 release](https://github.com/pauloflp/Agentrix/releases/tag/inventory-lot-expiration-check-v0.1.0)

SHA-256 for the encrypted ZIP: `e2e10aa6cc26b92f26a99baf472e2a6eb9afeffffcbc19b5e2292249513dcbf7`.
