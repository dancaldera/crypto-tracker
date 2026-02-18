# 📊 Análisis Técnico - Documentación Completa

**Última actualización:** 18 Feb 2026
**Modos disponibles:** Conservador | Agresivo

---

## 🎯 RESUMEN RÁPIDO

El sistema de análisis técnico evalúa criptomonedas usando múltiples indicadores y genera señales de compra/venta con puntuaciones de 0-100.

**Comando rápido:**
```bash
# Modo agresivo (recomendado para Daniel)
cd crypto-tracker && node test_aggressive.js

# Modo conservador (predeterminado)
cd crypto-tracker && node test_technical.js
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
crypto-tracker/
├── technical_analyzer.js      # Motor principal de análisis
├── trading_strategy.js         # Gestión de riesgo y estrategias
├── config/
│   ├── aggressive.json         # Configuración agresiva
│   └── conservative.json       # Configuración conservadora
├── logs/
│   ├── portfolio_*.json        # Snapshots diarios
│   └── prices/                 # Datos históricos por día
├── test_aggressive.js          # Test modo agresivo
├── test_technical.js           # Test modo conservador
└── DOCS_ANALISIS_TECNICO.md    # Este documento
```

---

## 📊 INDICADORES IMPLEMENTADOS

### 1. SMA (Simple Moving Average)
**Descripción:** Promedio móvil simple - suaviza el precio para ver tendencias.

**Parámetros:**
- Short: 6 periodos (~12 horas)
- Medium: 12 periodos (~24 horas)
- Long: 36 periodos (~3 días)

**Interpretación:**
- Precio > SMA(12) → Tendencia alcista
- Precio < SMA(12) → Tendencia bajista

---

### 2. EMA (Exponential Moving Average)
**Descripción:** Promedio móvil exponencial - reacciona más rápido a cambios recientes.

**Parámetros:**
- Fast: 6 periodos
- Slow: 12 periodos

**Uso principal:** Detectar **cruces (crossovers)**
- EMA rápida cruza hacia arriba de EMA lenta = COMPRA
- EMA rápida cruza hacia abajo de EMA lenta = VENTA

---

### 3. RSI (Relative Strength Index)
**Descripción:** Oscilador de momento que mide velocidad y magnitud de cambios de precio.

**Rango:** 0-100

**Interpretación:**
| Rango | Estado | Acción |
|-------|--------|--------|
| **0-25** | 🟢 Sobreventa (agresivo) / 0-30 (conservador) | Potencial COMPRA |
| **26-74** | ⚪ Neutral | Esperar |
| **75-100** | 🔴 Sobrecompra (agresivo) / 70-100 (conservador) | Potencial VENTA |

**Notas:**
- RSI < 30: Precio "barato", posible rebote
- RSI > 70: Precio "caro", posible corrección
- El modo agresivo usa umbrales más sensibles (25/75 vs 30/70)

---

### 4. MACD (Moving Average Convergence Divergence)
**Descripción:** Indicador de tendencia y momento que muestra la relación entre dos EMAs.

**Componentes:**
- **MACD Line:** EMA(12) - EMA(26)
- **Signal Line:** EMA(9) del MACD
- **Histogram:** MACD - Signal

**Parámetros:**
- Fast Period: 12
- Slow Period: 26
- Signal Period: 9

**Interpretación:**

| Situación | Interpretación | Acción |
|-----------|----------------|--------|
| **MACD > Signal** | Momentum alcista | ✅ Positivo |
| **MACD < Signal** | Momentum bajista | ⚠️ Negativo |
| **Crossover MACD↑Signal** | Cruzamiento alcista | 🟢 COMPRA fuerte |
| **Crossover MACD↓Signal** | Cruzamiento bajista | 🔴 VENTA fuerte |

**Ejemplo práctico:**
```
MACD: 150.23
Signal: 120.50
Histogram: 29.73
Trend: BULLISH ✅
```

---

### 5. Bollinger Bands (Bandas de Bollinger)
**Descripción:** Bandas que rodean el precio, midiendo volatilidad y niveles de sobrecompra/sobreventa.

**Componentes:**
- **Upper Band:** SMA(20) + (2 × StdDev)
- **Middle Band:** SMA(20)
- **Lower Band:** SMA(20) - (2 × StdDev)

**Parámetros:**
- Period: 20
- Std Dev: 2

**Interpretación:**

