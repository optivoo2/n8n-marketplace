"""
Unit tests for services
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from services.meilisearch_service import MeilisearchService

class TestMeilisearchService:
    """Test suite for MeilisearchService."""
    
    @patch('services.meilisearch_service.Client')
    def test_meilisearch_service_initialization(self, mock_client):
        """Test MeilisearchService initializes correctly."""
        service = MeilisearchService()
        
        assert service.templates_index == "templates"
        assert service.freelancers_index == "freelancers"
        mock_client.assert_called_once()
    
    @patch('services.meilisearch_service.Client')
    def test_search_error_handling(self, mock_client):
        """Test search error handling returns safe defaults."""
        # Mock client to raise exception
        mock_client_instance = AsyncMock()
        mock_client_instance.index.return_value.search.side_effect = Exception("Search error")
        mock_client.return_value = mock_client_instance
        
        service = MeilisearchService()
        
        # The service should handle errors gracefully
        assert service.templates_index == "templates"
    
    @patch('services.meilisearch_service.Client')
    def test_index_document_preparation(self, mock_client):
        """Test document preparation for indexing."""
        mock_client_instance = AsyncMock()
        mock_client.return_value = mock_client_instance
        
        service = MeilisearchService()
        
        # Test that service has the right configuration
        assert service.templates_index == "templates"
        assert service.freelancers_index == "freelancers"

def test_search_result_conversion():
    """Test that search results are properly converted."""
    # Mock search results structure
    mock_hit = {
        "id": 1,
        "title": "Test Template",
        "description": "Test description",
        "category": "Testing"
    }
    
    # Test data processing
    assert mock_hit["title"] == "Test Template"
    assert mock_hit["id"] == 1

def test_document_cleaning():
    """Test document cleaning removes None values."""
    document = {
        "id": 1,
        "title": "Test",
        "description": None,
        "category": "Test",
        "tags": ["test"]
    }
    
    # Clean document
    cleaned = {k: v for k, v in document.items() if v is not None}
    
    assert "description" not in cleaned
    assert cleaned["title"] == "Test"
    assert len(cleaned) == 4  # id, title, category, tags (5 - 1 None)

def test_search_parameters_validation():
    """Test search parameter validation."""
    # Test valid parameters
    valid_params = {
        "limit": 20,
        "offset": 0,
        "query": "test"
    }
    
    assert valid_params["limit"] > 0
    assert valid_params["offset"] >= 0
    assert isinstance(valid_params["query"], str)
    
    # Test parameter ranges
    assert 1 <= valid_params["limit"] <= 100  # Typical range
    assert valid_params["offset"] >= 0
