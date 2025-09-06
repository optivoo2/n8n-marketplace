"""
Meilisearch Service - Handles all search operations
"""

import os
from typing import List, Dict, Any, Optional
from meilisearch_python_async import Client
import asyncio
import json

class MeilisearchService:
    """
    Service for interacting with Meilisearch
    """
    
    def __init__(self):
        self.client = Client(
            os.getenv("MEILISEARCH_URL", "http://meilisearch:7700"),
            os.getenv("MEILI_MASTER_KEY", "changeMe123")
        )
        self.templates_index = "templates"
        self.freelancers_index = "freelancers"
    
    async def initialize_indexes(self):
        """
        Initialize Meilisearch indexes with proper settings
        """
        try:
            # Create templates index
            try:
                await self.client.create_index(
                    self.templates_index,
                    {'primaryKey': 'id'}
                )
                print(f"✅ Created index: {self.templates_index}")
            except Exception as e:
                if "already exists" not in str(e).lower():
                    print(f"⚠️ Index creation warning: {e}")
            
            # Configure templates index
            templates_index = self.client.index(self.templates_index)
            
            # Set searchable attributes
            await templates_index.update_searchable_attributes([
                'title',
                'description',
                'category',
                'tags',
                'author_name'
            ])
            
            # Set filterable attributes
            await templates_index.update_filterable_attributes([
                'category',
                'tags',
                'author_name',
                'license',
                'rating',
                'downloads',
                'views',
                'created_at'
            ])
            
            # Set sortable attributes
            await templates_index.update_sortable_attributes([
                'created_at',
                'updated_at',
                'downloads',
                'views',
                'rating'
            ])
            
            # Set ranking rules (order matters!)
            await templates_index.update_ranking_rules([
                "words",
                "typo",
                "proximity",
                "attribute",
                "sort",
                "exactness",
                "downloads:desc",
                "rating:desc"
            ])
            
            # Create freelancers index
            try:
                await self.client.create_index(
                    self.freelancers_index,
                    {'primaryKey': 'id'}
                )
                print(f"✅ Created index: {self.freelancers_index}")
            except Exception as e:
                if "already exists" not in str(e).lower():
                    print(f"⚠️ Index creation warning: {e}")
            
            # Configure freelancers index
            freelancers_index = self.client.index(self.freelancers_index)
            
            await freelancers_index.update_searchable_attributes([
                'display_name',
                'bio',
                'skills',
                'location',
                'languages'
            ])
            
            await freelancers_index.update_filterable_attributes([
                'skills',
                'expertise_level',
                'languages',
                'location',
                'hourly_rate',
                'available',
                'verified',
                'rating',
                'completed_projects'
            ])
            
            await freelancers_index.update_sortable_attributes([
                'rating',
                'completed_projects',
                'hourly_rate',
                'created_at'
            ])
            
            # Configure synonyms for Portuguese support
            await templates_index.update_synonyms({
                "email": ["e-mail", "correio"],
                "automation": ["automação", "automatização"],
                "workflow": ["fluxo de trabalho", "processo"],
                "template": ["modelo", "padrão"],
                "integration": ["integração", "conexão"],
                "api": ["interface", "endpoint"],
                "webhook": ["gancho web", "callback"],
                "database": ["banco de dados", "bd"],
                "schedule": ["agenda", "cronograma", "cron"],
                "trigger": ["gatilho", "disparador"]
            })
            
            print("✅ Meilisearch indexes configured successfully")
            
        except Exception as e:
            print(f"❌ Error initializing Meilisearch: {e}")
            # Don't crash the app if search isn't available
    
    async def search(
        self,
        query: str,
        filters: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
        facets: Optional[List[str]] = None,
        sort: Optional[List[str]] = None,
        index_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Perform a search query
        """
        try:
            index = self.client.index(index_name or self.templates_index)
            
            search_params = {
                'limit': limit,
                'offset': offset,
                'attributesToHighlight': ['title', 'description'],
                'attributesToCrop': ['description:200'],
                'cropMarker': '...'
            }
            
            if filters:
                search_params['filter'] = filters
            
            if facets:
                search_params['facets'] = facets
            
            if sort:
                search_params['sort'] = sort
            
            # Handle empty query (browse all)
            if not query or query == "*":
                query = ""
            
            results = await index.search(query, search_params)
            return results
            
        except Exception as e:
            print(f"Search error: {e}")
            # Return empty results on error
            return {
                "hits": [],
                "estimatedTotalHits": 0,
                "processingTimeMs": 0,
                "query": query
            }
    
    async def index_template(self, template: Dict[str, Any]):
        """
        Index a single template
        """
        try:
            index = self.client.index(self.templates_index)
            
            # Prepare document for indexing
            document = {
                "id": template.get("id"),
                "title": template.get("title"),
                "description": template.get("description"),
                "category": template.get("category"),
                "tags": template.get("tags", []),
                "author_name": template.get("author_name"),
                "source_url": template.get("source_url"),
                "license": template.get("license"),
                "downloads": template.get("downloads", 0),
                "views": template.get("views", 0),
                "rating": template.get("rating", 0.0),
                "created_at": template.get("created_at")
            }
            
            # Remove None values
            document = {k: v for k, v in document.items() if v is not None}
            
            await index.add_documents([document])
            
        except Exception as e:
            print(f"Error indexing template: {e}")
    
    async def index_documents(self, documents: List[Dict[str, Any]], index_name: Optional[str] = None):
        """
        Batch index multiple documents
        """
        try:
            index = self.client.index(index_name or self.templates_index)
            
            # Clean documents
            cleaned_docs = []
            for doc in documents:
                cleaned_doc = {k: v for k, v in doc.items() if v is not None}
                cleaned_docs.append(cleaned_doc)
            
            # Batch index (Meilisearch handles batches automatically)
            if cleaned_docs:
                await index.add_documents(cleaned_docs)
                print(f"✅ Indexed {len(cleaned_docs)} documents")
            
        except Exception as e:
            print(f"Error batch indexing: {e}")
    
    async def update_document(self, document_id: int, updates: Dict[str, Any], index_name: Optional[str] = None):
        """
        Update a single document
        """
        try:
            index = self.client.index(index_name or self.templates_index)
            
            # Add ID to updates
            updates["id"] = document_id
            
            await index.update_documents([updates])
            
        except Exception as e:
            print(f"Error updating document: {e}")
    
    async def delete_document(self, document_id: int, index_name: Optional[str] = None):
        """
        Delete a single document
        """
        try:
            index = self.client.index(index_name or self.templates_index)
            await index.delete_document(document_id)
            
        except Exception as e:
            print(f"Error deleting document: {e}")
    
    async def get_suggestions(self, query: str, limit: int = 5) -> List[str]:
        """
        Get search suggestions based on partial query
        """
        try:
            # Use search with specific attributes for suggestions
            results = await self.search(
                query=query,
                limit=limit,
                index_name=self.templates_index
            )
            
            # Extract unique titles for suggestions
            suggestions = []
            seen = set()
            
            for hit in results.get("hits", []):
                title = hit.get("title", "")
                if title and title not in seen:
                    suggestions.append(title)
                    seen.add(title)
                
                # Also add relevant tags as suggestions
                for tag in hit.get("tags", []):
                    if query.lower() in tag.lower() and tag not in seen:
                        suggestions.append(tag)
                        seen.add(tag)
                        if len(suggestions) >= limit:
                            break
                
                if len(suggestions) >= limit:
                    break
            
            return suggestions[:limit]
            
        except Exception as e:
            print(f"Error getting suggestions: {e}")
            return []
    
    async def get_stats(self) -> Dict[str, Any]:
        """
        Get index statistics
        """
        try:
            templates_index = self.client.index(self.templates_index)
            freelancers_index = self.client.index(self.freelancers_index)
            
            templates_stats = await templates_index.get_stats()
            freelancers_stats = await freelancers_index.get_stats()
            
            return {
                "templates": {
                    "numberOfDocuments": templates_stats.get("numberOfDocuments", 0),
                    "isIndexing": templates_stats.get("isIndexing", False),
                    "fieldDistribution": templates_stats.get("fieldDistribution", {})
                },
                "freelancers": {
                    "numberOfDocuments": freelancers_stats.get("numberOfDocuments", 0),
                    "isIndexing": freelancers_stats.get("isIndexing", False),
                    "fieldDistribution": freelancers_stats.get("fieldDistribution", {})
                }
            }
            
        except Exception as e:
            print(f"Error getting stats: {e}")
            return {
                "error": str(e),
                "templates": {"numberOfDocuments": 0},
                "freelancers": {"numberOfDocuments": 0}
            }
    
    async def clear_index(self, index_name: str):
        """
        Clear all documents from an index
        """
        try:
            index = self.client.index(index_name)
            await index.delete_all_documents()
            print(f"✅ Cleared index: {index_name}")
            
        except Exception as e:
            print(f"Error clearing index: {e}")
    
    async def health_check(self) -> bool:
        """
        Check if Meilisearch is healthy
        """
        try:
            health = await self.client.health()
            return health.get("status") == "available"
        except:
            return False
