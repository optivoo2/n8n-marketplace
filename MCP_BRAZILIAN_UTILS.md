# 🇧🇷 MCP Brazilian Utilities Suite
## AI-Agent Ready Tools for the Brazilian Market

---

## 📋 Executive Summary

**MCP (Model Context Protocol)** servers providing essential Brazilian business utilities as AI-agent tools. This will make your n8n marketplace the **go-to platform** for Brazilian automation needs.

### Why This Matters:
- **No competition** - First MCP suite focused on Brazilian market
- **High demand** - Every Brazilian business needs these utilities
- **AI-first** - LLMs can directly use these tools
- **Revenue potential** - Premium MCP access tier ($199/month)

---

## 🎯 Recommended SDK: TypeScript

### Why TypeScript over Python:
1. **Official Anthropic support** - Better maintained, more examples
2. **n8n compatibility** - n8n is Node.js based
3. **Better streaming** - Superior WebSocket/SSE support
4. **Larger ecosystem** - More MCP examples to reference

### Quick Start:
```bash
npm install @modelcontextprotocol/sdk
```

---

## 🚀 Brazilian Utilities to Implement

### 1. **Core Document Validators** (MUST HAVE)
```typescript
// brazilian-validator-mcp
- CNPJ validation & formatting
- CPF validation & formatting  
- RG validation (state-specific)
- CNH validation
- Título Eleitoral validation
- PIS/PASEP validation
- Inscrição Estadual validation
```

### 2. **Address & Location Services** (HIGH VALUE)
```typescript
// brazilian-address-mcp
- CEP lookup (ViaCEP API)
- Address normalization
- Distance calculation between CEPs
- Correios tracking
- IBGE city codes
- State/city validation
- Timezone detection
```

### 3. **Financial & Tax Utilities** (PREMIUM)
```typescript
// brazilian-finance-mcp
- Nota Fiscal validation (NFe, NFSe)
- Boleto generation & validation
- PIX key validation & QR code generation
- Bank account validation (digit verification)
- SELIC/CDI rate lookup
- Currency conversion (BRL focus)
- Tax calculation (ICMS, ISS, etc.)
```

### 4. **Business Registry Lookups** (UNIQUE)
```typescript
// brazilian-business-mcp
- Receita Federal CNPJ lookup
- Simples Nacional consultation
- SINTEGRA validation
- Junta Comercial search
- Anvisa product registration
- CRM/CRO/OAB registry validation
```

### 5. **Legal & Compliance** (DIFFERENTIATOR)
```typescript
// brazilian-legal-mcp
- LGPD compliance checker
- Contract template generator
- Labor law calculator (CLT)
- FGTS/INSS calculation
- Vacation/13th salary calculator
- Court case lookup (by CPF/CNPJ)
```

---

## 🔥 Unique APIs to Integrate

### 1. **Brasil.io** (Open Data)
```typescript
// Free, comprehensive Brazilian datasets
const BRASIL_IO_APIS = {
  covid19: "https://api.brasil.io/v1/covid19/",
  companies: "https://api.brasil.io/v1/companies/",
  elections: "https://api.brasil.io/v1/elections/",
  gazettes: "https://api.brasil.io/v1/gazettes/" // Diários Oficiais
};
```

### 2. **ReceitaWS** (CNPJ Data)
```typescript
// Free tier: 3 requests/minute
const receitaWS = async (cnpj: string) => {
  const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
  return response.json(); // Company details, partners, activities
};
```

### 3. **ViaCEP** (Address Lookup)
```typescript
// Unlimited free requests
const viaCEP = async (cep: string) => {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  return response.json(); // Full address details
};
```

### 4. **Banco Central APIs**
```typescript
const BACEN_APIS = {
  cotacao: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/",
  selic: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/",
  pix: "https://api.bcb.gov.br/pix/v2/" // Requires registration
};
```

### 5. **Serpro APIs** (Government)
```typescript
// Premium but official
const SERPRO_APIS = {
  cpf: "https://gateway.apiserpro.serpro.gov.br/consulta-cpf/v1/",
  cnpj: "https://gateway.apiserpro.serpro.gov.br/consulta-cnpj/v1/",
  nfe: "https://gateway.apiserpro.serpro.gov.br/nfe/v1/"
};
```

---

## 📦 Libraries to Clone/Reference

### 1. **MCP Servers to Clone** (Fastest Start)
```bash
# Official examples - great starting point
git clone https://github.com/modelcontextprotocol/servers

# Specific ones to study:
- servers/src/filesystem - File operations pattern
- servers/src/postgres - Database pattern
- servers/src/fetch - HTTP request pattern
```

