'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { extractReferralCode, storeReferralCode, isValidReferralCodeFormat } from '@/lib/utils/referral';

// Component that handles referral code processing using useSearchParams
function ReferralHandler({ 
  onReferralMessage 
}: { 
  onReferralMessage: (message: string | null) => void 
}) {
  const searchParams = useSearchParams();

  // Handle referral code from URL parameters
  useEffect(() => {
    if (searchParams) {
      const referralCode = extractReferralCode(searchParams);
      if (referralCode && isValidReferralCodeFormat(referralCode)) {
        // Store referral code for later use during signup
        storeReferralCode(referralCode);
        
        // Show welcome message
        onReferralMessage(`🎉 You've been referred by a friend! Sign up to start earning Green Points together!`);
        
        // Log for debugging
        console.log('Referral code detected and stored:', referralCode);
      } else if (referralCode) {
        // Invalid referral code format
        console.warn('Invalid referral code format:', referralCode);
      }
    }
  }, [searchParams, onReferralMessage]);

  return null; // This component only handles side effects
}

// Login content component that doesn't use useSearchParams
function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [error, setError] = useState<string | null>(null);
  const [referralMessage, setReferralMessage] = useState<string | null>(null);

  const { signInWithGoogle, signInWithFacebook, signInWithPhone, verifyPhoneCode, user, loading } = useAuth();
  const router = useRouter();

  // Handle referral message callback
  const handleReferralMessage = (message: string | null) => {
    setReferralMessage(message);
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is authenticated
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      setError(error instanceof Error ? error.message : 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithFacebook();
      router.push('/dashboard');
    } catch (error) {
      console.error('Facebook login error:', error);
      setError(error instanceof Error ? error.message : 'Facebook login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    try {
      setIsLoading(true);
      setError(null);
      await signInWithPhone(phoneNumber);
      setStep('verify');
    } catch (error) {
      console.error('Phone verification error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) return;

    try {
      setIsLoading(true);
      setError(null);
      await verifyPhoneCode(verificationCode);
      router.push('/dashboard');
    } catch (error) {
      console.error('Phone verification error:', error);
      setError(error instanceof Error ? error.message : 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-primary-800 mb-2">
            GreenAfrica
          </h1>
          <p className="text-gray-600">
            Welcome back! Sign in to continue recycling and earning rewards.
          </p>
        </div>

        {/* Main Card */}
        <div className="card">
          {step === 'phone' ? (
            <>
              <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
                Sign In
              </h2>

              {/* Referral Message Display */}
              {referralMessage && (
                <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <p className="text-primary-700 text-sm">{referralMessage}</p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isLoading ? 'Signing in...' : 'Continue with Google'}
                </button>

                <button
                  onClick={handleFacebookLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  {isLoading ? 'Signing in...' : 'Continue with Facebook'}
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with phone</span>
                </div>
              </div>

              {/* Phone Form */}
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="input-field"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || !phoneNumber}
                  className="btn-primary w-full"
                >
                  {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="font-display font-semibold text-xl text-gray-900 mb-2">
                Verify Your Phone
              </h2>
              <p className="text-gray-600 mb-6">
                Enter the 6-digit code sent to {phoneNumber}
              </p>

              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Verification Code</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="input-field text-center text-2xl tracking-widest"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="btn-primary w-full"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="btn-secondary w-full"
                >
                  Back to Phone Number
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          By signing in, you agree to our{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700">Privacy Policy</a>
        </div>
      </div>

      {/* ReferralHandler wrapped in Suspense */}
      <Suspense fallback={null}>
        <ReferralHandler onReferralMessage={handleReferralMessage} />
      </Suspense>
    </div>
  );
}

// Main Login Page component with Suspense wrapper
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
