#!/bin/bash

# Setup script for development environment with code health tools
# Run this after cloning the repository

set -e

echo "🚀 Setting up n8n Marketplace development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi
print_status "Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_status "npm $(npm -v) detected"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_warning "Python 3 is not installed (needed for API)"
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed (needed for services)"
fi

# Check Git
if ! command -v git &> /dev/null; then
    print_error "Git is not installed"
    exit 1
fi
print_status "Git $(git --version | cut -d ' ' -f 3) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Install Python dependencies if Python is available
if command -v python3 &> /dev/null; then
    echo ""
    echo "🐍 Installing Python dependencies..."
    cd api
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    pip install black flake8 mypy pylint bandit
    deactivate
    cd ..
    print_status "Python dependencies installed"
fi

# Setup Git hooks
echo ""
echo "🔗 Setting up Git hooks..."
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit 'npm run pre-commit'
print_status "Pre-commit hook installed"

# Add commit-msg hook for commitlint
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
print_status "Commit message linting hook installed"

# Add pre-push hook
cat > .husky/pre-push << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🚀 Running pre-push checks..."
npm run test:unit
npm run lint
EOF
chmod +x .husky/pre-push
print_status "Pre-push hook installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp env.example .env
    print_status ".env file created (please update with your values)"
else
    print_status ".env file already exists"
fi

# Setup VSCode settings
echo ""
echo "📝 Setting up VSCode configuration..."
mkdir -p .vscode

cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.exclude": {
    "**/.git": true,
    "**/.svn": true,
    "**/.hg": true,
    "**/CVS": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true,
    "**/*.pyc": true,
    "**/__pycache__": true
  },
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "[python]": {
    "editor.formatOnSave": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
EOF
print_status "VSCode settings configured"

cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "ms-azuretools.vscode-docker",
    "eamodio.gitlens",
    "streetsidesoftware.code-spell-checker",
    "usernamehw.errorlens",
    "sonarsource.sonarlint-vscode",
    "ms-vscode.vscode-typescript-tslint-plugin"
  ]
}
EOF
print_status "VSCode extensions recommendations added"

# Build projects
echo ""
echo "🔨 Building projects..."
npm run build
print_status "Projects built successfully"

# Run initial checks
echo ""
echo "🧪 Running initial checks..."

# Lint check
echo "  Running linter..."
if npm run lint &> /dev/null; then
    print_status "Linting passed"
else
    print_warning "Some linting issues found (run 'npm run lint:fix' to fix)"
fi

# Type check
echo "  Running type check..."
if npm run type-check &> /dev/null; then
    print_status "Type checking passed"
else
    print_warning "Some type errors found"
fi

# Test
echo "  Running tests..."
if npm test &> /dev/null; then
    print_status "Tests passed"
else
    print_warning "Some tests failed"
fi

# Docker services (optional)
if command -v docker &> /dev/null; then
    echo ""
    read -p "Do you want to start Docker services? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🐳 Starting Docker services..."
        docker-compose up -d postgres redis meilisearch
        print_status "Docker services started"
    fi
fi

# Summary
echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "📚 Quick Start Commands:"
echo "  npm run dev          - Start development servers"
echo "  npm run test         - Run tests"
echo "  npm run lint:fix     - Fix linting issues"
echo "  npm run commit       - Make a commit with commitizen"
echo "  npm run quality:check - Run all quality checks"
echo ""
echo "🔒 Security Commands:"
echo "  npm run security:audit - Run security audit"
echo "  npm run deps:check    - Check for outdated dependencies"
echo ""
echo "📖 Documentation:"
echo "  README.md           - Project overview"
echo "  PRD.md             - Product requirements"
echo "  MCP_BRAZILIAN_UTILS.md - MCP documentation"
echo ""
print_warning "Remember to update .env with your actual values!"
