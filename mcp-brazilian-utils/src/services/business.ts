/**
 * Business Services
 * CNPJ lookup, company information
 */

import axios from 'axios';
import { cnpj } from 'cpf-cnpj-validator';

export class BusinessService {
  private readonly receitaWSUrl = 'https://receitaws.com.br/v1/cnpj';
  
  /**
   * Look up company information by CNPJ
   */
  async lookupCNPJ(cnpjInput: string): Promise<any> {
    try {
      const cleanCNPJ = cnpjInput.replace(/\D/g, '');
      
      // Validate CNPJ first
      if (!cnpj.isValid(cleanCNPJ)) {
        return {
          error: true,
          message: 'Invalid CNPJ'
        };
      }

      // Call ReceitaWS API (free tier: 3 requests/minute)
      const response = await axios.get(
        `${this.receitaWSUrl}/${cleanCNPJ}`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.status === 'ERROR') {
        return {
          error: true,
          message: response.data.message || 'CNPJ not found'
        };
      }

      // Format the response
      const data = response.data;
      
      return {
        cnpj: cnpj.format(cleanCNPJ),
        company_name: data.nome,
        trade_name: data.fantasia || data.nome,
        status: this.translateStatus(data.situacao),
        status_date: data.data_situacao,
        status_reason: data.motivo_situacao,
        type: data.tipo,
        opening_date: data.abertura,
        legal_nature: data.natureza_juridica,
        main_activity: {
          code: data.atividade_principal?.[0]?.code,
          description: data.atividade_principal?.[0]?.text
        },
        secondary_activities: data.atividades_secundarias?.map((activity: any) => ({
          code: activity.code,
          description: activity.text
        })) || [],
        address: {
          street: data.logradouro,
          number: data.numero,
          complement: data.complemento,
          neighborhood: data.bairro,
          city: data.municipio,
          state: data.uf,
          cep: data.cep,
          formatted: `${data.logradouro}, ${data.numero}${data.complemento ? ' ' + data.complemento : ''}, ${data.bairro}, ${data.municipio} - ${data.uf}, CEP: ${data.cep}`
        },
        contact: {
          email: data.email,
          phone: data.telefone
        },
        capital: data.capital_social,
        partners: data.qsa?.map((partner: any) => ({
          name: partner.nome,
          role: partner.qual,
          country: partner.pais_origem,
          legal_representative_name: partner.nome_rep_legal,
          legal_representative_role: partner.qual_rep_legal
        })) || [],
        simples_nacional: {
          opted: data.simples?.optante === true,
          opted_date: data.simples?.data_opcao,
          excluded_date: data.simples?.data_exclusao
        },
        mei: {
          opted: data.simei?.optante === true,
          opted_date: data.simei?.data_opcao,
          excluded_date: data.simei?.data_exclusao
        },
        last_update: data.ultima_atualizacao,
        efr: data.efr,
        tax_regime: this.determineTaxRegime(data),
        size: this.determineCompanySize(data.porte)
      };
    } catch (error: any) {
      if (error.response?.status === 429) {
        return {
          error: true,
          message: 'Rate limit exceeded. Please wait 1 minute and try again.'
        };
      }
      
      return {
        error: true,
        message: error.message || 'Failed to lookup CNPJ'
      };
    }
  }

  /**
   * Check if company is in Simples Nacional
   */
  async checkSimplesNacional(cnpjInput: string): Promise<any> {
    try {
      const companyData = await this.lookupCNPJ(cnpjInput);
      
      if (companyData.error) {
        return companyData;
      }

      const isSimples = companyData.simples_nacional.opted;
      const isMEI = companyData.mei.opted;
      
      return {
        cnpj: companyData.cnpj,
        company_name: companyData.company_name,
        simples_nacional: {
          opted: isSimples,
          opted_date: companyData.simples_nacional.opted_date,
          excluded_date: companyData.simples_nacional.excluded_date,
          status: isSimples ? 'ACTIVE' : 'NOT_OPTED'
        },
        mei: {
          opted: isMEI,
          opted_date: companyData.mei.opted_date,
          excluded_date: companyData.mei.excluded_date,
          status: isMEI ? 'ACTIVE' : 'NOT_OPTED'
        },
        tax_regime: companyData.tax_regime,
        can_issue_nfse: true,
        can_issue_nfe: !isMEI, // MEI has restrictions on NFe
        tax_benefits: this.getTaxBenefits(isSimples, isMEI),
        annual_revenue_limit: this.getRevenueLimit(isSimples, isMEI)
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message || 'Failed to check Simples Nacional status'
      };
    }
  }

  /**
   * Translate company status
   */
  private translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ATIVA': 'Active',
      'SUSPENSA': 'Suspended',
      'INAPTA': 'Inactive',
      'BAIXADA': 'Closed',
      'NULA': 'Null'
    };
    
    return statusMap[status] || status;
  }

  /**
   * Determine tax regime
   */
  private determineTaxRegime(data: any): string {
    if (data.simei?.optante === true) {
      return 'MEI - Microempreendedor Individual';
    }
    if (data.simples?.optante === true) {
      return 'Simples Nacional';
    }
    if (data.porte === 'DEMAIS') {
      return 'Lucro Real';
    }
    return 'Lucro Presumido';
  }

  /**
   * Determine company size
   */
  private determineCompanySize(porte: string): string {
    const sizeMap: { [key: string]: string } = {
      'ME': 'Microempresa',
      'EPP': 'Empresa de Pequeno Porte',
      'DEMAIS': 'Grande Porte'
    };
    
    return sizeMap[porte] || porte;
  }

  /**
   * Get tax benefits based on regime
   */
  private getTaxBenefits(isSimples: boolean, isMEI: boolean): string[] {
    const benefits = [];
    
    if (isMEI) {
      benefits.push(
        'Fixed monthly tax (DAS-MEI)',
        'Exempt from federal taxes',
        'Simplified accounting',
        'Social security benefits',
        'Can issue invoice for services'
      );
    } else if (isSimples) {
      benefits.push(
        'Unified tax payment (DAS)',
        'Reduced tax rates',
        'Simplified accounting',
        'Easier compliance',
        'Progressive tax rates based on revenue'
      );
    } else {
      benefits.push(
        'Can offset taxes',
        'More deduction options',
        'International operations',
        'No revenue limits'
      );
    }
    
    return benefits;
  }

  /**
   * Get annual revenue limit
   */
  private getRevenueLimit(isSimples: boolean, isMEI: boolean): any {
    if (isMEI) {
      return {
        limit: 81000,
        currency: 'BRL',
        period: 'annual',
        description: 'R$ 81.000,00 per year'
      };
    }
    
    if (isSimples) {
      return {
        limit: 4800000,
        currency: 'BRL',
        period: 'annual',
        description: 'R$ 4.800.000,00 per year'
      };
    }
    
    return {
      limit: null,
      currency: 'BRL',
      period: 'annual',
      description: 'No revenue limit'
    };
  }
}
