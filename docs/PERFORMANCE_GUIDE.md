# 📊 Guía de Performance - Cómo Funcionan las Ganancias/Pérdidas

## 🎯 Análisis Actual (Últimos 7 días)

### Resumen del Portafolio Conservador

| Métrica | Valor |
|---------|-------|
| Valor inicial | $2,429.72 MXN |
| Valor actual | $2,429.10 MXN |
| **P&L** | **-$0.62 MXN (-0.03%)** |

### Performance por Asset

| Asset | Precio Inicial | Precio Final | Cambio | P&L en Portafolio |
|-------|---------------|--------------|--------|-------------------|
| BTC | $1,153,880 | $1,156,360 | +0.21% | +$3.22 MXN |
| ETH | $33,931 | $33,786 | -0.43% | -$3.84 MXN |
| USDC | $1.00 | $1.00 | 0% | $0.00 MXN |

---

## 🔮 Escenarios Futuros (7 días)

### 📈 Mercado Alcista (Bullish)
- **BTC sube 15%** → $1,728.76 MXN
- **ETH sube 20%** → $1,074.39 MXN
- **Total:** $2,833.65 MXN
- **Ganancia:** **+$404.56 MXN (+16.65%)**

### 📉 Mercado Bajista (Bearish)
- **BTC cae 15%** → $1,277.78 MXN
- **ETH cae 20%** → $716.26 MXN
- **Total:** $2,024.54 MXN
- **Pérdida:** **-$404.56 MXN (-16.65%)**

### ➡️ Mercado Lateral (Sideways)
- **BTC sube 2%** → $1,533.33 MXN
- **ETH sube 3%** → $922.19 MXN
- **Total:** $2,486.02 MXN
- **Ganancia:** **+$56.93 MXN (+2.34%)**

### 🌊 Mercado Volátil
- **BTC sube 30%** → $1,954.25 MXN
- **ETH sube 40%** → $1,253.46 MXN
- **Total:** $3,238.21 MXN
- **Ganancia:** **+$809.11 MXN (+33.31%)**

---

## 📈 Cómo Funciona el Cálculo de P&L

### Fórmula Básica

```
P&L = (Precio Final - Precio Inicial) × Cantidad
% Cambio = (P&L / Valor Inicial) × 100
```

### Ejemplo con BTC

```
Precio Inicial: $1,153,880 MXN
Precio Final: $1,156,360 MXN
Cantidad: 0.0013 BTC

P&L = ($1,156,360 - $1,153,880) × 0.0013
P&L = $2,480 × 0.0013
P&L = $3.22 MXN

% Cambio = ($3.22 / $1,500.04) × 100
% Cambio = +0.21%
```

---

## 📊 Cómo el Sistema Rastrea el Performance

### 1. Registro de Precios (Cada 2 horas)
**Archivo:** `logs/prices/BTC_2026-02-13.csv`
```
timestamp,price
1770991283728,1153880
1770991315661,1153880
1770991800231,1152580
1770992297395,1156360
```

### 2. Snapshots del Portafolio (Cada 2 horas)
**Archivo:** `logs/portfolio_2026-02-13.json`
```json
[
  {
    "timestamp": 1770991316761,
    "portfolio": {
      "assets": {
        "BTC": { "amount": 0.0013, "price": 1153880, "value": 1503.268 }
      },
      "total_value": 2429.10
    }
  }
]
```

### 3. Análisis Histórico
El script `analyze_performance.js`:
- Lee todos los precios históricos
- Calcula el valor del portafolio en cada punto
- Compara inicio vs final
- Muestra el P&L por asset y total

---

## ⏱️ En cuánto tiempo verás resultados reales?

### Corto plazo (1-7 días)
- **Objetivo:** Ver el sistema funcionando
- **Esperado:** ±1-3% diaria
- **Qué aprender:** Volatilidad del mercado

### Medio plazo (1-4 semanas)
- **Objetivo:** Evaluar la estrategia
- **Esperado:** ±5-15% mensual (variable)
- **Qué aprender:** Tendencias de mercado

### Largo plazo (1-3 meses)
- **Objetivo:** Decidir si ajustar strategy
- **Esperado:** ±20-50% trimestral (crypto es volátil)
- **Qué aprender:** Performance de la allocation

---

## 🎯 Qué es un "Buen" Performance?

