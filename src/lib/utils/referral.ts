/**
 * Utility functions for handling referral links and URL parameters
 */

/**
 * Extract referral code from URL search parameters
 * @param searchParams - URL search parameters or query string
 * @returns referral code if found, null otherwise
 */
export const extractReferralCode = (searchParams: URLSearchParams | string): string | null => {
  let params: URLSearchParams;
  
  if (typeof searchParams === 'string') {
    // Remove leading '?' if present
    const cleanParams = searchParams.startsWith('?') ? searchParams.slice(1) : searchParams;
    params = new URLSearchParams(cleanParams);
  } else {
    params = searchParams;
  }
  
  return params.get('ref') || params.get('referral') || null;
};

/**
 * Store referral code in localStorage for later processing during signup
 * @param referralCode - The referral code to store
 */
export const storeReferralCode = (referralCode: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('referralCode', referralCode);
    
    // Also store timestamp for expiry (optional - 24 hours)
    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
    localStorage.setItem('referralCodeExpiry', expiryTime.toString());
  }
};

/**
 * Get stored referral code from localStorage
 * @returns referral code if found and not expired, null otherwise
 */
export const getStoredReferralCode = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const referralCode = localStorage.getItem('referralCode');
  const expiryTime = localStorage.getItem('referralCodeExpiry');
  
  if (!referralCode || !expiryTime) return null;
  
  // Check if expired
  const now = new Date().getTime();
  if (now > parseInt(expiryTime, 10)) {
    // Clean up expired referral code
    localStorage.removeItem('referralCode');
    localStorage.removeItem('referralCodeExpiry');
    return null;
  }
  
  return referralCode;
};

/**
 * Clear stored referral code from localStorage
 */
export const clearStoredReferralCode = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('referralCode');
    localStorage.removeItem('referralCodeExpiry');
  }
};

/**
 * Generate a referral link for a user
 * @param referralCode - The user's referral code
 * @param baseUrl - Base URL of the application (optional, will use window.location.origin if not provided)
 * @returns complete referral link
 */
export const generateReferralLink = (referralCode: string, baseUrl?: string): string => {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://greenafrica.earth');
  return `${base}/login?ref=${encodeURIComponent(referralCode)}`;
};

/**
 * Copy referral link to clipboard
 * @param referralCode - The user's referral code
 * @param baseUrl - Base URL of the application (optional)
 * @returns Promise that resolves to true if successful, false otherwise
 */
export const copyReferralLink = async (referralCode: string, baseUrl?: string): Promise<boolean> => {
  if (typeof window === 'undefined' || !navigator.clipboard) {
    return false;
  }
  
  try {
    const referralLink = generateReferralLink(referralCode, baseUrl);
    await navigator.clipboard.writeText(referralLink);
    return true;
  } catch (error) {
    console.error('Failed to copy referral link:', error);
    return false;
  }
};

/**
 * Get referral points from environment variable
 * @returns number of points awarded for referrals
 */
export const getReferralPoints = (): number => {
  return parseInt(process.env.NEXT_PUBLIC_REFERRAL_POINTS || '50', 10);
};

/**
 * Validate referral code format
 * @param referralCode - The referral code to validate
 * @returns true if valid format, false otherwise
 */
export const isValidReferralCodeFormat = (referralCode: string): boolean => {
  // Expected format: NAME2024XXX (4 chars + year + 3 digits)
  const referralRegex = /^[A-Z]{1,4}\d{4}\d{3}$/;
  return referralRegex.test(referralCode.toUpperCase());
};
