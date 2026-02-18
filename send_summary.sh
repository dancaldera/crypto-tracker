#!/bin/bash
# Script para enviar el último resumen diario manualmente
# Úsalo cuando quieras enviar el resumen por Telegram

cd /home/dc/.openclaw/workspace/crypto-tracker

# Verificar que existe el mensaje
if [ ! -f "logs/daily_message.txt" ]; then
    echo "❌ No daily message found"
    echo "   Generating new summary..."
    ./daily_summary_simple.sh
fi

echo "==================================="
echo "SENDING DAILY SUMMARY"
echo "==================================="
echo ""
echo "📝 Message content:"
echo ""
cat logs/daily_message.txt
echo ""
echo "==================================="
echo ""
echo "✅ To send this message:"
echo ""
echo "   Opción 1 - Copiar y pegar en Telegram:"
echo "   cat logs/daily_message.txt"
echo ""
echo "   Opción 2 - Ver en el archivo:"
echo "   xdg-open logs/daily_message.txt 2>/dev/null || cat logs/daily_message.txt"
echo ""
echo "   Opción 3 - Usar OpenClaw (si está configurado):"
echo "   openclaw message send --message \"\$(cat logs/daily_message.txt)\""
echo ""
echo "📂 Message file: logs/daily_message.txt"
echo ""
