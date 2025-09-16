/**
 * Business Services
 * CNPJ lookup, company information
 */
import axios from 'axios';
import { cnpj } from 'cpf-cnpj-validator';
export class BusinessService {
    receitaWSUrl = 'https://receitaws.com.br/v1/cnpj';
    /**
     * Look up company information by CNPJ
     */
    async lookupCNPJ(cnpjInput) {
        try {
            const cleanCNPJ = cnpjInput.replace(/\D/g, '');
            // Validate CNPJ first
            if (!cnpj.isValid(cleanCNPJ)) {
                return {
                    error: true,
                    message: 'Invalid CNPJ',
                };
            }
            // Call ReceitaWS API (free tier: 3 requests/minute)
            const response = await axios.get(`${this.receitaWSUrl}/${cleanCNPJ}`, {
                timeout: 10000,
                headers: {
                    Accept: 'application/json',
                },
            });
            if (response.data.status === 'ERROR') {
                return {
                    error: true,
                    message: response.data.message || 'CNPJ not found',
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
                legal_nature: data.tipo,
                registration_date: data.abertura,
                main_activity: {
                    code: data.atividade_principal?.[0]?.code,
                    description: data.atividade_principal?.[0]?.text,
                },
                secondary_activities: data.atividades_secundarias?.map((activity) => ({
                    code: activity.codigo,
                    description: activity.text,
                })) || [],
                address: {
                    street: data.logradouro,
                    number: data.numero,
                    complement: data.complemento,
                    neighborhood: data.bairro,
                    city: data.municipio,
                    state: data.uf,
                    postal_code: data.cep,
                },
                email: data.email,
                phone: data.telefone,
                capital: data.capital_social,
                partners: data.qsa?.map((partner) => ({
                    name: partner.nome,
                    qualification: partner.qual,
                })) || [],
                simples_nacional: {
                    opted: data.simples?.optante === true,
                    opted_date: data.simples?.data_opcao,
                    excluded_date: data.simples?.data_exclusao,
                },
                mei: {
                    opted: data.simei?.optante === true,
                    opted_date: data.simei?.data_opcao,
                    excluded_date: data.simei?.data_exclusao,
                },
                tax_regime: this.determineTaxRegime(data),
                size: this.determineCompanySize(data.porte),
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to lookup CNPJ';
            return {
                error: true,
                message: errorMessage,
            };
        }
    }
    /**
     * Check if company is in Simples Nacional
     */
    async checkSimplesNacional(cnpjInput) {
        try {
            const companyData = await this.lookupCNPJ(cnpjInput);
            if ('error' in companyData) {
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
                    status: isSimples ? 'ACTIVE' : 'NOT_OPTED',
                },
                mei: {
                    opted: isMEI,
                    opted_date: companyData.mei.opted_date,
                    excluded_date: companyData.mei.excluded_date,
                    status: isMEI ? 'ACTIVE' : 'NOT_OPTED',
                },
                tax_regime: companyData.tax_regime,
                can_issue_nfse: true,
                can_issue_nfe: !isMEI, // MEI has restrictions on NFe
                tax_benefits: this.getTaxBenefits(isSimples, isMEI),
                annual_revenue_limit: this.getRevenueLimit(isSimples, isMEI),
            };
        }
        catch (error) {
            return {
                error: true,
                message: error instanceof Error ? error.message : 'Failed to check Simples Nacional status',
            };
        }
    }
    /**
     * Translate company status
     */
    translateStatus(status) {
        const statusMap = {
            ATIVA: 'Active',
            SUSPENSA: 'Suspended',
            INAPTA: 'Inactive',
            BAIXADA: 'Closed',
            NULA: 'Null',
        };
        return statusMap[status] || status;
    }
    /**
     * Determine tax regime
     */
    determineTaxRegime(data) {
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
    determineCompanySize(porte) {
        const sizeMap = {
            ME: 'Microempresa',
            EPP: 'Empresa de Pequeno Porte',
            DEMAIS: 'Grande Porte',
        };
        return sizeMap[porte] || porte;
    }
    /**
     * Get tax benefits based on regime
     */
    getTaxBenefits(isSimples, isMEI) {
        const benefits = [];
        if (isMEI) {
            benefits.push('Fixed monthly tax (DAS-MEI)', 'Exempt from federal taxes', 'Simplified accounting', 'Social security benefits', 'Can issue invoice for services');
        }
        else if (isSimples) {
            benefits.push('Unified tax payment (DAS)', 'Reduced tax rates', 'Simplified accounting', 'Easier compliance', 'Progressive tax rates based on revenue');
        }
        else {
            benefits.push('Can offset taxes', 'More deduction options', 'International operations', 'No revenue limits');
        }
        return benefits;
    }
    /**
     * Get annual revenue limit
     */
    getRevenueLimit(isSimples, isMEI) {
        return {
            simples_limit: 4800000,
            mei_limit: 81000,
            current_regime_limit: isMEI ? 81000 : isSimples ? 4800000 : 0,
        };
    }
}
//# sourceMappingURL=business.js.map