'use client';

import { useState } from 'react';
import { generateReferralLink, copyReferralLink, getReferralPoints } from '@/lib/utils/referral';

interface ReferralCardProps {
  referralCode: string;
  totalReferrals?: number;
  referralPoints?: number;
}

export default function ReferralCard({ referralCode, totalReferrals = 0, referralPoints = 0 }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleCopyLink = async () => {
    const success = await copyReferralLink(referralCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleShareLink = async () => {
    const referralLink = generateReferralLink(referralCode);
    const pointsPerReferral = getReferralPoints();

    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: 'Join GreenAfrica - Earn Green Points!',
          text: `🌱 Join me on GreenAfrica! Turn your recycling into instant rewards. Use my referral link and we both get ${pointsPerReferral} Green Points!`,
          url: referralLink,
        });
      } catch {
        console.log('Share cancelled or failed');
      } finally {
        setIsSharing(false);
      }
    } else {
      // Fallback to copy to clipboard
      await handleCopyLink();
    }
  };

  const referralLink = generateReferralLink(referralCode);
  const pointsPerReferral = getReferralPoints();

  return (
    <div className="impact-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-xl text-primary-800">
          Refer & Earn
        </h3>
        <div className="badge-success">
          {pointsPerReferral} points per referral
        </div>
      </div>

      <p className="text-gray-600 mb-4">
        Invite friends to join GreenAfrica! Both you and your friend will earn {pointsPerReferral} Green Points when they sign up using your referral link.
      </p>

      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-white rounded-lg border border-primary-100">
          <p className="text-2xl font-bold text-primary-700">{totalReferrals}</p>
          <p className="text-sm text-gray-600">Friends Referred</p>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-primary-100">
          <p className="text-2xl font-bold text-primary-700">{referralPoints}</p>
          <p className="text-sm text-gray-600">Points Earned</p>
        </div>
      </div>

      {/* Referral Code */}
      <div className="mb-4">
        <label className="form-label">Your Referral Code</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralCode}
            readOnly
            className="input-field text-center font-mono tracking-wider bg-gray-50"
          />
        </div>
      </div>

      {/* Referral Link */}
      <div className="mb-4">
        <label className="form-label">Your Referral Link</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="input-field text-sm bg-gray-50 flex-1"
          />
          <button
            onClick={handleCopyLink}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              copied
                ? 'bg-success-100 text-success-700 border border-success-200'
                : 'bg-primary-100 text-primary-700 border border-primary-200 hover:bg-primary-200'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share Button */}
      <button
        onClick={handleShareLink}
        disabled={isSharing}
        className="btn-primary w-full"
      >
        {isSharing ? (
          'Sharing...'
        ) : (
          <>
            <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Share Referral Link
          </>
        )}
      </button>

      {/* How it Works */}
      <div className="mt-4 p-3 bg-primary-25 rounded-lg border border-primary-100">
        <h4 className="font-medium text-primary-800 mb-2">How it works:</h4>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>1. Share your referral link with friends</li>
          <li>2. Friend signs up using your link</li>
          <li>3. Both of you earn {pointsPerReferral} Green Points!</li>
        </ul>
      </div>
    </div>
  );
}
