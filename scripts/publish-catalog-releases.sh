#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
: "${GITHUB_REPOSITORY:?GitHub repository is required}"
: "${GITHUB_SHA:?GitHub commit is required}"
: "${GH_TOKEN:?GitHub Actions token is required}"

manifest="docs/release-notes/catalog-manifest.txt"
if [[ ! -f "$manifest" ]]; then echo "Missing release manifest" >&2; exit 1; fi
count=0
while IFS=$'\t' read -r tag title note_file; do
  [[ -n "$tag" ]] || continue
  [[ "$tag" =~ ^[a-z0-9-]+-v[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Invalid tag: $tag" >&2; exit 1; }
  [[ -f "$note_file" && -s "$note_file" ]] || { echo "Missing notes: $note_file" >&2; exit 1; }
  if gh release view "$tag" --repo "$GITHUB_REPOSITORY" >/dev/null 2>&1; then
    echo "EXISTS: $tag"
  else
    echo "PUBLISH: $tag"
    gh release create "$tag" --repo "$GITHUB_REPOSITORY" --target "$GITHUB_SHA" --title "$title" --notes-file "$note_file" --latest=false
  fi
  count=$((count+1))
done < "$manifest"
echo "Checked $count releases"
