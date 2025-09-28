'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToUserTransactions,
  createRedemptionRequest,
  getUserRedemptions,
  addPointsToUser,
  type Transaction,
  type RedemptionRequest,
} from '@/lib/firebase/firestore';
import { useAuth } from './useAuth';

export const useUserTransactions = (limitCount = 20) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToUserTransactions(
        user.uid,
        (data) => {
          setTransactions(data);
          setLoading(false);
        },
        limitCount
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up transactions subscription:', err);
      if (err instanceof Error && err.message.includes('permission-denied')) {
        setError('Database permissions not configured yet. Please check FIREBASE_SETUP.md');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      }
      setLoading(false);
    }
  }, [user?.uid, limitCount]);

  return { transactions, loading, error };
};

export const useRedemptions = () => {
  const { user } = useAuth();
  const [redemptions, setRedemptions] = useState<RedemptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRedemptions = useCallback(async () => {
    if (!user?.uid) {
      setRedemptions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserRedemptions(user.uid);
      setRedemptions(data);
    } catch (err) {
      console.error('Error fetching redemptions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch redemptions');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {fetchRedemptions()}, [fetchRedemptions]);

  const redeemPoints = async (
    type: 'airtime' | 'data',
    amount: string,
    points: number,
    phone: string
  ): Promise<string> => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      const redemptionId = await createRedemptionRequest({
        userId: user.uid,
        type,
        amount,
        points,
        phone,
        status: 'pending',
      });

      // Refresh redemptions list
      await fetchRedemptions();
      
      return redemptionId;
    } catch (error) {
      console.error('Error redeeming points:', error);
      throw error;
    }
  };

  return {
    redemptions,
    loading,
    error,
    redeemPoints,
    refetch: fetchRedemptions,
  };
};

export const useAddPoints = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPoints = async (
    uid: string,
    points: number,
    description: string,
    metadata?: Record<string, unknown>
  ) => {
    try {
      setLoading(true);
      setError(null);
      await addPointsToUser(uid, points, description, metadata);
    } catch (err) {
      console.error('Error adding points:', err);
      setError(err instanceof Error ? err.message : 'Failed to add points');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addPoints, loading, error };
};

export const useFirestore = () => {
  return {
    useUserTransactions,
    useRedemptions,
    useAddPoints,
  };
};

export default useFirestore;
