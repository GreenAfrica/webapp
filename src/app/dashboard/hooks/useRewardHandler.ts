'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAddPoints } from '@/hooks/useFirestore';
import { mintPointsForUser } from '@/actions/greenpoints';

export function useRewardHandler(
  onShowPointsEarned: (points: number, code: string, isLoading?: boolean) => void
) {
  const { user, greenAfricaUser } = useAuth();
  const { addPoints } = useAddPoints();
  const searchParams = useSearchParams();
  const processedRewardRef = useRef<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle query parameters for point rewards
  useEffect(() => {
    const handlePointReward = async () => {
      if (!user?.uid || !greenAfricaUser) return;

      // Prevent concurrent processing
      if (isProcessing) {
        console.log('Already processing a reward, skipping...');
        return;
      }

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
          setIsProcessing(true);

          // Clear URL parameters immediately to prevent re-processing
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);

          // Show modal immediately with loading state
          onShowPointsEarned(points, code, true);

          try {
            // First, try to mint Green Points on blockchain
            const mintResult = await mintPointsForUser(user.uid, points);
            
            if (mintResult.success) {
              console.log('Blockchain minting successful:', mintResult.message);
            } else {
              console.warn('Blockchain minting failed, proceeding with Firestore update:', mintResult.error);
            }
          } catch (blockchainError) {
            console.warn('Blockchain operation error, proceeding with Firestore update:', blockchainError);
          }

          // Always add points to Firestore for consistency
          await addPoints(
            user.uid,
            points,
            `Reward earned with code: ${code}`,
            { rewardCode: code }
          );

          console.log('Points processing completed');

          // Show success modal (loading = false)
          onShowPointsEarned(points, code, false);

        } catch (error) {
          console.error('Error processing reward:', error);
          // Reset the processed ref on error so user can retry
          processedRewardRef.current = null;
        } finally {
          setIsProcessing(false);
        }
      }
    };

    handlePointReward();
  }, [user?.uid, greenAfricaUser, searchParams, addPoints, isProcessing]);

  return null; // This hook only handles side effects
}
