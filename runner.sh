#!/bin/zsh

SCRIPT_DIR=$(dirname "$0")
LOG_FILE="$SCRIPT_DIR/ddns.log"

deno run -A ddns_cloudflare.ts >> "$LOG_FILE" 2>&1 &