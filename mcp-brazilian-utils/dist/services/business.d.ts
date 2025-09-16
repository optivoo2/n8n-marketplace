/**
 * Business Services
 * CNPJ lookup, company information
 */
import type { CNPJLookupResult, SimplesNacionalResult } from '../types.js';
export declare class BusinessService {
    private readonly receitaWSUrl;
    /**
     * Look up company information by CNPJ
     */
    lookupCNPJ(cnpjInput: string): Promise<CNPJLookupResult | {
        error: boolean;
        message: string;
    }>;
    /**
     * Check if company is in Simples Nacional
     */
    checkSimplesNacional(cnpjInput: string): Promise<SimplesNacionalResult | {
        error: boolean;
        message: string;
    }>;
    /**
     * Translate company status
     */
    private translateStatus;
    /**
     * Determine tax regime
     */
    private determineTaxRegime;
    /**
     * Determine company size
     */
    private determineCompanySize;
    /**
     * Get tax benefits based on regime
     */
    private getTaxBenefits;
    /**
     * Get annual revenue limit
     */
    private getRevenueLimit;
}
//# sourceMappingURL=business.d.ts.map