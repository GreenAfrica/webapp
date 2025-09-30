'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAddPoints } from '@/hooks/useFirestore';

export function useRewardHandler(
  onShowPointsEarned: (points: number, code: string) => void
) {
  const { user, greenAfricaUser } = useAuth();
  const { addPoints } = useAddPoints();
  const searchParams = useSearchParams();
  const processedRewardRef = useRef<string | null>(null);

  // Handle query parameters for point rewards
  useEffect(() => {
    const handlePointReward = async () => {
      if (!user?.uid || !greenAfricaUser) return;

      const code = searchParams.get('code');
      const pointValue = searchParams.get('points') || searchParams.get('point');
      
      if (code && pointValue) {
        // Create a unique identifier for this reward combination
        const rewardIdentifier = `${code}-${user.uid}`;
        
        // Check if we've already processed this exact reward
        if (processedRewardRef.current === rewardIdentifier) {
          console.log('Reward already processed, skipping:', rewardIdentifier);
          return;
        }

        try {
          const points = parseInt(pointValue, 10);
          
          // Validate point value
          if (isNaN(points) || points <= 0) {
            console.error('Invalid point value:', pointValue);
            return;
          }

          // Mark this reward as being processed BEFORE making the API call
          processedRewardRef.current = rewardIdentifier;

          // Clear URL parameters immediately to prevent re-processing
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);

          console.log('Adding points to user:', { uid: user.uid, points, code });

          // Add points to user
          await addPoints(
            user.uid,
            points,
            `Reward earned with code: ${code}`,
            { rewardCode: code }
          );

          console.log('Points added successfully');

          // Show success modal
          onShowPointsEarned(points, code);

        } catch (error) {
          console.error('Error adding points:', error);
          // Reset the processed ref on error so user can retry
          processedRewardRef.current = null;
        }
      }
    };

    handlePointReward();
  }, [user?.uid, greenAfricaUser, searchParams, addPoints, onShowPointsEarned]);

  return null; // This hook only handles side effects
}
