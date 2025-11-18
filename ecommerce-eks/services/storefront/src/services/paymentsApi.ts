import { paymentsApi } from './api';
import { PaymentRequest, PaymentResponse } from '../types';

export const paymentsService = {
  // Process a payment
  chargePayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    const response = await paymentsApi.post<PaymentResponse>('/api/payments/charge', paymentData);
    return response.data;
  },

  // Validate card number format (basic validation)
  validateCardNumber: (cardNumber: string): boolean => {
    // Remove spaces and dashes
    const cleanedNumber = cardNumber.replace(/[\s-]/g, '');
    // Check if it's 16 digits
    return /^\d{16}$/.test(cleanedNumber);
  },

  // Validate CVV format
  validateCVV: (cvv: string): boolean => {
    return /^\d{3,4}$/.test(cvv);
  },

  // Test card for demo: 4242424242424242 = APPROVED
  getTestCard: () => ({
    cardNumber: '4242424242424242',
    expiryMonth: 12,
    expiryYear: 2030,
    cvv: '123',
  }),
};