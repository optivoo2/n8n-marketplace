#!/usr/bin/env node
/**
 * Brazilian Utilities MCP Server
 * Provides essential Brazilian business tools for AI agents
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  ToolsCapability 
} from '@modelcontextprotocol/sdk/types.js';

// Import Brazilian utilities
import { DocumentValidator } from './validators/documents.js';
import { AddressService } from './services/address.js';
import { FinanceService } from './services/finance.js';
import { BusinessService } from './services/business.js';
import { TaxCalculator } from './services/tax.js';

// Initialize services
const docValidator = new DocumentValidator();
const addressService = new AddressService();
const financeService = new FinanceService();
const businessService = new BusinessService();
const taxCalculator = new TaxCalculator();

// Create MCP server
const server = new Server(
  {
    name: 'brazilian-utils',
    version: '1.0.0',
    description: 'Essential Brazilian business utilities for AI agents'
  },
  {
    capabilities: {
      tools: {} as ToolsCapability
    }
  }
);

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
            description: 'CPF to validate (numbers only or formatted)' 
          }
        },
        required: ['cpf']
      }
    },
    {
      name: 'validate_cnpj',
      description: 'Validate and format Brazilian CNPJ (company tax ID)',
      inputSchema: {
        type: 'object',
        properties: {
          cnpj: { 
            type: 'string', 
            description: 'CNPJ to validate (numbers only or formatted)' 
          }
        },
        required: ['cnpj']
      }
    },
    {
      name: 'validate_pis',
      description: 'Validate Brazilian PIS/PASEP number',
      inputSchema: {
        type: 'object',
        properties: {
          pis: { 
            type: 'string', 
            description: 'PIS/PASEP to validate' 
          }
        },
        required: ['pis']
      }
    },
    {
      name: 'validate_voter_id',
      description: 'Validate Brazilian Título de Eleitor (voter ID)',
      inputSchema: {
        type: 'object',
        properties: {
          voter_id: { 
            type: 'string', 
            description: 'Voter ID to validate' 
          }
        },
        required: ['voter_id']
      }
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
            description: 'CEP code (8 digits)' 
          }
        },
        required: ['cep']
      }
    },
    {
      name: 'validate_cep',
      description: 'Validate if CEP format is correct',
      inputSchema: {
        type: 'object',
        properties: {
          cep: { 
            type: 'string', 
            description: 'CEP to validate' 
          }
        },
        required: ['cep']
      }
    },
    {
      name: 'calculate_distance',
      description: 'Calculate distance between two CEPs',
      inputSchema: {
        type: 'object',
        properties: {
          cep1: { 
            type: 'string', 
            description: 'First CEP' 
          },
          cep2: { 
            type: 'string', 
            description: 'Second CEP' 
          }
        },
        required: ['cep1', 'cep2']
      }
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
            description: 'PIX key (CPF, CNPJ, email, phone, or random)' 
          },
          amount: { 
            type: 'number', 
            description: 'Amount in BRL' 
          },
          receiver_name: { 
            type: 'string', 
            description: 'Receiver name' 
          },
          city: { 
            type: 'string', 
            description: 'Receiver city' 
          },
          description: { 
            type: 'string', 
            description: 'Payment description (optional)' 
          }
        },
        required: ['key', 'amount', 'receiver_name', 'city']
      }
    },
    {
      name: 'validate_pix_key',
      description: 'Validate PIX key format',
      inputSchema: {
        type: 'object',
        properties: {
          key: { 
            type: 'string', 
            description: 'PIX key to validate' 
          },
          key_type: { 
            type: 'string', 
            description: 'Type of key: cpf, cnpj, email, phone, or random',
            enum: ['cpf', 'cnpj', 'email', 'phone', 'random']
          }
        },
        required: ['key', 'key_type']
      }
    },
    {
      name: 'generate_boleto',
      description: 'Generate boleto bancário barcode',
      inputSchema: {
        type: 'object',
        properties: {
          bank_code: { 
            type: 'string', 
            description: 'Bank code (3 digits)' 
          },
          amount: { 
            type: 'number', 
            description: 'Amount in BRL' 
          },
          due_date: { 
            type: 'string', 
            description: 'Due date (YYYY-MM-DD)' 
          },
          document_number: { 
            type: 'string', 
            description: 'Document number' 
          }
        },
        required: ['bank_code', 'amount', 'due_date', 'document_number']
      }
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
            description: 'CNPJ to lookup' 
          }
        },
        required: ['cnpj']
      }
    },
    {
      name: 'check_simples_nacional',
      description: 'Check if company is in Simples Nacional tax regime',
      inputSchema: {
        type: 'object',
        properties: {
          cnpj: { 
            type: 'string', 
            description: 'CNPJ to check' 
          }
        },
        required: ['cnpj']
      }
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
            description: 'Monthly income in BRL' 
          },
          dependents: { 
            type: 'number', 
            description: 'Number of dependents',
            default: 0
          }
        },
        required: ['monthly_income']
      }
    },
    {
      name: 'calculate_inss',
      description: 'Calculate INSS (social security) contribution',
      inputSchema: {
        type: 'object',
        properties: {
          salary: { 
            type: 'number', 
            description: 'Monthly salary in BRL' 
          },
          type: { 
            type: 'string', 
            description: 'Type: employee or self-employed',
            enum: ['employee', 'self-employed'],
            default: 'employee'
          }
        },
        required: ['salary']
      }
    },
    {
      name: 'calculate_fgts',
      description: 'Calculate FGTS (employment guarantee fund)',
      inputSchema: {
        type: 'object',
        properties: {
          salary: { 
            type: 'number', 
            description: 'Monthly salary in BRL' 
          }
        },
        required: ['salary']
      }
    },
    {
      name: 'calculate_vacation',
      description: 'Calculate Brazilian vacation pay',
      inputSchema: {
        type: 'object',
        properties: {
          salary: { 
            type: 'number', 
            description: 'Monthly salary in BRL' 
          },
          days: { 
            type: 'number', 
            description: 'Vacation days (default 30)',
            default: 30
          },
          sell_days: { 
            type: 'number', 
            description: 'Days to sell (abono pecuniário)',
            default: 0
          }
        },
        required: ['salary']
      }
    },
    {
      name: 'calculate_13th_salary',
      description: 'Calculate 13th salary (Christmas bonus)',
      inputSchema: {
        type: 'object',
        properties: {
          salary: { 
            type: 'number', 
            description: 'Monthly salary in BRL' 
          },
          months_worked: { 
            type: 'number', 
            description: 'Months worked in the year',
            default: 12
          }
        },
        required: ['salary']
      }
    }
  ]
}));

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;

    switch (name) {
      // Document validation
      case 'validate_cpf':
        result = await docValidator.validateCPF(args.cpf as string);
        break;
      
      case 'validate_cnpj':
        result = await docValidator.validateCNPJ(args.cnpj as string);
        break;
      
      case 'validate_pis':
        result = await docValidator.validatePIS(args.pis as string);
        break;
      
      case 'validate_voter_id':
        result = await docValidator.validateVoterID(args.voter_id as string);
        break;
      
      // Address services
      case 'lookup_cep':
        result = await addressService.lookupCEP(args.cep as string);
        break;
      
      case 'validate_cep':
        result = await addressService.validateCEP(args.cep as string);
        break;
      
      case 'calculate_distance':
        result = await addressService.calculateDistance(
          args.cep1 as string,
          args.cep2 as string
        );
        break;
      
      // Finance services
      case 'generate_pix_qr':
        result = await financeService.generatePixQR({
          key: args.key as string,
          amount: args.amount as number,
          receiverName: args.receiver_name as string,
          city: args.city as string,
          description: args.description as string
        });
        break;
      
      case 'validate_pix_key':
        result = await financeService.validatePixKey(
          args.key as string,
          args.key_type as string
        );
        break;
      
      case 'generate_boleto':
        result = await financeService.generateBoleto({
          bankCode: args.bank_code as string,
          amount: args.amount as number,
          dueDate: args.due_date as string,
          documentNumber: args.document_number as string
        });
        break;
      
      // Business lookups
      case 'lookup_cnpj':
        result = await businessService.lookupCNPJ(args.cnpj as string);
        break;
      
      case 'check_simples_nacional':
        result = await businessService.checkSimplesNacional(args.cnpj as string);
        break;
      
      // Tax calculations
      case 'calculate_income_tax':
        result = await taxCalculator.calculateIncomeTax(
          args.monthly_income as number,
          args.dependents as number || 0
        );
        break;
      
      case 'calculate_inss':
        result = await taxCalculator.calculateINSS(
          args.salary as number,
          args.type as string || 'employee'
        );
        break;
      
      case 'calculate_fgts':
        result = await taxCalculator.calculateFGTS(args.salary as number);
        break;
      
      case 'calculate_vacation':
        result = await taxCalculator.calculateVacation(
          args.salary as number,
          args.days as number || 30,
          args.sell_days as number || 0
        );
        break;
      
      case 'calculate_13th_salary':
        result = await taxCalculator.calculate13thSalary(
          args.salary as number,
          args.months_worked as number || 12
        );
        break;
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };

  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: true,
            message: error.message || 'An error occurred',
            tool: name
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Brazilian Utils MCP Server started successfully');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