### Para Portafolio Conservador

| Periodo | Buen Performance | Aceptable | Mal Performance |
|---------|-----------------|------------|-----------------|
| 1 semana | +5% o más | -2% a +5% | Menos de -2% |
| 1 mes | +10% o más | -5% a +10% | Menos de -5% |
| 3 meses | +20% o más | -10% a +20% | Menos de -10% |

**Nota:** Crypto es volátil. Estos rangos son referenciales.

---

## 🔄 Cómo Mejorar Performance

### 1. Rebalanceo Automático
El sistema detecta cuando allocations se desvían >10%:
- **Si BTC sube mucho:** El sistema recomienda vender BTC y comprar USDC/ETH
- **Si ETH baja mucho:** El sistema recomienda vender USDC y comprar ETH
- **Resultado:** Mantiene allocations y gestiona riesgo

### 2. Ajustar Thresholds
Edita `data/allocations.json`:
```json
{
  "rebalance_settings": {
    "threshold_percent": 10  // Reducir a 5% para rebalanceos más frecuentes
  }
}
```

### 3. Ajustar Allocations
Si prefieres más BTC:
```json
{
  "target_allocations": {
    "BTC": 0.60,  // Aumentar a 60%
    "ETH": 0.25,  // Reducir a 25%
    "USDC": 0.15  // Reducir a 15%
  }
}
```

---

## 📝 Comando para Ver Performance

Ejecuta este comando cada semana:

```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
node analyze_performance.js 7
```

O para un periodo más largo:
```bash
node analyze_performance.js 30  # Últimos 30 días
```

---

## 🎓 Lecciones Clave

### 1. **La Volatilidad es Normal**
- Crypto puede subir/descender 10% en un día
- No entres en pánico con cambios pequeños
- Mira el performance en semanas, no días

### 2. **Rebalanceo Gestiona Riesgo**
- Cuando un asset sube mucho, lo vendes
- Cuando un asset baja mucho, compras más
- Esto mantiene tu allocation y reduce riesgo

### 3. **Comisiones Importan**
- En un portafolio de $3,000 MXN, cada trade cuesta ~$12 MXN
- 2 trades = $24 MXN (0.8% del portfolio)
- Por eso el threshold es 10% (mínimo para que valga la pena)

### 4. **Time in Market > Timing the Market**
- Es difícil predecir cuándo sube/baja el mercado
- Estar invertido consistentemente suele ser mejor
- El rebalanceo automático ayuda a mantener disciplina

---

## 🔮 Cuándo Esperar Resultados Claros

### Tiempo mínimo para evaluar:
- **1 semana:** Solo para probar el sistema
- **4 semanas:** Primeros insights de performance
- **12 semanas:** Evaluación significativa de la estrategia

### Si después de 3 meses:
- **Performance > 20%:** Excelente, considera aumentar monto
- **Performance 10-20%:** Bueno, ajusta allocations si es necesario
- **Performance 0-10%:** Aceptable, considera más tiempo
- **Performance < 0:** Revisa estrategia y thresholds

---

## 📊 Ejemplo de Crecimiento Esperado

### Escenario Optimista (Crecimiento constante)
| Mes | Valor | Cambio |
|-----|-------|--------|
| 0 | $2,429 | - |
| 1 | $2,671 | +10% |
| 2 | $2,938 | +10% |
| 3 | $3,232 | +10% |
| 6 | $4,297 | +77% |

### Escenario Conservador (Crecimiento moderado)
| Mes | Valor | Cambio |
|-----|-------|--------|
| 0 | $2,429 | - |
| 1 | $2,551 | +5% |
| 2 | $2,678 | +5% |
| 3 | $2,812 | +5% |
| 6 | $3,257 | +34% |

**Nota:** Estos son escenarios teóricos. El mercado real es impredecible.

---

## 🚀 Próximos Pasos

1. **Espera 1 semana** con el sistema corriendo
2. **Ejecuta `node analyze_performance.js 7`** cada semana
3. **Observa patrones** en los precios y allocations
4. **Ajusta thresholds** si el rebalanceo es demasiado frecuente o raro
5. **Después de 4 semanas**, decide si:
   - Mantener estrategia
   - Ajustar allocations
   - Aumentar monto de inversión

---

**¿Dudas sobre el análisis de performance? Pregunta 🌿**
