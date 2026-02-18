# ✅ Sistema Automatizado - Crypto Tracker

## 🎯 Listo para producción

El sistema está **automatizado y funcionando**. Aquí está el resumen:

---

## ⚙️ Automatización configurada

### Cron Job Activo
```bash
0 */2 * * * /home/dc/.openclaw/workspace/crypto-tracker/monitor_test.sh
```

**Ejecuta:** Cada 2 horas (00:00, 02:00, 04:00, ..., 22:00)
**Logs:** `logs/cron_test.log`

### Editar cron jobs
```bash
crontab -e
```

---

## 💰 Propuesta para cartera de test

### Monto recomendado: **$9,800 MXN ($500 USD)**

**Desglose:**
| Asset | % | Valor MXN | Cantidad |
|-------|---|-----------|----------|
| BTC | 50% | $4,900 | 0.00425 BTC |
| ETH | 30% | $2,940 | 0.0865 ETH |
| USDC | 20% | $1,960 | 100 USDC |

**¿Por qué este monto?**
- ✅ Suficiente para probar la lógica de rebalanceo
- ✅ Las comisiones no se comen todo el portfolio
- ✅ Riesgo manejable (~$100 MXN de pérdida si cae 20%)
- ✅ Balance perfecto entre riesgo y aprendizaje

**Ver detalles completos en:** `docs/TESTING_PROPOSAL.md`

**Alternativas:**
- 🟢 Conservador: $3,000 MXN ($150 USD)
- 🔴 Agresivo: $19,600 MXN ($1,000 USD)

---

## 📁 Archivos creados

### Scripts
- `monitor_test.sh` - Script wrapper para cron jobs
- `status.sh` - Ver estado del sistema

### Portafolios
- `data/portfolio.json` - Portafolio principal
- `data/portfolio_test.json` - Portafolio de test (usado por cron)

### Documentación
- `docs/TESTING_PROPOSAL.md` - Análisis de montos y riesgos
- `QUICKSTART.md` - Guía rápida
- `CRON_SETUP.md` - Este archivo

---

## 🚀 Comandos útiles

### Ver estado del sistema
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
./status.sh
```

### Ejecutar manualmente (ahora)
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
node monitor.js
```

### Ver logs del cron
```bash
tail -f /home/dc/.openclaw/workspace/crypto-tracker/logs/cron_test.log
```

### Ver último run
```bash
cat /home/dc/.openclaw/workspace/crypto-tracker/logs/last_test_run.txt
```

### Ver reporte PnL
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
npm run report
```

---

## 📊 Monitoreo en curso

**Frecuencia:** Cada 2 horas
**Log location:** `logs/cron_test.log`
**Portfolio tracking:** `logs/portfolio_YYYY-MM-DD.json`
**Price history:** `logs/prices/`

El sistema ahora:
- ✅ Obtiene precios automáticamente
- ✅ Calcula allocations
- ✅ Detecta desviaciones
- ✅ Guarda logs para PnL
- ✅ Genera alertas en consola

---

## 🔮 Próximos pasos

### 1. Decidir monto para test
- ¿$3,000, $9,800, o $19,600 MXN?

### 2. Conectar API keys (opcional, para trading real)
- Ver instrucciones en `config/README.md`
- Por ahora usa APIs públicas (solo lectura)

### 3. Ajustar allocations
- Editar `data/allocations.json` según tu perfil de riesgo

### 4. Monitorear logs
- Ver qué alertas genera el sistema
- Ajustar thresholds si necesario

---

## ⚠️ Importante

- **El sistema está en modo SAFE** - NO ejecuta trades
- Para activar trading, debes configurar `ENABLE_TRADING=true` en `.env`
- El cron job usa `portfolio_test.json` por ahora
- Puedes cambiar a `portfolio.json` en el script si prefieres

---

## 📞 ¿Necesitas ayuda?

Ejecuta `./status.sh` para ver el estado actual
Revisa `docs/TESTING_PROPOSAL.md` para detalles sobre montos
Lee `QUICKSTART.md` para pasos detallados

---

_🌿 Mint: Sistema automatizado y listo para testing_
