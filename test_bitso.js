#!/usr/bin/env node
/**
 * Script para probar la conexión con la API de Bitso
 * Uso: node test_bitso.js
 */

require('dotenv').config();
const BitsoAPI = require('./bitso_api');

async function testBitsoConnection() {
  console.log('🔌 Testing Bitso API Connection...\n');

  // Verificar credenciales
  if (!process.env.BITSO_API_KEY || !process.env.BITSO_API_SECRET) {
    console.log('❌ ERROR: No Bitso API credentials found');
    console.log('');
    console.log('Please set up your .env file with:');
    console.log('  BITSO_API_KEY=your_api_key_here');
    console.log('  BITSO_API_SECRET=your_api_secret_here');
    console.log('');
    console.log('See config/BITSO_SETUP.md for instructions');
    process.exit(1);
  }

  console.log('✅ API Key configured');
  console.log(`   Key: ${process.env.BITSO_API_KEY.substring(0, 8)}...`);
  console.log(`   Secret: ${process.env.BITSO_API_SECRET.substring(0, 8)}...`);
  console.log('');

  // Crear instancia
  const bitso = new BitsoAPI(
    process.env.BITSO_API_KEY,
    process.env.BITSO_API_SECRET
  );

  try {
    // Test 1: Obtener balance
    console.log('📊 Test 1: Getting balance...');
    const balance = await bitso.getBalance();

    if (balance.success) {
      console.log('✅ Balance retrieved successfully');
      console.log(`   Currencies with balance: ${balance.balances.length}`);
      balance.balances.forEach(b => {
        console.log(`   - ${b.currency}: ${b.available} (locked: ${b.locked})`);
      });
    } else {
      console.log('❌ Failed to get balance');
      console.log(`   Error: ${balance.error}`);
    }

    console.log('');

    // Test 2: Obtener ticker público
    console.log('💰 Test 2: Getting public ticker (BTC_MXN)...');
    const ticker = await bitso.getTicker('btc_mxn');

    if (ticker.success) {
      console.log('✅ Ticker retrieved successfully');
      console.log(`   Last price: $${ticker.last} MXN`);
      console.log(`   High: $${ticker.high}`);
      console.log(`   Low: $${ticker.low}`);
    } else {
      console.log('❌ Failed to get ticker');
      console.log(`   Error: ${ticker.error}`);
    }

    console.log('');

    // Test 3: Verificar conexión completa
    console.log('🔗 Test 3: Full connection test...');
    const connection = await bitso.testConnection();

    if (connection.success) {
      console.log('✅ Connection test passed');
      console.log(`   ${connection.message}`);
      console.log(`   Balances: ${connection.balances_count}`);
    } else {
      console.log('❌ Connection test failed');
      console.log(`   ${connection.message}`);
    }

    console.log('');
    console.log('🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    process.exit(1);
  }
}

// Ejecutar tests
testBitsoConnection().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