| Posición | %B (Position) | Interpretación | Acción |
|----------|----------------|----------------|--------|
| **Upper** | > 80% | 🟡 Cerca de banda superior | Sobrecompra potencial |
| **Middle** | 20-80% | ⚪ Dentro de bandas | Normal |
| **Lower** | < 20% | 🟢 Cerca de banda inferior | Sobreventa potencial |

**Ancho de bandas (Bandwidth):**
- **Ancho < 2%:** Baja volatilidad, posible movimiento fuerte próximamente
- **Ancho > 4%:** Alta volatilidad, mercado activo

**Ejemplo práctico:**
```
Upper Band: $1,250,000
Middle Band: $1,180,000
Lower Band: $1,110,000
Current Price: $1,235,000
%B: 71.4% (MIDDLE)
Bandwidth: 5.9% (WIDE - activo)
```

---

### 6. Volatilidad
**Descripción:** Desviación estándar del precio en el periodo.

**Interpretación:**
- **Alta volatilidad:** Mayores riesgos + mayores oportunidades
- **Baja volatilidad:** Movimientos más previsibles pero más pequeños

**Uso:** Determinar tamaño de posición y stops

---

### 7. Trend Detection
**Descripción:** Detecta dirección de la tendencia basándose en la pendiente del SMA.

**Clasificación:**
- 📈 **BULLISH:** Tendencia alcista (subiendo)
- 📉 **BEARISH:** Tendencia bajista (bajando)
- ➡️ **NEUTRAL:** Sin dirección clara

**Fuerza (0-1):**
- > 0.7: Tendencia fuerte
- 0.3-0.7: Tendencia moderada
- < 0.3: Tendencia débil

---

## 🎲 SCORE DE SEÑAL (0-100)

El sistema combina todos los indicadores en un score numérico:

| Score | Señal | Interpretación | Acción |
|-------|-------|----------------|--------|
| **70-100** | STRONG_BUY | Múltiples indicadores alcistas | 🟢 Comprar fuerte |
| **60-69** | BUY | Predominio alcista | 🟢 Comprar |
| **41-59** | HOLD | Indicadores mixtos | ⚪ Mantener |
| **31-40** | SELL | Predominio bajista | 🔴 Vender |
| **0-30** | STRONG_SELL | Múltiples indicadores bajistas | 🔴 Vender fuerte |

**Confianza (0-100%):**
- Mide qué tan lejos está el score de neutral (50)
- 100% = máxima confianza en la señal
- 0% = completamente neutral

---

## ⚙️ CONFIGURACIÓN

### Modo Conservador
**Archivo:** `config/conservative.json`

```json
{
  "riskParams": {
    "maxPositionSizePercent": 30,    // Max 30% en un activo
    "minTradePercent": 1,            // Min 1% del portfolio
    "maxDailyTrades": 5,             // Max 5 trades por día
    "maxDailyLossPercent": 2,        // Stop loss diario 2%
    "takeProfitPercent": 5,          // Take profit 5%
    "stopLossPercent": 3,            // Stop loss por trade 3%
    "allocationWeight": 0.4,         // 40% peso allocation
    "technicalWeight": 0.6           // 60% peso técnico
  },
  "thresholds": {
    "rsi": {
      "oversold": 30,                // RSI < 30 = compra
      "overbought": 70               // RSI > 70 = venta
    }
  }
}
```

---

### Modo Agresivo ⚡
**Archivo:** `config/aggressive.json`

```json
{
  "riskParams": {
    "maxPositionSizePercent": 40,    // Max 40% en un activo
    "minTradePercent": 0.5,          // Min 0.5% del portfolio
    "maxDailyTrades": 10,            // Max 10 trades por día
    "maxDailyLossPercent": 2,        // Stop loss diario 2%
    "takeProfitPercent": 4,          // Take profit 4% (más rápido)
    "stopLossPercent": 1.5,          // Stop loss 1.5% (más ajustado)
    "allocationWeight": 0.3,         // 30% peso allocation
    "technicalWeight": 0.7           // 70% peso técnico (más reacción)
  },
  "thresholds": {
    "rsi": {
      "oversold": 25,                // RSI < 25 = compra (más sensible)
      "overbought": 75               // RSI > 75 = venta (más sensible)
    }
  }
}
```

**Diferencias clave:**
- ✅ Más trades por día (10 vs 5)
- ✅ Stop loss más ajustado (1.5% vs 3%) = mayor riesgo
- ✅ Take profit más rápido (4% vs 5%) = captura ganancias más rápido
- ✅ RSI más sensible (25/75 vs 30/70) = más señales
- ✅ Mayor peso a indicadores técnicos (70% vs 60%)

