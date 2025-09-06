"""
Templates router - handles all template-related endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db, Template

router = APIRouter()

# Pydantic models for request/response
class TemplateResponse(BaseModel):
    id: int
    title: str
    slug: str
    description: Optional[str]
    category: Optional[str]
    tags: List[str]
    source_url: Optional[str]
    author_name: Optional[str]
    downloads: int
    views: int
    rating: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class TemplateListResponse(BaseModel):
    templates: List[TemplateResponse]
    total: int
    page: int
    per_page: int

@router.get("/", response_model=TemplateListResponse)
async def list_templates(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    sort_by: str = Query("created_at", description="Sort field"),
    order: str = Query("desc", description="Sort order (asc/desc)"),
    db: AsyncSession = Depends(get_db)
):
    """
    List all templates with pagination and filtering
    """
    # Build query
    query = select(Template)
    
    # Apply filters
    if category:
        query = query.where(Template.category == category)
    
    if tag:
        query = query.where(Template.tags.contains([tag]))
    
    # Apply sorting
    sort_field = getattr(Template, sort_by, Template.created_at)
    if order == "desc":
        query = query.order_by(sort_field.desc())
    else:
        query = query.order_by(sort_field.asc())
    
    # Get total count
    count_query = select(func.count()).select_from(Template)
    if category:
        count_query = count_query.where(Template.category == category)
    if tag:
        count_query = count_query.where(Template.tags.contains([tag]))
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    
    # Execute query
    result = await db.execute(query)
    templates = result.scalars().all()
    
    return TemplateListResponse(
        templates=[TemplateResponse.from_orm(t) for t in templates],
        total=total,
        page=page,
        per_page=per_page
    )

@router.get("/count")
async def get_template_count(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get total template count
    """
    query = select(func.count()).select_from(Template)
    if category:
        query = query.where(Template.category == category)
    
    result = await db.execute(query)
    count = result.scalar()
    
    return {"count": count, "category": category}

@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    """
    Get all unique categories with counts
    """
    query = select(
        Template.category,
        func.count(Template.id).label('count')
    ).group_by(Template.category).order_by(func.count(Template.id).desc())
    
    result = await db.execute(query)
    categories = result.all()
    
    return [
        {"name": cat.category, "count": cat.count}
        for cat in categories if cat.category
    ]

@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific template by ID
    """
    query = select(Template).where(Template.id == template_id)
    result = await db.execute(query)
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Increment view count
    update_query = (
        update(Template)
        .where(Template.id == template_id)
        .values(views=Template.views + 1)
    )
    await db.execute(update_query)
    await db.commit()
    
    return TemplateResponse.from_orm(template)

@router.get("/{template_id}/download")
async def download_template(
    template_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get template JSON for download
    """
    query = select(Template).where(Template.id == template_id)
    result = await db.execute(query)
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Increment download count
    update_query = (
        update(Template)
        .where(Template.id == template_id)
        .values(downloads=Template.downloads + 1)
    )
    await db.execute(update_query)
    await db.commit()
    
    return {
        "template": template.json_content,
        "metadata": {
            "title": template.title,
            "description": template.description,
            "author": template.author_name,
            "source": template.source_url
        }
    }

@router.post("/import")
async def trigger_import(db: AsyncSession = Depends(get_db)):
    """
    Trigger template import from GitHub
    """
    from services.template_importer import TemplateImporter
    import asyncio
    
    importer = TemplateImporter()
    asyncio.create_task(importer.import_from_github())
    
    return {
        "status": "import_started",
        "message": "Template import has been initiated in the background"
    }

@router.get("/popular/week")
async def get_popular_templates(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """
    Get most popular templates from the past week
    """
    from datetime import timedelta
    
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    query = (
        select(Template)
        .where(Template.updated_at >= week_ago)
        .order_by((Template.downloads + Template.views).desc())
        .limit(limit)
    )
    
    result = await db.execute(query)
    templates = result.scalars().all()
    
    return [TemplateResponse.from_orm(t) for t in templates]
