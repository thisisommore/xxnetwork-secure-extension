# 1️⃣ Grab a fresh profile dir
TMPDIR=$(mktemp -d)
echo "Profile dir: $TMPDIR"

# 2️⃣ Pre-create the Chrome log file (so tail -f won't exit)
touch "$TMPDIR/chrome_debug.log"
touch "$TMPDIR/chrome_debug_filtered.log"

# 4️⃣ Open cursor on the filtered log
cursor "$TMPDIR/chrome_debug_filtered.log"

# 3️⃣ Log (don't run) the filtering command:
FILTER_CMD="tail -n 0 -f \"$TMPDIR/chrome_debug.log\" \
  | awk '/^\\[/ { if (\$0 ~ /\\.cc:/) { skip = 1 } else { skip = 0; print; fflush() } } \
           !/^\\[/ { if (!skip) { print; fflush() } }' \
  >> \"$TMPDIR/chrome_debug_filtered.log\""
echo "The filtering command is:"
echo
echo "  $FILTER_CMD"
echo

# 5️⃣ Launch Chrome for Testing
"/Users/ommore/Library/Application Support/Google/Chrome/chrome/mac_arm-137.0.7151.119/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing" \
  --user-data-dir="$TMPDIR" \
  --enable-logging --v=1 \
  --load-extension="/Users/ommore/github/xx-network/SecureExtension/dist" \
  --no-first-run \
  --no-default-browser-check \
  --disable-default-apps \
  http://localhost:3000