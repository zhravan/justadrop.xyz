"""
Volunteer endpoints for managing applications, bookmarks, and completion requests.
Requires authentication as a volunteer.
"""

from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.core.security import get_current_volunteer
from src.models.models import (
    User, Application, Bookmark, Opportunity, Organization, VolunteerHistory,
    ApplicationStatus, CompletionStatus, OpportunityStatus
)
from src.schemas.application import (
    ApplicationCreate, ApplicationResponse, CompletionRequest
)
from src.schemas.bookmark import BookmarkCreate, BookmarkResponse
from src.schemas.volunteer_history import VolunteerHistoryResponse
from src.core.notifications import (
    notify_application_submitted, notify_new_application, notify_completion_requested
)

router = APIRouter()


@router.post('/applications', response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_opportunity(
    application: ApplicationCreate,
    current_user: User = Depends(get_current_volunteer),
    db: Session = Depends(get_db)
):
    """Apply to a volunteer opportunity."""
    # Check if opportunity exists and is active
    opportunity = db.query(Opportunity).filter(Opportunity.id == application.opportunity_id).first()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail='Opportunity not found')
    
    if opportunity.status != OpportunityStatus.ACTIVE:
        raise HTTPException(status_code=400, detail='This opportunity is not active')
    
    # Check if already applied
    existing = db.query(Application).filter(
        Application.opportunity_id == application.opportunity_id,
        Application.volunteer_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail='You have already applied to this opportunity')
    
    # Create application
    db_application = Application(
        opportunity_id=application.opportunity_id,
        volunteer_id=current_user.id,
        cover_letter=application.cover_letter,
        status=ApplicationStatus.PENDING
    )
    
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    # Send notifications
    organization = db.query(Organization).filter(
        Organization.id == opportunity.organization_id
    ).first()
    
    if organization:
        org_user = db.query(User).filter(User.id == organization.user_id).first()
        if org_user:
            notify_new_application(
                org_user.email,
                current_user.full_name or current_user.username,
                opportunity.title
            )
    
    notify_application_submitted(current_user.email, opportunity.title)
    
    return db_application


@router.get('/applications', response_model=List[ApplicationResponse])
def get_my_applications(
    current_user: User = Depends(get_current_volunteer),
    db: Session = Depends(get_db)
):
    """Get all applications for the current volunteer."""
    applications = db.query(Application).filter(
        Application.volunteer_id == current_user.id
    ).order_by(Application.created_at.desc()).all()
    
    return applications


@router.get('/applications/{application_id}', response_model=ApplicationResponse)
def get_application(
    application_id: int,
    current_user: User = Depends(get_current_volunteer),
    db: Session = Depends(get_db)
):
    """Get a specific application."""
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.volunteer_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail='Application not found')
    
    return application


@router.post('/applications/{application_id}/complete', response_model=ApplicationResponse)
def mark_work_complete(
    application_id: int,
    completion: CompletionRequest,
    current_user: User = Depends(get_current_volunteer),
    db: Session = Depends(get_db)
):
    """Mark volunteer work as complete (pending NGO approval)."""
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.volunteer_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail='Application not found')
    
    if application.status != ApplicationStatus.APPROVED:
        raise HTTPException(status_code=400, detail='Only approved applications can be marked as complete')
    
    if application.completion_status is not None:
        raise HTTPException(status_code=400, detail='Completion already requested')
    
    # Update application with completion request
    application.completion_status = CompletionStatus.PENDING
    application.completion_requested_at = datetime.utcnow()
    application.hours_completed = completion.hours_completed
    application.completion_notes = completion.completion_notes
    
    db.commit()
    db.refresh(application)
    
    # Send notification to organization
    opportunity = db.query(Opportunity).filter(Opportunity.id == application.opportunity_id).first()
    if opportunity:
        organization = db.query(Organization).filter(
            Organization.id == opportunity.organization_id
        ).first()
        if organization:
            org_user = db.query(User).filter(User.id == organization.user_id).first()
            if org_user:
                notify_completion_requested(
                    org_user.email,
                    current_user.full_name or current_user.username,
                    opportunity.title,
                    completion.hours_completed
                )
    
    return application


@router.post('/bookmarks', response_model=BookmarkResponse, status_code=status.HTTP_201_CREATED)
def bookmark_opportunity(
    bookmark: BookmarkCreate,
    current_user: User = Depends(get_current_volunteer),
    db: Session = Depends(get_db)
):
    """Bookmark an opportunity for later."""
    # Check if opportunity exists
    opportunity = db.query(Opportunity).filter(Opportunity.id == bookmark.opportunity_id).first()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail='Opportunity not found')
    
    # Check if already bookmarked
    existing = db.query(Bookmark).filter(
        Bookmark.opportunity_id == bookmark.opportunity_id,
        Bookmark.volunteer_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail='Already bookmarked')
    
    # Create bookmark
    db_bookmark = Bookmark(
        opportunity_id=bookmark.opportunity_id,
        volunteer_id=current_user.id
    )
    
    db.add(db_bookmark)
    db.commit()
    db.refresh(db_bookmark)
    
    return db_bookmark


@router.get('/bookmarks', response_model=List[BookmarkResponse])
def get_my_bookmarks(
    current_user: User = Depends(get_current_volunteer),
    db: Session = Depends(get_db)
):
    """Get all bookmarks for the current volunteer."""
    bookmarks = db.query(Bookmark).filter(
        Bookmark.volunteer_id == current_user.id
    ).order_by(Bookmark.created_at.desc()).all()
    
    return bookmarks


@router.delete('/bookmarks/{bookmark_id}', status_code=status.HTTP_204_NO_CONTENT)
def remove_bookmark(
    bookmark_id: int,
    current_user: User = Depends(get_current_volunteer),
    db: Session = Depends(get_db)
):
    """Remove a bookmark."""
    bookmark = db.query(Bookmark).filter(
        Bookmark.id == bookmark_id,
        Bookmark.volunteer_id == current_user.id
    ).first()
    
    if not bookmark:
        raise HTTPException(status_code=404, detail='Bookmark not found')
    
    db.delete(bookmark)
    db.commit()
    
    return None


@router.get('/history', response_model=List[VolunteerHistoryResponse])
def get_my_history(
    current_user: User = Depends(get_current_volunteer),
    db: Session = Depends(get_db)
):
    """Get volunteer history and impact metrics."""
    history = db.query(VolunteerHistory).filter(
        VolunteerHistory.volunteer_id == current_user.id
    ).order_by(VolunteerHistory.activity_date.desc()).all()
    
    return history

