import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

PRODUCT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PRODUCT))
import check


def issues(result):
    return [f["issue"] for f in result]


class TimestampTests(unittest.TestCase):
    def audit(self, *values):
        return list(check.timestamps([(i, (v,)) for i, v in enumerate(values, 2)]))

    def test_normal_and_high_precision(self):
        stamps = ("2024-02-29T23:59:59Z", "2024-02-29t23:59:59.1z",
                  "2024-02-29T23:59:59.123456789-03:30", "2024-02-29T00:00:00+00:00")
        self.assertEqual(self.audit(*stamps), [])

    def test_missing_unknown_and_bad_offsets(self):
        day = "2026-10-01T10:00:00"
        self.assertEqual(issues(self.audit(day, day+"-00:00", day+"+24:00", day+"-01:60")),
                         ["missing-offset", "unknown-offset", "invalid-offset", "invalid-offset"])

    def test_invalid_calendar_and_shape(self):
        values = ("2025-02-29T10:00:00Z", "2026-01-01T24:00:00Z",
                  "2026-11-01T09:00:00Z ", "2026-01-01T23:59:60Z")
        self.assertEqual(issues(self.audit(*values)), ["invalid-timestamp"] * len(values))
        self.assertEqual(issues(self.audit("")), ["empty-timestamp"])


class HreflangTests(unittest.TestCase):
    a = "https://example.org/en/"
    b = "https://example.org/pt/"

    def run_check(self, *edges):
        return list(check.hreflang(list(enumerate(edges, 2))))

    def test_normalized_reverse(self):
        self.assertEqual(self.run_check((self.a, "EN", self.b, "pt-BR"),
            (self.b, "pt-br", "HTTPS://EXAMPLE.ORG:443/en/", "en")), [])

    def test_wrong_language_and_self_reference(self):
        out = self.run_check((self.a, "en", self.b, "pt"), (self.b, "pt", self.b, "pt"),
                             (self.b, "pt", self.a, "fr"), (self.a, "en", self.b, "pt"))
        self.assertEqual([f["line"] for f in out], [2, 4])

    def test_path_and_query_are_significant(self):
        for b2 in ("https://example.org/PT/", self.b+"?v=2", self.b.rstrip("/")):
            with self.subTest(b2=b2):
                self.assertEqual(len(self.run_check((self.a,"en",self.b,"pt"),(b2,"pt",self.a,"en"))), 2)

    def test_malformed_links_and_languages(self):
        for bad in ("https://user@example.org/a", "/rel", self.b+"#part", "https://[invalid",
                    "https://example.org:99999", "https://ex ample.org", "https://example.org:"):
            self.assertEqual(issues(self.run_check((self.a,"en",bad,"pt"))), ["invalid-url"])
        self.assertEqual(issues(self.run_check((self.a,"en_US",self.b,"pt"))), ["invalid-language-tag"])


class SpfTests(unittest.TestCase):
    def run_check(self, *records):
        return list(check.spf(list(enumerate(records, 2))))

    def test_two_distinct_records(self):
        out=self.run_check(("Example.org.","TXT","v=spf1 -all"),("example.org","TXT","v=spf1 -all"),
                           ("example.org","txt","V=SPF1 ~all"))
        self.assertEqual(out,[{"line":2,"issue":"multiple-spf-records","domain":"example.org","record_lines":[2,4]}])

    def test_prefix_boundaries_and_scope(self):
        values=("v=spf10 -all","v=spf1x","v=spf1\t-all"," v=spf1 -all","domain-verification=1")
        records=[("example.org","TXT",v) for v in values]
        records.extend([("example.org","TXT","v=spf1"),("example.org","SPF","v=spf1 -all"),
                        ("other.org","TXT","v=spf1 -all")])
        self.assertEqual(self.run_check(*records), [])

    def test_suspect_owner_and_multiline_txt(self):
        out=self.run_check(("bad..example","TXT","v=spf1"),("x.example","TXT","v=spf1\n-all"))
        self.assertEqual(issues(out), ["invalid-owner-name", "multiline-txt-value"])


class CliTests(unittest.TestCase):
    def call(self, *args):
        return subprocess.run([sys.executable,str(PRODUCT/"check.py"),*map(str,args)], capture_output=True,text=True)

    def test_packaged_examples(self):
        for mode, expected in (("timestamps",["missing-offset","unknown-offset"]),
                               ("hreflang",["missing-return-link"]),("spf",["multiple-spf-records"])):
            with self.subTest(mode=mode):
                r=self.call(mode,PRODUCT/"examples"/(mode+".csv"))
                self.assertEqual(r.returncode,1,r.stderr)
                self.assertEqual(issues(json.loads(r.stdout)["findings"]),expected)

    def test_malformed_inputs_no_partial_report(self):
        inputs = [b"", b"timestamp,timestamp\nx,y\n",b"time\nvalue\n",
                  b"timestamp\n2020-01-01T00:00:00Z,extra",b'timestamp\n"open quote',b"timestamp\n\xff"]
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/"case.csv"
            for payload in inputs:
                path.write_bytes(payload)
                r=self.call("timestamps",path)
                self.assertEqual((r.returncode,r.stdout),(2,""))
                self.assertIn("Input error",r.stderr)

    def test_bom_and_quoted_multiline(self):
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/"data.csv"
            path.write_bytes(b'\xef\xbb\xbfwhen,note\r\n2026-01-01T00:00:00Z,"private,\r\ntext"\r\n')
            r=self.call("timestamps",path,"--column","when")
            self.assertEqual((r.returncode,json.loads(r.stdout)["findings"]),(0,[]))
            self.assertNotIn("private",r.stdout)
            with path.open("a") as f:
                f.write("2026-01-01T00:00:00,review\n")
            self.assertEqual(json.loads(self.call("timestamps",path,"--column","when").stdout)["findings"][0]["line"],4)

    def test_bounds_and_missing_file(self):
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/"sample.csv"
            self.assertEqual(self.call("timestamps",path).returncode,2)
            path.write_text("timestamp\na\nb\n")
            with patch.object(check,"MAX_ROWS",1), self.assertRaises(ValueError):
                check.read_rows(path,["timestamp"])
            with patch.object(check,"MAX_BYTES",2), self.assertRaises(ValueError):
                check.read_rows(path,["timestamp"])


if __name__ == "__main__":
    unittest.main()
