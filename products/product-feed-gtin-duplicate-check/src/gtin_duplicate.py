#!/usr/bin/env python3
"""Check whether different product SKUs share a GTIN in a local CSV feed."""

import argparse
import csv
import io
import json
from pathlib import Path
import sys

MAX_BYTES = 2 * 1024 * 1024
MAX_ROWS = 10_000
GTIN_LENGTHS = frozenset((8, 12, 13, 14))


class InputError(Exception):
    """Invalid or unsupported feed input."""


def check(path: Path) -> dict:
    try:
        with path.open("rb") as stream:
            raw = stream.read(MAX_BYTES + 1)
    except (OSError, ValueError) as exc:
        raise InputError("Cannot read input CSV") from exc

    if len(raw) > MAX_BYTES:
        raise InputError("CSV exceeds 2 MiB")
    try:
        text = raw.decode("utf-8", errors="strict")
    except UnicodeDecodeError as exc:
        raise InputError("CSV must be UTF-8") from exc

    reader = csv.reader(io.StringIO(text, newline=""), strict=True)
    try:
        header = next(reader, None)
        if header != ["sku", "gtin"]:
            raise InputError("Expected exactly sku,gtin header")
        sku_seen = set()
        by_gtin = {}
        count = 0
        for row in reader:
            count += 1
            if count > MAX_ROWS:
                raise InputError("CSV exceeds 10,000 data rows")
            if len(row) != 2:
                raise InputError("Each data row must contain exactly two fields")
            sku, gtin = row
            if not sku.strip() or any(ord(c) < 32 or ord(c) == 127 for c in sku):
                raise InputError("SKU must be nonempty and contain no control characters")
            if sku in sku_seen:
                raise InputError("Each SKU must appear once")
            sku_seen.add(sku)
            if len(gtin) not in GTIN_LENGTHS or not all("0" <= ch <= "9" for ch in gtin):
                raise InputError("GTIN must contain 8, 12, 13, or 14 ASCII digits")
            by_gtin.setdefault(gtin, []).append(sku)
    except (csv.Error, UnicodeError) as exc:
        raise InputError("Malformed CSV") from exc

    groups = [
        {"gtin": gtin, "skus": sorted(skus)}
        for gtin, skus in sorted(by_gtin.items())
        if len(skus) > 1
    ]
    return {"duplicate_groups": groups, "duplicate_group_count": len(groups)}


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Find GTINs assigned to different SKUs in a local CSV product feed.")
    parser.add_argument("csv_file", type=Path, help="UTF-8 CSV with exactly sku,gtin columns")
    args = parser.parse_args(argv)
    try:
        result = check(args.csv_file)
    except InputError as exc:
        print(f"Input error: {exc}", file=sys.stderr)
        return 2
    print(json.dumps(result, ensure_ascii=True, sort_keys=True, separators=(",", ":")))
    return 1 if result["duplicate_group_count"] else 0


if __name__ == "__main__":
    sys.exit(main())
