/**
 * Tax Calculator Services
 * Income tax, INSS, FGTS, vacation, 13th salary
 */
import type { FGTSResult, INSSResult, IRPFResult, ThirteenthSalaryResult, VacationResult } from '../types.js';
export declare class TaxCalculator {
    /**
     * Calculate Brazilian income tax (IRPF)
     */
    calculateIncomeTax(monthlyIncome: number, dependents?: number): Promise<IRPFResult | {
        error: boolean;
        message: string;
    }>;
    /**
     * Calculate INSS contribution
     */
    calculateINSS(salary: number, type?: string): Promise<INSSResult | {
        error: boolean;
        message: string;
    }>;
    /**
     * Calculate FGTS (employment guarantee fund)
     */
    calculateFGTS(salary: number): Promise<FGTSResult | {
        error: boolean;
        message: string;
    }>;
    /**
     * Calculate vacation pay
     */
    calculateVacation(salary: number, days?: number, sellDays?: number): Promise<VacationResult | {
        error: boolean;
        message: string;
    }>;
    /**
     * Calculate 13th salary (Christmas bonus)
     */
    calculate13thSalary(salary: number, monthsWorked?: number): Promise<ThirteenthSalaryResult | {
        error: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=tax.d.ts.map