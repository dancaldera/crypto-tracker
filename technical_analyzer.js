/**
 * Technical Analyzer - Analisis predictivo basado en datos historicos
 *
 * Indicadores implementados:
 * - SMA (Simple Moving Average) - Diferentes periodos
 * - EMA (Exponential Moving Average)
 * - RSI (Relative Strength Index)
 * - MACD (Moving Average Convergence Divergence)
 * - Bollinger Bands
 * - Volatilidad
 * - Tendencia (basada en pendiente de SMA)
 * - Senales de compra/venta
 */

const fs = require('fs');
const path = require('path');

class TechnicalAnalyzer {
  constructor(options = {}) {
    this.pricesDir = options.pricesDir || path.join(__dirname, 'logs', 'prices');
    this.lookbackPeriods = options.lookbackPeriods || {
      short: 6,    // 12 horas (cada 2h)
      medium: 12,  // 24 horas
      long: 36     // 3 dias
    };
  }

  /**
   * Cargar datos historicos de precios
   */
  async loadPriceHistory(asset, days = 3) {
    const prices = [];
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (let i = 0; i < days; i++) {
      const date = new Date(now - i * oneDayMs);
      const dateStr = date.toISOString().split('T')[0];
      const filePath = path.join(this.pricesDir, `${asset}_${dateStr}.csv`);

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n');

        for (const line of lines) {
          const [timestamp, price] = line.split(',');
          if (timestamp && price) {
            prices.push({
              timestamp: parseInt(timestamp),
              price: parseFloat(price)
            });
          }
        }
      }
    }

    // Ordenar por timestamp (mas viejo primero)
    prices.sort((a, b) => a.timestamp - b.timestamp);

