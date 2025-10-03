# Hedera Hybrid Token System

This document explains the hybrid token system that uses both Hedera SDK and ethers.js for token operations in the Green Africa platform.

## Overview

The system implements a hybrid approach where:
- **Hedera SDK** is used for token minting and burning operations (preferred method)
- **ethers.js** is used as a fallback and for balance checking operations
- The system automatically chooses the appropriate method based on user account configuration

## Architecture

### Files Structure
```
src/
├── lib/
│   ├── hedera/
│   │   ├── token-service.ts       # Hedera SDK token operations
│   │   └── client.ts              # Existing Hedera client
│   ├── ethereum/
│   │   └── token-client.ts        # ethers.js token operations
│   └── test-hybrid-tokens.ts      # Test utilities
├── actions/
│   ├── greenpoints.ts             # Main token action handlers
│   └── hedera-account.ts          # Hedera account generation
└── types/
    └── index.ts                   # Updated with accountId field
```

## Key Components

### 1. Hedera Token Service (`src/lib/hedera/token-service.ts`)

Implements native Hedera token operations:
- `mintGreenPointsHedera()` - Mint tokens using TokenMintTransaction + TransferTransaction
- `burnGreenPointsHedera()` - Burn tokens using TokenWipeTransaction (admin wipe)
- `getUserAccountId()` - Get user's Hedera Account ID from Firebase

#### Token Flow (Hedera SDK)
```
1. Mint to treasury using TokenMintTransaction (6 decimals: amount * 1_000_000)
2. Transfer to user using TransferTransaction
3. For burning: Use TokenWipeTransaction (admin wipe, reduces total supply)
```

### 2. Green Points Actions (`src/actions/greenpoints.ts`)

Main entry points that implement hybrid logic:
- `mintPointsForUser()` - Auto-selects Hedera SDK or ethers.js
- `burnPointsForUser()` - Auto-selects Hedera SDK or ethers.js  
- `getUserPointsFromBlockchain()` - Always uses ethers.js for balance checking

#### Selection Logic
```typescript
const userAccountId = await getUserAccountId(uid);
if (!userAccountId) {
  // Fallback to ethers.js
  console.warn(`No Hedera Account ID for user ${uid}, falling back to ethers.js`);
  return await mintGreenPoints(user.evmAddress, points);
} else {
  // Use Hedera SDK (preferred)
  return await mintGreenPointsHedera(userAccountId, points);
}
```

### 3. User Account Configuration

Users can have different account configurations:

#### New Users (Hedera SDK Path)
```typescript
interface GreenAfricaUser {
  accountId: string;           // "0.0.123456" - Hedera Account ID
  evmAddress: string;          // "0x..." - EVM address  
  encryptedPrivateKey: string; // Encrypted private key
}
```

#### Legacy Users (ethers.js Path)
```typescript
interface GreenAfricaUser {
  evmAddress: string;  // "0x..." - EVM address only
  // No accountId - triggers ethers.js fallback
}
```

## Environment Configuration

Required environment variables:
```env
# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.6757140
HEDERA_OPERATOR_KEY=0x653a4a5f68e53fcddec258805fad3e36c8bef95dbc3061560683586839e64952

# Token Configuration
GREENPOINTS_TOKEN_ID=0.0.6919030        # Hedera token ID
GREENPOINTS_EVM=0x0000000000000000000000000000000000699376  # EVM address

# ethers.js Configuration  
HEDERA_RPC_URL=https://testnet.hashio.io/api
```

## Transaction Flow Examples

### Minting with Hedera SDK
```typescript
// 1. Mint to treasury
await new TokenMintTransaction()
  .setTokenId(tokenId)
  .setAmount(Number(amount * 1_000_000)) // 6 decimals
  .freezeWith(client)
  .sign(supplyKey)
  .execute(client);

// 2. Transfer to user
await new TransferTransaction()
  .addTokenTransfer(tokenId, operatorId, -amount)
  .addTokenTransfer(tokenId, userAccount, amount)
  .execute(client);
```

### Burning with Hedera SDK
```typescript
// Admin wipe (reduces total supply)
await new TokenWipeTransaction()
  .setTokenId(tokenId)
  .setAccountId(userAccount)
  .setAmount(Number(amount * 1_000_000)) // 6 decimals
  .freezeWith(client)
  .sign(wipeKey)
  .execute(client);
```

### Balance Checking (Always ethers.js)
```typescript
// Uses ERC-20 balanceOf for compatibility
const balance = await tokenContract.balanceOf(userAddress);
const decimals = await tokenContract.decimals();
const formattedBalance = ethers.formatUnits(balance, decimals);
```

## Benefits

1. **Gas Efficiency**: Hedera SDK operations are more gas-efficient than EVM calls
2. **Native Features**: Uses native Hedera token features like unlimited auto-association
3. **Backward Compatibility**: Existing users with only EVM addresses still work
4. **Flexibility**: System can adapt based on user account configuration
5. **Admin Controls**: TokenWipeTransaction provides proper admin burn functionality

## Testing

Use the test utilities in `src/lib/test-hybrid-tokens.ts`:

```typescript
import { runHybridTokenTests } from '@/lib/test-hybrid-tokens';

// Test both methods for a user
const results = await runHybridTokenTests('user-uid');
console.log(results.summary);
```

## Migration Strategy

### For New Users
- Generate Hedera account with unlimited auto-association
- Store both accountId and evmAddress
- Use Hedera SDK for all operations

### For Existing Users  
- Continue using ethers.js operations
- Optional: Migrate to Hedera accounts over time
- System gracefully handles both configurations

## Transaction Logging

Both methods provide transaction hashes for tracking:
- **Hedera SDK**: Returns Hedera transaction ID
- **ethers.js**: Returns Ethereum transaction hash

Both are logged and returned to the client for auditing purposes.

## Error Handling

The system implements graceful degradation:
1. Try preferred method (Hedera SDK if available)
2. Log any errors or fallbacks
3. Fallback to ethers.js for compatibility
4. Return detailed error messages for debugging

## Integration with Existing Systems

The hybrid system integrates seamlessly with:
- Green Africa smart contract (for deposit/redeem recording)
- Firebase user management
- Transaction history logging  
- Balance checking and redemption flows

All existing functionality is preserved while adding the efficiency benefits of native Hedera operations.
