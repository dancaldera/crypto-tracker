# 🚀 SISTEMA AGRESIVO CONFIGURADO - Resumen para Daniel

## ✅ Lo que ya configuré

### 1. **Indicadores Nuevos** (implementados en `technical_analyzer.js`)

#### **MACD (Moving Average Convergence Divergence)**
- Detecta tendencias y cambios de momentum
- 3 componentes: MACD Line, Signal Line, Histogram
- Crossover de MACD → Señal fuerte de compra/venta

**Cómo leerlo:**
```
MACD: 📈 150.23 (Signal: 120.50) ⚡ BUY
→ MACD > Signal = Alcista
→ Crossover = Señal fuerte
```

---

#### **Bollinger Bands (Bandas de Bollinger)**
- Miden volatilidad y niveles de sobrecompra/sobreventa
- 3 bandas: Upper, Middle (SMA), Lower
- %B indica posición del precio (0% = Lower, 100% = Upper)

**Cómo leerlo:**
```
BB: 🟢 LOWER (18.5%)
Width: 3.2% (Normal)

🟢 LOWER (<20%) → Sobreventa → Potencial COMPRA
🔴 UPPER (>80%) → Sobrecompra → Potencial VENTA
⚪ MIDDLE (20-80%) → Neutral

Width < 2% → Bandas estrechas → Posible movimiento fuerte
Width > 4% → Bandas anchas → Alta volatilidad
```

---

### 2. **Modos de Configuración**

#### **Modo Conservador** (`config/conservative.json`)
```json
Stop Loss: 3%
Take Profit: 5%
Max Trades: 5/día
RSI: <30 compra, >70 venta
```

#### **Modo Agresivo** ⚡ (`config/aggressive.json`)
```json
Stop Loss: 1.5%  ← Más riesgo, liquidación más probable
Take Profit: 4%  ← Captura ganancias más rápido
Max Trades: 10/día  ← Más actividad
RSI: <25 compra, >75 venta  ← Más señales
```

**Diferencias:**
- ✅ Stop loss más ajustado = Mayor riesgo
- ✅ Más trades = Mayor comisión + estrés
- ✅ RSI más sensible = Más señales (pero más ruido)
- ✅ Mayor peso a indicadores técnicos (70% vs 60%)

---

### 3. **Archivos Creados**

| Archivo | Propósito |
|---------|-----------|
| `config/aggressive.json` | Configuración agresiva |
| `config/conservative.json` | Configuración conservadora |
| `test_aggressive.js` | Ejecutar análisis en modo agresivo |
| `DOCS_ANALISIS_TECNICO.md` | Documentación completa |
| `ver_doc.sh` | Menú interactivo para ver documentación |
| `RESUMEN_DANIEL.md` | Este archivo |

---

## 🚀 Cómo usar

### Ver análisis actual (modo agresivo):
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
node test_aggressive.js
```

### Ver documentación:
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
cat DOCS_ANALISIS_TECNICO.md
```

### Menú interactivo:
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
./ver_doc.sh
```

---

## 📊 Ejemplo de salida actual

```
BTC ($1,159,030 MXN)
  ├─ Signal: BUY (Score: 60.6/100)
  ├─ Confidence: 21%
  ├─ RSI: 51.9 ⚪ Neutral
  ├─ Trend: ➡️ NEUTRAL
  ├─ MACD: 📈 -3518.43 (Signal: -4062.15)
  ├─ BB: ⚪ MIDDLE (44.8%)
  │  └─ Width: 2.13%
  └─ vs SMA(12): 📈 0.11%
```

---

## 🎓 Lo que debes aprender (priorizado)

### Nivel 1 - Ya lo sabes
✅ RSI (sobrecompra/sobreventa)
✅ Tendencias (BULLISH/BEARISH)
✅ SMA/EMA (medias móviles)

### Nivel 2 - Aprende ahora
📚 **MACD:**
- MACD > Signal = Alcista
- Crossover MACD↑Signal = Compra fuerte
- Crossover MACD↓Signal = Venta fuerte

📚 **Bollinger Bands:**
- %B < 20% = Sobreventa (compra)
- %B > 80% = Sobrecompra (venta)
- Ancho bandas < 2% = Posible movimiento fuerte

### Nivel 3 - Para después
🔬 Divergencias MACD/RSI
🔬 Análisis de volumen
🔬 Patrones de velas japonesas

---

## 📊 Guía rápida de emojis

| Emoji | Significado |
|-------|-------------|
| 🟢 | Compra / Positivo / Alcista |
| 🔴 | Venta / Negativo / Bajista |
| ⚪ | Neutral / Esperar |
| ⚡ | Señal fuerte / Crossover |
| 📈 | Tendencia alcista |
| 📉 | Tendencia bajista |
| ➡️ | Neutro |
| ⚠️ | Advertencia / Riesgo |

---

## ⚠️ ADVERTENCIAS

### Modo agresivo = Más riesgo
1. **Stop loss 1.5%** → Un movimiento pequeño te liquida
2. **10 trades/día** → Mayor comisión y estrés
3. **RSI 25/75** → Más señales, más falsas positivas

### Reglas de oro
1. **Siempre paper trade primero** (30 días mínimo)
2. **Nunca arriesgues más del 2%** de tu capital por trade
3. **Monitorea constantemente** (el modo agresivo no duerme)
4. **Usa take profit automático** (no esperes "el pico")
5. **Registra todas tus operaciones** y aprende

---

## 🆘 Preguntas frecuentes

**¿Qué significa Score 60.6/100?**
→ Signal moderada de compra (BUY). No es fuerte (STRONG_BUY sería >70).

**¿Qué significa Confidence 21%?**
→ La señal es débil. Los indicadores no están completamente de acuerdo. Espera más confirmación.

**¿Cuándo debo confiar en una señal?**
→ Confidence > 50% = buena señal
→ Confidence > 70% = señal muy fuerte
→ Confidence < 30% = ignora, es ruido

**¿Qué pasa si hay señales contradictorias?**
→ Normal en mercados laterales. Espera mayor claridad o reduce tamaño de posición.

---

## 📞 ¿Necesitas ayuda?

Ejecuta `node test_aggressive.js` para ver el estado actual.

Revisa `DOCS_ANALISIS_TECNICO.md` para detalles completos.

O usa `./ver_doc.sh` para el menú interactivo.

---

**Configurado por:** Mint 🌿
**Fecha:** 18 Feb 2026
**Versión:** 2.0 (con MACD + Bollinger Bands)
