# RVM Registration Script

This document explains how to register RVMs (Reverse Vending Machines) on the Hedera blockchain using the provided script.

## Overview

The RVM registration script allows you to register new RVMs with their location coordinates and metadata on the Hedera testnet blockchain.

## Prerequisites

1. **Environment Setup**: Ensure your `.env.local` file has the required Hedera credentials:
   ```bash
   HEDERA_NETWORK=testnet
   HEDERA_OPERATOR_ID=your_operator_account_id
   HEDERA_OPERATOR_KEY=0x653a4a5f68e53fcddec258805fad3e36c8bef95dbc3061560683586839e64952
   HEDERA_CONTRACT_ID=0x668a877dcc604eb95d448fe2e3a3a30b5f379073
   ```

2. **Dependencies**: All required packages are already installed (tsx, @hashgraph/sdk, ethers)

## Usage

### Method 1: Using npm script (Recommended)
```bash
# Run with confirmation prompt
npm run register-rvm

# Run with auto-confirmation (skip prompt)
npm run register-rvm -- --confirm
```

### Method 2: Direct tsx execution
```bash
# With confirmation prompt
npx tsx scripts/register-rvm-ifitness.ts

# With auto-confirmation
npx tsx scripts/register-rvm-ifitness.ts --confirm
```

## Current RVM Configuration

The script is currently configured to register the **iFitness Orchid** RVM with the following details:

```typescript
const RVM_DATA = {
  rvmId: 'RVM-IFITNESS-ORCHID-001',
  latitude: 6.433402,
  longitude: 3.541907,
  name: 'iFitness Orchid',
  metaURI: '', // Empty for now
};
```

## Script Features

### ✅ Environment Validation
- Checks if all required environment variables are set
- Warns about missing configurations
- Shows current environment status

### ✅ Coordinate Processing  
- Converts latitude/longitude to E6 format (multiplied by 1,000,000)
- Validates coordinate ranges (-90 to 90 for lat, -180 to 180 for lng)

### ✅ Transaction Monitoring
- Displays transaction ID upon success
- Provides Hashscan testnet explorer link
- Shows detailed error messages on failure

### ✅ Safety Features
- Confirmation prompt before executing
- Comprehensive error handling
- Clear success/failure indicators

## Example Output

```bash
🔧 Environment Check:
   HEDERA_NETWORK: testnet (default)
   HEDERA_OPERATOR_ID: ✅ Set
   HEDERA_OPERATOR_KEY: ✅ Set
   HEDERA_CONTRACT_ID: 0x668a877dcc604eb95d448fe2e3a3a30b5f379073 (default)

🚀 Starting RVM Registration Script
================================

📍 RVM Details:
   ID: RVM-IFITNESS-ORCHID-001
   Name: iFitness Orchid
   Location: 6.433402, 3.541907
   Metadata URI: None

⏳ Registering RVM on Hedera blockchain...

📊 Registration Result:
   Success: ✅
   Message: RVM successfully registered on blockchain
   Transaction ID: 0.0.123456@1640995200.000000000

🎉 RVM Successfully Registered!
🔗 View transaction: https://hashscan.io/testnet/transaction/0.0.123456@1640995200.000000000
```

## Customizing for Other RVMs

To register a different RVM, modify the `RVM_DATA` object in `scripts/register-rvm-ifitness.ts`:

```typescript
const RVM_DATA = {
  rvmId: 'RVM-YOUR-LOCATION-001',        // Unique ID for the RVM
  latitude: YOUR_LATITUDE,                // GPS latitude
  longitude: YOUR_LONGITUDE,              // GPS longitude  
  name: 'Your RVM Name',                  // Display name
  metaURI: 'https://your-metadata-uri',   // Optional metadata URI
};
```

## Contract Function Called

The script calls the `registerRVM` function on the smart contract:

```solidity
function registerRVM(
    bytes32 rvmId,      // Converted from string
    int32 latE6,        // Latitude * 1,000,000
    int32 lngE6,        // Longitude * 1,000,000
    string name,        // RVM display name
    string metaURI      // Metadata URI (optional)
)
```

## Troubleshooting

### Error: "Missing HEDERA_OPERATOR_ID"
- Add your Hedera operator account ID to `.env.local`

### Error: "Invalid coordinates"
- Ensure latitude is between -90 and 90
- Ensure longitude is between -180 and 180

### Error: "Contract not found"
- Verify the contract address in your environment variables
- Check if the contract is deployed on the correct network

### Error: "Insufficient account balance"
- Ensure your operator account has sufficient HBAR for transaction fees
- Transaction requires approximately 0.1-0.5 HBAR

## Security Notes

- Keep your operator private key secure
- Never commit private keys to version control
- Use environment variables for sensitive data
- Consider using different operator accounts for different environments

## Next Steps

After successful registration:
1. Verify the RVM appears in your contract's RVM list
2. Test RVM functionality with the web application
3. Update any frontend components to display the new RVM
4. Consider adding metadata URI for richer RVM information
