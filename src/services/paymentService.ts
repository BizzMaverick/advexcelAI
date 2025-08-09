const PAYMENT_API_URL = process.env.REACT_APP_PAYMENT_API_URL || 'https://zk23bd25ccxknvkxh4bp6td4vy0fhujq.lambda-url.us-east-1.on.aws/';

export interface TrialStatus {
  hasValidPayment: boolean;
  inTrial?: boolean;
  trialExpired?: boolean;
  needsTrial?: boolean;
  trialExpiryDate?: string;
  promptsRemaining?: number;
  promptsUsed?: number;
  isAdmin?: boolean;
}

export class PaymentService {
  // Start trial for new user
  static async startTrial(userEmail: string): Promise<boolean> {
    try {
      const response = await fetch(PAYMENT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start-trial',
          userEmail
        }),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to start trial:', error);
      return false;
    }
  }

  // Check if user can use a prompt
  static async canUsePrompt(userEmail: string): Promise<{ canUse: boolean; reason?: string; promptsRemaining?: number }> {
    try {
      const response = await fetch(PAYMENT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'use-prompt',
          userEmail
        }),
      });

      const result = await response.json();
      return {
        canUse: result.canUse,
        reason: result.reason,
        promptsRemaining: result.promptsRemaining
      };
    } catch (error) {
      console.error('Failed to check prompt usage:', error);
      return { canUse: false, reason: 'Network error' };
    }
  }

  // Check payment/trial status
  static async checkPaymentStatus(userEmail: string): Promise<TrialStatus> {
    try {
      const response = await fetch(PAYMENT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'check-status',
          userEmail
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to check payment status:', error);
      return { hasValidPayment: false };
    }
  }

  // Create Razorpay order
  static async createOrder(amount: number, userEmail: string): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      const response = await fetch(PAYMENT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-order',
          amount: amount * 100, // Convert to paise
          userEmail
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to create order:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Verify payment
  static async verifyPayment(paymentData: any, userEmail: string): Promise<boolean> {
    try {
      const response = await fetch(PAYMENT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify-payment',
          ...paymentData,
          userEmail
        }),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to verify payment:', error);
      return false;
    }
  }
}

export default PaymentService;