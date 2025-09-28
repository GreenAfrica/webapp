'use server';

import { generateHederaAccountAction } from './hedera-account';
import { isOldGreenIdFormat } from '@/lib/utils/hedera';
import { getUserAdmin, updateUserAdmin } from '@/lib/firebase/admin-firestore';
import { FieldValue } from 'firebase-admin/firestore';

interface MigrationResult {
  success: boolean;
  data?: {
    accountId: string;
    evmAddress: string;
    migrated: boolean;
  };
  error?: string;
}

/**
 * Server action to migrate an existing user to use Hedera account as Green ID
 * This is called automatically when a user with old Green ID format logs in
 */
export async function migrateUserToHederaAccountAction(uid: string): Promise<MigrationResult> {
  try {
    const currentUser = await getUserAdmin(uid);
    if (!currentUser) {
      return {
        success: false,
        error: 'User not found for migration'
      };
    }

    // Check if user already has Hedera account or is already migrated
    if (!isOldGreenIdFormat(currentUser.greenId) && currentUser.evmAddress) {
      console.log('User already has Hedera account, no migration needed');
      return {
        success: true,
        data: {
          accountId: currentUser.greenId,
          evmAddress: currentUser.evmAddress,
          migrated: false // Already migrated
        }
      };
    }

    console.log(`Migrating user ${uid} with old Green ID: ${currentUser.greenId}`);

    // Generate new Hedera account on server
    const hederaResult = await generateHederaAccountAction();
    
    if (!hederaResult.success || !hederaResult.data) {
      throw new Error(hederaResult.error || 'Failed to generate Hedera account');
    }

    console.log(`Generated new Hedera account for migration: ${hederaResult.data.accountId}`);

    // Update user with new Hedera account data
    const updates = {
      greenId: hederaResult.data.accountId, // Replace old Green ID with Hedera account ID
      evmAddress: hederaResult.data.evmAddress,
      encryptedPrivateKey: hederaResult.data.encryptedPrivateKey,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await updateUserAdmin(uid, updates);

    console.log(`Successfully migrated user ${uid} to Hedera account: ${hederaResult.data.accountId}`);
    
    return {
      success: true,
      data: {
        accountId: hederaResult.data.accountId,
        evmAddress: hederaResult.data.evmAddress,
        migrated: true
      }
    };
  } catch (error) {
    console.error('Failed to migrate user to Hedera account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed'
    };
  }
}

/**
 * Server action to check if a user needs migration and migrate them if needed
 * This should be called during the login process
 */
export async function checkAndMigrateUserAction(uid: string): Promise<MigrationResult> {
  try {
    const user = await getUserAdmin(uid);
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Check if migration is needed
    if (isOldGreenIdFormat(user.greenId) && !user.evmAddress) {
      console.log(`User ${uid} needs migration from old Green ID format`);
      return await migrateUserToHederaAccountAction(uid);
    }

    // User doesn't need migration
    return {
      success: true,
      data: {
        accountId: user.greenId,
        evmAddress: user.evmAddress || '',
        migrated: false
      }
    };
  } catch (error) {
    console.error('Error checking user migration status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Migration check failed'
    };
  }
}
