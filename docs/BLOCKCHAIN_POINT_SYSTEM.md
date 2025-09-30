# Blockchain Point System Integration

## Overview
The Green Africa application now uses blockchain-based tokens (Green Points) instead of Firebase for point management. This document outlines the complete integration and its features.

## Key Features
- **Token-based Points**: Points are now represented as ERC-20 tokens on Hedera blockchain
- **Deposit Recording**: Every point earned is recorded on the Green Africa smart contract
- **Secure Redemption**: Point redemption burns tokens and calls smart contract functions
- **Session Tracking**: Each transaction has a unique session ID stored in Firebase for audit
- **Fallback Compatibility**: Graceful handling of blockchain failures with Firebase fallback

## Architecture Changes

### 1. Token Management (`src/lib/hedera/token-client.ts`)
- **Mint Tokens**: `mintGreenPoints()` - Issues tokens when users earn points
- **Burn Tokens**: `burnGreenPoints()` - Destroys tokens during redemption
- **Balance Reading**: `getTokenBalance()` - Reads user's current token balance
- Uses standard ERC-20 functions with ethers.js integration

### 2. Server Actions (`src/actions/greenpoints.ts`)
- **mintPointsForUser()**: Mint tokens + record deposit on contract
- **burnPointsForUser()**: Burn tokens + call contract redemption
- **getUserPointsFromBlockchain()**: Get user's token balance
- **getUserPointsComparison()**: Compare token vs contract balances

### 3. Smart Contract Integration (`src/lib/ethereum/client.ts`)
- **recordDepositOnBlockchain()**: Records deposits with session tracking
- **redeemPointsOnBlockchain()**: Handles point redemption on contract
- All interactions use ethers.js with proper error handling

### 4. Firebase Integration Updates (`src/lib/firebase/firestore.ts`)
- **Point Earning**: `addPointsToUser()` now mints tokens instead of updating Firebase
- **Point Reading**: `getUser()` fetches balance from blockchain, not Firebase
- **Redemption**: `createRedemptionRequest()` burns tokens and calls contract
- **Transaction Records**: Maintains audit trail with session IDs

## Configuration

### Environment Variables
```bash
# Green Points Token
GREENPOINTS_TOKEN_ID=0.0.6919030
GREENPOINTS_EVM=0x0000000000000000000000000000000000699376

# Hedera Network
HEDERA_RPC_URL=https://testnet.hashio.io/api
HEDERA_OPERATOR_KEY=your_operator_private_key

# Smart Contract
GREEN_AFRICA_CONTRACT_ADDRESS=0x668a877dcc604eb95d448fe2e3a3a30b5f379073
```

### Smart Contract Constants
- **RVM ID**: `0x52564d2d494649544e4553532d4f52434849442d303031000000000000000000`
- **PET Count**: Same as points earned
- **S3 URI**: Empty string (as requested)
- **Session ID**: Randomly generated and stored in Firebase

## Data Flow

### Point Earning Flow
1. User earns points through recycling
2. `addPointsToUser()` is called
3. Generate unique session ID
4. Mint Green Points tokens to user's EVM address
5. Record deposit on Green Africa contract with session ID
6. Create Firebase transaction record for audit (no totalPoints update)

### Point Reading Flow
1. `getUser()` fetches user data from Firebase
2. If user has EVM address, query token balance from blockchain
3. Override Firebase totalPoints with blockchain balance
4. Return user data with live blockchain balance

### Point Redemption Flow
1. User requests redemption
2. `createRedemptionRequest()` creates Firebase record
3. `burnPointsForUser()` burns tokens from user's address
4. Call `redeemPoints()` on Green Africa contract
5. Create audit transaction record with transaction hash
6. Handle failures gracefully with status updates

## Testing

### Integration Tests (`src/test/blockchain-integration.test.ts`)
- Point earning flow validation
- Point reading from blockchain
- Session ID generation and storage
- Point redemption with token burning
- Configuration validation

### Running Tests
```typescript
import { runAllTests, validateConfiguration } from '@/test/blockchain-integration.test';

// Validate environment setup
await validateConfiguration();

// Run complete integration test suite
const results = await runAllTests();
```

## Error Handling
- **Blockchain Failures**: Graceful fallback to Firebase for reading
- **Token Operations**: Proper error messages and transaction reversal
- **Network Issues**: Retry mechanisms and clear error reporting
- **Configuration**: Environment validation before operations

## Security Considerations
- **Private Keys**: Server-side only, never exposed to client
- **Token Minting**: Controlled by server actions with validation
- **Session IDs**: Unique generation prevents replay attacks
- **Balance Verification**: Check before token burning operations

## Migration Strategy
- **Backward Compatibility**: Existing Firebase users continue working
- **Gradual Rollout**: New users get blockchain integration automatically
- **Audit Trail**: All transactions maintained in Firebase for support

## Monitoring & Debugging
- **Transaction Hashes**: All blockchain operations return transaction IDs
- **Session Tracking**: Unique session IDs for deposit correlation
- **Error Logging**: Comprehensive error messages and stack traces
- **Balance Comparison**: Utility functions to compare token vs contract balances

## Future Enhancements
- **Batch Operations**: Multiple point operations in single transaction
- **Gas Optimization**: Smart contract gas usage improvements
- **Real-time Updates**: WebSocket integration for live balance updates
- **Multi-token Support**: Framework for additional token types

This integration transforms Green Africa from a traditional database-driven point system to a modern blockchain-based token economy while maintaining user experience and system reliability.
