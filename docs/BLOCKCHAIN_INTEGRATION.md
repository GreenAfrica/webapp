# Blockchain Integration Guide

This document explains how the Green Africa webapp integrates with the Hedera blockchain for user registration.

## Overview

When users successfully authenticate via Firebase, they are automatically registered on the Hedera blockchain using their Green ID and referral codes. This creates a dual-system where users exist in both Firebase/Firestore for app functionality and on the Hedera blockchain for recycling rewards.

## Architecture

### Components

1. **Firebase Authentication** - Handles user login/registration
2. **Firestore Database** - Stores user data, transactions, referrals
3. **Hedera Blockchain** - Stores recycler registration via smart contract
4. **Smart Contract** - `GreenAfrica.sol` deployed on Hedera testnet

### Data Flow

```
User Login → Firebase Auth → Create/Update Firestore User → Register on Blockchain
```

## Green ID Generation

Green IDs are generated using the format: `GRN-YYYY-XXXXXX`

- `GRN` - Green Africa prefix
- `YYYY` - Current year (e.g., 2025)
- `XXXXXX` - 6-digit random number with leading zeros

Example: `GRN-2025-123456`

## Implementation Details

### Files Structure

```
src/
├── lib/
│   ├── utils/blockchain.ts     # Bytes32 conversion utilities
│   └── hedera/client.ts        # Hedera client and contract interaction
├── actions/blockchain.ts       # Server actions for blockchain operations
└── contexts/AuthContext.tsx    # Integration with auth flow
```

### Key Functions

#### `stringToBytes32(str: string): string`
Converts strings to bytes32 format for smart contract compatibility.

#### `registerUserOnBlockchain(greenId, referralCode, referredByCode?)`
Registers a new user on the Hedera blockchain via the smart contract.

#### `checkUserExists(greenId: string): boolean`
Checks if a user already exists on the blockchain.

### Smart Contract Interface

The integration interacts with these contract functions:

- `getUser(bytes32 recyclerId)` - Check if user exists
- `registerRecycler(bytes32 recyclerId, bytes32 referralCode, bytes32 referredByCode)` - Register new user

## Environment Configuration

Required environment variables in `.env.local`:

```bash
# Hedera Blockchain Configuration
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=your_operator_account_id
HEDERA_OPERATOR_KEY=0x653a4a5f68e53fcddec258805fad3e36c8bef95dbc3061560683586839e64952
HEDERA_CONTRACT_ID=0x668a877dcc604eb95d448fe2e3a3a30b5f379073

# Firebase Admin SDK Configuration
# Generate these from Firebase Console > Project Settings > Service Accounts
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_service_account_email
```

### Firebase Admin SDK Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project > Project Settings > Service Accounts
3. Click "Generate new private key" 
4. Download the JSON file and extract:
   - `private_key` → `FIREBASE_PRIVATE_KEY` 
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

**Important**: The private key should include `\n` characters as literal strings, not actual newlines.

## Registration Flow

### New User Registration

1. User completes Firebase authentication
2. Firestore user document created with:
   - Green ID (e.g., `GRN-2025-123456`)
   - Referral code (generated from name + year + random)
   - User details
3. Blockchain registration attempted:
   - Check if user already exists using `getUser()`
   - If not exists, call `registerRecycler()`
   - Log success/failure (user creation continues regardless)

### Existing User Login

1. User authenticates via Firebase
2. Firestore user data loaded
3. No blockchain registration attempted (user already exists)

## Error Handling

The system implements graceful error handling:

- **Blockchain Down**: User registration continues in Firestore
- **User Already Exists**: Skip blockchain registration
- **Invalid Referral**: Register without referral code
- **Network Issues**: Log error but don't block user creation

This ensures the app remains functional even if blockchain operations fail.

## Data Mapping

| Firestore Field | Smart Contract Parameter | Type | Description |
|-----------------|-------------------------|------|-------------|
| `greenId` | `recyclerId` | bytes32 | User's unique Green ID |
| `referralCode` | `referralCode` | bytes32 | User's own referral code |
| Referrer's `referralCode` | `referredByCode` | bytes32 | Code of user who referred this user |

## Testing

### Unit Tests

Test the utility functions:
```typescript
// Test bytes32 conversion
expect(stringToBytes32('GRN-2025-123456')).toBeDefined();
expect(bytes32ToString(bytes32Value)).toBe('GRN-2025-123456');
```

### Integration Tests

Test blockchain registration:
```typescript
// Mock successful registration
const result = await registerUserOnHedera('GRN-2025-123456', 'JOHN2025001');
expect(result.success).toBe(true);
```

## Monitoring and Logging

The system logs important events:

- **Successful Registration**: User ID, transaction ID
- **Registration Failures**: User ID, error details
- **Blockchain Errors**: Network issues, gas problems

Monitor logs for:
- Registration success rates
- Common error patterns
- Performance issues

## Security Considerations

1. **Private Keys**: Operator private key should be stored securely
2. **Gas Limits**: Set appropriate limits to prevent excessive fees
3. **Input Validation**: All inputs are validated before blockchain calls
4. **Error Information**: Sensitive error details not exposed to client

## Troubleshooting

### Common Issues

**"User already exists"**
- Normal for returning users
- Check logs to confirm it's expected

**"Permission denied"**
- Check Hedera operator credentials
- Verify contract permissions

**"Gas estimation failed"**
- Network congestion
- Retry with higher gas limits

**"Contract not found"**
- Verify contract address
- Check network configuration

### Debug Steps

1. Check environment variables
2. Verify contract deployment
3. Test with Hedera testnet explorer
4. Monitor transaction status
5. Check console logs for details

## Future Enhancements

1. **Retry Mechanism**: Automatic retry for failed registrations
2. **Batch Registration**: Register multiple users in one transaction
3. **Gas Optimization**: Dynamic gas estimation
4. **Metrics Dashboard**: Monitor registration statistics
5. **Webhook Integration**: Real-time blockchain event handling

## Support

For blockchain integration issues:
1. Check environment configuration
2. Verify Hedera network status
3. Review transaction logs
4. Contact development team with error details
