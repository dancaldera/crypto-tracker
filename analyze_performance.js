#!/usr/bin/env node
/**
 * Script para analizar el performance del portafolio en el tiempo
 * Uso: node analyze_performance.js [dias]
 */

const fs = require('fs');
const path = require('path');

class PerformanceAnalyzer {
  constructor() {
    this.logsDir = path.join(__dirname, 'logs');
    this.pricesDir = path.join(this.logsDir, 'prices');
    this.portfolioLogsDir = path.join(this.logsDir, 'portfolio_*.json');
  }

  // Obtener histórico de precios de un asset
  getPriceHistory(asset, days = 30) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const history = [];

    const files = fs.readdirSync(this.pricesDir);
    files.forEach(file => {
      if (file.startsWith(asset) && file.endsWith('.csv')) {
        const filepath = path.join(this.pricesDir, file);
        const content = fs.readFileSync(filepath, 'utf8');
        const lines = content.trim().split('\n');

        lines.forEach(line => {
          const [timestamp, price] = line.split(',');
          if (parseInt(timestamp) >= cutoff) {
            history.push({
              timestamp: parseInt(timestamp),
              date: new Date(parseInt(timestamp)),
              price: parseFloat(price)
            });
          }
        });
      }
    });

    return history.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Calcular rendimiento de un asset
  calculateAssetPerformance(asset, days = 30) {
    const history = this.getPriceHistory(asset, days);

    if (history.length < 2) {
      return {
        asset,
        days,
        data_points: history.length,
        status: 'insufficient_data',
        start_price: null,
        end_price: null,
        percent_change: null
      };
    }

    const start = history[0];
    const end = history[history.length - 1];
    const percentChange = ((end.price - start.price) / start.price) * 100;

    return {
      asset,
      days,
      data_points: history.length,
      start_date: start.date.toISOString(),
      end_date: end.date.toISOString(),
      start_price: start.price,
      end_price: end.price,
      price_diff: end.price - start.price,
      percent_change: percentChange.toFixed(2)
    };
  }

  // Calcular rendimiento del portafolio
  calculatePortfolioPerformance(portfolio, days = 30) {
    const performance = {
      portfolio: portfolio.mode || 'unknown',
      days,
      assets: {},
      summary: {}
    };

    let totalInitialValue = 0;
    let totalFinalValue = 0;

    // Calcular performance de cada asset
    Object.keys(portfolio.assets).forEach(asset => {
      if (typeof portfolio.assets[asset] === 'object') {
        const assetPerf = this.calculateAssetPerformance(asset, days);
        performance.assets[asset] = assetPerf;

        // Calcular valor inicial y final del asset en el portafolio
        const amount = portfolio.assets[asset].amount;

        if (assetPerf.start_price) {
          const initialValue = amount * assetPerf.start_price;
          const finalValue = amount * assetPerf.end_price;
          const pnl = finalValue - initialValue;

          totalInitialValue += initialValue;
          totalFinalValue += finalValue;

          performance.assets[asset].portfolio_position = {
            amount,
            initial_value: initialValue.toFixed(2),
            final_value: finalValue.toFixed(2),
            pnl: pnl.toFixed(2),
            pnl_percent: ((pnl / initialValue) * 100).toFixed(2)
          };
        }
      }
    });

    // Resumen del portafolio
    const totalPnL = totalFinalValue - totalInitialValue;
    performance.summary = {
      initial_value: totalInitialValue.toFixed(2),
      final_value: totalFinalValue.toFixed(2),
      total_pnl: totalPnL.toFixed(2),
      pnl_percent: ((totalPnL / totalInitialValue) * 100).toFixed(2),
      total_assets: Object.keys(performance.assets).length
    };

    return performance;
  }

  // Generar reporte visual
  generateReport(performance) {
    console.log('\n📊 ' + '='.repeat(60));
    console.log('📊 PERFORMANCE ANALYSIS');
    console.log('📊 ' + '='.repeat(60));
    console.log(`\n📁 Portfolio: ${performance.portfolio.toUpperCase()}`);
    console.log(`📅 Period: Last ${performance.days} days`);
    console.log(`\n` + '-'.repeat(60));

    // Resumen
    console.log('\n💰 PORTFOLIO SUMMARY:');
    console.log(`   Initial Value: $${performance.summary.initial_value} MXN`);
    console.log(`   Current Value: $${performance.summary.final_value} MXN`);
    console.log(`   P&L: $${performance.summary.total_pnl} MXN`);
    console.log(`   Performance: ${performance.summary.pnl_percent}%`);

    // Indicador de performance
    const pnlPercent = parseFloat(performance.summary.pnl_percent);
    let emoji = pnlPercent > 0 ? '📈' : pnlPercent < 0 ? '📉' : '➡️';
    console.log(`   ${emoji} Overall: ${pnlPercent > 0 ? 'GAIN' : pnlPercent < 0 ? 'LOSS' : 'BREAKEVEN'}`);

    // Detalle por asset
    console.log('\n📈 ASSET PERFORMANCE:');
    Object.keys(performance.assets).forEach(asset => {
      const assetData = performance.assets[asset];
      const perfPercent = parseFloat(assetData.percent_change);

      if (assetData.status === 'insufficient_data') {
        console.log(`\n   ${asset}: ⚠️  Insufficient data (${assetData.data_points} points)`);
        return;
      }

      const emoji = perfPercent > 0 ? '🟢' : perfPercent < 0 ? '🔴' : '⚪';
      const arrow = perfPercent > 0 ? '↑' : perfPercent < 0 ? '↓' : '→';

      console.log(`\n   ${emoji} ${asset}:`);
      console.log(`      Price: $${assetData.start_price} → $${assetData.end_price} MXN`);
      console.log(`      Change: $${assetData.price_diff.toFixed(2)} (${arrow}${assetData.percent_change}%)`);

      if (assetData.portfolio_position) {
        const pos = assetData.portfolio_position;
        const posPnl = parseFloat(pos.pnl);
        const posEmoji = posPnl > 0 ? '💚' : posPnl < 0 ? '💔' : '⚪';
        const posArrow = posPnl > 0 ? '↑' : posPnl < 0 ? '↓' : '→';

        console.log(`      Position: ${pos.amount} ${asset}`);
        console.log(`      Value: $${pos.initial_value} → $${pos.final_value} MXN`);
        console.log(`      ${posEmoji} P&L: $${pos.pnl} (${posArrow}${pos.pnl_percent}%)`);
      }
    });

    console.log('\n' + '='.repeat(60) + '\n');

    return performance;
  }

