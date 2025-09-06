# 🤖 AI Agent Development Roadmap & Guidelines
**CRITICAL: This is the MASTER GUIDE - Update this document as tasks are completed**

## ⚠️ MANDATORY RULES FOR AI AGENTS

### 1. **NEVER Create Unnecessary Files**
- ✅ UPDATE existing files when possible
- ✅ Check if file exists BEFORE creating new
- ❌ NO creating README.md if one exists
- ❌ NO duplicate documentation files

### 2. **ALWAYS Follow This Process**
```
1. Read existing code/docs first
2. Check Context7 for library docs
3. Write tests BEFORE implementation
4. Implement feature
5. Run tests
6. Update THIS document
7. Commit with proper message format
8. Push to repo
```

### 3. **Project Structure - RESPECT IT**
```
/home/arthur/n8n-marketplace/
├── api/                    # FastAPI backend (Python)
│   ├── routers/           # API endpoints
│   ├── services/          # Business logic
│   └── database.py        # Database models
├── mcp-brazilian-utils/   # Brazilian MCP server
│   ├── src/              # TypeScript source
│   └── dist/             # Built files
├── /home/arthur/typescript-sdk/  # ConfirmaAI MCP (SEPARATE PROJECT - DO NOT MODIFY)
└── docs/                  # Documentation (UPDATE, don't duplicate)
```

---

## 📋 MASTER CHECKLIST - Update Status After Each Task

### Phase 1: Initial Setup ✅
- [x] Project structure created
- [x] README.md exists
- [x] PRD.md documented
- [x] Package.json configured
- [x] Docker-compose.yml ready
- [x] Environment variables template (env.example)
- [x] Pre-commit hooks configured
- [x] ESLint configuration
- [x] Prettier configuration
- [x] Jest configuration
- [x] CI/CD pipeline (.github/workflows/ci.yml)

### Phase 2: Dependencies & Environment 🚧
- [ ] Install Node.js dependencies
- [ ] Install Python dependencies for API
- [ ] Initialize Husky git hooks
- [ ] Set up VSCode settings
- [ ] Create .env from env.example
- [ ] Test Docker services startup

### Phase 3: Core API Implementation 🚧
- [x] Database models (database.py)
- [x] Template router (routers/templates.py)
- [x] Freelancer router (routers/freelancers.py)
- [x] Search router (routers/search.py)
- [x] Auth router (routers/auth.py)
- [x] Payment router (routers/payments.py)
- [x] Webhook router (routers/webhooks.py)
- [x] Meilisearch service (services/meilisearch_service.py)
- [x] AI Assistant service (services/ai_assistant.py)
- [ ] Write unit tests for each router
- [ ] Write integration tests
- [ ] Test with real data

### Phase 4: MCP Servers 🚧
- [x] Brazilian Utils MCP structure created
- [x] Document validators implemented
- [x] Address services implemented
- [x] Finance services implemented
- [x] Business services implemented
- [x] Tax calculator implemented
- [ ] Build TypeScript code
- [ ] Test each MCP tool
- [ ] Integration with marketplace API
- [ ] Write MCP tests

### Phase 5: Database & Migrations ⏳
- [ ] Install Alembic
- [ ] Create initial migration
- [ ] Seed database with sample data
- [ ] Test database operations
- [ ] Backup strategy

### Phase 6: Search Integration ⏳
- [ ] Start Meilisearch container
- [ ] Initialize indexes
- [ ] Import templates from GitHub
- [ ] Test search functionality
- [ ] Configure Portuguese synonyms

### Phase 7: Testing & Quality ⏳
- [ ] Run all unit tests
- [ ] Run integration tests
- [ ] Check code coverage (>70%)
- [ ] Fix all ESLint warnings
- [ ] Security audit
- [ ] Performance testing

### Phase 8: Deployment Preparation ⏳
- [ ] Build all Docker images
- [ ] Test docker-compose locally
- [ ] Configure production .env
- [ ] Set up monitoring
- [ ] Documentation review
- [ ] Create deployment scripts

---

## 🔧 STEP-BY-STEP SETUP GUIDE

### Step 1: Install Dependencies (DO THIS FIRST)
```bash
cd /home/arthur/n8n-marketplace

# Install Node dependencies
npm install

# Install Python dependencies
cd api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

# Install MCP dependencies
cd mcp-brazilian-utils
npm install
npm run build
cd ..
```

### Step 2: Set Up Environment
```bash
# Copy environment template
cp env.example .env

# Edit .env with actual values
# CRITICAL: Update these:
# - DB_PASSWORD
# - MEILI_MASTER_KEY
# - JWT_SECRET
```

### Step 3: Initialize Git Hooks
```bash
# Install Husky
npx husky install

# This enables pre-commit checks
npm run prepare
```

### Step 4: Start Docker Services
```bash
# Start core services only
docker-compose up -d postgres redis meilisearch

# Check they're running
docker-compose ps
```

### Step 5: Initialize Database
```bash
cd api
source venv/bin/activate

# Run migrations
alembic init migrations  # Only if not exists
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head

deactivate
cd ..
```

