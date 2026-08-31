#!/bin/sh
# Only job: confirm Node exists, then hand off to setup.mjs.
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required but was not found."
  echo "Install Node 20 or newer from https://nodejs.org/ and run this again."
  exit 1
fi
exec node "$(dirname "$0")/setup.mjs"
