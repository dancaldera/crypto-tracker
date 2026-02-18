require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class DailySummary {
  constructor() {
    this.logsDir = path.join(__dirname, 'logs');
    this.pricesDir = path.join(this.logsDir, 'prices');
    this.tradesDir = path.join(this.logsDir, 'trades');
    this.allocationsPath = path.join(__dirname, 'data', 'allocations.json');
    this.loadConfig();
  }

  loadConfig() {
    this.allocations = JSON.parse(fs.readFileSync(this.allocationsPath, 'utf8'));
    this.targetAllocations = this.allocations.target_allocations;
  }

  // Obtener portfolio del día (último archivo disponible)
  getTodayPortfolio() {
    // Buscar el último archivo portfolio disponible
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

    return logs; // Array de todas las ejecuciones del día
  }

  // Obtener rango de precios del día (buscar archivos disponibles)
  getTodayPriceRange(asset) {
    // Buscar todos los archivos de precios de este asset
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

    // Usar el archivo más reciente
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

  // Calcular cambio porcentual
  calculatePercentChange(start, end) {
    if (!start || start === 0) return 0;
    return ((end - start) / start) * 100;
  }

  // Verificar rebalance signals (usar fechas del portfolio log)
  getRebalanceSignals(timestamps) {
    const filepath = path.join(this.logsDir, 'cron_test.log');
    if (!fs.existsSync(filepath)) {
      return 0;
    }

    const content = fs.readFileSync(filepath, 'utf8');

    // Convertir timestamps a fechas locales (Mexico City)
    // Formato del log: "2/13/2026" (MM/DD/YYYY)
    const localDates = timestamps.map(ts => {
      const date = new Date(ts);
      const month = date.getMonth() + 1; // 1-12
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    });

    // Buscar signals en estas fechas
    let signals = 0;
    content.split('\n').forEach(line => {
      if (line.includes('anyNeedsRebalance') && line.includes('true')) {
        // Verificar si la línea contiene alguna de nuestras fechas
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

  // Contar ejecuciones del día (usar fechas del portfolio log)
  getTodayRunCount(timestamps) {
    const filepath = path.join(this.logsDir, 'cron_test.log');
    if (!fs.existsSync(filepath)) {
      return 0;
    }

    const content = fs.readFileSync(filepath, 'utf8');

    // Convertir timestamps a fechas locales (Mexico City)
    // Formato del log: "2/13/2026" (MM/DD/YYYY)
    const localDates = timestamps.map(ts => {
      const date = new Date(ts);
      const month = date.getMonth() + 1; // 1-12
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    });

    // Contar líneas de timestamp "🕐" con estas fechas
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

  // Verificar errores del día (usar fechas del portfolio log)
  getTodayErrors(timestamps) {
    const filepath = path.join(this.logsDir, 'cron_test.log');
    if (!fs.existsSync(filepath)) {
      return { count: 0, last: null };
    }

    const content = fs.readFileSync(filepath, 'utf8');

    // Convertir timestamps a fechas locales (Mexico City)
    // Formato del log: "2/13/2026" (MM/DD/YYYY)
    const localDates = timestamps.map(ts => {
      const date = new Date(ts);
      const month = date.getMonth() + 1; // 1-12
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

  // Generar resumen del día
  generateSummary() {
    const portfolioLogs = this.getTodayPortfolio();

    if (!portfolioLogs || portfolioLogs.length === 0) {
      return {
        error: 'No portfolio data found',
        date: new Date().toISOString().split('T')[0]
      };
    }

    // Obtener timestamps para buscar en logs
    const timestamps = portfolioLogs.map(log => log.timestamp);

    // Calcular fecha local para el reporte
    const firstTimestamp = portfolioLogs[0].timestamp;
    const localDate = new Date(firstTimestamp);
    const reportDate = localDate.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });

    // Primera y última ejecución del día
    const firstRun = portfolioLogs[0].portfolio;
    const lastRun = portfolioLogs[portfolioLogs.length - 1].portfolio;

    // Calcular cambio del día
    const startValue = firstRun.total_value;
    const endValue = lastRun.total_value;
    const dailyChange = endValue - startValue;
    const dailyPercentChange = this.calculatePercentChange(startValue, endValue);

    // Calcular performance por asset
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

    // Obtener rangos de precios
    const priceRanges = {};
    Object.keys(firstRun.assets).forEach(asset => {
      priceRanges[asset] = this.getTodayPriceRange(asset);
    });

    // Verificar rebalance signals y errores
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

  // Formatear mensaje para Telegram
  formatTelegramMessage(summary) {
    if (summary.error) {
      return `⚠️ *Daily Crypto Summary*\n\n❌ ${summary.error}\n\n📊 Ejecuciones: 0\n💡 Asegúrate de que el cron job esté funcionando.`;
    }

    const emoji = summary.portfolio.dailyPercentChange >= 0 ? '📈' : '📉';
    const changeEmoji = summary.portfolio.dailyPercentChange >= 0 ? '+' : '';

    let message = `📊 *Daily Crypto Summary - ${summary.date}*\n\n`;

    // Portfolio resumen
    message += `💰 *Portfolio Value*\n`;
    message += `   Start: $${summary.portfolio.startValue.toFixed(2)} MXN\n`;
    message += `   End: $${summary.portfolio.endValue.toFixed(2)} MXN\n`;
    message += `   ${emoji} Change: $${summary.portfolio.dailyChange.toFixed(2)} (${changeEmoji}${summary.portfolio.dailyPercentChange.toFixed(2)}%)\n\n`;

    // Performance por asset
    message += `📈 *Asset Performance*\n`;
    Object.keys(summary.assetPerformance).forEach(asset => {
      const perf = summary.assetPerformance[asset];
      const assetEmoji = perf.percentChange >= 0 ? '🟢' : '🔴';
      const sign = perf.percentChange >= 0 ? '+' : '';

      message += `   ${assetEmoji} ${asset}: $${perf.change.toFixed(2)} (${sign}${perf.percentChange.toFixed(2)}%) - $${perf.end.toFixed(2)} MXN\n`;
    });
    message += '\n';

    // Rangos de precios (si existen)
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

    // Allocations actuales vs target
    message += `🎯 *Current vs Target Allocations*\n`;
    Object.keys(summary.allocations.target).forEach(asset => {
      const current = summary.allocations.current[asset]?.allocation || 0;
      const target = summary.allocations.target[asset] * 100;
      const diff = current - target;
      const status = Math.abs(diff) < 0.5 ? '✅' : Math.abs(diff) > 10 ? '⚠️' : '👀';

      message += `   ${status} ${asset}: ${current.toFixed(1)}% (target: ${target}%, diff: ${diff > 0 ? '+' : ''}${diff.toFixed(1)}%)\n`;
    });
    message += '\n';

    // Estadísticas del sistema
    message += `🔄 *System Stats*\n`;
    message += `   Runs: ${summary.runCount} (expected: 12)\n`;
    message += `   Rebalance signals: ${summary.rebalanceSignals}\n`;
    if (summary.errors.count > 0) {
      message += `   ❌ Errors: ${summary.errors.count}\n`;
    } else {
      message += `   ✅ No errors\n`;
    }

    // Evaluación del día
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

  // Enviar a Telegram (opcional)
  async sendToTelegram(message) {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
      console.log('⚠️  Telegram credentials not configured');
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      await axios.post(url, {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      });
      console.log('✅ Telegram message sent');
      return true;
    } catch (error) {
      console.error('❌ Error sending to Telegram:', error.message);
      return false;
    }
  }

  // Ejecutar resumen
  async run(sendTelegram = false) {
    console.log('📊 Generating daily summary...');

    const summary = this.generateSummary();

    if (summary.error) {
      console.log(`❌ ${summary.error}`);
      return summary;
    }

    // Guardar resumen en archivo (usar fecha del reporte)
    const summaryPath = path.join(this.logsDir, `summary_${summary.date}.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`✅ Summary saved to ${summaryPath}`);

    // Mostrar en consola
    console.log('\n' + '='.repeat(50));
    console.log('DAILY SUMMARY');
    console.log('='.repeat(50));
    console.log(JSON.stringify(summary, null, 2));
    console.log('='.repeat(50));

    // Enviar a Telegram si se solicita
    if (sendTelegram) {
      const message = this.formatTelegramMessage(summary);
      await this.sendToTelegram(message);
    }

    return summary;
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  const summary = new DailySummary();
  const sendTelegram = process.argv.includes('--telegram');
  summary.run(sendTelegram).then(() => {
    console.log('\n✅ Daily summary completed');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = DailySummary;
