#!/usr/bin/env node
/**
 * Brazilian Utilities MCP Server
 * Provides essential Brazilian business tools for AI agents
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
// Import Brazilian utilities
import { AddressService } from './services/address.js';
import { BusinessService } from './services/business.js';
import { FinanceService } from './services/finance.js';
import { TaxCalculator } from './services/tax.js';
import { DocumentValidator } from './validators/documents.js';
// Initialize services
const docValidator = new DocumentValidator();
const addressService = new AddressService();
const financeService = new FinanceService();
const businessService = new BusinessService();
const taxCalculator = new TaxCalculator();
// Create MCP server
const server = new Server({
    name: 'brazilian-utils',
    version: '1.0.0',
    description: 'Essential Brazilian business utilities for AI agents',
}, {
    capabilities: {
        tools: {},
    },
});
// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        // Document validation tools
        {
            name: 'validate_cpf',
            description: 'Validate and format Brazilian CPF (individual tax ID)',
            inputSchema: {
                type: 'object',
                properties: {
                    cpf: {
                        type: 'string',
                        description: 'CPF to validate (numbers only or formatted)',
                    },
                },
                required: ['cpf'],
            },
        },
        {
            name: 'validate_cnpj',
            description: 'Validate and format Brazilian CNPJ (company tax ID)',
            inputSchema: {
                type: 'object',
                properties: {
                    cnpj: {
                        type: 'string',
                        description: 'CNPJ to validate (numbers only or formatted)',
                    },
                },
                required: ['cnpj'],
            },
        },
        {
            name: 'validate_pis',
            description: 'Validate Brazilian PIS/PASEP number',
            inputSchema: {
                type: 'object',
                properties: {
                    pis: {
                        type: 'string',
                        description: 'PIS/PASEP to validate',
                    },
                },
                required: ['pis'],
            },
        },
        {
            name: 'validate_voter_id',
            description: 'Validate Brazilian Título de Eleitor (voter ID)',
            inputSchema: {
                type: 'object',
                properties: {
                    voter_id: {
                        type: 'string',
                        description: 'Voter ID to validate',
                    },
                },
                required: ['voter_id'],
            },
        },
        // Address tools
        {
            name: 'lookup_cep',
            description: 'Look up Brazilian address by CEP (postal code)',
            inputSchema: {
                type: 'object',
                properties: {
                    cep: {
                        type: 'string',
                        description: 'CEP code (8 digits)',
                    },
                },
                required: ['cep'],
            },
        },
        {
            name: 'validate_cep',
            description: 'Validate if CEP format is correct',
            inputSchema: {
                type: 'object',
                properties: {
                    cep: {
                        type: 'string',
                        description: 'CEP to validate',
                    },
                },
                required: ['cep'],
            },
        },
        {
            name: 'calculate_distance',
            description: 'Calculate distance between two CEPs',
            inputSchema: {
                type: 'object',
                properties: {
                    cep1: {
                        type: 'string',
                        description: 'First CEP',
                    },
                    cep2: {
                        type: 'string',
                        description: 'Second CEP',
                    },
                },
                required: ['cep1', 'cep2'],
            },
        },
        // Finance tools
        {
            name: 'generate_pix_qr',
            description: 'Generate PIX payment QR code data',
            inputSchema: {
                type: 'object',
                properties: {
                    key: {
                        type: 'string',
                        description: 'PIX key (CPF, CNPJ, email, phone, or random)',
                    },
                    amount: {
                        type: 'number',
                        description: 'Amount in BRL',
                    },
                    receiver_name: {
                        type: 'string',
                        description: 'Receiver name',
                    },
                    city: {
                        type: 'string',
                        description: 'Receiver city',
                    },
                    description: {
                        type: 'string',
                        description: 'Payment description (optional)',
                    },
                },
                required: ['key', 'amount', 'receiver_name', 'city'],
            },
        },
        {
            name: 'validate_pix_key',
            description: 'Validate PIX key format',
            inputSchema: {
                type: 'object',
                properties: {
                    key: {
                        type: 'string',
                        description: 'PIX key to validate',
                    },
                    key_type: {
                        type: 'string',
                        description: 'Type of key: cpf, cnpj, email, phone, or random',
                        enum: ['cpf', 'cnpj', 'email', 'phone', 'random'],
                    },
                },
                required: ['key', 'key_type'],
            },
        },
        {
            name: 'generate_boleto',
            description: 'Generate boleto bancário barcode',
            inputSchema: {
                type: 'object',
                properties: {
                    bank_code: {
                        type: 'string',
                        description: 'Bank code (3 digits)',
                    },
                    amount: {
                        type: 'number',
                        description: 'Amount in BRL',
                    },
                    due_date: {
                        type: 'string',
                        description: 'Due date (YYYY-MM-DD)',
                    },
                    document_number: {
                        type: 'string',
                        description: 'Document number',
                    },
                },
                required: ['bank_code', 'amount', 'due_date', 'document_number'],
            },
        },
        // Business lookup tools
        {
            name: 'lookup_cnpj',
            description: 'Get company details from CNPJ (via ReceitaWS)',
            inputSchema: {
                type: 'object',
                properties: {
                    cnpj: {
                        type: 'string',
                        description: 'CNPJ to lookup',
                    },
                },
                required: ['cnpj'],
            },
        },
        {
            name: 'check_simples_nacional',
            description: 'Check if company is in Simples Nacional tax regime',
            inputSchema: {
                type: 'object',
                properties: {
                    cnpj: {
                        type: 'string',
                        description: 'CNPJ to check',
                    },
                },
                required: ['cnpj'],
            },
        },
        // Tax calculation tools
        {
            name: 'calculate_income_tax',
            description: 'Calculate Brazilian income tax (IRPF)',
            inputSchema: {
                type: 'object',
                properties: {
                    monthly_income: {
                        type: 'number',
                        description: 'Monthly income in BRL',
                    },
                    dependents: {
                        type: 'number',
                        description: 'Number of dependents',
                        default: 0,
                    },
                },
                required: ['monthly_income'],
            },
        },
        {
            name: 'calculate_inss',
            description: 'Calculate INSS (social security) contribution',
            inputSchema: {
                type: 'object',
                properties: {
                    salary: {
                        type: 'number',
                        description: 'Monthly salary in BRL',
                    },
                    type: {
                        type: 'string',
                        description: 'Type: employee or self-employed',
                        enum: ['employee', 'self-employed'],
                        default: 'employee',
                    },
                },
                required: ['salary'],
            },
        },
        {
            name: 'calculate_fgts',
            description: 'Calculate FGTS (employment guarantee fund)',
            inputSchema: {
                type: 'object',
                properties: {
                    salary: {
                        type: 'number',
                        description: 'Monthly salary in BRL',
                    },
                },
                required: ['salary'],
            },
        },
        {
            name: 'calculate_vacation',
            description: 'Calculate Brazilian vacation pay',
            inputSchema: {
                type: 'object',
                properties: {
                    salary: {
                        type: 'number',
                        description: 'Monthly salary in BRL',
                    },
                    days: {
                        type: 'number',
                        description: 'Vacation days (default 30)',
                        default: 30,
                    },
                    sell_days: {
                        type: 'number',
                        description: 'Days to sell (abono pecuniário)',
                        default: 0,
                    },
                },
                required: ['salary'],
            },
        },
        {
            name: 'calculate_13th_salary',
            description: 'Calculate 13th salary (Christmas bonus)',
            inputSchema: {
                type: 'object',
                properties: {
                    salary: {
                        type: 'number',
                        description: 'Monthly salary in BRL',
                    },
                    months_worked: {
                        type: 'number',
                        description: 'Months worked in the year',
                        default: 12,
                    },
                },
                required: ['salary'],
            },
        },
    ],
}));
// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        // Validate that args exist
        if (!args) {
            throw new Error(`Tool '${name}' requires arguments but none were provided`);
        }
        const toolArgs = args;
        switch (name) {
            // Document validation
            case 'validate_cpf':
                result = await docValidator.validateCPF(toolArgs.cpf);
                break;
            case 'validate_cnpj':
                result = await docValidator.validateCNPJ(toolArgs.cnpj);
                break;
            case 'validate_pis':
                result = await docValidator.validatePIS(toolArgs.pis);
                break;
            case 'validate_voter_id':
                result = await docValidator.validateVoterID(toolArgs.voter_id);
                break;
            // Address services
            case 'lookup_cep':
                result = await addressService.lookupCEP(toolArgs.cep);
                break;
            case 'validate_cep':
                result = await addressService.validateCEP(toolArgs.cep);
                break;
            case 'calculate_distance':
                {
                    const distanceArgs = toolArgs;
                    result = await addressService.calculateDistance(distanceArgs.cep1, distanceArgs.cep2);
                }
                break;
            // Finance services
            case 'generate_pix_qr':
                {
                    const pixArgs = toolArgs;
                    result = await financeService.generatePixQR({
                        key: pixArgs.key,
                        amount: pixArgs.amount,
                        receiverName: pixArgs.receiver_name,
                        city: pixArgs.city,
                        description: pixArgs.description,
                    });
                }
                break;
            case 'validate_pix_key':
                {
                    const pixKeyArgs = toolArgs;
                    result = await financeService.validatePixKey(pixKeyArgs.key, pixKeyArgs.key_type);
                }
                break;
            case 'generate_boleto':
                {
                    const boletoArgs = toolArgs;
                    result = await financeService.generateBoleto({
                        bankCode: boletoArgs.bank_code,
                        amount: boletoArgs.amount,
                        dueDate: boletoArgs.due_date,
                        documentNumber: boletoArgs.document_number,
                    });
                }
                break;
            // Business lookups
            case 'lookup_cnpj':
                result = await businessService.lookupCNPJ(toolArgs.cnpj);
                break;
            case 'check_simples_nacional':
                result = await businessService.checkSimplesNacional(toolArgs.cnpj);
                break;
            // Tax calculations
            case 'calculate_income_tax':
                {
                    const incomeArgs = toolArgs;
                    result = await taxCalculator.calculateIncomeTax(incomeArgs.monthly_income, incomeArgs.dependents || 0);
                }
                break;
            case 'calculate_inss':
                {
                    const inssArgs = toolArgs;
                    result = await taxCalculator.calculateINSS(inssArgs.salary, inssArgs.type || 'employee');
                }
                break;
            case 'calculate_fgts':
                result = await taxCalculator.calculateFGTS(toolArgs.salary);
                break;
            case 'calculate_vacation':
                {
                    const vacationArgs = toolArgs;
                    result = await taxCalculator.calculateVacation(vacationArgs.salary, vacationArgs.days || 30, vacationArgs.sell_days || 0);
                }
                break;
            case 'calculate_13th_salary':
                {
                    const thirteenthArgs = toolArgs;
                    result = await taxCalculator.calculate13thSalary(thirteenthArgs.salary, thirteenthArgs.months_worked || 12);
                }
                break;
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        error: true,
                        message: errorMessage,
                        tool: name,
                    }, null, 2),
                },
            ],
            isError: true,
        };
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Brazilian Utils MCP Server started successfully');
}
main().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map