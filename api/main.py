"""
n8n Template Marketplace API
AI-Agent friendly API for template discovery and freelancer connections
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
from typing import List, Optional
from datetime import datetime
import asyncio

# Import routers
from routers import templates, freelancers, search, webhooks, auth, payments
from database import engine, Base, get_db
from services.meilisearch_service import MeilisearchService
from services.template_importer import TemplateImporter
from services.ai_assistant import AIAssistant

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting n8n Marketplace API...")
    
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Initialize Meilisearch
    search_service = MeilisearchService()
    await search_service.initialize_indexes()
    
    # Import initial templates if needed
    if os.getenv("IMPORT_TEMPLATES_ON_START", "true").lower() == "true":
        importer = TemplateImporter()
        asyncio.create_task(importer.import_from_github())
    
    print("✅ API Ready!")
    
    yield
    
    # Shutdown
    print("👋 Shutting down...")

# Create FastAPI app
app = FastAPI(
    title="n8n Template Marketplace API",
    description="AI-Agent friendly API for n8n template discovery and freelancer connections",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(templates.router, prefix="/api/templates", tags=["Templates"])
app.include_router(freelancers.router, prefix="/api/freelancers", tags=["Freelancers"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for Docker and monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "n8n-marketplace-api"
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "n8n Template Marketplace API",
        "version": "1.0.0",
        "documentation": "/api/docs",
        "status": "operational",
        "features": [
            "Template discovery",
            "Freelancer profiles",
            "AI-powered search",
            "Webhook integrations",
            "Payment processing"
        ]
    }

# AI Agent endpoint - Main interface for AI interactions
@app.post("/api/ai/query")
async def ai_query(request: Request):
    """
    Main endpoint for AI agents to interact with the marketplace.
    Supports natural language queries and returns structured data.
    """
    body = await request.json()
    query = body.get("query", "")
    context = body.get("context", {})
    
    ai_assistant = AIAssistant()
    response = await ai_assistant.process_query(query, context)
    
    return JSONResponse(content=response)

# AI Agent actions endpoint
@app.post("/api/ai/action")
async def ai_action(request: Request):
    """
    Execute specific actions for AI agents.
    Actions: search_templates, get_freelancer, create_job, etc.
    """
    body = await request.json()
    action = body.get("action")
    parameters = body.get("parameters", {})
    
    ai_assistant = AIAssistant()
    result = await ai_assistant.execute_action(action, parameters)
    
    return JSONResponse(content=result)

# Bulk operations for AI agents
@app.post("/api/ai/bulk")
async def ai_bulk_operation(request: Request):
    """
    Handle bulk operations for AI agents.
    Useful for processing multiple templates or freelancers at once.
    """
    body = await request.json()
    operations = body.get("operations", [])
    
    ai_assistant = AIAssistant()
    results = await ai_assistant.execute_bulk(operations)
    
    return JSONResponse(content={"results": results})

# Error handling
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc),
            "timestamp": datetime.utcnow().isoformat()
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
