"""
Pytest configuration and fixtures
"""

import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import Base, get_db

# Test database URL (in-memory SQLite for fast tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    poolclass=StaticPool,
    echo=True
)

# Test session maker
TestAsyncSessionLocal = sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
async def test_db() -> AsyncGenerator[AsyncSession, None]:
    """Create a fresh database for each test."""
    # Create tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session
    session = TestAsyncSessionLocal()
    
    try:
        yield session
    finally:
        await session.close()
        
        # Clean up
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def client(test_db: AsyncSession):
    """Create an async test client with dependency override."""
    async def override_get_db():
        yield test_db
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
    
    app.dependency_overrides.clear()

@pytest.fixture
def sample_template_data():
    """Sample template data for testing."""
    return {
        "title": "Test Template",
        "slug": "test-template",
        "description": "A test template for unit testing",
        "category": "Testing",
        "tags": ["test", "unit"],
        "author_name": "Test Author",
        "source_url": "https://example.com/test.json",
        "license": "MIT"
    }

@pytest.fixture
def sample_freelancer_data():
    """Sample freelancer data for testing."""
    return {
        "display_name": "Test Freelancer",
        "email": "test@example.com",
        "bio": "Expert n8n developer",
        "skills": ["n8n", "automation", "workflows"],
        "hourly_rate": 50.0,
        "location": "Brazil",
        "languages": ["Portuguese", "English"]
    }
