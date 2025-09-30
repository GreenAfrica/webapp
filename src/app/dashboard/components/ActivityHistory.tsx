'use client';

import { Transaction } from '@/lib/firebase/firestore';

interface ActivityHistoryProps {
  transactions: Transaction[];
  loading: boolean;
  onLearnHowItWorks: () => void;
}

export function ActivityHistory({ transactions, loading, onLearnHowItWorks }: ActivityHistoryProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-xl text-gray-900">
            Recent Activity
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="ml-3 text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-xl text-gray-900">
          Recent Activity
        </h3>
        <button
          onClick={onLearnHowItWorks}
          className="btn-ghost text-sm"
        >
          How it Works
        </button>
      </div>
      
      <div className="space-y-3">
        {transactions.length > 0 ? (
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
              onClick={onLearnHowItWorks}
              className="btn-primary"
            >
              Learn How it Works
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
