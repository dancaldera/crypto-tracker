# 📖 Crypto Tracker - Guía Completa

## 🚀 Comandos Rápidos

### Ver resumen completo del día
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker && ./daily_summary.sh
```

### Análisis técnico
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker && /home/dc/.bun/bin/bun run test_technical.js
```

### Posiciones y trades
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker && /home/dc/.bun/bin/bun run test_trading_strategy.js
```

### Backtest
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker && /home/dc/.bun/bin/bun run backtest_strategy.js
```

### Performance del portfolio
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker && /home/dc/.bun/bin/bun run analyze_performance.js 7
```

---

## 📱 Mensajes para Pedir Información

Ver `MENSAJES.md` para lista completa de mensajes que puedes usar.

### Los más usados:
1. `Análisis técnico completo` - Ve todas las señales técnicas
2. `Qué posiciones se hicieron hoy?` - Ve los trades ejecutados
3. `Resumen del día` - Todo en un reporte
4. `Performance (7 días)` - Ve cómo está tu portfolio
5. `Backtest de la estrategia` - Evalúa la estrategia históricamente

---

## 📊 Sistema Implementado

### 1. Análisis Técnico (`technical_analyzer.js`)

**Indicadores:**
- SMA (Media Móvil Simple) - 3 períodos
- EMA (Media Móvil Exponencial)
- RSI (Índice de Fuerza Relativa)
- Volatilidad
- Detección de tendencia
- Crossover de medias

**Señales:**
- BUY/STRONG_BUY (0-50 score)
- HOLD (50)
- SELL/STRONG_SELL (50-100 score)
- Nivel de confianza (0-100%)

---

### 2. Engine de Trading (`trading_strategy.js`)

**Lógica de decisión:**
```
Score = (AllocationScore × 40%) + (TechnicalScore × 60%)

- AllocationScore: basado en desviación de target
- TechnicalScore: basado en análisis técnico
```

**Parámetros de Risk Management:**
- Max Position: 30% por activo
- Min Trade: 1% del portfolio
- Max Daily Trades: 5
- Daily Stop Loss: -2%
- Take Profit: +5%
- Stop Loss: -3%

---

### 3. Paper Trading

**Características:**
- Simula trades sin dinero real
- Logs estructurados por día
- Tracking de P&L
- Enforce de límites diarios
- Backtesting con datos históricos

---

## 📁 Estructura de Archivos

```
crypto-tracker/
├── monitor.js                  # Monitor principal (cron job)
├── technical_analyzer.js       # Análisis técnico
├── trading_strategy.js         # Engine de decisiones
├── test_technical.js          # Test análisis técnico
├── test_trading_strategy.js   # Test trading
├── backtest_strategy.js       # Backtesting
├── analyze_performance.js      # Análisis de performance
├── daily_summary.sh           # Resumen diario
├── QUICK_START.md             # Comandos rápidos
├── MENSAJES.md                # Mensajes para usar
├── data/
│   ├── allocations.json        # Target allocations
│   └── portfolio_test.json     # Portfolio de prueba
└── logs/
    ├── prices/                 # Histórico de precios
    ├── trades/                 # Logs de trades
    │   ├── trades_YYYY-MM-DD.json
    │   └── daily_state_YYYY-MM-DD.json
    └── portfolio_YYYY-MM-DD.json
```

---

## 📊 Interpretar Señales

### Niveles de Confianza
- **0-20%** 🟡 Señales débiles, esperar
- **20-50%** 🟡 Señales moderadas, cautela
- **50-70%** 🟢 Señales fuertes, considerar
- **70-100%** 🟢 Señales muy fuertes, considerar agresivo

### RSI
- **< 30** 🟢 Sobreventa (posible compra)
- **30-70** ⚪ Neutral
- **> 70** 🔴 Sobrecompra (posible venta)

### Tendencia
- **📈 BULLISH** = Alcista
- **📉 BEARISH** = Bajista
- **➡️ NEUTRAL** = Lateral

### Señales de Trading
- **🟢 BUY / STRONG_BUY** = Comprar
- **🔴 SELL / STRONG_SELL** = Vender
- **⚪ HOLD** = Mantener

---

## 🔧 Configuración

### Modos de Operación
- **TEST (current)**: Paper trading, no hay dinero real
- **REAL**: Requiere API keys de Bitso para trading real

### Cambiar modo
```bash
# Modo test (default)
PORTFOLIO_MODE=test bun run monitor.js

# Modo real
PORTFOLIO_MODE=real bun run monitor.js
```

---

## 📈 Performance Actual

**Portfolio:** TEST_CONSERVADOR
**Valor:** ~$3,000 MXN
**Activos:** BTC (40%), ETH (25%), SOL (15%), USDC (20%)

**Performance últimos 7 días:**
- P&L: -$10.10 MXN (-0.34%)
- Mejor: SOL +2.08%
- Peor: ETH -2.58%

---

## 🚀 Próximos Pasos

1. **Dejar en testing varios días** - Acumular datos históricos
2. **Revisar logs diarios** - Evaluar calidad de decisiones
3. **Ajustar parámetros** - Si la estrategia parece débil o agresiva
4. **Configurar API keys** - Cuando quieras pasar a trading real
5. **Activar trading real** - Con cautela, empezar pequeño

---

## ❓ Preguntas Frecuentes

### ¿Es seguro el trading real?
- Sí, pero empieza pequeño (ej. $500-1000 USD)
- Los límites de stop-loss protegen contra grandes pérdidas
- Puedes detenerlo en cualquier momento

### ¿Puedo cambiar los parámetros?
- Sí, todos los parámetros están en `data/allocations.json`
- Ajusta según tu tolerancia al riesgo

### ¿Qué tan seguido corre el sistema?
- Cada 2 horas vía cron job
- También puedes correrlo manualmente cuando quieras

### ¿Puedo ver los logs históricos?
- Sí, están en `./logs/trades/` y `./logs/prices/`
- Los precios se guardan en CSV por día

### ¿Qué pasa si hay error?
- El sistema fallback a portfolio simulado
- Los errores se loguean en `logs/`
- El sistema sigue funcionando con datos simulados

---

## 💡 Tips

- **Revisa el resumen diario** - Es la mejor forma de ver todo
- **Espera señales fuertes** - Confianza > 50% es ideal
- **No trades de fricción** - El sistema evita trades pequeños inútiles
- **El backtest es tu amigo** - Úsalo para evaluar la estrategia
- **Paper trading primero** - No pases a real sin probar

---

## 📞 Soporte

Para ayuda específica:
1. Revisa `QUICK_START.md` para comandos
2. Revisa `MENSAJES.md` para qué preguntar
3. Revisa los logs en `./logs/` para detalles técnicos
4. Pide ayuda directa con: "Ayuda con [lo que necesitas]"

---

**Última actualización:** 2026-02-15
**Versión:** 1.0
**Estado:** ✅ Funcional en modo test
