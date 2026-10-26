# Staged File Guard 1.0.0

Review potentially sensitive filenames in Git's staging area before committing.
The new free MIT-licensed Node.js 20+ CLI reads paths only, with no runtime
dependencies, network requests, secret-content inspection or automatic hooks.

It supports Git's NUL-separated output, nested repositories, spaces, Unicode and
control characters in paths, JSON reporting, and exit codes 0/1/2. Common example
filenames are excluded. A temporary-repository demo shows both expected outcomes.

The 10 automated tests use isolated Git repositories and verify name detection,
argument errors, symlink invocation, JSON output and absence of synthetic secret
contents in the report. A passing result does not guarantee that a commit is safe;
see the product README for the exact scope and limitations.
