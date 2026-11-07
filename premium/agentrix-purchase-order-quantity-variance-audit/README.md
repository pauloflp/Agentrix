# Purchase Order Quantity Variance Audit

Compare two CSV exports to spot short, excess, missing and unexpected receipts by purchase order and SKU.

**US$29, one-time purchase.** [Buy on Stripe](https://buy.stripe.com/9B6aEX7Y40431PUgoXgjC0a).

## Requirements

Python 3.10 or later and an extractor that supports AES ZIP. The tool runs locally and uses the Python standard library.

Two UTF-8 CSVs with exact headers `order_id,sku,ordered_qty` and `order_id,sku,received_qty`. Each file supports up to 2 MiB and 10,000 rows.

## Download and try

After payment, save the download address and password shown on the Stripe confirmation page. For help recovering access, contact the merchant through your Stripe receipt.

Extract the encrypted ZIP and run the bundled example:

```sh
python3 src/po_quantity_variance.py examples/orders.csv examples/received.csv
```

The sample reports four differences, covering shortages, excess quantities, missing receipts and unexpected receipts. Exit code `0` means no findings, `1` means findings, and `2` means invalid input.

## Scope

This comparison uses one line per order and SKU in each file. It cannot combine partial deliveries or establish that goods were delivered. Reports include order and SKU identifiers.

[Paid-use license](LICENSE.txt) · [Encrypted ZIP](Agentrix_Purchase_Order_Quantity_Variance_Audit_0.1.0_AES.zip)
