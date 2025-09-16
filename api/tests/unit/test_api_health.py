"""
Unit tests for API health endpoints
"""

import pytest
import httpx
from unittest.mock import patch

class TestAPIHealth:
    """Test suite for API health endpoints."""
    
    @pytest.mark.asyncio
    async def test_health_endpoint(self):
        """Test health endpoint is accessible."""
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            response = await client.get("/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert "timestamp" in data
            assert data["service"] == "n8n-marketplace-api"
    
    @pytest.mark.asyncio
    async def test_root_endpoint(self):
        """Test root endpoint returns welcome message."""
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            response = await client.get("/")
            assert response.status_code == 200
            data = response.json()
            assert "name" in data
            assert "n8n" in data["name"].lower()
    
    @pytest.mark.asyncio
    async def test_api_docs_accessible(self):
        """Test API documentation is accessible."""
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            response = await client.get("/api/docs")
            assert response.status_code == 200
            # Should return HTML for docs
            assert "swagger" in response.text.lower() or "redoc" in response.text.lower()
    
    @pytest.mark.asyncio
    async def test_templates_endpoint_basic(self):
        """Test templates endpoint is accessible."""
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            response = await client.get("/api/templates/")
            assert response.status_code == 200
            data = response.json()
            assert "templates" in data
            assert "total" in data
            assert "page" in data
            assert "per_page" in data
    
    @pytest.mark.asyncio
    async def test_search_endpoint_basic(self):
        """Test search endpoint is accessible."""
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            search_data = {"query": "automation", "limit": 5}
            response = await client.post("/api/search/", json=search_data)
            assert response.status_code == 200
            data = response.json()
            assert "results" in data
            assert "total" in data
