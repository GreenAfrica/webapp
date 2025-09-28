'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BaseModal from '@/components/shared/BaseModal';
import { useAuth } from '@/hooks/useAuth';
import { useUserTransactions, useAddPoints } from '@/hooks/useFirestore';
import { useReferrals } from '@/hooks/useReferrals';
import ReferralCard from '@/components/shared/ReferralCard';
import { redeemAirtime } from '@/actions/airtime';

// Type definitions
interface RedeemData {
  type: string;
  phone: string;
  amount: string;
  points: number;
}

interface ProfileData {
  name: string;
  phone: string;
  email: string;
}

// Component that handles reward processing using useSearchParams
function RewardHandler({ 
  onShowPointsEarned 
}: { 
  onShowPointsEarned: (points: number, code: string) => void 
}) {
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
        const rewardIdentifier = `${code}-${pointValue}-${user.uid}`;
        
        // Check if we've already processed this exact reward
        if (processedRewardRef.current === rewardIdentifier) {
          console.log('Reward already processed, skipping:', rewardIdentifier);
          return;
        }

        console.log('Processing new reward:', rewardIdentifier);

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

  return null; // This component only handles side effects
}

// Dashboard content component that doesn't use useSearchParams
function DashboardContent() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showRedeemSuccess, setShowRedeemSuccess] = useState(false);
  const [showRedeemError, setShowRedeemError] = useState(false);
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [showPointsEarned, setShowPointsEarned] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [rewardCode, setRewardCode] = useState('');
  const [redeemStep, setRedeemStep] = useState(1);
  const [redeemData, setRedeemData] = useState({
    type: '',
    phone: '',
    amount: '',
    points: 0
  });
  const [redemptionResult, setRedemptionResult] = useState<any>(null);
  const [redemptionError, setRedemptionError] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // Firebase hooks - all hooks must be called before any early returns
  const { user, greenAfricaUser, signOut, loading } = useAuth();
  const { transactions, loading: transactionsLoading } = useUserTransactions();
  const { totalReferrals, totalReferralPoints } = useReferrals(user?.uid);
  const { loading: addingPoints } = useAddPoints();
  const router = useRouter();

  // All useEffect hooks must be called before any early returns
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

  // Handle points earned callback
  const handleShowPointsEarned = (points: number, code: string) => {
    setEarnedPoints(points);
    setRewardCode(code);
    setShowPointsEarned(true);
  };

  // Show loading while checking auth state - moved after all hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if user is not authenticated - moved after all hooks
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const handleWelcomeComplete = () => {
    localStorage.setItem('welcomeShown', 'true');
    setShowWelcome(false);
  };

  const handleRedeemSubmit = async (step: number, data: Partial<RedeemData>) => {
    if (step === 3 && data.type === 'airtime' && user?.uid) {
      // Final submission - process airtime redemption
      setIsRedeeming(true);
      try {
        const result = await redeemAirtime({
          userId: user.uid,
          phone: data.phone || redeemData.phone,
          amount: parseInt(data.amount || redeemData.amount),
          network: (data as any).network || (data as any).detectedNetwork
        });

        if (result.success) {
          setRedemptionResult(result);
          setShowRedeem(false);
          setShowRedeemSuccess(true);
          setRedeemStep(1);
          setRedeemData({ type: '', phone: '', amount: '', points: 0 });
        } else {
          setRedemptionError(result.error || result.message);
          setShowRedeem(false);
          setShowRedeemError(true);
          setRedeemStep(1);
          setRedeemData({ type: '', phone: '', amount: '', points: 0 });
        }
      } catch (error) {
        console.error('Airtime redemption error:', error);
        setRedemptionError(error instanceof Error ? error.message : 'Unknown error occurred');
        setShowRedeem(false);
        setShowRedeemError(true);
        setRedeemStep(1);
        setRedeemData({ type: '', phone: '', amount: '', points: 0 });
      } finally {
        setIsRedeeming(false);
      }
    } else {
      setRedeemStep(step + 1);
      setRedeemData({ ...redeemData, ...data });
    }
  };

  const handleProfileSubmit = (data: ProfileData) => {
    setProfileData(data);
    setShowProfile(false);
    setShowProfileSuccess(true);
  };

  const handleLogout = async () => {
    localStorage.removeItem('welcomeShown');
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-xl text-primary-800">
                GreenAfrica
              </h1>
              <p className="text-sm text-gray-600">Welcome back, {greenAfricaUser?.displayName || 'User'}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Green ID</p>
                <p className="text-sm text-primary-600 font-mono">{greenAfricaUser?.greenId || 'Loading...'}</p>
              </div>
              <button
                title='Logout'
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Points Overview */}
        <div className="impact-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-semibold text-2xl text-primary-800">
                Your Green Points
              </h2>
              <p className="text-gray-600">Keep recycling to earn more!</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-primary-700">{greenAfricaUser?.totalPoints || 0}</p>
              <p className="text-sm text-gray-600">Total Points</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowRedeem(true)}
              className="btn-primary flex-1"
            >
              Redeem Points
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="btn-secondary flex-1"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Referral Section */}
        {greenAfricaUser && (
          <ReferralCard
            referralCode={greenAfricaUser.referralCode}
            totalReferrals={totalReferrals}
            referralPoints={totalReferralPoints}
          />
        )}

        {/* Activity History */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-xl text-gray-900">
              Recent Activity
            </h3>
            <button
              onClick={() => setShowWelcome(true)}
              className="btn-ghost text-sm"
            >
              How it Works
            </button>
          </div>
          
          <div className="space-y-3">
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="ml-3 text-gray-600">Loading activities...</p>
              </div>
            ) : transactions.length > 0 ? (
              transactions.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.type === 'earned' ? 'bg-success-100 text-success-600' :
                      item.type === 'redeemed' ? 'bg-warning-100 text-warning-600' :
                      'bg-primary-100 text-primary-600'
                    }`}>
                      {item.type === 'earned' ? '↗' : item.type === 'redeemed' ? '↙' : '👥'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.description}</p>
                      <p className="text-sm text-gray-600">
                        {item.date?.toDate()?.toLocaleDateString()} {item.location && `• ${item.location}`}
                        {item.phone && `• ${item.phone}`}
                        {item.referral && `• ${item.referral}`}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    item.amount > 0 ? 'text-success-600' : 'text-warning-600'
                  }`}>
                    {item.amount > 0 ? '+' : ''}{item.amount}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">No activities yet</h4>
                <p className="text-gray-500 mb-4">Start earning points by recycling bottles at our reverse vending machines!</p>
                <button
                  onClick={() => setShowWelcome(true)}
                  className="btn-primary"
                >
                  Learn How it Works
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <WelcomeModal 
        isOpen={showWelcome} 
        onClose={handleWelcomeComplete} 
      />
      
      <RedeemPointsModal 
        isOpen={showRedeem} 
        onClose={() => {
          setShowRedeem(false);
          setRedeemStep(1);
          setRedeemData({ type: '', phone: '', amount: '', points: 0 });
        }}
        step={redeemStep}
        data={redeemData}
        userPoints={greenAfricaUser?.totalPoints || 0}
        onSubmit={handleRedeemSubmit}
        isRedeeming={isRedeeming}
      />
      
      <ProfileModal 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)}
        data={profileData}
        onSubmit={handleProfileSubmit}
      />
      
      <SuccessModal 
        isOpen={showRedeemSuccess}
        onClose={() => setShowRedeemSuccess(false)}
        title="Redemption Successful!"
        message="Your airtime has been sent successfully."
        details={redemptionResult?.transactionId ? `Transaction ID: ${redemptionResult.transactionId}` : undefined}
      />

      <ErrorModal 
        isOpen={showRedeemError}
        onClose={() => {
          setShowRedeemError(false);
          setRedemptionError('');
        }}
        title="Redemption Failed"
        message={redemptionError}
      />
      
      <SuccessModal 
        isOpen={showProfileSuccess}
        onClose={() => setShowProfileSuccess(false)}
        title="Profile Updated!"
        message="Your profile information has been updated successfully."
      />

      <PointsEarnedModal 
        isOpen={showPointsEarned}
        onClose={() => setShowPointsEarned(false)}
        points={earnedPoints}
        rewardCode={rewardCode}
        addingPoints={addingPoints}
      />

      {/* RewardHandler wrapped in Suspense */}
      <Suspense fallback={null}>
        <RewardHandler onShowPointsEarned={handleShowPointsEarned} />
      </Suspense>
    </div>
  );
}

