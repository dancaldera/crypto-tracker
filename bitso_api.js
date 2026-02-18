const crypto = require('crypto');
const axios = require('axios');

class BitsoAPI {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = 'https://api.bitso.com/v3';
  }

  // Generar firma HMAC SHA256
  buildSignature(httpMethod, requestPath, payload = '') {
    const timestamp = Math.floor(Date.now() / 1000);
    const what = timestamp + httpMethod + requestPath + payload;
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(what)
      .digest('hex');
    return { signature, timestamp };
  }

  // Hacer request autenticado
  async authenticatedRequest(method, endpoint, payload = '') {
    const requestPath = `/v3${endpoint}`;
    const { signature, timestamp } = this.buildSignature(method, requestPath, JSON.stringify(payload));

    const headers = {
      'Content-Type': 'application/json',
      'X-Auth': this.apiKey,
      'X-Signature': signature,
      'X-Timestamp': timestamp
    };

    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers,
        data: method !== 'GET' ? payload : undefined
      });
      return response.data;
    } catch (error) {
      console.error(`Bitso API Error: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  // Obtener balance de la cuenta
  async getBalance() {
    try {
      const response = await this.authenticatedRequest('GET', '/balance/');
      if (response.success) {
        const balances = response.payload.balances.filter(b => parseFloat(b.balance) > 0);
        return {
          success: true,
          balances: balances.map(b => ({
            currency: b.currency,
            amount: parseFloat(b.balance),
            available: parseFloat(b.available),
            locked: parseFloat(b.locked)
          }))
        };
      }
      throw new Error(response.error?.message || 'Failed to get balance');
    } catch (error) {
      console.error('Error getting Bitso balance:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Obtener portafolio en formato del sistema
  async getPortfolio() {
    try {
      const balanceData = await this.getBalance();
      if (!balanceData.success) {
        return { success: false, error: balanceData.error };
      }

      const assets = {};
      balanceData.balances.forEach(b => {
        assets[b.currency] = b.amount;
      });

      return {
        success: true,
        assets,
        source: 'bitso_api',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error getting Bitso portfolio:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Obtener ticker (precio público)
  async getTicker(book) {
    try {
      const response = await axios.get(`${this.baseUrl}/ticker/?book=${book}`);
      if (response.data.success) {
        return {
          success: true,
          book: response.data.payload.book,
          last: parseFloat(response.data.payload.last),
          high: parseFloat(response.data.payload.high),
          low: parseFloat(response.data.payload.low),
          vwap: parseFloat(response.data.payload.vwap),
          volume: parseFloat(response.data.payload.volume),
          created_at: response.data.payload.created_at,
          timestamp: Date.now()
        };
      }
      throw new Error(response.data.error?.message || 'Failed to get ticker');
    } catch (error) {
      console.error(`Error getting ticker for ${book}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Obtener múltiples tickers
  async getTickers(books) {
    const tickers = {};
    for (const book of books) {
      const ticker = await this.getTicker(book);
      if (ticker.success) {
        tickers[book] = ticker;
      }
    }
    return tickers;
  }

  // Obtener trades recientes (historial)
  async getUserTrades(limit = 100) {
    try {
      const response = await this.authenticatedRequest('GET', `/user_trades/?limit=${limit}`);
      if (response.success) {
        return {
          success: true,
          trades: response.payload.map(t => ({
            oid: t.oid,
            book: t.book,
            side: t.side, // 'buy' o 'sell'
            price_e8: t.price_e8,
            major_amount_e8: t.major_amount_e8,
            created_at: t.created_at
          }))
        };
      }
      throw new Error(response.error?.message || 'Failed to get user trades');
    } catch (error) {
      console.error('Error getting user trades:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Verificar conexión
  async testConnection() {
    try {
      // Intentar obtener balance (requiere autenticación)
      const balance = await this.getBalance();
      if (balance.success) {
        return {
          success: true,
          message: 'Conexión exitosa con Bitso API',
          balances_count: balance.balances.length
        };
      }
      return {
        success: false,
        message: balance.error || 'Error al obtener balance'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error de conexión: ${error.message}`
      };
    }
  }
}

module.exports = BitsoAPI;
