#!/bin/bash
# Script para mostrar documentación de análisis técnico

echo "📊 DOCUMENTACIÓN DE ANÁLISIS TÉCNICO"
echo "======================================"
echo ""
echo "1. Ver documentación completa"
echo "2. Comparar configuraciones (conservador vs agresivo)"
echo "3. Ejecutar análisis en modo agresivo"
echo "4. Ejecutar análisis en modo conservador"
echo "5. Salir"
echo ""

read -p "Selecciona una opción (1-5): " option

case $option in
  1)
    cat DOCS_ANALISIS_TECNICO.md | less
    ;;
  2)
    echo "=== CONFIGURACIÓN CONSERVADORA ==="
    cat config/conservative.json
    echo ""
    echo "=== CONFIGURACIÓN AGRESIVA ==="
    cat config/aggressive.json
    echo ""
    echo "Diferencias principales:"
    echo "• Agresivo: Stop loss 1.5% vs 3% (más riesgo)"
    echo "• Agresivo: Max trades 10 vs 5 (más acción)"
    echo "• Agresivo: RSI 25/75 vs 30/70 (más señales)"
    ;;
  3)
    node test_aggressive.js
    ;;
  4)
    node test_technical.js
    ;;
  5)
    echo "Adiós 👋"
    exit 0
    ;;
  *)
    echo "Opción no válida"
    exit 1
    ;;
esac