### Step 6: Run Quality Checks
```bash
# Lint check
npm run lint

# Type check
npm run type-check

# Test
npm test

# Security audit
npm run security:audit
```

---

## 📝 COMMIT MESSAGE FORMAT (MANDATORY)

```bash
# Format: type(scope): subject

# GOOD Examples:
git commit -m "feat(api): add template import endpoint"
git commit -m "fix(mcp): correct CPF validation logic"
git commit -m "test(api): add unit tests for auth router"
git commit -m "docs(roadmap): update completion status"

# BAD Examples (will be rejected):
git commit -m "fixed stuff"
git commit -m "Update"
git commit -m "wip"
```

### Allowed Types:
- `feat`: New feature
- `fix`: Bug fix
- `test`: Adding tests
- `docs`: Documentation updates
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `security`: Security fixes
- `deps`: Dependency updates
- `ci`: CI/CD changes
- `chore`: Maintenance

---

## 🧪 TESTING REQUIREMENTS

### Before ANY Implementation:
1. **Check if tests exist** - Look in `__tests__` or `*.test.ts` files
2. **Write test first** (TDD approach)
3. **Run existing tests** to ensure nothing breaks

### Test Commands:
```bash
# Run all tests
npm test

# Run specific test file
npm test -- templates.test.ts

# Run with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit
```

### Test Structure:
```typescript
// ALWAYS follow this pattern
describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do expected behavior', async () => {
    // Arrange
    const input = {...};
    
    // Act
    const result = await functionToTest(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  afterEach(() => {
    // Cleanup
  });
});
```

---

## 🔍 CONTEXT7 USAGE (For Library Documentation)

### When to Check Context7:
- Before using ANY new library
- When implementing new features
- For best practices and examples

### How to Use:
```typescript
// 1. First check Context7 for library docs
// Example: If using Meilisearch
// Search: "meilisearch typescript"

// 2. Follow their official patterns
// 3. Don't invent new patterns
```

---

## 🚫 COMMON MISTAKES TO AVOID

1. **Creating duplicate files**
   - ALWAYS check: `ls -la` before creating
   - Use `grep -r "search term"` to find existing code

2. **Not running tests**
   - Tests MUST pass before commit
   - Pre-commit hooks will catch this

3. **Ignoring linting errors**
   - Fix them, don't disable rules
   - Run: `npm run lint:fix`

4. **Not updating this document**
   - Mark tasks as [x] when complete
   - Add new discovered tasks

5. **Implementing unnecessary features**
   - Stick to the roadmap
   - Ask if unsure about scope

---

## 📊 PROGRESS TRACKING

### Current Status: **Phase 2 - Dependencies & Environment**
- **Completed**: 40%
- **In Progress**: Dependencies installation
- **Next**: Database initialization
- **Blockers**: None

### Update Format:
```markdown
### Current Status: **Phase X - Name**
- **Completed**: XX%
- **In Progress**: Current task
- **Next**: Next task
- **Blockers**: Any issues
```

---

## 🔄 WORKFLOW FOR AI AGENTS

```mermaid
graph TD
    A[Read This Document] --> B[Check Current Phase]
    B --> C[Read Existing Code]
    C --> D[Check Context7 if needed]
    D --> E[Write Tests]
    E --> F[Implement Feature]
    F --> G[Run Tests]
    G --> H{Tests Pass?}
    H -->|No| I[Fix Issues]
    I --> G
    H -->|Yes| J[Update This Document]
    J --> K[Commit with Proper Message]
    K --> L[Push to Repository]
    L --> M[Move to Next Task]
```

---

## 🆘 TROUBLESHOOTING

### If Docker fails:
```bash
docker-compose down -v
docker-compose up -d postgres redis meilisearch
```

### If tests fail:
```bash
# Check specific test
npm test -- --verbose failing-test.test.ts

# Check logs
docker-compose logs api
```

### If lint fails:
```bash
# Auto-fix most issues
npm run lint:fix

# Check remaining
npm run lint
```

### If dependencies fail:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📌 IMPORTANT CONTACTS & RESOURCES

- **Project Owner**: Arthur
- **Repository**: /home/arthur/n8n-marketplace
- **ConfirmaAI MCP**: /home/arthur/typescript-sdk (DO NOT MODIFY)
- **Documentation**: This file (AI_AGENT_ROADMAP.md)
- **Context7**: Use for library documentation
- **Docker Hub**: Official images only

---

## ✅ FINAL CHECKLIST BEFORE MARKING COMPLETE

- [ ] All tests passing
- [ ] No linting errors
- [ ] Documentation updated
- [ ] This roadmap updated
- [ ] Committed with proper message
- [ ] Pushed to repository
- [ ] No console.logs in production code
- [ ] No hardcoded secrets
- [ ] Coverage > 70%

---

**REMEMBER**: This document is your source of truth. Update it as you work!

**Last Updated**: [Auto-update this timestamp when modifying]
**Current Agent**: [Your identifier]
**Session ID**: [Session identifier for tracking]
