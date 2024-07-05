#!/bin/bash

LOG_FILE="ddns.log"

deno run -A ddns_cloudflare.ts >> "$LOG_FILE" 2>&1 &