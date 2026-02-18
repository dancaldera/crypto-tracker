/**
 * Integration Test - Verifica que monitor.js use TradingStrategy correctamente
 */

require('dotenv').config();
const CryptoMonitor = require('./monitor');

async function testIntegration() {
  console.log('🧪 Testing Phase 1 Integration...\n');

  try {
    // 1. Test ConfigLoader
    console.log('1️⃣ Testing ConfigLoader...');
    const ConfigLoader = require('./lib/configLoader');
    const config = new ConfigLoader('conservative');
    console.log('✅ Config loaded successfully');
    console.log('   Mode:', config.getConfig().mode);
    console.log('   Risk params:', Object.keys(config.getRiskParams()).length, 'parameters\n');

    // 2. Test CryptoMonitor initialization
    console.log('2️⃣ Testing CryptoMonitor initialization...');
    const monitor = new CryptoMonitor();
    console.log('✅ Monitor initialized');
    console.log('   Config loaded:', monitor.config.mode);
    console.log('   TradingStrategy initialized:', !!monitor.tradingStrategy);
    console.log('   TechnicalAnalyzer initialized:', !!monitor.technicalAnalyzer, '\n');

    // 3. Test configuration consistency
    console.log('3️⃣ Testing configuration consistency...');
    const riskParams = monitor.config.riskParams;
    const tradingStrategyRiskParams = monitor.tradingStrategy.riskParams;

    let consistent = true;
    Object.keys(riskParams).forEach(key => {
      if (riskParams[key] !== tradingStrategyRiskParams[key]) {
        console.log(`❌ Mismatch in ${key}: ${riskParams[key]} vs ${tradingStrategyRiskParams[key]}`);
        consistent = false;
      }
    });

    if (consistent) {
      console.log('✅ Risk params are consistent between Config and TradingStrategy\n');
    } else {
      console.log('❌ Risk params are NOT consistent!\n');
      return false;
    }

    // 4. Test target allocations
    console.log('4️⃣ Testing target allocations...');
    const targetAllocations = config.getTargetAllocations();
    console.log('✅ Target allocations loaded:', targetAllocations);
    console.log('   Total:', Object.values(targetAllocations).reduce((a, b) => a + b, 0), '\n');

    // 5. Test thresholds
    console.log('5️⃣ Testing thresholds...');
    const thresholds = config.getThresholds();
    console.log('✅ Thresholds loaded:', thresholds);
    console.log('   RSI oversold:', thresholds.rsi.oversold);
    console.log('   RSI overbought:', thresholds.rsi.overbought, '\n');

    // 6. Test with aggressive mode
    console.log('6️⃣ Testing aggressive mode...');
    config.setMode('aggressive');
    console.log('✅ Mode switched to:', config.getConfig().mode);
    console.log('   Max daily trades:', config.getRiskParams().maxDailyTrades);
    console.log('   Stop loss:', config.getRiskParams().stopLossPercent, '\n');

    console.log('✅ All integration tests PASSED!\n');
    return true;

  } catch (error) {
    console.error('❌ Integration test FAILED:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Ejecutar test
testIntegration().then(success => {
  process.exit(success ? 0 : 1);
});
