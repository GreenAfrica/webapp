'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BaseModal from '@/components/shared/BaseModal';
import { useAuth } from '@/hooks/useAuth';
import { useUserTransactions, useRedemptions } from '@/hooks/useFirestore';
import { useReferrals } from '@/hooks/useReferrals';
import ReferralCard from '@/components/shared/ReferralCard';

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

// Mock user data
const mockUser = {
  name: 'John Doe',
  greenId: 'GRN-2024-001',
  totalPoints: 1247,
  referralCode: 'JOHN2024',
  referralPoints: 150,
  phone: '+234 800 123 4567',
  email: 'john@example.com'
};

const mockHistory = [
  { id: 1, type: 'earned', amount: 25, description: 'Bottles recycled at Mall', date: '2024-01-15', location: 'Ikeja Mall' },
  { id: 2, type: 'redeemed', amount: -100, description: '₦200 Airtime', date: '2024-01-14', phone: '+234 800 123 4567' },
  { id: 3, type: 'earned', amount: 15, description: 'Bottles recycled', date: '2024-01-13', location: 'University Campus' },
  { id: 4, type: 'referral', amount: 50, description: 'Friend joined via referral', date: '2024-01-12', referral: 'Sarah M.' },
  { id: 5, type: 'earned', amount: 30, description: 'Bottles recycled', date: '2024-01-11', location: 'Shopping Center' },
];

export default function DashboardPage() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showRedeemSuccess, setShowRedeemSuccess] = useState(false);
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [redeemStep, setRedeemStep] = useState(1);
  const [redeemData, setRedeemData] = useState({
    type: '',
    phone: '',
    amount: '',
    points: 0
  });
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [copied, setCopied] = useState(false);

  // Firebase hooks - all hooks must be called before any early returns
  const { user, greenAfricaUser, signOut, updateProfile, loading } = useAuth();
  const { transactions, loading: transactionsLoading } = useUserTransactions();
  const { redeemPoints } = useRedemptions();
  const { totalReferrals, totalReferralPoints } = useReferrals(user?.uid);
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

  const handleCopyReferral = () => {
    const referralLink = `https://greenafrica.earth/login?ref=${mockUser.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeemSubmit = (step: number, data: Partial<RedeemData>) => {
    if (step === 3) {
      // Final submission
      setShowRedeem(false);
      setShowRedeemSuccess(true);
      setRedeemStep(1);
      setRedeemData({ type: '', phone: '', amount: '', points: 0 });
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

  const handleLogout = () => {
    localStorage.removeItem('welcomeShown');
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
                onClick={async () => {
                  localStorage.removeItem('welcomeShown');
                  await signOut();
                  router.push('/login');
                }}
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
            {mockHistory.map((item) => (
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
                      {item.date} {item.location && `• ${item.location}`}
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
            ))}
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
        userPoints={mockUser.totalPoints}
        onSubmit={handleRedeemSubmit}
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
        message="Your airtime/data has been sent successfully."
        details={`Transaction ID: TXN-${Date.now()}`}
      />
      
      <SuccessModal 
        isOpen={showProfileSuccess}
        onClose={() => setShowProfileSuccess(false)}
        title="Profile Updated!"
        message="Your profile information has been updated successfully."
      />
    </div>
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
  onSubmit 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  step: number;
  data: RedeemData;
  userPoints: number;
  onSubmit: (step: number, data: Partial<RedeemData>) => void;
}) {
  const [formData, setFormData] = useState({ type: '', phone: '', amount: '', points: 0 });

  const rewardTypes = [
    { id: 'airtime', name: 'Airtime', icon: '📞', minPoints: 50 },
    { id: 'data', name: 'Data', icon: '📱', minPoints: 75 }
  ];

  const amountOptions = {
    airtime: [
      { amount: '₦100', points: 50 },
      { amount: '₦200', points: 100 },
      { amount: '₦500', points: 250 },
      { amount: '₦1000', points: 500 }
    ],
    data: [
      { amount: '500MB', points: 75 },
      { amount: '1GB', points: 150 },
      { amount: '2GB', points: 280 },
      { amount: '5GB', points: 650 }
    ]
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

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+234 800 000 0000"
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="form-label">Select Amount</label>
            <div className="grid grid-cols-2 gap-3">
              {amountOptions[formData.type as keyof typeof amountOptions]?.map((option) => (
                <button
                  key={option.amount}
                  onClick={() => {
                    setFormData({ ...formData, amount: option.amount, points: option.points });
                  }}
                  className={`p-4 border-2 rounded-lg transition-colors duration-200 ${
                    userPoints < option.points
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                      : formData.amount === option.amount
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-400'
                  }`}
                  disabled={userPoints < option.points}
                >
                  <div className="font-semibold">{option.amount}</div>
                  <div className="text-sm text-gray-600">{option.points} points</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => onSubmit(0, {})} className="btn-secondary flex-1">
              Back
            </button>
            <button 
              onClick={() => handleSubmit({})}
              disabled={!formData.phone || !formData.amount}
              className="btn-primary flex-1"
            >
              Continue
            </button>
          </div>
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

          <div className="flex gap-4">
            <button onClick={() => onSubmit(1, {})} className="btn-secondary flex-1">
              Back
            </button>
            <button onClick={() => handleSubmit({})} className="btn-primary flex-1">
              Confirm Redemption
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
