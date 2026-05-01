#!/usr/bin/env bash
# Stop hook: if any web/ TS/TSX/SQL files changed during the turn, run
# typecheck + lint and report. Non-blocking — just surfaces failures so
# Claude can't credibly claim "done" without verification.
set -uo pipefail

REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)/.."
cd "$REPO_ROOT" || exit 0

# Anything modified or staged in web/ during this turn?
changed=$(git status --porcelain -- web/ 2>/dev/null | awk '/\.tsx?$/ {print; exit}')
if [ -z "$changed" ]; then
  exit 0
fi

cd web || exit 0

# Ensure `node` is on PATH. WSL sessions often have pnpm.cmd on PATH but no
# unix-style `node`, which makes pnpm's shim fail with "node: not found".
if ! command -v node >/dev/null 2>&1; then
  for cand in \
    "/mnt/c/Program Files/nodejs" \
    "/mnt/c/Program Files (x86)/nodejs" \
    "$HOME/.nvm/versions/node"/*/bin; do
    if [ -x "$cand/node" ] || [ -x "$cand/node.exe" ]; then
      PATH="$cand:$PATH"
      export PATH
      break
    fi
  done
fi
if ! command -v node >/dev/null 2>&1; then
  echo "[verify-web] skipped — no unix-style \`node\` on PATH." >&2
  echo "  pnpm's shim execs \"node\" (not node.exe), so a Windows-only install isn't enough." >&2
  echo "  Fix once: install Node in WSL (\`sudo apt install nodejs\` or nvm), or symlink:" >&2
  echo "    sudo ln -s '/mnt/c/Program Files/nodejs/node.exe' /usr/local/bin/node" >&2
  exit 0
fi

tc_out=$(pnpm -s typecheck 2>&1)
tc_status=$?
lint_out=$(pnpm -s lint 2>&1)
lint_status=$?

if [ $tc_status -ne 0 ] || [ $lint_status -ne 0 ]; then
  echo "[verify-web] FAILED — fix before declaring done." >&2
  if [ $tc_status -ne 0 ]; then
    echo "--- typecheck ---" >&2
    echo "$tc_out" | tail -40 >&2
  fi
  if [ $lint_status -ne 0 ]; then
    echo "--- lint ---" >&2
    echo "$lint_out" | tail -40 >&2
  fi
  exit 2
fi

echo "[verify-web] typecheck + lint clean."
exit 0
