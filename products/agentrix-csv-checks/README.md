# Three offline CSV checks

Run any check with Python 3.10 or later. Everything runs on your computer using the Python standard library. The download includes the program, examples, tests and MIT license.

[Download version 1.0.0 (ZIP)](https://github.com/pauloflp/Agentrix/raw/refs/tags/hreflang-reciprocal-csv-check-v1.0.0/products/agentrix-csv-checks/downloads/agentrix-csv-checks-v1.0.0.zip)

Unzip the download, open a terminal in the extracted directory and run one of the commands below. On Windows, you can use `py -3` in place of `python3`.

## Hreflang Reciprocal CSV Check

Use a CSV export of localized page links to find a page that points to a translation without a matching return link. Include four columns named `source_url,source_lang,target_url,target_lang`. Each row represents one declaration. The return row must reverse both the URLs and the languages.

```sh
python3 check.py hreflang examples/hreflang.csv
```

The example returns `missing-return-link` on line 4. The French page is missing its return row. An incomplete export can produce the same result. Languages are matched without case sensitivity. The comparison preserves path case, trailing slashes and query strings, and normalizes scheme, host and default port. Use absolute HTTP(S) URLs without fragments or credentials. The check reads your export locally. It does not crawl pages, follow redirects, validate every language tag or check search engine indexing. [Google's guidance for localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)

## CSV Timestamp Timezone Check

Use this before joining event exports from systems in different time zones. The default column is `timestamp`. Pass `--column created_at` for an export using that name.

```sh
python3 check.py timestamps examples/timestamps.csv
```

The example flags a timestamp without an offset on line 3 and an explicitly unknown offset (`-00:00`) on line 4. Valid examples include `2026-11-01T09:00:00Z` and `2026-11-01T09:00:00.123456789-03:00`. The check accepts four-digit years starting at 0001, valid calendar dates, seconds, optional decimal fractions, and a numeric offset or Z. It flags missing and invalid values separately. Leap seconds, named time zones, date-only values and daylight-saving rules are outside its scope. [RFC 3339, sections 4.3 and 5.6](https://www.rfc-editor.org/rfc/rfc3339#section-5.6)

## SPF Policy Multiplicity Audit

Use an exported DNS record inventory to list owners that publish multiple distinct SPF TXT records. Include `domain,type,value`. Supply one complete logical TXT value per row. Join any chunks belonging to the same record first and remove DNS presentation quotes. CSV quoting still applies normally.

```sh
python3 check.py spf examples/spf.csv
```

The example reports `example.org` with two different SPF records on lines 2 and 3. Exact repeated TXT values for one owner count once. Other record types and unrelated TXT values are ignored. The check covers record multiplicity. It makes no DNS requests and does not evaluate senders, SPF mechanisms, or missing policies. [RFC 7208, section 4.5](https://www.rfc-editor.org/rfc/rfc7208#section-4.5)

## Output and limits

Each successful read prints JSON with the check name, number of input rows and ordered findings. A finding's `line` is the physical line where the CSV record ends, including embedded newlines in quoted fields. Hreflang and timestamp reports omit cell contents. SPF names the owner with multiple policies and identifies its source lines.

| Exit | Meaning |
| --- | --- |
| 0 | Complete report with no findings |
| 1 | Complete report with findings to review |
| 2 | Invalid command, unreadable file or malformed CSV. Diagnostics go to standard error. |

CSV files must be comma-separated UTF-8, with an optional byte-order mark, unique nonempty headers and a consistent column count. Extra columns are allowed. Blank lines are skipped. Maximum size is 8 MiB and 50,000 data records. A file containing only a valid header has zero records to check.

Run the tests with `python3 -m unittest discover -s tests -v`. [MIT license](LICENSE)
