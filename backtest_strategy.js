/**
 * Backtesting de estrategia de trading
 * Evalúa cómo se habría comportado la estrategia con datos históricos
 */

const TechnicalAnalyzer = require('./technical_analyzer');
const TradingStrategy = require('./trading_strategy');
const fs = require('fs');
const path = require('path');

async function runBacktest(days = 3) {
  console.log(`📊 BACKTESTING STRATEGY (Last ${days} days)\n`);
  console.log('='.repeat(60));

  const analyzer = new TechnicalAnalyzer({
    pricesDir: './logs/prices'
  });

  const strategy = new TradingStrategy();

  try {
    // Cargar portfolio inicial
    const initialPortfolioValue = 3003.21;
    const initialAllocations = {
      BTC: 40.0,
      ETH: 25.0,
      SOL: 15.0,
      USDC: 20.0
    };

    const targetAllocations = {
      BTC: 0.40,
      ETH: 0.25,
      SOL: 0.15,
      USDC: 0.20
    };

    console.log('\n💰 INITIAL STATE:');
    console.log(`   Portfolio Value: $${initialPortfolioValue.toFixed(2)} MXN`);
    console.log(`   BTC: ${initialAllocations.BTC}%`);
    console.log(`   ETH: ${initialAllocations.ETH}%`);
    console.log(`   SOL: ${initialAllocations.SOL}%`);
    console.log(`   USDC: ${initialAllocations.USDC}%`);

    // Análisis técnico actual
    console.log('\n📊 TECHNICAL ANALYSIS:');
    const technicalAnalysis = await analyzer.analyzeAll(['BTC', 'ETH', 'SOL', 'USDC'], days);

    let buySignals = 0, sellSignals = 0, holdSignals = 0;

    Object.keys(technicalAnalysis).forEach(asset => {
      const info = technicalAnalysis[asset];
      if (info.error) return;

      const emoji = info.signal.includes('BUY') ? '🟢' :
                   info.signal.includes('SELL') ? '🔴' : '⚪';

      console.log(`${emoji} ${asset}: ${info.signal} (${info.signalScore}/100)`);
      console.log(`   RSI: ${info.indicators.rsi ? info.indicators.rsi.toFixed(1) : 'N/A'}`);
      console.log(`   Trend: ${info.indicators.trend ? info.indicators.trend.direction : 'N/A'}`);
      console.log(`   Volatility: ${info.indicators.volatilityPercent ? info.indicators.volatilityPercent.toFixed(2) + '%' : 'N/A'}`);

      if (info.signal.includes('BUY')) buySignals++;
      else if (info.signal.includes('SELL')) sellSignals++;
      else holdSignals++;
    });

    console.log('\n📊 Signal Summary:');
    console.log(`   🟢 Buy: ${buySignals}`);
    console.log(`   🔴 Sell: ${sellSignals}`);
    console.log(`   ⚪ Hold: ${holdSignals}`);

    // Simular decisiones
    const currentPrices = {
      BTC: technicalAnalysis.BTC?.currentPrice || 1184740,
      ETH: technicalAnalysis.ETH?.currentPrice || 34358,
      SOL: technicalAnalysis.SOL?.currentPrice || 1493.82,
      USDC: technicalAnalysis.USDC?.currentPrice || 17.188
    };

    const { decisions } = strategy.decidePositions(
      initialAllocations,
      targetAllocations,
      technicalAnalysis,
      initialPortfolioValue,
      currentPrices
    );

    console.log('\n\n🎯 SIMULATED TRADES (If executed):');
    console.log('='.repeat(60));

    if (decisions.length === 0) {
      console.log('✅ No trades would be made');
    } else {
      let totalValue = 0;

      decisions.forEach(dec => {
        const emoji = dec.action === 'BUY' ? '🟢' : '🔴';
        console.log(`${emoji} ${dec.asset}: ${dec.action}`);
        console.log(`   Amount: ${dec.amount.toFixed(6)} @ $${dec.price} MXN`);
        console.log(`   Value: $${dec.tradeValue.toFixed(2)} MXN (${dec.tradePercent.toFixed(1)}%)`);
        console.log(`   Score: ${dec.compositeScore.toFixed(2)}`);
        console.log(`   Reason: ${dec.reason}\n`);
        totalValue += dec.tradeValue;
      });

      console.log('='.repeat(60));
      console.log(`💵 Total Trade Value: $${totalValue.toFixed(2)} MXN`);
      console.log(`📊 Avg Trade: $${(totalValue / decisions.length).toFixed(2)} MXN`);
    }

    // Evaluar métricas de la estrategia
    console.log('\n\n📈 STRATEGY METRICS:\n');
    console.log('='.repeat(60));

    const winRate = decisions.length > 0 ? (decisions.filter(d => d.action === 'BUY').length / decisions.length * 100).toFixed(1) : 0;
    const avgScore = decisions.length > 0 ? (decisions.reduce((sum, d) => sum + Math.abs(d.compositeScore), 0) / decisions.length).toFixed(2) : 0;
    const confidence = decisions.length > 0 ? (decisions.reduce((sum, d) => sum + Math.abs(d.compositeScore), 0) / 50 / decisions.length * 100).toFixed(0) : 0;

    console.log(`📊 Trades Analyzed: ${decisions.length}`);
    console.log(`🎯 Buy Rate: ${winRate}%`);
    console.log(`💪 Avg Signal Strength: ${avgScore}/50`);
    console.log(`🔒 Confidence: ${confidence}%`);

    // Recomendación
    console.log('\n\n💡 RECOMMENDATION:\n');
    console.log('='.repeat(60));

    if (decisions.length === 0) {
      console.log('✅ The portfolio is in optimal state');
      console.log('   Keep current allocation and monitor for signals');
    } else if (confidence >= 70) {
      console.log('🟢 STRONG SIGNALS detected');
      console.log(`   Consider executing ${decisions.length} trade(s) with high confidence`);
      console.log('   Review each trade individually before executing');
    } else if (confidence >= 50) {
      console.log('⚠️  MODERATE SIGNALS');
      console.log('   Signals are present but confidence is not high');
      console.log('   Consider waiting for stronger signals or reducing position sizes');
    } else {
      console.log('🔴 WEAK SIGNALS');
      console.log('   Not enough confidence to execute trades');
      console.log('   Wait for stronger technical indicators');
    }

    console.log('\n' + '='.repeat(60));
    console.log('💡 Logs stored in: ./logs/trades/');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error in backtest:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar backtest
const days = process.argv[2] ? parseInt(process.argv[2]) : 3;
runBacktest(days);
