from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_serializer


class OpportunityBase(BaseModel):
    """Base opportunity schema."""
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=20)
    requirements: Optional[str] = None
    city: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    skills_needed: Optional[str] = None
    time_commitment: Optional[str] = None
    spots_available: Optional[int] = Field(None, gt=0)


class OpportunityCreate(OpportunityBase):
    """Schema for creating opportunity."""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    application_deadline: Optional[datetime] = None
    status: Optional[str] = 'draft'  # draft, active, closed, completed


class OpportunityUpdate(BaseModel):
    """Schema for updating opportunity."""
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    description: Optional[str] = Field(None, min_length=20)
    requirements: Optional[str] = None
    city: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    skills_needed: Optional[str] = None
    time_commitment: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    application_deadline: Optional[datetime] = None
    spots_available: Optional[int] = Field(None, gt=0)
    status: Optional[str] = None


class OpportunityResponse(OpportunityBase):
    """Schema for opportunity response."""
    id: int
    organization_id: int
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    application_deadline: Optional[datetime]
    spots_filled: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    @field_serializer('status')
    def serialize_status(self, status, _info):
        """Convert OpportunityStatus enum to string."""
        return status.value if hasattr(status, 'value') else status
    
    class Config:
        from_attributes = True


class OpportunitySummary(BaseModel):
    """Summary schema for listing opportunities."""
    id: int
    title: str
    description: str
    city: Optional[str]
    category: Optional[str]
    organization_id: int
    organization_name: Optional[str] = None
    spots_available: Optional[int]
    spots_filled: int
    application_deadline: Optional[datetime]
    status: str
    created_at: datetime
    
    @field_serializer('status')
    def serialize_status(self, status, _info):
        """Convert OpportunityStatus enum to string."""
        return status.value if hasattr(status, 'value') else status
    
    class Config:
        from_attributes = True

