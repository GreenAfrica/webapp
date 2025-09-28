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
import type { GreenAfricaUser, Transaction, Referral, RedemptionRequest } from '@/types';

export type { GreenAfricaUser, Transaction, Referral, RedemptionRequest };

// Collection references
export const usersRef = collection(db, 'users') as CollectionReference<GreenAfricaUser>;
export const transactionsRef = collection(db, 'transactions') as CollectionReference<Transaction>;
export const referralsRef = collection(db, 'referrals') as CollectionReference<Referral>;
export const redemptionsRef = collection(db, 'redemptions') as CollectionReference<RedemptionRequest>;

// Generate unique Green ID
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
  const greenId = generateGreenId();
  const referralCode = generateReferralCode(displayName);
  const userDocRef = doc(usersRef, uid);

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

  const createdUser = await getDoc(userDocRef);

  if (!createdUser.exists()) {
    throw new Error('Failed to retrieve newly created user');
  }

  return createdUser.data();
};

export const getUser = async (uid: string): Promise<GreenAfricaUser | null> => {
  const userDoc = await getDoc(doc(usersRef, uid));
  if (userDoc.exists()) {
    return userDoc.data();
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
export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>): Promise<string> => {
  const docRef = await addDoc(transactionsRef, {
    ...transaction,
    date: serverTimestamp(),
  });
  
  // Update user's total points
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

  // Deduct points from user (create negative transaction)
  await addTransaction({
    userId: redemption.userId,
    type: 'redeemed',
    amount: -redemption.points,
    description: `${redemption.amount} ${redemption.type}`,
    phone: redemption.phone,
  });

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
  await addTransaction({
    userId: uid,
    type: 'earned',
    amount: points,
    description,
    metadata,
  });
};

export const deleteUser = async (uid: string): Promise<void> => {
  await deleteDoc(doc(usersRef, uid));
};
