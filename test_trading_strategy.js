/**
 * Script de prueba para Trading Strategy
 * Muestra cómo se toman las decisiones de posicionamiento
 */

const TechnicalAnalyzer = require('./technical_analyzer');
const TradingStrategy = require('./trading_strategy');

async function main() {
  console.log('🎯 Testing Trading Strategy Engine\n');
  console.log('='.repeat(60));

  const analyzer = new TechnicalAnalyzer({
    pricesDir: './logs/prices'
  });

  const strategy = new TradingStrategy({
    maxPositionSizePercent: 30,
    minTradePercent: 1,
    maxDailyTrades: 5,
    maxDailyLossPercent: 2,
    takeProfitPercent: 5,
    stopLossPercent: 3,
    allocationWeight: 0.4,
    technicalWeight: 0.6
  });

  try {
    // 1. Cargar análisis técnico
    console.log('\n📊 STEP 1: Loading technical analysis...\n');
    const technicalAnalysis = await analyzer.analyzeAll(['BTC', 'ETH', 'SOL', 'USDC'], 3);

    Object.keys(technicalAnalysis).forEach(asset => {
      const info = technicalAnalysis[asset];
      if (info.error) {
        console.log(`❌ ${asset}: ${info.error}`);
      } else {
        const emoji = info.signal.includes('BUY') ? '🟢' :
                     info.signal.includes('SELL') ? '🔴' : '⚪';
        console.log(`${emoji} ${asset}: ${info.signal} (${info.signalScore}/100)`);
      }
    });

    // 2. Definir estado actual del portfolio
    const currentAllocations = {
      BTC: 40.11,
      ETH: 24.50,
      SOL: 15.38,
      USDC: 20.01
    };

    const targetAllocations = {
      BTC: 0.40,
      ETH: 0.25,
      SOL: 0.15,
      USDC: 0.20
    };

    const portfolioValue = 2999.10;
    const prices = {
      BTC: 1186330,
      ETH: 34497,
      SOL: 1497.53,
      USDC: 17.196
    };

    console.log('\n💰 Current Portfolio:');
    console.log(`   Total Value: $${portfolioValue.toFixed(2)} MXN`);
    console.log(`   BTC: ${currentAllocations.BTC.toFixed(1)}% → ${targetAllocations.BTC * 100}%`);
    console.log(`   ETH: ${currentAllocations.ETH.toFixed(1)}% → ${targetAllocations.ETH * 100}%`);
    console.log(`   SOL: ${currentAllocations.SOL.toFixed(1)}% → ${targetAllocations.SOL * 100}%`);
    console.log(`   USDC: ${currentAllocations.USDC.toFixed(1)}% → ${targetAllocations.USDC * 100}%`);

    // 3. Decidir posiciones
    console.log('\n\n🎯 STEP 2: Deciding positions...\n');
    const { decisions, skipped } = strategy.decidePositions(
      currentAllocations,
      targetAllocations,
      technicalAnalysis,
      portfolioValue,
      prices
    );

    // 4. Mostrar resumen de decisiones
    if (skipped) {
      console.log(`\n⚠️  Skipped: ${skipped.reason}`);
    } else if (decisions.length === 0) {
      console.log('\n✅ No trades needed - Portfolio in optimal state');
    } else {
      console.log('\n📋 DECISION SUMMARY:');
      console.log('='.repeat(60));

      let buyCount = 0, sellCount = 0, totalValue = 0;

      decisions.forEach(dec => {
        const emoji = dec.action === 'BUY' ? '🟢' : '🔴';
        console.log(`${emoji} ${dec.asset}: ${dec.action}`);
        console.log(`   Amount: ${dec.amount.toFixed(6)} @ $${dec.price} MXN`);
        console.log(`   Value: $${dec.tradeValue.toFixed(2)} MXN (${dec.tradePercent.toFixed(1)}%)`);
        console.log(`   Current Alloc: ${dec.currentAlloc.toFixed(1)}% → Target: ${dec.targetAlloc}%`);
        console.log(`   Composite Score: ${dec.compositeScore.toFixed(2)}`);
        console.log(`   Reason: ${dec.reason}\n`);

        if (dec.action === 'BUY') {
          buyCount++;
          totalValue += dec.tradeValue;
        } else {
          sellCount++;
          totalValue += dec.tradeValue;
        }
      });

      console.log('='.repeat(60));
      console.log(`📊 Total Trades: ${decisions.length} (${buyCount} BUY, ${sellCount} SELL)`);
      console.log(`💵 Total Value: $${totalValue.toFixed(2)} MXN`);
      console.log(`📈 Avg Trade: $${(totalValue / decisions.length).toFixed(2)} MXN`);
    }

    // 5. Simular ejecución (paper trading)
    if (decisions.length > 0) {
      console.log('\n\n💼 STEP 3: Simulating execution (PAPER TRADING)...\n');

      const portfolio = {
        assets: {
          BTC: { amount: 0.001014, price: prices.BTC },
          ETH: { amount: 0.0213, price: prices.ETH },
          SOL: { amount: 0.308, price: prices.SOL },
          USDC: { amount: 34.9, price: prices.USDC }
        },
        total_value: portfolioValue
      };

      const result = await strategy.executeTrades(decisions, portfolio);

      if (result.executed.length > 0) {
        console.log(`\n✅ Executed ${result.executed.length} trades`);
        console.log(`📊 New Portfolio Value: $${portfolio.total_value.toFixed(2)} MXN`);
      }
    }

    // 6. Generar reporte del día
    console.log('\n\n📊 STEP 4: Daily Report\n');
    console.log('='.repeat(60));

    const report = strategy.generateDailyReport();
    console.log(strategy.formatReport(report));

    // 7. Explicar parámetros
    console.log('\n\n⚙️  STRATEGY PARAMETERS\n');
    console.log('='.repeat(60));

    const params = strategy.riskParams;
    console.log(`📏 Max Position Size: ${params.maxPositionSizePercent}% por activo`);
    console.log(`📉 Min Trade Size: ${params.minTradePercent}% del portfolio`);
    console.log(`🔄 Max Daily Trades: ${params.maxDailyTrades}`);
    console.log(`🛑 Daily Stop Loss: -${params.maxDailyLossPercent}%`);
    console.log(`🎯 Take Profit: +${params.takeProfitPercent}%`);
    console.log(`💀 Stop Loss: -${params.stopLossPercent}%`);
    console.log(`⚖️  Allocation Weight: ${(params.allocationWeight * 100).toFixed(0)}%`);
    console.log(`📊 Technical Weight: ${(params.technicalWeight * 100).toFixed(0)}%`);

    console.log('\n' + '='.repeat(60));
    console.log('💡 Para más detalles, revisa:');
    console.log('   - ./logs/trades/daily_state_2026-02-15.json');
    console.log('   - ./logs/trades/trades_2026-02-15.json');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

main();
