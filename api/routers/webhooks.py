"""
Webhooks router - handles external webhooks and notifications
"""

from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
import hmac
import hashlib
import json
from datetime import datetime

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db

router = APIRouter()

# Webhook secrets
GITHUB_WEBHOOK_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET", "")
N8N_WEBHOOK_SECRET = os.getenv("N8N_WEBHOOK_SECRET", "")

def verify_github_signature(payload: bytes, signature: str, secret: str) -> bool:
    """
    Verify GitHub webhook signature
    """
    if not secret:
        return False
    
    expected_signature = "sha256=" + hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)

@router.post("/github")
async def github_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle GitHub webhooks for template updates
    """
    # Get headers
    signature = request.headers.get("X-Hub-Signature-256", "")
    event_type = request.headers.get("X-GitHub-Event", "")
    
    # Get body
    body = await request.body()
    
    # Verify signature
    if GITHUB_WEBHOOK_SECRET and not verify_github_signature(body, signature, GITHUB_WEBHOOK_SECRET):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    # Parse payload
    payload = json.loads(body)
    
    # Handle different event types
    if event_type == "push":
        # Handle push to repository (template updates)
        repository = payload.get("repository", {})
        commits = payload.get("commits", [])
        
        # Check if any JSON files were modified
        template_files = []
        for commit in commits:
            for file in commit.get("modified", []) + commit.get("added", []):
                if file.endswith(".json"):
                    template_files.append(file)
        
        if template_files:
            # Trigger template re-import for modified files
            from services.template_importer import TemplateImporter
            import asyncio
            
            importer = TemplateImporter()
            asyncio.create_task(importer.import_from_github())
            
            return {
                "status": "accepted",
                "message": f"Re-importing {len(template_files)} templates",
                "files": template_files
            }
    
    elif event_type == "release":
        # Handle new release (batch template updates)
        release = payload.get("release", {})
        if release.get("action") == "published":
            # Trigger full re-import
            from services.template_importer import TemplateImporter
            import asyncio
            
            importer = TemplateImporter()
            asyncio.create_task(importer.import_from_github())
            
            return {
                "status": "accepted",
                "message": f"Re-importing templates for release {release.get('tag_name')}"
            }
    
    elif event_type == "issues":
        # Handle issue events (template requests, bug reports)
        issue = payload.get("issue", {})
        action = payload.get("action", "")
        
        if action == "opened" and "template-request" in [l["name"] for l in issue.get("labels", [])]:
            # Log template request for review
            print(f"New template request: {issue.get('title')}")
            # TODO: Store in database for admin review
    
    return {"status": "ok", "event": event_type}

@router.post("/n8n")
async def n8n_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle n8n webhook notifications
    """
    # Get headers
    signature = request.headers.get("X-N8N-Signature", "")
    
    # Get body
    body = await request.body()
    
    # Verify signature if configured
    if N8N_WEBHOOK_SECRET:
        expected_signature = hmac.new(
            N8N_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(expected_signature, signature):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    # Parse payload
    payload = json.loads(body)
    
    # Handle n8n events
    event_type = payload.get("event", "")
    
    if event_type == "workflow.executed":
        # Track workflow execution
        workflow_id = payload.get("workflow_id")
        execution_id = payload.get("execution_id")
        status = payload.get("status")
        
        # TODO: Track template usage statistics
        print(f"Workflow {workflow_id} executed with status {status}")
    
    elif event_type == "workflow.error":
        # Track workflow errors
        workflow_id = payload.get("workflow_id")
        error = payload.get("error")
        
        # TODO: Log errors for debugging
        print(f"Workflow {workflow_id} error: {error}")
    
    return {"status": "ok", "event": event_type}

@router.post("/slack")
async def slack_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Slack notifications and commands
    """
    # Parse form data (Slack sends form-encoded data)
    form_data = await request.form()
    
    # Verify token if configured
    slack_token = os.getenv("SLACK_VERIFICATION_TOKEN", "")
    if slack_token and form_data.get("token") != slack_token:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Handle slash commands
    command = form_data.get("command", "")
    text = form_data.get("text", "")
    user_name = form_data.get("user_name", "")
    
    if command == "/n8n-search":
        # Search templates via Slack
        from services.meilisearch_service import MeilisearchService
        
        search_service = MeilisearchService()
        results = await search_service.search(text, limit=5)
        
        # Format response for Slack
        if results.get("hits"):
            blocks = []
            for hit in results["hits"]:
                blocks.append({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*{hit['title']}*\n{hit.get('description', '')[:100]}..."
                    },
                    "accessory": {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "View"},
                        "url": f"https://marketplace.example.com/templates/{hit['id']}"
                    }
                })
            
            return {
                "response_type": "in_channel",
                "blocks": blocks
            }
        else:
            return {
                "response_type": "ephemeral",
                "text": f"No templates found for '{text}'"
            }
    
    elif command == "/n8n-stats":
        # Get marketplace statistics
        from sqlalchemy import func, select
        from database import Template, Freelancer, Implementation
        
        # Get counts
        template_count = await db.scalar(select(func.count(Template.id)))
        freelancer_count = await db.scalar(select(func.count(Freelancer.id)))
        implementation_count = await db.scalar(
            select(func.count(Implementation.id)).where(Implementation.status == "completed")
        )
        
        return {
            "response_type": "ephemeral",
            "text": f"📊 *Marketplace Stats*\n"
                   f"• Templates: {template_count}\n"
                   f"• Freelancers: {freelancer_count}\n"
                   f"• Completed Projects: {implementation_count}"
        }
    
    return {"response_type": "ephemeral", "text": "Command not recognized"}

@router.post("/custom/{webhook_id}")
async def custom_webhook(
    webhook_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle custom webhooks for integrations
    """
    # Get webhook configuration from database or environment
    webhook_config = os.getenv(f"WEBHOOK_{webhook_id.upper()}_SECRET", "")
    
    if not webhook_config:
        raise HTTPException(status_code=404, detail="Webhook not configured")
    
    # Get body
    body = await request.body()
    
    # Verify signature if provided
    signature = request.headers.get("X-Webhook-Signature", "")
    if signature:
        expected_signature = hmac.new(
            webhook_config.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(expected_signature, signature):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    # Parse and process payload
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        payload = {"raw": body.decode()}
    
    # Log webhook for debugging
    print(f"Custom webhook {webhook_id} received: {payload}")
    
    # TODO: Process based on webhook_id
    # This could trigger various actions like:
    # - Import templates from external sources
    # - Update freelancer profiles
    # - Sync with external systems
    
    return {
        "status": "ok",
        "webhook_id": webhook_id,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/test")
async def test_webhook():
    """
    Test endpoint to verify webhook configuration
    """
    return {
        "status": "ok",
        "message": "Webhook endpoint is working",
        "configured_webhooks": [
            "github" if GITHUB_WEBHOOK_SECRET else None,
            "n8n" if N8N_WEBHOOK_SECRET else None,
            "mercadopago",
            "stripe",
            "slack",
            "custom"
        ]
    }
