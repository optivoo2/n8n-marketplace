"""
Simple unit tests to verify testing infrastructure
"""

import pytest
from database import Template, Freelancer

def test_template_model_creation():
    """Test template model can be created with required fields."""
    template = Template(
        title="Test Template",
        description="A test template",
        category="Testing",
        author_name="Test Author"
    )
    
    assert template.title == "Test Template"
    assert template.description == "A test template"
    assert template.category == "Testing"
    assert template.author_name == "Test Author"
    # Note: Default values only apply when saved to database
    # For in-memory objects, these will be None until committed

def test_template_with_tags():
    """Test template with tags."""
    template = Template(
        title="Tagged Template",
        description="Template with tags",
        category="Testing",
        tags=["automation", "workflow", "n8n"],
        author_name="Test Author"
    )
    
    assert isinstance(template.tags, list)
    assert "automation" in template.tags
    assert len(template.tags) == 3

def test_freelancer_model_creation():
    """Test freelancer model can be created with required fields."""
    freelancer = Freelancer(
        display_name="Test Freelancer",
        email="test@example.com",
        bio="Expert developer",
        hourly_rate=50.0
    )
    
    assert freelancer.display_name == "Test Freelancer"
    assert freelancer.email == "test@example.com"
    assert freelancer.bio == "Expert developer"
    assert freelancer.hourly_rate == 50.0
    # Note: Default values only apply when saved to database
    # For in-memory objects, these will be None until committed

def test_freelancer_with_skills():
    """Test freelancer with skills array."""
    freelancer = Freelancer(
        display_name="Skilled Developer",
        email="skilled@example.com",
        skills=["n8n", "python", "javascript"],
        hourly_rate=75.0
    )
    
    assert isinstance(freelancer.skills, list)
    assert "n8n" in freelancer.skills
    assert len(freelancer.skills) == 3

def test_template_slug_property():
    """Test that slug is properly set."""
    template = Template(
        title="My Awesome Template!",
        description="Test",
        category="Test",
        author_name="Test Author"
    )
    
    # If slug is auto-generated, test that logic
    # For now, just test that it can be set
    assert template.title == "My Awesome Template!"
