from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_serializer


class OrganizationBase(BaseModel):
    """Base organization schema."""
    organization_name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    registration_number: Optional[str] = None
    category: Optional[str] = None


class OrganizationCreate(OrganizationBase):
    """Schema for creating organization profile."""
    pass


class OrganizationUpdate(BaseModel):
    """Schema for updating organization."""
    organization_name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    registration_number: Optional[str] = None
    category: Optional[str] = None


class OrganizationVerify(BaseModel):
    """Schema for verifying organization."""
    verification_status: str = Field(..., pattern='^(verified|rejected)$')
    verification_notes: Optional[str] = None


class OrganizationResponse(OrganizationBase):
    """Schema for organization response."""
    id: int
    user_id: int
    verification_status: str
    verification_notes: Optional[str]
    verified_at: Optional[datetime]
    verified_by: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    @field_serializer('verification_status')
    def serialize_status(self, status, _info):
        """Convert OrganizationStatus enum to string."""
        return status.value if hasattr(status, 'value') else status
    
    class Config:
        from_attributes = True


class OrganizationPublicProfile(BaseModel):
    """Public profile for organizations."""
    id: int
    organization_name: str
    description: Optional[str]
    website: Optional[str]
    city: Optional[str]
    category: Optional[str]
    contact_email: Optional[str]
    contact_phone: Optional[str]
    verification_status: str
    verified_at: Optional[datetime]
    total_opportunities: Optional[int] = 0
    active_opportunities: Optional[int] = 0
    total_volunteers: Optional[int] = 0
    created_at: datetime
    
    @field_serializer('verification_status')
    def serialize_status(self, status, _info):
        """Convert OrganizationStatus enum to string."""
        return status.value if hasattr(status, 'value') else status
    
    class Config:
        from_attributes = True

