/**
 * Hedera utility functions
 * These are synchronous utility functions that can be used by both client and server code
 */

/**
 * Validate if a string is a valid Hedera account ID format
 */
export function isValidHederaAccountId(accountId: string): boolean {
  // Hedera account ID format: shard.realm.account (e.g., 0.0.12345)
  const accountIdRegex = /^\d+\.\d+\.\d+$/;
  return accountIdRegex.test(accountId);
}

/**
 * Check if a Green ID is in the old format (GRN-YYYY-XXXXXX)
 */
export function isOldGreenIdFormat(greenId: string): boolean {
  const oldFormatRegex = /^GRN-\d{4}-\d{6}$/;
  return oldFormatRegex.test(greenId);
}
