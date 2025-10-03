'use server';

import { mintGreenPoints, burnGreenPoints, getTokenBalance } from '@/lib/ethereum/token-client';
import { mintGreenPointsHedera, burnGreenPointsHedera, getUserAccountId } from '@/lib/hedera/token-service';
import { recordDepositOnBlockchain, redeemPointsOnBlockchain, getUserFromBlockchain } from '@/lib/ethereum/client';
import { getUserAdmin } from '@/lib/firebase/admin-firestore';

export interface GreenPointsResult {
  success: boolean;
  message?: string;
  transactionHash?: string;
  balance?: string;
  error?: string;
}

/**
 * Mint Green Points for a user and record deposit on contract
 */
export async function mintPointsForUser(
  uid: string,
  points: number,
  sessionId?: string
): Promise<GreenPointsResult> {
  try {
    if (!uid || points <= 0) {
      return {
        success: false,
        error: 'Invalid parameters: uid and positive points required',
      };
    }

    // Get user info from Firebase to get their EVM address and Green ID
    const user = await getUserAdmin(uid);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    if (!user.evmAddress) {
      return {
        success: false,
        error: 'User does not have an EVM address',
      };
    }

    // Generate session ID if not provided
    const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get user's Hedera Account ID for token operations
    const userAccountId = await getUserAccountId(uid);
    if (!userAccountId) {
      // Fallback to ethers.js if no Hedera account ID available
      console.warn(`No Hedera Account ID for user ${uid}, falling back to ethers.js minting`);
      
      const mintResult = await mintGreenPoints(user.evmAddress, points);
      if (!mintResult.success) {
        console.warn('Error minting Green Points with ethers.js:', mintResult.error);
        return {
          success: false,
          error: `Failed to mint tokens: ${mintResult.error}`,
        };
      }
      
      // Record deposit on Green Africa contract
      const depositResult = await recordDepositOnBlockchain(
        user.greenId, // recyclerId
        '0x52564d2d494649544e4553532d4f52434849442d303031000000000000000000', // rvmId (provided constant)
        points, // petCount (same as points)
        points, // pointsAwarded
        '', // s3URI (empty string as requested)
        finalSessionId // sessionId
      );

      if (!depositResult.success) {
        console.warn('Token minted but deposit recording failed:', depositResult.error);
        // Don't fail the entire operation since tokens were minted successfully
      }

      return {
        success: true,
        message: `Successfully minted ${points} Green Points (via ethers.js)`,
        transactionHash: mintResult.transactionHash,
      };
    }

    // Use Hedera SDK for minting (preferred method)
    console.log(`Minting ${points} Green Points for user ${userAccountId} using Hedera SDK`);
    const hederaMintResult = await mintGreenPointsHedera(userAccountId, points);
    if (!hederaMintResult.success) {
      console.warn('Error minting Green Points with Hedera SDK:', hederaMintResult.error);
      return {
        success: false,
        error: `Failed to mint tokens with Hedera SDK: ${hederaMintResult.error}`,
      };
    }

    // Record deposit on Green Africa contract
    const depositResult = await recordDepositOnBlockchain(
      user.greenId, // recyclerId
      '0x52564d2d494649544e4553532d4f52434849442d303031000000000000000000', // rvmId (provided constant)
      points, // petCount (same as points)
      points, // pointsAwarded
      '', // s3URI (empty string as requested)
      finalSessionId // sessionId
    );

    if (!depositResult.success) {
      console.warn('Token minted but deposit recording failed:', depositResult.error);
      // Don't fail the entire operation since tokens were minted successfully
    }

    return {
      success: true,
      message: `Successfully minted ${points} Green Points (via Hedera SDK)`,
      transactionHash: hederaMintResult.transactionId,
    };
  } catch (error) {
    console.error('Error minting points for user:', error?.toString());
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mint points for user',
    };
  }
}

/**
 * Burn Green Points for a user and call contract redeem
 */
