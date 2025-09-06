"""
Freelancers router - handles freelancer profiles and management
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db, Freelancer

router = APIRouter()

# Pydantic models
class FreelancerCreate(BaseModel):
    email: EmailStr
    display_name: str
    bio: Optional[str] = None
    location: Optional[str] = None
    languages: List[str] = []
    skills: List[str] = []
    expertise_level: str = "intermediate"
    hourly_rate: Optional[float] = None
    currency: str = "USD"
    portfolio_url: Optional[str] = None
    github_username: Optional[str] = None
    linkedin_url: Optional[str] = None

class FreelancerUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    languages: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    expertise_level: Optional[str] = None
    hourly_rate: Optional[float] = None
    currency: Optional[str] = None
    available: Optional[bool] = None
    portfolio_url: Optional[str] = None
    github_username: Optional[str] = None
    linkedin_url: Optional[str] = None

class FreelancerResponse(BaseModel):
    id: int
    display_name: str
    bio: Optional[str]
    avatar_url: Optional[str]
    location: Optional[str]
    languages: List[str]
    skills: List[str]
    expertise_level: str
    hourly_rate: Optional[float]
    currency: str
    available: bool
    portfolio_url: Optional[str]
    github_username: Optional[str]
    linkedin_url: Optional[str]
    completed_projects: int
    rating: float
    verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[FreelancerResponse])
async def list_freelancers(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    skill: Optional[str] = Query(None, description="Filter by skill"),
    expertise: Optional[str] = Query(None, description="Filter by expertise level"),
    available: Optional[bool] = Query(None, description="Filter by availability"),
    min_rate: Optional[float] = Query(None, description="Minimum hourly rate"),
    max_rate: Optional[float] = Query(None, description="Maximum hourly rate"),
    language: Optional[str] = Query(None, description="Filter by language"),
    verified_only: bool = Query(False, description="Only show verified freelancers"),
    sort_by: str = Query("rating", description="Sort field"),
    db: AsyncSession = Depends(get_db)
):
    """
    List freelancers with filtering and pagination
    """
    query = select(Freelancer)
    
    # Apply filters
    if skill:
        query = query.where(Freelancer.skills.contains([skill]))
    
    if expertise:
        query = query.where(Freelancer.expertise_level == expertise)
    
    if available is not None:
        query = query.where(Freelancer.available == available)
    
    if min_rate is not None:
        query = query.where(Freelancer.hourly_rate >= min_rate)
    
    if max_rate is not None:
        query = query.where(Freelancer.hourly_rate <= max_rate)
    
    if language:
        query = query.where(Freelancer.languages.contains([language]))
    
    if verified_only:
        query = query.where(Freelancer.verified == True)
    
    # Apply sorting
    if sort_by == "rating":
        query = query.order_by(Freelancer.rating.desc())
    elif sort_by == "rate_low":
        query = query.order_by(Freelancer.hourly_rate.asc())
    elif sort_by == "rate_high":
        query = query.order_by(Freelancer.hourly_rate.desc())
    elif sort_by == "projects":
        query = query.order_by(Freelancer.completed_projects.desc())
    else:
        query = query.order_by(Freelancer.created_at.desc())
    
    # Apply pagination
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    
    result = await db.execute(query)
    freelancers = result.scalars().all()
    
    return [FreelancerResponse.from_orm(f) for f in freelancers]

@router.get("/search")
async def search_freelancers(
    q: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """
    Search freelancers by name, bio, or skills
    """
    search_term = f"%{q}%"
    
    query = select(Freelancer).where(
        or_(
            Freelancer.display_name.ilike(search_term),
            Freelancer.bio.ilike(search_term),
            Freelancer.skills.cast(String).ilike(search_term)
        )
    ).limit(limit)
    
    result = await db.execute(query)
    freelancers = result.scalars().all()
    
    return [FreelancerResponse.from_orm(f) for f in freelancers]

@router.get("/top-rated")
async def get_top_rated_freelancers(
    limit: int = Query(10, ge=1, le=50),
    skill: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get top-rated freelancers
    """
    query = select(Freelancer).where(
        Freelancer.rating >= 4.0,
        Freelancer.completed_projects >= 5
    )
    
    if skill:
        query = query.where(Freelancer.skills.contains([skill]))
    
    query = query.order_by(
        Freelancer.rating.desc(),
        Freelancer.completed_projects.desc()
    ).limit(limit)
    
    result = await db.execute(query)
    freelancers = result.scalars().all()
    
    return [FreelancerResponse.from_orm(f) for f in freelancers]

@router.get("/skills")
async def get_all_skills(db: AsyncSession = Depends(get_db)):
    """
    Get all unique skills from freelancers
    """
    query = select(Freelancer.skills)
    result = await db.execute(query)
    all_skills_arrays = result.scalars().all()
    
    # Flatten and deduplicate skills
    unique_skills = set()
    for skills_array in all_skills_arrays:
        if skills_array:
            unique_skills.update(skills_array)
    
    return sorted(list(unique_skills))

@router.get("/{freelancer_id}", response_model=FreelancerResponse)
async def get_freelancer(
    freelancer_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific freelancer profile
    """
    query = select(Freelancer).where(Freelancer.id == freelancer_id)
    result = await db.execute(query)
    freelancer = result.scalar_one_or_none()
    
    if not freelancer:
        raise HTTPException(status_code=404, detail="Freelancer not found")
    
    return FreelancerResponse.from_orm(freelancer)

@router.post("/", response_model=FreelancerResponse)
async def create_freelancer(
    freelancer: FreelancerCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new freelancer profile
    """
    # Check if email already exists
    existing_query = select(Freelancer).where(Freelancer.email == freelancer.email)
    existing_result = await db.execute(existing_query)
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new freelancer
    new_freelancer = Freelancer(
        user_id=f"user_{datetime.utcnow().timestamp()}",  # Generate unique ID
        **freelancer.dict()
    )
    
    db.add(new_freelancer)
    await db.commit()
    await db.refresh(new_freelancer)
    
    return FreelancerResponse.from_orm(new_freelancer)

@router.put("/{freelancer_id}", response_model=FreelancerResponse)
async def update_freelancer(
    freelancer_id: int,
    update_data: FreelancerUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update freelancer profile
    """
    query = select(Freelancer).where(Freelancer.id == freelancer_id)
    result = await db.execute(query)
    freelancer = result.scalar_one_or_none()
    
    if not freelancer:
        raise HTTPException(status_code=404, detail="Freelancer not found")
    
    # Update fields
    update_dict = update_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(freelancer, field, value)
    
    freelancer.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(freelancer)
    
    return FreelancerResponse.from_orm(freelancer)

@router.post("/{freelancer_id}/verify")
async def verify_freelancer(
    freelancer_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify a freelancer profile (admin only)
    """
    query = select(Freelancer).where(Freelancer.id == freelancer_id)
    result = await db.execute(query)
    freelancer = result.scalar_one_or_none()
    
    if not freelancer:
        raise HTTPException(status_code=404, detail="Freelancer not found")
    
    freelancer.verified = True
    freelancer.verified_at = datetime.utcnow()
    
    await db.commit()
    
    return {"message": "Freelancer verified successfully"}
