/**
 * Config Loader - Centraliza la carga de configuración
 *
 * Provee single source of truth para:
 * - Risk parameters
 * - Target allocations
 * - Trading thresholds
 */

const fs = require('fs');
const path = require('path');

class ConfigLoader {
  constructor(mode = 'conservative') {
    this.mode = mode;
    this.configDir = path.join(__dirname, '..', 'config');
    this.dataDir = path.join(__dirname, '..', 'data');
    this._loadConfig();
  }

  /**
   * Cargar configuración según el modo
   */
  _loadConfig() {
    // Cargar config del modo específico
    const modeConfigPath = path.join(this.configDir, `${this.mode}.json`);
    const allocationsPath = path.join(this.dataDir, 'allocations.json');

    if (!fs.existsSync(modeConfigPath)) {
      throw new Error(`Config file not found: ${modeConfigPath}`);
    }

    if (!fs.existsSync(allocationsPath)) {
      throw new Error(`Allocations file not found: ${allocationsPath}`);
    }

    const modeConfig = JSON.parse(fs.readFileSync(modeConfigPath, 'utf8'));
    const allocations = JSON.parse(fs.readFileSync(allocationsPath, 'utf8'));

    // Consolidar configuración
    this.config = {
      mode: this.mode,
      description: modeConfig.description,

      // Risk params (desde config/[mode].json)
      riskParams: {
        maxPositionSizePercent: modeConfig.riskParams?.maxPositionSizePercent || 30,
        minTradePercent: modeConfig.riskParams?.minTradePercent || 1,
        maxDailyTrades: modeConfig.riskParams?.maxDailyTrades || 5,
        maxDailyLossPercent: modeConfig.riskParams?.maxDailyLossPercent || 2,
        takeProfitPercent: modeConfig.riskParams?.takeProfitPercent || 5,
        stopLossPercent: modeConfig.riskParams?.stopLossPercent || 3,
        allocationWeight: modeConfig.riskParams?.allocationWeight || 0.4,
        technicalWeight: modeConfig.riskParams?.technicalWeight || 0.6,
      },

      // Indicadores técnicos
      indicators: {
        sma: modeConfig.indicators?.sma || { short: 6, medium: 12, long: 36 },
        ema: modeConfig.indicators?.ema || { fast: 6, slow: 12 },
        rsi: modeConfig.indicators?.rsi || { period: 14 },
        macd: modeConfig.indicators?.macd || { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
        bollingerBands: modeConfig.indicators?.bollingerBands || { period: 20, stdDev: 2 },
        lookbackDays: modeConfig.indicators?.lookbackDays || 3,
      },

      // Umbrales para señales
      thresholds: {
        rsi: modeConfig.thresholds?.rsi || { oversold: 30, overbought: 70 },
        signalScore: modeConfig.thresholds?.signalScore || {
          strongBuy: 70,
          buy: 60,
          sell: 40,
          strongSell: 30
        },
        crossover: modeConfig.thresholds?.crossover || { strengthThreshold: 0.005 },
      },

      // Allocations (desde data/allocations.json)
      targetAllocations: allocations.target_allocations,
      rebalanceSettings: {
        thresholdPercent: allocations.rebalance_settings?.threshold_percent || 10,
        minTradeUsd: allocations.rebalance_settings?.min_trade_usd || 50,
        maxTradeUsd: allocations.rebalance_settings?.max_trade_usd || 1000,
      },
    };

    console.log(`✅ Config loaded: mode=${this.mode}`);
  }

  /**
   * Obtener configuración completa
   */
  getConfig() {
    return this.config;
  }

  /**
   * Obtener risk params
   */
  getRiskParams() {
    return this.config.riskParams;
  }

  /**
   * Obtener target allocations
   */
  getTargetAllocations() {
    return this.config.targetAllocations;
  }

  /**
   * Obtener configuración de indicadores
   */
  getIndicators() {
    return this.config.indicators;
  }

  /**
   * Obtener umbrales
   */
  getThresholds() {
    return this.config.thresholds;
  }

  /**
   * Cambiar modo y recargar
   */
  setMode(mode) {
    this.mode = mode;
    this._loadConfig();
  }
}

module.exports = ConfigLoader;
