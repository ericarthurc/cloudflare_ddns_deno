#!/bin/bash

SCRIPT_DIR=$(dirname "$0")
LOG_FILE="$SCRIPT_DIR/ddns.log"

deno run -A $SCRIPT_DIR/ddns_cloudflare.ts >> "$LOG_FILE" 2>&1 &