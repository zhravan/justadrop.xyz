from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class VolunteerHistoryCreate(BaseModel):
    """Schema for creating volunteer history."""
    opportunity_id: Optional[int] = None
    hours_contributed: float = Field(..., gt=0)
    activity_date: datetime
    notes: Optional[str] = None


class VolunteerHistoryResponse(BaseModel):
    """Schema for volunteer history response."""
    id: int
    volunteer_id: int
    opportunity_id: Optional[int]
    hours_contributed: float
    activity_date: datetime
    notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ImpactMetrics(BaseModel):
    """Schema for volunteer impact metrics."""
    total_hours: float
    total_opportunities: int
    total_applications: int
    approved_applications: int
    pending_applications: int
    rejected_applications: int

