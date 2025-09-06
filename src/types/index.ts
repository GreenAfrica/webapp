export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
}

export interface AuthContextType {
  user: User | null;
  greenAfricaUser: GreenAfricaUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  verifyPhoneCode: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (displayName?: string, phoneNumber?: string) => Promise<void>;
}

export interface GreenAfricaUser {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  greenId: string;
  totalPoints: number;
  referralCode: string;
  referralPoints: number;
  createdAt: any;
  updatedAt: any;
}

export interface Transaction {
  id?: string;
  userId: string;
  type: 'earned' | 'redeemed' | 'referral';
  amount: number;
  description: string;
  date: any;
  location?: string;
  phone?: string;
  referral?: string;
  metadata?: Record<string, any>;
}

export interface Referral {
  id?: string;
  referrerUid: string;
  referredUid: string;
  referralCode: string;
  pointsAwarded: number;
  createdAt: any;
  status: 'pending' | 'completed';
}

export interface RedemptionRequest {
  id?: string;
  userId: string;
  type: 'airtime' | 'data';
  amount: string;
  points: number;
  phone: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: any;
  completedAt?: any;
  transactionId?: string;
}

export interface PhoneVerificationState {
  confirmationResult: any;
  phoneNumber: string;
}
