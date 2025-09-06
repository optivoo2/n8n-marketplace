# 🇧🇷 Brazilian Utils MCP Server

MCP (Model Context Protocol) server providing essential Brazilian business utilities for AI agents.

## Features

### Document Validation
- **CPF** - Individual taxpayer ID validation and formatting
- **CNPJ** - Company taxpayer ID validation and formatting  
- **PIS/PASEP** - Social security number validation
- **Título de Eleitor** - Voter ID validation with state detection

### Address Services
- **CEP Lookup** - Full address lookup from postal code
- **CEP Validation** - Format validation
- **Distance Calculation** - Approximate distance between CEPs

### Financial Tools
- **PIX QR Code** - Generate payment QR codes
- **PIX Key Validation** - Validate CPF, CNPJ, email, phone, or random keys
- **Boleto Generation** - Generate payment barcodes

### Business Lookups
- **CNPJ Lookup** - Get full company details from ReceitaWS
- **Simples Nacional** - Check tax regime status

### Tax Calculations
- **Income Tax (IRPF)** - Calculate monthly income tax
- **INSS** - Social security contributions
- **FGTS** - Employment guarantee fund
- **Vacation Pay** - Including constitutional third
- **13th Salary** - Christmas bonus calculations

## Installation

```bash
# Clone the repository
cd mcp-brazilian-utils

# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

## Usage

### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "brazilian-utils": {
      "command": "node",
      "args": ["/path/to/mcp-brazilian-utils/dist/index.js"]
    }
  }
}
```

### Standalone Testing

```bash
# Run the server
npm start

# In another terminal, send requests
echo '{"method":"tools/list"}' | npm start
```

## Available Tools

### Document Validation

#### validate_cpf
Validates and formats Brazilian CPF.
```json
{
  "cpf": "12345678901"
}
```

#### validate_cnpj
Validates and formats Brazilian CNPJ.
```json
{
  "cnpj": "12345678000195"
}
```

### Address Services

#### lookup_cep
Get full address from CEP.
```json
{
  "cep": "01310-100"
}
```

### Financial Tools

#### generate_pix_qr
Generate PIX payment QR code.
```json
{
  "key": "user@example.com",
  "amount": 100.50,
  "receiver_name": "Company Name",
  "city": "São Paulo"
}
```

### Business Lookups

#### lookup_cnpj
Get company information.
```json
{
  "cnpj": "12345678000195"
}
```

### Tax Calculations

#### calculate_income_tax
Calculate Brazilian income tax.
```json
{
  "monthly_income": 5000,
  "dependents": 2
}
```

#### calculate_vacation
Calculate vacation payment.
```json
{
  "salary": 3000,
  "days": 30,
  "sell_days": 10
}
```

## Rate Limits

- **ReceitaWS**: 3 requests per minute (free tier)
- **ViaCEP**: Unlimited
- Consider implementing caching for production use

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Error Handling

All tools return structured responses with error handling:

```json
{
  "error": true,
  "message": "Detailed error message"
}
```

## License

MIT

## Contributing

Pull requests are welcome! Please ensure all validators follow Brazilian standards.

## Support

For issues or questions, please open an issue on GitHub.
