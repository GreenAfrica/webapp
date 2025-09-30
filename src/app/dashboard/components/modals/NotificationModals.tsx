'use client';

import { useState } from 'react';
import BaseModal from '@/components/shared/BaseModal';

interface ProfileData {
  name: string;
  phone: string;
  email: string;
}

// Profile Modal Component
interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProfileData;
  onSubmit: (data: ProfileData) => void;
}

export function ProfileModal({ isOpen, onClose, data, onSubmit }: ProfileModalProps) {
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
            placeholder="John Doe"
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
            placeholder="+234 800 000 0000"
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
            placeholder="john@example.com"
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
interface PointsEarnedModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
  rewardCode: string;
  isLoading?: boolean;
}

export function PointsEarnedModal({ isOpen, onClose, points, rewardCode, isLoading = false }: PointsEarnedModalProps) {
  if (isLoading) {
    return (
      <BaseModal isOpen={isOpen} onClose={() => {}} showCloseButton={false} size="lg">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
          <h3 className="font-display font-bold text-2xl text-primary-800 mb-2">
            Processing Your Reward
          </h3>
          <p className="text-gray-600 mb-6 text-lg">
            Minting <span className="font-bold text-primary-600">{points} Green Points</span> and recording on blockchain...
          </p>
          
          <div className="bg-primary-50 p-4 rounded-lg mb-8">
            <p className="text-sm text-gray-600 mb-1">Reward Code</p>
            <p className="font-mono text-primary-700 font-semibold">{rewardCode}</p>
          </div>
          
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">
              Please wait while we process your reward...
            </p>
          </div>

          <div className="flex justify-center">
            <div className="animate-pulse bg-gray-200 h-10 w-48 rounded-lg"></div>
          </div>
        </div>
      </BaseModal>
    );
  }

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
          You have earned <span className="font-bold text-primary-600">{points} Green Points</span>
        </p>
        
        <div className="bg-primary-50 p-4 rounded-lg mb-8">
          <p className="text-sm text-gray-600 mb-1">Reward Code</p>
          <p className="font-mono text-primary-700 font-semibold">{rewardCode}</p>
        </div>
        
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">
            Your Green Points have been minted on the blockchain and added to your account.
          </p>
        </div>

        <button onClick={onClose} className="btn-primary">
          Continue to Dashboard
        </button>
      </div>
    </BaseModal>
  );
}

// Success Modal Component
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  details?: string;
}

export function SuccessModal({ isOpen, onClose, title, message, details }: SuccessModalProps) {
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
interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function ErrorModal({ isOpen, onClose, title, message }: ErrorModalProps) {
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
