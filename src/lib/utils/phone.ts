/**
 * Phone number utilities for Nigerian networks
 */

export interface NetworkInfo {
  name: string;
  code: string;
  prefixes: string[];
}

export const NIGERIAN_NETWORKS: NetworkInfo[] = [
  {
    name: 'MTN',
    code: 'MTN',
    prefixes: ['0703', '0706', '0803', '0806', '0810', '0813', '0814', '0816', '0903', '0906', '0913', '0916']
  },
  {
    name: 'GLO',
    code: 'GLO', 
    prefixes: ['0705', '0805', '0807', '0811', '0815', '0905', '0915']
  },
  {
    name: 'AIRTEL',
    code: 'AIRTEL',
    prefixes: ['0701', '0708', '0802', '0808', '0812', '0901', '0902', '0904', '0907', '0912']
  },
  {
    name: '9MOBILE',
    code: '9MOBILE',
    prefixes: ['0809', '0817', '0818', '0908', '0909']
  },
  {
    name: 'NTEL',
    code: 'NTEL',
    prefixes: ['0804']
  }
];

/**
 * Clean and format phone number
 * Converts international format to local Nigerian format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle international format (+234 or 234)
  if (cleaned.startsWith('234') && cleaned.length === 13) {
    return '0' + cleaned.substring(3);
  }
  
  // Handle cases where user entered without leading 0
  if (cleaned.length === 10 && !cleaned.startsWith('0')) {
    return '0' + cleaned;
  }
  
  return cleaned;
}

/**
 * Detect network from phone number
 */
export function detectNetwork(phone: string): NetworkInfo | null {
  const formatted = formatPhoneNumber(phone);
  
  // Check if it's a valid Nigerian number (11 digits starting with 0)
  if (formatted.length !== 11 || !formatted.startsWith('0')) {
    return null;
  }
  
  // Extract first 4 digits for prefix matching
  const prefix = formatted.substring(0, 4);
  
  // Find matching network
  for (const network of NIGERIAN_NETWORKS) {
    if (network.prefixes.includes(prefix)) {
      return network;
    }
  }
  
  return null;
}

/**
 * Validate Nigerian phone number
 */
export function isValidNigerianPhone(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  return formatted.length === 11 && formatted.startsWith('0') && detectNetwork(formatted) !== null;
}

/**
 * Get all available networks for manual selection
 */
export function getAvailableNetworks(): NetworkInfo[] {
  return NIGERIAN_NETWORKS;
}

/**
 * Format phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  const formatted = formatPhoneNumber(phone);
  if (formatted.length === 11) {
    return `${formatted.substring(0, 4)} ${formatted.substring(4, 7)} ${formatted.substring(7)}`;
  }
  return formatted;
}
