import { useState, useEffect } from 'react';
import { getUserReferrals, type Referral } from '@/lib/firebase/firestore';

export function useReferrals(uid?: string) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const fetchReferrals = async () => {
      try {
        setLoading(true);
        setError(null);
        const userReferrals = await getUserReferrals(uid);
        setReferrals(userReferrals);
      } catch (err) {
        console.error('Error fetching referrals:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch referrals');
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [uid]);

  return {
    referrals,
    loading,
    error,
    totalReferrals: referrals.length,
    totalReferralPoints: referrals.reduce((sum, ref) => sum + ref.pointsAwarded, 0)
  };
}
