# 🔄 Guía para Nueva Sesión - Crypto Tracker

## 📋 Cómo reconstruir este proyecto en una nueva sesión

### Paso 1: Pregunta inicial en nueva sesión

Copia y pega esto:

```
Hola, necesitas reconstruir el proyecto de crypto tracker.
Ubicación: /home/dc/.openclaw/workspace/crypto-tracker/
Lee estos archivos para entender el proyecto:
1. /home/dc/.openclaw/workspace/crypto-tracker/README.md
2. /home/dc/.openclaw/workspace/crypto-tracker/NEW_SESSION.md
3. /home/dc/.openclaw/workspace/crypto-tracker/docs/SUMMARY.md
4. /home/dc/.openclaw/workspace/crypto-tracker/docs/CONSERVADOR_SETUP.md
5. /home/dc/.openclaw/workspace/memory/2026-02-13.md

Después de leer estos archivos, dame un resumen del estado actual del proyecto.
```

---

## 📁 Estructura del Proyecto

### Directorio principal
```
/home/dc/.openclaw/workspace/crypto-tracker/
```

### Archivos clave
| Archivo | Propósito |
|---------|-----------|
| `monitor.js` | Script principal de monitoreo |
| `logger.js` | Sistema de logging |
| `bitso_api.js` | Cliente de API de Bitso |
| `analyze_performance.js` | Análisis de performance |
| `test_bitso.js` | Prueba de conexión Bitso |
| `status.sh` | Ver estado del sistema |
| `monitor_test.sh` | Script para cron jobs |
| `NEW_SESSION.md` | Este archivo |

### Configuración
| Archivo | Propósito |
|---------|-----------|
| `data/allocations.json` | Estrategia de allocation (50% BTC, 30% ETH, 20% USDC) |
| `data/portfolio.json` | Portafolio principal |
| `data/portfolio_test.json` | Portafolio conservador ($3,000 MXN) |
| `.env.example` | Plantilla para variables de entorno |
| `.env` | API keys (si configuradas) |

### Documentación
| Archivo | Propósito |
|---------|-----------|
| `README.md` | Documentación general |
| `QUICKSTART.md` | Guía rápida |
| `docs/SUMMARY.md` | Resumen completo del sistema |
| `docs/CONSERVADOR_SETUP.md` | Setup modo conservador |
| `docs/TESTING_PROPOSAL.md` | Análisis de montos y riesgos |
| `docs/PERFORMANCE_GUIDE.md` | Guía de performance |
| `docs/API_URLS.md` | URLs de APIs usadas |
| `config/BITSO_SETUP.md` | Instrucciones para API de Bitso |

### Logs
| Directorio | Contenido |
|-----------|-----------|
| `logs/prices/` | Histórico de precios (CSV) |
| `logs/trades/` | Registro de trades (JSON) |
| `logs/portfolio_*.json` | Snapshots del portafolio |
| `logs/cron_test.log` | Logs del cron job |

---

## ⚙️ Estado Actual del Sistema

### Configuración Activa
- **Modo:** Conservador
- **Monto:** ~$3,000 MXN ($150 USD)
- **Assets:** BTC (0.0013), ETH (0.0265), USDC (30.5)
- **Threshold de rebalanceo:** 10%
- **Moneda:** MXN (todos los precios)

### Precios Actuales (ejemplo)
- BTC: ~$1,165,000 MXN (Bitso `btc_mxn`)
- ETH: ~$34,000 MXN (Bitso `eth_mxn`)
- USDC: ~$17.19 MXN (Bitso `usd_mxn` × $1 USD)

### Automatización
- **Cron job:** Activo, ejecuta cada 2 horas
- **Script:** `/home/dc/.openclaw/workspace/crypto-tracker/monitor_test.sh`
- **Mode:** `PORTFOLIO_MODE=test` (usa `portfolio_test.json`)
- **Trading:** Desactivado (SAFE mode)

### APIs
- **Precios:** APIs públicas de Bitso (no requiere API key)
- **Portfolio:** Simulado (sin API keys configuradas aún)
- **Trading:** No configurado (modo SAFE)

---

## 🚀 Comandos Importantes

### Ver estado
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
./status.sh
```

### Ejecutar monitoreo manualmente
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
PORTFOLIO_MODE=test node monitor.js
```

### Ver performance
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
node analyze_performance.js 7   # Últimos 7 días
node analyze_performance.js 30  # Últimos 30 días
```

### Probar API de Bitso (cuando se configure)
```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
node test_bitso.js
```

### Ver logs
```bash
# Logs del cron
tail -f /home/dc/.openclaw/workspace/crypto-tracker/logs/cron_test.log

# Logs de portfolio
cat /home/dc/.openclaw/workspace/crypto-tracker/logs/portfolio_2026-02-13.json

# Logs de precios
cat /home/dc/.openclaw/workspace/crypto-tracker/logs/prices/BTC_2026-02-13.csv
```

### Ver/editar cron job
```bash
# Ver cron jobs
crontab -l

