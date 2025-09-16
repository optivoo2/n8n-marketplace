/**
 * Brazilian Document Validators
 * CPF, CNPJ, PIS, Voter ID, etc.
 */

import { cpf, cnpj } from 'cpf-cnpj-validator';

export class DocumentValidator {
  /**
   * Validate and format CPF
   */
  async validateCPF(cpfInput: string): Promise<{
    valid: boolean;
    formatted?: string;
    unformatted?: string;
    error?: string;
  }> {
    try {
      const cleanCPF = cpfInput.replace(/\D/g, '');
      
      if (cleanCPF.length !== 11) {
        return {
          valid: false,
          error: 'CPF must have 11 digits'
        };
      }

      const isValid = cpf.isValid(cleanCPF);
      
      if (isValid) {
        return {
          valid: true,
          formatted: cpf.format(cleanCPF),
          unformatted: cleanCPF
        };
      } else {
        return {
          valid: false,
          error: 'Invalid CPF checksum'
        };
      }
    } catch (error: unknown) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate and format CNPJ
   */
  async validateCNPJ(cnpjInput: string): Promise<{
    valid: boolean;
    formatted?: string;
    unformatted?: string;
    error?: string;
  }> {
    try {
      const cleanCNPJ = cnpjInput.replace(/\D/g, '');
      
      if (cleanCNPJ.length !== 14) {
        return {
          valid: false,
          error: 'CNPJ must have 14 digits'
        };
      }

      const isValid = cnpj.isValid(cleanCNPJ);
      
      if (isValid) {
        return {
          valid: true,
          formatted: cnpj.format(cleanCNPJ),
          unformatted: cleanCNPJ
        };
      } else {
        return {
          valid: false,
          error: 'Invalid CNPJ checksum'
        };
      }
    } catch (error: unknown) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate PIS/PASEP
   */
  async validatePIS(pisInput: string): Promise<{
    valid: boolean;
    formatted?: string;
    unformatted?: string;
    error?: string;
  }> {
    try {
      const cleanPIS = pisInput.replace(/\D/g, '');
      
      if (cleanPIS.length !== 11) {
        return {
          valid: false,
          error: 'PIS must have 11 digits'
        };
      }

      // PIS validation algorithm
      const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      let sum = 0;
      
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanPIS[i]) * weights[i];
      }
      
      const remainder = sum % 11;
      const checkDigit = remainder < 2 ? 0 : 11 - remainder;
      
      const isValid = checkDigit === parseInt(cleanPIS[10]);
      
      if (isValid) {
        // Format: XXX.XXXXX.XX-X
        const formatted = cleanPIS.replace(
          /^(\d{3})(\d{5})(\d{2})(\d{1})$/,
          '$1.$2.$3-$4'
        );
        
        return {
          valid: true,
          formatted,
          unformatted: cleanPIS
        };
      } else {
        return {
          valid: false,
          error: 'Invalid PIS checksum'
        };
      }
    } catch (error: unknown) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate Título de Eleitor (Voter ID)
   */
  async validateVoterID(voterIdInput: string): Promise<{
    valid: boolean;
    formatted?: string;
    unformatted?: string;
    state?: string;
    error?: string;
  }> {
    try {
      const cleanID = voterIdInput.replace(/\D/g, '');
      
      if (cleanID.length !== 12) {
        return {
          valid: false,
          error: 'Voter ID must have 12 digits'
        };
      }

      // Get state code (digits 9-10)
      const stateCode = parseInt(cleanID.substring(8, 10));
      
      // Map state codes
      const states: { [key: number]: string } = {
        1: 'SP', 2: 'MG', 3: 'RJ', 4: 'BA', 5: 'PR',
        6: 'SC', 7: 'RS', 8: 'ES', 9: 'DF', 10: 'SE',
        11: 'MS', 12: 'PB', 13: 'AC', 14: 'AM', 15: 'AP',
        16: 'PA', 17: 'MA', 18: 'PI', 19: 'CE', 20: 'RN',
        21: 'PE', 22: 'AL', 23: 'RR', 24: 'GO', 25: 'TO',
        26: 'MT', 27: 'RO'
      };

      // Validate check digits
      const sequential = cleanID.substring(0, 8);
      
      // First check digit
      let sum1 = 0;
      for (let i = 0; i < 8; i++) {
        sum1 += parseInt(sequential[i]) * (i + 2);
      }
      const digit1 = sum1 % 11;
      
      // Second check digit  
      let sum2 = 0;
      sum2 += stateCode * 7;
      sum2 += stateCode * 8;
      sum2 += digit1 * 9;
      const digit2 = sum2 % 11;
      
      const checkDigits = `${digit1}${digit2}`;
      const providedDigits = cleanID.substring(10, 12);
      
      const isValid = checkDigits === providedDigits;
      
      if (isValid) {
        // Format: XXXX XXXX XXXX
        const formatted = cleanID.replace(
          /^(\d{4})(\d{4})(\d{4})$/,
          '$1 $2 $3'
        );
        
        return {
          valid: true,
          formatted,
          unformatted: cleanID,
          state: states[stateCode] || 'Unknown'
        };
      } else {
        return {
          valid: false,
          error: 'Invalid Voter ID checksum'
        };
      }
    } catch (error: unknown) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
