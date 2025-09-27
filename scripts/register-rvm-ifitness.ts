#!/usr/bin/env tsx

/**
 * Script to register iFitness Orchid RVM on Hedera blockchain
 * 
 * Usage:
 *   npm run tsx scripts/register-rvm-ifitness.ts
 * 
 * Or with bun:
 *   bun run scripts/register-rvm-ifitness.ts
 */

// Load environment variables from .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { registerRVMOnHedera } from '../src/actions/blockchain';

// RVM Details for iFitness Orchid
const RVM_DATA = {
  // Generate RVM ID based on location and name
  rvmId: 'RVM-IFITNESS-ORCHID-001',
  latitude: 6.433402,
  longitude: 3.541907,
  name: 'iFitness Orchid',
  metaURI: '', // Empty for now, can be updated later with metadata
};

async function registerRVM() {
  console.log('🚀 Starting RVM Registration Script');
  console.log('================================');
  
  console.log('📍 RVM Details:');
  console.log(`   ID: ${RVM_DATA.rvmId}`);
  console.log(`   Name: ${RVM_DATA.name}`);
  console.log(`   Location: ${RVM_DATA.latitude}, ${RVM_DATA.longitude}`);
  console.log(`   Metadata URI: ${RVM_DATA.metaURI || 'None'}`);
  console.log('');

  try {
    console.log('⏳ Registering RVM on Hedera blockchain...');
    
    const result = await registerRVMOnHedera(
      RVM_DATA.rvmId,
      RVM_DATA.latitude,
      RVM_DATA.longitude,
      RVM_DATA.name,
      RVM_DATA.metaURI
    );

    console.log('📊 Registration Result:');
    console.log(`   Success: ${result.success ? '✅' : '❌'}`);
    console.log(`   Message: ${result.message}`);
    
    if (result.success && result.transactionId) {
      console.log(`   Transaction ID: ${result.transactionId}`);
      console.log('');
      console.log('🎉 RVM Successfully Registered!');
      console.log(`🔗 View transaction: https://hashscan.io/testnet/transaction/${result.transactionId}`);
    } else if (result.error) {
      console.log(`   Error: ${result.error}`);
      console.log('');
      console.log('❌ Registration Failed');
    }

  } catch (error) {
    console.error('💥 Unexpected Error:');
    console.error(error);
    process.exit(1);
  }
}

// Helper function to display environment status
function checkEnvironment() {
  console.log('🔧 Environment Check:');
  console.log(`   HEDERA_NETWORK: ${process.env.HEDERA_NETWORK || 'testnet (default)'}`);
  console.log(`   HEDERA_OPERATOR_ID: ${process.env.HEDERA_OPERATOR_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`   HEDERA_OPERATOR_KEY: ${process.env.HEDERA_OPERATOR_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   HEDERA_CONTRACT_ID: ${process.env.HEDERA_CONTRACT_ID || '0x668a877dcc604eb95d448fe2e3a3a30b5f379073 (default)'}`);
  console.log('');

  if (!process.env.HEDERA_OPERATOR_ID) {
    console.log('⚠️  Warning: HEDERA_OPERATOR_ID not set. Please add it to .env.local');
  }
}

// Main execution
async function main() {
  checkEnvironment();
  
  // Prompt user for confirmation
  console.log('❓ Do you want to proceed with RVM registration? (y/N)');
  
  // Simple confirmation (for demo - in real script you might use inquirer or similar)
  const shouldProceed = process.argv.includes('--confirm') || process.argv.includes('-y');
  
  if (!shouldProceed) {
    console.log('💡 To run without confirmation, use: --confirm or -y flag');
    console.log('Example: npm run tsx scripts/register-rvm-ifitness.ts -- --confirm');
    console.log('');
    console.log('⏸️  Registration cancelled. Add --confirm flag to proceed.');
    process.exit(0);
  }

  await registerRVM();
}

// Execute script
main().catch(console.error);
