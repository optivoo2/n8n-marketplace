/**
 * Finance Services
 * PIX, Boleto, payment validations
 */

import { cpf, cnpj } from 'cpf-cnpj-validator';

export class FinanceService {
  /**
   * Generate PIX QR Code payload
   */
  async generatePixQR(params: {
    key: string;
    amount: number;
    receiverName: string;
    city: string;
    description?: string;
  }): Promise<any> {
    try {
      const { key, amount, receiverName, city, description } = params;
      
      // Validate amount
      if (amount <= 0) {
        return {
          error: true,
          message: 'Amount must be greater than 0'
        };
      }

      // Generate EMV payload (simplified version)
      // In production, use a proper PIX library for full EMV compliance
      
      // Payload Format Indicator
      let payload = '000201';
      
      // Merchant Account Information
      payload += '26';
      
      // GUI (br.gov.bcb.pix)
      const gui = '0014br.gov.bcb.pix';
      
      // Key
      const keyLength = key.length.toString().padStart(2, '0');
      const keyInfo = `01${keyLength}${key}`;
      
      // Description (optional)
      let descInfo = '';
      if (description) {
        const descLength = description.length.toString().padStart(2, '0');
        descInfo = `02${descLength}${description}`;
      }
      
      const merchantInfo = gui + keyInfo + descInfo;
      const merchantLength = merchantInfo.length.toString().padStart(2, '0');
      payload += merchantLength + merchantInfo;
      
      // Merchant Category Code
      payload += '52040000';
      
      // Transaction Currency (986 = BRL)
      payload += '5303986';
      
      // Transaction Amount
      if (amount > 0) {
        const amountStr = amount.toFixed(2);
        const amountLength = amountStr.length.toString().padStart(2, '0');
        payload += `54${amountLength}${amountStr}`;
      }
      
      // Country Code (BR)
      payload += '5802BR';
      
      // Merchant Name
      const nameLength = receiverName.length.toString().padStart(2, '0');
      payload += `59${nameLength}${receiverName}`;
      
      // Merchant City
      const cityLength = city.length.toString().padStart(2, '0');
      payload += `60${cityLength}${city}`;
      
      // Additional Data Field Template
      payload += '62070503***';
      
      // CRC16 placeholder
      payload += '6304';
      
      // Calculate CRC16
      const crc = this.calculateCRC16(payload);
      payload += crc;
      
      return {
        payload,
        qr_code: payload,
        amount: amount,
        receiver: receiverName,
        key,
        city,
        description: description || null,
        brcode: `00020126${payload.length - 8}${payload.substring(8)}`,
        instructions: 'Use this payload to generate QR code image or copy as PIX code'
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message || 'Failed to generate PIX QR code'
      };
    }
  }

  /**
   * Validate PIX key format
   */
  async validatePixKey(key: string, keyType: string): Promise<any> {
    try {
      let isValid = false;
      let formattedKey = key;
      let additionalInfo: any = {};

      switch (keyType) {
        case 'cpf':
          const cleanCPF = key.replace(/\D/g, '');
          isValid = cpf.isValid(cleanCPF);
          if (isValid) {
            formattedKey = cpf.format(cleanCPF);
            additionalInfo.type = 'CPF';
          }
          break;
        
        case 'cnpj':
          const cleanCNPJ = key.replace(/\D/g, '');
          isValid = cnpj.isValid(cleanCNPJ);
          if (isValid) {
            formattedKey = cnpj.format(cleanCNPJ);
            additionalInfo.type = 'CNPJ';
          }
          break;
        
        case 'email':
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          isValid = emailRegex.test(key);
          additionalInfo.type = 'Email';
          break;
        
        case 'phone':
          // Brazilian phone validation (+55 XX XXXXX-XXXX)
          const cleanPhone = key.replace(/\D/g, '');
          if (cleanPhone.startsWith('55')) {
            isValid = cleanPhone.length === 13; // +55 + 11 digits
          } else {
            isValid = cleanPhone.length === 11; // 11 digits
          }
          if (isValid) {
            if (!cleanPhone.startsWith('55')) {
              formattedKey = `+55${cleanPhone}`;
            }
            additionalInfo.type = 'Phone';
            additionalInfo.formatted = formattedKey.replace(
              /^(\+55)(\d{2})(\d{5})(\d{4})$/,
              '$1 $2 $3-$4'
            );
          }
          break;
        
        case 'random':
          // UUID v4 validation
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          isValid = uuidRegex.test(key);
          additionalInfo.type = 'Random Key (UUID)';
          break;
        
        default:
          return {
            error: true,
            message: 'Invalid key type. Must be: cpf, cnpj, email, phone, or random'
          };
      }

      return {
        valid: isValid,
        key: formattedKey,
        original_key: key,
        key_type: keyType,
        ...additionalInfo,
        can_receive_pix: isValid,
        message: isValid ? 'Valid PIX key' : `Invalid ${keyType.toUpperCase()} format`
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message || 'Failed to validate PIX key'
      };
    }
  }

