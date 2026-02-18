# 🔧 Configurar API de Bitso

## Paso 1: Crear cuenta en Bitso

1. Ve a https://bitso.com
2. Crea tu cuenta o inicia sesión
3. Completa verificación KYC (requerido para trading)

---

## Paso 2: Crear API Keys

1. Ve a https://bitso.com/settings/api
2. Haz clic en **"Create new API key"**
3. Configura permisos:

### Permisos RECOMENDADOS para empezar:
```
✅ read           - Ver saldos y precios
✅ balance        - Ver balance de cuenta
✅ trades         - Ver historial de trades
❌ trade          - NO activar aún (opcional, solo cuando quieras trading real)
❌ withdraw       - NO activar (riesgo de seguridad)
```

4. Etiqueta: "OpenClaw Crypto Tracker" o similar
5. Haz clic en **"Create"**

---

## Paso 3: Guardar tus API Keys

⚠️ **IMPORTANTE:** Guarda estas credenciales de forma segura:

```
API Key: tu_api_key_aqui (32 caracteres hex)
API Secret: tu_api_secret_aqui (64 caracteres hex)
```

Estas credenciales solo se mostrarán **una vez**. Si las pierdes, tendrás que crear nuevas.

---

## Paso 4: Configurar en el sistema

Crea el archivo `.env` en `/home/dc/.openclaw/workspace/crypto-tracker/`:

```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
cp .env.example .env
nano .env
```

Agrega tus credenciales:

```env
# Bitso API Keys
BITSO_API_KEY=tu_api_key_aqui
BITSO_API_SECRET=tu_api_secret_aqui

# Coinbase (opcional, dejar vacío si no usas)
COINBASE_API_KEY=
COINBASE_API_SECRET=
COINBASE_PASSPHRASE=

# Configuración
ENABLE_TRADING=false  # Mantiene el sistema en modo SAFE
MONITORING_INTERVAL_MINUTES=60
REBALANCE_THRESHOLD_PERCENT=10
```

---

## Paso 5: Probar la conexión

Una vez configurado, prueba la conexión:

```bash
cd /home/dc/.openclaw/workspace/crypto-tracker
node monitor.js
```

Si funciona, verás:
```
Fetching prices...
Fetching portfolio... (desde Bitso API en lugar de simulado)
```

---

## 📋 Resumen de permisos

| Permiso | ¿Qué hace? | ¿Activar? |
|---------|------------|-----------|
| **read** | Ver saldos, precios, order books | ✅ SÍ |
| **balance** | Ver balance completo de cuenta | ✅ SÍ |
| **trades** | Ver historial de transacciones | ✅ SÍ |
| **trade** | Crear y cancelar órdenes | ❌ NO (por ahora) |
| **withdraw** | Retirar criptomonedas | ❌ NUNCA |

---

## 🔒 Seguridad

### Lo que SÍ hará el sistema con estos permisos:
- ✅ Leer tu saldo actual
- ✅ Ver precios en tiempo real
- ✅ Calcular allocations
- ✅ Generar alertas
- ✅ Guardar logs

### Lo que NO hará:
- ❌ Ejecutar trades automáticamente
- ❌ Retirar criptomonedas
- ❌ Modificar órdenes existentes

### Buenas prácticas:
- 🔐 Usa una cuenta separada para testing si es posible
- 🔐 No compartas tus API keys con nadie
- 🔐 Rotar las keys periódicamente (cada 3-6 meses)
- 🔐 Limita el monto máximo de trading si es posible

---

## ⚠️ Advertencia

Las API keys dan acceso a tu cuenta. Sigue estas reglas:

1. **NUNCA** commitear el archivo `.env` a git
2. **NUNCA** compartir tus credenciales
3. **SIEMPRE** usa permisos mínimos necesarios
4. **SIEMPRE** mantén el sistema en modo SAFE hasta que estés cómodo

---

## 🆘 Problemas comunes

### Error: "Invalid API Key"
- Verifica que la API Key esté correcta (32 caracteres hex)
- Verifica que no tengas espacios extra
- Asegúrate de que la API Key esté activa en Bitso

### Error: "Invalid Signature"
- Verifica que el API Secret esté correcto (64 caracteres hex)
- Verifica que no tengas espacios o saltos de línea

### Error: "Permission Denied"
- Verifica que los permisos estén activos en Bitso
- Asegúrate de que la API Key tenga los permisos correctos

---

## ✅ Checklist antes de continuar

- [ ] Cuenta en Bitso creada y verificada
- [ ] API Key creada con permisos read/balance/trades
- [ ] API Key y Secret guardados de forma segura
- [ ] Archivo `.env` creado con credenciales
- [ ] Prueba de conexión exitosa (`node monitor.js`)

---

¿Listo para configurar tus API keys?
Dime cuando las hayas creado y te ayudaré con el próximo paso 🌿