---

## 🚀 CÓMO USAR

### Paso 1: Ejecutar análisis
```bash
# Modo agresivo
cd /home/dc/.openclaw/workspace/crypto-tracker
node test_aggressive.js
```

### Paso 2: Interpretar resultados

Ejemplo de salida:
```
BTC ($1,159,030 MXN)
  ├─ Signal: BUY (Score: 62.5/100)
  ├─ Confidence: 25%
  ├─ RSI: 28.3 🟢 Oversold
  ├─ Trend: 📈 BULLISH
  ├─ MACD: 📈 150.23 (Signal: 120.50) ⚡ BUY
  ├─ BB: 🟢 LOWER (18.5%)
  │  └─ Width: 3.2%
  ├─ Volatility: 0.45%
  └─ vs SMA(12): 📈 1.25%
```

**Análisis:**
- ✅ **BUY** con score 62.5 = señal de compra moderada
- 🟢 **RSI 28.3** = sobreventa (buena oportunidad de entrada)
- 📈 **Tendencia alcista** = el mercado sube
- ⚡ **MACD crossover BUY** = confirmación técnica fuerte
- 🟢 **BB en banda inferior** = precio "barato"
- ⚪ **25% confianza** = señal moderada, no fuerte

### Paso 3: Tomar decisión

Basado en el ejemplo anterior:
```
🟢 BTC: Comprar
  - Score: 62.5/100
  - Confianza: 25%
  - Indicadores clave:
    • MACD: 📈 Alcista
    • ⚡ Crossover: BUY
    • Bollinger: 🟢 Sobreventa (18.5%)
    • Ancho bandas: 3.2% (✅ Normal)
    • RSI: 28.3 🟢 Sobreventa
```

**Acción:** Comprar pequeño porción del portafolio en BTC.

---

## 🎓 GUÍA PARA DANIEL

### Nivel Básico (Lo que ya sabes)
✅ Qué es RSI
✅ Qué es tendencia
✅ Qué son SMA/EMA

### Nivel Intermedio (Aprende ahora)
📚 MACD y crossovers
📚 Bollinger Bands y posición %B
📚 Interpretar score de señal

### Nivel Avanzado (Próximos pasos)
🔬 Combinar múltiples indicadores
🔬 Gestionar tamaño de posición según volatilidad
🔬 Divergencias en MACD y RSI

---

## ⚠️ ADVERTENCIAS

### Riesgos del modo agresivo
1. **Stop loss más ajustado** → Mayor probabilidad de liquidación
2. **Más trades** → Mayor comisión y estrés
3. **Umbrales más sensibles** → Más señales falsas (ruido)

### Recomendaciones
1. **Siempre paper trade primero** por 30 días mínimo
2. **Nunca arriesgues más del 2%** de tu capital por trade
3. **Monitorea constantemente** las posiciones en modo agresivo
4. **Usa take profit** automáticamente (no esperes "el pico")
5. **Mantén un registro** de todas las operaciones y aprende

---

## 📈 REFERENCIA RÁPIDA DE EMOJIS

| Emoji | Significado |
|-------|-------------|
| 🟢 | Compra / Positivo / Alcista |
| 🔴 | Venta / Negativo / Bajista |
| ⚪ | Neutral / Esperar |
| ⚡ | Señal fuerte / Crossover |
| 📈 | Tendencia alcista / Subida |
| 📉 | Tendencia bajista / Bajada |
| ➡️ | Neutro / Sin dirección |
| ⚠️ | Advertencia / Riesgo |
| ✅ | Bueno / Saludable |
| 🔴 | Malo / Peligroso |
| ⚡ | Evento importante |

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "Insufficient data"
**Causa:** No hay suficientes datos históricos para el activo.
**Solución:** Espera más horas de recolección de datos o reduce los periodos.

### Señales contradictorias
**Causa:** Normal en mercados laterales.
**Solución:** Espera mayor claridad, reduce tamaño de posición.

### Muchas señales falsas
**Causa:** Volatilidad alta o umbrales muy sensibles.
**Solución:** Cambia a modo conservador o ajusta umbrales.

---

## 📞 SOPORTE

Para preguntas o problemas:
1. Revisa este documento primero
2. Ejecuta `node test_aggressive.js` para ver estado actual
3. Consulta los logs en `logs/portfolio_*.json`

---

**Versión:** 2.0 (con MACD + Bollinger Bands)
**Autor:** Mint 🌿
**Fecha:** 18 Feb 2026
