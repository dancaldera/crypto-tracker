#!/bin/bash
# Script para revisar el progreso de la semana de evaluación
# Uso: ./weekly_check.sh

cd /home/dc/.openclaw/workspace/crypto-tracker

echo "==================================="
echo "WEEK EVALUATION - STATUS CHECK"
echo "==================================="
echo ""

# 1. Verificar cron job
echo "📅 CRON JOB STATUS"
if crontab -l | grep -q crypto-tracker; then
    echo "✅ Cron job activo"
    crontab -l | grep crypto-tracker
else
    echo "❌ Cron job NO configurado"
fi
echo ""

# 2. Contar ejecuciones del día
TODAY=$(date +%Y-%m-%d)
echo "📊 TODAY'S RUNS ($TODAY)"
RUNS_TODAY=$(grep "Starting Crypto Monitor" logs/cron_test.log | tail -1 | wc -l)
echo "Ejecuciones detectadas en log: $(grep -c "Starting Crypto Monitor" logs/cron_test.log)"
echo ""

# 3. Ver última ejecución
echo "⏰ LAST RUN"
if [ -f logs/last_test_run.txt ]; then
    cat logs/last_test_run.txt
else
    echo "No se encontró timestamp"
fi
echo ""

# 4. Ver errores
echo "❌ ERROR CHECK"
ERRORS=$(grep -i "error" logs/cron_test.log | wc -l)
if [ $ERRORS -eq 0 ]; then
    echo "✅ No errors found"
else
    echo "⚠️  Found $ERRORS error(s)"
    echo "Last error:"
    grep -i "error" logs/cron_test.log | tail -1
fi
echo ""

# 5. Signals de rebalanceo
echo "🔄 REBALANCE SIGNALS"
REBALANCE_SIGNALS=$(grep "anyNeedsRebalance.*true" logs/cron_test.log | wc -l)
if [ $REBALANCE_SIGNALS -eq 0 ]; then
    echo "✅ No rebalance needed yet (all <10% deviation)"
else
    echo "⚠️  $REBALANCE_SIGNALS rebalance signal(s) detected"
    echo "Last signal:"
    grep "anyNeedsRebalance.*true" logs/cron_test.log | tail -1 | grep -A 10 "Rebalance info"
fi
echo ""

# 6. Valor actual del portfolio
echo "💰 CURRENT PORTFOLIO VALUE"
grep "Total Value" logs/cron_test.log | tail -1
echo ""

# 7. Performance de hoy
echo "📈 TODAY'S PERFORMANCE"
if [ -f logs/prices/BTC_$TODAY.csv ]; then
    echo "✅ Price data available for today"
    echo ""
    echo "Price ranges:"
    echo "BTC: $(tail -1 logs/prices/BTC_$TODAY.csv | cut -d, -f2) MXN"
    echo "ETH: $(tail -1 logs/prices/ETH_$TODAY.csv | cut -d, -f2) MXN"
    echo "SOL: $(tail -1 logs/prices/SOL_$TODAY.csv | cut -d, -f2) MXN"
else
    echo "⚠️  No price data for today yet"
fi
echo ""

echo "==================================="
echo "For detailed analysis, run:"
echo "  /home/dc/.bun/bin/bun run analyze_performance.js 1  # Today"
echo "  /home/dc/.bun/bin/bun run analyze_performance.js 7  # This week"
echo "==================================="
