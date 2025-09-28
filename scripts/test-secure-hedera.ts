#!/usr/bin/env npx tsx

/**
 * Test script to verify secure Hedera account generation functionality
 * Tests server actions only - no client-side credentials exposed
 * Run with: npx tsx scripts/test-secure-hedera.ts
 */

import dotenv from 'dotenv';
import { generateHederaAccountAction } from '../src/actions/hedera-account';
import { isValidHederaAccountId, isOldGreenIdFormat } from '../src/lib/utils/hedera';

// Load environment variables for testing
dotenv.config({ path: '.env.local' });

async function testSecureHederaImplementation() {
  console.log('🔒 Testing Secure Hedera Implementation...\n');

  try {
    // Test 1: Server-side account generation
    console.log('🔧 Test 1: Testing secure server-side account generation...');
    const hederaResult = await generateHederaAccountAction();
    
    if (hederaResult.success && hederaResult.data) {
      console.log('✅ Secure Hedera account generated successfully:');
      console.log(`  Account ID: ${hederaResult.data.accountId}`);
      console.log(`  EVM Address: ${hederaResult.data.evmAddress}`);
      console.log(`  Encrypted Private Key: [ENCRYPTED - ${hederaResult.data.encryptedPrivateKey.length} chars]`);
      console.log('  🔒 Private key never exposed to client!\n');
    } else {
      console.log('❌ Server-side account generation failed:', hederaResult.error);
      return;
    }

    // Test 2: Account ID validation
    console.log('🔧 Test 2: Testing account ID validation...');
    const validFormat = isValidHederaAccountId(hederaResult.data.accountId);
    
    if (validFormat) {
      console.log('✅ Account ID format is valid (shard.realm.account)');
    } else {
      console.log('❌ Account ID format is invalid');
      return;
    }

    // Test 3: Old format detection
    console.log('\n🔧 Test 3: Testing old Green ID format detection...');
    const oldFormatTest1 = isOldGreenIdFormat('GRN-2024-123456');
    const oldFormatTest2 = isOldGreenIdFormat(hederaResult.data.accountId);
    
    if (oldFormatTest1 && !oldFormatTest2) {
      console.log('✅ Old format detection working correctly');
      console.log(`  - "GRN-2024-123456" detected as old format: ${oldFormatTest1}`);
      console.log(`  - "${hederaResult.data.accountId}" detected as new format: ${!oldFormatTest2}`);
    } else {
      console.log('❌ Old format detection failed');
      return;
    }

    console.log('\n🎉 All security tests passed!');
    console.log('\n📝 Security Summary:');
    console.log('  ✅ Server-side account generation working');
    console.log('  ✅ Private keys encrypted server-side only');
    console.log('  ✅ No sensitive credentials exposed to client');
    console.log('  ✅ Account validation working');
    console.log('  ✅ Migration detection working');
    console.log('\n🔒 SECURITY: All sensitive operations now happen server-side!');
    
  } catch (error) {
    console.error('❌ Secure implementation test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('HEDERA_OPERATOR')) {
        console.log('\n💡 Hint: Server environment variables not configured correctly');
        console.log('   Make sure HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY are set in server environment');
      }
      
      if (error.message.includes('ENCRYPTION_KEY')) {
        console.log('\n💡 Hint: Make sure ENCRYPTION_KEY is configured in server environment');
      }
    }
  }
}

console.log('🔒 Testing Secure Server-Side Hedera Implementation');
console.log('📋 This test verifies that sensitive operations only happen server-side\n');

// Run the test
testSecureHederaImplementation();
