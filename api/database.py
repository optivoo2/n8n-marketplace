"""
Database configuration and models
Simple, focused schema for the marketplace
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, Float, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from datetime import datetime
import os

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://marketplace:changeMe123@localhost:5433/n8n_marketplace")
# Convert to async URL
ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Create async engine with proper configuration
engine = create_async_engine(
    ASYNC_DATABASE_URL, 
    echo=os.getenv("ENVIRONMENT") != "production",  # Only echo in development
    pool_size=20,  # Connection pool size
    max_overflow=30,  # Maximum overflow connections
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,  # Recycle connections every hour
)

# Create async session
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Dependency for FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Models
class Template(Base):
    """Template model - core of the marketplace"""
    __tablename__ = "templates"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, index=True)
    description = Column(Text)
    category = Column(String(100), index=True)
    tags = Column(JSON, default=list)  # ["gmail", "automation", "ai"]
    
    # Source information
    source_url = Column(Text)  # Link to n8n.io or GitHub
    github_repo = Column(String(255))
    github_path = Column(String(500))
    json_content = Column(JSON)  # Store template JSON if available
    
    # Metadata
    author_name = Column(String(255))
    author_url = Column(Text)
    license = Column(String(50), default="unknown")
    
    # Stats
    downloads = Column(Integer, default=0, nullable=False)
    views = Column(Integer, default=0, nullable=False)
    rating = Column(Float, default=0.0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_verified = Column(DateTime)
    
    # Relationships
    implementations = relationship("Implementation", back_populates="template")

class Freelancer(Base):
    """Freelancer model - service providers"""
    __tablename__ = "freelancers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), unique=True, index=True)  # External auth ID
    email = Column(String(255), unique=True, index=True)
    
    # Profile
    display_name = Column(String(255), nullable=False)
    bio = Column(Text)
    avatar_url = Column(Text)
    location = Column(String(100))
    languages = Column(JSON, default=list)  # ["en", "pt", "es"]
    
    # Skills & Expertise
    skills = Column(JSON, default=list)  # ["n8n", "zapier", "python", "api"]
    expertise_level = Column(String(50))  # "beginner", "intermediate", "expert"
    certifications = Column(JSON, default=list)
    
    # Rates & Availability
    hourly_rate = Column(Float)
    currency = Column(String(10), default="USD")
    available = Column(Boolean, default=True, nullable=False)
    
    # Portfolio
    portfolio_url = Column(Text)
    github_username = Column(String(100))
    linkedin_url = Column(Text)
    
    # Stats
    completed_projects = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    response_time_hours = Column(Float)
    
    # Verification
    verified = Column(Boolean, default=False, nullable=False)
    verified_at = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    implementations = relationship("Implementation", back_populates="freelancer")

class Implementation(Base):
    """Implementation requests - connects templates with freelancers"""
    __tablename__ = "implementations"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Relationships
    template_id = Column(Integer, ForeignKey("templates.id"))
    freelancer_id = Column(Integer, ForeignKey("freelancers.id"))
    client_email = Column(String(255))
    
    # Project details
    title = Column(String(255))
    description = Column(Text)
    requirements = Column(JSON)  # Specific requirements
    budget = Column(Float)
    currency = Column(String(10), default="USD")
    deadline = Column(DateTime)
    
    # Status
    status = Column(String(50), default="pending")  # pending, accepted, in_progress, completed, cancelled
    
    # Payment
    payment_status = Column(String(50), default="pending")  # pending, paid, refunded
    commission_amount = Column(Float)  # Platform commission
    transaction_id = Column(String(255))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    accepted_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    # Relationships
    template = relationship("Template", back_populates="implementations")
    freelancer = relationship("Freelancer", back_populates="implementations")

class Category(Base):
    """Categories for organizing templates"""
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    slug = Column(String(100), unique=True, index=True)
    description = Column(Text)
    icon = Column(String(50))  # Icon name or emoji
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    order = Column(Integer, default=0)
    
    # Stats
    template_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
