# Crypto Tracker - Comandos Rápidos

## 📊 Análisis Técnico Completo

### Ver análisis técnico actual
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker && node test_technical.js
```

**Muestra:**
- Señales BUY/SELL/HOLD por activo
- RSI (sobrecompra/sobreventa)
- Tendencia (bullish/bearish/neutral)
- Volatilidad
- Recomendaciones de trading

### Ver reporte con formato bonito
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker && ./tech_analysis.sh
```

## 🎯 Posiciones y Trades (Modo Test)

### Ver decisiones de trading actuales
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker && node test_trading_strategy.js
```

**Muestra:**
- Posiciones que se tomaron
- Cantidad y precio de cada trade
- Score compuesto de decisión
- Razón de cada trade
- Resumen del día

### Correr backtest con datos históricos
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker && node backtest_strategy.js
```

**Muestra:**
- Qué trades se habrían hecho con datos históricos
- Métricas de la estrategia
- Nivel de confianza de las señales
- Recomendación

## 📝 Ver Logs de Trades

### Ver trades de hoy
```bash
cat /home/dc/.openclaw/workspace/crypto-tracker/logs/trades/trades_2026-02-15.json
```

### Ver estado del día
```bash
cat /home/dc/.openclaw/workspace/crypto-tracker/logs/trades/daily_state_2026-02-15.json
```

### Ver todos los logs de trades
```bash
ls -la /home/dc/.openclaw/workspace/crypto-tracker/logs/trades/
```

## 📈 Ver Performance del Portfolio

### Análisis de 7 días
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker && node analyze_performance.js 7
```

### Análisis de 30 días
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker && node analyze_performance.js 30
```

## 🤖 Ejecutar Monitor Completo

### Correr monitor con análisis técnico + trading
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker && PORTFOLIO_MODE=test node monitor.js
```

**Ejecuta:**
1. Fetch de precios
2. Análisis técnico de todos los activos
3. Decisión de posiciones
4. Paper trading (si hay señales fuertes)
5. Alerta con señales

## 📋 Resumen Diario Completo

### Comando all-in-one (recomendado)
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker && bash -c '
echo "📊 ANÁLISIS TÉCNICO"
echo "=================="
node test_technical.js | grep -A 5 "TECHNICAL ANALYSIS"

echo -e "\n🎯 POSICIONES SUGERIDAS"
echo "========================"
node test_trading_strategy.js | grep -A 30 "DECIDING POSITIONS"

echo -e "\n📝 TRADES DE HOY"
echo "================="
if [ -f logs/trades/trades_2026-02-15.json ]; then
  cat logs/trades/trades_2026-02-15.json | jq -r ".[] | \"\(.datetime) - Portfolio: $\(.portfolioValue) MXN\nTrades: \(.trades | length)\""
  echo ""
  cat logs/trades/trades_2026-02-15.json | jq -r ".[].trades[] | \"\(.executedAt | . / 1000 | strftime(\"%H:%M\")) \(.action) \(.asset): \(.amount) @ $\(.price) MXN ($\(.tradeValue) MXN)\""
else
  echo "No hay trades hoy"
fi
'
```

## 📱 Mensajes para Pedir Información

### Opción 1: Análisis completo
```
Dame el análisis técnico completo
```

### Opción 2: Qué trades se hicieron hoy
```
Qué posiciones se hicieron hoy?
```

### Opción 3: Resumen del día
```
Resumen del día de trading
```

### Opción 4: Performance del portfolio
```
Performance de mi portfolio (7 días)
```

### Opción 5: Backtest
```
Corre el backtest de la estrategia
```

### Opción 6: Estado completo
```
Estado completo del sistema
```

## 📊 Interpretar Resultados

### Señales Técnicas
- 🟢 BUY / STRONG_BUY = Comprar señal
- 🔴 SELL / STRONG_SELL = Vender señal
- ⚪ HOLD = Mantener posición

### Niveles de Confianza
- 0-20% = Señales débiles, esperar
- 20-50% = Señales moderadas, considerar con cautela
- 50-70% = Señales fuertes, considerar ejecución
- 70-100% = Señales muy fuertes, considerar ejecución agresiva

### RSI
- < 30 = Sobreventa (posible compra)
- 30-70 = Neutral
- > 70 = Sobrecompra (posible venta)

### Tendencia
- 📈 BULLISH = Alcista
- 📉 BEARISH = Bajista
- ➡️ NEUTRAL = Lateral

## 🚀 Script de Resumen Diario

Crear script `daily_summary.sh`:
```bash
#!/bin/bash
cd /home/dc/.openclaw/workspace/crypto-tracker

echo "📊 RESUMEN DIARIO - $(date '+%Y-%m-%d %H:%M')"
echo "==========================================="
echo ""

# Análisis técnico
echo "📊 ANÁLISIS TÉCNICO"
echo "-----------------"
node test_technical.js 2>/dev/null | tail -30

echo ""
echo "🎯 POSICIONES"
echo "-------------"
node test_trading_strategy.js 2>/dev/null | grep -A 20 "DECISION SUMMARY"

echo ""
echo "📝 TRADES DE HOY"
echo "----------------"
if [ -f logs/trades/trades_*.json ]; then
  LATEST=$(ls -t logs/trades/trades_*.json | head -1)
  cat "$LATEST" | jq -r '.[] | "Portfolio: $\(.portfolioValue) MXN\nTrades: \(.trades | length)"' 2>/dev/null || echo "No hay trades"
fi

echo ""
echo "📈 PERFORMANCE"
echo "-------------"
node analyze_performance.js 7 2>/dev/null | grep -A 15 "PORTFOLIO SUMMARY"
```

Usar:
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker && chmod +x daily_summary.sh && ./daily_summary.sh
```