  // Simular performance futuro
  simulateFutureScenarios(portfolio, days = 30) {
    const scenarios = [
      { name: 'Bullish', change: { BTC: 15, ETH: 20, USDC: 0 } },
      { name: 'Bearish', change: { BTC: -15, ETH: -20, USDC: 0 } },
      { name: 'Sideways', change: { BTC: 2, ETH: 3, USDC: 0 } },
      { name: 'Volatile', change: { BTC: 30, ETH: 40, USDC: 0 } }
    ];

    console.log('🔮 FUTURE SCENARIOS (' + days + ' days):\n');

    scenarios.forEach(scenario => {
      console.log(`   ${scenario.name}:`);
      let totalValue = 0;

      Object.keys(portfolio.assets).forEach(asset => {
        if (typeof portfolio.assets[asset] === 'object') {
          const currentPrice = portfolio.assets[asset].price;
          const amount = portfolio.assets[asset].amount;
          const changePercent = scenario.change[asset] || 0;
          const futurePrice = currentPrice * (1 + changePercent / 100);
          const futureValue = amount * futurePrice;

          totalValue += futureValue;
          const emoji = changePercent > 0 ? '📈' : changePercent < 0 ? '📉' : '➡️';
          console.log(`      ${emoji} ${asset}: ${changePercent > 0 ? '+' : ''}${changePercent}% ($${futureValue.toFixed(2)})`);
        }
      });

      const currentValue = portfolio.total_value;
      const pnl = totalValue - currentValue;
      const pnlPercent = ((pnl / currentValue) * 100).toFixed(2);

      const resultEmoji = pnl > 0 ? '🟢' : pnl < 0 ? '🔴' : '⚪';
      console.log(`      ${resultEmoji} Total: $${totalValue.toFixed(2)} (${pnl > 0 ? '+' : ''}${pnl} MXN, ${pnl > 0 ? '+' : ''}${pnlPercent}%)\n`);
    });

    console.log('='.repeat(60) + '\n');
  }
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const days = parseInt(args[0]) || 30;

  const analyzer = new PerformanceAnalyzer();

  // Cargar portafolio actual
  const portfolioPath = path.join(__dirname, 'data', 'portfolio_test.json');
  if (!fs.existsSync(portfolioPath)) {
    console.error('❌ Portfolio file not found');
    process.exit(1);
  }

  const portfolio = JSON.parse(fs.readFileSync(portfolioPath, 'utf8'));

  // Obtener precios actuales (de los logs más recientes)
  const pricesDir = path.join(__dirname, 'logs', 'prices');
  const currentPrices = {};

  ['BTC', 'ETH', 'USDC'].forEach(asset => {
    const files = fs.readdirSync(pricesDir).filter(f => f.startsWith(asset));
    if (files.length > 0) {
      const latestFile = files[files.length - 1];
      const content = fs.readFileSync(path.join(pricesDir, latestFile), 'utf8');
      const lines = content.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      const price = lastLine.split(',')[1];
      currentPrices[asset] = parseFloat(price);
    }
  });

  // Actualizar portafolio con precios actuales
  Object.keys(portfolio.assets).forEach(asset => {
    if (typeof portfolio.assets[asset] === 'number') {
      const amount = portfolio.assets[asset];
      const price = currentPrices[asset] || 0;
      portfolio.assets[asset] = {
        amount,
        price,
        value: amount * price
      };
    }
  });

  // Calcular valor total
  let totalValue = 0;
  Object.keys(portfolio.assets).forEach(asset => {
    if (portfolio.assets[asset].value) {
      totalValue += portfolio.assets[asset].value;
    }
  });
  portfolio.total_value = totalValue;

  // Generar análisis
  console.log('\n🔍 Analyzing portfolio performance...\n');

  const performance = analyzer.calculatePortfolioPerformance(portfolio, days);
  analyzer.generateReport(performance);

  // Simular escenarios futuros
  analyzer.simulateFutureScenarios(portfolio, days);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
