# Product Feed GTIN Duplicate Check 0.1.0

Find GTINs assigned to multiple SKUs in a product-feed CSV before import. Free under MIT, for Python 3.10 and later.

## Download and try it

[Download the standalone ZIP](https://github.com/pauloflp/Agentrix/releases/download/product-feed-gtin-duplicate-check-v0.1.0/product-feed-gtin-duplicate-check-v0.1.0.zip), extract it and run the included synthetic example.

```sh
python3 src/gtin_duplicate.py examples/products.csv
```

The example reports GTIN `00012345678905` assigned to SKU-A, SKU-C and SKU-D and exits with code `1`. Exit `0` means zero shared GTINs. Exit `2` identifies invalid input.

The package contains the CLI, example, documentation, MIT license and 30 subprocess tests. Processing happens locally. Input is limited to 2 MiB and 10,000 rows with exactly `sku,gtin` columns. Format validation covers ASCII digits and identifier length. Review flagged groups and validate check digits separately before editing the feed.

ZIP SHA-256 `a9d86fab71fa8848398d45595c56467971c3f043d1145102ddee69c510d5cb57`.

[Read the guide](https://github.com/pauloflp/Agentrix/tree/main/products/product-feed-gtin-duplicate-check) · [Browse free tools](https://github.com/pauloflp/Agentrix#free-tools).
