import { ethers } from 'ethers';

/**
 * Convert a string to bytes32 format
 * Pads shorter strings with zeros, truncates longer strings
 */
export function stringToBytes32(str: string): string {
  // Convert string to bytes and pad to 32 bytes
  const bytes = ethers.toUtf8Bytes(str);
  const padded = ethers.zeroPadBytes(bytes, 32);
  return ethers.hexlify(padded);
}

/**
 * Convert bytes32 to string
 * Removes null padding
 */
export function bytes32ToString(bytes32: string): string {
  // Convert hex to bytes and then to string, removing null bytes
  const bytes = ethers.getBytes(bytes32);
  const str = ethers.toUtf8String(bytes);
  // Remove null characters
  return str.replace(/\0/g, '');
}

/**
 * Validate that a string can be safely converted to bytes32
 * Returns true if the string is 32 bytes or less when UTF-8 encoded
 */
export function isValidBytes32String(str: string): boolean {
  try {
    const bytes = ethers.toUtf8Bytes(str);
    return bytes.length <= 32;
  } catch {
    return false;
  }
}

/**
 * Generate a safe referral code that fits in bytes32
 * Truncates if necessary while maintaining uniqueness
 */
export function generateSafeReferralCode(displayName: string): string {
  const name = displayName.replace(/\s+/g, '').toUpperCase();
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  // Create base code
  let baseCode = `${name.substring(0, 8)}${year}${randomNum}`;
  
  // Ensure it fits in bytes32 (truncate if necessary)
  while (!isValidBytes32String(baseCode) && baseCode.length > 0) {
    baseCode = baseCode.slice(0, -1);
  }
  
  return baseCode;
}
