#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
: "${GITHUB_REPOSITORY:?GitHub repository is required}"
: "${GITHUB_SHA:?GitHub commit is required}"
: "${GH_TOKEN:?GitHub Actions token is required}"

manifest="docs/release-notes/catalog-manifest.txt"
if [[ ! -s "$manifest" ]]; then echo "Missing release manifest" >&2; exit 1; fi
count=0
while IFS=$'\t' read -r tag title note_file asset; do
  [[ -n "$tag" ]] || continue
  [[ "$tag" =~ ^[a-z0-9-]+-v[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Invalid tag: $tag" >&2; exit 1; }
  [[ -s "$note_file" ]] || { echo "Missing notes: $note_file" >&2; exit 1; }

  assets=()
  if [[ -n "$asset" ]]; then
    [[ "$asset" == products/*/downloads/*.zip && "$asset" != *..* && -s "$asset" ]] || {
      echo "Invalid download for $tag" >&2
      exit 1
    }
    assets=("$asset")
  fi

  if existing=$(gh release view "$tag" --repo "$GITHUB_REPOSITORY" --json assets,isDraft); then
    if [[ -n "$asset" ]] && ! jq -e --arg name "${asset##*/}" 'any(.assets[]; .name == $name)' <<<"$existing" >/dev/null; then
      # Only backfill a missing attachment. Never overwrite a released file.
      gh release upload "$tag" "$asset" --repo "$GITHUB_REPOSITORY"
    fi
    if [[ -n "$asset" ]] && jq -e '.isDraft' <<<"$existing" >/dev/null; then
      gh release edit "$tag" --repo "$GITHUB_REPOSITORY" --draft=false --latest=false
    fi
    echo "EXISTS: $tag"
  else
    latest=false
    if [[ "$tag" == catalog-update-* ]]; then latest=true; fi
    gh release create "$tag" "${assets[@]}" --repo "$GITHUB_REPOSITORY" --target "$GITHUB_SHA" \
      --title "$title" --notes-file "$note_file" --latest="$latest"
    echo "PUBLISHED: $tag"
  fi
  count=$((count+1))
done < "$manifest"
echo "Checked $count releases"