    return prices;
  }

  /**
   * Calcular SMA (Simple Moving Average)
   */
  calculateSMA(prices, period) {
    if (prices.length < period) return null;

    const slice = prices.slice(-period);
    const sum = slice.reduce((acc, p) => acc + p.price, 0);
    return sum / period;
  }

  /**
   * Calcular EMA (Exponential Moving Average)
   */
  calculateEMA(prices, period) {
    if (prices.length < period) return null;

    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((acc, p) => acc + p.price, 0) / period;

    for (let i = period; i < prices.length; i++) {
      ema = (prices[i].price - ema) * multiplier + ema;
    }

    return ema;
  }

  /**
   * Calcular MACD (Moving Average Convergence Divergence)
   *
   * MACD = EMA(fast) - EMA(slow)
   * Signal = EMA(MACD, signalPeriod)
   * Histogram = MACD - Signal
   *
   * Interpretacion:
   * - MACD > Signal: Potencial COMPRA
   * - MACD < Signal: Potencial VENTA
   * - Cruzamiento: Señas fuerte de compra/venta
   */
  calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (prices.length < slowPeriod + signalPeriod) return null;

    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);

    if (!fastEMA || !slowEMA) return null;

    const macd = fastEMA - slowEMA;

    // Calcular Signal line (EMA del MACD)
    const macdValues = [];
    const minDataPoints = slowPeriod + signalPeriod;

    for (let i = minDataPoints; i <= prices.length; i++) {
      const fast = this.calculateEMA(prices.slice(0, i), fastPeriod);
      const slow = this.calculateEMA(prices.slice(0, i), slowPeriod);
      if (fast && slow) {
        macdValues.push(fast - slow);
      }
    }

    if (macdValues.length < signalPeriod) return { macd, signal: null, histogram: null };

    // Calcular EMA del MACD para la Signal line
    const multiplier = 2 / (signalPeriod + 1);
    let signal = macdValues.slice(0, signalPeriod).reduce((acc, val) => acc + val, 0) / signalPeriod;

    for (let i = signalPeriod; i < macdValues.length; i++) {
      signal = (macdValues[i] - signal) * multiplier + signal;
    }

    const histogram = macd - signal;
    const trend = macd > signal ? 'BULLISH' : 'BEARISH';

    return {
      macd,
      signal,
      histogram,
      trend,
      fastPeriod,
      slowPeriod,
      signalPeriod
    };
  }

  /**
   * Detectar crossover MACD (senal de compra/venta)
   */
  detectMACDCrossover(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (prices.length < slowPeriod + signalPeriod + 2) return null;

    const currentMACD = this.calculateMACD(prices, fastPeriod, slowPeriod, signalPeriod);
    if (!currentMACD || !currentMACD.signal) return null;

    const prevPrices = prices.slice(0, -1);
    const prevMACD = this.calculateMACD(prevPrices, fastPeriod, slowPeriod, signalPeriod);
    if (!prevMACD || !prevMACD.signal) return null;

    // Detectar crossover: MACD cruza a Signal
    const crossedUp = currentMACD.macd > currentMACD.signal && prevMACD.macd <= prevMACD.signal;
    const crossedDown = currentMACD.macd < currentMACD.signal && prevMACD.macd >= prevMACD.signal;

    if (crossedUp) {
      return {
        signal: 'BUY',
        strength: Math.abs(currentMACD.histogram) / Math.abs(currentMACD.signal) || 0.5,
        macd: currentMACD
      };
    }

    if (crossedDown) {
      return {
        signal: 'SELL',
        strength: Math.abs(currentMACD.histogram) / Math.abs(currentMACD.signal) || 0.5,
        macd: currentMACD
      };
    }

    return null;
  }

  /**
   * Calcular Bollinger Bands
   *
   * Middle Band = SMA(period)
   * Upper Band = SMA + (stdDev * multiplier)
   * Lower Band = SMA - (stdDev * multiplier)
   *
   * Interpretacion:
   * - Precio cerca de Upper: Sobrecompra (potencial venta)
   * - Precio cerca de Lower: Sobreventa (potencial compra)
   * - Bandas estrechas: Volatilidad baja, posible movimiento fuerte proximo
   * - Bandas anchas: Alta volatilidad
   */
  calculateBollingerBands(prices, period = 20, stdDevMultiplier = 2) {
    if (prices.length < period) return null;

    const slice = prices.slice(-period);
    const middleBand = slice.reduce((acc, p) => acc + p.price, 0) / period;

    // Calcular desviacion estandar
    const variance = slice.reduce((acc, p) => {
      return acc + Math.pow(p.price - middleBand, 2);
    }, 0) / period;

    const stdDev = Math.sqrt(variance);

    const upperBand = middleBand + (stdDev * stdDevMultiplier);
    const lowerBand = middleBand - (stdDev * stdDevMultiplier);

    const currentPrice = prices[prices.length - 1].price;
    const bandwidth = (upperBand - lowerBand) / middleBand;

    // Calcular posicion del precio dentro de las bandas (0% = lower, 100% = upper)
    const percentB = (currentPrice - lowerBand) / (upperBand - lowerBand);

    let position = 'MIDDLE';
    if (percentB > 0.8) position = 'UPPER';
    else if (percentB < 0.2) position = 'LOWER';

    return {
      middleBand,
      upperBand,
      lowerBand,
      bandwidth,
      bandwidthPercent: (bandwidth * 100),
      percentB: percentB * 100,
      position,
      currentPrice,
      period,
      stdDevMultiplier
    };
  }

  /**
   * Calcular RSI (Relative Strength Index)
   */
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;

    let gains = 0;
    let losses = 0;

    // Primer periodo
    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i].price - prices[i - 1].price;
      if (change > 0) gains += change;
      else losses -= change;
    }

    // Calcular RS
    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return rsi;
  }

  /**
   * Calcular volatilidad (desviacion estandar)
   */
  calculateVolatility(prices, period = 12) {
    if (prices.length < period) return null;

    const slice = prices.slice(-period);
    const sma = slice.reduce((acc, p) => acc + p.price, 0) / period;

    const variance = slice.reduce((acc, p) => {
      return acc + Math.pow(p.price - sma, 2);
    }, 0) / period;

    return Math.sqrt(variance);
  }

  /**
   * Detectar tendencia (basada en pendiente de SMA)
   */
  detectTrend(prices, period = 12) {
    if (prices.length < period + 6) return { direction: 'NEUTRAL', strength: 0 };

    // Comparar SMA actual vs SMA hace 6 periodos
    const currentSMA = this.calculateSMA(prices, period);
    const oldPrices = prices.slice(0, -6);
    const oldSMA = this.calculateSMA(oldPrices, period);

    if (!currentSMA || !oldSMA) return { direction: 'NEUTRAL', strength: 0 };

    const change = ((currentSMA - oldSMA) / oldSMA) * 100;

    // Clasificar tendencia
    if (change > 1.5) return { direction: 'BULLISH', strength: Math.min(change / 3, 1) };
    if (change < -1.5) return { direction: 'BEARISH', strength: Math.min(Math.abs(change) / 3, 1) };
    return { direction: 'NEUTRAL', strength: Math.abs(change) / 1.5 };
  }

  /**
   * Detectar crossover de medias (senal de compra/venta)
   */
  detectCrossover(prices, fastPeriod = 6, slowPeriod = 12) {
    if (prices.length < slowPeriod + 2) return null;

    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);

    if (!fastEMA || !slowEMA) return null;

    // Calcular EMAs anteriores
    const prevPrices = prices.slice(0, -1);
    const prevFastEMA = this.calculateEMA(prevPrices, fastPeriod);
    const prevSlowEMA = this.calculateEMA(prevPrices, slowPeriod);

    if (!prevFastEMA || !prevSlowEMA) return null;

    // Detectar crossover
    const nowCrossedUp = fastEMA > slowEMA && prevFastEMA <= prevSlowEMA;
    const nowCrossedDown = fastEMA < slowEMA && prevFastEMA >= prevSlowEMA;

    if (nowCrossedUp) return { signal: 'BUY', strength: (fastEMA - slowEMA) / slowEMA };
    if (nowCrossedDown) return { signal: 'SELL', strength: (slowEMA - fastEMA) / fastEMA };

    return null;
  }

  /**
   * Analizar asset completo
   */
  async analyze(asset, days = 3, options = {}) {
    const prices = await this.loadPriceHistory(asset, days);

    if (prices.length < 6) {
      return {
        asset,
        error: 'Insufficient data',
        dataPoints: prices.length
      };
    }

    const currentPrice = prices[prices.length - 1].price;

    // Calcular indicadores
    const smaShort = this.calculateSMA(prices, this.lookbackPeriods.short);
    const smaMedium = this.calculateSMA(prices, this.lookbackPeriods.medium);
    const smaLong = this.calculateSMA(prices, this.lookbackPeriods.long);
    const emaShort = this.calculateEMA(prices, this.lookbackPeriods.short);
    const rsi = this.calculateRSI(prices);
    const volatility = this.calculateVolatility(prices);
    const trend = this.detectTrend(prices);
    const crossover = this.detectCrossover(prices);

    // Nuevos indicadores: MACD y Bollinger Bands
    const macd = this.calculateMACD(prices, 12, 26, 9);
    const macdCrossover = this.detectMACDCrossover(prices, 12, 26, 9);
    const bollinger = this.calculateBollingerBands(prices, 20, 2);

    // Umbrales configurables (conservador vs agresivo)
    const thresholds = options.thresholds || {
      rsi: { oversold: 30, overbought: 70 },
      bollinger: { upperPercent: 80, lowerPercent: 20 }
    };

    // Calcular score de senal (0-100)
    let signalScore = 50; // Neutral

    // Factor RSI (sobrecompra/sobreventa)
    if (rsi) {
      if (rsi < thresholds.rsi.oversold) signalScore += 20; // Sobreventa - potencial compra
      if (rsi > thresholds.rsi.overbought) signalScore -= 20; // Sobrecompra - potencial venta
    }

    // Factor tendencia
    if (trend.direction === 'BULLISH') signalScore += 15 * trend.strength;
    if (trend.direction === 'BEARISH') signalScore -= 15 * trend.strength;

    // Factor crossover EMA
    if (crossover) {
      if (crossover.signal === 'BUY') signalScore += 25 * crossover.strength;
      if (crossover.signal === 'SELL') signalScore -= 25 * crossover.strength;
    }

    // Factor MACD crossover (nuevo)
    if (macdCrossover) {
      if (macdCrossover.signal === 'BUY') signalScore += 20 * macdCrossover.strength;
      if (macdCrossover.signal === 'SELL') signalScore -= 20 * macdCrossover.strength;
    } else if (macd && macd.trend === 'BULLISH') {
      signalScore += 10; // MACD bullish sin crossover
    } else if (macd && macd.trend === 'BEARISH') {
      signalScore -= 10; // MACD bearish sin crossover
    }

    // Factor Bollinger Bands (nuevo)
    if (bollinger) {
      if (bollinger.position === 'LOWER' && bollinger.percentB < thresholds.bollinger.lowerPercent) {
        signalScore += 15; // Precio cerca de banda inferior - potencial compra
      } else if (bollinger.position === 'UPPER' && bollinger.percentB > thresholds.bollinger.upperPercent) {
        signalScore -= 15; // Precio cerca de banda superior - potencial venta
      }
    }

    // Factor posicion vs SMA
    if (smaMedium) {
      const vsSMA = ((currentPrice - smaMedium) / smaMedium) * 100;
      signalScore += vsSMA * 5; // +2% vs SMA = +10 points
    }

    // Normalizar score
    signalScore = Math.max(0, Math.min(100, signalScore));

    // Determinar senal
    let signal = 'HOLD';
    if (signalScore >= 70) signal = 'STRONG_BUY';
    else if (signalScore >= 60) signal = 'BUY';
    else if (signalScore <= 30) signal = 'STRONG_SELL';
    else if (signalScore <= 40) signal = 'SELL';

    return {
      asset,
      currentPrice,
      dataPoints: prices.length,
      indicators: {
        sma: { short: smaShort, medium: smaMedium, long: smaLong },
        ema: { short: emaShort },
        rsi,
        volatility,
        volatilityPercent: volatility ? (volatility / currentPrice * 100) : null,
        trend,
        crossover,
        macd,
        macdCrossover,
        bollinger
      },
      signal,
      signalScore: signalScore.toFixed(1),
      confidence: Math.abs(signalScore - 50) / 50 // 0 = neutro, 1 = max confianza
    };
  }

  /**
   * Analizar todos los assets
   */
  async analyzeAll(assets = ['BTC', 'ETH', 'SOL', 'USDC'], days = 3, options = {}) {
    const results = {};

    for (const asset of assets) {
      try {
        results[asset] = await this.analyze(asset, days, options);
      } catch (error) {
        results[asset] = { error: error.message };
      }
    }

    return results;
  }

  /**
   * Generar recomendacion de rebalanceo basada en senales
   */
  generateRebalanceRecommendation(analysisResults, currentAllocations, targetAllocations) {
    const recommendations = [];

    Object.keys(analysisResults).forEach(asset => {
      const analysis = analysisResults[asset];
      if (analysis.error) return;

      const currentAlloc = currentAllocations[asset] || 0;
      const targetAlloc = targetAllocations[asset] * 100;
      const allocDiff = currentAlloc - targetAlloc;

      // Combinar allocation diff con senal tecnica
      let action = 'HOLD';
      let reason = [];

      // Si esta sobre-alocado
      if (allocDiff > 5) {
        // Reducir mas si la senal es bajista
        if (['SELL', 'STRONG_SELL'].includes(analysis.signal)) {
          action = 'SELL';
          reason.push(`Over-allocated (+${allocDiff.toFixed(1)}%) + Bearish signal`);
        } else if (analysis.signal === 'BUY') {
          action = 'HOLD';
          reason.push(`Over-allocated but bullish - wait`);
        } else {
          action = 'SELL';
          reason.push(`Over-allocated (+${allocDiff.toFixed(1)}%)`);
        }
      }
      // Si esta sub-alocado
      else if (allocDiff < -5) {
        // Comprar mas si la senal es alcista
        if (['BUY', 'STRONG_BUY'].includes(analysis.signal)) {
          action = 'BUY';
          reason.push(`Under-allocated (${allocDiff.toFixed(1)}%) + Bullish signal`);
        } else if (analysis.signal === 'SELL') {
          action = 'HOLD';
          reason.push(`Under-allocated but bearish - wait`);
        } else {
          action = 'BUY';
          reason.push(`Under-allocated (${allocDiff.toFixed(1)}%)`);
        }
      }
      // Si allocation esta bien, seguir senal tecnica
      else {
        if (analysis.signal === 'STRONG_BUY') {
          action = 'BUY';
          reason.push(`Strong bullish signal`);
        } else if (analysis.signal === 'STRONG_SELL') {
          action = 'SELL';
          reason.push(`Strong bearish signal`);
        }
      }

      if (action !== 'HOLD') {
        recommendations.push({
          asset,
          action,
          reason: reason.join(', '),
          currentAlloc: currentAlloc.toFixed(2),
          targetAlloc: targetAlloc.toFixed(2),
          signal: analysis.signal,
          signalScore: analysis.signalScore,
          confidence: (analysis.confidence * 100).toFixed(0)
        });
      }
    });

    return recommendations;
  }

  /**
   * Formatear resultados para display
   */
  formatResults(analysisResults, thresholds = null) {
    let output = '\n📊 TECHNICAL ANALYSIS\n';
    output += '='.repeat(50) + '\n\n';

    const rsiOversold = thresholds?.rsi?.oversold || 30;
    const rsiOverbought = thresholds?.rsi?.overbought || 70;

    Object.keys(analysisResults).forEach(asset => {
      const analysis = analysisResults[asset];

      if (analysis.error) {
        output += `❌ ${asset}: ${analysis.error}\n\n`;
        return;
      }

      const { currentPrice, indicators, signal, signalScore, confidence } = analysis;

      output += `${asset} ($${currentPrice.toLocaleString()} MXN)\n`;
      output += `  ├─ Signal: ${signal} (Score: ${signalScore}/100)\n`;
      output += `  ├─ Confidence: ${(confidence * 100).toFixed(0)}%\n`;

      // RSI
      if (indicators.rsi) {
        const rsiStatus = indicators.rsi > rsiOverbought ? '🔴 Overbought' :
                          indicators.rsi < rsiOversold ? '🟢 Oversold' : '⚪ Neutral';
        output += `  ├─ RSI: ${indicators.rsi.toFixed(1)} ${rsiStatus}\n`;
      }

      // Trend
      if (indicators.trend) {
        const trendEmoji = indicators.trend.direction === 'BULLISH' ? '📈' :
                          indicators.trend.direction === 'BEARISH' ? '📉' : '➡️';
        output += `  ├─ Trend: ${trendEmoji} ${indicators.trend.direction}\n`;
      }

      // MACD
      if (indicators.macd) {
        const macdEmoji = indicators.macd.trend === 'BULLISH' ? '📈' :
                          indicators.macd.trend === 'BEARISH' ? '📉' : '➡️';
        output += `  ├─ MACD: ${macdEmoji} ${indicators.macd.macd.toFixed(2)}`;
        if (indicators.macd.signal) {
          output += ` (Signal: ${indicators.macd.signal.toFixed(2)})`;
        }
        if (indicators.macdCrossover) {
          output += ` ⚡ ${indicators.macdCrossover.signal}`;
        }
        output += '\n';
      }

      // Bollinger Bands
      if (indicators.bollinger) {
        const bbEmoji = indicators.bollinger.position === 'UPPER' ? '🔴' :
                        indicators.bollinger.position === 'LOWER' ? '🟢' : '⚪';
        output += `  ├─ BB: ${bbEmoji} ${indicators.bollinger.position} (${indicators.bollinger.percentB.toFixed(1)}%)\n`;
        output += `  │  └─ Width: ${indicators.bollinger.bandwidthPercent.toFixed(2)}%\n`;
      }

      // Volatility
      if (indicators.volatilityPercent) {
        output += `  ├─ Volatility: ${indicators.volatilityPercent.toFixed(2)}%\n`;
      }

      // vs SMA
      if (indicators.sma.medium) {
        const vsSMA = ((currentPrice - indicators.sma.medium) / indicators.sma.medium * 100);
        const vsSMAEmoji = vsSMA > 0 ? '📈' : '📉';
        output += `  └─ vs SMA(12): ${vsSMAEmoji} ${vsSMA.toFixed(2)}%\n`;
      }

      output += '\n';
    });

    return output;
  }
}

module.exports = TechnicalAnalyzer;
