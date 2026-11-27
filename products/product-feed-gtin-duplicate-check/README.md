# Product Feed GTIN Duplicate Check

Find GTINs assigned to several SKUs in a product-feed CSV before import. This free Python command-line tool reads the file locally and returns duplicate groups as deterministic JSON.

## Download and run

Requires Python 3.10 or later. Uses the Python standard library.

Download [product-feed-gtin-duplicate-check-v0.1.0.zip](https://github.com/pauloflp/Agentrix/releases/download/product-feed-gtin-duplicate-check-v0.1.0/product-feed-gtin-duplicate-check-v0.1.0.zip), extract it and open a terminal in the extracted folder. On Windows, `py -3` can replace `python3`.

```sh
python3 src/gtin_duplicate.py examples/products.csv
```

The included synthetic feed assigns `00012345678905` to SKU-A, SKU-C and SKU-D. The command returns exit code `1` and the following report.

```json
{"duplicate_group_count":1,"duplicate_groups":[{"gtin":"00012345678905","skus":["SKU-A","SKU-C","SKU-D"]}]}
```

For your own feed, run `python3 src/gtin_duplicate.py /path/to/products.csv`.

## CSV format

Use UTF-8 with exactly two columns in this order.

```csv
sku,gtin
SKU-A,00012345678905
SKU-B,12345678
SKU-C,00012345678905
```

Each SKU must be nonempty, unique and free of control characters. GTINs must contain 8, 12, 13 or 14 ASCII digits. Leading zeros are preserved. Files can contain up to 2 MiB and 10,000 data rows.

## Read the result

| Exit code | Meaning |
| --- | --- |
| `0` | Valid input with zero shared GTINs |
| `1` | One or more GTINs are assigned to multiple SKUs |
| `2` | Invalid input or an exceeded limit, with an error on stderr |

Groups are sorted by GTIN and their SKUs are sorted. Review flagged groups before changing records because legitimate variants may share an identifier. GTIN format validation covers length and ASCII digits. A correctly formatted value may still have an invalid check digit. Marketplace acceptance and identifier ownership require separate checks.

The report includes identifiers from flagged groups, so store logs with the same care as the source feed. All processing happens on the local machine and the CSV is preserved.

## Tests and license

```sh
python3 -m unittest discover -s tests -v
```

The 30 subprocess tests cover duplicates, deterministic ordering, malformed CSV, input limits and preservation of source data. Free under the [MIT license](LICENSE). [Release notes](https://github.com/pauloflp/Agentrix/releases/tag/product-feed-gtin-duplicate-check-v0.1.0).
