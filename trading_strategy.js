/**
 * Trading Strategy Engine
 *
 * Combina allocation-based rebalancing con análisis técnico
 * Implementa risk management y paper trading para testing
 */

const fs = require('fs');
const path = require('path');

class TradingStrategy {
  constructor(options = {}) {
    this.logsDir = options.logsDir || path.join(__dirname, 'logs', 'trades');

    // Asegurar que existe el directorio de logs
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }

    // Parámetros de risk management
    this.riskParams = {
      maxPositionSizePercent: options.maxPositionSizePercent || 30, // Max 30% en un activo
      minTradePercent: options.minTradePercent || 1, // Min 1% del portfolio
      maxDailyTrades: options.maxDailyTrades || 5,
      maxDailyLossPercent: options.maxDailyLossPercent || 2, // Stop loss diario
      takeProfitPercent: options.takeProfitPercent || 5,
      stopLossPercent: options.stopLossPercent || 3,

      // Pesos para decisión
      allocationWeight: options.allocationWeight || 0.4, // 40% peso allocation
      technicalWeight: options.technicalWeight || 0.6, // 60% peso técnico
    };

    this.loadDailyState();
  }

  /**
   * Cargar estado diario (trades realizados, P&L, etc)
   */
  loadDailyState() {
    const today = new Date().toISOString().split('T')[0];
    const statePath = path.join(this.logsDir, `daily_state_${today}.json`);

    if (fs.existsSync(statePath)) {
      this.dailyState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    } else {
      this.dailyState = {
        date: today,
        trades: [],
        realizedPnL: 0,
        unrealizedPnL: {},
        tradeCount: 0,
        startPortfolioValue: 0,
        lastUpdated: Date.now()
      };
    }
  }

  /**
   * Guardar estado diario
   */
  saveDailyState() {
    const today = new Date().toISOString().split('T')[0];
    const statePath = path.join(this.logsDir, `daily_state_${today}.json`);

    this.dailyState.lastUpdated = Date.now();
    fs.writeFileSync(statePath, JSON.stringify(this.dailyState, null, 2));
  }

  /**
   * Decidir qué posiciones tomar basado en análisis
   *
   * Input:
   * - currentAllocations: { BTC: 40.11, ETH: 24.50, ... }
   * - targetAllocations: { BTC: 0.40, ETH: 0.25, ... }
   * - technicalAnalysis: { BTC: { signal: 'HOLD', signalScore: 43.2, ... }, ... }
   * - portfolioValue: Valor total del portfolio
   * - prices: { BTC: 1186330, ETH: 34497, ... }
   */
  decidePositions(currentAllocations, targetAllocations, technicalAnalysis, portfolioValue, prices) {
    const decisions = [];

    console.log('\n🎯 DECIDING POSITIONS:');
    console.log(`Portfolio Value: $${portfolioValue.toFixed(2)} MXN`);
    console.log(`Daily Trades: ${this.dailyState.tradeCount}/${this.riskParams.maxDailyTrades}`);

    // Verificar límite de trades diarios
    if (this.dailyState.tradeCount >= this.riskParams.maxDailyTrades) {
      console.log('⚠️  Daily trade limit reached, no more trades today');
      return { decisions, skipped: true, reason: 'daily_limit' };
    }

    Object.keys(targetAllocations).forEach(asset => {
      const techInfo = technicalAnalysis[asset];
      if (!techInfo || techInfo.error) return;

      const currentAlloc = currentAllocations[asset] || 0;
      const targetAlloc = targetAllocations[asset] * 100;
      const allocDiff = currentAlloc - targetAlloc; // + = sobreasignado, - = subasignado

      // Calcular score compuesto
      const allocationScore = -allocDiff; // -5% sobreasignado = +5 score para vender
      const technicalScore = this.technicalToNumber(techInfo.signalScore);

      const compositeScore = (
        allocationScore * this.riskParams.allocationWeight +
        technicalScore * this.riskParams.technicalWeight
      );

      console.log(`\n${asset}:`);
      console.log(`  Alloc: ${currentAlloc.toFixed(1)}% → ${targetAlloc}% (diff: ${allocDiff.toFixed(1)}%)`);
      console.log(`  Tech: ${techInfo.signal} (${techInfo.signalScore}/100)`);
      console.log(`  Composite Score: ${compositeScore.toFixed(2)}`);

      // Decidir acción
      let action = 'HOLD';
      let reason = [];
      let tradePercent = 0;

      // Umbrales de decisión
      const STRONG_BUY_THRESHOLD = 10;
      const BUY_THRESHOLD = 5;
      const SELL_THRESHOLD = -5;
      const STRONG_SELL_THRESHOLD = -10;

      if (compositeScore >= STRONG_BUY_THRESHOLD) {
        action = 'BUY';
        tradePercent = Math.min(compositeScore / 3, this.riskParams.maxPositionSizePercent);
        reason.push(`Strong buy signal (score: ${compositeScore.toFixed(1)})`);
      } else if (compositeScore >= BUY_THRESHOLD) {
        action = 'BUY';
        tradePercent = Math.min(compositeScore / 4, this.riskParams.maxPositionSizePercent);
        reason.push(`Buy signal (score: ${compositeScore.toFixed(1)})`);
      } else if (compositeScore <= STRONG_SELL_THRESHOLD) {
        action = 'SELL';
        tradePercent = Math.min(Math.abs(compositeScore) / 3, this.riskParams.maxPositionSizePercent);
        reason.push(`Strong sell signal (score: ${compositeScore.toFixed(1)})`);
      } else if (compositeScore <= SELL_THRESHOLD) {
        action = 'SELL';
        tradePercent = Math.min(Math.abs(compositeScore) / 4, this.riskParams.maxPositionSizePercent);
        reason.push(`Sell signal (score: ${compositeScore.toFixed(1)})`);
      }

      // Verificar mínimo trade
      if (action !== 'HOLD' && tradePercent < this.riskParams.minTradePercent) {
        action = 'HOLD';
        reason.push(`Below minimum trade threshold (${this.riskParams.minTradePercent}%)`);
      }

      // Verificar que no exceda max position
      if (action === 'BUY') {
        const newAlloc = currentAlloc + tradePercent;
        if (newAlloc > this.riskParams.maxPositionSizePercent) {
          tradePercent = this.riskParams.maxPositionSizePercent - currentAlloc;
          if (tradePercent < this.riskParams.minTradePercent) {
            action = 'HOLD';
            reason.push(`Would exceed max position size (${this.riskParams.maxPositionSizePercent}%)`);
          }
        }
      }

      // Calcular valores en MXN
      if (action !== 'HOLD') {
        const tradeValue = portfolioValue * (tradePercent / 100);
        const price = prices[asset];
        const amount = tradeValue / price;

        decisions.push({
          asset,
          action,
          tradePercent,
          tradeValue,
          price,
          amount,
          currentAlloc,
          targetAlloc,
          compositeScore,
          reason: reason.join(', '),
          timestamp: Date.now()
        });

        console.log(`  → ${action} ${amount.toFixed(6)} ${asset} ($${tradeValue.toFixed(2)} MXN, ${tradePercent.toFixed(1)}%)`);
        console.log(`     Reason: ${reason.join(', ')}`);
      } else {
        console.log(`  → HOLD`);
      }
    });

    return { decisions, skipped: false };
  }

  /**
   * Convertir signal técnico a número (-50 a +50)
   */
  technicalToNumber(signalScore) {
    // signalScore va de 0 a 100
    // 50 = neutro
    // < 50 = bajista
    // > 50 = alcista
    return signalScore - 50;
  }

  /**
   * Ejecutar trades (paper trading)
   *
   * Simula la ejecución y guarda en logs
   */
  async executeTrades(decisions, portfolio) {
    if (decisions.length === 0) {
      console.log('\n✅ No trades to execute');
      return { executed: [], skipped: 'no_decisions' };
    }

    console.log('\n💼 EXECUTING TRADES (PAPER TRADING)');

    const executedTrades = [];

    for (const decision of decisions) {
      // Verificar límite diario
      if (this.dailyState.tradeCount >= this.riskParams.maxDailyTrades) {
        console.log(`⚠️  Daily limit reached, skipping ${decision.asset}`);
        continue;
      }

      // Simular ejecución
      const trade = {
        id: `trade_${Date.now()}_${decision.asset}`,
        ...decision,
        status: 'FILLED',
        executedAt: Date.now(),
        type: 'PAPER_TRADE'
      };

      // Actualizar portfolio (simulado)
      if (decision.action === 'BUY') {
        portfolio.assets[decision.asset].amount += decision.amount;
      } else {
        portfolio.assets[decision.asset].amount -= decision.amount;
      }

      // Guardar en estado diario
      this.dailyState.trades.push(trade);
      this.dailyState.tradeCount++;

      // Calcular nuevo valor total
      let newValue = 0;
      Object.keys(portfolio.assets).forEach(asset => {
        const assetInfo = portfolio.assets[asset];
        newValue += assetInfo.amount * assetInfo.price;
      });
      portfolio.total_value = newValue;

      console.log(`  ✅ ${decision.action} ${decision.asset}: ${decision.amount.toFixed(6)} @ $${decision.price} MXN`);
      console.log(`     Value: $${decision.tradeValue.toFixed(2)} MXN (${decision.tradePercent.toFixed(1)}%)`);

      executedTrades.push(trade);
    }

    // Actualizar valor inicial del día si es el primer trade
    if (this.dailyState.trades.length === executedTrades.length) {
      this.dailyState.startPortfolioValue = portfolio.total_value;
    }

    // Guardar estado
    this.saveDailyState();

    // Guardar log individual del trade
    this.logTrades(executedTrades, portfolio);

    return { executed: executedTrades, skipped: null };
  }

  /**
   * Guardar trades en log
   */
  logTrades(trades, portfolio) {
    const date = new Date().toISOString().split('T')[0];
    const logPath = path.join(this.logsDir, `trades_${date}.json`);

    let existingTrades = [];
    if (fs.existsSync(logPath)) {
      existingTrades = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    }

    existingTrades.push({
      timestamp: Date.now(),
      datetime: new Date().toISOString(),
      portfolioValue: portfolio.total_value,
      trades: trades
    });

    fs.writeFileSync(logPath, JSON.stringify(existingTrades, null, 2));

    console.log(`\n📝 Trades logged to: ${logPath}`);
  }

  /**
   * Calcular P&L de trades cerrados
   */
  calculateRealizedPnL(portfolio, prices) {
    // En paper trading, P&L se calcula como la diferencia
    // entre valor del portfolio y valor inicial del día
    const today = new Date().toISOString().split('T')[0];
    const statePath = path.join(this.logsDir, `daily_state_${today}.json`);

    if (!fs.existsSync(statePath)) {
      return { realizedPnL: 0, percent: 0 };
    }

    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

    if (state.startPortfolioValue === 0) {
      return { realizedPnL: 0, percent: 0 };
    }

    const currentValue = portfolio.total_value;
    const pnl = currentValue - state.startPortfolioValue;
    const percent = (pnl / state.startPortfolioValue) * 100;

    return {
      realizedPnL: pnl,
      percent,
      startValue: state.startPortfolioValue,
      currentValue,
      tradesToday: state.tradeCount
    };
  }

  /**
   * Generar reporte del día
   */
  generateDailyReport() {
    const today = new Date().toISOString().split('T')[0];
    const statePath = path.join(this.logsDir, `daily_state_${today}.json`);
    const tradesPath = path.join(this.logsDir, `trades_${today}.json`);

    let report = {
      date: today,
      trades: [],
      totalTrades: 0,
      pnl: { realized: 0, unrealized: {} }
    };

    if (fs.existsSync(statePath)) {
      const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      report.totalTrades = state.tradeCount;
      report.pnl.realized = state.realizedPnL;
      report.pnl.unrealized = state.unrealizedPnL;
    }

    if (fs.existsSync(tradesPath)) {
      const trades = JSON.parse(fs.readFileSync(tradesPath, 'utf8'));
      trades.forEach(entry => {
        report.trades = report.trades.concat(entry.trades);
      });
    }

    return report;
  }

  /**
   * Formatear reporte para display
   */
  formatReport(report) {
    let output = '\n📊 TRADING REPORT\n';
    output += '='.repeat(50) + '\n';
    output += `📅 Date: ${report.date}\n`;
    output += `📈 Total Trades: ${report.totalTrades}\n`;
    output += `💰 Realized P&L: $${report.pnl.realized.toFixed(2)} MXN\n`;

    if (report.trades.length > 0) {
      output += '\n📋 Trades:\n';

      report.trades.forEach(trade => {
        const emoji = trade.action === 'BUY' ? '🟢' : '🔴';
        const time = new Date(trade.timestamp).toLocaleTimeString();
        output += `${emoji} ${time} ${trade.action} ${trade.asset}\n`;
        output += `   Amount: ${trade.amount.toFixed(6)} @ $${trade.price} MXN\n`;
        output += `   Value: $${trade.tradeValue.toFixed(2)} MXN (${trade.tradePercent.toFixed(1)}%)\n`;
        output += `   Reason: ${trade.reason}\n\n`;
      });
    } else {
      output += '\n✅ No trades executed today\n';
    }

    return output;
  }

  /**
   * Check risk limits before trading
   */
  checkRiskLimits(portfolio, action) {
    // Verificar pérdida diaria máxima
    const pnl = this.calculateRealizedPnL(portfolio, {});

    if (pnl.percent < -this.riskParams.maxDailyLossPercent) {
      console.log(`🛑 STOP LOSS DAILY: P&L ${pnl.percent.toFixed(2)}% > -${this.riskParams.maxDailyLossPercent}%`);
      return { allowed: false, reason: 'daily_stop_loss' };
    }

    return { allowed: true };
  }
}

module.exports = TradingStrategy;
