#!/bin/bash

cd "$(dirname "$0")"

echo "📊 RESUMEN DIARIO - $(date '+%Y-%m-%d %H:%M')"
echo "==========================================="
echo ""

# Análisis técnico
echo "📊 ANÁLISIS TÉCNICO"
echo "-----------------"
/home/dc/.bun/bin/bun run test_technical.js 2>/dev/null | tail -30

echo ""
echo "🎯 POSICIONES SUGERIDAS"
echo "----------------------"
/home/dc/.bun/bin/bun run test_trading_strategy.js 2>/dev/null | grep -A 20 "DECISION SUMMARY"

echo ""
echo "📝 TRADES DE HOY"
echo "----------------"
if [ -f logs/trades/trades_*.json ]; then
  LATEST=$(ls -t logs/trades/trades_*.json | head -1)
  cat "$LATEST" | jq -r '.[] | "Portfolio: $\(.portfolioValue) MXN\nTrades: \(.trades | length)"' 2>/dev/null || echo "No hay trades"
else
  echo "No hay trades hoy"
fi

echo ""
echo "📈 PERFORMANCE (7 días)"
echo "---------------------"
/home/dc/.bun/bin/bun run analyze_performance.js 7 2>/dev/null | grep -A 15 "PORTFOLIO SUMMARY"
