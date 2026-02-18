# 📡 URLs de API Usadas - Crypto Tracker

## Bitso API (Pública - No requiere API key)

### Endpoint Base
```
https://api.bitso.com/v3/ticker/?book={par}
```

### URLs Específicas

| Asset | Par | URL Completa | Respuesta (ejemplo) |
|-------|-----|-------------|----------------------|
| **BTC** | btc_mxn | `https://api.bitso.com/v3/ticker/?book=btc_mxn` | `{"success":true,"payload":{"last":"1165460",...}}` |
| **ETH** | eth_mxn | `https://api.bitso.com/v3/ticker/?book=eth_mxn` | `{"success":true,"payload":{"last":"34242",...}}` |
| **USDC** | usd_mxn | `https://api.bitso.com/v3/ticker/?book=usd_mxn` | `{"success":true,"payload":{"last":"17.192",...}}` |

### Código en `monitor.js`

```javascript
// Línea que hace el request
const response = await axios.get(
  `https://api.bitso.com/v3/ticker/?book=${bitsoBook}`
);
```

---

## Coinbase API (Pública - No requiere API key)

### Endpoint Base
```
https://api.coinbase.com/v2/prices/{ASSET}-{CURRENCY}/spot
```

### URLs Específicas

| Asset | Par | URL Completa |
|-------|-----|-------------|
| **USDC** | USDC-USD | `https://api.coinbase.com/v2/prices/USDC-USD/spot` |

### Respuesta
```json
{"data":{"amount":"1","base":"USDC","currency":"USD"}}
```

**Nota:** Ya NO usamos esta URL. Cambiamos a Bitso `usd_mxn`.

---

## 💡 Por qué Bitso `usd_mxn` y no `usdc_mxn`?

Bitso NO tiene el par directo `usdc_mxn`, pero tiene:

1. **USD_MXN** - Tipo de cambio USD → MXN ($17.19 por dólar)
2. **USDC** es una stablecoin que vale **$1 USD**

Entonces calculamos:
```
USDC en MXN = Cantidad_USDC × Precio_USD_MXN
            = 30.5 × $17.19
            = $524.36 MXN
```

---

## 🔍 Prueba las URLs tú mismo

```bash
# BTC
curl "https://api.bitso.com/v3/ticker/?book=btc_mxn"

# ETH
curl "https://api.bitso.com/v3/ticker/?book=eth_mxn"

# USD a MXN (para convertir USDC)
curl "https://api.bitso.com/v3/ticker/?book=usd_mxn"

# Coinbase (ya no usamos, pero puedes probar)
curl "https://api.coinbase.com/v2/prices/USDC-USD/spot"
```

---

## 📊 Campos de Respuesta Importantes

### Bitso Response
```json
{
  "success": true,
  "payload": {
    "book": "btc_mxn",
    "last": "1165460",        ← Precio actual (ESTE USAMOS)
    "high": "1175000",
    "low": "1150000",
    "vwap": "1162000",
    "volume": "123.456789",
    "created_at": "2026-02-13T14:50:00+00:00"
  }
}
```

### Coinbase Response
```json
{
  "data": {
    "amount": "1",            ← Precio actual
    "base": "USDC",
    "currency": "USD"
  }
}
```

---

## 🆚 Bitso vs Coinbase

| Característica | Bitso | Coinbase |
|---------------|--------|-----------|
| Moneda principal | MXN (pesos mexicanos) | USD (dólares) |
| Pares disponibles | btc_mxn, eth_mxn, usd_mxn | BTC-USD, ETH-USD, USDC-USD |
| Para México | ✅ Mejor opción | ⚠️ Requiere conversión |
| API key para precios | ❌ No necesaria | ❌ No necesaria |
| API key para trading | ✅ Necesaria | ✅ Necesaria |

---

## 🎯 Resumen Actual del Sistema

**Solo usamos Bitso API pública:**

1. `https://api.bitso.com/v3/ticker/?book=btc_mxn` → BTC en MXN
2. `https://api.bitbase.com/v3/ticker/?book=eth_mxn` → ETH en MXN
3. `https://api.bitso.com/v3/ticker/?book=usd_mxn` → USD a MXN (para USDC)

**Todo en MXN** → Cálculos consistentes 🇲🇽
