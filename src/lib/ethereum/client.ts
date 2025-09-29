'use server';

import { ethers } from 'ethers';
import GreenAfricaABI from '@/abi/GreenAfrica.json';

// Server-only environment variables
function getServerEnv() {
  return {
    HEDERA_RPC_URL: process.env.HEDERA_RPC_URL || 'https://testnet.hashio.io/api',
    HEDERA_OPERATOR_KEY: process.env.HEDERA_OPERATOR_KEY,
    GREEN_AFRICA_CONTRACT_ADDRESS: process.env.GREEN_AFRICA_CONTRACT_ADDRESS,
  };
}

interface BlockchainResult {
  success: boolean;
  transactionHash?: string;
  userExists?: boolean;
  error?: string;
}

/**
 * Create Ethers.js provider and signer for Hedera testnet
 */
function createEthersProvider() {
  const env = getServerEnv();
  
  if (!env.HEDERA_OPERATOR_KEY) {
    throw new Error('Hedera operator key not configured');
  }

  try {
    // Create provider for Hedera testnet
    const provider = new ethers.JsonRpcProvider(env.HEDERA_RPC_URL);
    
    // Create signer from operator private key
    const signer = new ethers.Wallet(env.HEDERA_OPERATOR_KEY, provider);
    
    return { provider, signer };
  } catch (error) {
    throw new Error(`Failed to create Ethers provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create contract instance
 */
function createContractInstance(signer: ethers.Wallet) {
  const env = getServerEnv();
  
  if (!env.GREEN_AFRICA_CONTRACT_ADDRESS) {
    throw new Error('GREEN_AFRICA_CONTRACT_ADDRESS not configured');
  }

  try {
    return new ethers.Contract(
      env.GREEN_AFRICA_CONTRACT_ADDRESS,
      GreenAfricaABI,
      signer
    );
  } catch (error) {
    throw new Error(`Failed to create contract instance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert string to bytes32 format for contract calls
 */
function stringToBytes32(str: string): string {
  return ethers.id(str);
}

/**
 * Register a user on the blockchain using Ethers.js
 */
export async function registerUserOnBlockchain(
  greenId: string,
  referralCode: string,
  referredByCode?: string
): Promise<BlockchainResult> {
  try {
    const env = getServerEnv();
    
    if (!env.GREEN_AFRICA_CONTRACT_ADDRESS) {
      console.warn('GREEN_AFRICA_CONTRACT_ADDRESS not configured - skipping blockchain registration');
      return {
        success: true,
        userExists: false,
      };
    }

    const { signer } = createEthersProvider();
    const contract = createContractInstance(signer);

    try {
      // First check if user already exists
      const userExists = await checkUserExists(greenId);
      if (userExists) {
        return {
          success: true,
          userExists: true,
        };
      }

      // Convert strings to bytes32 format
      const recyclerIdBytes32 = stringToBytes32(greenId);
      const referralCodeBytes32 = stringToBytes32(referralCode);
      const referredByCodeBytes32 = referredByCode ? stringToBytes32(referredByCode) : stringToBytes32('');

      // Call the registerRecycler function
      const tx = await contract.registerRecycler(
        recyclerIdBytes32,
        referralCodeBytes32,
        referredByCodeBytes32,
        {
          gasLimit: 300000, // Set appropriate gas limit
        }
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log(`User ${greenId} registered on blockchain. TX: ${receipt.hash}`);
        
        return {
          success: true,
          transactionHash: receipt.hash,
          userExists: false,
        };
      } else {
        throw new Error(`Transaction failed with status: ${receipt.status}`);
      }
    } catch (error) {
      // Handle specific contract errors
      if (error instanceof Error && error.message.includes('revert')) {
        console.error('Contract reverted:', error.message);
        return {
          success: false,
          error: `Contract execution failed: ${error.message}`,
        };
      }
      throw error;
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
 * Check if a user exists on the blockchain using Ethers.js
 */
export async function checkUserExists(greenId: string): Promise<boolean> {
  try {
    const env = getServerEnv();
    
    if (!env.GREEN_AFRICA_CONTRACT_ADDRESS) {
      console.warn('GREEN_AFRICA_CONTRACT_ADDRESS not configured - returning false for user existence check');
      return false;
    }

    const { signer } = createEthersProvider();
    const contract = createContractInstance(signer);

    try {
      // Convert string to bytes32 format
      const recyclerIdBytes32 = stringToBytes32(greenId);

      // Call the getUser function to check if user exists
      const userInfo = await contract.getUser(recyclerIdBytes32);
      
      // The first element of the returned array is the 'exists' boolean
      return userInfo[0];
    } catch (error) {
      console.error('Error in contract call:', error);
      return false;
    }
  } catch (error) {
    console.error('Error checking user existence on blockchain:', error);
    return false;
  }
}

/**
 * Register an RVM on the blockchain using Ethers.js
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
    
    if (!env.GREEN_AFRICA_CONTRACT_ADDRESS) {
      console.warn('GREEN_AFRICA_CONTRACT_ADDRESS not configured - skipping RVM blockchain registration');
      return {
        success: true,
      };
    }

    const { signer } = createEthersProvider();
    const contract = createContractInstance(signer);

    try {
      // Convert parameters to the format expected by the contract
      const rvmIdBytes32 = stringToBytes32(rvmId);
      const latE6 = Math.round(lat * 1000000); // Convert to integer with 6 decimal precision
      const lngE6 = Math.round(lng * 1000000); // Convert to integer with 6 decimal precision

      // Call the registerRVM function
      const tx = await contract.registerRVM(
        rvmIdBytes32,
        latE6,
        lngE6,
        name,
        metaURI,
        {
          gasLimit: 300000, // Set appropriate gas limit
        }
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log(`RVM ${rvmId} registered on blockchain. TX: ${receipt.hash}`);
        
        return {
          success: true,
          transactionHash: receipt.hash,
        };
      } else {
        throw new Error(`Transaction failed with status: ${receipt.status}`);
      }
    } catch (error) {
      // Handle specific contract errors
      if (error instanceof Error && error.message.includes('revert')) {
        console.error('Contract reverted:', error.message);
        return {
          success: false,
          error: `Contract execution failed: ${error.message}`,
        };
      }
      throw error;
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
 * Record a deposit on the blockchain using Ethers.js
 */
export async function recordDepositOnBlockchain(
  recyclerId: string,
  rvmId: string,
  petCount: number,
  pointsAwarded: number,
  s3URI: string,
  sessionId: string
): Promise<BlockchainResult> {
  try {
    const env = getServerEnv();
    
    if (!env.GREEN_AFRICA_CONTRACT_ADDRESS) {
      console.warn('GREEN_AFRICA_CONTRACT_ADDRESS not configured - skipping deposit recording');
      return {
        success: true,
      };
    }

    const { signer } = createEthersProvider();
    const contract = createContractInstance(signer);

    try {
      // Convert parameters to the format expected by the contract
      const recyclerIdBytes32 = stringToBytes32(recyclerId);
      const rvmIdBytes32 = stringToBytes32(rvmId);
      const sessionIdBytes32 = stringToBytes32(sessionId);

      // Call the recordDeposit function
      const tx = await contract.recordDeposit(
        recyclerIdBytes32,
        rvmIdBytes32,
        petCount,
        pointsAwarded,
        s3URI,
        sessionIdBytes32,
        {
          gasLimit: 400000, // Set appropriate gas limit
        }
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log(`Deposit recorded on blockchain. TX: ${receipt.hash}`);
        
        return {
          success: true,
          transactionHash: receipt.hash,
        };
      } else {
        throw new Error(`Transaction failed with status: ${receipt.status}`);
      }
    } catch (error) {
      // Handle specific contract errors
      if (error instanceof Error && error.message.includes('revert')) {
        console.error('Contract reverted:', error.message);
        return {
          success: false,
          error: `Contract execution failed: ${error.message}`,
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error recording deposit on blockchain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record deposit on blockchain',
    };
  }
}

/**
 * Get user information from the blockchain using Ethers.js
 */
export async function getUserFromBlockchain(greenId: string) {
  try {
    const env = getServerEnv();
    
    if (!env.GREEN_AFRICA_CONTRACT_ADDRESS) {
      return null;
    }

    const { signer } = createEthersProvider();
    const contract = createContractInstance(signer);

    const recyclerIdBytes32 = stringToBytes32(greenId);
    const userInfo = await contract.getUser(recyclerIdBytes32);

    if (!userInfo[0]) { // exists = false
      return null;
    }

    return {
      exists: userInfo[0],
      recyclerId: userInfo[1],
      referralCode: userInfo[2],
      referredBy: userInfo[3],
      hasRecycled: userInfo[4],
      firstDepositAt: userInfo[5],
      points: userInfo[6],
      totalPET: userInfo[7],
    };
  } catch (error) {
    console.error('Error getting user from blockchain:', error);
    return null;
  }
}

/**
 * Utility function to validate contract configuration
 */
export async function isBlockchainConfigured(): Promise<boolean> {
  const env = getServerEnv();
  return !!(
    env.HEDERA_OPERATOR_KEY &&
    env.GREEN_AFRICA_CONTRACT_ADDRESS &&
    env.HEDERA_RPC_URL
  );
}
