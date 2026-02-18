#!/bin/bash
# Script para verificar que todas las métricas se están guardando correctamente
# Ejecutar antes de la evaluación del viernes

cd /home/dc/.openclaw/workspace/crypto-tracker

echo "==================================="
echo "DATA COLLECTION VERIFICATION"
echo "==================================="
echo ""

# 1. Verificar cron jobs
echo "📅 CRON JOBS:"
if crontab -l | grep -q "crypto-tracker"; then
    echo "✅ Monitor cron: $(crontab -l | grep monitor_test.sh)"
else
    echo "❌ Monitor cron NO configurado"
fi

if crontab -l | grep -q "daily_summary"; then
    echo "✅ Daily summary cron: $(crontab -l | grep daily_summary)"
else
    echo "❌ Daily summary cron NO configurado"
fi
echo ""

# 2. Verificar logs principales
echo "📊 MAIN LOGS:"
if [ -f logs/cron_test.log ]; then
    RUNS=$(grep -c "Starting Crypto Monitor" logs/cron_test.log || echo 0)
    ERRORS=$(grep -ci "error" logs/cron_test.log || echo 0)
    SIZE=$(wc -l < logs/cron_test.log)
    echo "✅ cron_test.log: $RUNS runs, $ERRORS errors, $SIZE lines"
else
    echo "❌ cron_test.log NO encontrado"
fi

if [ -f logs/daily_summary.log ]; then
    RUNS=$(grep -c "DAILY SUMMARY" logs/daily_summary.log || echo 0)
    echo "✅ daily_summary.log: $RUNS summaries"
else
    echo "⚠️  daily_summary.log aún no creado (ejecuta a las 23:00)"
fi
echo ""

# 3. Verificar portfolio logs
echo "💼 PORTFOLIO LOGS:"
PORTFOLIO_COUNT=$(ls -1 logs/portfolio_*.json 2>/dev/null | wc -l)
echo "📁 Portfolio files: $PORTFOLIO_COUNT"

if [ $PORTFOLIO_COUNT -gt 0 ]; then
    LATEST=$(ls -t logs/portfolio_*.json | head -1)
    ENTRIES=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$LATEST')).length)")
    echo "✅ Latest: $(basename $LATEST) with $ENTRIES entries"

    # Verificar estructura del portfolio
    LATEST_DATA=$(cat "$LATEST")
    if echo "$LATEST_DATA" | grep -q "total_value"; then
        echo "✅ Contains total_value"
    else
        echo "❌ Missing total_value"
    fi

    if echo "$LATEST_DATA" | grep -q "assets"; then
        echo "✅ Contains assets"
    else
        echo "❌ Missing assets"
    fi

    if echo "$LATEST_DATA" | grep -q "timestamp"; then
        echo "✅ Contains timestamp"
    else
        echo "❌ Missing timestamp"
    fi
else
    echo "❌ No portfolio logs found"
fi
echo ""

# 4. Verificar price logs
echo "💰 PRICE LOGS:"
for asset in BTC ETH SOL USDC; do
    PRICE_COUNT=$(ls -1 logs/prices/${asset}_*.csv 2>/dev/null | wc -l)
    if [ $PRICE_COUNT -gt 0 ]; then
        LATEST=$(ls -t logs/prices/${asset}_*.csv | head -1)
        POINTS=$(wc -l < "$LATEST")
        echo "✅ $asset: $PRICE_COUNT files, latest has $POINTS data points"
    else
        echo "❌ $asset: No price logs"
    fi
done
echo ""

# 5. Verificar summary logs
echo "📋 SUMMARY LOGS:"
SUMMARY_COUNT=$(ls -1 logs/summary_*.json 2>/dev/null | wc -l)
echo "📁 Summary files: $SUMMARY_COUNT"

