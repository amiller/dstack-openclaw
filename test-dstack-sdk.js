#!/usr/bin/env node

// Test dstack SDK with local simulator
const path = require('path');

// Point to the simulator socket
const simulatorPath = path.join(__dirname, 'dstack/sdk/simulator/dstack.sock');
process.env.DSTACK_SIMULATOR_ENDPOINT = simulatorPath;

console.log(`Using simulator at: ${simulatorPath}`);

async function main() {
  // Import the SDK
  const { DstackClient } = await import('./dstack/sdk/js/dist/index.js');
  
  const client = new DstackClient();
  
  console.log('\n1. Checking if service is reachable...');
  const isReachable = await client.isReachable();
  console.log(`   Reachable: ${isReachable}`);
  
  if (!isReachable) {
    console.error('   ❌ Simulator not reachable!');
    process.exit(1);
  }
  
  console.log('\n2. Getting system info...');
  const info = await client.info();
  console.log(`   Instance ID: ${info.instance_id}`);
  console.log(`   App ID: ${info.app_id}`);
  
  console.log('\n3. Deriving a test key...');
  const keyResult = await client.getKey('skill-verifier/test/v1');
  console.log(`   Key (hex): ${Buffer.from(keyResult.key).toString('hex').substring(0, 32)}...`);
  console.log(`   Signature chain length: ${keyResult.signature_chain.length}`);
  
  console.log('\n4. Generating TDX quote...');
  const testData = 'skill-verification-test';
  const crypto = await import('crypto');
  const hash = crypto.createHash('sha256').update(testData).digest();
  const quoteResult = await client.getQuote(hash.slice(0, 32));
  console.log(`   Quote length: ${quoteResult.quote.length} chars`);
  console.log(`   Quote preview: ${quoteResult.quote.substring(0, 40)}...`);
  
  console.log('\n✅ All tests passed! SDK is working with simulator.');
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
