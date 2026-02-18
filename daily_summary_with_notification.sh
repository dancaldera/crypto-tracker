#!/bin/bash
# Script que genera el resumen diario y lo envía por OpenClaw

cd /home/dc/.openclaw/workspace/crypto-tracker

# 1. Generar resumen (se guarda en logs/summary_*.json)
echo "📊 Generating daily summary..."
/home/dc/.bun/bin/bun run daily_summary.js

# 2. Obtener el último resumen
LATEST_SUMMARY=$(ls -t logs/summary_*.json 2>/dev/null | head -1)

if [ -z "$LATEST_SUMMARY" ]; then
    echo "❌ No summary found"
    exit 1
fi

echo "📁 Latest summary: $LATEST_SUMMARY"

# 3. Extraer los datos clave del resumen
DATE=$(/home/dc/.bun/bin/bun run -e "console.log(JSON.parse(require('fs').readFileSync('$LATEST_SUMMARY')).date)")
START_VALUE=$(/home/dc/.bun/bin/bun run -e "console.log(JSON.parse(require('fs').readFileSync('$LATEST_SUMMARY')).portfolio.startValue.toFixed(2))")
END_VALUE=$(/home/dc/.bun/bin/bun run -e "console.log(JSON.parse(require('fs').readFileSync('$LATEST_SUMMARY')).portfolio.endValue.toFixed(2))")
DAILY_CHANGE=$(/home/dc/.bun/bin/bun run -e "console.log(JSON.parse(require('fs').readFileSync('$LATEST_SUMMARY')).portfolio.dailyChange.toFixed(2))")
DAILY_PERCENT=$(/home/dc/.bun/bin/bun run -e "console.log(JSON.parse(require('fs').readFileSync('$LATEST_SUMMARY')).portfolio.dailyPercentChange.toFixed(2))")
RUN_COUNT=$(/home/dc/.bun/bin/bun run -e "console.log(JSON.parse(require('fs').readFileSync('$LATEST_SUMMARY')).runCount)")
ERRORS=$(/home/dc/.bun/bin/bun run -e "console.log(JSON.parse(require('fs').readFileSync('$LATEST_SUMMARY')).errors.count)")
REBALANCE=$(/home/dc/.bun/bin/bun run -e "console.log(JSON.parse(require('fs').readFileSync('$LATEST_SUMMARY')).rebalanceSignals)")

# 4. Formatear el mensaje
EMOJI=$(/home/dc/.bun/bin/bun run -e "const p = $DAILY_PERCENT; console.log(p >= 0 ? '📈' : '📉')")
CHANGE_EMOJI=$(/home/dc/.bun/bin/bun run -e "const p = $DAILY_PERCENT; console.log(p >= 0 ? '+' : '')")

MESSAGE="📊 *Daily Crypto Summary - $DATE*

💰 *Portfolio Value*
   Start: \$$START_VALUE MXN
   End: \$$END_VALUE MXN
   ${EMOJI} Change: \$$DAILY_CHANGE (${CHANGE_EMOJI}${DAILY_PERCENT}%)

📈 *Asset Performance*
"

# Agregar performance de cada asset
BTC_CHANGE=$(/home/dc/.bun/bin/bun run -e "console.log(JSON.parse(require('fs').readFileSync('$LATEST_SUMMARY')).assetPerformance.BTC.change.toFixed(2))")
BTC_PERCENT=$(/home/dc/.bun/bin/bun run -e "console.log(JSON.parse(require('fs').readFileSync('$LATEST_SUMMARY')).assetPerformance.BTC.percentChange.toFixed(2))")
BTC_EMOJI=$(/home/dc/.bun/bin/bun run -e "const p = $BTC_PERCENT; console.log(p >= 0 ? '🟢' : '🔴')")

ETH_CHANGE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$LATEST_SUMMARY')).assetPerformance.ETH.change.toFixed(2))")
ETH_PERCENT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$LATEST_SUMMARY')).assetPerformance.ETH.percentChange.toFixed(2))")
ETH_EMOJI=$(/home/dc/.bun/bin/bun run -e "const p = $ETH_PERCENT; console.log(p >= 0 ? '🟢' : '🔴')")

SOL_CHANGE=$(/home/dc/.bun/bin/bun run -e "console.log(JSON.parse(require('fs').readFileSync('$LATEST_SUMMARY')).assetPerformance.SOL.change.toFixed(2))")
SOL_PERCENT=$(/home/dc/.bun/bin/bun run -e "console.log(JSON.parse(require('fs').readFileSync('$LATEST_SUMMARY')).assetPerformance.SOL.percentChange.toFixed(2))")
SOL_EMOJI=$(/home/dc/.bun/bin/bun run -e "const p = $SOL_PERCENT; console.log(p >= 0 ? '🟢' : '🔴')")

BTC_SIGN=$(/home/dc/.bun/bin/bun run -e "const p = $BTC_PERCENT; console.log(p >= 0 ? '+' : '')")
ETH_SIGN=$(/home/dc/.bun/bin/bun run -e "const p = $ETH_PERCENT; console.log(p >= 0 ? '+' : '')")
SOL_SIGN=$(/home/dc/.bun/bin/bun run -e "const p = $SOL_PERCENT; console.log(p >= 0 ? '+' : '')")

MESSAGE="${MESSAGE}   ${BTC_EMOJI} BTC: \$$BTC_CHANGE (${BTC_SIGN}${BTC_PERCENT}%)
   ${ETH_EMOJI} ETH: \$$ETH_CHANGE (${ETH_SIGN}${ETH_PERCENT}%)
   ${SOL_EMOJI} SOL: \$$SOL_CHANGE (${SOL_SIGN}${SOL_PERCENT}%)

🔄 *System Stats*
   Runs: $RUN_COUNT (expected: 12)
   Rebalance signals: $REBALANCE
   Errors: $ERRORS"

# 5. Enviar por OpenClaw
echo ""
echo "📤 Sending message via OpenClaw..."
/home/dc/.npm-global/bin/openclaw message send action=send "message=$MESSAGE" 2>&1

echo ""
echo "✅ Daily summary completed"
