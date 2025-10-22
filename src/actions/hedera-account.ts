'use server';

import {
  PrivateKey,
  AccountCreateTransaction,
  Hbar,
  TokenAssociateTransaction,
  TokenId,
} from '@hashgraph/sdk';
import { encryptPrivateKey } from '@/lib/hedera/key-management';
import { createHederaClient, getServerEnv } from '@/lib/hedera/client';

interface HederaAccountResult {
  success: boolean;
  data?: {
    accountId: string;
    evmAddress: string;
    encryptedPrivateKey: string;
  };
  error?: string;
}

/**
 * Server action to generate a new Hedera account
 * Returns only public information (accountId, evmAddress)
 * Private key is encrypted and stored server-side
 */
export async function generateHederaAccountAction(): Promise<HederaAccountResult> {
  try {
    console.log('Generating Hedera account on server...');

    const env = await getServerEnv();
    const client = await createHederaClient();
    const operatorKey = PrivateKey.fromStringECDSA(env.HEDERA_OPERATOR_KEY!);

    try {
      // Generate a new private key for the account
      const newAccountPrivateKey = PrivateKey.generateECDSA();
      const newAccountPublicKey = newAccountPrivateKey.publicKey;

      // Create the account creation transaction
      const createAccountTx = await new AccountCreateTransaction()
        .setKeyWithoutAlias(newAccountPublicKey)
        .setInitialBalance(new Hbar(0.1)) // give it a little HBAR to start
        .setMaxAutomaticTokenAssociations(-1) // <<< unlimited token associations
        .freezeWith(client)
        .sign(operatorKey);

      // Execute the transaction
      const txResponse = await createAccountTx.execute(client);
      const receipt = await txResponse.getReceipt(client);
      
      const newAccountId = receipt.accountId;

      if (!newAccountId) {
        throw new Error('Failed to create Hedera account - no account ID returned');
      }

      const accountId = newAccountId.toString();
      const evmAddress = `0x${newAccountId.toEvmAddress()}`;

      console.log(`New Hedera account created: ${accountId}, EVM: ${evmAddress}`);

      // Associate the Green Points token with the new account if configured
      const tokenIdValue = env.GREENPOINTS_TOKEN_ID;

      if (tokenIdValue) {
        console.log(`Associating token ${tokenIdValue} with account ${accountId}`);

        const associateTx = await new TokenAssociateTransaction()
          .setAccountId(newAccountId)
          .setTokenIds([TokenId.fromString(tokenIdValue)])
          .freezeWith(client)
          .sign(newAccountPrivateKey);

        const associateResponse = await associateTx.execute(client);
        const associateReceipt = await associateResponse.getReceipt(client);

        if (associateReceipt.status.toString() !== 'SUCCESS') {
          throw new Error(
            `Token association failed with status: ${associateReceipt.status.toString()}`
          );
        }

        console.log(
          `Associated token ${tokenIdValue} with account ${accountId}. TX: ${associateResponse.transactionId.toString()}`
        );
      } else {
        console.warn('GREENPOINTS_TOKEN_ID not configured - skipping token association');
      }

      // Encrypt the private key for storage
      const encryptedPrivateKey = encryptPrivateKey(newAccountPrivateKey.toStringRaw());

      return {
        success: true,
        data: {
          accountId,
          evmAddress,
          encryptedPrivateKey,
        }
      };
    } finally {
      client.close();
    }
  } catch (error) {
    console.error('Error generating Hedera account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate Hedera account'
    };
  }
}

/**
 * Server action to encrypt and store a private key
 * Used internally by user creation functions
 */
export async function encryptPrivateKeyAction(privateKey: string): Promise<string> {
  return encryptPrivateKey(privateKey);
}
