#!/bin/bash
# Script simple para generar el resumen diario

cd /home/dc/.openclaw/workspace/crypto-tracker

# 1. Generar resumen
echo "📊 Generating daily summary..."
/home/dc/.bun/bin/bun run daily_summary.js > /dev/null 2>&1

# 2. Obtener el último resumen
LATEST_SUMMARY=$(ls -t logs/summary_*.json 2>/dev/null | head -1)

if [ -z "$LATEST_SUMMARY" ]; then
    echo "❌ No summary found"
    exit 1
fi

echo "📁 Using summary: $LATEST_SUMMARY"

# 3. Generar el mensaje formateado usando Bun con argumento
echo "📝 Generating formatted message..."
/home/dc/.bun/bin/bun run -e "
const fs = require('fs');
const summary = JSON.parse(fs.readFileSync('$LATEST_SUMMARY'));

const emoji = summary.portfolio.dailyPercentChange >= 0 ? '📈' : '📉';
const changeEmoji = summary.portfolio.dailyPercentChange >= 0 ? '+' : '';

let msg = \`📊 *Daily Crypto Summary - \${summary.date}*

💰 *Portfolio Value*
   Start: \$\${summary.portfolio.startValue.toFixed(2)} MXN
   End: \$\${summary.portfolio.endValue.toFixed(2)} MXN
   \${emoji} Change: \$\${summary.portfolio.dailyChange.toFixed(2)} (\${changeEmoji}\${summary.portfolio.dailyPercentChange.toFixed(2)}%)

📈 *Asset Performance*\`;

Object.keys(summary.assetPerformance).forEach(asset => {
  const perf = summary.assetPerformance[asset];
  const assetEmoji = perf.percentChange >= 0 ? '🟢' : '🔴';
  const sign = perf.percentChange >= 0 ? '+' : '';
  msg += \`\n   \${assetEmoji} \${asset}: \$\${perf.change.toFixed(2)} (\${sign}\${perf.percentChange.toFixed(2)}%) - \$\${perf.end.toFixed(2)} MXN\`;
});

msg += \`

🔄 *System Stats*
   Runs: \${summary.runCount} (expected: 12)
   Rebalance signals: \${summary.rebalanceSignals}
   Errors: \${summary.errors.count}\`;

fs.writeFileSync('logs/daily_message.txt', msg, 'utf8');
console.log('✅ Message saved to logs/daily_message.txt');
"

# 4. Mostrar el mensaje
echo ""
echo "==================================="
echo "DAILY CRYPTO SUMMARY"
echo "==================================="
if [ -f logs/daily_message.txt ]; then
    cat logs/daily_message.txt
else
    echo "❌ Message file not found"
fi
echo "==================================="
echo ""
echo "✅ Daily summary generated successfully!"
echo ""
echo "📁 Files created:"
echo "   - $LATEST_SUMMARY (data)"
echo "   - logs/daily_message.txt (formatted message)"
