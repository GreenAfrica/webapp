'use server';

import { ethers } from 'ethers';

// Server-only environment variables
function getServerEnv() {
  return {
    HEDERA_RPC_URL: process.env.HEDERA_RPC_URL || 'https://testnet.hashio.io/api',
    HEDERA_OPERATOR_KEY: process.env.HEDERA_OPERATOR_KEY,
    GREENPOINTS_EVM: process.env.GREENPOINTS_EVM, // 0x0000000000000000000000000000000000699376
  };
}

interface TokenResult {
  success: boolean;
  transactionHash?: string;
  balance?: string;
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
 * Standard ERC-20 ABI for token operations
 */
const ERC20_ABI = [
  // Read functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  
  // Write functions
  "function mint(address to, uint256 amount) returns (bool)",
  "function burn(address from, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Mint(address indexed to, uint256 value)",
  "event Burn(address indexed from, uint256 value)"
];

/**
 * Create Green Points token contract instance
 */
function createTokenContract(signer: ethers.Wallet) {
  const env = getServerEnv();
  
  if (!env.GREENPOINTS_EVM) {
    throw new Error('GREENPOINTS_EVM address not configured');
  }

  try {
    return new ethers.Contract(
      env.GREENPOINTS_EVM,
      ERC20_ABI,
      signer
    );
  } catch (error) {
    throw new Error(`Failed to create token contract instance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Mint Green Points tokens for a user
 */
export async function mintGreenPoints(
  userAddress: string,
  amount: number
): Promise<TokenResult> {
  try {
    const env = getServerEnv();
    
    if (!env.GREENPOINTS_EVM) {
      console.warn('GREENPOINTS_EVM not configured - skipping token minting');
      return {
        success: true,
      };
    }

    if (!userAddress || amount <= 0) {
      return {
        success: false,
        error: 'Invalid parameters: userAddress and positive amount required',
      };
    }

    const { signer } = createEthersProvider();
    const tokenContract = createTokenContract(signer);

    try {
      // Convert amount to proper decimal format (assuming 18 decimals for now)
      const decimals = await tokenContract.decimals();
      const tokenAmount = ethers.parseUnits(amount.toString(), decimals);
      console.log(`Minting ${amount} tokens (${tokenAmount.toString()} in contract units) to ${userAddress}`);

      // Call the mint function
      const tx = await tokenContract.mint(userAddress, tokenAmount, {
        gasLimit: 200000,
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait(2);

      if (receipt.status === 1) {
        console.log(`Minted ${amount} Green Points for ${userAddress}. TX: ${receipt.hash}`);
        
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
        console.error('Token mint reverted:', error.message);
        return {
          success: false,
          error: `Token minting failed: ${error.message}`,
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error minting Green Points:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mint Green Points',
    };
  }
}

/**
 * Burn Green Points tokens from a user
 */
export async function burnGreenPoints(
  userAddress: string,
  amount: number
): Promise<TokenResult> {
  try {
    const env = getServerEnv();
    
    if (!env.GREENPOINTS_EVM) {
      console.warn('GREENPOINTS_EVM not configured - skipping token burning');
      return {
        success: true,
      };
    }

    if (!userAddress || amount <= 0) {
      return {
        success: false,
        error: 'Invalid parameters: userAddress and positive amount required',
      };
    }

    const { signer } = createEthersProvider();
    const tokenContract = createTokenContract(signer);

    try {
      // Convert amount to proper decimal format
      const decimals = await tokenContract.decimals();
      const tokenAmount = ethers.parseUnits(amount.toString(), decimals);

      // Call the burn function
      const tx = await tokenContract.burn(userAddress, tokenAmount, {
        gasLimit: 200000,
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log(`Burned ${amount} Green Points from ${userAddress}. TX: ${receipt.hash}`);
        
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
        console.error('Token burn reverted:', error.message);
        return {
          success: false,
          error: `Token burning failed: ${error.message}`,
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error burning Green Points:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to burn Green Points',
    };
  }
}

/**
 * Get Green Points token balance for a user
 */
export async function getTokenBalance(userAddress: string): Promise<TokenResult> {
  try {
    const env = getServerEnv();
    
    if (!env.GREENPOINTS_EVM) {
      console.warn('GREENPOINTS_EVM not configured - returning zero balance');
      return {
        success: true,
        balance: '0',
      };
    }

    if (!userAddress) {
      return {
        success: false,
        error: 'userAddress is required',
      };
    }

    const { signer } = createEthersProvider();
    const tokenContract = createTokenContract(signer);
    console.log(`Fetching token balance for address: ${userAddress}`, await tokenContract.balanceOf(userAddress));

    try {
      // Get balance and decimals
      const [balance, decimals] = await Promise.all([
        tokenContract.balanceOf(userAddress),
        tokenContract.decimals()
      ]);

      // Convert balance to human readable format
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      return {
        success: true,
        balance: formattedBalance,
      };
    } catch (error) {
      console.error('Error in token contract call:', error);
      return {
        success: false,
        error: `Failed to get token balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  } catch (error) {
    console.error('Error getting Green Points balance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get Green Points balance',
    };
  }
}

/**
 * Utility function to validate token configuration
 */
export async function isTokenConfigured(): Promise<boolean> {
  const env = getServerEnv();
  return !!(
    env.HEDERA_OPERATOR_KEY &&
    env.GREENPOINTS_EVM &&
    env.HEDERA_RPC_URL
  );
}
