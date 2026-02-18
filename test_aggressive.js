/**
 * Test script para modo agresivo con nuevos indicadores
 * MACD + Bollinger Bands + indicadores mejorados
 */

const TechnicalAnalyzer = require('./technical_analyzer');
const fs = require('fs');
const path = require('path');

// Cargar configuración agresiva
const configPath = path.join(__dirname, 'config', 'aggressive.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('🚀 MODO AGRESIVO - Technical Analysis\n');
console.log(`Configuración: ${config.description}\n`);
console.log('Parámetros de Riesgo:');
console.log(`  - Max Position: ${config.riskParams.maxPositionSizePercent}%`);
console.log(`  - Stop Loss: ${config.riskParams.stopLossPercent}%`);
console.log(`  - Take Profit: ${config.riskParams.takeProfitPercent}%`);
console.log(`  - Max Daily Trades: ${config.riskParams.maxDailyTrades}`);
console.log(`  - Min Trade: ${config.riskParams.minTradePercent}%\n`);

console.log('Indicadores:');
console.log(`  - MACD: ${config.indicators.macd.fastPeriod}/${config.indicators.macd.slowPeriod}/${config.indicators.macd.signalPeriod}`);
console.log(`  - Bollinger Bands: ${config.indicators.bollingerBands.period} periodos, ${config.indicators.bollingerBands.stdDev} std`);
console.log(`  - RSI: Periodo ${config.indicators.rsi.period}`);
console.log(`  - Lookback: ${config.indicators.lookbackDays} días\n`);

console.log('Umbrales:');
console.log(`  - RSI Oversold: ${config.thresholds.rsi.oversold} (compra)`);
console.log(`  - RSI Overbought: ${config.thresholds.rsi.overbought} (venta)\n`);

// Crear analizador con configuración agresiva
const analyzer = new TechnicalAnalyzer({
  lookbackPeriods: config.indicators.sma
});

async function runAnalysis() {
  console.log('🔍 Cargando datos históricos...\n');

  const assets = ['BTC', 'ETH', 'SOL', 'USDC'];
  const analysisOptions = {
    thresholds: config.thresholds
  };

  const results = await analyzer.analyzeAll(
    assets,
    config.indicators.lookbackDays,
    analysisOptions
  );

  console.log(analyzer.formatResults(results, config.thresholds));

  // Contar señales
  let buySignals = 0;
  let sellSignals = 0;
  let holdSignals = 0;

  console.log('💡 RECOMMENDATIONS:');
  console.log('='.repeat(50) + '\n');

  Object.keys(results).forEach(asset => {
    const analysis = results[asset];
    if (analysis.error) return;

    if (['BUY', 'STRONG_BUY'].includes(analysis.signal)) buySignals++;
    else if (['SELL', 'STRONG_SELL'].includes(analysis.signal)) sellSignals++;
    else holdSignals++;

    // Acción recomendada basada en señal
    const actionMap = {
      'STRONG_BUY': '🟢 COMPRA FUERTE',
      'BUY': '🟢 Comprar',
      'HOLD': '⚪ Mantener',
      'SELL': '🔴 Vender',
      'STRONG_SELL': '🔴 VENTA FUERTE'
    };

    console.log(`${asset}: ${actionMap[analysis.signal]}`);
    console.log(`  - Score: ${analysis.signalScore}/100`);
    console.log(`  - Confianza: ${(analysis.confidence * 100).toFixed(0)}%`);

    // Mostrar detalles específicos de MACD y BB si existen
    if (analysis.indicators.macd) {
      const macd = analysis.indicators.macd;
      const bb = analysis.indicators.bollinger;

      console.log('  - Indicadores clave:');
      if (macd.trend) {
        console.log(`    • MACD: ${macd.trend === 'BULLISH' ? '📈 Alcista' : '📉 Bajista'}`);
        if (analysis.indicators.macdCrossover) {
          console.log(`    • ⚡ Crossover: ${analysis.indicators.macdCrossover.signal}`);
        }
      }

      if (bb) {
        console.log(`    • Bollinger: ${bb.position === 'UPPER' ? '🔴 Sobrecompra' : bb.position === 'LOWER' ? '🟢 Sobreventa' : '⚪ Neutral'} (${bb.percentB.toFixed(1)}%)`);
        console.log(`    • Ancho bandas: ${bb.bandwidthPercent.toFixed(2)}% (${bb.bandwidthPercent < 2 ? '⚠️  Estrechas - posible movimiento' : '✅ Normal'})`);
      }

      if (analysis.indicators.rsi) {
        const rsi = analysis.indicators.rsi;
        const rsiStatus = rsi < config.thresholds.rsi.oversold ? '🟢 Sobreventa' :
                          rsi > config.thresholds.rsi.overbought ? '🔴 Sobrecompra' : '⚪ Neutral';
        console.log(`    • RSI: ${rsi.toFixed(1)} ${rsiStatus}`);
      }
    }

    console.log('');
  });

  console.log('='.repeat(50));
  console.log(`📈 Buy signals: ${buySignals}`);
  console.log(`📉 Sell signals: ${sellSignals}`);
  console.log(`⚪ Hold: ${holdSignals}`);
  console.log('='.repeat(50) + '\n');

  // Generar resumen ejecutivo
  if (buySignals > sellSignals) {
    console.log('🟢 SESIÓN: Alcista predominante');
    console.log('   → Busca oportunidades de entrada en activos con señal de compra');
    console.log('   → Considera reducir exposición en activos neutrales/negativos\n');
  } else if (sellSignals > buySignals) {
    console.log('🔴 SESIÓN: Bajista predominante');
    console.log('   → Considera tomar ganancias en posiciones largas');
    console.log('   → Espera mejores precios de entrada\n');
  } else {
    console.log('⚪ SESIÓN: Neutra');
    console.log('   → Espera claridad en el mercado');
    console.log('   → Mantén posición actual\n');
  }

  // Advertencias específicas del modo agresivo
  console.log('⚠️  ADVERTENCIAS - MODO AGRESIVO:');
  console.log('   • Stop loss más ajustado: Mayor riesgo de liquidación');
  console.log('   • Más trades diarios: Mayor exposición a comisiones');
  console.log('   • Umbral RSI más sensible: Más señales, más ruido');
  console.log('   • Asegúrate de monitorear constantemente las posiciones\n');
}

runAnalysis().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
