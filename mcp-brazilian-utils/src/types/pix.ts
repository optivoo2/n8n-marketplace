/**
 * Type definitions for PIX operations
 */

export interface PixPaymentParams {
  key: string;
  amount: number;
  receiverName: string;
  city: string;
  description?: string;
}

export interface PixPaymentResult {
  qr_code: string;
  pix_key: string;
  amount: number;
  receiver_name: string;
  description: string;
  timestamp: string;
  transaction_id: string;
  expiration: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BankResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  message?: string;
}
