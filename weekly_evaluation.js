require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class WeeklyEvaluation {
  constructor() {
    this.logsDir = path.join(__dirname, 'logs');
    this.pricesDir = path.join(this.logsDir, 'prices');
    this.allocationsPath = path.join(__dirname, 'data', 'allocations.json');
    this.loadConfig();
  }

  loadConfig() {
    this.allocations = JSON.parse(fs.readFileSync(this.allocationsPath, 'utf8'));
    this.targetAllocations = this.allocations.target_allocations;
  }

  // Obtener todos los summaries de la semana
  getWeekSummaries() {
    const files = fs.readdirSync(this.logsDir)
      .filter(f => f.startsWith('summary_') && f.endsWith('.json'))
      .sort();

    const summaries = [];
    files.forEach(file => {
      const filepath = path.join(this.logsDir, file);
      const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      summaries.push(data);
    });

    return summaries;
  }

  // Calcular métricas de la semana
  calculateWeekMetrics() {
    const summaries = this.getWeekSummaries();

    if (summaries.length === 0) {
      return { error: 'No summaries found' };
    }

    // Portfolio metrics
    const startValue = summaries[0].portfolio.startValue;
    const endValue = summaries[summaries.length - 1].portfolio.endValue;
    const weekChange = endValue - startValue;
    const weekPercentChange = ((endValue - startValue) / startValue) * 100;

    // Contar runs y errores
    let totalRuns = 0;
    let totalErrors = 0;
    let totalRebalanceSignals = 0;

    summaries.forEach(summary => {
      totalRuns += summary.runCount;
      totalErrors += summary.errors.count;
      totalRebalanceSignals += summary.rebalanceSignals;
    });

    // Asset performance
    const assetPerformance = {};
    const firstSummary = summaries[0];
    const lastSummary = summaries[summaries.length - 1];

    Object.keys(firstSummary.assetPerformance).forEach(asset => {
      const startValueAsset = firstSummary.assetPerformance[asset].start;
      const endValueAsset = lastSummary.assetPerformance[asset].end;
      const change = endValueAsset - startValueAsset;
      const percentChange = ((endValueAsset - startValueAsset) / startValueAsset) * 100;

      assetPerformance[asset] = {
        start: startValueAsset,
        end: endValueAsset,
        change: change,
        percentChange: percentChange,
        allocation: lastSummary.assetPerformance[asset].allocation
      };
    });

    // Best y worst performer
    let bestAsset = null;
    let worstAsset = null;

    Object.keys(assetPerformance).forEach(asset => {
      if (!bestAsset || assetPerformance[asset].percentChange > assetPerformance[bestAsset].percentChange) {
        bestAsset = asset;
      }
      if (!worstAsset || assetPerformance[asset].percentChange < assetPerformance[worstAsset].percentChange) {
        worstAsset = asset;
      }
    });

    // Volatility (std deviation de cambios diarios)
    const dailyChanges = summaries.map(s => s.portfolio.dailyPercentChange);
    const mean = dailyChanges.reduce((a, b) => a + b, 0) / dailyChanges.length;
    const variance = dailyChanges.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyChanges.length;
    const volatility = Math.sqrt(variance);

    // Rangos de precios de la semana
    const weeklyPriceRanges = {};
    Object.keys(firstSummary.priceRanges).forEach(asset => {
      const allPrices = [];
      summaries.forEach(summary => {
        if (summary.priceRanges[asset]) {
          allPrices.push(summary.priceRanges[asset].min);
          allPrices.push(summary.priceRanges[asset].max);
        }
      });

      if (allPrices.length > 0) {
        weeklyPriceRanges[asset] = {
          min: Math.min(...allPrices),
          max: Math.max(...allPrices),
          range: Math.max(...allPrices) - Math.min(...allPrices)
        };
      }
    });

    // Calcular cuántos rebalanceos se habrían ejecutado
    const wouldRebalance = totalRebalanceSignals > 0;

    return {
      durationDays: summaries.length,
      portfolio: {
        startValue,
        endValue,
        weekChange,
        weekPercentChange,
        currentValue: endValue
      },
      system: {
        totalRuns,
        expectedRuns: summaries.length * 12,
        runRate: (totalRuns / (summaries.length * 12)) * 100,
        totalErrors,
        totalRebalanceSignals,
        wouldRebalance
      },
      assetPerformance,
      volatility: {
        mean,
        variance,
        standardDeviation: volatility
      },
      bestPerformer: bestAsset,
      worstPerformer: worstAsset,
      weeklyPriceRanges,
      summaryCount: summaries.length
    };
  }

  // Generar recomendación
  generateRecommendation(metrics) {
    if (metrics.error) {
      return { decision: 'keep_testing', reason: 'Insufficient data' };
    }

    const reasons = [];
    let decision = 'activate';

    // 1. Verificar runs
    if (metrics.system.runRate < 90) {
      reasons.push(`❌ Run rate is only ${metrics.system.runRate.toFixed(0)}% (need 90%+)`);
      decision = 'keep_testing';
    } else {
      reasons.push(`✅ Run rate: ${metrics.system.runRate.toFixed(0)}%`);
    }

    // 2. Verificar errores
    if (metrics.system.totalErrors > 0) {
      reasons.push(`❌ ${metrics.system.totalErrors} errors found`);
      decision = 'keep_testing';
    } else {
      reasons.push(`✅ No errors`);
    }

    // 3. Verificar volatilidad
    if (Math.abs(metrics.portfolio.weekPercentChange) > 5) {
      reasons.push(`⚠️  High volatility: ${metrics.portfolio.weekPercentChange.toFixed(2)}%`);
    } else {
      reasons.push(`✅ Volatility is reasonable: ${metrics.portfolio.weekPercentChange.toFixed(2)}%`);
    }

    // 4. Verificar rebalanceo
    if (metrics.wouldRebalance) {
      reasons.push(`✅ Rebalance logic detected ${metrics.system.totalRebalanceSignals} signals`);
    } else {
      reasons.push(`⚠️  No rebalance signals (portfolio stable)`);
    }

    // 5. Verificar que todos los assets tengan datos
    const assetsWithData = Object.keys(metrics.assetPerformance).length;
    if (assetsWithData < 4) {
      reasons.push(`❌ Only ${assetsWithData}/4 assets have data`);
      decision = 'keep_testing';
    } else {
      reasons.push(`✅ All 4 assets tracked`);
    }

    return { decision, reasons };
  }

  // Formatear reporte para Telegram
  formatTelegramReport(metrics, recommendation) {
    if (metrics.error) {
      return `⚠️ *Weekly Evaluation*\n\n❌ ${metrics.error}\n\n📊 Run analysis manually with verify_metrics.sh`;
    }

    const emoji = metrics.portfolio.weekPercentChange >= 0 ? '📈' : '📉';
    const changeEmoji = metrics.portfolio.weekPercentChange >= 0 ? '+' : '';

    let message = `📊 *Weekly Crypto Evaluation*\n`;
    message += `📅 ${metrics.durationDays} days analyzed\n\n`;

    // Portfolio summary
    message += `💰 *Portfolio Performance*\n`;
    message += `   Start: $${metrics.portfolio.startValue.toFixed(2)} MXN\n`;
    message += `   End: $${metrics.portfolio.endValue.toFixed(2)} MXN\n`;
    message += `   ${emoji} Change: $${metrics.portfolio.weekChange.toFixed(2)} (${changeEmoji}${metrics.portfolio.weekPercentChange.toFixed(2)}%)\n\n`;

    // System stats
    message += `🔄 *System Stats*\n`;
    message += `   Runs: ${metrics.system.totalRuns}/${metrics.system.expectedRuns} (${metrics.system.runRate.toFixed(0)}%)\n`;
    message += `   Errors: ${metrics.system.totalErrors}\n`;
    message += `   Rebalance signals: ${metrics.system.totalRebalanceSignals}\n\n`;

    // Asset performance
    message += `📈 *Asset Performance*\n`;
    Object.keys(metrics.assetPerformance).forEach(asset => {
      const perf = metrics.assetPerformance[asset];
      const assetEmoji = perf.percentChange >= 0 ? '🟢' : '🔴';
      const sign = perf.percentChange >= 0 ? '+' : '';

      let marker = '';
      if (asset === metrics.bestPerformer) marker = ' 🏆';
      if (asset === metrics.worstPerformer) marker = ' ⚠️';

      message += `   ${assetEmoji} ${asset}: $${perf.change.toFixed(2)} (${sign}${perf.percentChange.toFixed(2)}%)${marker}\n`;
    });
    message += '\n';

    // Price ranges
    message += `📊 *Weekly Price Ranges*\n`;
    Object.keys(metrics.weeklyPriceRanges).forEach(asset => {
      const range = metrics.weeklyPriceRanges[asset];
      const rangePercent = ((range.max - range.min) / range.min) * 100;
      message += `   ${asset}: $${range.min.toFixed(2)} - $${range.max.toFixed(2)} MXN (${rangePercent.toFixed(1)}% swing)\n`;
    });
    message += '\n';

    // Volatility
    message += `📉 *Volatility*\n`;
    message += `   Mean daily change: ${metrics.volatility.mean.toFixed(3)}%\n`;
    message += `   Std deviation: ${metrics.volatility.standardDeviation.toFixed(3)}%\n\n`;

    // Recommendation
    const decisionEmoji = recommendation.decision === 'activate' ? '✅' : '⚠️';
    message += `${decisionEmoji} *Recommendation: ${recommendation.decision.toUpperCase()}*\n\n`;
    message += `Reasons:\n`;
    recommendation.reasons.forEach(reason => {
      message += `   ${reason}\n`;
    });

    return message;
  }

  // Ejecutar evaluación
  async run(sendTelegram = false) {
    console.log('📊 Running weekly evaluation...');

    const metrics = this.calculateWeekMetrics();

    // Guardar reporte
    const reportPath = path.join(this.logsDir, 'weekly_evaluation.json');
    fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2));
    console.log(`✅ Weekly report saved to ${reportPath}`);

    // Generar recomendación
    const recommendation = this.generateRecommendation(metrics);

    const fullReport = {
      metrics,
      recommendation,
      generatedAt: new Date().toISOString()
    };

    const fullReportPath = path.join(this.logsDir, 'weekly_evaluation_full.json');
    fs.writeFileSync(fullReportPath, JSON.stringify(fullReport, null, 2));
    console.log(`✅ Full report saved to ${fullReportPath}`);

    // Mostrar en consola
    console.log('\n' + '='.repeat(60));
    console.log('WEEKLY EVALUATION');
    console.log('='.repeat(60));
    console.log(JSON.stringify(fullReport, null, 2));
    console.log('='.repeat(60));

    return fullReport;
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  const evaluation = new WeeklyEvaluation();
  evaluation.run().then(() => {
    console.log('\n✅ Weekly evaluation completed');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = WeeklyEvaluation;
