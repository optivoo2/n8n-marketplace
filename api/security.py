"""
Security utilities and configurations
"""

import os
from typing import List
from fastapi import HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security configuration
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET or len(JWT_SECRET) < 32:
    logger.warning("JWT_SECRET is not set or too short. Using default (NOT FOR PRODUCTION)")
    JWT_SECRET = "default_secret_not_for_production_change_this"

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Rate limiting (simple in-memory implementation)
from collections import defaultdict
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)
    
    def is_allowed(self, client_ip: str, max_requests: int = 100, window_minutes: int = 60) -> bool:
        now = datetime.now()
        window_start = now - timedelta(minutes=window_minutes)
        
        # Clean old requests
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip] 
            if req_time > window_start
        ]
        
        # Check if under limit
        if len(self.requests[client_ip]) >= max_requests:
            return False
        
        # Add current request
        self.requests[client_ip].append(now)
        return True

rate_limiter = RateLimiter()

def get_client_ip(request: Request) -> str:
    """Get client IP address from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def check_rate_limit(request: Request) -> bool:
    """Check if request is within rate limits"""
    client_ip = get_client_ip(request)
    return rate_limiter.is_allowed(client_ip)

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Security headers middleware
def add_security_headers(request: Request, call_next):
    """Add security headers to response"""
    response = call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    
    return response

# Input validation
def validate_environment():
    """Validate required environment variables"""
    required_vars = [
        "DATABASE_URL",
        "JWT_SECRET",
        "MEILI_MASTER_KEY"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {missing_vars}")
        raise ValueError(f"Missing required environment variables: {missing_vars}")
    
    # Validate JWT secret strength
    if len(os.getenv("JWT_SECRET", "")) < 32:
        logger.warning("JWT_SECRET should be at least 32 characters long")
    
    logger.info("Environment validation passed")

# CORS configuration
def get_cors_origins() -> List[str]:
    """Get CORS allowed origins based on environment"""
    if os.getenv("ENVIRONMENT") == "production":
        origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
        return [origin.strip() for origin in origins if origin.strip()]
    else:
        return ["*"]  # Development mode
