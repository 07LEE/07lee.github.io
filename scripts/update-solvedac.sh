#!/usr/bin/env bash
# Saves the solved.ac numbers shown on the portfolio page into portfolio/solvedac.json.
# Run it from a home PC, then commit the changed file:
#   ./scripts/update-solvedac.sh
# The page cannot call the solved.ac API itself (the API blocks browser calls from other sites),
# and GitHub Actions cannot either (solved.ac answers 403 to GitHub's servers), so this runs by hand.
# Needs curl and jq.

set -euo pipefail

HANDLE=07lee
OUTPUT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/portfolio/solvedac.json"

response="$(mktemp)"
trap 'rm -f "$response"' EXIT

# solved.ac answers 403 to requests without a browser-like User-Agent.
curl --fail --silent --show-error --max-time 30 --retry 3 \
    -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36' \
    "https://solved.ac/api/v4/users/${HANDLE}" -o "$response"

# Stop without touching the saved file when the response is not what the page expects.
if ! jq -e --arg handle "$HANDLE" '
    .handle == $handle
    and ([.tier, .rating, .solvedCount, .class] | all(type == "number"))
' "$response" > /dev/null; then
    echo "Unexpected response from solved.ac; $OUTPUT was not changed." >&2
    exit 1
fi

jq --indent 4 --arg date "$(TZ=Asia/Seoul date +%Y.%m.%d)" '{
    handle: .handle,
    tier: .tier,
    rating: .rating,
    solvedCount: .solvedCount,
    class: .class,
    updatedAt: $date
}' "$response" > "$OUTPUT.tmp"
mv "$OUTPUT.tmp" "$OUTPUT"

cat "$OUTPUT"
