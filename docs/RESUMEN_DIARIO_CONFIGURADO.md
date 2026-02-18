# 📊 Sistema de Resúmenes Diarios - CONFIGURADO

## Resumen del Sistema

✅ **Cron job activo:** Ejecuta todos los días a las 23:00
✅ **Genera resumen automático:** `logs/daily_message.txt`
✅ **Formato listo para Telegram:** Markdown con emojis
✅ **Datos completos:** Portfolio, performance, system stats

---

## 🔄 Cómo Funciona

### Automático (Cada día a las 23:00)

1. Ejecuta `daily_summary_simple.sh`
2. Genera `logs/summary_YYYY-MM-DD.json` (datos)
3. Crea `logs/daily_message.txt` (mensaje formateado)
4. Todo se guarda automáticamente

### Manual (Cuando quieras)

```bash
cd /home/dc/.openclaw/workspace/crypto-tracker

# Generar resumen
./daily_summary_simple.sh

# Ver mensaje
cat logs/daily_message.txt

# Enviar manualmente
./send_summary.sh
```

---

## 📂 Archivos Generados

### 1. logs/summary_YYYY-MM-DD.json
Datos completos del día en formato JSON:
```json
{
  "date": "2026-02-13",
  "runCount": 6,
  "portfolio": {
    "startValue": 3003.21,
    "endValue": 3006.29,
    "dailyChange": 3.08,
    "dailyPercentChange": 0.10
  },
  "assetPerformance": {
    "BTC": { "change": 1.27, "percentChange": 0.11 },
    "ETH": { "change": 1.70, "percentChange": 0.23 },
    "SOL": { "change": -0.31, "percentChange": -0.07 },
    "USDC": { "change": 0.42, "percentChange": 0.07 }
  },
  ...
}
```

### 2. logs/daily_message.txt
Mensaje formateado para Telegram:

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

---

## 📋 Qué Incluye el Resumen

| Sección | Qué muestra |
|---------|-------------|
| **Portfolio Value** | Valor inicial, final, cambio diario |
| **Asset Performance** | Cambio de cada activo (BTC, ETH, SOL, USDC) |
| **System Stats** | Runs completados, rebalance signals, errores |

---

## 🎯 Cómo Usar

### Ver el Resumen Diario

**Opción 1 - En consola:**
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
cat logs/daily_message.txt
```

**Opción 2 - Abrir archivo:**
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
xdg-open logs/daily_message.txt
```

**Opción 3 - Ver datos completos:**
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
cat logs/summary_2026-02-13.json | jq
```

### Enviar a Telegram Manualmente

**Opción 1 - Copiar y pegar:**
1. `cat logs/daily_message.txt`
2. Copiar el texto
3. Pegar en Telegram

**Opción 2 - Usar script de ayuda:**
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
./send_summary.sh
```

---

## 📅 Cron Jobs Configurados

```bash
# Monitor principal (cada 2 horas)
0 */2 * * * /home/dc/.openclaw/workspace/crypto-tracker/monitor_test.sh

# Resumen diario (23:00)
0 23 * * * /home/dc/.openclaw/workspace/crypto-tracker/daily_summary_simple.sh
```

---

## 🔍 Verificar Funcionamiento

### Ver logs del resumen diario:
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
tail -20 logs/cron_daily.log
```

### Ver todos los resúmenes:
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
ls -la logs/summary_*.json
```

### Ver el último mensaje:
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
cat logs/daily_message.txt
```

---

## 📚 Scripts Disponibles

| Script | Función |
|--------|---------|
| `daily_summary_simple.sh` | Genera resumen automáticamente |
| `send_summary.sh` | Muestra opciones para enviar el resumen |
| `daily_summary.js` | Genera datos JSON del resumen |
| `verify_metrics.sh` | Verifica todas las métricas recolectadas |

---

## ✅ Checklist de Verificación

- [x] Cron job configurado (23:00 diario)
- [x] Script funciona correctamente
- [x] Mensaje formateado para Telegram
- [x] Archivos se guardan correctamente
- [x] Datos son consistentes
- [x] Manual de uso documentado

---

## 📝 Ejemplo de Uso Diario

**23:00 - Automático:**
1. Cron job se ejecuta
2. Genera `logs/summary_2026-02-14.json`
3. Crea `logs/daily_message.txt`

**23:05 - Revisar:**
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
cat logs/daily_message.txt
```

**23:10 - Enviar (opcional):**
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
./send_summary.sh
# O simplemente copiar y pegar el contenido
```

---

## 🎓 Notas Importantes

- El resumen se genera automáticamente a las 23:00
- Los datos están basados en el portfolio de test
- No se requiere configuración de API
- El mensaje está en formato Markdown para Telegram
- Puedes ver el contenido cuando quieras con `cat logs/daily_message.txt`

---

## 🚀 ¿Qué esperar?

**Cada día a las 23:00:**
- Nuevo archivo `summary_YYYY-MM-DD.json`
- Nuevo mensaje `daily_message.txt`
- Todo listo para revisar o enviar

**Para la evaluación del viernes:**
- 7 resúmenes diarios
- ~84 ejecuciones del monitor
- Métricas completas para evaluar

---

**¡Sistema configurado y listo para usar!** 🎉

Para más detalles, revisa: `docs/DAILY_SUMMARY.md`
