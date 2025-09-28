'use server';

import { 
  createRedemptionRequestAdmin,
  updateRedemptionStatusAdmin,
  addTransactionAdmin,
  getUserAdmin,
  updateUserAdmin
} from '@/lib/firebase/admin-firestore';
import { detectNetwork, formatPhoneNumber, isValidNigerianPhone } from '@/lib/utils/phone';
import { FieldValue } from 'firebase-admin/firestore';

export interface AirtimeRedemptionRequest {
  userId: string;
  phone: string;
  amount: number; // Amount in naira (1:1 with points)
  network?: string; // Manual override for network
}

export interface AirtimeRedemptionResult {
  success: boolean;
  message: string;
  redemptionId?: string;
  transactionId?: string;
  error?: string;
  failureReason?: string;
  detectedNetwork?: string;
  apiResponse?: {
    reference?: string;
    responseCode?: number;
    responseMsg?: string;
    status?: string;
    recipient?: string;
    provider?: string;
  };
}

/**
 * Generate unique reference for Teqilla API
 */
function generateReference(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `TEQ_${timestamp}_${random}`;
}

/**
 * Validate airtime redemption request
 */
function validateRedemptionRequest(request: AirtimeRedemptionRequest): {
  valid: boolean;
  error?: string;
} {
  const { userId, phone, amount, network } = request;

  if (!userId) {
    return { valid: false, error: 'User ID is required' };
  }

  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }

  if (!isValidNigerianPhone(phone)) {
    return { valid: false, error: 'Invalid Nigerian phone number' };
  }

  if (!amount || amount < 50 || amount > 5000) {
    return { valid: false, error: 'Amount must be between ₦50 and ₦5000' };
  }

  // If manual network is provided, validate it
  if (network) {
    const validNetworks = ['MTN', 'GLO', 'AIRTEL', '9MOBILE', 'NTEL'];
    if (!validNetworks.includes(network.toUpperCase())) {
      return { valid: false, error: 'Invalid network selected' };
    }
  }

  return { valid: true };
}

/**
 * Call Teqilla API for airtime purchase
 */
async function callTeqillaAPI(
  provider: string,
  reference: string,
  recipient: string,
  amount: number,
  userMetadata: { uid: string; name: string }
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const apiKey = process.env.TERMII_API_KEY;
  const apiBaseUrl = process.env.TERMII_API_BASE_URL || 'https://teqilla.com/api/v1';

  if (!apiKey) {
    return { success: false, error: 'Teqilla API key not configured' };
  }

  try {
    const response = await fetch(`${apiBaseUrl}/bills/airtime`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        provider: provider.toUpperCase(),
        reference,
        recipient,
        amount,
        meta: userMetadata,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return { success: true, data: data.data };
    } else {
      return { 
        success: false, 
        error: data.message || data.data || 'Airtime purchase failed' 
      };
    }
  } catch (error) {
    console.error('Teqilla API call failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

/**
 * Process airtime redemption
 */
export async function redeemAirtime(
  request: AirtimeRedemptionRequest
): Promise<AirtimeRedemptionResult> {
  try {
    // Validate request
    const validation = validateRedemptionRequest(request);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Invalid redemption request',
        error: validation.error,
      };
    }

    const { userId, phone, amount, network: manualNetwork } = request;
    const formattedPhone = formatPhoneNumber(phone);
    const detectedNetwork = detectNetwork(formattedPhone);

    // Determine which network to use
    let finalNetwork: string;
    if (manualNetwork) {
      finalNetwork = manualNetwork.toUpperCase();
    } else if (detectedNetwork) {
      finalNetwork = detectedNetwork.code;
    } else {
      return {
        success: false,
        message: 'Unable to detect network. Please select network manually.',
        error: 'Network detection failed',
        detectedNetwork: detectedNetwork?.name,
      };
    }

    // Get user data
    const user = await getUserAdmin(userId);
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        error: 'User does not exist',
      };
    }

    // Check if user has enough points (1:1 conversion)
    const requiredPoints = amount;
    if (user.totalPoints < requiredPoints) {
      return {
        success: false,
        message: 'Insufficient points',
        error: `You need ${requiredPoints} points but only have ${user.totalPoints}`,
      };
    }

    // Create initial redemption request
    const redemptionData = {
      userId,
      type: 'airtime' as const,
      amount: `₦${amount}`,
      points: requiredPoints,
      phone: formattedPhone,
      network: finalNetwork,
      detectedNetwork: detectedNetwork?.name,
      status: 'processing' as const,
    };

    const redemptionId = await createRedemptionRequestAdmin(redemptionData);

    // Generate reference for API call
    const reference = generateReference();

    // Prepare user metadata for API call
    const userMetadata = {
      uid: user.uid,
      name: user.displayName,
    };

    // Call Teqilla API
    const apiResult = await callTeqillaAPI(
      finalNetwork,
      reference,
      formattedPhone,
      amount,
      userMetadata
    );

    if (apiResult.success && apiResult.data) {
      // API call successful - update redemption status
      await updateRedemptionStatusAdmin(redemptionId, 'completed', {
        transactionId: apiResult.data.reference,
        apiResponse: {
          reference: apiResult.data.reference,
          responseCode: apiResult.data.responseCode,
          responseMsg: apiResult.data.responseMsg,
          status: apiResult.data.status,
          recipient: apiResult.data.recipient,
          provider: finalNetwork,
        },
      });

      // Deduct points from user
      await updateUserAdmin(userId, {
        totalPoints: FieldValue.increment(-requiredPoints),
      });

      // Add transaction record (negative amount for redemption)
      await addTransactionAdmin({
        userId,
        type: 'redeemed',
        amount: -requiredPoints,
        description: `${amount} ${finalNetwork} airtime redeemed`,
        phone: formattedPhone,
        metadata: {
          redemptionId,
          network: finalNetwork,
          apiReference: apiResult.data.reference,
        },
      });

      return {
        success: true,
        message: 'Airtime redemption successful',
        redemptionId,
        transactionId: apiResult.data.reference,
        detectedNetwork: detectedNetwork?.name,
        apiResponse: {
          reference: apiResult.data.reference,
          responseCode: apiResult.data.responseCode,
          responseMsg: apiResult.data.responseMsg,
          status: apiResult.data.status,
          recipient: apiResult.data.recipient,
          provider: finalNetwork,
        },
      };
    } else {
      // API call failed - update redemption status
      const failureReason = apiResult.error || 'Unknown error';
      await updateRedemptionStatusAdmin(redemptionId, 'failed', {
        failureReason,
        apiResponse: {
          errorMessage: failureReason,
          provider: finalNetwork,
        },
      });

      // Don't refund points for failed transactions as per requirements
      return {
        success: false,
        message: 'Airtime redemption failed',
        error: failureReason,
        failureReason,
        redemptionId,
        detectedNetwork: detectedNetwork?.name,
      };
    }
  } catch (error) {
    console.error('Unexpected error in airtime redemption:', error);
    return {
      success: false,
      message: 'Unexpected error during redemption',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
