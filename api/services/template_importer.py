"""
Template Importer Service
Imports templates from awesome-n8n-templates repository
"""

import asyncio
import json
import re
from typing import List, Dict, Any
import httpx
from datetime import datetime
import os

class TemplateImporter:
    """Import templates from various sources"""
    
    def __init__(self):
        self.github_token = os.getenv("GITHUB_TOKEN", "")
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
        }
        if self.github_token:
            self.headers["Authorization"] = f"token {self.github_token}"
    
    async def import_from_github(self, 
                                repo_owner: str = "enescingoz",
                                repo_name: str = "awesome-n8n-templates"):
        """
        Import templates from the awesome-n8n-templates repository
        """
        print(f"📥 Importing templates from {repo_owner}/{repo_name}...")
        
        async with httpx.AsyncClient() as client:
            # Get repository structure
            repo_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/contents"
            response = await client.get(repo_url, headers=self.headers)
            
            if response.status_code != 200:
                print(f"❌ Failed to fetch repository: {response.status_code}")
                return
            
            contents = response.json()
            templates_imported = 0
            
            # Process each directory/file
            for item in contents:
                if item["type"] == "dir":
                    # Process directory (category)
                    category_name = item["name"].replace("_", " ").replace("-", " ")
                    print(f"📁 Processing category: {category_name}")
                    
                    # Get files in directory
                    dir_response = await client.get(item["url"], headers=self.headers)
                    if dir_response.status_code == 200:
                        dir_contents = dir_response.json()
                        
                        for file in dir_contents:
                            if file["name"].endswith(".json"):
                                # Import template
                                template_data = await self.fetch_template_file(
                                    client, file["download_url"]
                                )
                                if template_data:
                                    await self.save_template(
                                        template_data,
                                        category_name,
                                        file["name"],
                                        file["html_url"]
                                    )
                                    templates_imported += 1
                
                elif item["name"].endswith(".json"):
                    # Root level JSON file
                    template_data = await self.fetch_template_file(
                        client, item["download_url"]
                    )
                    if template_data:
                        await self.save_template(
                            template_data,
                            "General",
                            item["name"],
                            item["html_url"]
                        )
                        templates_imported += 1
            
            # Also parse README for template links
            readme_templates = await self.parse_readme_templates(client, repo_owner, repo_name)
            for template in readme_templates:
                await self.save_template_metadata(template)
                templates_imported += 1
            
            print(f"✅ Imported {templates_imported} templates!")
    
    async def fetch_template_file(self, client: httpx.AsyncClient, url: str) -> Dict:
        """Fetch and parse a template JSON file"""
        try:
            response = await client.get(url)
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"❌ Error fetching template: {e}")
        return None
    
    async def parse_readme_templates(self, 
                                    client: httpx.AsyncClient,
                                    repo_owner: str,
                                    repo_name: str) -> List[Dict]:
        """Parse README.md to extract template metadata"""
        templates = []
        
        # Fetch README
        readme_url = f"https://raw.githubusercontent.com/{repo_owner}/{repo_name}/main/README.md"
        response = await client.get(readme_url)
        
        if response.status_code != 200:
            return templates
        
        content = response.text
        
        # Parse markdown tables
        # Pattern: | Title | Description | Department | Link |
        table_pattern = r'\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|'
        lines = content.split('\n')
        
        current_category = ""
        in_table = False
        
        for line in lines:
            # Check for category headers (### Category Name)
            if line.startswith("### "):
                current_category = line.replace("### ", "").strip()
                in_table = False
                continue
            
            # Check for table start
            if "| Title |" in line:
                in_table = True
                continue
            
            # Skip separator lines
            if in_table and line.startswith("|---"):
                continue
            
            # Parse table rows
            if in_table and line.startswith("|"):
                match = re.match(table_pattern, line)
                if match:
                    title = match.group(1).strip()
                    description = match.group(2).strip()
                    department = match.group(3).strip()
                    link = match.group(4).strip()
                    
                    # Skip header row
                    if title == "Title":
                        continue
                    
                    # Extract actual URL from markdown link
                    link_match = re.search(r'\[.*?\]\((.*?)\)', link)
                    if link_match:
                        actual_link = link_match.group(1)
                    else:
                        actual_link = link
                    
                    templates.append({
                        "title": title,
                        "description": description,
                        "category": current_category,
                        "department": department,
                        "source_url": actual_link,
                        "author_name": repo_owner
                    })
        
        return templates
    
    async def save_template(self, 
                           template_data: Dict,
                           category: str,
                           filename: str,
                           github_url: str):
        """Save template to database"""
        from database import AsyncSessionLocal, Template
        from sqlalchemy import select
        
        async with AsyncSessionLocal() as session:
            # Check if template already exists
            slug = self.generate_slug(filename)
            stmt = select(Template).where(Template.slug == slug)
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if existing:
                # Update existing template
                existing.json_content = template_data
                existing.updated_at = datetime.utcnow()
                existing.last_verified = datetime.utcnow()
            else:
                # Create new template
                template = Template(
                    title=filename.replace(".json", "").replace("_", " ").replace("-", " "),
                    slug=slug,
                    description=template_data.get("description", ""),
                    category=category,
                    tags=self.extract_tags(template_data),
                    source_url=github_url,
                    github_repo=f"enescingoz/awesome-n8n-templates",
                    json_content=template_data,
                    author_name="enescingoz",
                    license="unknown",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    last_verified=datetime.utcnow()
                )
                session.add(template)
            
            await session.commit()
    
    async def save_template_metadata(self, metadata: Dict):
        """Save template metadata (without JSON content)"""
        from database import AsyncSessionLocal, Template
        from sqlalchemy import select
        
        async with AsyncSessionLocal() as session:
            # Check if template already exists
            slug = self.generate_slug(metadata["title"])
            stmt = select(Template).where(Template.slug == slug)
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if not existing:
                # Create new template metadata
                template = Template(
                    title=metadata["title"],
                    slug=slug,
                    description=metadata["description"],
                    category=metadata["category"],
                    tags=[metadata["department"]] if metadata.get("department") else [],
                    source_url=metadata["source_url"],
                    author_name=metadata.get("author_name", "unknown"),
                    license="unknown",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                session.add(template)
                await session.commit()
    
    def generate_slug(self, title: str) -> str:
        """Generate URL-friendly slug from title"""
        slug = title.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug)
        slug = re.sub(r'-+', '-', slug)
        return slug.strip('-')
    
    def extract_tags(self, template_data: Dict) -> List[str]:
        """Extract tags from template JSON"""
        tags = []
        
        # Extract from nodes
        if "nodes" in template_data:
            for node in template_data["nodes"]:
                if "type" in node:
                    node_type = node["type"].replace("n8n-nodes-base.", "")
                    if node_type not in tags:
                        tags.append(node_type)
        
        # Extract from name
        if "name" in template_data:
            name_parts = template_data["name"].lower().split()
            for part in name_parts:
                if len(part) > 3 and part not in tags:
                    tags.append(part)
        
        return tags[:10]  # Limit to 10 tags
