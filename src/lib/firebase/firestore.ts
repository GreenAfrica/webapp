import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  onSnapshot,
  increment,
  serverTimestamp,
  Timestamp,
  CollectionReference,
} from 'firebase/firestore';
import { db } from './config';
import { generateHederaAccountAction } from '@/actions/hedera-account';
import type { GreenAfricaUser, Transaction, Referral, RedemptionRequest } from '@/types';

export type { GreenAfricaUser, Transaction, Referral, RedemptionRequest };

// Collection references
export const usersRef = collection(db, 'users') as CollectionReference<GreenAfricaUser>;
export const transactionsRef = collection(db, 'transactions') as CollectionReference<Transaction>;
export const referralsRef = collection(db, 'referrals') as CollectionReference<Referral>;
export const redemptionsRef = collection(db, 'redemptions') as CollectionReference<RedemptionRequest>;

// Generate unique Green ID (legacy function - keeping for fallback)
const generateGreenId = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `GRN-${year}-${randomNum}`;
};

// Generate unique referral code
const generateReferralCode = (displayName: string): string => {
  const name = displayName.replace(/\s+/g, '').toUpperCase();
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${name.substring(0, 4)}${year}${randomNum}`;
};

// User Management Functions
export const createUser = async (uid: string, email: string, displayName: string, phoneNumber?: string): Promise<GreenAfricaUser> => {
  const referralCode = generateReferralCode(displayName);
  const userDocRef = doc(usersRef, uid);

  try {
    console.log('Generating Hedera account for new user via server action...');
    
    // Generate new Hedera account using secure server action
    const hederaResult = await generateHederaAccountAction();
    
    if (hederaResult.success && hederaResult.data) {
      console.log(`Generated Hedera account: ${hederaResult.data.accountId}`);
      
      // Use Hedera account ID as Green ID
      await setDoc(userDocRef, {
        uid,
        email,
        displayName,
        greenId: hederaResult.data.accountId, // Using Hedera account ID as Green ID
        totalPoints: 0,
        referralCode,
        referralPoints: 0,
        evmAddress: hederaResult.data.evmAddress,
        encryptedPrivateKey: hederaResult.data.encryptedPrivateKey,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(phoneNumber ? { phoneNumber } : {}),
      });
    } else {
      throw new Error(hederaResult.error || 'Failed to generate Hedera account');
    }
  } catch (hederaError) {
    console.error('Failed to generate Hedera account, using fallback Green ID:', hederaError);
    
    // Fallback to old Green ID generation if Hedera fails
    const greenId = generateGreenId();
    await setDoc(userDocRef, {
      uid,
      email,
      displayName,
      greenId,
      totalPoints: 0,
      referralCode,
      referralPoints: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(phoneNumber ? { phoneNumber } : {}),
    });
  }

  const createdUser = await getDoc(userDocRef);

  if (!createdUser.exists()) {
    throw new Error('Failed to retrieve newly created user');
  }

  return createdUser.data();
};

export const getUser = async (uid: string): Promise<GreenAfricaUser | null> => {
  const userDoc = await getDoc(doc(usersRef, uid));
  if (userDoc.exists()) {
    const userData = userDoc.data();
    
    // If user has an EVM address, get points from blockchain instead of Firebase
    if (userData.evmAddress) {
      try {
        const { getTokenBalance } = await import('@/lib/hedera/token-client');
        const balanceResult = await getTokenBalance(userData.evmAddress);
        
        if (balanceResult.success && balanceResult.balance) {
          // Update totalPoints with blockchain balance
          userData.totalPoints = Math.floor(parseFloat(balanceResult.balance));
        }
      } catch (error) {
        console.error('Failed to get blockchain balance for user:', error);
        // Fall back to Firebase totalPoints if blockchain read fails
      }
    }
    
    return userData;
  }
  return null;
};

export const updateUser = async (uid: string, updates: Partial<GreenAfricaUser>): Promise<void> => {
  // Filter out undefined and null values, letting Firebase handle the types
  const updatesToApply: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && value !== null) {
      updatesToApply[key] = value;
    }
  }

  await updateDoc(doc(usersRef, uid), {
    ...updatesToApply,
    updatedAt: serverTimestamp(),
  });
};

export const getUserByGreenId = async (greenId: string): Promise<GreenAfricaUser | null> => {
  const q = query(usersRef, where('greenId', '==', greenId));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }
  return null;
};

export const getUserByReferralCode = async (referralCode: string): Promise<GreenAfricaUser | null> => {
  const q = query(usersRef, where('referralCode', '==', referralCode));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }
  return null;
};

// Transaction Functions
export const addTransaction = async (
  transaction: Omit<Transaction, 'id' | 'date'>, 
  updateTotalPoints: boolean = true
): Promise<string> => {
  const docRef = await addDoc(transactionsRef, {
    ...transaction,
    date: serverTimestamp(),
  });
  
  // Update user's total points only if requested (for backward compatibility and blockchain integration)
  if (updateTotalPoints) {
    if (transaction.type === 'earned' || transaction.type === 'referral') {
      await updateDoc(doc(usersRef, transaction.userId), {
        totalPoints: increment(transaction.amount),
        updatedAt: serverTimestamp(),
      });
    } else if (transaction.type === 'redeemed') {
      await updateDoc(doc(usersRef, transaction.userId), {
        totalPoints: increment(-Math.abs(transaction.amount)),
        updatedAt: serverTimestamp(),
      });
    }
  }
  
  return docRef.id;
};

export const getUserTransactions = async (userId: string, limitCount = 20): Promise<Transaction[]> => {
  const q = query(
    transactionsRef,
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const subscribeToUserTransactions = (
  userId: string,
  callback: (transactions: Transaction[]) => void,
  limitCount = 20
) => {
  const q = query(
    transactionsRef,
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(transactions);
  });
};

// Referral Functions
export const processReferral = async (referralCode: string, newUserUid: string): Promise<boolean> => {
  const referrer = await getUserByReferralCode(referralCode);
  if (!referrer) {
    return false;
  }

  // Get referral points from environment variable, fallback to 50 if not set
  const referralPoints = parseInt(process.env.NEXT_PUBLIC_REFERRAL_POINTS || '50', 10);

  // Create referral record
  const referralData: Omit<Referral, 'id'> = {
    referrerUid: referrer.uid,
    referredUid: newUserUid,
    referralCode,
    pointsAwarded: referralPoints,
    createdAt: serverTimestamp() as Timestamp,
    status: 'completed',
  };

  await addDoc(referralsRef, referralData);

  // Add points to referrer
  await addTransaction({
    userId: referrer.uid,
    type: 'referral',
    amount: referralPoints,
    description: `Friend joined via referral (+${referralPoints} points)`,
  });

  // Update referrer's referral points
  await updateDoc(doc(usersRef, referrer.uid), {
    referralPoints: increment(referralPoints),
    updatedAt: serverTimestamp(),
  });

  return true;
};

export const getUserReferrals = async (uid: string): Promise<Referral[]> => {
  const q = query(referralsRef, where('referrerUid', '==', uid), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Redemption Functions
export const createRedemptionRequest = async (redemption: Omit<RedemptionRequest, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(redemptionsRef, {
    ...redemption,
    createdAt: serverTimestamp(),
  });

  // Import the new server action for burning tokens
  const { burnPointsForUser } = await import('@/actions/greenpoints');

  try {
    // Burn Green Points tokens and call contract redeem
    const burnResult = await burnPointsForUser(
      redemption.userId,
      redemption.points,
      redemption.type, // rewardType
      redemption.phone || '', // destination
      docRef.id // redemptionId (use Firestore document ID)
    );

    if (!burnResult.success) {
      console.error('Failed to burn Green Points for redemption:', burnResult.error);
      // Update redemption status to failed
      await updateDoc(doc(redemptionsRef, docRef.id), {
        status: 'failed',
        error: burnResult.error,
      });
      throw new Error(`Failed to process redemption: ${burnResult.error}`);
    }

    // Create Firebase transaction record for audit purposes, but don't update totalPoints
    await addTransaction({
      userId: redemption.userId,
      type: 'redeemed',
      amount: -redemption.points,
      description: `${redemption.amount} ${redemption.type}`,
      phone: redemption.phone,
      metadata: {
        transactionHash: burnResult.transactionHash,
        redemptionId: docRef.id,
      },
    }, false); // Don't update totalPoints since tokens were burned

  } catch (error) {
    console.error('Error processing redemption:', error);
    // Update redemption status to failed if not already done
    await updateDoc(doc(redemptionsRef, docRef.id), {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }

  return docRef.id;
};

export const getUserRedemptions = async (userId: string): Promise<RedemptionRequest[]> => {
  const q = query(redemptionsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateRedemptionStatus = async (
  redemptionId: string, 
  status: RedemptionRequest['status'], 
  transactionId?: string
): Promise<void> => {
  const updates: Partial<RedemptionRequest> = {
    status,
  };

  if (status === 'completed') {
    updates.completedAt = serverTimestamp() as Timestamp;
    if (transactionId) {
      updates.transactionId = transactionId;
    }
  }

  await updateDoc(doc(redemptionsRef, redemptionId), updates);
};

// Utility Functions
export const subscribeToUser = (uid: string, callback: (user: GreenAfricaUser | null) => void) => {
  return onSnapshot(doc(usersRef, uid), (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback(null);
    }
  });
};

export const addPointsToUser = async (uid: string, points: number, description: string, metadata?: Record<string, unknown>): Promise<void> => {
  // Import the new server action
  const { mintPointsForUser } = await import('@/actions/greenpoints');
  
  // Generate session ID and add it to metadata
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const updatedMetadata = {
    ...metadata,
    sessionId,
  };

  // Mint Green Points tokens instead of updating Firebase
  const mintResult = await mintPointsForUser(uid, points, sessionId);
  
  if (!mintResult.success) {
    console.error('Failed to mint Green Points:', mintResult.error);
    throw new Error(`Failed to mint Green Points: ${mintResult.error}`);
  }

  // Still create Firebase transaction record for audit purposes, but don't update totalPoints
  await addTransaction({
    userId: uid,
    type: 'earned',
    amount: points,
    description,
    metadata: updatedMetadata,
  }, false); // Pass false to skip totalPoints update
};

export const deleteUser = async (uid: string): Promise<void> => {
  await deleteDoc(doc(usersRef, uid));
};

// Migration functions moved to server actions for security
// See: src/actions/user-migration.ts