# Editar cron jobs
crontab -e
```

---

## 🎯 Historial del Proyecto

### Fecha de creación: 2026-02-13

### Qué se hizo:
1. **Investigación:** APIs de Coinbase y Bitso
2. **Sistema base:** Scripts de monitoreo, logging, PnL
3. **Portafolio conservador:** $3,000 MXN de test
4. **Automatización:** Cron job cada 2 horas
5. **Performance:** Script de análisis con escenarios
6. **Corrección:** Fix de USDC de USD a MXN (usando par `usd_mxn`)
7. **Documentación:** Guías completas para cada componente

### Decisiones tomadas:
- **Bitso > Coinbase:** Mejor para México (MXN)
- **Conservador:** Empieza con $3,000 MXN para aprender
- **SAFE mode:** Sin trading automático hasta estar cómodo
- **Threshold 10%:** Balance entre comisiones y rebalanceo
- **Cada 2 horas:** Frecuencia razonable para monitoreo

---

## 📊 Estado del Portafolio (última ejecución)

### Portafolio conservador
| Asset | Cantidad | Precio | Valor | % Actual | % Objetivo |
|-------|----------|--------|-------|----------|-------------|
| BTC | 0.0013 | ~$1,165,460 | ~$1,515 | ~51% | 50% |
| ETH | 0.0265 | ~$34,242 | ~$907 | ~31% | 30% |
| USDC | 30.5 | ~$17.19 | ~$524 | ~18% | 20% |

**Valor total:** ~$2,946 MXN

### Última ejecución
- Fecha: 2026-02-13 08:50 AM
- Estado: ✅ No necesita rebalanceo (threshold: 10%)
- Performance 7 días: -$0.62 MXN (-0.03%)

---

## 🔮 Próximos pasos (cuando decidas)

### Opcional: Configurar API de Bitso
1. Crear API keys en https://bitso.com/settings/api
2. Permisos: read, balance, trades
3. Crear `.env` con credenciales
4. Probar: `node test_bitso.js`

### Opcional: Ajustar allocations
Editar `data/allocations.json`:
- Cambiar porcentajes objetivos
- Ajustar threshold de rebalanceo

### Opcional: Cambiar monto de inversión
Editar `data/portfolio_test.json`:
- Aumentar cantidades
- Agregar nuevos assets

---

## 📞 Cómo pedir ayuda en nueva sesión

### Ejemplo 1: Ver estado actual
```
Hola, necesitas reconstruir el crypto tracker.
Ubicación: /home/dc/.openclaw/workspace/crypto-tracker/

Lee estos archivos:
1. /home/dc/.openclaw/workspace/crypto-tracker/NEW_SESSION.md
2. /home/dc/.openclaw/workspace/crypto-tracker/docs/SUMMARY.md

Después ejecuta: cd /home/dc/.openclaw/workspace/crypto-tracker && ./status.sh

Muéstrame el estado actual del sistema.
```

### Ejemplo 2: Ver performance
```
Hola, necesitas revisar el performance del crypto tracker.

Ubicación: /home/dc/.openclaw/workspace/crypto-tracker/

Lee estos archivos:
1. /home/dc/.openclaw/workspace/crypto-tracker/NEW_SESSION.md
2. /home/dc/.openclaw/workspace/crypto-tracker/docs/PERFORMANCE_GUIDE.md

Después ejecuta: cd /home/dc/.openclaw/workspace/crypto-tracker && node analyze_performance.js 30

Muéstrame el análisis de performance de los últimos 30 días.
```

### Ejemplo 3: Configurar API de Bitso
```
Hola, necesito configurar la API de Bitso para el crypto tracker.

Ubicación: /home/dc/.openclaw/workspace/crypto-tracker/

Lee estos archivos:
1. /home/dc/.openclaw/workspace/crypto-tracker/NEW_SESSION.md
2. /home/dc/.openclaw/workspace/crypto-tracker/config/BITSO_SETUP.md

Tengo las API keys:
- Key: [tu key]
- Secret: [tu secret]

Ayúdame a configurar el archivo .env y probar la conexión.
```

### Ejemplo 4: Ajustar allocations
```
Hola, necesito ajustar las allocations del crypto tracker.

Ubicación: /home/dc/.openclaw/workspace/crypto-tracker/

Lee estos archivos:
1. /home/dc/.openclaw/workspace/crypto-tracker/NEW_SESSION.md
2. /home/dc/.openclaw/workspace/crypto-tracker/data/allocations.json

Quiero cambiar las allocations a:
- BTC: 60%
- ETH: 25%
- USDC: 15%

Ayúdame a actualizar el archivo y explicar el impacto.
```

---

## ✅ Checklist de Reconstrucción

Si en una nueva sesión necesitas reconstruir todo:

1. [ ] Copiar el mensaje inicial de arriba
2. [ ] Esperar que lea los archivos clave
3. [ ] Revisar el estado actual con `./status.sh`
4. [ ] Verificar que el cron job esté activo
5. [ ] Revisar logs recientes
6. [ ] Continuar desde donde lo dejamos

---

## 📚 Archivos de Referencia

### Para entender el sistema
- `README.md` - Documentación general
- `NEW_SESSION.md` - Este archivo
- `docs/SUMMARY.md` - Resumen completo

### Para configurar/ajustar
- `data/allocations.json` - Estrategia
- `data/portfolio_test.json` - Portafolio activo
- `.env.example` - Plantilla de config

### Para operar
- `status.sh` - Ver estado
- `analyze_performance.js` - Ver performance
- `monitor.js` - Ejecutar manualmente
- `test_bitso.js` - Probar API

### Para aprender
- `docs/CONSERVADOR_SETUP.md` - Setup conservador
- `docs/TESTING_PROPOSAL.md` - Montos y riesgos
- `docs/PERFORMANCE_GUIDE.md` - Cómo funciona P&L
- `docs/API_URLS.md` - APIs usadas

---

**Última actualización:** 2026-02-13
**Creado por:** Mint 🌿
**Para:** Daniel
