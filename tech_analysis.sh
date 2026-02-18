#!/bin/bash

echo "🔍 Crypto Technical Analysis Report"
echo "====================================="
echo ""
cd "$(dirname "$0")"
/home/dc/.bun/bin/bun run test_technical.js
echo ""
echo "💡 Para más detalles, revisa los logs en ./logs/prices/"
