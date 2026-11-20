# Hreflang Reciprocal CSV Check 1.0.0

Find localized pages with a missing return link. The sample identifies a French page whose return declaration is absent. The program reads an existing CSV file on your computer with Python 3.10 or later.

[Download the free ZIP](https://github.com/pauloflp/Agentrix/releases/download/hreflang-reciprocal-csv-check-v1.0.0/agentrix-csv-checks-v1.0.0.zip) · [Versioned backup download](https://github.com/pauloflp/Agentrix/raw/refs/tags/hreflang-reciprocal-csv-check-v1.0.0/products/agentrix-csv-checks/downloads/agentrix-csv-checks-v1.0.0.zip) · [Input columns and limitations](https://github.com/pauloflp/Agentrix/blob/main/products/agentrix-csv-checks/README.md#hreflang-reciprocal-csv-check)

After extracting the ZIP, run:

```sh
python3 check.py hreflang examples/hreflang.csv
```

The sample exits with code 1 because it contains a finding. The download includes the three CSV checks, their examples, tests and the MIT license. SHA-256 for the ZIP is `2aa6d57373affd017b7094dcc9bd85e047a49bdfa968b5a710a82607a6fd85f2`.
