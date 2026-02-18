const fs = require('fs');
const path = require('path');

class CryptoLogger {
  constructor() {
    this.logsDir = path.join(__dirname, 'logs');
    this.pricesDir = path.join(this.logsDir, 'prices');
    this.tradesDir = path.join(this.logsDir, 'trades');

    // Crear directorios si no existen
    [this.logsDir, this.pricesDir, this.tradesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Guardar precio de criptomoneda
  logPrice(asset, price, timestamp = Date.now()) {
    const date = new Date(timestamp);
    const filename = `${asset}_${date.toISOString().split('T')[0]}.csv`;
    const filepath = path.join(this.pricesDir, filename);

    const line = `${timestamp},${price}\n`;

    fs.appendFileSync(filepath, line);
  }

  // Guardar portafolio actual
  logPortfolio(portfolioData, timestamp = Date.now()) {
    const date = new Date(timestamp);
    const filename = `portfolio_${date.toISOString().split('T')[0]}.json`;
    const filepath = path.join(this.logsDir, filename);

    const logEntry = {
      timestamp,
      datetime: date.toISOString(),
      portfolio: portfolioData
    };

    // Leer logs existentes o crear nuevo array
    let logs = [];
    if (fs.existsSync(filepath)) {
      logs = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    }

    logs.push(logEntry);

    fs.writeFileSync(filepath, JSON.stringify(logs, null, 2));
  }

  // Guardar trade (ejecución real o simulada)
  logTrade(tradeData) {
    const date = new Date(tradeData.timestamp || Date.now());
    const filename = `trades_${date.toISOString().split('T')[0]}.json`;
    const filepath = path.join(this.tradesDir, filename);

    const tradeEntry = {
      ...tradeData,
      timestamp: tradeData.timestamp || Date.now(),
      datetime: date.toISOString()
    };

    // Leer trades existentes o crear nuevo array
    let trades = [];
    if (fs.existsSync(filepath)) {
      trades = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    }

    trades.push(tradeEntry);

    fs.writeFileSync(filepath, JSON.stringify(trades, null, 2));
  }

  // Calcular PnL (Profit and Loss)
  calculatePnL() {
    const trades = [];
    const files = fs.readdirSync(this.tradesDir);

    files.forEach(file => {
      if (file.endsWith('.json')) {
        const filepath = path.join(this.tradesDir, file);
        const fileData = JSON.parse(fs.readFileSync(filepath, 'utf8'));

        // Handle both array format and object with trades property
        let fileTrades;
        if (Array.isArray(fileData)) {
          fileTrades = fileData;
        } else if (fileData.trades && Array.isArray(fileData.trades)) {
          fileTrades = fileData.trades;
        } else {
          // Skip files without valid trades array
          return;
        }

        trades.push(...fileTrades);
      }
    });

    // Ordenar trades por timestamp
    trades.sort((a, b) => a.timestamp - b.timestamp);

    // Agrupar por asset
    const assetTrades = {};
    trades.forEach(trade => {
      if (!assetTrades[trade.asset]) {
        assetTrades[trade.asset] = [];
      }
      assetTrades[trade.asset].push(trade);
    });

    // Calcular PnL por asset
    const pnlReport = {};
    Object.keys(assetTrades).forEach(asset => {
      const assetTradeList = assetTrades[asset];
      let totalBought = 0;
      let totalSpent = 0;
      let totalSold = 0;
      let totalReceived = 0;

      assetTradeList.forEach(trade => {
        if (trade.type === 'buy') {
          totalBought += trade.amount;
          totalSpent += trade.amount * trade.price;
        } else if (trade.type === 'sell') {
          totalSold += trade.amount;
          totalReceived += trade.amount * trade.price;
        }
      });

      const avgBuyPrice = totalBought > 0 ? totalSpent / totalBought : 0;
      const realizedPnL = totalReceived - (totalSold * avgBuyPrice);
      const unrealizedPnL = 0; // Se calcula con precio actual

      pnlReport[asset] = {
        total_bought: totalBought,
        total_spent: totalSpent,
        total_sold: totalSold,
        total_received: totalReceived,
        avg_buy_price: avgBuyPrice,
        realized_pnl: realizedPnL,
        unrealized_pnl: unrealizedPnL
      };
    });

    return pnlReport;
  }

  // Obtener historial de precios
  getPriceHistory(asset, days = 7) {
    const history = [];
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

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
              price: parseFloat(price)
            });
          }
        });
      }
    });

    return history.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Generar reporte de resumen
  generateReport() {
    const pnl = this.calculatePnL();
    const totalRealizedPnL = Object.values(pnl).reduce((sum, asset) => sum + asset.realized_pnl, 0);

    return {
      generated_at: new Date().toISOString(),
      total_realized_pnl: totalRealizedPnL,
      by_asset: pnl
    };
  }
}

module.exports = CryptoLogger;
