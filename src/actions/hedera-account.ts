'use server';

import {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountId,
  Hbar,
} from '@hashgraph/sdk';
import * as crypto from 'crypto';

// Server-only environment variables (loaded at runtime)
function getServerEnv() {
  return {
    HEDERA_NETWORK: process.env.HEDERA_NETWORK || 'testnet',
    HEDERA_OPERATOR_ID: process.env.HEDERA_OPERATOR_ID,
    HEDERA_OPERATOR_KEY: process.env.HEDERA_OPERATOR_KEY,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  };
}

const ENCRYPTION_ALGORITHM = 'aes-256-ctr';
const IV_LENGTH = 16;

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
 * Create Hedera client - SERVER SIDE ONLY
 */
function createHederaClient(): Client {
  const env = getServerEnv();
  
  if (!env.HEDERA_OPERATOR_ID || !env.HEDERA_OPERATOR_KEY) {
    throw new Error('Hedera operator credentials not configured on server');
  }

  let client: Client;
  
  if (env.HEDERA_NETWORK === 'mainnet') {
    client = Client.forMainnet();
  } else {
    client = Client.forTestnet();
  }

  try {
    const operatorId = AccountId.fromString(env.HEDERA_OPERATOR_ID);
    const operatorKey = PrivateKey.fromStringECDSA(env.HEDERA_OPERATOR_KEY);
    client.setOperator(operatorId, operatorKey);
    return client;
  } catch (error) {
    throw new Error(`Failed to configure Hedera client: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get encryption key - SERVER SIDE ONLY
 */
function getEncryptionKey(): Buffer {
  const env = getServerEnv();
  
  if (!env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY not configured on server');
  }
  
  return crypto.scryptSync(env.ENCRYPTION_KEY, 'salt', 32);
}

/**
 * Encrypt private key - SERVER SIDE ONLY
 */
function encryptPrivateKey(privateKey: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const combined = Buffer.concat([iv, Buffer.from(encrypted, 'hex')]);
    return combined.toString('base64');
  } catch (error) {
    throw new Error('Failed to encrypt private key');
  }
}

/**
 * Server action to generate a new Hedera account
 * Returns only public information (accountId, evmAddress)
 * Private key is encrypted and stored server-side
 */
export async function generateHederaAccountAction(): Promise<HederaAccountResult> {
  try {
    console.log('Generating Hedera account on server...');
    
    const client = createHederaClient();
    
    try {
      // Generate a new private key for the account
      const newAccountPrivateKey = PrivateKey.generateECDSA();
      const newAccountPublicKey = newAccountPrivateKey.publicKey;

      // Create the account creation transaction
      const createAccountTx = new AccountCreateTransaction()
        .setKey(newAccountPublicKey)
        .setInitialBalance(new Hbar(0)) // No initial funding
        .setMaxTransactionFee(new Hbar(2)); // Max fee for account creation

      // Execute the transaction
      const txResponse = await createAccountTx.execute(client);
      const receipt = await txResponse.getReceipt(client);
      
      if (!receipt.accountId) {
        throw new Error('Failed to create Hedera account - no account ID returned');
      }

      const accountId = receipt.accountId.toString();
      const evmAddress = receipt.accountId.toSolidityAddress();

      console.log(`New Hedera account created: ${accountId}`);

      // Encrypt the private key for storage
      const encryptedPrivateKey = encryptPrivateKey(newAccountPrivateKey.toStringRaw());

      return {
        success: true,
        data: {
          accountId,
          evmAddress: `0x${evmAddress}`,
          encryptedPrivateKey, // Return encrypted private key for database storage
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
