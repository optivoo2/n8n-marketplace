/**
 * Brazilian Document Validators
 * CPF, CNPJ, PIS, Voter ID, etc.
 */
export declare class DocumentValidator {
    /**
     * Validate and format CPF
     */
    validateCPF(cpfInput: string): Promise<{
        valid: boolean;
        formatted?: string;
        unformatted?: string;
        error?: string;
    }>;
    /**
     * Validate and format CNPJ
     */
    validateCNPJ(cnpjInput: string): Promise<{
        valid: boolean;
        formatted?: string;
        unformatted?: string;
        error?: string;
    }>;
    /**
     * Validate PIS/PASEP
     */
    validatePIS(pisInput: string): Promise<{
        valid: boolean;
        formatted?: string;
        unformatted?: string;
        error?: string;
    }>;
    /**
     * Validate Título de Eleitor (Voter ID)
     */
    validateVoterID(voterIdInput: string): Promise<{
        valid: boolean;
        formatted?: string;
        unformatted?: string;
        state?: string;
        error?: string;
    }>;
}
//# sourceMappingURL=documents.d.ts.map