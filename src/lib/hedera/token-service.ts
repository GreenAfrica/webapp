'use server';

import {
  PrivateKey,
  AccountId,
  TokenMintTransaction,
  TransferTransaction,
  TokenWipeTransaction,
  TokenId,
} from '@hashgraph/sdk';
import { createHederaClient, getServerEnv } from './client';

interface HederaTokenResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * Mint Green Points tokens using Hedera SDK and transfer to user
 */
export async function mintGreenPointsHedera(
  userAccountId: string,
  amount: number
): Promise<HederaTokenResult> {
  const client = await createHederaClient();
  
  try {
    const env = await getServerEnv();
    
    if (!env.GREENPOINTS_TOKEN_ID) {
      console.warn('GREENPOINTS_TOKEN_ID not configured - skipping token minting');
      return {
        success: true,
      };
    }

    if (!userAccountId || amount <= 0) {
      return {
        success: false,
        error: 'Invalid parameters: userAccountId and positive amount required',
      };
    }

    const tokenId = TokenId.fromString(env.GREENPOINTS_TOKEN_ID);
    const operatorId = AccountId.fromString(env.HEDERA_OPERATOR_ID!);
    const operatorKey = PrivateKey.fromStringECDSA(env.HEDERA_OPERATOR_KEY!);
    
    // 1) Mint to treasury (operator account)
    const mintAmount = BigInt(amount) * BigInt(1_000_000); // 6 decimals as per example
    console.log(`Minting ${amount} GREEN tokens (${mintAmount.toString()} units) to treasury`);

    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setAmount(Number(mintAmount))
      .freezeWith(client)
      .sign(operatorKey);

    const mintResponse = await mintTx.execute(client);
    const mintReceipt = await mintResponse.getReceipt(client);

    if (mintReceipt.status.toString() !== 'SUCCESS') {
      throw new Error(`Mint transaction failed with status: ${mintReceipt.status.toString()}`);
    }

    console.log(`Minted tokens to treasury. TX: ${mintResponse.transactionId.toString()}`);

    // 2) Transfer to user (Green Africa user wallets have unlimited auto-association)
    const userAccount = AccountId.fromString(userAccountId);
    
    console.log(`Transferring ${amount} GREEN tokens to user ${userAccountId}`);

    const transferTx = await new TransferTransaction()
      .addTokenTransfer(tokenId, operatorId, -Number(mintAmount))
      .addTokenTransfer(tokenId, userAccount, Number(mintAmount))
      .execute(client);

    const transferReceipt = await transferTx.getReceipt(client);

    if (transferReceipt.status.toString() !== 'SUCCESS') {
      throw new Error(`Transfer transaction failed with status: ${transferReceipt.status.toString()}`);
    }

    console.log(`Transferred ${amount} GREEN tokens to ${userAccountId}. TX: ${transferTx.transactionId.toString()}`);

    return {
      success: true,
      transactionId: transferTx.transactionId.toString(),
    };

  } catch (error) {
    console.error('Error minting Green Points with Hedera SDK:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mint Green Points with Hedera SDK',
    };
  } finally {
    client.close();
  }
}

/**
 * Burn Green Points tokens from user's wallet using Hedera SDK (admin wipe)
 */
export async function burnGreenPointsHedera(
  userAccountId: string,
  amount: number
): Promise<HederaTokenResult> {
  const client = await createHederaClient();
  
  try {
    const env = await getServerEnv();
    
    if (!env.GREENPOINTS_TOKEN_ID) {
      console.warn('GREENPOINTS_TOKEN_ID not configured - skipping token burning');
      return {
        success: true,
      };
    }

    if (!userAccountId || amount <= 0) {
      return {
        success: false,
        error: 'Invalid parameters: userAccountId and positive amount required',
      };
    }

    const tokenId = TokenId.fromString(env.GREENPOINTS_TOKEN_ID);
    const userAccount = AccountId.fromString(userAccountId);
    const operatorKey = PrivateKey.fromStringECDSA(env.HEDERA_OPERATOR_KEY!);
    
    // Use separate keys in production; reusing operator for demo simplicity  
    const wipeKey = operatorKey;

    // Burn tokens from user's wallet (admin wipe; also reduces total supply)
    const wipeAmount = BigInt(amount) * BigInt(1_000_000); // 6 decimals as per example
    console.log(`Burning ${amount} GREEN tokens (${wipeAmount.toString()} units) from user ${userAccountId}`);

    const wipeTx = await new TokenWipeTransaction()
      .setTokenId(tokenId)
      .setAccountId(userAccount)
      .setAmount(Number(wipeAmount))
      .freezeWith(client)
      .sign(wipeKey);

    const wipeResponse = await wipeTx.execute(client);
    const wipeReceipt = await wipeResponse.getReceipt(client);

    if (wipeReceipt.status.toString() !== 'SUCCESS') {
      throw new Error(`Wipe transaction failed with status: ${wipeReceipt.status.toString()}`);
    }

    console.log(`Burned ${amount} GREEN tokens from ${userAccountId}. TX: ${wipeResponse.transactionId.toString()}`);

    return {
      success: true,
      transactionId: wipeResponse.transactionId.toString(),
    };

  } catch (error) {
    console.error('Error burning Green Points with Hedera SDK:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to burn Green Points with Hedera SDK',
    };
  } finally {
    client.close();
  }
}

/**
 * Utility function to get user's Hedera Account ID from their UID
 * This uses the Firebase Admin SDK to get user data
 */
export async function getUserAccountId(uid: string): Promise<string | null> {
  try {
    const { getUserAdmin } = await import('@/lib/firebase/admin-firestore');
    const user = await getUserAdmin(uid);
    
    if (!user) {
      console.error(`User not found: ${uid}`);
      return null;
    }

    // Check if user has accountId stored (new field we'll add)
    if (user.greenId) {
      console.log(`Found accountId for user ${uid}: ${user.greenId}`);
      return user.greenId;
    }

    // Fallback: try to derive from evmAddress if available
    if (user.evmAddress) {
      // Convert EVM address back to Account ID
      // This is a simplified conversion - in production you'd want proper mapping
      console.warn(`No accountId stored for user ${uid}, using evmAddress: ${user.evmAddress}`);
      return null; // Return null to force proper account ID storage
    }

    console.error(`No Hedera account information found for user: ${uid}`);
    return null;
  } catch (error) {
    console.error('Error getting user account ID:', error);
    return null;
  }
}
