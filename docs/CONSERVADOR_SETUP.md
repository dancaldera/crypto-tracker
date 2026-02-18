# ✅ Setup Modo Conservador + Bitso API

## 🎯 Estado actual

✅ **Cron job activo**: Cada 2 horas
✅ **Portafolio conservador**: $3,000 MXN ($150 USD)
✅ **Sistema Bitso API**: Listo para configurar
✅ **Modo SAFE**: Sin trading automático

---

## 💰 Portafolio Configurado (Conservador)

**Monto total:** ~$3,000 MXN ($150 USD)

| Asset | % | Valor MXN | Cantidad |
|-------|---|-----------|----------|
| BTC | 50% | $1,500 | 0.0013 BTC |
| ETH | 30% | $900 | 0.0265 ETH |
| USDC | 20% | $600 | 30.5 USDC |

**Archivos:**
- `data/portfolio_test.json` - Portafolio conservador
- `monitor_test.sh` - Script con `PORTFOLIO_MODE=test`

---

## 🔧 Pasos para activar Bitso API

### 1. Obtener tus API Keys de Bitso

1. Ve a https://bitso.com
2. Inicia sesión o crea tu cuenta
3. Ve a **Settings → API**
4. Crea nueva API Key con permisos:
   - ✅ `read`
   - ✅ `balance`
   - ✅ `trades`
   - ❌ `trade` (NO activar)
   - ❌ `withdraw` (NO activar)

⚠️ **IMPORTANTE:** Guarda tu API Key y Secret - solo se muestran una vez.

### 2. Configurar el sistema

```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
cp .env.example .env
nano .env
```

Agrega tus credenciales:

```env
# Bitso API Keys
BITSO_API_KEY=tu_api_key_aqui
BITSO_API_SECRET=tu_api_secret_aqui

# Coinbase (opcional)
COINBASE_API_KEY=
COINBASE_API_SECRET=
COINBASE_PASSPHRASE=

# Configuración
ENABLE_TRADING=false
MONITORING_INTERVAL_MINUTES=60
REBALANCE_THRESHOLD_PERCENT=10
```

### 3. Probar la conexión

```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
node test_bitso.js
```

Si funciona, verás:
```
✅ Connection test passed
✅ Balance retrieved successfully
✅ Ticker retrieved successfully
```

### 4. Ejecutar el monitor con datos reales

```bash
node monitor.js
```

O usa el script de test:
```bash
./monitor_test.sh
```

---

## 📊 Qué verás cuando funcione

### Sin API (actual):
```
⚠️  No Bitso API keys configured, using simulated portfolio
📁 Loading portfolio: test
```

### Con API (cuando lo configures):
```
🔌 Connecting to Bitso API...
✅ Successfully connected to Bitso API
📊 Portfolio loaded from Bitso: $XXXX.XX MXN
🔢 Assets: X
```

---

## 🎯 Próximos pasos después de configurar API

### 1. Verificar tu portafolio real en Bitso
```bash
node test_bitso.js
```

### 2. Actualizar portfolio_test.json con tus holdings reales
Si ya tienes criptomonedas en Bitso, el sistema leerá automáticamente.
Si no, tienes que comprar:
- 0.0013 BTC
- 0.0265 ETH
- 30.5 USDC

### 3. Monitorear los logs
```bash
tail -f logs/cron_test.log
```

### 4. Revisar alertas de rebalanceo
El sistema te avisará cuando tus allocations se desvíen más del 10%.

---

## 📋 Documentación completa

- **Setup Bitso:** `config/BITSO_SETUP.md`
- **Propuesta montos:** `docs/TESTING_PROPOSAL.md`
- **Guía rápida:** `QUICKSTART.md`
- **Estado sistema:** `CRON_SETUP.md`

---

## ⚠️ Recuerda

- **Modo SAFE:** El sistema SOLO lee datos, NO ejecuta trades
- **Permisos mínimos:** No actives permisos `trade` o `withdraw`
- **Seguridad:** Nunca compartas tus API keys
- **Testing:** Esto es un portafolio de test, usa dinero que estés dispuesto a perder

---

## 🆘 Si necesitas ayuda

### Error: "No Bitso API credentials found"
→ Configura `BITSO_API_KEY` y `BITSO_API_SECRET` en `.env`

### Error: "Invalid API Key"
→ Verifica que la API Key esté correcta (32 caracteres hex)

### Error: "Invalid Signature"
→ Verifica que el API Secret esté correcto (64 caracteres hex)

### Error: "Permission Denied"
→ Verifica que los permisos estén activos en Bitso

---

**¿Listo para configurar tus API keys?** 🌿

Sigue los pasos arriba y avísame cuando hayas probado la conexión.
