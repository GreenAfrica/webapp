'use client';

import { useState } from 'react';
import BaseModal from '@/components/shared/BaseModal';
import { RedeemData } from '../../hooks/useRedemption';

interface RedeemPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: number;
  data: RedeemData;
  userPoints: number;
  onSubmit: (step: number, data: Partial<RedeemData>) => void;
  isRedeeming: boolean;
  detectNetwork: (phone: string) => string | null;
}

export function RedeemPointsModal({
  isOpen,
  onClose,
  step,
  data,
  userPoints,
  onSubmit,
  isRedeeming,
  detectNetwork
}: RedeemPointsModalProps) {
  const [formData, setFormData] = useState(data);
  const [customAmount, setCustomAmount] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [amountError, setAmountError] = useState('');

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
                value={formData.network || ''}
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
