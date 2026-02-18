# 🔐 Configuración de APIs

## Coinbase API

### Obtener API Keys

1. Ve a https://www.coinbase.com/settings/api
2. Crea una nueva API key
3. Permisos recomendados para empezar:
   - ✅ **Read** - Ver saldo, transacciones, precios
   - ✅ **View** - Ver portafolio
   - ❌ **Trade** - NO activar aún (solo cuando quieras trading automático)
4. Guarda:
   - API Key
   - API Secret
   - Passphrase

### Rate Limits
- Público: 3 req/s
- Privado: 5 req/s

---

## Bitso API

### Obtener API Keys

1. Ve a https://bitso.com/developer-platform/
2. Registra tu aplicación
3. Crea API keys con permisos:
   - ✅ **read** - Leer saldos y precios
   - ✅ **history** - Ver historial
   - ❌ **trade** - NO activar aún
4. Guarda:
   - API Key
   - API Secret

### Documentación
https://docs.bitso.com/bitso-api/docs/api-overview

---

## Configurar en el sistema

Crea archivo `.env` en `crypto-tracker/`:

```env
# Coinbase
COINBASE_API_KEY=your_api_key_here
COINBASE_API_SECRET=your_api_secret_here
COINBASE_PASSPHRASE=your_passphrase_here

# Bitso
BITSO_API_KEY=your_api_key_here
BITSO_API_SECRET=your_api_secret_here

# Configuración
MONITORING_INTERVAL_MINUTES=60
REBALANCE_THRESHOLD_PERCENT=10  # Rebalancear si desviación > 10%
TELEGRAM_ALERTS=true
```

## ⚠️ Seguridad

- **NUNCA** commitear `.env` a git
- Usar permisos mínimos posibles
- Rotar keys periódicamente
- Limitar IP addresses si la plataforma lo permite

---

_Recuerda: empieza con permisos de solo lectura. Activa trading solo cuando estés cómodo con el sistema._
