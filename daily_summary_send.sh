#!/bin/bash
# Script simple para enviar el resumen diario por Telegram

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

# 3. Leer el resumen con Bun
MESSAGE=$(/home/dc/.bun/bin/bun run - <<EOF
const fs = require('fs');
const summary = JSON.parse(fs.readFileSync('$LATEST_SUMMARY'));

const emoji = summary.portfolio.dailyPercentChange >= 0 ? '📈' : '📉';
const changeEmoji = summary.portfolio.dailyPercentChange >= 0 ? '+' : '';

let msg = \`📊 *Daily Crypto Summary - ${summary.date}*

💰 *Portfolio Value*
   Start: \$${summary.portfolio.startValue.toFixed(2)} MXN
   End: \$${summary.portfolio.endValue.toFixed(2)} MXN
   ${emoji} Change: \$${summary.portfolio.dailyChange.toFixed(2)} (${changeEmoji}${summary.portfolio.dailyPercentChange.toFixed(2)}%)

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

console.log(msg.replace(/\$/g, '\\$'));
EOF
)

# 4. Guardar mensaje en archivo temporal para depuración
echo "$MESSAGE" > /tmp/crypto_summary_message.txt
echo "📝 Message saved to /tmp/crypto_summary_message.txt"
echo "📝 Message preview:"
echo "$MESSAGE" | head -15

# 5. Intentar enviar por OpenClaw
echo ""
echo "📤 Attempting to send via OpenClaw..."

# Usar el comando directamente con el mensaje escapado
/home/dc/.npm-global/bin/openclaw message send --message "$MESSAGE" >> /home/dc/.openclaw/workspace/crypto-tracker/logs/notification.log 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Message sent successfully"
else
    echo "⚠️  There was an issue sending the message"
    echo "   Check logs/notification.log for details"
    echo ""
    echo "📝 To send manually:"
    echo "   cat /tmp/crypto_summary_message.txt"
fi

echo ""
echo "✅ Daily summary process completed"
