"""Black-box CLI tests with synthetic CSV feeds and a real Python subprocess."""

import csv
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "src" / "gtin_duplicate.py"


class ProductFeedGTINTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.feed = Path(self.tmp.name) / "products.csv"

    def write(self, rows, header=("sku", "gtin")):
        with self.feed.open("w", encoding="utf-8", newline="") as stream:
            writer = csv.writer(stream)
            writer.writerow(header)
            writer.writerows(rows)

    def run_cli(self, path=None):
        return subprocess.run([sys.executable, str(SCRIPT), str(path or self.feed)],
                              capture_output=True, text=True, check=False)

    def assert_invalid(self):
        r = self.run_cli()
        self.assertEqual(r.returncode, 2, r.stdout + r.stderr)
        self.assertEqual(r.stdout, "")
        self.assertIn("Input error:", r.stderr)

    def test_two_skus_share_gtin(self):
        self.write([("B", "12345678"), ("A", "12345678")])
        r = self.run_cli()
        self.assertEqual(r.returncode, 1)
        self.assertEqual(json.loads(r.stdout), {"duplicate_group_count": 1,
                         "duplicate_groups": [{"gtin": "12345678", "skus": ["A", "B"]}]})

    def test_three_skus_share_gtin(self):
        self.write([("C", "12345678"), ("A", "12345678"), ("B", "12345678")])
        self.assertEqual(json.loads(self.run_cli().stdout)["duplicate_groups"][0]["skus"], ["A", "B", "C"])

    def test_unique_gtins_exit_zero(self):
        self.write([("A", "12345678"), ("B", "87654321")])
        r = self.run_cli()
        self.assertEqual(r.returncode, 0)
        self.assertEqual(json.loads(r.stdout), {"duplicate_group_count": 0, "duplicate_groups": []})

    def test_empty_feed_header_only(self):
        self.write([])
        self.assertEqual(self.run_cli().returncode, 0)

    def test_leading_zeros_preserved(self):
        self.write([("A", "00000001"), ("B", "00000001")])
        self.assertEqual(json.loads(self.run_cli().stdout)["duplicate_groups"][0]["gtin"], "00000001")

    def test_all_gtin_lengths(self):
        self.write([("A", "12345678"), ("B", "123456789012"),
                    ("C", "1234567890123"), ("D", "12345678901234")])
        self.assertEqual(self.run_cli().returncode, 0)

    def test_order_deterministic(self):
        self.write([("Z", "87654321"), ("B", "12345678"), ("Y", "87654321"), ("A", "12345678")])
        r1 = self.run_cli()
        r2 = self.run_cli()
        self.assertEqual(r1.stdout, r2.stdout)
        groups = json.loads(r1.stdout)["duplicate_groups"]
        self.assertEqual([g["gtin"] for g in groups], ["12345678", "87654321"])
        self.assertEqual(groups[0]["skus"], ["A", "B"])

    def test_duplicate_sku_rejected_even_with_other_gtin(self):
        self.write([("A", "12345678"), ("A", "87654321")])
        self.assert_invalid()

    def test_duplicate_identical_row_rejected(self):
        self.write([("A", "12345678"), ("A", "12345678")])
        self.assert_invalid()

    def test_non_ascii_gtin_rejected(self):
        self.write([("A", "１２３４５６７８")])
        self.assert_invalid()

    def test_nonnumeric_gtin_rejected(self):
        self.write([("A", "1234X678")])
        self.assert_invalid()

    def test_wrong_gtin_length_rejected(self):
        self.write([("A", "123456789")])
        self.assert_invalid()

    def test_gtin_with_whitespace_rejected(self):
        self.write([("A", "12345678 ")])
        self.assert_invalid()

    def test_empty_sku_rejected(self):
        self.write([("", "12345678")])
        self.assert_invalid()

    def test_whitespace_sku_rejected(self):
        self.write([("  ", "12345678")])
        self.assert_invalid()

    def test_control_character_sku_rejected(self):
        self.write([("A\nB", "12345678")])
        self.assert_invalid()

    def test_wrong_header_rejected(self):
        self.write([("A", "12345678")], header=("gtin", "sku"))
        self.assert_invalid()

    def test_extra_header_rejected(self):
        self.write([], header=("sku", "gtin", "title"))
        self.assert_invalid()

    def test_extra_data_field_rejected(self):
        self.feed.write_text("sku,gtin\nA,12345678,extra\n", encoding="utf-8")
        self.assert_invalid()

    def test_missing_data_field_rejected(self):
        self.feed.write_text("sku,gtin\nA\n", encoding="utf-8")
        self.assert_invalid()

    def test_invalid_utf8_rejected(self):
        self.feed.write_bytes(b"sku,gtin\n\xff,12345678\n")
        self.assert_invalid()

    def test_missing_file_rejected(self):
        r = self.run_cli(Path(self.tmp.name) / "missing.csv")
        self.assertEqual(r.returncode, 2)
        self.assertEqual(r.stdout, "")

    def test_unclosed_quote_rejected(self):
        self.feed.write_text('sku,gtin\n"bad,12345678\n', encoding="utf-8")
        self.assert_invalid()

    def test_file_too_large_rejected(self):
        self.feed.write_bytes(b"sku,gtin\n" + b"X" * (2 * 1024 * 1024))
        self.assert_invalid()

    def test_ten_thousand_rows_accepted(self):
        self.write([(f"S{i}", f"{i:08d}") for i in range(10_000)])
        self.assertEqual(self.run_cli().returncode, 0)

    def test_ten_thousand_and_one_rows_rejected(self):
        self.write([(f"S{i}", f"{i:08d}") for i in range(10_001)])
        self.assert_invalid()

    def test_does_not_modify_input(self):
        self.write([("A", "12345678"), ("B", "12345678")])
        before = hashlib.sha256(self.feed.read_bytes()).hexdigest()
        self.run_cli()
        self.assertEqual(before, hashlib.sha256(self.feed.read_bytes()).hexdigest())

    def test_csv_quoted_sku(self):
        self.write([("A, special", "12345678"), ("B", "12345678")])
        self.assertEqual(self.run_cli().returncode, 1)

    def test_no_full_feed_output(self):
        self.write([("private_sku", "12345678"), ("other", "87654321")])
        r = self.run_cli()
        self.assertEqual(r.returncode, 0)
        self.assertNotIn("private_sku", r.stdout)
        self.assertNotIn("87654321", r.stdout)

    def test_utf8_bom_header_rejected(self):
        self.feed.write_bytes(b"\xef\xbb\xbfsku,gtin\nA,12345678\n")
        self.assert_invalid()


if __name__ == "__main__":
    unittest.main()
