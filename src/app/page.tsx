
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { extractReferralCode, storeReferralCode, isValidReferralCodeFormat } from '@/lib/utils/referral';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [referralMessage, setReferralMessage] = useState<string | null>(null);

  // Handle referral code from URL parameters
  useEffect(() => {
    if (searchParams) {
      const referralCode = extractReferralCode(searchParams);
      if (referralCode && isValidReferralCodeFormat(referralCode)) {
        // Store referral code for later use during signup
        storeReferralCode(referralCode);
        
        // Show welcome message
        setReferralMessage(`🎉 You've been referred by a friend! Sign up now to start earning Green Points together!`);
        
        // Log for debugging
        console.log('Referral code detected and stored:', referralCode);
        
        // Auto-redirect to login after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else if (referralCode) {
        // Invalid referral code format
        console.warn('Invalid referral code format:', referralCode);
      }
    }
  }, [searchParams, router]);

  return (
    <main className="min-h-screen">
      {/* Referral Notification */}
      {referralMessage && (
        <div className="bg-primary-600 text-white py-3 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <p className="font-medium">{referralMessage}</p>
            <p className="text-sm text-primary-100 mt-1">Redirecting to sign up...</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-primary-800 mb-6">
            Turn Recycling Into 
            <span className="text-gradient-primary"> Instant Rewards</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Drop plastic bottles, earn Green Points, redeem airtime and data while making a positive environmental impact. Join the recycling revolution today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary text-lg px-8 py-4">
              Get Started Today
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              Find Locations
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-700 mb-2">10,000+</div>
              <div className="text-gray-600">Bottles Recycled</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-700 mb-2">500kg</div>
              <div className="text-gray-600">CO₂ Saved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-700 mb-2">50+</div>
              <div className="text-gray-600">Active Locations</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="mb-4">Download & Register</h3>
              <p className="text-gray-600">
                Get the GreenAfrica app, verify your phone and create your unique Green ID to start recycling.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">♻️</span>
              </div>
              <h3 className="mb-4">Drop & Earn</h3>
              <p className="text-gray-600">
                Find a reverse vending machine, scan your Green ID, and drop your PEP bottles to earn points instantly.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="mb-4">Redeem Rewards</h3>
              <p className="text-gray-600">
                Convert your Green Points to airtime, data, or other rewards with just a few taps in the app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Impact Dashboard */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center mb-12">Your Impact Dashboard</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="impact-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-xl text-primary-800">
                  This Month
                </h3>
                <div className="badge-success">Active</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-primary-700">247</p>
                  <p className="text-sm text-gray-600">Bottles Recycled</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary-700">12.3kg</p>
                  <p className="text-sm text-gray-600">CO₂ Saved</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 className="font-display font-semibold text-xl text-gray-800 mb-4">
                Available Rewards
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">₦200 Airtime</p>
                    <p className="text-sm text-gray-600">100 Green Points</p>
                  </div>
                  <button className="btn-ghost">Redeem</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">1GB Data</p>
                    <p className="text-sm text-gray-600">150 Green Points</p>
                  </div>
                  <button className="btn-ghost">Redeem</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-white mb-6">Ready to Start Making an Impact?</h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already earning rewards while helping the environment. Download the app and find your nearest location today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-700 hover:bg-gray-100 font-medium px-8 py-4 rounded-lg transition-colors duration-200">
              Download App
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-primary-700 font-medium px-8 py-4 rounded-lg transition-colors duration-200">
              Find Locations
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-white mb-4">GreenAfrica</h3>
          <p className="text-gray-400 mb-6">
            Making recycling rewarding, one bottle at a time.
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white">Contact Us</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
