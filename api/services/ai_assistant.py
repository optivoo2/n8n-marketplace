"""
AI Assistant Service - Handles AI-powered interactions
"""

import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
import httpx

class AIAssistant:
    """
    AI Assistant for natural language processing and intelligent responses
    """
    
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        self.model = "gpt-3.5-turbo"
        self.max_tokens = 1500
        
    async def process_query(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Process natural language query and return structured response
        """
        # Import here to avoid circular dependency
        from services.meilisearch_service import MeilisearchService
        from database import AsyncSessionLocal, Template, Freelancer
        from sqlalchemy import select
        
        search_service = MeilisearchService()
        
        # Analyze query intent
        intent = await self._analyze_intent(query)
        
        response = {
            "query": query,
            "intent": intent,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Process based on intent
        if intent == "search_templates":
            # Search for templates
            search_results = await search_service.search(
                query=query,
                limit=context.get("limit", 10) if context else 10
            )
            
            response["results"] = {
                "type": "templates",
                "items": search_results.get("hits", []),
                "total": search_results.get("estimatedTotalHits", 0)
            }
            
            # Generate natural language summary if OpenAI is configured
            if self.openai_api_key and search_results.get("hits"):
                summary = await self._generate_summary(query, search_results["hits"])
                response["summary"] = summary
        
        elif intent == "find_freelancer":
            # Search for freelancers
            search_results = await search_service.search(
                query=query,
                limit=context.get("limit", 5) if context else 5,
                index_name="freelancers"
            )
            
            response["results"] = {
                "type": "freelancers",
                "items": search_results.get("hits", []),
                "total": search_results.get("estimatedTotalHits", 0)
            }
        
        elif intent == "get_stats":
            # Get marketplace statistics
            async with AsyncSessionLocal() as db:
                template_count = await db.scalar(
                    select(func.count(Template.id))
                )
                freelancer_count = await db.scalar(
                    select(func.count(Freelancer.id))
                )
                
                response["results"] = {
                    "type": "statistics",
                    "data": {
                        "total_templates": template_count,
                        "total_freelancers": freelancer_count,
                        "popular_categories": await self._get_popular_categories(db)
                    }
                }
        
        elif intent == "implementation_request":
            # Parse implementation request
            response["results"] = {
                "type": "implementation_guide",
                "steps": [
                    "1. Search for relevant templates",
                    "2. Select a template that matches your needs",
                    "3. Browse available freelancers",
                    "4. Create an implementation request",
                    "5. Review proposals and select a freelancer",
                    "6. Complete payment to start the project"
                ],
                "estimated_time": "3-5 days",
                "average_cost": "$200-500"
            }
        
        else:
            # General query - search templates and provide help
            search_results = await search_service.search(
                query=query,
                limit=5
            )
            
            response["results"] = {
                "type": "mixed",
                "templates": search_results.get("hits", []),
                "help_text": "I can help you find templates, connect with freelancers, or create implementation requests. What would you like to do?"
            }
        
        return response
    
    async def execute_action(self, action: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a specific action with parameters
        """
        from services.meilisearch_service import MeilisearchService
        from database import AsyncSessionLocal, Template, Freelancer, Implementation
        from sqlalchemy import select, func
        
        search_service = MeilisearchService()
        
        result = {
            "action": action,
            "status": "success",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        try:
            if action == "search_templates":
                # Search templates with specific parameters
                filters = []
                if parameters.get("category"):
                    filters.append(f'category = "{parameters["category"]}"')
                if parameters.get("tags"):
                    tag_filters = [f'tags = "{tag}"' for tag in parameters["tags"]]
                    filters.append(f"({' OR '.join(tag_filters)})")
                
                filter_str = " AND ".join(filters) if filters else None
                
                search_results = await search_service.search(
                    query=parameters.get("query", ""),
                    filters=filter_str,
                    limit=parameters.get("limit", 20),
                    sort=parameters.get("sort")
                )
                
                result["data"] = search_results
            
            elif action == "get_template":
                # Get specific template
                async with AsyncSessionLocal() as db:
                    template = await db.get(Template, parameters["id"])
                    if template:
                        result["data"] = {
                            "id": template.id,
                            "title": template.title,
                            "description": template.description,
                            "category": template.category,
                            "tags": template.tags,
                            "source_url": template.source_url,
                            "downloads": template.downloads,
                            "rating": template.rating
                        }
                    else:
                        result["status"] = "error"
                        result["error"] = "Template not found"
            
            elif action == "find_freelancer":
                # Find freelancers with specific skills
                filters = []
                if parameters.get("skills"):
                    skill_filters = [f'skills = "{skill}"' for skill in parameters["skills"]]
                    filters.append(f"({' OR '.join(skill_filters)})")
                if parameters.get("min_rating"):
                    filters.append(f'rating >= {parameters["min_rating"]}')
                if parameters.get("available"):
                    filters.append('available = true')
                
                filter_str = " AND ".join(filters) if filters else None
                
                search_results = await search_service.search(
                    query=parameters.get("query", ""),
                    filters=filter_str,
                    limit=parameters.get("limit", 10),
                    index_name="freelancers"
                )
                
                result["data"] = search_results
            
            elif action == "create_implementation":
                # Create implementation request
                async with AsyncSessionLocal() as db:
                    implementation = Implementation(
                        template_id=parameters["template_id"],
                        client_email=parameters.get("client_email", "ai@agent.com"),
                        title=parameters.get("title", f"Implementation Request #{datetime.utcnow().timestamp()}"),
                        description=parameters.get("description", ""),
                        requirements=parameters.get("requirements", {}),
                        budget=parameters.get("budget", 0),
                        currency=parameters.get("currency", "USD"),
                        deadline=parameters.get("deadline"),
                        status="pending"
                    )
                    db.add(implementation)
                    await db.commit()
                    
                    result["data"] = {
                        "implementation_id": implementation.id,
                        "status": implementation.status,
                        "message": "Implementation request created successfully"
                    }
            
            elif action == "get_categories":
                # Get all categories with counts
                async with AsyncSessionLocal() as db:
                    query = select(
                        Template.category,
                        func.count(Template.id).label('count')
                    ).group_by(Template.category).order_by(func.count(Template.id).desc())
                    
                    results = await db.execute(query)
                    categories = results.all()
                    
                    result["data"] = [
                        {"name": cat.category, "count": cat.count}
                        for cat in categories if cat.category
                    ]
            
            else:
                result["status"] = "error"
                result["error"] = f"Unknown action: {action}"
        
        except Exception as e:
            result["status"] = "error"
            result["error"] = str(e)
        
        return result
    
    async def execute_bulk(self, operations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Execute multiple operations in bulk
        """
        results = []
        
        for operation in operations:
            action = operation.get("action")
            parameters = operation.get("parameters", {})
            
            # Add operation ID for tracking
            operation_result = await self.execute_action(action, parameters)
            operation_result["operation_id"] = operation.get("id", len(results))
            
            results.append(operation_result)
        
        return results
    
    async def _analyze_intent(self, query: str) -> str:
        """
        Analyze query intent using keywords or AI
        """
        query_lower = query.lower()
        
        # Simple keyword-based intent detection
        if any(word in query_lower for word in ["template", "workflow", "automation", "find", "search"]):
            return "search_templates"
        elif any(word in query_lower for word in ["freelancer", "expert", "developer", "hire", "consultant"]):
            return "find_freelancer"
        elif any(word in query_lower for word in ["implement", "build", "create", "develop", "project"]):
            return "implementation_request"
        elif any(word in query_lower for word in ["stats", "statistics", "count", "how many", "total"]):
            return "get_stats"
        else:
            return "general"
    
    async def _generate_summary(self, query: str, results: List[Dict[str, Any]]) -> str:
        """
        Generate natural language summary of results using OpenAI
        """
        if not self.openai_api_key:
            # Fallback to simple summary
            if results:
                return f"Found {len(results)} templates matching your query. The top result is '{results[0].get('title', 'Unknown')}'"
            else:
                return "No templates found matching your query."
        
        try:
            # Use OpenAI to generate summary
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openai_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a helpful assistant that summarizes search results for n8n automation templates."
                            },
                            {
                                "role": "user",
                                "content": f"Query: {query}\n\nResults: {json.dumps(results[:3])}\n\nProvide a brief, helpful summary of these results."
                            }
                        ],
                        "max_tokens": 150,
                        "temperature": 0.7
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    return self._fallback_summary(results)
        
        except Exception as e:
            print(f"Error generating AI summary: {e}")
            return self._fallback_summary(results)
    
    def _fallback_summary(self, results: List[Dict[str, Any]]) -> str:
        """
        Generate fallback summary without AI
        """
        if not results:
            return "No templates found matching your query. Try different keywords or browse categories."
        
        summary = f"Found {len(results)} relevant templates. "
        
        # Highlight top results
        top_templates = results[:3]
        template_names = [t.get("title", "Unknown") for t in top_templates]
        
        if len(template_names) == 1:
            summary += f"The top result is '{template_names[0]}'."
        elif len(template_names) == 2:
            summary += f"Top results include '{template_names[0]}' and '{template_names[1]}'."
        else:
            summary += f"Top results include '{template_names[0]}', '{template_names[1]}', and '{template_names[2]}'."
        
        return summary
    
    async def _get_popular_categories(self, db) -> List[Dict[str, Any]]:
        """
        Get popular categories from database
        """
        from sqlalchemy import select, func
        from database import Template
        
        query = select(
            Template.category,
            func.count(Template.id).label('count')
        ).group_by(
            Template.category
        ).order_by(
            func.count(Template.id).desc()
        ).limit(5)
        
        result = await db.execute(query)
        categories = result.all()
        
        return [
            {"name": cat.category, "count": cat.count}
            for cat in categories if cat.category
        ]
