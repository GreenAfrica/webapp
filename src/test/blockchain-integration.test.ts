/**
 * Integration test for blockchain-based point management
 * This file tests the complete flow from earning to redeeming Green Points tokens
 */

import { mintPointsForUser, burnPointsForUser, getUserPointsFromBlockchain } from '@/actions/greenpoints';
import { addPointsToUser, getUser, createRedemptionRequest } from '@/lib/firebase/firestore';

// Mock user data for testing
const mockUser = {
  uid: 'test_user_123',
  email: 'test@example.com',
  displayName: 'Test User',
  greenId: '0.0.123456',
  evmAddress: '0x1234567890123456789012345678901234567890',
  referralCode: 'TEST2024123',
  totalPoints: 0,
  referralPoints: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Test the complete point earning flow
 */
export async function testPointEarning() {
  console.log('🧪 Testing Point Earning Flow...');
  
  try {
    // Test adding points to user (should mint tokens)
    await addPointsToUser(mockUser.uid, 100, 'Test recycling activity');
    
    console.log('✅ Points added successfully');
    
    // Verify user balance from blockchain
    const balanceResult = await getUserPointsFromBlockchain(mockUser.uid);
    
    if (balanceResult.success) {
      console.log(`✅ User balance: ${balanceResult.balance} Green Points`);
    } else {
      console.error('❌ Failed to get user balance:', balanceResult.error);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Point earning test failed:', error);
    return false;
  }
}

/**
 * Test the complete point redemption flow
 */
export async function testPointRedemption() {
  console.log('🧪 Testing Point Redemption Flow...');
  
  try {
    // Create a redemption request (should burn tokens and call contract)
    const redemptionId = await createRedemptionRequest({
      userId: mockUser.uid,
      type: 'airtime',
      amount: '50',
      points: 50,
      phone: '+1234567890',
      status: 'pending',
    });
    
    console.log(`✅ Redemption created with ID: ${redemptionId}`);
    
    // Verify user balance after redemption
    const balanceResult = await getUserPointsFromBlockchain(mockUser.uid);
    
    if (balanceResult.success) {
      console.log(`✅ User balance after redemption: ${balanceResult.balance} Green Points`);
    } else {
      console.error('❌ Failed to get user balance after redemption:', balanceResult.error);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Point redemption test failed:', error);
    return false;
  }
}

/**
 * Test reading points from blockchain vs Firebase
 */
export async function testPointReading() {
  console.log('🧪 Testing Point Reading from Blockchain...');
  
  try {
    // Get user data (should fetch points from blockchain)
    const userData = await getUser(mockUser.uid);
    
    if (userData) {
      console.log(`✅ User totalPoints from getUser(): ${userData.totalPoints}`);
    } else {
      console.error('❌ User not found');
      return false;
    }
    
    // Get points directly from blockchain
    const blockchainBalance = await getUserPointsFromBlockchain(mockUser.uid);
    
    if (blockchainBalance.success) {
      console.log(`✅ Direct blockchain balance: ${blockchainBalance.balance}`);
    } else {
      console.error('❌ Failed to get blockchain balance:', blockchainBalance.error);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Point reading test failed:', error);
    return false;
  }
}

/**
 * Test session ID generation and storage
 */
export async function testSessionIdStorage() {
  console.log('🧪 Testing Session ID Generation and Storage...');
  
  try {
    // Test minting with custom session ID
    const customSessionId = 'custom_session_12345';
    const mintResult = await mintPointsForUser(mockUser.uid, 25, customSessionId);
    
    if (mintResult.success) {
      console.log('✅ Custom session ID minting successful');
      console.log(`Transaction hash: ${mintResult.transactionHash}`);
    } else {
      console.error('❌ Custom session ID minting failed:', mintResult.error);
      return false;
    }
    
    // Test minting without session ID (should generate one)
    const autoMintResult = await mintPointsForUser(mockUser.uid, 25);
    
    if (autoMintResult.success) {
      console.log('✅ Auto session ID minting successful');
      console.log(`Transaction hash: ${autoMintResult.transactionHash}`);
    } else {
      console.error('❌ Auto session ID minting failed:', autoMintResult.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Session ID test failed:', error);
    return false;
  }
}

/**
 * Run all integration tests
 */
export async function runAllTests() {
  console.log('🚀 Starting Blockchain Integration Tests...\n');
  
  const results = {
    pointEarning: false,
    pointReading: false,
    sessionIdStorage: false,
    pointRedemption: false,
  };
  
  // Run tests in sequence
  results.pointEarning = await testPointEarning();
  console.log('---\n');
  
  results.pointReading = await testPointReading();
  console.log('---\n');
  
  results.sessionIdStorage = await testSessionIdStorage();
  console.log('---\n');
  
  results.pointRedemption = await testPointRedemption();
  console.log('---\n');
  
  // Summary
  console.log('📊 Test Results Summary:');
  console.log(`Point Earning: ${results.pointEarning ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Point Reading: ${results.pointReading ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Session ID Storage: ${results.sessionIdStorage ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Point Redemption: ${results.pointRedemption ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return results;
}

/**
 * Utility function to validate blockchain configuration
 */
export async function validateConfiguration() {
  console.log('🔧 Validating Blockchain Configuration...');
  
  const requiredEnvVars = [
    'HEDERA_OPERATOR_KEY',
    'HEDERA_RPC_URL',
    'GREEN_AFRICA_CONTRACT_ADDRESS',
    'GREENPOINTS_EVM',
  ];
  
  const missingVars = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    return false;
  }
  
  console.log('✅ All required environment variables are configured');
  return true;
}

// Export for use in other test files or scripts
export default {
  runAllTests,
  testPointEarning,
  testPointReading,
  testSessionIdStorage,
  testPointRedemption,
  validateConfiguration,
};
