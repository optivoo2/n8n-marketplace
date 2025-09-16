/**
 * Finance Services
 * PIX, Boleto, payment validations
 */
import type { PIXGenerationResult, PIXValidationResult } from '../types.js';
export declare class FinanceService {
    /**
     * Generate PIX QR Code payload
     */
    generatePixQR(params: {
        key: string;
        amount: number;
        receiverName: string;
        city: string;
        description?: string;
    }): Promise<PIXGenerationResult | {
        error: boolean;
        message: string;
    }>;
    /**
     * Validate PIX key format
     */
    validatePixKey(key: string, keyType: string): Promise<PIXValidationResult | {
        error: boolean;
        message: string;
    }>;
    /**
     * Generate Boleto barcode
     */
    generateBoleto(params: {
        bankCode: string;
        amount: number;
        dueDate: string;
        documentNumber: string;
    }): Promise<any>;
    /**
     * Calculate CRC16 for PIX payload
     */
    private calculateCRC16;
    /**
     * Calculate boleto check digit
     */
    private calculateBoletoCheckDigit;
    /**
     * Format boleto typeable line
     */
    private formatBoletoTypeableLine;
    /**
     * Get bank name from code
     */
    private getBankName;
}
//# sourceMappingURL=finance.d.ts.map