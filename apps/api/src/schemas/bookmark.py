from datetime import datetime
from pydantic import BaseModel


class BookmarkCreate(BaseModel):
    """Schema for creating bookmark."""
    opportunity_id: int


class BookmarkResponse(BaseModel):
    """Schema for bookmark response."""
    id: int
    volunteer_id: int
    opportunity_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

