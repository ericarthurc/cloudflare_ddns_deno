#!/bin/bash
PATH="/usr/local/bin:/usr/bin:/bin"

SCRIPT_DIR=$(dirname "$0")
LOG_FILE="$SCRIPT_DIR/ddns.log"

deno run -A ddns_cloudflare.ts >> "$LOG_FILE" 2>&1 &