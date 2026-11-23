#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v flutter >/dev/null || { echo 'Flutter SDK not found'; exit 127; }
# Keep unobfuscated source in repository; keep release symbols OUTSIDE repo.
SYMBOL_DIR="${BUG_BOMB_SYMBOLS:-$(pwd)/../bug_bomb_flutter_symbols/$(date +%Y%m%d-%H%M%S)}"
mkdir -p "$SYMBOL_DIR"
TARGET="${1:-apk}"
case "$TARGET" in
  apk) flutter build apk --release --obfuscate --split-debug-info="$SYMBOL_DIR" ;;
  appbundle) flutter build appbundle --release --obfuscate --split-debug-info="$SYMBOL_DIR" ;;
  ios) flutter build ios --release --obfuscate --split-debug-info="$SYMBOL_DIR" ;;
  *) echo "Usage: $0 [apk|appbundle|ios]"; exit 2 ;;
esac
echo "Private symbols: $SYMBOL_DIR (never commit these)"
