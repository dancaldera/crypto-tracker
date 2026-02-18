/**
 * Script de prueba para Technical Analyzer
 */

const TechnicalAnalyzer = require('./technical_analyzer');

async function main() {
  console.log('🔍 Iniciando análisis técnico...\n');

  const analyzer = new TechnicalAnalyzer({
    pricesDir: './logs/prices'
  });

  try {
    // Analizar todos los assets
    console.log('📊 Cargando datos históricos...');
    const results = await analyzer.analyzeAll(['BTC', 'ETH', 'SOL', 'USDC'], 3);

    // Mostrar resultados formateados
    console.log(analyzer.formatResults(results));

    // Generar recomendaciones de rebalanceo
    console.log('💡 RECOMMENDATIONS:\n');
    console.log('='.repeat(50) + '\n');

    const currentAllocations = {
      BTC: 40.13,
      ETH: 24.45,
      SOL: 15.37,
      USDC: 20.04
    };

    const targetAllocations = {
      BTC: 0.40,
      ETH: 0.25,
      SOL: 0.15,
      USDC: 0.20
    };

    const recommendations = analyzer.generateRebalanceRecommendation(
      results,
      currentAllocations,
      targetAllocations
    );

    if (recommendations.length === 0) {
      console.log('✅ No se requieren acciones en este momento');
      console.log('   Portfolio en equilibrio sin señales técnicas fuertes\n');
    } else {
      recommendations.forEach(rec => {
        const emoji = rec.action === 'BUY' ? '🟢' : '🔴';
        console.log(`${emoji} ${rec.asset}: ${rec.action}`);
        console.log(`   Razón: ${rec.reason}`);
        console.log(`   Allocation: ${rec.currentAlloc}% → ${rec.targetAlloc}%`);
        console.log(`   Señal: ${rec.signal} (${rec.confidence}% confianza)\n`);
      });
    }

    // Resumen de portafolio
    console.log('📋 PORTFOLIO SIGNAL SUMMARY:\n');
    let buyCount = 0, sellCount = 0, holdCount = 0;

    Object.keys(results).forEach(asset => {
      const analysis = results[asset];
      if (analysis.error) return;

      const signalEmoji = analysis.signal.includes('BUY') ? '🟢' :
                         analysis.signal.includes('SELL') ? '🔴' : '⚪';
      console.log(`${signalEmoji} ${asset}: ${analysis.signal} (${analysis.signalScore}/100)`);

      if (analysis.signal.includes('BUY')) buyCount++;
      else if (analysis.signal.includes('SELL')) sellCount++;
      else holdCount++;
    });

    console.log('\n' + '='.repeat(50));
    console.log(`📈 Buy signals: ${buyCount}`);
    console.log(`📉 Sell signals: ${sellCount}`);
    console.log(`⚪ Hold: ${holdCount}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error en análisis:', error.message);
    console.error(error.stack);
  }
}

main();
