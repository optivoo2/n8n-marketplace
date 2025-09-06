# 🚀 n8n Template Marketplace - AI-Agent Ready, Self-Hosted

A **self-hosted, AI-agent friendly** marketplace for n8n automation templates with freelancer connections. Built for **Coolify/Portainer** deployment with **no vendor lock-in**.

## ✨ Features

- **🤖 AI-Agent First API** - Natural language queries, bulk operations, structured responses
- **🔍 Lightning-Fast Search** - Meilisearch with PT-BR support
- **📦 2000+ Templates** - Auto-import from awesome-n8n-templates
- **👥 Freelancer Marketplace** - Connect businesses with automation experts
- **💰 Brazilian Payments** - Mercado Pago PIX + Stripe support
- **🐳 One-Click Deploy** - Docker Compose ready for Coolify/Portainer
- **🔒 100% Self-Hosted** - PostgreSQL, no Supabase, no vendor lock-in

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Coolify   │────▶│ Docker       │────▶│  PostgreSQL │
│  Portainer  │     │ Compose      │     │    Redis    │
└─────────────┘     └──────────────┘     │ Meilisearch │
                            │             └─────────────┘
                            ▼
                    ┌──────────────┐
                    │  FastAPI     │◀────▶ AI Agents
                    │  (Python)    │       (via API)
                    └──────────────┘
                            │
                    ┌──────────────┐
                    │  Next.js     │
                    │  Frontend    │
                    └──────────────┘
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone this marketplace
git clone https://github.com/yourusername/n8n-marketplace.git
cd n8n-marketplace

# Make deploy script executable
chmod +x coolify-deploy.sh

# Run automated setup
./coolify-deploy.sh
```

### 2. Deploy with Coolify

1. Open Coolify dashboard
2. Create new project → "Docker Compose"
3. Upload `docker-compose.yml`
4. Set environment variables from `env.example`
5. Click Deploy!

### 3. Deploy with Portainer

1. Open Portainer
2. Stacks → Add Stack
3. Paste `docker-compose.yml`
4. Add environment variables
5. Deploy the stack

## 🤖 AI Agent Integration

The API is designed for AI agents with multiple interaction modes:

### Natural Language Query
```bash
curl -X POST http://localhost:8000/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Find Gmail automation templates for marketing",
    "context": {"language": "pt-BR"}
  }'
```

### Structured Actions
```bash
curl -X POST http://localhost:8000/api/ai/action \
  -H "Content-Type: application/json" \
  -d '{
    "action": "search_templates",
    "parameters": {
      "category": "Gmail",
      "tags": ["automation", "marketing"],
      "limit": 10
    }
  }'
```

### Bulk Operations
```bash
curl -X POST http://localhost:8000/api/ai/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "operations": [
      {"action": "get_template", "id": 1},
      {"action": "find_freelancer", "skills": ["n8n", "gmail"]},
      {"action": "create_implementation", "template_id": 1, "budget": 500}
    ]
  }'
```

## 📊 Database Schema (Simple & Focused)

```sql
-- Core Tables Only
templates (id, title, description, category, source_url, json_content)
freelancers (id, name, skills, hourly_rate, rating)
implementations (id, template_id, freelancer_id, status, budget)
categories (id, name, slug, template_count)
```

## 🔧 Environment Variables

```env
# Database (PostgreSQL - no Supabase!)
DB_PASSWORD=your_secure_password
DATABASE_URL=postgresql://marketplace:password@postgres:5432/n8n_marketplace

# Search
MEILI_MASTER_KEY=your_32_char_key

# AI (optional but recommended)
OPENAI_API_KEY=sk-...

# Payments
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
```

## 📦 Import Templates

Templates are automatically imported on first start. To manually import:

```bash
# Import from awesome-n8n-templates
curl -X POST http://localhost:8000/api/templates/import

# Check import status
curl http://localhost:8000/api/templates/count
```

## 🌐 API Endpoints

- **API Docs**: http://localhost:8000/api/docs
- **Health Check**: http://localhost:8000/health
- **Templates**: http://localhost:8000/api/templates
- **Search**: http://localhost:8000/api/search
- **AI Query**: http://localhost:8000/api/ai/query

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python) - AI-agent friendly
- **Database**: PostgreSQL - self-hosted, no vendor lock
- **Search**: Meilisearch - blazing fast, PT-BR support
- **Cache**: Redis - for performance
- **Frontend**: Next.js (optional, API-first design)
- **Deploy**: Docker Compose + Coolify/Portainer

## 📈 Monetization Model

1. **Commission on Projects**: 10-20% on freelancer implementations
2. **Premium Freelancer Profiles**: Monthly subscription for featured placement
3. **API Access**: Paid tiers for high-volume AI agent access
4. **Custom Templates**: Commission on proprietary template sales

## 🔐 Security & Compliance

- ✅ Self-hosted - full data control
- ✅ No vendor lock-in
- ✅ LGPD compliant (Brazilian data protection)
- ✅ Template license tracking
- ✅ DMCA process ready

## 🚦 Production Checklist

- [ ] Set strong passwords in `.env`
- [ ] Configure SSL/TLS (use Nginx)
- [ ] Set up backups for PostgreSQL
- [ ] Configure Meilisearch API keys
- [ ] Set up payment webhooks
- [ ] Monitor with Portainer/Coolify

## 📚 Why This Architecture?

### vs. Fixing Your Current SaaS
- **Current**: 700+ lines schema, 1000+ lint errors, broken integrations
- **This**: 100 lines schema, clean start, focused purpose
- **Time to MVP**: 3-4 weeks vs 8-12 weeks

### vs. Using Supabase
- **No vendor lock-in** - own your infrastructure
- **Coolify/Portainer ready** - your deployment preference
- **Simpler** - just PostgreSQL, no complex RLS rules

### vs. Using Medusa.js or Similar
- **Lighter** - 4 tables vs 40+ tables
- **AI-optimized** - built for agent interactions
- **Faster setup** - hours not weeks

## 🎯 Next Steps

1. **Deploy with Coolify** - It's ready now!
2. **Import templates** - 2000+ ready to go
3. **Add freelancers** - Start with yourself
4. **Launch Beta** - Get feedback fast
5. **Iterate** - Add features based on usage

## 💡 Key Decisions Made

1. **FastAPI over Node.js** - Better for AI agents, async by default
2. **PostgreSQL over Supabase** - Full control, no vendor lock
3. **Meilisearch over Elasticsearch** - Simpler, faster, cheaper
4. **Docker Compose** - Works with both Coolify and Portainer
5. **Metadata-only storage** - Link to sources, avoid licensing issues

## 🤝 Support

- **Documentation**: `/api/docs`
- **Health Check**: `/health`
- **AI Integration Guide**: See AI Agent Integration section above

---

**Built for the Brazilian market** 🇧🇷 with global scalability in mind.
**No bloat, no complexity, just a focused marketplace that works.**
