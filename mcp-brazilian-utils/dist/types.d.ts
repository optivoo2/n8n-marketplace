/**
 * Type definitions for Brazilian Utils MCP Server
 */
export interface ValidationResult {
    valid: boolean;
    formatted?: string;
    errors?: string[];
}
export interface AddressResult {
    [key: string]: unknown;
    cep?: string;
    logradouro?: string;
    complemento?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
    ibge?: string;
    gia?: string;
    ddd?: string;
    siafi?: string;
    street?: string;
    city?: string;
    state?: string;
    complement?: string;
    neighborhood?: string;
    ibge_code?: string;
    gia_code?: string;
    error?: boolean;
    message?: string;
}
export interface BusinessResult {
    cnpj: string;
    nome: string;
    fantasia?: string;
    atividade_principal: Array<{
        code: string;
        text: string;
    }>;
    natureza_juridica: string;
    porte: string;
    endereco: {
        logradouro: string;
        numero: string;
        complemento?: string;
        bairro: string;
        municipio: string;
        uf: string;
        cep: string;
    };
    situacao: string;
    data_situacao: string;
}
export interface CNPJLookupResult {
    cnpj: string;
    company_name: string;
    trade_name?: string;
    legal_nature: string;
    main_activity: {
        code: string;
        description: string;
    };
    secondary_activities: Array<{
        code: string;
        description: string;
    }>;
    address: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        postal_code: string;
    };
    partners: Array<{
        name: string;
        qualification: string;
    }>;
    status: string;
    status_date: string;
    status_reason?: string;
    phone?: string;
    email?: string;
    capital: number;
    registration_date: string;
    size: string;
    simples_nacional: {
        opted: boolean;
        opted_date?: string;
        excluded_date?: string;
    };
    mei: {
        opted: boolean;
        opted_date?: string;
        excluded_date?: string;
    };
    tax_regime: string;
    error?: boolean;
    message?: string;
}
export interface SimplesNacionalResult {
    cnpj: string;
    company_name: string;
    simples_nacional: {
        opted: boolean;
        opted_date?: string;
        excluded_date?: string;
        status?: string;
    };
    mei: {
        opted: boolean;
        opted_date?: string;
        excluded_date?: string;
        status?: string;
    };
    tax_regime: string;
    can_issue_nfse?: boolean;
    can_issue_nfe?: boolean;
    tax_benefits?: string[];
    annual_revenue_limit?: {
        simples_limit: number;
        mei_limit: number;
        current_regime_limit: number;
    };
}
export interface TaxCalculationResult {
    original_amount: number;
    calculated_amount: number;
    tax_rate: number;
    deductions?: number;
    base_calculation?: number;
    details?: Record<string, unknown>;
}
export interface IRPFResult {
    gross_income: number;
    dependents: number;
    dependent_deduction: number;
    taxable_income: number;
    income_tax: number;
    effective_rate: number | string;
    marginal_rate: number;
    net_income: number;
    bracket: {
        min: number;
        max: number;
        rate: number;
        deduction: number;
    };
    tax_bracket?: {
        rate: string;
        range: string;
    };
    annual_tax?: number;
    annual_net?: number;
}
export interface INSSResult {
    gross_salary: number;
    inss_contribution: number;
    contribution_rate: number;
    salary_ceiling: number;
    net_salary: number;
    type: string;
    brackets_used: Array<{
        rate: number;
        min: number;
        max: number;
        applied_amount: number;
        contribution: number;
    }>;
    effective_rate?: string;
    employer_contribution?: number;
    total_cost?: number;
    annual_contribution?: number;
    annual_net?: number;
    max_contribution?: number;
    rate?: string;
}
export interface FGTSResult {
    gross_salary: number;
    fgts_deposit: number;
    fgts_rate: number;
    monthly_deposit: number;
    annual_deposit: number;
    salary?: number;
    employer_cost?: number;
    employee_receives?: number;
    withdrawal_conditions?: string[];
    fine_on_dismissal?: number;
}
export interface VacationResult {
    gross_salary: number;
    vacation_days: number;
    sold_days: number;
    vacation_pay: number;
    sold_vacation_pay: number;
    inss_on_vacation: number;
    irpf_on_vacation: number;
    total_vacation_amount: number;
    net_vacation_amount: number;
    salary?: number;
    constitutional_third?: number;
    total_gross?: number;
    deductions?: {
        inss: number;
        income_tax: number;
        total: number;
    };
    net_payment?: number;
    payment_date?: string;
}
export interface ThirteenthSalaryResult {
    gross_salary: number;
    months_worked: number;
    proportional_months: number;
    gross_13th: number;
    inss_13th: number;
    irpf_13th: number;
    net_13th: number;
    salary?: number;
    first_installment?: {
        amount: number;
        payment_date: string;
        deductions: number;
        net: number;
    };
    second_installment?: {
        gross: number;
        payment_date: string;
        deductions: {
            inss: number;
            income_tax: number;
            total: number;
        };
        net: number;
    };
    total_gross?: number;
    total_deductions?: number;
    total_net?: number;
    eligibility?: string;
}
export interface PIXResult {
    qr_code: string;
    pix_key: string;
    amount: number;
    description?: string;
    expiration?: string;
}
export interface PIXGenerationResult {
    qr_code: string;
    qr_code_base64?: string;
    brcode: string;
    pix_key: string;
    receiver_name: string;
    city: string;
    amount: number;
    description?: string;
    txid?: string;
    expiration?: string;
    created_at?: string;
    payload?: string;
    instructions?: string;
}
export interface PIXValidationResult {
    key: string;
    key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
    valid: boolean;
    formatted_key?: string;
    original_key?: string;
    additional_info?: {
        bank_name?: string;
        owner_name?: string;
        owner_type?: 'individual' | 'company';
    };
    error?: boolean;
    message?: string;
}
export interface BoletoResult {
    barcode: string;
    due_date: string;
    amount: number;
    bank_code: string;
    document_number: string;
}
export interface CPFValidationArgs {
    cpf: string;
}
export interface CNPJValidationArgs {
    cnpj: string;
}
export interface PISValidationArgs {
    pis: string;
}
export interface VoterIDValidationArgs {
    voter_id: string;
}
export interface CEPLookupArgs {
    cep: string;
}
export interface CEPValidationArgs {
    cep: string;
}
export interface CEPDistanceArgs {
    cep1: string;
    cep2: string;
}
export interface PIXGenerationArgs {
    key: string;
    amount: number;
    receiver_name: string;
    city: string;
    description?: string;
}
export interface PIXValidationArgs {
    key: string;
    key_type: string;
}
export interface BoletoGenerationArgs {
    bank_code: string;
    amount: number;
    due_date: string;
    document_number: string;
}
export interface CNPJLookupArgs {
    cnpj: string;
}
export interface SimplesNacionalArgs {
    cnpj: string;
}
export interface IRPFCalculationArgs {
    monthly_income: number;
    dependents?: number;
}
export interface INSSCalculationArgs {
    salary: number;
    type?: string;
}
export interface FGTSCalculationArgs {
    salary: number;
}
export interface VacationCalculationArgs {
    salary: number;
    days?: number;
    sell_days?: number;
}
export interface ThirteenthSalaryArgs {
    salary: number;
    months_worked?: number;
}
export type ToolArguments = CPFValidationArgs | CNPJValidationArgs | PISValidationArgs | VoterIDValidationArgs | CEPLookupArgs | CEPValidationArgs | CEPDistanceArgs | PIXGenerationArgs | PIXValidationArgs | BoletoGenerationArgs | CNPJLookupArgs | SimplesNacionalArgs | IRPFCalculationArgs | INSSCalculationArgs | FGTSCalculationArgs | VacationCalculationArgs | ThirteenthSalaryArgs;
export interface DistanceResult {
    distance_km?: number;
    distance?: Record<string, unknown>;
    details?: Record<string, unknown>;
    from?: Record<string, unknown>;
    to?: Record<string, unknown>;
    same_state?: boolean;
    same_city?: boolean;
    error?: boolean;
    message?: string;
}
export type ToolResult = ValidationResult | AddressResult | BusinessResult | CNPJLookupResult | SimplesNacionalResult | TaxCalculationResult | IRPFResult | INSSResult | FGTSResult | VacationResult | ThirteenthSalaryResult | PIXResult | PIXGenerationResult | PIXValidationResult | BoletoResult | DistanceResult | {
    message: string;
    error?: boolean;
};
//# sourceMappingURL=types.d.ts.map