// Main Dashboard Page component with Suspense wrapper
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

// Welcome Modal Component
function WelcomeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Welcome to GreenAfrica!",
      content: "Turn your plastic bottles into instant rewards while helping the environment.",
      icon: "🌍"
    },
    {
      title: "How It Works",
      content: "Find a reverse vending machine, scan your Green ID, and drop your PEP bottles.",
      icon: "♻️"
    },
    {
      title: "Earn Points",
      content: "Get Green Points for every bottle you recycle. Watch your impact grow!",
      icon: "✨"
    },
    {
      title: "Redeem Rewards",
      content: "Convert your points to airtime, data, or other amazing rewards.",
      icon: "🎁"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} showCloseButton={false} size="lg">
      <div className="text-center">
        <div className="text-6xl mb-6">{slides[currentSlide].icon}</div>
        <h3 className="font-display font-bold text-2xl text-primary-800 mb-4">
          {slides[currentSlide].title}
        </h3>
        <p className="text-gray-600 mb-8 text-lg">
          {slides[currentSlide].content}
        </p>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <div className="flex gap-4">
          {currentSlide > 0 && (
            <button onClick={prevSlide} className="btn-secondary flex-1">
              Previous
            </button>
          )}
          <button onClick={nextSlide} className="btn-primary flex-1">
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// Redeem Points Modal Component
function RedeemPointsModal({ 
  isOpen, 
  onClose, 
  step, 
  userPoints,
  onSubmit,
  isRedeeming = false
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  step: number;
  data: RedeemData;
  userPoints: number;
  onSubmit: (step: number, data: Partial<RedeemData>) => void;
  isRedeeming?: boolean;
}) {
  const [formData, setFormData] = useState({ type: '', phone: '', amount: '', points: 0, network: '', detectedNetwork: '' });
  const [customAmount, setCustomAmount] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [amountError, setAmountError] = useState('');

  // Import phone utilities (we'll assume they're available globally or import them)
  const detectNetwork = (phone: string) => {
    // This is a simplified version - in real implementation, import from utils
    const cleaned = phone.replace(/\D/g, '');
    const formatted = cleaned.startsWith('234') && cleaned.length === 13 
      ? '0' + cleaned.substring(3) 
      : cleaned.length === 10 && !cleaned.startsWith('0') 
      ? '0' + cleaned 
      : cleaned;

    if (formatted.length !== 11 || !formatted.startsWith('0')) return null;

    const prefix = formatted.substring(0, 4);
    const networks = {
      'MTN': ['0703', '0706', '0803', '0806', '0810', '0813', '0814', '0816', '0903', '0906', '0913', '0916'],
      'GLO': ['0705', '0805', '0807', '0811', '0815', '0905', '0915'],
      'AIRTEL': ['0701', '0708', '0802', '0808', '0812', '0901', '0902', '0904', '0907', '0912'],
      '9MOBILE': ['0809', '0817', '0818', '0908', '0909'],
      'NTEL': ['0804']
    };

    for (const [network, prefixes] of Object.entries(networks)) {
      if (prefixes.includes(prefix)) return network;
    }
    return null;
  };

  const rewardTypes = [
    { id: 'airtime', name: 'Airtime', icon: '📞', minPoints: 50, desc: '1:1 conversion (100 points = ₦100)' },
    { id: 'data', name: 'Data', icon: '📱', minPoints: 75, desc: 'Coming soon' }
  ];

  const quickAmounts = [50, 100, 200, 500, 1000, 2000];

  const handlePhoneChange = (phone: string) => {
    setFormData(prev => ({ ...prev, phone }));
    setPhoneError('');
    
    if (phone.length >= 10) {
      const detected = detectNetwork(phone);
      setFormData(prev => ({ 
        ...prev, 
        detectedNetwork: detected || '',
        network: detected || prev.network 
      }));
    }
  };

  const handleAmountChange = (value: string | number) => {
    const amount = typeof value === 'string' ? parseInt(value) : value;
    if (amount < 50 || amount > 5000) {
      setAmountError('Amount must be between ₦50 and ₦5000');
    } else {
      setAmountError('');
    }
    setFormData(prev => ({ ...prev, amount: amount.toString(), points: amount }));
  };

  const handleSubmit = (stepData: Partial<RedeemData>) => {
    onSubmit(step, { ...formData, ...stepData });
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Redeem Points" size="lg">
      {step === 1 && (
        <div>
          <p className="text-gray-600 mb-6">Choose what you&apos;d like to redeem your points for:</p>
          <div className="grid grid-cols-2 gap-4">
            {rewardTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setFormData({ ...formData, type: type.id });
                  handleSubmit({ type: type.id });
                }}
                className={`p-6 border-2 rounded-lg transition-colors duration-200 ${
                  userPoints < type.minPoints 
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                    : 'border-gray-200 hover:border-primary-400 hover:bg-primary-50'
                }`}
                disabled={userPoints < type.minPoints}
              >
                <div className="text-4xl mb-3">{type.icon}</div>
                <h4 className="font-semibold text-lg mb-2">{type.name}</h4>
                <p className="text-sm text-gray-600">Min {type.minPoints} points</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && formData.type === 'airtime' && (
        <div className="space-y-6">
          <div>
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="08012345678"
              className={`input-field ${phoneError ? 'border-red-300 focus:border-red-500' : ''}`}
              required
            />
            {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
            
            {formData.detectedNetwork && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                <span className="text-green-700">✓ Detected network: {formData.detectedNetwork}</span>
              </div>
            )}
          </div>

          {(!formData.detectedNetwork || formData.phone.length < 10) && (
            <div>
              <label className="form-label">Select Network (if detection fails)</label>
              <select
                value={formData.network}
                onChange={(e) => setFormData(prev => ({ ...prev, network: e.target.value }))}
                className="input-field"
              >
                <option value="">Choose network...</option>
                <option value="MTN">MTN</option>
                <option value="GLO">GLO</option>
                <option value="AIRTEL">AIRTEL</option>
                <option value="9MOBILE">9MOBILE</option>
                <option value="NTEL">NTEL</option>
              </select>
            </div>
          )}
          
          <div>
            <label className="form-label">Select Amount (₦50 - ₦5000)</label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAmountChange(amount)}
                  className={`p-3 border-2 rounded-lg transition-colors duration-200 ${
                    userPoints < amount
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                      : parseInt(formData.amount) === amount
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-400'
                  }`}
                  disabled={userPoints < amount}
                >
                  <div className="font-semibold">₦{amount}</div>
                  <div className="text-xs text-gray-600">{amount} pts</div>
                </button>
              ))}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Amount</label>
              <input
                type="number"
                min="50"
                max="5000"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  if (e.target.value) {
                    handleAmountChange(e.target.value);
                  }
                }}
                placeholder="Enter amount (50-5000)"
                className={`input-field ${amountError ? 'border-red-300 focus:border-red-500' : ''}`}
              />
              {amountError && <p className="text-red-500 text-sm mt-1">{amountError}</p>}
              <p className="text-sm text-gray-500 mt-1">1:1 conversion - {formData.amount ? parseInt(formData.amount) : 0} points required</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => onSubmit(0, {})} className="btn-secondary flex-1">
              Back
            </button>
            <button 
              onClick={() => handleSubmit({})}
              disabled={!formData.phone || !formData.amount || (!formData.detectedNetwork && !formData.network) || !!amountError || !!phoneError}
              className="btn-primary flex-1"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && formData.type === 'data' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚧</div>
          <h4 className="font-semibold text-gray-900 mb-2">Data Redemption Coming Soon</h4>
          <p className="text-gray-500 mb-6">Data redemption feature is currently under development.</p>
          <button onClick={() => onSubmit(0, {})} className="btn-secondary">
            Back to Selection
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h4 className="font-semibold text-lg mb-4">Confirm Your Redemption</h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-medium capitalize">{formData.type}</span>
            </div>
            <div className="flex justify-between">
              <span>Phone:</span>
              <span className="font-medium">{formData.phone}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-medium">{formData.amount}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Points to use:</span>
              <span className="text-primary-600">{formData.points}</span>
            </div>
          </div>

          {isRedeeming && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <p className="text-blue-700 font-medium">Processing your redemption...</p>
              </div>
              <p className="text-blue-600 text-sm mt-1">Please wait while we process your airtime request.</p>
            </div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={() => onSubmit(1, {})} 
              className="btn-secondary flex-1"
              disabled={isRedeeming}
            >
              Back
            </button>
            <button 
              onClick={() => handleSubmit({})} 
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={isRedeeming}
            >
              {isRedeeming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                'Confirm Redemption'
              )}
            </button>
          </div>
        </div>
      )}
    </BaseModal>
  );
}

