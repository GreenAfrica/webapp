import {
  Client,
  PrivateKey,
  AccountId,
  ContractExecuteTransaction,
  ContractCallQuery,
  Hbar,
  HbarUnit,
  ContractId,
} from '@hashgraph/sdk';
import { ethers } from 'ethers';
import GreenAfricaABI from '@/abi/GreenAfrica.json';
import { stringToBytes32, bytes32ToString } from '@/lib/utils/blockchain';

// Hedera configuration
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || 'testnet';
const HEDERA_OPERATOR_ID = process.env.HEDERA_OPERATOR_ID;
const HEDERA_OPERATOR_KEY = process.env.HEDERA_OPERATOR_KEY || '0x653a4a5f68e53fcddec258805fad3e36c8bef95dbc3061560683586839e64952';
const CONTRACT_ADDRESS = process.env.HEDERA_CONTRACT_ID || '0x668a877dcc604eb95d448fe2e3a3a30b5f379073';

// Initialize Hedera client
export function createHederaClient(): Client {
  let client: Client;
  
  if (HEDERA_NETWORK === 'mainnet') {
    client = Client.forMainnet();
  } else {
    client = Client.forTestnet();
  }

  // Set operator if credentials are provided
  if (HEDERA_OPERATOR_ID && HEDERA_OPERATOR_KEY) {
    const operatorId = AccountId.fromString(HEDERA_OPERATOR_ID);
    const operatorKey = PrivateKey.fromStringECDSA(HEDERA_OPERATOR_KEY);
    client.setOperator(operatorId, operatorKey);
  }

  return client;
}

// Contract interface for encoding function calls
const contractInterface = new ethers.Interface(GreenAfricaABI);

interface User {
  exists: boolean;
  recyclerId: string;
  referralCode: string;
  referredBy: string;
  hasRecycled: boolean;
  firstDepositAt: bigint;
  points: bigint;
  totalPET: bigint;
}

interface BlockchainUserRegistrationResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  userExists?: boolean;
}

/**
 * Check if a user exists on the blockchain
 */
export async function checkUserExists(greenId: string): Promise<boolean> {
  const client = createHederaClient();
  
  try {
    const recyclerId = stringToBytes32(greenId);
    
    // Encode the function call
    const functionCallBytes = contractInterface.encodeFunctionData('getUser', [recyclerId]);
    
    // Create contract call query
    const contractCallQuery = new ContractCallQuery()
      .setContractId(ContractId.fromEvmAddress(0, 0, CONTRACT_ADDRESS))
      .setFunctionParameters(Buffer.from(functionCallBytes.slice(2), 'hex'))
      .setGas(100000);

    // Execute the query
    const result = await contractCallQuery.execute(client);
    
    // Decode the result
    const decoded = contractInterface.decodeFunctionResult('getUser', result.bytes);
    const user = decoded as unknown as User;
    
    return user.exists;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  } finally {
    client.close();
  }
}

/**
 * Get user details from blockchain
 */
export async function getBlockchainUser(greenId: string): Promise<User | null> {
  const client = createHederaClient();
  
  try {
    const recyclerId = stringToBytes32(greenId);
    
    // Encode the function call
    const functionCallBytes = contractInterface.encodeFunctionData('getUser', [recyclerId]);
    
    // Create contract call query
    const contractCallQuery = new ContractCallQuery()
      .setContractId(ContractId.fromEvmAddress(0, 0, CONTRACT_ADDRESS))
      .setFunctionParameters(Buffer.from(functionCallBytes.slice(2), 'hex'))
      .setGas(100000);

    // Execute the query
    const result = await contractCallQuery.execute(client);
    
    // Decode the result
    const decoded = contractInterface.decodeFunctionResult('getUser', result.bytes);
    const user = decoded as unknown as User;
    
    if (!user.exists) {
      return null;
    }
    
    return {
      exists: user.exists,
      recyclerId: bytes32ToString(user.recyclerId),
      referralCode: bytes32ToString(user.referralCode),
      referredBy: bytes32ToString(user.referredBy),
      hasRecycled: user.hasRecycled,
      firstDepositAt: user.firstDepositAt,
      points: user.points,
      totalPET: user.totalPET,
    };
  } catch (error) {
    console.error('Error getting user from blockchain:', error);
    return null;
  } finally {
    client.close();
  }
}

/**
 * Register an RVM on the blockchain
 */
export async function registerRVMOnBlockchain(
  rvmId: string,
  lat: number,
  lng: number,
  name: string,
  metaURI: string = ''
): Promise<BlockchainUserRegistrationResult> {
  const client = createHederaClient();
  
  try {
    // Convert coordinates to E6 format (multiply by 1,000,000)
    const latE6 = Math.round(lat * 1000000);
    const lngE6 = Math.round(lng * 1000000);
    
    // Convert RVM ID to bytes32
    const rvmIdBytes32 = stringToBytes32(rvmId);

    console.log(`Registering RVM: ${rvmId} at ${lat}, ${lng}`);
    console.log(`E6 format: ${latE6}, ${lngE6}`);

    // Encode the function call
    const functionCallBytes = contractInterface.encodeFunctionData('registerRVM', [
      rvmIdBytes32,
      latE6,
      lngE6,
      name,
      metaURI,
    ]);

    // Create contract execute transaction
    const contractExecuteTransaction = new ContractExecuteTransaction()
      .setContractId(ContractId.fromEvmAddress(0, 0, CONTRACT_ADDRESS))
      .setFunctionParameters(Buffer.from(functionCallBytes.slice(2), 'hex'))
      .setGas(300000)
      .setMaxTransactionFee(new Hbar(2, HbarUnit.Hbar));

    // Execute the transaction
    const txResponse = await contractExecuteTransaction
      .freezeWith(client)
      .execute(client);
    
    // Get the receipt
    const receipt = await txResponse.getReceipt(client);
    
    return {
      success: receipt.status.toString() === 'SUCCESS',
      transactionId: txResponse.transactionId?.toString(),
    };
  } catch (error) {
    console.error('Error registering RVM on blockchain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  } finally {
    client.close();
  }
}

/**
 * Register a user on the blockchain
 */
export async function registerUserOnBlockchain(
  greenId: string,
  referralCode: string,
  referredByCode?: string
): Promise<BlockchainUserRegistrationResult> {
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

    // Convert strings to bytes32
    const recyclerId = stringToBytes32(greenId);
    const referralCodeBytes32 = stringToBytes32(referralCode);
    const referredByCodeBytes32 = referredByCode ? stringToBytes32(referredByCode) : stringToBytes32('');

    // Encode the function call
    const functionCallBytes = contractInterface.encodeFunctionData('registerRecycler', [
      recyclerId,
      referralCodeBytes32,
      referredByCodeBytes32,
    ]);

    // Create contract execute transaction
    const contractExecuteTransaction = new ContractExecuteTransaction()
      .setContractId(ContractId.fromEvmAddress(0, 0, CONTRACT_ADDRESS))
      .setFunctionParameters(Buffer.from(functionCallBytes.slice(2), 'hex'))
      .setGas(300000)
      .setMaxTransactionFee(new Hbar(2, HbarUnit.Hbar));

    // Execute the transaction
    const txResponse = await contractExecuteTransaction
      .freezeWith(client)
      .execute(client);
    
    // Get the receipt
    const receipt = await txResponse.getReceipt(client);
    
    return {
      success: receipt.status.toString() === 'SUCCESS',
      transactionId: txResponse.transactionId?.toString(),
    };
  } catch (error) {
    console.error('Error registering user on blockchain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  } finally {
    client.close();
  }
}
