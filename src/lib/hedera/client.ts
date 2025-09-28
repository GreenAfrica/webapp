'use server';

import {
  Client,
  PrivateKey,
  AccountId,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  ContractId,
} from '@hashgraph/sdk';

// Server-only environment variables
function getServerEnv() {
  return {
    HEDERA_NETWORK: process.env.HEDERA_NETWORK || 'testnet',
    HEDERA_OPERATOR_ID: process.env.HEDERA_OPERATOR_ID,
    HEDERA_OPERATOR_KEY: process.env.HEDERA_OPERATOR_KEY,
    GREEN_AFRICA_CONTRACT_ID: process.env.GREEN_AFRICA_CONTRACT_ID,
  };
}

interface BlockchainResult {
  success: boolean;
  transactionId?: string;
  userExists?: boolean;
  error?: string;
}

/**
 * Create Hedera client for blockchain operations
 */
function createHederaClient(): Client {
  const env = getServerEnv();
  
  if (!env.HEDERA_OPERATOR_ID || !env.HEDERA_OPERATOR_KEY) {
    throw new Error('Hedera operator credentials not configured');
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
 * Register a user on the Hedera blockchain
 */
export async function registerUserOnBlockchain(
  greenId: string,
  referralCode: string,
  referredByCode?: string
): Promise<BlockchainResult> {
  try {
    const env = getServerEnv();
    
    if (!env.GREEN_AFRICA_CONTRACT_ID) {
      console.warn('GREEN_AFRICA_CONTRACT_ID not configured - skipping blockchain registration');
      return {
        success: true,
        userExists: false,
      };
    }

    const client = createHederaClient();
    
    try {
      // First check if user already exists
      const userExists = await checkUserExists(greenId);
      if (userExists) {
        return {
          success: true,
          userExists: true,
        };
      }

      const contractId = ContractId.fromString(env.GREEN_AFRICA_CONTRACT_ID);

      // Encode function call parameters
      const functionParameters = new ContractFunctionParameters()
        .addString(greenId)
        .addString(referralCode)
        .addString(referredByCode || '');

      // Create contract execution transaction
      const contractExecTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(300000) // Adjust gas limit as needed
        .setFunction('registerUser', functionParameters)
        .setMaxTransactionFee(new Hbar(2));

      // Execute the transaction
      const txResponse = await contractExecTx.execute(client);
      const receipt = await txResponse.getReceipt(client);

      if (receipt.status.toString() === 'SUCCESS') {
        const transactionId = txResponse.transactionId.toString();
        console.log(`User ${greenId} registered on blockchain. TX: ${transactionId}`);
        
        return {
          success: true,
          transactionId,
          userExists: false,
        };
      } else {
        throw new Error(`Transaction failed with status: ${receipt.status.toString()}`);
      }
    } finally {
      client.close();
    }
  } catch (error) {
    console.error('Error registering user on blockchain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to register user on blockchain',
    };
  }
}

/**
 * Check if a user exists on the Hedera blockchain
 */
export async function checkUserExists(greenId: string): Promise<boolean> {
  try {
    const env = getServerEnv();
    
    if (!env.GREEN_AFRICA_CONTRACT_ID) {
      console.warn('GREEN_AFRICA_CONTRACT_ID not configured - returning false for user existence check');
      return false;
    }

    const client = createHederaClient();
    
    try {
      const contractId = ContractId.fromString(env.GREEN_AFRICA_CONTRACT_ID);

      // Query the contract to check if user exists
      const queryParameters = new ContractFunctionParameters()
        .addString(greenId);

      const contractQuery = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction('userExists', queryParameters);

      const result = await contractQuery.execute(client);
      
      // Parse the result - this depends on the contract's return format
      // For simplicity, we'll assume it returns a boolean
      const exists = result.getBool(0);
      
      return exists;
    } finally {
      client.close();
    }
  } catch (error) {
    console.error('Error checking user existence on blockchain:', error);
    // Return false on error to be safe
    return false;
  }
}

/**
 * Register an RVM (Reverse Vending Machine) on the Hedera blockchain
 */
export async function registerRVMOnBlockchain(
  rvmId: string,
  lat: number,
  lng: number,
  name: string,
  metaURI: string
): Promise<BlockchainResult> {
  try {
    const env = getServerEnv();
    
    if (!env.GREEN_AFRICA_CONTRACT_ID) {
      console.warn('GREEN_AFRICA_CONTRACT_ID not configured - skipping RVM blockchain registration');
      return {
        success: true,
      };
    }

    const client = createHederaClient();
    
    try {
      const contractId = ContractId.fromString(env.GREEN_AFRICA_CONTRACT_ID);

      // Encode function call parameters for RVM registration
      const functionParameters = new ContractFunctionParameters()
        .addString(rvmId)
        .addInt64(Math.round(lat * 1000000)) // Convert to integer with 6 decimal precision
        .addInt64(Math.round(lng * 1000000)) // Convert to integer with 6 decimal precision
        .addString(name)
        .addString(metaURI);

      // Create contract execution transaction
      const contractExecTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(300000)
        .setFunction('registerRVM', functionParameters)
        .setMaxTransactionFee(new Hbar(2));

      // Execute the transaction
      const txResponse = await contractExecTx.execute(client);
      const receipt = await txResponse.getReceipt(client);

      if (receipt.status.toString() === 'SUCCESS') {
        const transactionId = txResponse.transactionId.toString();
        console.log(`RVM ${rvmId} registered on blockchain. TX: ${transactionId}`);
        
        return {
          success: true,
          transactionId,
        };
      } else {
        throw new Error(`Transaction failed with status: ${receipt.status.toString()}`);
      }
    } finally {
      client.close();
    }
  } catch (error) {
    console.error('Error registering RVM on blockchain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to register RVM on blockchain',
    };
  }
}

/**
 * Utility function to validate contract configuration
 */
export async function isBlockchainConfigured(): Promise<boolean> {
  const env = getServerEnv();
  return !!(
    env.HEDERA_OPERATOR_ID &&
    env.HEDERA_OPERATOR_KEY &&
    env.GREEN_AFRICA_CONTRACT_ID
  );
}
