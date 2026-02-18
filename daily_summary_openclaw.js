require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class DailySummaryOpenClaw {
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

  // Usar el sistema de mensajes de OpenClaw
  async sendToOpenClaw(message) {
    return new Promise((resolve, reject) => {
      const openclawPath = path.join(process.env.HOME || process.env.USERPROFILE, '.npm-global', 'bin', 'openclaw');

      // Comando para enviar mensaje
      const args = ['message', 'send', 'action=send', 'message=' + JSON.stringify(message)];

      const child = spawn(openclawPath, args, {
        env: { ...process.env, PATH: process.env.PATH }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Message sent via OpenClaw');
          resolve({ success: true });
        } else {
          console.error('❌ Error sending via OpenClaw:', stderr);
          reject(new Error(stderr));
        }
      });

      child.on('error', (err) => {
        console.error('❌ OpenClaw error:', err.message);
        reject(err);
      });
    });
  }

  // Resto de métodos son los mismos que daily_summary.js
  getTodayPortfolio() {
    const files = fs.readdirSync(this.logsDir)
      .filter(f => f.startsWith('portfolio_') && f.endsWith('.json'))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(this.logsDir, a));
        const statB = fs.statSync(path.join(this.logsDir, b));
        return statB.mtime - statA.mtime;
      });

    if (files.length === 0) {
      console.log('⚠️  No portfolio data found');
      return null;
    }

    const filepath = path.join(this.logsDir, files[0]);
    const logs = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    console.log(`📁 Using portfolio file: ${files[0]} (${logs.length} entries)`);

    return logs;
  }

  calculatePercentChange(start, end) {
    if (!start || start === 0) return 0;
    return ((end - start) / start) * 100;
  }

  getTodayPriceRange(asset) {
    const files = fs.readdirSync(this.pricesDir)
      .filter(f => f.startsWith(asset) && f.endsWith('.csv'))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(this.pricesDir, a));
        const statB = fs.statSync(path.join(this.pricesDir, b));
        return statB.mtime - statA.mtime;
      });

    if (files.length === 0) {
      return null;
    }

    const filepath = path.join(this.pricesDir, files[0]);
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.trim().split('\n');

    const prices = lines.map(line => {
      const [, price] = line.split(',');
      return parseFloat(price);
    });

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      first: prices[0],
      last: prices[prices.length - 1],
      count: prices.length
    };
  }

  getRebalanceSignals(timestamps) {
    const filepath = path.join(this.logsDir, 'cron_test.log');
    if (!fs.existsSync(filepath)) {
      return 0;
    }

    const content = fs.readFileSync(filepath, 'utf8');
    const localDates = timestamps.map(ts => {
      const date = new Date(ts);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    });

    let signals = 0;
    content.split('\n').forEach(line => {
      if (line.includes('anyNeedsRebalance') && line.includes('true')) {
        for (const localDate of localDates) {
          if (line.includes(localDate)) {
            signals++;
            break;
          }
        }
      }
    });

    return signals;
  }

  getTodayRunCount(timestamps) {
    const filepath = path.join(this.logsDir, 'cron_test.log');
    if (!fs.existsSync(filepath)) {
      return 0;
    }

    const content = fs.readFileSync(filepath, 'utf8');
    const localDates = timestamps.map(ts => {
      const date = new Date(ts);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    });

    let count = 0;
    content.split('\n').forEach(line => {
      if (line.includes('🕐')) {
        for (const localDate of localDates) {
          if (line.includes(localDate)) {
            count++;
            break;
          }
        }
      }
    });

    return count;
  }

  getTodayErrors(timestamps) {
    const filepath = path.join(this.logsDir, 'cron_test.log');
    if (!fs.existsSync(filepath)) {
      return { count: 0, last: null };
    }

    const content = fs.readFileSync(filepath, 'utf8');
    const localDates = timestamps.map(ts => {
      const date = new Date(ts);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    });

    const errorLines = [];
    content.split('\n').forEach(line => {
      if (line.toLowerCase().includes('error')) {
        for (const localDate of localDates) {
          if (line.includes(localDate)) {
            errorLines.push(line);
            break;
          }
        }
      }
    });

    return {
      count: errorLines.length,
      last: errorLines.length > 0 ? errorLines[errorLines.length - 1] : null
    };
  }

  generateSummary() {
    const portfolioLogs = this.getTodayPortfolio();

    if (!portfolioLogs || portfolioLogs.length === 0) {
      return {
        error: 'No portfolio data found',
        date: new Date().toISOString().split('T')[0]
      };
    }

    const timestamps = portfolioLogs.map(log => log.timestamp);
    const firstTimestamp = portfolioLogs[0].timestamp;
    const localDate = new Date(firstTimestamp);
    const reportDate = localDate.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });

    const firstRun = portfolioLogs[0].portfolio;
    const lastRun = portfolioLogs[portfolioLogs.length - 1].portfolio;

    const startValue = firstRun.total_value;
    const endValue = lastRun.total_value;
    const dailyChange = endValue - startValue;
    const dailyPercentChange = this.calculatePercentChange(startValue, endValue);

    const assetPerformance = {};
    Object.keys(firstRun.assets).forEach(asset => {
      const startValueAsset = firstRun.assets[asset].value;
      const endValueAsset = lastRun.assets[asset].value;
      const change = endValueAsset - startValueAsset;
      const percentChange = this.calculatePercentChange(startValueAsset, endValueAsset);

      assetPerformance[asset] = {
        start: startValueAsset,
        end: endValueAsset,
        change: change,
        percentChange: percentChange,
        amount: lastRun.assets[asset].amount,
        allocation: (lastRun.assets[asset].value / endValue) * 100
      };
    });

    const priceRanges = {};
    Object.keys(firstRun.assets).forEach(asset => {
      priceRanges[asset] = this.getTodayPriceRange(asset);
    });

    const runCount = this.getTodayRunCount(timestamps);
    const rebalanceSignals = this.getRebalanceSignals(timestamps);
    const errors = this.getTodayErrors(timestamps);

    return {
      date: reportDate,
      runCount,
      errors,
      rebalanceSignals,
      portfolio: {
        startValue,
        endValue,
        dailyChange,
        dailyPercentChange,
        currentValue: endValue
      },
      assetPerformance,
      priceRanges,
      allocations: {
        current: assetPerformance,
        target: this.targetAllocations
      }
    };
  }

  formatMessage(summary) {
    if (summary.error) {
      return `⚠️ *Daily Crypto Summary*\n\n❌ ${summary.error}\n\n📊 Ejecuciones: 0\n💡 Asegúrate de que el cron job esté funcionando.`;
    }

    const emoji = summary.portfolio.dailyPercentChange >= 0 ? '📈' : '📉';
    const changeEmoji = summary.portfolio.dailyPercentChange >= 0 ? '+' : '';

    let message = `📊 *Daily Crypto Summary - ${summary.date}*\n\n`;

    message += `💰 *Portfolio Value*\n`;
    message += `   Start: $${summary.portfolio.startValue.toFixed(2)} MXN\n`;
    message += `   End: $${summary.portfolio.endValue.toFixed(2)} MXN\n`;
    message += `   ${emoji} Change: $${summary.portfolio.dailyChange.toFixed(2)} (${changeEmoji}${summary.portfolio.dailyPercentChange.toFixed(2)}%)\n\n`;

    message += `📈 *Asset Performance*\n`;
    Object.keys(summary.assetPerformance).forEach(asset => {
      const perf = summary.assetPerformance[asset];
      const assetEmoji = perf.percentChange >= 0 ? '🟢' : '🔴';
      const sign = perf.percentChange >= 0 ? '+' : '';
      message += `   ${assetEmoji} ${asset}: $${perf.change.toFixed(2)} (${sign}${perf.percentChange.toFixed(2)}%) - $${perf.end.toFixed(2)} MXN\n`;
    });
    message += '\n';

    message += `📊 *Price Ranges*\n`;
    Object.keys(summary.priceRanges).forEach(asset => {
      const range = summary.priceRanges[asset];
      if (range) {
        const rangeChange = ((range.last - range.first) / range.first) * 100;
        const rangeEmoji = rangeChange >= 0 ? '📈' : '📉';
        message += `   ${asset}: $${range.min.toFixed(2)} - $${range.max.toFixed(2)} MXN (${range.count} pts) ${rangeEmoji}\n`;
      }
    });
    message += '\n';

    message += `🎯 *Current vs Target Allocations*\n`;
    Object.keys(summary.allocations.target).forEach(asset => {
      const current = summary.allocations.current[asset]?.allocation || 0;
      const target = summary.allocations.target[asset] * 100;
      const diff = current - target;
      const status = Math.abs(diff) < 0.5 ? '✅' : Math.abs(diff) > 10 ? '⚠️' : '👀';
      message += `   ${status} ${asset}: ${current.toFixed(1)}% (target: ${target}%, diff: ${diff > 0 ? '+' : ''}${diff.toFixed(1)}%)\n`;
    });
    message += '\n';

    message += `🔄 *System Stats*\n`;
    message += `   Runs: ${summary.runCount} (expected: 12)\n`;
    message += `   Rebalance signals: ${summary.rebalanceSignals}\n`;
    if (summary.errors.count > 0) {
      message += `   ❌ Errors: ${summary.errors.count}\n`;
    } else {
      message += `   ✅ No errors\n`;
    }

    message += '\n📋 *Daily Assessment*\n';
    if (summary.runCount >= 12) {
      message += `   ✅ Full data collection (12+ runs)\n`;
    } else if (summary.runCount >= 6) {
      message += `   ⚠️  Partial data (${summary.runCount}/12 runs)\n`;
    } else {
      message += `   ❌ Insufficient data (${summary.runCount}/12 runs)\n`;
    }

    if (summary.rebalanceSignals > 0) {
      message += `   ⚠️  ${summary.rebalanceSignals} rebalance signal(s) detected\n`;
    } else {
      message += `   ✅ No rebalance needed (stable)\n`;
    }

    if (summary.errors.count > 0) {
      message += `   ❌ ${summary.errors.count} error(s) detected - review logs\n`;
    }

    return message;
  }

  async run(sendOpenClaw = false) {
    console.log('📊 Generating daily summary (OpenClaw)...');

    const summary = this.generateSummary();

    if (summary.error) {
      console.log(`❌ ${summary.error}`);
      return summary;
    }

    const summaryPath = path.join(this.logsDir, `summary_${summary.date}.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`✅ Summary saved to ${summaryPath}`);

    console.log('\n' + '='.repeat(50));
    console.log('DAILY SUMMARY');
    console.log('='.repeat(50));
    console.log(JSON.stringify(summary, null, 2));
    console.log('='.repeat(50));

    if (sendOpenClaw) {
      try {
        const message = this.formatMessage(summary);
        await this.sendToOpenClaw(message);
      } catch (error) {
        console.error('Failed to send via OpenClaw:', error.message);
      }
    }

    return summary;
  }
}

if (require.main === module) {
  const summary = new DailySummaryOpenClaw();
  const sendOpenClaw = process.argv.includes('--openclaw');
  summary.run(sendOpenClaw).then(() => {
    console.log('\n✅ Daily summary completed');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = DailySummaryOpenClaw;
