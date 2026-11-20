# SPF Policy Multiplicity Audit 1.0.0

Find DNS owners with multiple distinct SPF records in a TXT export. The sample reports the two records for example.org with their CSV line numbers. The program reads an existing CSV file on your computer with Python 3.10 or later.

[Download the free ZIP](https://github.com/pauloflp/Agentrix/releases/download/spf-policy-multiplicity-audit-v1.0.0/agentrix-csv-checks-v1.0.0.zip) · [Versioned backup download](https://github.com/pauloflp/Agentrix/raw/refs/tags/spf-policy-multiplicity-audit-v1.0.0/products/agentrix-csv-checks/downloads/agentrix-csv-checks-v1.0.0.zip) · [Input columns and limitations](https://github.com/pauloflp/Agentrix/blob/main/products/agentrix-csv-checks/README.md#spf-policy-multiplicity-audit)

After extracting the ZIP, run:

```sh
python3 check.py spf examples/spf.csv
```

The sample exits with code 1 because it contains a finding. The download includes the three CSV checks, their examples, tests and the MIT license. SHA-256 for the ZIP is `2aa6d57373affd017b7094dcc9bd85e047a49bdfa968b5a710a82607a6fd85f2`.