### 2. **Brazilian Validation Libraries**
```bash
# JavaScript/TypeScript
npm install brazilian-utils  # Comprehensive validation
npm install cpf-cnpj-validator  # Focused validation
npm install node-boleto  # Boleto generation

# Python (if you choose Python)
pip install validate-docbr  # Document validation
pip install pycpfcnpj  # CPF/CNPJ
pip install brazilnum  # Multiple validators
```

### 3. **MCP TypeScript Template**
```bash
# Use this template for quick start
npx create-mcp-server brazilian-utils
cd brazilian-utils
npm install

# Add Brazilian libraries
npm install brazilian-utils axios
```

---

## 💻 Implementation Example

### Create Your First MCP Server
```typescript
// brazilian-validator-mcp/src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { isValid as isValidCPF, format as formatCPF } from '@fnando/cpf';
import { isValid as isValidCNPJ, format as formatCNPJ } from '@fnando/cnpj';
import axios from 'axios';

const server = new Server(
  {
    name: 'brazilian-utils',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'validate_cpf',
      description: 'Validate and format Brazilian CPF',
      inputSchema: {
        type: 'object',
        properties: {
          cpf: { type: 'string', description: 'CPF to validate' }
        },
        required: ['cpf']
      }
    },
    {
      name: 'validate_cnpj',
      description: 'Validate and format Brazilian CNPJ',
      inputSchema: {
        type: 'object',
        properties: {
          cnpj: { type: 'string', description: 'CNPJ to validate' }
        },
        required: ['cnpj']
      }
    },
    {
      name: 'lookup_cep',
      description: 'Look up Brazilian address by CEP',
      inputSchema: {
        type: 'object',
        properties: {
          cep: { type: 'string', description: 'CEP code' }
        },
        required: ['cep']
      }
    },
    {
      name: 'lookup_cnpj',
      description: 'Get company details by CNPJ',
      inputSchema: {
        type: 'object',
        properties: {
          cnpj: { type: 'string', description: 'CNPJ to lookup' }
        },
        required: ['cnpj']
      }
    },
    {
      name: 'generate_pix_qr',
      description: 'Generate PIX QR code data',
      inputSchema: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'PIX key' },
          amount: { type: 'number', description: 'Amount in BRL' },
          name: { type: 'string', description: 'Receiver name' }
        },
        required: ['key', 'amount', 'name']
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'validate_cpf': {
      const cpf = args.cpf as string;
      const isValid = isValidCPF(cpf);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              valid: isValid,
              formatted: isValid ? formatCPF(cpf) : null,
              original: cpf
            }, null, 2)
          }
        ]
      };
    }

    case 'validate_cnpj': {
      const cnpj = args.cnpj as string;
      const isValid = isValidCNPJ(cnpj);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              valid: isValid,
              formatted: isValid ? formatCNPJ(cnpj) : null,
              original: cnpj
            }, null, 2)
          }
        ]
      };
    }

    case 'lookup_cep': {
      const cep = (args.cep as string).replace(/\D/g, '');
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error looking up CEP: ${error.message}`
            }
          ]
        };
      }
    }

    case 'lookup_cnpj': {
      const cnpj = (args.cnpj as string).replace(/\D/g, '');
      try {
        const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error looking up CNPJ: ${error.message}`
            }
          ]
        };
      }
    }

    case 'generate_pix_qr': {
      // Simplified PIX payload generation
      const pixKey = args.key as string;
      const amount = args.amount as number;
      const name = args.name as string;
      
      // This is a simplified version - real implementation needs EMV format
      const payload = `00020126330014BR.GOV.BCB.PIX0111${pixKey}52040000530398654${amount.toFixed(2)}5802BR5913${name}6009SAO PAULO`;
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              payload,
              qr_string: payload,
              amount: amount,
              receiver: name
            }, null, 2)
          }
        ]
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport);
```

### Package.json
```json
{
  "name": "brazilian-utils-mcp",
  "version": "1.0.0",
  "description": "MCP server for Brazilian utilities",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "@fnando/cpf": "^1.0.2",
    "@fnando/cnpj": "^1.0.2",
    "axios": "^1.6.0",
    "brazilian-utils": "^1.0.0",
    "qrcode": "^1.5.3"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "tsx": "^4.0.0"
  }
}
```

---

## 🔗 Integration with n8n Marketplace

### 1. **Create MCP Registry in Your Database**
```sql
-- Add to your PostgreSQL schema
CREATE TABLE mcp_servers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    description TEXT,
    version VARCHAR(50),
    category VARCHAR(100),
    pricing_tier VARCHAR(50), -- free, premium, enterprise
    monthly_price DECIMAL(10,2),
    endpoints JSONB, -- List of available tools
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Track MCP usage for billing
CREATE TABLE mcp_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    server_name VARCHAR(255),
    tool_name VARCHAR(255),
    input_tokens INTEGER,
    output_tokens INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. **Add MCP Endpoints to Your API**
```python
# api/routers/mcp.py
from fastapi import APIRouter, Depends
from typing import List, Dict, Any
import subprocess
import json

router = APIRouter()

@router.get("/servers")
async def list_mcp_servers():
    """List available MCP servers"""
    return {
        "servers": [
            {
                "name": "brazilian-validator",
                "description": "CPF, CNPJ, CEP validation",
                "tier": "free",
                "tools": ["validate_cpf", "validate_cnpj", "lookup_cep"]
            },
            {
                "name": "brazilian-finance",
                "description": "PIX, Boleto, Tax calculations",
                "tier": "premium",
                "price": 49.90,
                "tools": ["generate_pix", "validate_boleto", "calculate_tax"]
            },
            {
                "name": "brazilian-business",
                "description": "Business registry lookups",
                "tier": "enterprise",
                "price": 199.90,
                "tools": ["receita_federal", "sintegra", "junta_comercial"]
            }
        ]
    }

@router.post("/servers/{server_name}/execute")
async def execute_mcp_tool(
    server_name: str,
    tool_name: str,
    parameters: Dict[str, Any]
):
    """Execute MCP tool via API"""
    # Check user permissions/billing
    
    # Execute MCP server
    result = subprocess.run(
        ["node", f"mcp-servers/{server_name}/dist/index.js"],
        input=json.dumps({
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": parameters
            }
        }),
        capture_output=True,
        text=True
    )
    
    return json.loads(result.stdout)
```

---

## 💰 Monetization Strategy

### Pricing Tiers:
```yaml
Free Tier:
  - Basic validators (CPF, CNPJ, CEP)
  - 100 calls/day
  - No SLA

Professional: R$ 49/month
  - All validators
  - Financial tools (PIX, Boleto)
  - 5,000 calls/day
  - Email support

Enterprise: R$ 199/month
  - All tools
  - Business registries
  - Legal/compliance tools
  - Unlimited calls
  - Priority support
  - Custom integrations
```

### Revenue Projection:
```
Month 1-3: Beta testing
Month 4-6: 
  - 50 Professional × R$49 = R$2,450
  - 10 Enterprise × R$199 = R$1,990
  Total: R$4,440/month

Month 7-12:
  - 200 Professional × R$49 = R$9,800
  - 50 Enterprise × R$199 = R$9,950
  Total: R$19,750/month
```

---

## 🚀 Quick Start Commands

```bash
# 1. Clone MCP examples
git clone https://github.com/modelcontextprotocol/servers mcp-examples
cd mcp-examples

# 2. Create your Brazilian utils server
mkdir brazilian-utils-mcp
cd brazilian-utils-mcp
npm init -y
npm install @modelcontextprotocol/sdk brazilian-utils axios

# 3. Copy the example code above

# 4. Build and test
npm run build
npm start

# 5. Test with Claude Desktop
# Add to claude_desktop_config.json:
{
  "mcpServers": {
    "brazilian-utils": {
      "command": "node",
      "args": ["/path/to/brazilian-utils-mcp/dist/index.js"]
    }
  }
}
```

---

## 🎯 Unique Value Propositions

### 1. **First-Mover Advantage**
- First comprehensive MCP suite for Brazil
- No direct competition

### 2. **AI-Agent Network Effects**
- Every AI using your MCP improves the dataset
- Usage patterns inform new tool development

### 3. **Enterprise Integration**
- Direct integration with major ERPs (TOTVS, SAP)
- Compliance automation for multinationals

### 4. **Government Partnerships**
- Official certification possibilities
- Serpro/Receita Federal partnerships

---

## 📊 Success Metrics

```yaml
Technical KPIs:
  - Tool response time: < 100ms
  - Accuracy rate: > 99.9%
  - Uptime: 99.95%

Business KPIs:
  - MCP servers deployed: 5+
  - Active users: 500+ by month 6
  - API calls/month: 1M+ by month 12
  - MRR from MCP: R$20,000 by month 12
```

---

## 🔥 Advanced Features (Future)

1. **Batch Operations**
   - Validate 1000s of CPFs/CNPJs at once
   - Bulk CEP lookups

2. **Webhooks**
   - Real-time CNPJ status changes
   - Receita Federal updates

3. **AI Training Data**
   - Anonymized validation patterns
   - Fraud detection models

4. **White-Label MCP**
   - Custom MCP servers for enterprises
   - Private deployments

---

**Ready to build the most comprehensive Brazilian AI toolkit!** 🚀🇧🇷
