'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUserTransactions, useAddPoints } from '@/hooks/useFirestore';
import { useReferrals } from '@/hooks/useReferrals';

export function useDashboard() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [showPointsEarned, setShowPointsEarned] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [rewardCode, setRewardCode] = useState('');
  const [rewardProcessing, setRewardProcessing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const { user, greenAfricaUser, signOut, loading } = useAuth();
  const { transactions, loading: transactionsLoading } = useUserTransactions();
  const { totalReferrals, totalReferralPoints } = useReferrals(user?.uid);
  const { loading: addingPoints } = useAddPoints();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Initialize profile data when greenAfricaUser loads
  useEffect(() => {
    if (greenAfricaUser) {
      setProfileData({
        name: greenAfricaUser.displayName,
        phone: greenAfricaUser.phoneNumber || '',
        email: greenAfricaUser.email
      });
    }
  }, [greenAfricaUser]);

  // Check if user is new (show welcome slides)
  useEffect(() => {
    const isNewUser = localStorage.getItem('welcomeShown') !== 'true';
    if (isNewUser) {
      setShowWelcome(true);
    }
  }, []);

  const handleWelcomeComplete = () => {
    localStorage.setItem('welcomeShown', 'true');
    setShowWelcome(false);
  };

  const handleShowPointsEarned = (points: number, code: string, isLoading?: boolean) => {
    setEarnedPoints(points);
    setRewardCode(code);
    setShowPointsEarned(true);
    setRewardProcessing(isLoading ?? false);
  };

  const handleProfileSubmit = (data: { name: string; phone: string; email: string }) => {
    setProfileData(data);
    setShowProfile(false);
    setShowProfileSuccess(true);
  };

  const handleLogout = async () => {
    localStorage.removeItem('welcomeShown');
    await signOut();
    window.location.href = '/login';
  };

  return {
    // State
    showWelcome,
    showProfile,
    showProfileSuccess,
    showPointsEarned,
    earnedPoints,
    rewardCode,
    profileData,
    rewardProcessing,
    
    // Auth data
    user,
    greenAfricaUser,
    loading,
    
    // Firestore data
    transactions,
    transactionsLoading,
    totalReferrals,
    totalReferralPoints,
    addingPoints,
    
    // Actions
    setShowWelcome,
    setShowProfile,
    setShowProfileSuccess,
    setShowPointsEarned,
    handleWelcomeComplete,
    handleShowPointsEarned,
    handleProfileSubmit,
    handleLogout
  };
}
