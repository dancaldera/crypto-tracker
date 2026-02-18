# 🚀 Guía Rápida - Crypto Tracker

## ✅ Setup completado

El sistema está listo para usar. Aquí está lo que ya configuré:

### 📁 Estructura creada
```
crypto-tracker/
├── monitor.js              # Script principal ✅
├── logger.js               # Sistema de logs ✅
├── config/README.md        # Instrucciones API ✅
├── data/
│   ├── allocations.json    # Estrategia de portafolio ✅
│   └── portfolio.json      # Portafolio de ejemplo ✅
├── logs/                   # Directorio de logs ✅
│   ├── prices/             # Histórico de precios ✅
│   └── trades/             # Registro de trades ✅
└── package.json            # Dependencias instaladas ✅
```

## 🎯 Cómo usarlo

### 1. Ejecutar monitoreo manual
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
node monitor.js
```

### 2. Ver reporte de PnL
```bash
npm run report
```

### 3. Configurar tu portafolio real
Edita `data/portfolio.json` con tus holdings reales:
```json
{
  "assets": {
    "BTC": 0.1,    # Tu cantidad de BTC
    "ETH": 2.0,    # Tu cantidad de ETH
    "USDC": 500    # Tu cantidad de USDC
  }
}
```

### 4. Ajustar estrategia de inversión
Edita `data/allocations.json`:
```json
{
  "target_allocations": {
    "BTC": 0.50,    # 50% en BTC
    "ETH": 0.30,    # 30% en ETH
    "USDC": 0.20    # 20% en USDC
  },
  "rebalance_settings": {
    "threshold_percent": 10  # Rebalancear si desvía >10%
  }
}
```

## 📊 Lo que hace el sistema ahora

### ✅ Funcionando YA
- Obtiene precios en tiempo real (Bitso + Coinbase públicos)
- Calcula valor total del portafolio
- Muestra allocations actuales vs objetivo
- Genera alertas de rebalanceo
- Guarda logs de precios (CSV)
- Guarda logs de portafolio (JSON)
- Calcula PnL cuando hay trades

### 🔒 Modo seguro (default)
- **NO ejecuta trades** automáticamente
- Solo lee y analiza datos
- Tú decides cuándo activar trading

## 📈 Logs y cálculos

### Precios guardados en `logs/prices/`
```
BTC_2026-02-13.csv:
1770991315661,1153880
1770991315661,1153900
...
```

### Portafolio guardado en `logs/portfolio_YYYY-MM-DD.json`
```json
[
  {
    "timestamp": 1770991316761,
    "datetime": "2026-02-13T14:01:56.761Z",
    "portfolio": {
      "assets": { "BTC": {...}, "ETH": {...} },
      "total_value": 74759.5
    }
  }
]
```

## ⚙️ Automatización (Opcional)

Para ejecutar automáticamente cada hora, puedes agregar un cron job:

```bash
# Editar crontab
crontab -e

# Agregar línea:
0 * * * * cd /home/dc/.openclaw/workspace/crypto-tracker && /usr/bin/node monitor.js >> logs/cron.log 2>&1
```

## 🔧 Para activar trading real (Opcional)

### 1. Obtener API Keys
- **Bitso**: https://bitso.com/developer-platform/
- **Coinbase**: https://www.coinbase.com/settings/api

### 2. Crear archivo `.env`
```bash
cp .env.example .env
# Editar .env con tus API keys
```

### 3. Activar trading (¡CUIDADO!)
Edita `.env`:
```env
ENABLE_TRADING=true  # ⚠️ SOLO cuando estés seguro
```

⚠️ **ADVERTENCIA**: El trading automático puede generar pérdidas reales. Empieza con permisos de solo lectura y usa cuentas de prueba.

## 📊 Ejemplo de salida

```
🪙 Starting Crypto Monitor...
Trading enabled: NO
Fetching prices...
Prices fetched: {
  BTC: { source: 'bitso', price: 1153880, ... },
  ETH: { source: 'bitso', price: 33931, ... },
  USDC: { source: 'coinbase', price: 1, ... }
}

💰 Total Value: $74759.50

*Current Allocation:*
📈 BTC: 77.17% (target: 50.00%)
📉 ETH: 22.69% (target: 30.00%)
📉 USDC: 0.13% (target: 20.00%)

⚠️ *Rebalance Recommended:*
SELL BTC: 27.17% deviation
BUY USDC: 19.87% deviation
```

## 🎓 Próximos pasos

1. **Prueba manual**: Ejecuta `node monitor.js` varias veces
2. **Ajusta tu portafolio**: Edita `data/portfolio.json` con tus holdings reales
3. **Define estrategia**: Ajusta `data/allocations.json` según tu tolerancia al riesgo
4. **Revisa logs**: Observa cómo se guardan los datos en `logs/`
5. **Automatiza**: Agrega cron job para ejecución automática
6. **(Opcional)** Conecta APIs reales para trading

---

_¿Necesitas ayuda con algún paso? Solo pregunta 🌿_
