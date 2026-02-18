#!/bin/bash
# Script para ver el estado del sistema de crypto tracker

echo "🪙 Crypto Tracker Status"
echo "========================"
echo ""

# Último run del monitor test
if [ -f logs/last_test_run.txt ]; then
    echo "🕐 Último run (test): $(cat logs/last_test_run.txt)"
else
    echo "⚠️  No hay runs registrados aún"
fi

echo ""
echo "📊 Portafolios disponibles:"
echo "  - data/portfolio.json (principal)"
echo "  - data/portfolio_test.json (testing)"
echo ""

echo "📁 Logs creados:"
if [ -d logs/prices ]; then
    echo "  - Precios: $(ls logs/prices/*.csv 2>/dev/null | wc -l) archivos CSV"
fi
if [ -d logs/trades ]; then
    echo "  - Trades: $(ls logs/trades/*.json 2>/dev/null | wc -l) archivos JSON"
fi

echo ""
echo "⚙️  Cron jobs activos:"
crontab -l | grep -E "crypto|monitor" || echo "  (ninguno configurado)"

echo ""
echo "🚀 Para ejecutar manualmente:"
echo "  cd /home/dc/.openclaw/workspace/crypto-tracker && /home/dc/.bun/bin/bun run monitor.js"
echo ""
echo "📖 Para ver reporte PnL:"
echo "  cd /home/dc/.openclaw/workspace/crypto-tracker && /home/dc/.bun/bin/bun run analyze_performance.js 7"
