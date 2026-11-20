"""Three offline CSV checks. Run with Python 3.10 or later."""
import argparse
import csv
import io
import json
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from urllib.parse import urlsplit

MAX_BYTES = 8 * 1024 * 1024
MAX_ROWS = 50000
TIMESTAMP = re.compile(
    r"([0-9]{4}-[0-9]{2}-[0-9]{2})[Tt]([0-9]{2}:[0-9]{2}:[0-9]{2})"
    r"(?:\.[0-9]+)?([Zz]|[+-][0-9]{2}:[0-9]{2})?"
)
LANG = re.compile(r"[a-z]{1,8}(?:-[a-z0-9]{1,8})*", re.ASCII | re.I)
LABEL = re.compile(r"[a-z0-9_](?:[a-z0-9_-]{0,61}[a-z0-9_])?", re.ASCII | re.I)


def read_rows(path, needed):
    with path.open("rb") as stream:
        payload = stream.read(MAX_BYTES + 1)
    if len(payload) > MAX_BYTES:
        raise ValueError("CSV exceeds 8 MiB")
    csv.field_size_limit(MAX_BYTES)
    reader = csv.reader(io.StringIO(payload.decode("utf-8-sig"), newline=""), strict=True)
    fields = next(reader, [])
    if not fields or any(not f for f in fields) or len(set(fields)) != len(fields):
        raise ValueError("CSV needs a header with unique, nonempty names")
    missing = sorted(set(needed) - set(fields))
    if missing:
        raise ValueError("missing column(s): " + ", ".join(missing))
    rows = []
    indices = [fields.index(name) for name in needed]
    for record in reader:
        if not record:
            continue
        if len(record) != len(fields):
            raise ValueError(f"record ending on line {reader.line_num} has the wrong column count")
        if len(rows) >= MAX_ROWS:
            raise ValueError("CSV exceeds 50000 data records")
        rows.append((reader.line_num, tuple(record[i] for i in indices)))
    return rows


def timestamps(rows):
    for line, (value,) in rows:
        match = TIMESTAMP.fullmatch(value)
        if not match:
            yield {"line": line, "issue": "empty-timestamp" if value == "" else "invalid-timestamp"}
            continue
        day, clock, offset = match.groups()
        try:
            datetime.strptime(f"{day}T{clock}", "%Y-%m-%dT%H:%M:%S")
        except ValueError:
            yield {"line": line, "issue": "invalid-timestamp"}
            continue
        if offset is None:
            yield {"line": line, "issue": "missing-offset"}
        elif offset == "-00:00":
            yield {"line": line, "issue": "unknown-offset"}
        elif len(offset) > 1 and (int(offset[1:3]) > 23 or int(offset[4:6]) > 59):
            yield {"line": line, "issue": "invalid-offset"}


def url_key(value):
    if not value or any(ch.isspace() or ord(ch) < 32 or ord(ch) == 127 for ch in value):
        raise ValueError("empty URL or whitespace/control character")
    url = urlsplit(value)
    if url.scheme not in ("http", "https") or not url.hostname or url.username is not None:
        raise ValueError("expected an absolute HTTP(S) URL without user info")
    if "#" in value or "\\" in value or url.netloc.endswith(":"):
        raise ValueError("fragment, backslash or empty port")
    port = url.port
    if port == (443 if url.scheme == "https" else 80):
        port = None
    return (url.scheme, url.hostname.lower(), port, url.path or "/", url.query)


def hreflang(rows):
    links = {}
    for line, (source, source_lang, target, target_lang) in rows:
        try:
            start, end = url_key(source), url_key(target)
        except ValueError:
            yield {"line": line, "issue": "invalid-url"}
            continue
        if not LANG.fullmatch(source_lang) or not LANG.fullmatch(target_lang):
            yield {"line": line, "issue": "invalid-language-tag"}
            continue
        link = ((start, source_lang.lower()), (end, target_lang.lower()))
        links.setdefault(link, line)
    for (source, target), line in links.items():
        if (target, source) not in links:
            yield {"line": line, "issue": "missing-return-link"}


def spf(rows):
    policies = defaultdict(dict)
    for line, (name, rr_type, value) in rows:
        if rr_type.strip().upper() != "TXT":
            continue
        domain = name.strip().lower().removesuffix(".")
        if len(domain) > 253 or not all(LABEL.fullmatch(label) for label in domain.split(".")):
            yield {"line": line, "issue": "invalid-owner-name"}
            continue
        if re.match(r"v=spf1(?: |$)", value, re.I | re.ASCII) and "\n" not in value and "\r" not in value:
            policies[domain].setdefault(value, line)
        elif "\n" in value or "\r" in value:
            yield {"line": line, "issue": "multiline-txt-value"}
    for domain, records in policies.items():
        if len(records) > 1:
            yield {"line": min(records.values()), "issue": "multiple-spf-records",
                   "domain": domain, "record_lines": list(records.values())}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="mode", required=True)
    for name, help_text in (("timestamps", "Check explicit timezone offsets"),
                            ("hreflang", "Find missing reciprocal language links"),
                            ("spf", "Find multiple SPF records per DNS owner")):
        cmd = commands.add_parser(name, help=help_text)
        cmd.add_argument("csv", type=Path, help="UTF-8 CSV export")
        if name == "timestamps":
            cmd.add_argument("--column", default="timestamp", help="Timestamp column (default: timestamp)")
    args = parser.parse_args()
    if args.mode == "timestamps":
        columns, check = (args.column,), timestamps
    elif args.mode == "hreflang":
        columns, check = ("source_url", "source_lang", "target_url", "target_lang"), hreflang
    else:
        columns, check = ("domain", "type", "value"), spf
    try:
        rows = read_rows(args.csv, columns)
        findings = sorted(check(rows), key=lambda finding: finding["line"])
    except (OSError, ValueError, csv.Error) as error:
        print(f"Input error: {error}", file=sys.stderr)
        return 2
    print(json.dumps({"check": args.mode, "rows": len(rows), "findings": findings}, indent=2))
    return int(bool(findings))


if __name__ == "__main__":
    sys.exit(main())