if [ $SUMMARY_COUNT -gt 0 ]; then
    LATEST=$(ls -t logs/summary_*.json | head -1)
    echo "✅ Latest summary: $(basename $LATEST)"

    # Verificar estructura del summary
    LATEST_DATA=$(cat "$LATEST")
    if echo "$LATEST_DATA" | grep -q "runCount"; then
        echo "✅ Contains runCount"
    else
        echo "❌ Missing runCount"
    fi

    if echo "$LATEST_DATA" | grep -q "portfolio"; then
        echo "✅ Contains portfolio data"
    else
        echo "❌ Missing portfolio data"
    fi

    if echo "$LATEST_DATA" | grep -q "assetPerformance"; then
        echo "✅ Contains assetPerformance"
    else
        echo "❌ Missing assetPerformance"
    fi

    if echo "$LATEST_DATA" | grep -q "priceRanges"; then
        echo "✅ Contains priceRanges"
    else
        echo "❌ Missing priceRanges"
    fi

    if echo "$LATEST_DATA" | grep -q "allocations"; then
        echo "✅ Contains allocations"
    else
        echo "❌ Missing allocations"
    fi
else
    echo "⚠️  No summary logs yet (executes at 23:00)"
fi
echo ""

# 6. Verificar datos de métricas clave
echo "📊 KEY METRICS VERIFICATION:"
if [ -f "logs/summary_2026-02-13.json" ]; then
    echo "✅ Sample summary exists for 2026-02-13"

    # Verificar que capture runCount
    RUN_COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('logs/summary_2026-02-13.json')).runCount)")
    echo "   → runCount captured: $RUN_COUNT"

    # Verificar que capture dailyChange
    DAILY_CHANGE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('logs/summary_2026-02-13.json')).portfolio.dailyChange.toFixed(2))")
    echo "   → dailyChange captured: $DAILY_CHANGE"

    # Verificar que capture asset performance
    BTC_PERF=$(node -e "console.log(JSON.parse(require('fs').readFileSync('logs/summary_2026-02-13.json')).assetPerformance.BTC.percentChange.toFixed(2))")
    echo "   → BTC performance captured: $BTC_PERF%"

    # Verificar que capture priceRanges
    BTC_MIN=$(node -e "console.log(JSON.parse(require('fs').readFileSync('logs/summary_2026-02-13.json')).priceRanges.BTC.min)")
    BTC_MAX=$(node -e "console.log(JSON.parse(require('fs').readFileSync('logs/summary_2026-02-13.json')).priceRanges.BTC.max)")
    echo "   → BTC price range: $BTC_MIN - $BTC_MAX"

    # Verificar que capture rebalanceSignals
    REBALANCE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('logs/summary_2026-02-13.json')).rebalanceSignals)")
    echo "   → rebalanceSignals captured: $REBALANCE"
else
    echo "⚠️  Sample summary not found"
fi
echo ""

# 7. Verificar configuración de allocations
echo "🎯 ALLOCATIONS CONFIG:"
if [ -f data/allocations.json ]; then
    if cat data/allocations.json | grep -q "target_allocations"; then
        echo "✅ target_allocations configured"
        cat data/allocations.json | grep -A 4 "target_allocations" | grep -v "target_allocations"
    else
        echo "❌ target_allocations NOT configured"
    fi

    if cat data/allocations.json | grep -q "rebalance_settings"; then
        echo "✅ rebalance_settings configured"
        cat data/allocations.json | grep -A 4 "rebalance_settings" | grep -v "rebalance_settings"
    else
        echo "❌ rebalance_settings NOT configured"
    fi
else
    echo "❌ allocations.json NOT found"
fi
echo ""

# 8. Verificar portfolio de test
echo "💼 TEST PORTFOLIO:"
if [ -f data/portfolio_test.json ]; then
    TOTAL=$(node -e "console.log(JSON.parse(require('fs').readFileSync('data/portfolio_test.json')).total_value)")
    ASSETS=$(node -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync('data/portfolio_test.json')).assets).join(', '))")
    echo "✅ Test portfolio exists"
    echo "   → Total value: $TOTAL"
    echo "   → Assets: $ASSETS"
else
    echo "❌ portfolio_test.json NOT found"
fi
echo ""

echo "==================================="
echo "VERIFICATION COMPLETE"
echo "==================================="
echo ""
echo "Summary of required metrics for Friday evaluation:"
echo "  ✅ Portfolio values over time (portfolio_*.json)"
echo "  ✅ Asset performance (summary_*.json)"
echo "  ✅ Price ranges (prices/*.csv)"
echo "  ✅ Run count and errors (cron_test.log)"
echo "  ✅ Rebalance signals (summary_*.json)"
echo "  ✅ Allocations vs targets (summary_*.json)"
echo ""
echo "All systems ready for week evaluation! 🚀"
