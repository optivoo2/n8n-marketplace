/**
 * Tax Calculator Services
 * Income tax, INSS, FGTS, vacation, 13th salary
 */

import Decimal from 'decimal.js';
import type {
  FGTSResult,
  INSSResult,
  IRPFResult,
  ThirteenthSalaryResult,
  VacationResult,
} from '../types.js';

export class TaxCalculator {
  /**
   * Calculate Brazilian income tax (IRPF)
   */
  async calculateIncomeTax(
    monthlyIncome: number,
    dependents: number = 0
  ): Promise<IRPFResult | { error: boolean; message: string }> {
    try {
      const income = new Decimal(monthlyIncome);
      const dependentDeduction = new Decimal(189.59).mul(dependents);

      // 2024 tax brackets
      const brackets = [
        { min: 0, max: 2112.0, rate: 0, deduction: 0 },
        { min: 2112.01, max: 2826.65, rate: 0.075, deduction: 158.4 },
        { min: 2826.66, max: 3751.05, rate: 0.15, deduction: 370.4 },
        { min: 3751.06, max: 4664.68, rate: 0.225, deduction: 651.73 },
        { min: 4664.69, max: Infinity, rate: 0.275, deduction: 884.96 },
      ];

      // Calculate taxable income
      const taxableIncome = income.minus(dependentDeduction);

      // Find applicable bracket
      const bracket = brackets.find(b => taxableIncome.gte(b.min) && taxableIncome.lte(b.max));

      if (!bracket) {
        throw new Error('Could not determine tax bracket');
      }

      // Calculate tax
      let tax = new Decimal(0);
      if (bracket.rate > 0) {
        tax = taxableIncome.mul(bracket.rate).minus(bracket.deduction);
      }

      // Calculate effective rate
      const effectiveRate = income.gt(0) ? tax.div(income).mul(100) : new Decimal(0);

      return {
        gross_income: income.toNumber(),
        dependents,
        dependent_deduction: dependentDeduction.toNumber(),
        taxable_income: taxableIncome.toNumber(),
        tax_bracket: {
          rate: bracket.rate * 100 + '%',
          range: `R$ ${bracket.min.toFixed(2)} - ${bracket.max === Infinity ? '∞' : `R$ ${bracket.max.toFixed(2)}`}`,
        },
        income_tax: tax.toNumber(),
        net_income: income.minus(tax).toNumber(),
        effective_rate: effectiveRate.toFixed(2) + '%',
        annual_tax: tax.mul(12).toNumber(),
        annual_net: income.minus(tax).mul(12).toNumber(),
        marginal_rate: bracket.rate,
        bracket: {
          min: bracket.min,
          max: bracket.max,
          rate: bracket.rate,
          deduction: bracket.deduction,
        },
      };
    } catch (error: unknown) {
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Failed to calculate income tax',
      };
    }
  }

  /**
   * Calculate INSS contribution
   */
  async calculateINSS(
    salary: number,
    type: string = 'employee'
  ): Promise<INSSResult | { error: boolean; message: string }> {
    try {
      const salaryDecimal = new Decimal(salary);

      if (type === 'employee') {
        // 2024 INSS brackets for employees
        const brackets = [
          { min: 0, max: 1412.0, rate: 0.075 },
          { min: 1412.01, max: 2666.68, rate: 0.09 },
          { min: 2666.69, max: 4000.03, rate: 0.12 },
          { min: 4000.04, max: 7786.02, rate: 0.14 },
        ];

        let contribution = new Decimal(0);
        let previousMax = new Decimal(0);

        for (const bracket of brackets) {
          const bracketMin = new Decimal(bracket.min);
          const bracketMax = new Decimal(bracket.max);
          const rate = new Decimal(bracket.rate);

          if (salaryDecimal.gt(bracketMin)) {
            const taxableInThisBracket = Decimal.min(salaryDecimal, bracketMax).minus(previousMax);
            contribution = contribution.plus(taxableInThisBracket.mul(rate));
            previousMax = bracketMax;
          }

          if (salaryDecimal.lte(bracketMax)) {
            break;
          }
        }

        const effectiveRate = salaryDecimal.gt(0)
          ? contribution.div(salaryDecimal).mul(100)
          : new Decimal(0);

        return {
          gross_salary: salaryDecimal.toNumber(),
          type: 'Employee',
          inss_contribution: contribution.toNumber(),
          net_salary: salaryDecimal.minus(contribution).toNumber(),
          effective_rate: effectiveRate.toFixed(2) + '%',
          employer_contribution: salaryDecimal.mul(0.2).toNumber(), // Employer pays 20%
          total_cost: salaryDecimal.plus(salaryDecimal.mul(0.2)).toNumber(),
          annual_contribution: contribution.mul(12).toNumber(),
          annual_net: salaryDecimal.minus(contribution).mul(12).toNumber(),
          contribution_rate: 0.14,
          salary_ceiling: 7786.02,
          brackets_used: [{
            rate: 0.14,
            min: 0,
            max: 7786.02,
            applied_amount: salaryDecimal.toNumber(),
            contribution: contribution.toNumber(),
          }],
        };
      } else {
        // Self-employed contribution (simplified)
        const contribution = salaryDecimal.mul(0.2); // 20% for self-employed
        const maxContribution = new Decimal(7786.02).mul(0.2);
        const finalContribution = Decimal.min(contribution, maxContribution);

        return {
          gross_salary: salaryDecimal.toNumber(),
          type: 'Self-employed',
          inss_contribution: finalContribution.toNumber(),
          net_salary: salaryDecimal.minus(finalContribution).toNumber(),
          rate: '20%',
          max_contribution: maxContribution.toNumber(),
          annual_contribution: finalContribution.mul(12).toNumber(),
          contribution_rate: 0.20,
          salary_ceiling: 7786.02,
          brackets_used: [{
            rate: 0.20,
            min: 0,
            max: 7786.02,
            applied_amount: salaryDecimal.toNumber(),
            contribution: finalContribution.toNumber(),
          }],
        };
      }
    } catch (error: unknown) {
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Failed to calculate INSS',
      };
    }
  }

  /**
   * Calculate FGTS (employment guarantee fund)
   */
  async calculateFGTS(salary: number): Promise<FGTSResult | { error: boolean; message: string }> {
    try {
      const salaryDecimal = new Decimal(salary);
      const fgtsRate = new Decimal(0.08); // 8% standard rate
      const fgts = salaryDecimal.mul(fgtsRate);

      return {
        gross_salary: salaryDecimal.toNumber(),
        fgts_deposit: fgts.toNumber(),
        fgts_rate: 0.08,
        monthly_deposit: fgts.toNumber(),
        annual_deposit: fgts.mul(12).toNumber(),
        salary: salaryDecimal.toNumber(),
        employer_cost: fgts.toNumber(), // Paid by employer
        employee_receives: 0, // Not deducted from salary
        withdrawal_conditions: [
          'Dismissal without just cause',
          'Purchase of first home',
          'Retirement',
          'Serious illness',
          'Natural disasters',
        ],
        fine_on_dismissal: fgts.mul(12).mul(0.4).toNumber(), // 40% fine on unfair dismissal
      };
    } catch (error: unknown) {
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Failed to calculate FGTS',
      };
    }
  }

  /**
   * Calculate vacation pay
   */
  async calculateVacation(
    salary: number,
    days: number = 30,
    sellDays: number = 0
  ): Promise<VacationResult | { error: boolean; message: string }> {
    try {
      const salaryDecimal = new Decimal(salary);
      const vacationDays = new Decimal(days);
      const daysToSell = new Decimal(sellDays);

      // Validate inputs
      if (days > 30 || days < 0) {
        throw new Error('Vacation days must be between 0 and 30');
      }

      if (sellDays > 10 || sellDays < 0) {
        throw new Error('Can only sell up to 10 vacation days');
      }

      // Calculate base vacation pay
      const dailyRate = salaryDecimal.div(30);
      const vacationPay = dailyRate.mul(vacationDays);

      // Constitutional third (1/3 additional)
      const constitutionalThird = vacationPay.div(3);

      // Abono pecuniário (selling days)
      const soldDaysPayment = dailyRate.mul(daysToSell);
      const soldDaysThird = soldDaysPayment.div(3);

      // Total gross payment
      const totalGross = vacationPay
        .plus(constitutionalThird)
        .plus(soldDaysPayment)
        .plus(soldDaysThird);

      // Calculate deductions (simplified)
      const inssDeduction = await this.calculateINSS(totalGross.toNumber());
      const irpfDeduction = await this.calculateIncomeTax(totalGross.toNumber());

      const inssAmount = ('inss_contribution' in inssDeduction) ? inssDeduction.inss_contribution : 0;
      const irpfAmount = ('income_tax' in irpfDeduction) ? irpfDeduction.income_tax : 0;
      const totalDeductions = new Decimal(inssAmount).plus(irpfAmount);

      const netPayment = totalGross.minus(totalDeductions);

      return {
        gross_salary: salaryDecimal.toNumber(),
        vacation_days: days,
        sold_days: sellDays,
        vacation_pay: vacationPay.toNumber(),
        constitutional_third: constitutionalThird.toNumber(),
        sold_vacation_pay: soldDaysPayment.toNumber(),
        inss_on_vacation: inssAmount,
        irpf_on_vacation: irpfAmount,
        total_vacation_amount: totalGross.toNumber(),
        net_vacation_amount: netPayment.toNumber(),
        deductions: {
          inss: inssAmount,
          income_tax: irpfAmount,
          total: totalDeductions.toNumber(),
        },
        net_payment: netPayment.toNumber(),
        payment_date: 'Must be paid 2 days before vacation starts',
      };
    } catch (error: unknown) {
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Failed to calculate vacation',
      };
    }
  }

  /**
   * Calculate 13th salary (Christmas bonus)
   */
  async calculate13thSalary(
    salary: number,
    monthsWorked: number = 12
  ): Promise<ThirteenthSalaryResult | { error: boolean; message: string }> {
    try {
      const salaryDecimal = new Decimal(salary);
      const months = new Decimal(monthsWorked);

      // Validate months
      if (monthsWorked > 12 || monthsWorked < 0) {
        throw new Error('Months worked must be between 0 and 12');
      }

      // Calculate proportional 13th salary
      const proportional13th = salaryDecimal.mul(months).div(12);

      // First installment (paid between Feb-Nov, usually Nov 30)
      const firstInstallment = proportional13th.div(2);

      // Second installment (paid until Dec 20)
      const secondInstallmentGross = proportional13th.div(2);

      // Calculate deductions on second installment
      const inssDeduction = await this.calculateINSS(proportional13th.toNumber());
      const irpfDeduction = await this.calculateIncomeTax(proportional13th.toNumber());

      const inssAmount = ('inss_contribution' in inssDeduction) ? inssDeduction.inss_contribution : 0;
      const irpfAmount = ('income_tax' in irpfDeduction) ? irpfDeduction.income_tax : 0;
      const totalDeductions = new Decimal(inssAmount).plus(irpfAmount);

      const secondInstallmentNet = secondInstallmentGross.minus(totalDeductions);

      return {
        gross_salary: salaryDecimal.toNumber(),
        months_worked: monthsWorked,
        proportional_months: monthsWorked,
        gross_13th: proportional13th.toNumber(),
        inss_13th: inssAmount,
        irpf_13th: irpfAmount,
        net_13th: firstInstallment.plus(secondInstallmentNet).toNumber(),
        salary: salaryDecimal.toNumber(),
        first_installment: {
          amount: firstInstallment.toNumber(),
          payment_date: 'Until November 30',
          deductions: 0,
          net: firstInstallment.toNumber(),
        },
        second_installment: {
          gross: secondInstallmentGross.toNumber(),
          payment_date: 'Until December 20',
          deductions: {
            inss: inssAmount,
            income_tax: irpfAmount,
            total: totalDeductions.toNumber(),
          },
          net: secondInstallmentNet.toNumber(),
        },
        total_gross: proportional13th.toNumber(),
        total_deductions: totalDeductions.toNumber(),
        total_net: firstInstallment.plus(secondInstallmentNet).toNumber(),
        eligibility: monthsWorked >= 1 ? 'Eligible (worked 15+ days)' : 'Not eligible',
      };
    } catch (error: unknown) {
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Failed to calculate 13th salary',
      };
    }
  }
}
