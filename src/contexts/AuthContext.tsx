'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import {
  signInWithGoogle,
  signInWithFacebook,
  sendPhoneVerification,
  verifyPhoneCode,
  signOutUser,
  onAuthStateChange,
  updateUserProfile,
  createRecaptchaVerifier,
} from '@/lib/firebase/auth';
import {
  createUser,
  getUser,
  updateUser,
  subscribeToUser,
  processReferral,
  type GreenAfricaUser,
} from '@/lib/firebase/firestore';
import { registerUserOnHedera } from '@/actions/blockchain';
import { AuthContextType, PhoneVerificationState } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [greenAfricaUser, setGreenAfricaUser] = useState<GreenAfricaUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneVerification, setPhoneVerification] = useState<PhoneVerificationState | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Initialize recaptcha verifier
  const initializeRecaptcha = () => {
    if (typeof window !== 'undefined' && !recaptchaVerifier) {
      const verifier = createRecaptchaVerifier('recaptcha-container');
      setRecaptchaVerifier(verifier);
      return verifier;
    }
    return recaptchaVerifier;
  };

  // Handle user creation or update in Firestore
  const handleUserData = async (firebaseUser: User, referralCode?: string) => {
    try {
      let userData = await getUser(firebaseUser.uid);
      
      if (!userData) {
        // Create new user in Firestore
        userData = await createUser(
          firebaseUser.uid,
          firebaseUser.email || '',
          firebaseUser.displayName || 'Anonymous User',
          firebaseUser.phoneNumber || undefined
        );

        // Process referral if provided
        if (referralCode) {
          await processReferral(referralCode, firebaseUser.uid);
        }
      } else {
        // Update existing user with latest Firebase data
        const updates: Partial<GreenAfricaUser> = {};
        if (firebaseUser.displayName && firebaseUser.displayName !== userData.displayName) {
          updates.displayName = firebaseUser.displayName;
        }
        if (firebaseUser.phoneNumber && firebaseUser.phoneNumber !== userData.phoneNumber) {
          updates.phoneNumber = firebaseUser.phoneNumber;
        }
        
        if (Object.keys(updates).length > 0) {
          await updateUser(firebaseUser.uid, updates);
        }
      }

      // Register user on Hedera blockchain
      try {
        console.log(`Registering new user ${userData.greenId} on blockchain`);
        const blockchainResult = await registerUserOnHedera(
          userData.greenId,
          userData.referralCode,
          referralCode
        );
        
        if (blockchainResult.success) {
          console.log(`Blockchain registration successful for ${userData.greenId}:`, blockchainResult.message);
          if (blockchainResult.transactionId) {
            console.log(`Transaction ID: ${blockchainResult.transactionId}`);
          }
        } else {
          console.warn(`Blockchain registration failed for ${userData.greenId}:`, blockchainResult.error);
          // User registration continues despite blockchain failure
        }
      } catch (blockchainError) {
        console.error('Blockchain registration error:', blockchainError);
        // User registration continues despite blockchain failure
      }

      setGreenAfricaUser(userData);
    } catch (error) {
      console.error('Error handling user data:', error);
      
      // If it's a permission error, create a temporary user object with Firebase data
      if (error instanceof Error && error.message.includes('permission-denied')) {
        console.log('Permission denied - using Firebase user data as fallback');
        const fallbackUser: GreenAfricaUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'User',
          phoneNumber: firebaseUser.phoneNumber || undefined,
          greenId: 'GRN-TEMP-' + Date.now(),
          totalPoints: 0,
          referralCode: 'TEMP' + Date.now(),
          referralPoints: 0,
          createdAt: new Date() as unknown as any,
          updatedAt: new Date() as unknown as any,
        };
        setGreenAfricaUser(fallbackUser);
      }
    }
  };

  // Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Get referral code from localStorage if it exists
        const referralCode = localStorage.getItem('referralCode');
        if (referralCode) {
          localStorage.removeItem('referralCode');
        }
        
        await handleUserData(firebaseUser, referralCode || undefined);
      } else {
        setGreenAfricaUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to GreenAfrica user data changes
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (user?.uid) {
      unsubscribe = subscribeToUser(user.uid, (userData) => {
        setGreenAfricaUser(userData);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.uid]);

  const handleSignInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithFacebook = async () => {
    try {
      setLoading(true);
      await signInWithFacebook();
    } catch (error) {
      console.error('Facebook sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithPhone = async (phoneNumber: string) => {
    try {
      setLoading(true);
      const verifier = initializeRecaptcha();
      if (!verifier) {
        throw new Error('Failed to initialize reCAPTCHA');
      }
      
      const confirmationResult = await sendPhoneVerification(phoneNumber, verifier);
      setPhoneVerification({
        confirmationResult,
        phoneNumber,
      });
    } catch (error) {
      console.error('Phone sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneCode = async (code: string) => {
    try {
      if (!phoneVerification?.confirmationResult) {
        throw new Error('No phone verification in progress');
      }
      
      setLoading(true);
      await verifyPhoneCode(phoneVerification.confirmationResult, code);
      setPhoneVerification(null);
    } catch (error) {
      console.error('Phone verification error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOutUser();
      setPhoneVerification(null);
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (displayName?: string, phoneNumber?: string) => {
    try {
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      
      setLoading(true);
      
      // Update Firebase Auth profile
      if (displayName !== undefined) {
        await updateUserProfile(displayName);
      }
      
      // Update Firestore user data
      const updates: Partial<GreenAfricaUser> = {};
      if (displayName !== undefined) {
        updates.displayName = displayName;
      }
      if (phoneNumber !== undefined) {
        updates.phoneNumber = phoneNumber;
      }
      
      if (Object.keys(updates).length > 0) {
        await updateUser(user.uid, updates);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    greenAfricaUser,
    loading,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithFacebook: handleSignInWithFacebook,
    signInWithPhone: handleSignInWithPhone,
    verifyPhoneCode: handleVerifyPhoneCode,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" style={{ display: 'none' }}></div>
    </AuthContext.Provider>
  );
};

export default AuthContext;
