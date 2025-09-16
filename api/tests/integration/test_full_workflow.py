"""
Integration tests for full marketplace workflow
"""

import pytest
import httpx
import asyncio

class TestMarketplaceWorkflow:
    """Test complete marketplace workflows."""
    
    @pytest.mark.asyncio
    async def test_complete_template_workflow(self):
        """Test complete template browsing workflow."""
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            # 1. Browse templates
            response = await client.get("/api/templates/?page=1&per_page=5")
            assert response.status_code == 200
            templates_data = response.json()
            assert len(templates_data["templates"]) > 0
            
            # 2. Get first template details
            first_template = templates_data["templates"][0]
            template_id = first_template["id"]
            
            response = await client.get(f"/api/templates/{template_id}")
            assert response.status_code == 200
            template_detail = response.json()
            assert template_detail["id"] == template_id
            
            # 3. Search for templates
            search_data = {"query": "slack", "limit": 3}
            response = await client.post("/api/search/", json=search_data)
            assert response.status_code == 200
            search_results = response.json()
            assert "results" in search_results
            
            # 4. Get categories
            response = await client.get("/api/templates/categories")
            assert response.status_code == 200
            categories = response.json()
            assert "categories" in categories
    
    @pytest.mark.asyncio
    async def test_search_functionality_comprehensive(self):
        """Test comprehensive search functionality."""
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            # Test different search queries
            search_queries = ["email", "automation", "slack", "webhook", "database"]
            
            for query in search_queries:
                search_data = {"query": query, "limit": 10}
                response = await client.post("/api/search/", json=search_data)
                assert response.status_code == 200
                data = response.json()
                # Templates might not exist for all queries, but endpoint should work
                assert "results" in data
                assert "total" in data
    
    @pytest.mark.asyncio 
    async def test_api_performance(self):
        """Test API response times are reasonable."""
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            # Test health endpoint performance
            start_time = asyncio.get_event_loop().time()
            response = await client.get("/health")
            end_time = asyncio.get_event_loop().time()
            
            assert response.status_code == 200
            response_time = end_time - start_time
            assert response_time < 1.0  # Should respond within 1 second
            
            # Test templates endpoint performance
            start_time = asyncio.get_event_loop().time()
            response = await client.get("/api/templates/?limit=20")
            end_time = asyncio.get_event_loop().time()
            
            assert response.status_code == 200
            response_time = end_time - start_time
            assert response_time < 2.0  # Should respond within 2 seconds
    
    @pytest.mark.asyncio
    async def test_error_handling(self):
        """Test API error handling."""
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            # Test non-existent template
            response = await client.get("/api/templates/99999")
            assert response.status_code == 404
            
            # Test invalid search parameters
            search_data = {"query": "test", "limit": -1}
            response = await client.post("/api/search/", json=search_data)
            assert response.status_code == 422  # Validation error
            
            # Test invalid pagination
            response = await client.get("/api/templates/?page=0")
            assert response.status_code == 422  # Validation error
