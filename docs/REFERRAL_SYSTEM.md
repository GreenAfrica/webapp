# GreenAfrica Referral System Documentation

## Overview

The GreenAfrica web app now includes a comprehensive referral link system that allows users to earn points when they successfully refer friends to the platform. The system is fully configurable through environment variables and integrates seamlessly with the existing Firebase backend.

## Features

### 🔗 Referral Links
- Users can generate and share referral links in the format: `https://greenafrica.earth/login?ref=THEIR_CODE`
- Links work on both landing page (`/`) and login page (`/login`)
- Automatic referral code detection and storage from URL parameters

### 🎯 Configurable Points System
- Referral points are configurable through environment variables
- Default: 50 points per successful referral
- Set `NEXT_PUBLIC_REFERRAL_POINTS=75` to award 75 points instead

### 📱 Enhanced Dashboard
- New `ReferralCard` component with sharing functionality
- Real-time referral statistics (total referrals, points earned)
- Copy-to-clipboard and native share API support
- Responsive design following UI guidelines

### 🔒 Validation & Security
- Referral code format validation (e.g., `JOHN2024123`)
- 24-hour expiry for stored referral codes
- Prevents self-referrals and duplicate processing

## Technical Implementation

### Environment Variables

Add to your `.env.local` file:
```bash
# Referral Configuration
NEXT_PUBLIC_REFERRAL_POINTS=50
```

### Database Schema

The system uses existing Firestore collections:

#### Users Collection
```typescript
interface GreenAfricaUser {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  greenId: string;
  totalPoints: number;
  referralCode: string;      // Auto-generated: "NAME2024XXX"
  referralPoints: number;    // Points earned from referrals
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Referrals Collection
```typescript
interface Referral {
  id?: string;
  referrerUid: string;       // Who sent the referral
  referredUid: string;       // Who was referred
  referralCode: string;      // The referral code used
  pointsAwarded: number;     // Points given to referrer
  createdAt: Timestamp;
  status: 'pending' | 'completed';
}
```

#### Transactions Collection
```typescript
interface Transaction {
  id?: string;
  userId: string;
  type: 'earned' | 'redeemed' | 'referral';
  amount: number;
  description: string;       // e.g., "Friend joined via referral (+50 points)"
  date: Timestamp;
  referral?: string;
  metadata?: Record<string, any>;
}
```

### Key Components

#### 1. Referral Utilities (`src/lib/utils/referral.ts`)
- `extractReferralCode()` - Extract referral code from URL params
- `storeReferralCode()` - Store referral code in localStorage
- `generateReferralLink()` - Create shareable referral links
- `copyReferralLink()` - Copy link to clipboard
- `getReferralPoints()` - Get configurable points value

#### 2. ReferralCard Component (`src/components/shared/ReferralCard.tsx`)
- Displays user's referral code and link
- Shows referral statistics
- Copy and share functionality
- Mobile-responsive design

#### 3. Firebase Functions (`src/lib/firebase/firestore.ts`)
- `processReferral()` - Process new referrals
- `getUserReferrals()` - Get user's referral history
- Updated to use configurable points from environment

#### 4. React Hooks (`src/hooks/useReferrals.ts`)
- `useReferrals()` - Fetch referral data and statistics

## User Flow

### 1. Sharing a Referral
1. User accesses dashboard and sees `ReferralCard`
2. User copies referral link or uses native share
3. Link format: `https://greenafrica.earth/login?ref=JOHN2024123`

### 2. Friend Visits Referral Link
1. Friend clicks referral link
2. Referral code is extracted from URL and stored in localStorage
3. Welcome message is displayed
4. Auto-redirect to login page (if on landing page)

### 3. Friend Signs Up
1. Friend completes sign-up process
2. System checks for stored referral code
3. If valid, processes referral:
   - Creates referral record
   - Awards points to referrer
   - Creates transaction record
   - Updates referrer's `referralPoints`

### 4. Points Award
1. Referrer receives configured points (default: 50)
2. Transaction shows: "Friend joined via referral (+50 points)"
3. Dashboard updates with new referral statistics

## URL Formats Supported

The system accepts referral codes from these URL patterns:
- `https://greenafrica.earth/?ref=CODE123`
- `https://greenafrica.earth/login?ref=CODE123`
- `https://greenafrica.earth/?referral=CODE123`
- `https://greenafrica.earth/login?referral=CODE123`

## Configuration Options

### Referral Points
```bash
# Default points awarded per referral
NEXT_PUBLIC_REFERRAL_POINTS=50

# Award more points for referrals
NEXT_PUBLIC_REFERRAL_POINTS=75
```

### Base URL (for link generation)
The system automatically detects the current domain, but you can override:
```typescript
const referralLink = generateReferralLink(referralCode, 'https://greenafrica.earth');
```

## Testing the System

### Manual Testing
1. Create a user account and note their referral code
2. Open new incognito browser
3. Visit: `https://greenafrica.earth/login?ref=THEIR_CODE`
4. Complete sign-up process
5. Check original user's dashboard for updated referral stats

### Example Referral Codes
The system generates codes like:
- `JOHN2024123` (John Doe)
- `SARA2024456` (Sarah Miller) 
- `MIKE2024789` (Michael Johnson)

Format: `[FIRST_4_CHARS_OF_NAME][YEAR][3_DIGITS]`

## Security Considerations

### Validation
- Referral codes must match expected format
- Invalid codes are ignored and logged
- Self-referrals are prevented by design

### Expiry
- Referral codes in localStorage expire after 24 hours
- Prevents stale referrals from being processed

### Rate Limiting
- One referral per user (enforced by unique user IDs)
- Referral records prevent duplicate processing

## Troubleshooting

### Common Issues

#### Referral Not Working
1. Check browser console for referral code detection
2. Verify referral code format matches expected pattern
3. Ensure localStorage has the referral code before sign-up

#### Points Not Awarded
1. Check Firestore for referral record creation
2. Verify transaction was created with type 'referral'
3. Check user's `referralPoints` and `totalPoints` fields

#### Environment Variables
```bash
# Verify environment variable is loaded
console.log('Referral Points:', process.env.NEXT_PUBLIC_REFERRAL_POINTS);
```

### Debugging

Enable debug logging:
```typescript
// In referral utility functions
console.log('Referral code detected:', referralCode);
console.log('Stored referral code:', getStoredReferralCode());
```

## Future Enhancements

### Potential Features
- Tiered referral rewards (more points for more referrals)
- Referral leaderboards
- Time-limited referral bonuses
- Bidirectional rewards (both referrer and referee get points)
- Social media integration for easier sharing

### Analytics
Consider tracking:
- Referral conversion rates
- Most effective referral sources  
- Average time from referral to sign-up
- Geographic spread of referrals

## API Reference

### Key Functions

```typescript
// Extract referral code from URL
const code = extractReferralCode(searchParams);

// Store referral code for later processing
storeReferralCode(referralCode);

// Generate shareable referral link
const link = generateReferralLink(userReferralCode);

// Process a referral (server-side)
const success = await processReferral(referralCode, newUserUid);

// Get user's referral statistics
const { totalReferrals, totalReferralPoints } = useReferrals(userUid);
```

---

This referral system provides a solid foundation for user acquisition through word-of-mouth marketing while maintaining security and providing a great user experience.
