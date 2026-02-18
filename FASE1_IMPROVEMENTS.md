# FASE 1 - Mejoras de Arquitectura

## Resumen Ejecutivo

**Fecha:** 18 Feb 2026
**Objetivo:** Integrar `TradingStrategy` en `monitor.js` y consolidar configuración
**Estado:** ✅ COMPLETADO

---

## Problemas Resueltos

### 1. TradingStrategy NO se usaba
**Antes:**
```javascript
// monitor.js usaba lógica simple
needsRebalance(currentAllocations) {
  // Solo verificaba threshold de allocation
}

// trading_strategy.js existía pero nunca se llamaba
decidePositions() {
  // Risk management completo NO usado
}
```

**Ahora:**
```javascript
// monitor.js usa TradingStrategy
tradingDecisions = this.tradingStrategy.decidePositions(
  currentAllocations,
  this.configLoader.getTargetAllocations(),
  technicalAnalysis,
  portfolio.total_value,
  prices
);
```

**Impacto:** Ahora se usa risk management real con:
- Límites de trades diarios
- PnL tracking
- Stop loss / take profit
- Validación de posición máxima

---

### 2. Configuración duplicada
**Antes:**
```json
// config/aggressive.json
"riskParams": { "stopLossPercent": 1.5 }

// data/allocations.json
"risk_management": { "stop_loss_percent": 15 }  // ¡Diferente!

// trading_strategy.js (hard-coded)
this.riskParams = { stopLossPercent: 3 }  // ¡Tercer valor!
```

**Ahora:**
```javascript
// lib/configLoader.js - Single source of truth
this.config = {
  riskParams: {
    // Viene de config/[mode].json
  },
  targetAllocations: {
    // Viene de data/allocations.json
  }
};
```

**Impacto:** Single source of truth - eliminado duplicación.

---

### 3. Dependencia obsoleta
**Antes:**
```json
// package.json
"dependencies": {
  "crypto": "^1.0.1"  // ¡No usar!
}
```

**Ahora:**
```json
// package.json
"dependencies": {
  "axios": "^1.6.0",
  "dotenv": "^16.3.1"
}
```

**Impacto:** Eliminado paquete innecesario (crypto es módulo nativo de Node).

---

## Cambios en Archivos

### Nuevos Archivos
1. **lib/configLoader.js** (3.9 KB)
   - Carga configuración desde `config/[mode].json`
   - Consolida risk params, allocations, thresholds
   - Permite cambiar modo dinámicamente

2. **test_integration.js** (3.0 KB)
   - Verifica integración de componentes
   - Tests de consistencia de config
   - Tests de cambio de modo

### Archivos Modificados
1. **monitor.js**
   - Importa `ConfigLoader` y `TradingStrategy`
   - Reemplaza `needsRebalance()` con `TradingStrategy.decidePositions()`
   - Agrega `decisionsToRebalanceInfo()` para compatibilidad
   - Actualiza `generateAlert()` para mostrar modo de trading

2. **data/allocations.json**
   - Eliminada sección `risk_management` (duplicada)
   - Mantiene `target_allocations` y `rebalance_settings`

3. **package.json**
   - Eliminada dependencia `crypto`

---

## Arquitectura Nueva

### Flujo de Datos
```
ConfigLoader (central)
    ↓
┌─────────────────────────────────────┐
│          CryptoMonitor              │
│  - Orquestra el proceso             │
│  - Carga configuración              │
│  - Coordina componentes            │
└─────────────────────────────────────┘
    ↓
    ├─→ TechnicalAnalyzer (indicadores)
    ├─→ TradingStrategy (decisiones)
    │       ├─→ Risk management
    │       ├─→ PnL tracking
    │       └─→ Trade execution
    ├─→ BitsoAPI (datos reales)
    └─→ CryptoLogger (logs)
```

### Configuración por Modo

**Conservative** (default):
```json
{
  "riskParams": {
    "maxPositionSizePercent": 30,
    "maxDailyTrades": 5,
    "stopLossPercent": 3,
    "takeProfitPercent": 5,
    "allocationWeight": 0.4,
    "technicalWeight": 0.6
  }
}
```

**Aggressive**:
```json
{
  "riskParams": {
    "maxPositionSizePercent": 40,
    "maxDailyTrades": 10,
    "stopLossPercent": 1.5,
    "takeProfitPercent": 4,
    "allocationWeight": 0.3,
    "technicalWeight": 0.7
  }
}
```

---

## Cómo Usar

### Cambiar Modo
```bash
# .env
TRADING_MODE=conservative  # o aggressive
```

### Test de Integración
```bash
node test_integration.js
```

### Ejecutar con Modo Específico
```bash
TRADING_MODE=aggressive node monitor.js
```

---

## Testing

### Resultados de test_integration.js
```
✅ ConfigLoader loads config correctly
✅ CryptoMonitor initializes all components
✅ Risk params are consistent between Config and TradingStrategy
✅ Target allocations sum to 100%
✅ Thresholds loaded correctly
✅ Mode switching works (conservative ↔ aggressive)
```

---

## Próximos Pasos (Fase 2)

### Opcional - cuando el proyecto crezca:
1. Extraer servicios de `monitor.js`
   - `PortfolioService`
   - `NotificationService`
   - `PriceService`

2. Implementar dependency injection para testing

3. Agregar tests automatizados con Jest

### No hacer aún (Fase 3 - producción):
- Reescribir en TypeScript
- Domain-driven design completo
- Message queue

---

## Métricas

- **Archivos nuevos:** 2
- **Archivos modificados:** 3
- **Líneas de código agregadas:** ~400
- **Líneas de código removidas:** ~50
- **Dependencias eliminadas:** 1 (crypto)
- **Tests agregados:** 1 (test_integration.js)
- **Tiempo de implementación:** ~2 horas

---

## Verificación

Para verificar que todo funciona:
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
node test_integration.js
```

Debería ver:
```
✅ All integration tests PASSED!
```
