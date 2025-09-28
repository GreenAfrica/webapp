import { adminDb } from './admin';
import { FieldValue } from 'firebase-admin/firestore';
import { GreenAfricaUser, Transaction, RedemptionRequest } from '@/types';

/**
 * Get user by referral code using Firebase Admin SDK
 * This is the admin version of getUserByReferralCode for server-side operations
 */
export async function getUserByReferralCodeAdmin(referralCode: string): Promise<GreenAfricaUser | null> {
  try {
    const usersRef = adminDb.collection('users');
    const q = usersRef.where('referralCode', '==', referralCode);
    const querySnapshot = await q.get();
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const userData = doc.data() as GreenAfricaUser;
    
    // Ensure the uid is set correctly from the document ID
    userData.uid = doc.id;
    
    return userData;
  } catch (error) {
    console.error('Error getting user by referral code (Admin):', error);
    throw error;
  }
}

/**
 * Get user by ID using Firebase Admin SDK
 */
export async function getUserAdmin(uid: string): Promise<GreenAfricaUser | null> {
  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data() as GreenAfricaUser;
    userData.uid = userDoc.id;
    
    return userData;
  } catch (error) {
    console.error('Error getting user (Admin):', error);
    throw error;
  }
}

/**
 * Get user by Green ID using Firebase Admin SDK
 */
export async function getUserByGreenIdAdmin(greenId: string): Promise<GreenAfricaUser | null> {
  try {
    const usersRef = adminDb.collection('users');
    const q = usersRef.where('greenId', '==', greenId);
    const querySnapshot = await q.get();
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const userData = doc.data() as GreenAfricaUser;
    userData.uid = doc.id;
    
    return userData;
  } catch (error) {
    console.error('Error getting user by Green ID (Admin):', error);
    throw error;
  }
}

/**
 * Update user data using Firebase Admin SDK
 */
export async function updateUserAdmin(uid: string, updates: Record<string, unknown>): Promise<void> {
  try {
    // Filter out undefined values and add server timestamp
    const cleanUpdates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Only add fields that are not undefined
    Object.keys(updates).forEach(key => {
      const value = updates[key];
      if (value !== undefined && value !== null) {
        cleanUpdates[key] = value;
      }
    });

    await adminDb.collection('users').doc(uid).update(cleanUpdates);
  } catch (error) {
    console.error('Error updating user (Admin):', error);
    throw error;
  }
}

/**
 * Check if user exists by ID using Firebase Admin SDK
 */
export async function userExistsAdmin(uid: string): Promise<boolean> {
  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();
    return userDoc.exists;
  } catch (error) {
    console.error('Error checking user existence (Admin):', error);
    return false;
  }
}

/**
 * Batch operation helper for admin operations
 */
export function createBatchAdmin() {
  return adminDb.batch();
}

/**
 * Get Firestore admin reference for advanced operations
 */
export function getAdminCollectionRef(collectionName: string) {
  return adminDb.collection(collectionName);
}

/**
 * Create a redemption request using Firebase Admin SDK
 */
export async function createRedemptionRequestAdmin(
  redemption: Omit<RedemptionRequest, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const redemptionData = {
      ...redemption,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('redemptions').add(redemptionData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating redemption request (Admin):', error);
    throw error;
  }
}

/**
 * Update redemption status using Firebase Admin SDK
 */
export async function updateRedemptionStatusAdmin(
  redemptionId: string,
  status: RedemptionRequest['status'],
  updates?: {
    transactionId?: string;
    failureReason?: string;
    apiResponse?: RedemptionRequest['apiResponse'];
  }
): Promise<void> {
  try {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (status === 'completed') {
      updateData.completedAt = FieldValue.serverTimestamp();
    }

    if (updates?.transactionId) {
      updateData.transactionId = updates.transactionId;
    }

    if (updates?.failureReason) {
      updateData.failureReason = updates.failureReason;
    }

    if (updates?.apiResponse) {
      updateData.apiResponse = updates.apiResponse;
    }

    await adminDb.collection('redemptions').doc(redemptionId).update(updateData);
  } catch (error) {
    console.error('Error updating redemption status (Admin):', error);
    throw error;
  }
}

/**
 * Add transaction using Firebase Admin SDK
 */
export async function addTransactionAdmin(
  transaction: Omit<Transaction, 'id' | 'date'>
): Promise<string> {
  try {
    const transactionData = {
      ...transaction,
      date: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('transactions').add(transactionData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding transaction (Admin):', error);
    throw error;
  }
}
