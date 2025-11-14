from fastapi import APIRouter

from src.api.endpoints import auth, users, public, volunteers, organizations, admins

api_router = APIRouter()

# Public endpoints (no auth required)
api_router.include_router(public.router, prefix='/public', tags=['public'])

# Authentication
api_router.include_router(auth.router, prefix='/auth', tags=['authentication'])

# User management
api_router.include_router(users.router, prefix='/users', tags=['users'])

# Volunteer endpoints
api_router.include_router(volunteers.router, prefix='/volunteer', tags=['volunteer'])

# Organization endpoints
api_router.include_router(organizations.router, prefix='/organization', tags=['organization'])

# Admin endpoints
api_router.include_router(admins.router, prefix='/admin', tags=['admin'])