  /**
   * Generate Boleto barcode
   */
  async generateBoleto(params: {
    bankCode: string;
    amount: number;
    dueDate: string;
    documentNumber: string;
  }): Promise<any> {
    try {
      const { bankCode, amount, dueDate, documentNumber } = params;
      
      // Validate inputs
      if (bankCode.length !== 3) {
        return {
          error: true,
          message: 'Bank code must have 3 digits'
        };
      }

      if (amount <= 0) {
        return {
          error: true,
          message: 'Amount must be greater than 0'
        };
      }

      // Parse due date
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        return {
          error: true,
          message: 'Invalid due date format'
        };
      }

      // Calculate days since base date (07/10/1997)
      const baseDate = new Date('1997-10-07');
      const daysDiff = Math.floor((dueDateObj.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Format amount (10 digits, no decimal point)
      const amountStr = Math.round(amount * 100).toString().padStart(10, '0');
      
      // Generate simplified barcode (not production-ready)
      // Real implementation would need proper bank integration
      
      // Bank code (3 digits)
      let barcode = bankCode;
      
      // Currency code (9 = Real)
      barcode += '9';
      
      // Due date factor (4 digits)
      barcode += daysDiff.toString().padStart(4, '0');
      
      // Amount (10 digits)
      barcode += amountStr;
      
      // Field 1: Bank + Currency + First 5 positions of campo livre
      // Field 2: Next 10 positions of campo livre
      // Field 3: Next 10 positions of campo livre
      // Field 4: Check digit
      // Field 5: Due date factor + amount
      
      // Add random campo livre for demonstration (25 digits)
      const campoLivre = documentNumber.padStart(25, '0').substring(0, 25);
      barcode += campoLivre;
      
      // Calculate check digit
      const checkDigit = this.calculateBoletoCheckDigit(barcode);
      
      // Insert check digit at position 4
      const finalBarcode = barcode.substring(0, 4) + checkDigit + barcode.substring(4);
      
      // Format typeable line (linha digitável)
      const typeableLine = this.formatBoletoTypeableLine(finalBarcode);
      
      return {
        barcode: finalBarcode,
        typeable_line: typeableLine,
        bank_code: bankCode,
        bank_name: this.getBankName(bankCode),
        amount: amount,
        due_date: dueDate,
        document_number: documentNumber,
        warning: 'This is a simplified boleto generation. For production use, integrate with bank APIs.'
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message || 'Failed to generate boleto'
      };
    }
  }

  /**
   * Calculate CRC16 for PIX payload
   */
  private calculateCRC16(payload: string): string {
    const polynomial = 0x1021;
    let crc = 0xFFFF;
    
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ polynomial;
        } else {
          crc = crc << 1;
        }
      }
    }
    
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }

  /**
   * Calculate boleto check digit
   */
  private calculateBoletoCheckDigit(barcode: string): string {
    const sequence = [2, 3, 4, 5, 6, 7, 8, 9];
    let sum = 0;
    let multiplier = 0;
    
    for (let i = barcode.length - 1; i >= 0; i--) {
      sum += parseInt(barcode[i]) * sequence[multiplier];
      multiplier = (multiplier + 1) % sequence.length;
    }
    
    const remainder = sum % 11;
    const digit = 11 - remainder;
    
    if (digit === 0 || digit === 10 || digit === 11) {
      return '1';
    }
    
    return digit.toString();
  }

  /**
   * Format boleto typeable line
   */
  private formatBoletoTypeableLine(barcode: string): string {
    // Simplified formatting - real implementation is more complex
    const groups = [
      barcode.substring(0, 10),
      barcode.substring(10, 21),
      barcode.substring(21, 32),
      barcode.substring(32, 33),
      barcode.substring(33)
    ];
    
    return groups.join('.');
  }

  /**
   * Get bank name from code
   */
  private getBankName(code: string): string {
    const banks: { [key: string]: string } = {
      '001': 'Banco do Brasil',
      '033': 'Santander',
      '104': 'Caixa Econômica Federal',
      '237': 'Bradesco',
      '341': 'Itaú',
      '356': 'Banco Real',
      '389': 'Banco Mercantil do Brasil',
      '399': 'HSBC',
      '422': 'Banco Safra',
      '453': 'Banco Rural',
      '633': 'Banco Rendimento',
      '652': 'Itaú Unibanco',
      '745': 'Citibank'
    };
    
    return banks[code] || 'Unknown Bank';
  }
}