// Profile Modal Component
function ProfileModal({ isOpen, onClose, data, onSubmit }: { 
  isOpen: boolean; 
  onClose: () => void; 
  data: ProfileData;
  onSubmit: (data: ProfileData) => void;
}) {
  const [formData, setFormData] = useState<ProfileData>(data);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            placeholder='John Doe'
            required
          />
        </div>
        
        <div>
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="input-field"
            placeholder='+234 800 000 0000'
            required
          />
        </div>
        
        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input-field"
            placeholder='john@example.com'
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1">
            Save Changes
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// Points Earned Modal Component
function PointsEarnedModal({ isOpen, onClose, points, rewardCode, addingPoints }: {
  isOpen: boolean;
  onClose: () => void;
  points: number;
  rewardCode: string;
  addingPoints: boolean;
}) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} showCloseButton={false} size="lg">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="text-4xl">🎉</div>
        </div>
        <h3 className="font-display font-bold text-2xl text-primary-800 mb-2">
          Congratulations!
        </h3>
        <p className="text-gray-600 mb-6 text-lg">
          You have earned <span className="font-bold text-primary-600">{points} points</span>
        </p>
        
        <div className="bg-primary-50 p-4 rounded-lg mb-8">
          <p className="text-sm text-gray-600 mb-1">Reward Code</p>
          <p className="font-mono text-primary-700 font-semibold">{rewardCode}</p>
        </div>
        
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">
            Your points have been added to your account and will appear in your recent activities.
          </p>
        </div>

        <button onClick={onClose} className="btn-primary" disabled={addingPoints}>
          {addingPoints ? 'Adding Points...' : 'Continue to Dashboard'}
        </button>
      </div>
    </BaseModal>
  );
}

// Success Modal Component
function SuccessModal({ isOpen, onClose, title, message, details }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  details?: string;
}) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <div className="text-center">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display font-semibold text-xl text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-4">{message}</p>
        {details && (
          <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-50 p-2 rounded">
            {details}
          </p>
        )}
        <button onClick={onClose} className="btn-primary">
          Continue
        </button>
      </div>
    </BaseModal>
  );
}

// Error Modal Component
function ErrorModal({ isOpen, onClose, title, message }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="font-display font-semibold text-xl text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <button onClick={onClose} className="btn-primary">
          Try Again
        </button>
      </div>
    </BaseModal>
  );
}
