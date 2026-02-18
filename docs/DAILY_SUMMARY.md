# Resumen Diario Automático

## Sistema Configurado ✅

El crypto tracker genera automáticamente un resumen diario a las 23:00 y lo guarda en el archivo `logs/daily_message.txt`.

## Qué Incluye el Resumen

- **Portfolio Value:** Valor inicial, final y cambio del día
- **Asset Performance:** Cambio de cada activo (BTC, ETH, SOL, USDC)
- **System Stats:** Ejecuciones completadas, señales de rebalanceo, errores

## Cómo Funciona

### Automático (Cron Job)
- **Horario:** Todos los días a las 23:00
- **Script:** `daily_summary_simple.sh`
- **Genera:**
  - `logs/summary_YYYY-MM-DD.json` - Datos completos en JSON
  - `logs/daily_message.txt` - Mensaje formateado para Telegram

### Manual (Cuando Quieras)
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
./daily_summary_simple.sh
```

## Archivos Generados

### logs/summary_YYYY-MM-DD.json
Datos completos del día:
```json
{
  "date": "2026-02-13",
  "runCount": 6,
  "errors": { "count": 0 },
  "rebalanceSignals": 0,
  "portfolio": {
    "startValue": 3003.21,
    "endValue": 3006.29,
    "dailyChange": 3.08,
    "dailyPercentChange": 0.10
  },
  "assetPerformance": { ... },
  "priceRanges": { ... },
  "allocations": { ... }
}
```

### logs/daily_message.txt
Mensaje formateado listo para enviar:
```
📊 *Daily Crypto Summary - 2026-02-13*

💰 *Portfolio Value*
   Start: $3003.21 MXN
   End: $3006.29 MXN
   📈 Change: $3.08 (+0.10%)

📈 *Asset Performance*
   🟢 BTC: $1.27 (+0.11%) - $1202.69 MXN
   🟢 ETH: $1.70 (+0.23%) - $752.93 MXN
   🔴 SOL: $-0.31 (-0.07%) - $450.39 MXN
   🟢 USDC: $0.42 (+0.07%) - $600.28 MXN

🔄 *System Stats*
   Runs: 6 (expected: 12)
   Rebalance signals: 0
   Errors: 0
```

## Recibir Resumen por Telegram

El mensaje formateado se guarda en `logs/daily_message.txt`. Puedes ver el contenido o copiarlo manualmente desde ahí.

### Opción 1: Ver en consola
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
cat logs/daily_message.txt
```

### Opción 2: Ver archivo completo
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
cat logs/summary_2026-02-13.json | jq
```

## Cron Jobs Activos

| Horario | Script | Archivo de Log |
|---------|--------|----------------|
| Cada 2 horas (0, 2, 4, ..., 22) | `monitor_test.sh` | `logs/cron_test.log` |
| 23:00 diario | `daily_summary_simple.sh` | `logs/cron_daily.log` |

## Verificar Funcionamiento

### Verificar resúmenes generados
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
ls -la logs/summary_*.json
```

### Ver último mensaje
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
cat logs/daily_message.txt
```

### Ver log del cron job
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
tail -20 logs/cron_daily.log
```

## Resumen del Script `daily_summary_simple.sh`

El script hace lo siguiente:
1. Ejecuta `daily_summary.js` para generar datos
2. Lee el último archivo `summary_*.json`
3. Genera mensaje formateado para Telegram
4. Guarda el mensaje en `logs/daily_message.txt`
5. Muestra el mensaje en consola

## Notas Importantes

- El cron job se ejecuta a las 23:00 todos los días
- Los datos se basan en el portfolio de test (simulado)
- No se requiere configuración de API keys
- Los resúmenes se guardan automáticamente
- El mensaje está formateado con Markdown para Telegram

## Próximos Pasos

1. **Diario:** El resumen se genera automáticamente a las 23:00
2. **Revisar:** Usa `cat logs/daily_message.txt` para ver el resumen
3. **Evaluación semanal:** Usa `weekly_evaluation.js` el viernes 20 de febrero