export async function burnPointsForUser(
  uid: string,
  points: number,
  rewardType: string,
  destination: string,
  redemptionId: string
): Promise<GreenPointsResult> {
  try {
    if (!uid || points <= 0 || !rewardType || !destination || !redemptionId) {
      return {
        success: false,
        error: 'Invalid parameters: all fields are required',
      };
    }

    // Get user info from Firebase to get their EVM address and Green ID
    const user = await getUserAdmin(uid);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    if (!user.evmAddress) {
      return {
        success: false,
        error: 'User does not have an EVM address',
      };
    }

    // Check if user has sufficient token balance
    const balanceResult = await getTokenBalance(user.evmAddress);
    if (!balanceResult.success) {
      return {
        success: false,
        error: `Failed to check balance: ${balanceResult.error}`,
      };
    }

    const currentBalance = parseFloat(balanceResult.balance || '0');
    if (currentBalance < points) {
      return {
        success: false,
        error: `Insufficient balance. Current: ${currentBalance}, Required: ${points}`,
      };
    }

    // Get user's Hedera Account ID for token operations
    const userAccountId = await getUserAccountId(uid);
    let burnTransactionHash: string | undefined;

    if (!userAccountId) {
      // Fallback to ethers.js if no Hedera account ID available
      console.warn(`No Hedera Account ID for user ${uid}, falling back to ethers.js burning`);
      
      const burnResult = await burnGreenPoints(user.evmAddress, points);
      if (!burnResult.success) {
        return {
          success: false,
          error: `Failed to burn tokens with ethers.js: ${burnResult.error}`,
        };
      }
      burnTransactionHash = burnResult.transactionHash;
    } else {
      // Use Hedera SDK for burning (preferred method)
      console.log(`Burning ${points} Green Points for user ${userAccountId} using Hedera SDK`);
      const hederaBurnResult = await burnGreenPointsHedera(userAccountId, points);
      if (!hederaBurnResult.success) {
        console.warn('Error burning Green Points with Hedera SDK:', hederaBurnResult.error);
        return {
          success: false,
          error: `Failed to burn tokens with Hedera SDK: ${hederaBurnResult.error}`,
        };
      }
      burnTransactionHash = hederaBurnResult.transactionId;
    }

    // Call contract redeem points
    const redeemResult = await redeemPointsOnBlockchain(
      user.greenId, // recyclerId
      points,
      rewardType,
      destination,
      redemptionId
    );

    if (!redeemResult.success) {
      console.warn('Tokens burned but contract redeem failed:', redeemResult.error);
      // Don't fail the entire operation since tokens were burned successfully
    }

    const method = userAccountId ? 'Hedera SDK' : 'ethers.js';
    return {
      success: true,
      message: `Successfully burned ${points} Green Points for redemption (via ${method})`,
      transactionHash: burnTransactionHash,
    };
  } catch (error) {
    console.error('Error burning points for user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to burn points for user',
    };
  }
}

/**
 * Get user's Green Points balance from blockchain
 */
export async function getUserPointsFromBlockchain(uid: string): Promise<GreenPointsResult> {
  try {
    if (!uid) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    // Get user info from Firebase to get their EVM address
    const user = await getUserAdmin(uid);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    if (!user.evmAddress) {
      return {
        success: false,
        error: 'User does not have an EVM address',
      };
    }

    // Get token balance
    const balanceResult = await getTokenBalance(user.evmAddress);
    if (!balanceResult.success) {
      return {
        success: false,
        error: `Failed to get balance: ${balanceResult.error}`,
      };
    }

    return {
      success: true,
      balance: balanceResult.balance,
      message: `Current balance: ${balanceResult.balance} Green Points`,
    };
  } catch (error) {
    console.error('Error getting user points from blockchain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user points from blockchain',
    };
  }
}

/**
 * Get user's Green Points balance by EVM address
 */
export async function getPointsBalanceByAddress(evmAddress: string): Promise<GreenPointsResult> {
  try {
    if (!evmAddress) {
      return {
        success: false,
        error: 'EVM address is required',
      };
    }

    // Get token balance
    const balanceResult = await getTokenBalance(evmAddress);
    if (!balanceResult.success) {
      return {
        success: false,
        error: `Failed to get balance: ${balanceResult.error}`,
      };
    }

    return {
      success: true,
      balance: balanceResult.balance,
      message: `Current balance: ${balanceResult.balance} Green Points`,
    };
  } catch (error) {
    console.error('Error getting points balance by address:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get points balance by address',
    };
  }
}

/**
 * Get user points both from contract and token balance (for comparison/debugging)
 */
export async function getUserPointsComparison(uid: string): Promise<{
  tokenBalance: GreenPointsResult;
  contractPoints: { success: boolean; points?: number; error?: string; };
}> {
  try {
    const user = await getUserAdmin(uid);
    if (!user) {
      return {
        tokenBalance: { success: false, error: 'User not found' },
        contractPoints: { success: false, error: 'User not found' },
      };
    }

    // Get token balance
    const tokenBalance = await getUserPointsFromBlockchain(uid);

    // Get points from contract
    let contractPoints: { success: boolean; points?: number; error?: string; } = { success: false };
    
    try {
      const blockchainUser = await getUserFromBlockchain(user.greenId);
      if (blockchainUser) {
        contractPoints = {
          success: true,
          points: Number(blockchainUser.points),
        };
      } else {
        contractPoints = {
          success: false,
          error: 'User not found on blockchain contract',
        };
      }
    } catch (error) {
      contractPoints = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get contract points',
      };
    }

    return {
      tokenBalance,
      contractPoints,
    };
  } catch (error) {
    return {
      tokenBalance: { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      contractPoints: { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
    };
  }
}
