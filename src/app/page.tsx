'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { extractReferralCode, storeReferralCode, isValidReferralCodeFormat } from '@/lib/utils/referral';
import Image from 'next/image';

// Image imports based on Figma extraction
const imgPersonHoldingRecyclingBinFullPlasticBottles1 = "/033bc39ae008769ea0344bb76b69a8b474dd3383.png";
const imgCloseUpPersonHandHoldingGlassBottle1 = "/rvm-box.png";
const imgScreenshot20250901At1617421 = "/722de87e30bf7b63ec913e46f333e1f6443613b9.png";
const imgGroup = "/7e3f647a112eb76039ddd32806f5db04c6717f3c.svg";
const imgGroup1 = "/1d729100fabe9daa7ab6847ee7c1e76487aa5864.svg";
const imgRecycle = "/d0291353124f60d1f353c15dac39e8f363977222.svg";
const imgDeviceMobile = "/2f1ab8ebe22ac9af46990166b27d574b8d4d17bb.svg";
const imgRecycle1 = "/d81dc3776f492fc2c2d92c415f047201df643510.svg";
const imgBeerBottle = "/970a1b0eb73528d093feda687b5f057422b0dac6.svg";
const imgSealCheck = "/140da9d13c33d09313e144de560f47424d1e10fb.svg";
const imgGift = "/fe5fd71d5bffde300b948e97b04ba095af8da7f2.svg";
const imgFlowerLotus = "/12fdf0e2f4e0d616659c4e57aac335fab4bd3e0d.svg";
const imgBeerBottle1 = "/91c89364533bf95c3f5e2c9363f4e24766d521f7.svg";
const imgRecycle2 = "/ca4db25f15667316576a46b13cf4164080b1e7db.svg";
const imgWind = "/105707e39679039c99f4f576403ea55e474bd675.svg";
const imgDatabase = "/1d7f874398c93ef553276025636ef71a8010f8f9.svg";
const imgDeviceTabletSpeaker = "/632d9b84963d25e6016a00fedac7ff76a3983975.svg";
const imgMapPinArea = "/46e3c67c2e31719f61d645342ec378562d9b8f3c.svg";
const imgShippingContainer = "/fc04426d8c3dbe40684d49abd0bc332ceddb05e2.svg";
const imgGroup2 = "/985d925fd2f3760e185da35d687afbd9602fb471.svg";
const imgGroup3 = "/a1aa7779199dd56e5453d6b77e402225e4b6db6d.svg";

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
    <div className="bg-white flex flex-col items-start relative min-h-screen w-full">
      {/* Referral Notification */}
      {referralMessage && (
        <div className="bg-primary-600 text-white py-3 px-4 text-center w-full">
          <div className="max-w-4xl mx-auto">
            <p className="font-medium">{referralMessage}</p>
            <p className="text-sm text-primary-100 mt-1">Redirecting to sign up...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="h-[70px] md:h-[90px] relative w-full border-b border-[#e2e1e1]">
        <div className="h-full relative w-full flex items-center px-4 md:px-[64px]">
          <div className="flex items-center gap-3">
            <div className="w-[35px] md:w-[52px] h-[35px] md:h-[52px] relative">
              <Image alt="GreenAfrica Logo" className="block w-full h-full object-contain" src={imgGroup} width={52} height={52} />
            </div>
            <div className="w-[100px] md:w-[129px] h-[14px] md:h-[18px] relative">
              <Image alt="GreenAfrica" className="block w-full h-full object-contain" src={imgGroup1} width={129} height={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full py-8 md:py-16 lg:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col gap-4 md:gap-6 items-center mb-8 md:mb-12">
            <h1 className="font-bold text-[#1e1e1e] text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight md:leading-none">
              <span>Turn PEP into </span>
              <span className="text-[#2e7d33]">airtime/data</span>
              <span> for verified recycling</span>
            </h1>
            <p className="font-normal text-[#474747] text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed">
              Drop PEP bottles at our smart bin. We log deposits onchain and you redeem instant airtime/data as a reward for been ecofriendly. Hosts can request our smart bin in high traffic location.
            </p>
          </div>
          <button 
            onClick={() => router.push('/login')}
            className="bg-[#2e7d33] flex gap-2 items-center justify-center px-6 py-4 md:px-8 md:py-4 rounded-lg hover:bg-[#1b5e20] transition-colors duration-200 mx-auto text-base md:text-lg font-semibold text-white min-h-[44px]"
          >
            <Image alt="" className="w-5 h-5 md:w-6 md:h-6" src={imgRecycle} width={24} height={24} />
            <span>Start recycling</span>
          </button>
        </div>
        <div className="bg-[#e8f3e9] mt-12 md:mt-16 lg:mt-20 rounded-2xl overflow-hidden mx-auto max-w-6xl aspect-[16/10] md:aspect-[2/1]">
          <Image 
            alt="Person holding recycling bin full of plastic bottles" 
            className="w-full h-full object-cover" 
            src={imgPersonHoldingRecyclingBinFullPlasticBottles1} 
            width={1100} 
            height={770} 
          />
        </div>
      </div>

      {/* How it works Section */}
      <div className="w-full py-12 md:py-20 px-4">
        <h2 className="font-bold text-[#1e1e1e] text-2xl md:text-3xl lg:text-4xl text-center mb-8 md:mb-16">
          How it works
        </h2>
        <div className="max-w-7xl mx-auto">
          <div className="lg:hidden mb-8">
            <div className="bg-[#e8f3e9] rounded-2xl overflow-hidden aspect-[4/3] max-w-md mx-auto">
              <Image 
                alt="Close up person hand holding glass bottle" 
                className="w-full h-full object-cover" 
                src={imgCloseUpPersonHandHoldingGlassBottle1} 
                width={599} 
                height={695} 
              />
            </div>
          </div>
          <div className="lg:flex lg:gap-8 xl:gap-12 lg:items-start">
            <div className="hidden lg:block bg-[#e8f3e9] rounded-2xl overflow-hidden lg:w-1/2 xl:w-2/5 aspect-[4/5]">
              <Image 
                alt="Close up person hand holding glass bottle" 
                className="w-full h-full object-cover" 
                src={imgCloseUpPersonHandHoldingGlassBottle1} 
                width={599} 
                height={695} 
              />
            </div>
            <div className="lg:w-1/2 xl:w-3/5 flex flex-col gap-3 md:gap-4">
            {[
              {
                icon: imgDeviceMobile,
                title: "Onboard",
                description: "Download, verify phone/email, choose a username and the app creates your Green ID."
              },
              {
                icon: imgRecycle1,
                title: "Recycle",
                description: "At a participating location, enter or scan your Green ID on the machine's tablet to start a session."
              },
              {
                icon: imgBeerBottle,
                title: "Drop bottles",
                description: "The camera records 30‑second segments while you recycle; the app can notify you live."
              },
              {
                icon: imgSealCheck,
                title: "Verification",
                description: "AI confirms bottles are PEP and counts them."
              },
              {
                icon: imgGift,
                title: "Rewards",
                description: "Green Points land in your wallet. Convert to airtime or data in a tap."
              },
              {
                icon: imgFlowerLotus,
                title: "Grow your impact",
                description: "Track bottles, CO₂ saved, badges, and referrals that earn bonus points."
              }
            ].map((step, index) => (
              <div key={index} className="bg-white rounded-xl w-full border border-[#e7f6e8] shadow-sm">
                <div className="flex gap-4 md:gap-6 items-start p-4 md:p-6">
                  <div className="bg-[#ecfced] rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center flex-shrink-0">
                    <Image alt="" className="w-5 h-5 md:w-6 md:h-6" src={step.icon} width={24} height={24} />
                  </div>
                  <div className="flex flex-col gap-2 md:gap-3 flex-1 min-w-0">
                    <h3 className="font-bold text-[#1e1e1e] text-lg md:text-xl">
                      {step.title}
                    </h3>
                    <p className="font-normal text-[#666c66] text-sm md:text-base leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* Impacts so far Section */}
      <div className="w-full py-12 md:py-20 px-4 bg-gray-50">
        <h2 className="font-bold text-[#1e1e1e] text-2xl md:text-3xl lg:text-4xl text-center mb-8 md:mb-16">
          Impacts so far
        </h2>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 lg:mb-8">
            {[
              { icon: imgBeerBottle1, label: "Bottles collected", value: "6,000" },
              { icon: imgRecycle2, label: "PEP diverted (kg)", value: "2" },
              { icon: imgWind, label: "CO2 saved (t)", value: "3,000" }
            ].map((stat, index) => (
              <div key={index} className="bg-white flex gap-4 md:gap-6 items-center p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-[#ecfced] rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center flex-shrink-0">
                  <Image alt="" className="w-5 h-5 md:w-6 md:h-6" src={stat.icon} width={24} height={24} />
                </div>
                <div className="flex flex-col gap-2 min-w-0">
                  <p className="font-medium text-[#696565] text-sm md:text-base">
                    {stat.label}
                  </p>
                  <p className="font-bold text-[#1e1e1e] text-xl md:text-2xl leading-none">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: imgDatabase, label: "Airtime/data paid", value: "7" },
              { icon: imgDeviceTabletSpeaker, label: "Devices deployed", value: "2" },
              { icon: imgMapPinArea, label: "Active locations", value: "3,000" }
            ].map((stat, index) => (
              <div key={index} className="bg-white flex gap-4 md:gap-6 items-center p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-[#ecfced] rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center flex-shrink-0">
                  <Image alt="" className="w-5 h-5 md:w-6 md:h-6" src={stat.icon} width={24} height={24} />
                </div>
                <div className="flex flex-col gap-2 min-w-0">
                  <p className="font-medium text-[#696565] text-sm md:text-base">
                    {stat.label}
                  </p>
                  <p className="font-bold text-[#1e1e1e] text-xl md:text-2xl leading-none">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active locations Section */}
      <div className="w-full py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center mb-8 md:mb-12">
          <h2 className="font-bold text-[#1e1e1e] text-2xl md:text-3xl lg:text-4xl mb-4 md:mb-6 leading-tight">
            Active locations of our Vending Machine
          </h2>
          <a href="#" className="inline-block font-semibold text-[#2e7d33] text-base md:text-lg underline hover:text-[#1b5e20] transition-colors duration-200 min-h-[44px] py-2">
            Request a device
          </a>
        </div>
        <div className="bg-[#e8f3e9] rounded-2xl max-w-6xl mx-auto relative overflow-hidden aspect-[16/9] md:aspect-[2/1]">
          <Image 
            alt="Map showing active locations" 
            className="w-full h-full object-cover" 
            src={imgScreenshot20250901At1617421} 
            width={1210} 
            height={504} 
          />
          {/* Device markers */}
          {[
            { left: '205px', top: '263px' },
            { left: '885px', top: '48px' },
            { left: '817px', top: '305px' },
            { left: '681px', top: '423px' }
          ].map((position, index) => (
            <div 
              key={index} 
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: position.left, top: position.top }}
            >
              <div className="transform rotate-[92.651deg]">
                <Image alt="Device location" className="w-[40px] h-[40px]" src={imgShippingContainer} width={40} height={40} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#113013] w-full py-6 md:py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-[35px] md:w-[45px] h-[35px] md:h-[45px] relative">
              <Image alt="GreenAfrica Logo" className="block w-full h-full object-contain" src={imgGroup2} width={45} height={45} />
            </div>
            <div className="w-[100px] md:w-[120px] h-[14px] md:h-[16px] relative">
              <Image alt="GreenAfrica" className="block w-full h-full object-contain" src={imgGroup3} width={120} height={16} />
            </div>
          </div>
          <p className="font-medium text-[#e8f3e9] text-sm text-center sm:text-right">
            © 2025 GreenAfrica. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
