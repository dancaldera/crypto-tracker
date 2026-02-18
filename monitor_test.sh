#!/bin/bash
# Script para ejecutar el monitor con portafolio de test
# Usa este script para cron jobs de testing

cd /home/dc/.openclaw/workspace/crypto-tracker

# Exportar variables de entorno si existe .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configurar modo test
export PORTFOLIO_MODE=test

# Ejecutar monitor con bun
/home/dc/.bun/bin/bun run monitor.js >> logs/cron_test.log 2>&1

# Guardar timestamp del último run
echo "$(date -Iseconds)" > logs/last_test_run.txt
