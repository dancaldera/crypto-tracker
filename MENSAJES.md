# 📱 Mensajes para Consultar el Sistema

## Mensajes Cortos para Telegram

### 1. Análisis Técnico Completo
```
Análisis técnico completo
```
**Muestra:**
- Señales de todos los activos (BUY/SELL/HOLD)
- RSI de cada activo
- Tendencias (bullish/bearish/neutral)
- Volatilidad
- Recomendaciones

---

### 2. Posiciones que se hicieron
```
Qué posiciones se hicieron hoy?
```
**Muestra:**
- Trades ejecutados en modo paper
- Cantidad y precio de cada trade
- Valor en MXN
- Razón de cada trade
- Score de decisión

---

### 3. Resumen del día
```
Resumen del día
```
**Muestra:**
- Análisis técnico
- Posiciones sugeridas
- Trades ejecutados
- Performance del portfolio
- Recomendaciones

---

### 4. Performance del portfolio
```
Performance (7 días)
```
**Muestra:**
- P&L total
- Performance porcentual
- Rendimiento por activo
- Mejores y peores performers

---

### 5. Estado del sistema
```
Estado del sistema
```
**Muestra:**
- Portfolio actual
- Allocations actuales vs target
- Última ejecución
- Errores si los hay
- Trading mode

---

### 6. Backtest
```
Backtest de la estrategia
```
**Muestra:**
- Qué trades se habrían hecho históricamente
- Métricas de la estrategia
- Nivel de confianza
- Recomendación

---

### 7. Resumen completo (all-in-one)
```
Resumen completo
```
**Muestra:**
- TODO lo anterior en un reporte compacto

---

## Comandos Alternativos

### Por tipo de análisis:

**Solo técnico:**
```
Solo análisis técnico
```

**Solo trades:**
```
Solo trades de hoy
```

**Solo performance:**
```
Solo performance
```

### Por timeframe:

**7 días:**
```
Performance 7 días
```

**30 días:**
```
Performance 30 días
```

**3 días:**
```
Performance 3 días
```

---

## Detalles de Respuestas

### 📊 Análisis Técnico Incluye:
- **Señales:** BUY/SELL/HOLD con score (0-100)
- **RSI:** Nivel de sobrecompra/sobreventa
- **Tendencia:** Dirección del precio
- **Volatilidad:** Cuánto varía el precio
- **Confianza:** Qué tan fuerte es la señal

### 🎯 Posiciones Incluye:
- **Acción:** BUY o SELL
- **Cantidad:** Cuánto comprar/vender
- **Precio:** Precio de ejecución
- **Valor:** Valor en MXN
- **Porcentaje:** % del portfolio
- **Score:** Score compuesto de decisión
- **Razón:** Por qué se tomó la decisión

### 📝 Trades de Hoy Incluye:
- **Timestamp:** Cuándo se ejecutó
- **Tipo:** Paper trade o real
- **Status:** Filled, pending, etc.
- **Portfolio Value:** Valor del portfolio después del trade

### 📈 Performance Incluye:
- **P&L:** Ganancia o pérdida total
- **Performance:** % de cambio
- **Por activo:** Cómo fue cada cripto
- **Mejores/Peores:** Quién ganó/perdió más

---

## Ejemplos de Uso

### Pregunta 1:
```
Análisis técnico completo
```

**Respuesta típica:**
```
📊 TECHNICAL ANALYSIS

BTC ($1,186,330 MXN)
  ├─ Signal: HOLD (Score: 43.2/100)
  ├─ Confidence: 17%
  ├─ RSI: 35.4 ⚪ Neutral
  ├─ Trend: ➡️ NEUTRAL
  └─ Volatility: 0.85%

ETH ($34,497 MXN)
  ├─ Signal: HOLD (Score: 58.7/100)
  ├─ Confidence: 9%
  ├─ RSI: 19.2 🟢 Oversold
  ├─ Trend: ➡️ NEUTRAL
  └─ Volatility: 1.55%

...
```

---

### Pregunta 2:
```
Qué posiciones se hicieron hoy?
```

**Respuesta típica:**
```
🎯 DECISION SUMMARY

🟢 ETH: BUY
   Amount: 0.001178 @ $34,497 MXN
   Value: $40.64 MXN (1.4%)
   Reason: Buy signal (score: 5.4)

🔴 SOL: SELL
   Amount: 0.032904 @ $1,497.53 MXN
   Value: $49.28 MXN (1.6%)
   Reason: Sell signal (score: -6.6)

Total: 2 trades ($89.91 MXN)
```

---

### Pregunta 3:
```
Resumen del día
```

**Respuesta típica:**
```
📊 RESUMEN DIARIO

Análisis Técnico:
  BTC: HOLD (43.2/100)
  ETH: HOLD (58.7/100)
  SOL: SELL (39.3/100)
  USDC: HOLD (49.9/100)

Posiciones:
  🟢 BUY ETH: $40.64 MXN
  🔴 SELL SOL: $49.28 MXN

Performance:
  P&L: -$4.10 MXN (-0.14%)
  Mejor: BTC +0.13%
  Peor: SOL -0.34%
```

---

## Notas Importantes

- Todo está en **modo test** (paper trading)
- No hay dinero real involucrado
- Los trades se simulan y se guardan en logs
- Puedes revisar los logs manualmente si quieres más detalle
- El sistema corre automáticamente cada 2 horas
- Puedes pedir estos reportes en cualquier momento
