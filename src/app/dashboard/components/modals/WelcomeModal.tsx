'use client';

import { useState } from 'react';
import BaseModal from '@/components/shared/BaseModal';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
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
