from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_serializer


class ApplicationBase(BaseModel):
    """Base application schema."""
    cover_letter: Optional[str] = Field(None, max_length=2000)


class ApplicationCreate(ApplicationBase):
    """Schema for creating application."""
    opportunity_id: int


class ApplicationUpdate(BaseModel):
    """Schema for updating application."""
    cover_letter: Optional[str] = Field(None, max_length=2000)


class ApplicationReview(BaseModel):
    """Schema for reviewing application."""
    status: str = Field(..., pattern='^(approved|rejected)$')
    review_notes: Optional[str] = None


class CompletionRequest(BaseModel):
    """Schema for volunteer marking work as complete."""
    hours_completed: float = Field(..., gt=0)
    completion_notes: Optional[str] = None


class CompletionReview(BaseModel):
    """Schema for organization reviewing completion."""
    completion_status: str = Field(..., pattern='^(approved|rejected)$')
    completion_review_notes: Optional[str] = None


class ApplicationResponse(ApplicationBase):
    """Schema for application response."""
    id: int
    opportunity_id: int
    volunteer_id: int
    status: str
    reviewed_at: Optional[datetime]
    reviewed_by: Optional[int]
    review_notes: Optional[str]
    
    # Completion fields
    completion_status: Optional[str]
    completion_requested_at: Optional[datetime]
    hours_completed: Optional[float]
    completion_notes: Optional[str]
    completion_approved_at: Optional[datetime]
    completion_reviewed_by: Optional[int]
    completion_review_notes: Optional[str]
    
    created_at: datetime
    updated_at: datetime
    
    @field_serializer('status')
    def serialize_status(self, status, _info):
        """Convert ApplicationStatus enum to string."""
        return status.value if hasattr(status, 'value') else status
    
    @field_serializer('completion_status')
    def serialize_completion(self, completion_status, _info):
        """Convert CompletionStatus enum to string."""
        if completion_status is None:
            return None
        return completion_status.value if hasattr(completion_status, 'value') else completion_status
    
    class Config:
        from_attributes = True

