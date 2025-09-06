"""
Search router - handles Meilisearch-powered search functionality
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.meilisearch_service import MeilisearchService

router = APIRouter()

# Pydantic models
class SearchRequest(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None
    limit: int = 20
    offset: int = 0
    facets: Optional[List[str]] = None
    sort: Optional[List[str]] = None

class SearchResponse(BaseModel):
    results: List[Dict[str, Any]]
    total: int
    processing_time_ms: int
    facets: Optional[Dict[str, Any]] = None

# Initialize search service
search_service = MeilisearchService()

@router.post("/", response_model=SearchResponse)
async def search_templates(request: SearchRequest):
    """
    Full-text search across templates using Meilisearch
    """
    try:
        # Build filter string from filters dict
        filter_str = None
        if request.filters:
            filter_parts = []
            for key, value in request.filters.items():
                if isinstance(value, list):
                    # Handle array filters (e.g., tags IN [...])
                    values_str = " OR ".join([f'{key} = "{v}"' for v in value])
                    filter_parts.append(f"({values_str})")
                elif isinstance(value, dict):
                    # Handle range filters
                    if "min" in value and "max" in value:
                        filter_parts.append(f'{key} >= {value["min"]} AND {key} <= {value["max"]}')
                    elif "min" in value:
                        filter_parts.append(f'{key} >= {value["min"]}')
                    elif "max" in value:
                        filter_parts.append(f'{key} <= {value["max"]}')
                else:
                    # Handle simple equality filters
                    filter_parts.append(f'{key} = "{value}"')
            
            if filter_parts:
                filter_str = " AND ".join(filter_parts)
        
        # Perform search
        results = await search_service.search(
            query=request.query,
            filters=filter_str,
            limit=request.limit,
            offset=request.offset,
            facets=request.facets,
            sort=request.sort
        )
        
        return SearchResponse(
            results=results.get("hits", []),
            total=results.get("estimatedTotalHits", 0),
            processing_time_ms=results.get("processingTimeMs", 0),
            facets=results.get("facetDistribution")
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@router.get("/suggest")
async def search_suggestions(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(5, ge=1, le=20, description="Number of suggestions")
):
    """
    Get search suggestions/autocomplete
    """
    try:
        results = await search_service.get_suggestions(q, limit)
        return {"suggestions": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suggestion error: {str(e)}")

@router.get("/facets")
async def get_search_facets():
    """
    Get available search facets and their distributions
    """
    try:
        # Get facet distribution for empty search (all documents)
        results = await search_service.search(
            query="",
            facets=["category", "tags", "author_name", "license"],
            limit=0  # We only want facets, not results
        )
        
        return {
            "facets": results.get("facetDistribution", {}),
            "total_documents": results.get("estimatedTotalHits", 0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Facets error: {str(e)}")

@router.post("/advanced")
async def advanced_search(
    query: str = Query("", description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    author: Optional[str] = Query(None, description="Filter by author"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating"),
    sort_by: str = Query("relevance", description="Sort by: relevance, downloads, views, rating, created_at"),
    order: str = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Results per page")
):
    """
    Advanced search with multiple filters and sorting options
    """
    try:
        # Build filters
        filters = {}
        if category:
            filters["category"] = category
        if tags:
            filters["tags"] = tags
        if author:
            filters["author_name"] = author
        if min_rating is not None:
            filters["rating"] = {"min": min_rating}
        
        # Build sort parameter
        sort = None
        if sort_by != "relevance":
            sort_field = sort_by
            if order == "asc":
                sort = [f"{sort_field}:asc"]
            else:
                sort = [f"{sort_field}:desc"]
        
        # Calculate offset
        offset = (page - 1) * per_page
        
        # Perform search
        request = SearchRequest(
            query=query if query else "*",
            filters=filters,
            limit=per_page,
            offset=offset,
            facets=["category", "tags"],
            sort=sort
        )
        
        result = await search_templates(request)
        
        return {
            "results": result.results,
            "total": result.total,
            "page": page,
            "per_page": per_page,
            "total_pages": (result.total + per_page - 1) // per_page,
            "facets": result.facets,
            "processing_time_ms": result.processing_time_ms
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced search error: {str(e)}")

@router.post("/reindex")
async def trigger_reindex():
    """
    Trigger a full reindex of all templates (admin only)
    """
    try:
        from database import AsyncSessionLocal, Template
        from sqlalchemy import select
        
        async with AsyncSessionLocal() as db:
            # Get all templates
            query = select(Template)
            result = await db.execute(query)
            templates = result.scalars().all()
            
            # Reindex all templates
            documents = []
            for template in templates:
                doc = {
                    "id": template.id,
                    "title": template.title,
                    "description": template.description,
                    "category": template.category,
                    "tags": template.tags,
                    "author_name": template.author_name,
                    "source_url": template.source_url,
                    "license": template.license,
                    "downloads": template.downloads,
                    "views": template.views,
                    "rating": template.rating,
                    "created_at": template.created_at.isoformat() if template.created_at else None
                }
                documents.append(doc)
            
            # Batch index documents
            if documents:
                await search_service.index_documents(documents)
            
            return {
                "status": "success",
                "message": f"Reindexed {len(documents)} templates"
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reindex error: {str(e)}")

@router.get("/stats")
async def get_search_stats():
    """
    Get search index statistics
    """
    try:
        stats = await search_service.get_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stats error: {str(e)}")
