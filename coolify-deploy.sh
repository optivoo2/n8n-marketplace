#!/bin/bash

# n8n Template Marketplace - Coolify Deployment Script
# This script prepares and deploys the marketplace to Coolify

set -e

echo "🚀 n8n Template Marketplace - Coolify Deployment"
echo "================================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from env.example..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your actual values!"
    echo "   Especially: DB_PASSWORD, JWT_SECRET, MEILI_MASTER_KEY"
    read -p "Press enter after editing .env file to continue..."
fi

# Generate secure passwords if needed
if grep -q "your_secure_password_here" .env; then
    echo "🔐 Generating secure passwords..."
    DB_PASS=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 48)
    MEILI_KEY=$(openssl rand -base64 32)
    
    # Update .env with generated passwords
    sed -i "s/your_secure_password_here/$DB_PASS/g" .env
    sed -i "s/your_jwt_secret_here_must_be_long_and_random/$JWT_SECRET/g" .env
    sed -i "s/your_meilisearch_master_key_here/$MEILI_KEY/g" .env
    
    echo "✅ Passwords generated and saved to .env"
fi

# Create necessary directories
echo "📁 Creating project structure..."
mkdir -p api/routers
mkdir -p api/services
mkdir -p api/models
mkdir -p frontend
mkdir -p templates
mkdir -p nginx

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Build and start services
echo "🐳 Starting services with Docker Compose..."
docker-compose up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

# Initialize database
echo "🗄️ Initializing database..."
docker-compose exec -T api python -c "
from database import engine, Base
import asyncio

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('✅ Database initialized!')

asyncio.run(init_db())
" || echo "⚠️  Database initialization will happen on first API start"

# Show access URLs
echo ""
echo "✅ Deployment Complete!"
echo "========================"
echo "🌐 Access your services:"
echo "   - API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/api/docs"
echo "   - Frontend: http://localhost:3000"
echo "   - Meilisearch: http://localhost:7700"
echo "   - n8n: http://localhost:5678"
echo ""
echo "📋 Next steps:"
echo "   1. Import templates: curl -X POST http://localhost:8000/api/templates/import"
echo "   2. Access API docs for AI agents: http://localhost:8000/api/docs"
echo "   3. Configure Coolify with docker-compose.yml"
echo ""
echo "🔧 For Coolify deployment:"
echo "   1. Create new project in Coolify"
echo "   2. Select 'Docker Compose' as deployment method"
echo "   3. Upload this docker-compose.yml"
echo "   4. Set environment variables in Coolify"
echo "   5. Deploy!"
