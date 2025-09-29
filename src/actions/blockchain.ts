'use server';

import { registerUserOnBlockchain, checkUserExists, registerRVMOnBlockchain } from '@/lib/ethereum/client';
import { getUserByReferralCodeAdmin } from '@/lib/firebase/admin-firestore';

export interface BlockchainRegistrationResult {
  success: boolean;
  message: string;
  transactionId?: string;
  userExists?: boolean;
  error?: string;
}

/**
 * Server action to register a user on the Hedera blockchain
 * Called after successful Firebase authentication
 */
export async function registerUserOnHedera(
  greenId: string,
  referralCode: string,
  referredByCode?: string
): Promise<BlockchainRegistrationResult> {
  try {
    console.log(`Attempting to register user on blockchain: ${greenId}`);
    
    // Validate inputs
    if (!greenId || !referralCode) {
      return {
        success: false,
        message: 'Missing required parameters: greenId and referralCode',
        error: 'Invalid parameters',
      };
    }

    // If a referral code is provided, verify the referrer exists
    let validatedReferredByCode: string | undefined = referredByCode;
    if (referredByCode) {
      const referrer = await getUserByReferralCodeAdmin(referredByCode);
      if (!referrer) {
        console.warn(`Referral code ${referredByCode} not found in Firestore, proceeding without referral`);
        validatedReferredByCode = undefined;
      }
    }

    // Attempt blockchain registration
    const result = await registerUserOnBlockchain(
      greenId,
      referralCode,
      validatedReferredByCode
    );

    if (result.success) {
      if (result.userExists) {
        console.log(`User ${greenId} already exists on blockchain`);
        return {
          success: true,
          message: 'User already registered on blockchain',
          userExists: true,
        };
      } else {
        console.log(`User ${greenId} successfully registered on blockchain. TX: ${result.transactionHash}`);
        return {
          success: true,
          message: 'User successfully registered on blockchain',
          transactionId: result.transactionHash,
        };
      }
    } else {
      console.error(`Failed to register user ${greenId} on blockchain:`, result.error);
      return {
        success: false,
        message: 'Failed to register user on blockchain',
        error: result.error,
      };
    }
  } catch (error) {
    console.error('Unexpected error in blockchain registration:', error);
    return {
      success: false,
      message: 'Unexpected error during blockchain registration',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Server action to register an RVM on the Hedera blockchain
 */
export async function registerRVMOnHedera(
  rvmId: string,
  lat: number,
  lng: number,
  name: string,
  metaURI?: string
): Promise<BlockchainRegistrationResult> {
  try {
    console.log(`Attempting to register RVM on blockchain: ${rvmId}`);
    
    // Validate inputs
    if (!rvmId || !name || lat === undefined || lng === undefined) {
      return {
        success: false,
        message: 'Missing required parameters: rvmId, name, lat, lng',
        error: 'Invalid parameters',
      };
    }

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return {
        success: false,
        message: 'Invalid coordinates: lat must be -90 to 90, lng must be -180 to 180',
        error: 'Invalid coordinates',
      };
    }

    // Attempt blockchain registration
    const result = await registerRVMOnBlockchain(
      rvmId,
      lat,
      lng,
      name,
      metaURI || ''
    );

    if (result.success) {
      console.log(`RVM ${rvmId} successfully registered on blockchain. TX: ${result.transactionHash}`);
      return {
        success: true,
        message: 'RVM successfully registered on blockchain',
        transactionId: result.transactionId,
      };
    } else {
      console.error(`Failed to register RVM ${rvmId} on blockchain:`, result.error);
      return {
        success: false,
        message: 'Failed to register RVM on blockchain',
        error: result.error,
      };
    }
  } catch (error) {
    console.error('Unexpected error in RVM blockchain registration:', error);
    return {
      success: false,
      message: 'Unexpected error during RVM blockchain registration',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Server action to check if a user exists on the blockchain
 */
export async function checkUserExistsOnHedera(greenId: string): Promise<{
  exists: boolean;
  error?: string;
}> {
  try {
    if (!greenId) {
      return {
        exists: false,
        error: 'Green ID is required',
      };
    }

    const exists = await checkUserExists(greenId);
    return { exists };
  } catch (error) {
    console.error('Error checking user existence on blockchain:', error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
