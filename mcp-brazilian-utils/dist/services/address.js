/**
 * Address Services
 * CEP lookup, validation, distance calculation
 */
import axios from 'axios';
export class AddressService {
    viaCepUrl = 'https://viacep.com.br/ws';
    /**
     * Look up address by CEP
     */
    async lookupCEP(cepInput) {
        try {
            const cleanCEP = cepInput.replace(/\D/g, '');
            if (cleanCEP.length !== 8) {
                return {
                    error: true,
                    message: 'CEP must have 8 digits',
                };
            }
            const response = await axios.get(`${this.viaCepUrl}/${cleanCEP}/json/`);
            if (response.data.erro) {
                return {
                    error: true,
                    message: 'CEP not found',
                };
            }
            // Format the response
            return {
                cep: response.data.cep,
                street: response.data.logradouro,
                complement: response.data.complemento,
                neighborhood: response.data.bairro,
                city: response.data.localidade,
                state: response.data.uf,
                ibge_code: response.data.ibge,
                gia_code: response.data.gia,
                ddd: response.data.ddd,
                siafi_code: response.data.siafi,
                formatted_address: `${response.data.logradouro}, ${response.data.bairro}, ${response.data.localidade} - ${response.data.uf}, ${response.data.cep}`,
            };
        }
        catch (error) {
            return {
                error: true,
                message: error instanceof Error ? error.message : 'Failed to lookup CEP',
            };
        }
    }
    /**
     * Validate CEP format
     */
    async validateCEP(cepInput) {
        try {
            const cleanCEP = cepInput.replace(/\D/g, '');
            if (cleanCEP.length !== 8) {
                return {
                    valid: false,
                    error: 'CEP must have 8 digits',
                };
            }
            // Check if all digits are the same (invalid CEPs like 00000000)
            if (/^(\d)\1{7}$/.test(cleanCEP)) {
                return {
                    valid: false,
                    error: 'Invalid CEP pattern',
                };
            }
            // Format: XXXXX-XXX
            const formatted = cleanCEP.replace(/^(\d{5})(\d{3})$/, '$1-$2');
            return {
                valid: true,
                formatted,
                unformatted: cleanCEP,
            };
        }
        catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Calculate distance between two CEPs (approximation)
     */
    async calculateDistance(cep1Input, cep2Input) {
        try {
            // Look up both addresses
            const [addr1, addr2] = await Promise.all([
                this.lookupCEP(cep1Input),
                this.lookupCEP(cep2Input),
            ]);
            if (addr1.error || addr2.error) {
                return {
                    error: true,
                    message: 'Failed to lookup one or both CEPs',
                };
            }
            // Get coordinates (this would require a geocoding API in production)
            // For now, we'll use a simple approximation based on CEP ranges
            const cep1Num = parseInt(cep1Input.replace(/\D/g, ''));
            const cep2Num = parseInt(cep2Input.replace(/\D/g, ''));
            // Very rough approximation:
            // CEP differences of ~10000 = ~100km
            const cepDiff = Math.abs(cep1Num - cep2Num);
            const approximateKm = Math.round(cepDiff / 100);
            return {
                from: {
                    cep: addr1.cep,
                    city: addr1.city,
                    state: addr1.state,
                },
                to: {
                    cep: addr2.cep,
                    city: addr2.city,
                    state: addr2.state,
                },
                distance: {
                    km: approximateKm,
                    miles: Math.round(approximateKm * 0.621371),
                    warning: 'This is a rough approximation. For accurate distances, use a geocoding service.',
                },
                same_state: addr1.state === addr2.state,
                same_city: addr1.city === addr2.city,
            };
        }
        catch (error) {
            return {
                error: true,
                message: error instanceof Error ? error.message : 'Failed to calculate distance',
            };
        }
    }
}
//# sourceMappingURL=address.js.map