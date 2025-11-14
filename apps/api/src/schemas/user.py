from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_serializer


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a user."""
    password: str = Field(..., min_length=8, max_length=100)
    role: str = Field(default='volunteer', pattern='^(volunteer|organization|admin)$')
    phone: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    availability: Optional[str] = None
    profile_visibility: Optional[bool] = None


class UserResponse(UserBase):
    """Schema for user response."""
    id: int
    role: str
    phone: Optional[str]
    bio: Optional[str]
    skills: Optional[str]
    location: Optional[str]
    city: Optional[str]
    availability: Optional[str]
    profile_visibility: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    @field_serializer('role')
    def serialize_role(self, role, _info):
        """Convert UserRole enum to string."""
        return role.value if hasattr(role, 'value') else role
    
    class Config:
        from_attributes = True


class VolunteerPublicProfile(BaseModel):
    """Public profile for volunteers."""
    id: int
    username: str
    full_name: Optional[str]
    bio: Optional[str]
    skills: Optional[str]
    city: Optional[str]
    location: Optional[str]
    total_hours: Optional[float] = 0.0
    total_opportunities: Optional[int] = 0
    completed_opportunities: Optional[int] = 0
    created_at: datetime
    
    class Config:
        from_attributes = True

