/**
 * Address Services
 * CEP lookup, validation, distance calculation
 */
import { AddressResult, DistanceResult } from '../types.js';
export declare class AddressService {
    private readonly viaCepUrl;
    /**
     * Look up address by CEP
     */
    lookupCEP(cepInput: string): Promise<AddressResult>;
    /**
     * Validate CEP format
     */
    validateCEP(cepInput: string): Promise<{
        valid: boolean;
        formatted?: string;
        unformatted?: string;
        error?: string;
    }>;
    /**
     * Calculate distance between two CEPs (approximation)
     */
    calculateDistance(cep1Input: string, cep2Input: string): Promise<DistanceResult>;
}
//# sourceMappingURL=address.d.ts.map