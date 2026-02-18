require('dotenv').config();
const axios = require('axios');
const CryptoLogger = require('./logger');
const BitsoAPI = require('./bitso_api');
const TechnicalAnalyzer = require('./technical_analyzer');
const fs = require('fs');
const path = require('path');

class CryptoMonitor {
  constructor() {
    this.logger = new CryptoLogger();
    this.loadConfig();
    this.enableTrading = process.env.ENABLE_TRADING === 'true';
    this.technicalAnalyzer = new TechnicalAnalyzer({
      pricesDir: path.join(__dirname, 'logs', 'prices')
    });
    this.enableTechnicalAnalysis = process.env.ENABLE_TECHNICAL !== 'false'; // Por defecto activado
  }

  loadConfig() {
    const allocationsPath = path.join(__dirname, 'data', 'allocations.json');
    this.allocations = JSON.parse(fs.readFileSync(allocationsPath, 'utf8'));
  }

  // Obtener precio público (no requiere autenticación)
  async getPrice(coinbaseAsset, bitsoBook) {
    try {
      // Intentar Bitso público (no requiere API key)
      if (bitsoBook) {
        const response = await axios.get(
          `https://api.bitso.com/v3/ticker/?book=${bitsoBook}`
        );
        if (response.data.success) {
          return {
            source: 'bitso',
            price: parseFloat(response.data.payload.last),
            book: bitsoBook,
            timestamp: Date.now()
          };
        }
      }

      // Fallback a Coinbase público
      const response = await axios.get(
        `https://api.coinbase.com/v2/prices/${coinbaseAsset}-USD/spot`
      );
      return {
        source: 'coinbase',
        price: parseFloat(response.data.data.amount),
        asset: coinbaseAsset,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error(`Error getting price for ${coinbaseAsset}: ${error.message}`);
      return null;
    }
  }

  // Obtener múltiples precios
  async getAllPrices() {
    const assets = [
      { name: 'BTC', bitso: 'btc_mxn' },
      { name: 'ETH', bitso: 'eth_mxn' },
      { name: 'SOL', bitso: 'sol_mxn' },
      { name: 'USDC', bitso: 'usd_mxn' }  // USD_MXN para convertir USDC a MXN
    ];

    const prices = {};

    for (const asset of assets) {
      const priceData = await this.getPrice(asset.name, asset.bitso);
      if (priceData) {
        prices[asset.name] = priceData;
        this.logger.logPrice(asset.name, priceData.price, priceData.timestamp);
      }
    }

    return prices;
  }

  // Simular portafolio (cuando no hay API keys)
  async getSimulatedPortfolio() {
    const prices = await this.getAllPrices();

    // Determinar qué portfolio usar (test o principal)
    const portfolioMode = process.env.PORTFOLIO_MODE || 'principal';
    const portfolioPath = path.join(
      __dirname,
      'data',
      portfolioMode === 'test' ? 'portfolio_test.json' : 'portfolio.json'
    );

    console.log(`📁 Loading portfolio: ${portfolioMode} (${portfolioPath})`);

    let portfolio = { assets: {}, total_value: 0 };
    if (fs.existsSync(portfolioPath)) {
      portfolio = JSON.parse(fs.readFileSync(portfolioPath, 'utf8'));
      console.log(`✅ Portfolio loaded: ${portfolio.mode || portfolio.notes?.[0] || 'unknown'}`);
    } else {
      console.log(`⚠️  Portfolio file not found: ${portfolioPath}`);
    }

    // Calcular valor total
    let totalValue = 0;
    Object.keys(portfolio.assets).forEach(asset => {
      const amount = portfolio.assets[asset];
      const price = prices[asset]?.price || 0;
      portfolio.assets[asset] = {
        amount,
        price,
        value: amount * price
      };
      totalValue += amount * price;
    });

    portfolio.total_value = totalValue;
    portfolio.timestamp = Date.now();

    return portfolio;
  }

  // Obtener portafolio real desde Bitso
  async getRealPortfolio() {
    // Verificar si hay credenciales de Bitso
    if (!process.env.BITSO_API_KEY || !process.env.BITSO_API_SECRET) {
      console.log('⚠️  No Bitso API keys configured, using simulated portfolio');
      return this.getSimulatedPortfolio();
    }

    try {
      console.log('🔌 Connecting to Bitso API...');

      // Crear instancia de BitsoAPI
      const bitso = new BitsoAPI(
        process.env.BITSO_API_KEY,
        process.env.BITSO_API_SECRET
      );

      // Obtener balance desde Bitso
      const balanceData = await bitso.getPortfolio();

      if (!balanceData.success) {
        console.log(`⚠️  Bitso API error: ${balanceData.error}`);
        console.log('Falling back to simulated portfolio');
        return this.getSimulatedPortfolio();
      }

      console.log('✅ Successfully connected to Bitso API');

      // Obtener precios para calcular valores
      const prices = await this.getAllPrices();

      // Construir portfolio con valores reales
      const portfolio = {
        assets: {},
        total_value: 0,
        source: 'bitso_api',
        timestamp: Date.now()
      };

      let totalValue = 0;

      // Solo procesar activos que tenemos definidos
      const supportedAssets = ['BTC', 'ETH', 'SOL', 'USDC'];

      Object.keys(balanceData.assets).forEach(currency => {
        if (supportedAssets.includes(currency)) {
          const amount = balanceData.assets[currency];
          const price = prices[currency]?.price || 0;
          const value = amount * price;

          portfolio.assets[currency] = {
            amount,
            price,
            value
          };

          totalValue += value;
        }
      });

      portfolio.total_value = totalValue;

      console.log(`📊 Portfolio loaded from Bitso: $${totalValue.toFixed(2)} MXN`);
      console.log(`🔢 Assets: ${Object.keys(portfolio.assets).length}`);

      return portfolio;

    } catch (error) {
      console.error(`❌ Error getting portfolio from Bitso: ${error.message}`);
      console.log('Falling back to simulated portfolio');
      return this.getSimulatedPortfolio();
    }
  }

  // Calcular allocations actuales
  calculateCurrentAllocations(portfolio) {
    const allocations = {};
    const total = portfolio.total_value;

    Object.keys(portfolio.assets).forEach(asset => {
      const value = portfolio.assets[asset].value;
      allocations[asset] = (value / total) * 100;
    });

    return allocations;
  }

  // Verificar si necesita rebalanceo
  needsRebalance(currentAllocations) {
    const target = this.allocations.target_allocations;
    const threshold = this.allocations.rebalance_settings.threshold_percent;
    const needsRebalance = {};
    let anyNeedsRebalance = false;

    Object.keys(target).forEach(asset => {
      const currentPercent = currentAllocations[asset] || 0;
      const targetPercent = target[asset] * 100;
      const diff = Math.abs(currentPercent - targetPercent);

      needsRebalance[asset] = {
        current: currentPercent.toFixed(2),
        target: targetPercent,
        diff: diff.toFixed(2),
        threshold: threshold
      };

      if (diff > threshold) {
        anyNeedsRebalance = true;
        needsRebalance[asset].action = currentPercent > targetPercent ? 'sell' : 'buy';
      }
    });

    return { needsRebalance, anyNeedsRebalance };
  }

  // Generar mensaje de alerta
  generateAlert(portfolio, currentAllocations, rebalanceInfo, technicalAnalysis = null) {
    let message = '📊 *Crypto Portfolio Update*\n\n';

    message += `💰 Total Value: $${portfolio.total_value.toFixed(2)}\n\n`;

    message += '*Current Allocation:*\n';
    Object.keys(currentAllocations).forEach(asset => {
      const percent = currentAllocations[asset].toFixed(2);
      const target = (this.allocations.target_allocations[asset] * 100).toFixed(2);
      const emoji = percent > target ? '📈' : percent < target ? '📉' : '✅';

      // Agregar señal técnica si está disponible
      let signalInfo = '';
      if (technicalAnalysis && technicalAnalysis[asset] && !technicalAnalysis[asset].error) {
        const signal = technicalAnalysis[asset].signal;
        const score = technicalAnalysis[asset].signalScore;
        const signalEmoji = signal.includes('BUY') ? '🟢' : signal.includes('SELL') ? '🔴' : '⚪';
        signalInfo = ` ${signalEmoji} ${signal}`;
      }

      message += `${emoji} ${asset}: ${percent}% (target: ${target}%)${signalInfo}\n`;
    });

    if (rebalanceInfo.anyNeedsRebalance) {
      message += '\n⚠️ *Rebalance Recommended:*\n';
      Object.keys(rebalanceInfo.needsRebalance).forEach(asset => {
        const info = rebalanceInfo.needsRebalance[asset];
        if (info.action) {
          message += `${info.action.toUpperCase()} ${asset}: ${info.diff}% deviation\n`;
        }
      });
    }

    // Resumen técnico
    if (technicalAnalysis) {
      let strongBuy = 0, strongSell = 0;
      Object.keys(technicalAnalysis).forEach(asset => {
        if (technicalAnalysis[asset].signal === 'STRONG_BUY') strongBuy++;
        if (technicalAnalysis[asset].signal === 'STRONG_SELL') strongSell++;
      });

      if (strongBuy > 0 || strongSell > 0) {
        message += '\n🔮 *Technical Signals:*\n';
        if (strongBuy > 0) message += `🟢 Strong Buy: ${strongBuy} assets\n`;
        if (strongSell > 0) message += `🔴 Strong Sell: ${strongSell} assets\n`;
      }
    }

    message += `\n🕐 ${new Date().toLocaleString()}`;

    return message;
  }

  // Ejecutar rebalanceo (SOLO si enableTrading = true)
  async rebalance(rebalanceInfo, portfolio) {
    if (!this.enableTrading) {
      console.log('Trading disabled - skipping rebalance');
      return { executed: false, reason: 'trading_disabled' };
    }

    console.log('Rebalance not implemented yet');
    return { executed: false, reason: 'not_implemented' };
  }

  // Run principal
  async run() {
    console.log('🪙 Starting Crypto Monitor...');
    console.log(`Trading enabled: ${this.enableTrading ? 'YES' : 'NO'}`);

    try {
      // 1. Obtener precios
      console.log('Fetching prices...');
      const prices = await this.getAllPrices();
      console.log('Prices fetched:', prices);

      // 2. Obtener portafolio
      console.log('Fetching portfolio...');
      const portfolio = await this.getRealPortfolio();
      console.log('Portfolio:', portfolio);

      // 3. Calcular allocations actuales
      const currentAllocations = this.calculateCurrentAllocations(portfolio);
      console.log('Current allocations:', currentAllocations);

      // 4. Verificar si necesita rebalanceo
      const rebalanceInfo = this.needsRebalance(currentAllocations);
      console.log('Rebalance info:', rebalanceInfo);

      // 5. Guardar logs
      this.logger.logPortfolio(portfolio);

      // 6. Análisis técnico (si está habilitado)
      let technicalAnalysis = null;
      let technicalRecommendations = [];

      if (this.enableTechnicalAnalysis) {
        console.log('\n📊 Running technical analysis...');
        try {
          const analysisResults = await this.technicalAnalyzer.analyzeAll(
            ['BTC', 'ETH', 'SOL', 'USDC'],
            3 // últimos 3 días
          );
          technicalAnalysis = analysisResults;
          console.log('Technical analysis completed:', Object.keys(analysisResults));

          // Generar recomendaciones basadas en análisis técnico
          technicalRecommendations = this.technicalAnalyzer.generateRebalanceRecommendation(
            analysisResults,
            currentAllocations,
            this.allocations.target_allocations
          );

          if (technicalRecommendations.length > 0) {
            console.log('\n💡 Technical recommendations:');
            technicalRecommendations.forEach(rec => {
              console.log(`  ${rec.action} ${rec.asset}: ${rec.reason}`);
            });
          }
        } catch (error) {
          console.error('Error in technical analysis:', error.message);
        }
      }

      // 7. Generar alerta
      const alert = this.generateAlert(portfolio, currentAllocations, rebalanceInfo, technicalAnalysis);
      console.log('\n📢 Alert:', alert);

      // 7. Ejecutar rebalanceo si es necesario
      if (rebalanceInfo.anyNeedsRebalance && this.enableTrading) {
        const rebalanceResult = await this.rebalance(rebalanceInfo, portfolio);
        console.log('Rebalance result:', rebalanceResult);
      }

      // 8. Generar reporte PnL
      const pnlReport = this.logger.generateReport();
      console.log('\n💵 PnL Report:', JSON.stringify(pnlReport, null, 2));

      return {
        success: true,
        portfolio,
        currentAllocations,
        rebalanceInfo,
        alert,
        pnlReport
      };

    } catch (error) {
      console.error('Error in monitor run:', error);
      return { success: false, error: error.message };
    }
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  const monitor = new CryptoMonitor();
  monitor.run().then(result => {
    console.log('\n✅ Monitor run completed');
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = CryptoMonitor;
