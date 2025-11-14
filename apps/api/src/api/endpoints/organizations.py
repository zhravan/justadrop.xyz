"""
Organization endpoints for managing opportunities, applications, and volunteers.
Requires authentication as an organization.
"""

from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from src.core.database import get_db
from src.core.security import get_current_organization, get_verified_organization
from src.models.models import (
    User, Organization, Opportunity, Application, VolunteerHistory,
    OpportunityStatus, ApplicationStatus, CompletionStatus
)
from src.schemas.opportunity import OpportunityCreate, OpportunityUpdate, OpportunityResponse
from src.schemas.application import ApplicationResponse, ApplicationReview, CompletionReview
from src.core.notifications import (
    notify_application_approved, notify_application_rejected,
    notify_completion_approved, notify_completion_rejected
)

router = APIRouter()


# ========== Opportunity Management ==========

@router.post('/opportunities', response_model=OpportunityResponse, status_code=status.HTTP_201_CREATED)
def create_opportunity(
    opportunity: OpportunityCreate,
    current_user: User = Depends(get_verified_organization),
    db: Session = Depends(get_db)
):
    """
    Create a new volunteer opportunity.
    Only verified organizations can post opportunities.
    """
    organization = db.query(Organization).filter(
        Organization.user_id == current_user.id
    ).first()
    
    if not organization:
        raise HTTPException(status_code=404, detail='Organization profile not found')
    
    # Map status string to enum
    status_map = {
        'draft': OpportunityStatus.DRAFT,
        'active': OpportunityStatus.ACTIVE,
        'closed': OpportunityStatus.CLOSED,
        'completed': OpportunityStatus.COMPLETED
    }
    opp_status = status_map.get(opportunity.status.lower(), OpportunityStatus.DRAFT)
    
    # Create opportunity
    db_opportunity = Opportunity(
        organization_id=organization.id,
        title=opportunity.title,
        description=opportunity.description,
        requirements=opportunity.requirements,
        city=opportunity.city,
        location=opportunity.location,
        category=opportunity.category,
        skills_needed=opportunity.skills_needed,
        time_commitment=opportunity.time_commitment,
        start_date=opportunity.start_date,
        end_date=opportunity.end_date,
        application_deadline=opportunity.application_deadline,
        spots_available=opportunity.spots_available,
        status=opp_status
    )
    
    db.add(db_opportunity)
    db.commit()
    db.refresh(db_opportunity)
    
    return db_opportunity


@router.get('/opportunities', response_model=List[OpportunityResponse])
def get_my_opportunities(
    current_user: User = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Get all opportunities for the current organization."""
    organization = db.query(Organization).filter(
        Organization.user_id == current_user.id
    ).first()
    
    if not organization:
        raise HTTPException(status_code=404, detail='Organization profile not found')
    
    opportunities = db.query(Opportunity).filter(
        Opportunity.organization_id == organization.id
    ).order_by(Opportunity.created_at.desc()).all()
    
    return opportunities


@router.get('/opportunities/{opportunity_id}', response_model=OpportunityResponse)
def get_opportunity(
    opportunity_id: int,
    current_user: User = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Get a specific opportunity."""
    organization = db.query(Organization).filter(
        Organization.user_id == current_user.id
    ).first()
    
    if not organization:
        raise HTTPException(status_code=404, detail='Organization profile not found')
    
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id,
        Opportunity.organization_id == organization.id
    ).first()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail='Opportunity not found')
    
    return opportunity


@router.patch('/opportunities/{opportunity_id}', response_model=OpportunityResponse)
def update_opportunity(
    opportunity_id: int,
    opportunity_update: OpportunityUpdate,
    current_user: User = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Update an opportunity."""
    organization = db.query(Organization).filter(
        Organization.user_id == current_user.id
    ).first()
    
    if not organization:
        raise HTTPException(status_code=404, detail='Organization profile not found')
    
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id,
        Opportunity.organization_id == organization.id
    ).first()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail='Opportunity not found')
    
    # Update fields
    update_data = opportunity_update.model_dump(exclude_unset=True)
    
    # Handle status update
    if 'status' in update_data and update_data['status']:
        status_map = {
            'draft': OpportunityStatus.DRAFT,
            'active': OpportunityStatus.ACTIVE,
            'closed': OpportunityStatus.CLOSED,
            'completed': OpportunityStatus.COMPLETED
        }
        update_data['status'] = status_map.get(update_data['status'].lower(), opportunity.status)
    
    for field, value in update_data.items():
        setattr(opportunity, field, value)
    
    opportunity.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(opportunity)
    
    return opportunity


@router.delete('/opportunities/{opportunity_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_opportunity(
    opportunity_id: int,
    current_user: User = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Delete an opportunity (only if no approved applications)."""
    organization = db.query(Organization).filter(
        Organization.user_id == current_user.id
    ).first()
    
    if not organization:
        raise HTTPException(status_code=404, detail='Organization profile not found')
    
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id,
        Opportunity.organization_id == organization.id
    ).first()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail='Opportunity not found')
    
    # Check if there are approved applications
    approved_count = db.query(Application).filter(
        Application.opportunity_id == opportunity_id,
        Application.status == ApplicationStatus.APPROVED
    ).count()
    
    if approved_count > 0:
        raise HTTPException(
            status_code=400,
            detail='Cannot delete opportunity with approved applications'
        )
    
    db.delete(opportunity)
    db.commit()
    
    return None


# ========== Application Management ==========

@router.get('/applications', response_model=List[ApplicationResponse])
def get_all_applications(
    opportunity_id: int = None,
    current_user: User = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Get all applications for the organization's opportunities."""
    organization = db.query(Organization).filter(
        Organization.user_id == current_user.id
    ).first()
    
    if not organization:
        raise HTTPException(status_code=404, detail='Organization profile not found')
    
    query = db.query(Application).join(
        Opportunity, Application.opportunity_id == Opportunity.id
    ).filter(Opportunity.organization_id == organization.id)
    
    if opportunity_id:
        query = query.filter(Application.opportunity_id == opportunity_id)
    
    applications = query.order_by(Application.created_at.desc()).all()
    
    return applications


@router.get('/applications/{application_id}', response_model=ApplicationResponse)
def get_application(
    application_id: int,
    current_user: User = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Get a specific application with volunteer details."""
    organization = db.query(Organization).filter(
        Organization.user_id == current_user.id
    ).first()
    
    if not organization:
        raise HTTPException(status_code=404, detail='Organization profile not found')
    
    application = db.query(Application).join(
        Opportunity, Application.opportunity_id == Opportunity.id
    ).filter(
        Application.id == application_id,
        Opportunity.organization_id == organization.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail='Application not found')
    
    return application


@router.post('/applications/{application_id}/review', response_model=ApplicationResponse)
def review_application(
    application_id: int,
    review: ApplicationReview,
    current_user: User = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Approve or reject an application."""
    organization = db.query(Organization).filter(
        Organization.user_id == current_user.id
    ).first()
    
    if not organization:
        raise HTTPException(status_code=404, detail='Organization profile not found')
    
    application = db.query(Application).join(
        Opportunity, Application.opportunity_id == Opportunity.id
    ).filter(
        Application.id == application_id,
        Opportunity.organization_id == organization.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail='Application not found')
    
    if application.status != ApplicationStatus.PENDING:
        raise HTTPException(status_code=400, detail='Application already reviewed')
    
    # Update application
    status_map = {
        'approved': ApplicationStatus.APPROVED,
        'rejected': ApplicationStatus.REJECTED
    }
    application.status = status_map[review.status]
    application.reviewed_at = datetime.utcnow()
    application.reviewed_by = current_user.id
    application.review_notes = review.review_notes
    
    # Update spots filled if approved
    if application.status == ApplicationStatus.APPROVED:
        opportunity = db.query(Opportunity).filter(
            Opportunity.id == application.opportunity_id
        ).first()
        if opportunity:
            opportunity.spots_filled = (opportunity.spots_filled or 0) + 1
    
    db.commit()
    db.refresh(application)
    
    # Send notification
    volunteer = db.query(User).filter(User.id == application.volunteer_id).first()
    opportunity = db.query(Opportunity).filter(Opportunity.id == application.opportunity_id).first()
    
    if volunteer and opportunity:
        if application.status == ApplicationStatus.APPROVED:
            notify_application_approved(
                volunteer.email,
                opportunity.title,
                organization.organization_name
            )
        else:
            notify_application_rejected(
                volunteer.email,
                opportunity.title,
                review.review_notes
            )
    
    return application


@router.post('/applications/{application_id}/complete/review', response_model=ApplicationResponse)
def review_completion(
    application_id: int,
    review: CompletionReview,
    current_user: User = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Approve or reject volunteer's completion request."""
    organization = db.query(Organization).filter(
        Organization.user_id == current_user.id
    ).first()
    
    if not organization:
        raise HTTPException(status_code=404, detail='Organization profile not found')
    
    application = db.query(Application).join(
        Opportunity, Application.opportunity_id == Opportunity.id
    ).filter(
        Application.id == application_id,
        Opportunity.organization_id == organization.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail='Application not found')
    
    if application.completion_status != CompletionStatus.PENDING:
        raise HTTPException(status_code=400, detail='No pending completion request')
    
    # Update completion status
    status_map = {
        'approved': CompletionStatus.APPROVED,
        'rejected': CompletionStatus.REJECTED
    }
    application.completion_status = status_map[review.completion_status]
    application.completion_approved_at = datetime.utcnow()
    application.completion_reviewed_by = current_user.id
    application.completion_review_notes = review.completion_review_notes
    
    # If approved, create volunteer history record
    if application.completion_status == CompletionStatus.APPROVED:
        history = VolunteerHistory(
            volunteer_id=application.volunteer_id,
            opportunity_id=application.opportunity_id,
            application_id=application.id,
            hours_contributed=application.hours_completed,
            activity_date=datetime.utcnow(),
            notes=application.completion_notes
        )
        db.add(history)
    
    db.commit()
    db.refresh(application)
    
    # Send notification
    volunteer = db.query(User).filter(User.id == application.volunteer_id).first()
    opportunity = db.query(Opportunity).filter(Opportunity.id == application.opportunity_id).first()
    
    if volunteer and opportunity:
        if application.completion_status == CompletionStatus.APPROVED:
            notify_completion_approved(
                volunteer.email,
                opportunity.title,
                application.hours_completed
            )
        else:
            notify_completion_rejected(
                volunteer.email,
                opportunity.title,
                review.completion_review_notes
            )
    
    return application


# ========== Statistics ==========

@router.get('/stats')
def get_organization_stats(
    current_user: User = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Get statistics for the organization."""
    organization = db.query(Organization).filter(
        Organization.user_id == current_user.id
    ).first()
    
    if not organization:
        raise HTTPException(status_code=404, detail='Organization profile not found')
    
    # Count opportunities by status
    total_opportunities = db.query(func.count(Opportunity.id)).filter(
        Opportunity.organization_id == organization.id
    ).scalar()
    
    active_opportunities = db.query(func.count(Opportunity.id)).filter(
        Opportunity.organization_id == organization.id,
        Opportunity.status == OpportunityStatus.ACTIVE
    ).scalar()
    
    # Count applications
    total_applications = db.query(func.count(Application.id)).join(
        Opportunity, Application.opportunity_id == Opportunity.id
    ).filter(Opportunity.organization_id == organization.id).scalar()
    
    pending_applications = db.query(func.count(Application.id)).join(
        Opportunity, Application.opportunity_id == Opportunity.id
    ).filter(
        Opportunity.organization_id == organization.id,
        Application.status == ApplicationStatus.PENDING
    ).scalar()
    
    # Count unique volunteers (approved applications)
    total_volunteers = db.query(func.count(func.distinct(Application.volunteer_id))).join(
        Opportunity, Application.opportunity_id == Opportunity.id
    ).filter(
        Opportunity.organization_id == organization.id,
        Application.status == ApplicationStatus.APPROVED
    ).scalar()
    
    # Count pending completion requests
    pending_completions = db.query(func.count(Application.id)).join(
        Opportunity, Application.opportunity_id == Opportunity.id
    ).filter(
        Opportunity.organization_id == organization.id,
        Application.completion_status == CompletionStatus.PENDING
    ).scalar()
    
    # Total volunteer hours
    total_hours = db.query(func.sum(VolunteerHistory.hours_contributed)).join(
        Opportunity, VolunteerHistory.opportunity_id == Opportunity.id
    ).filter(Opportunity.organization_id == organization.id).scalar() or 0.0
    
    return {
        'total_opportunities': total_opportunities,
        'active_opportunities': active_opportunities,
        'total_applications': total_applications,
        'pending_applications': pending_applications,
        'total_volunteers': total_volunteers,
        'pending_completions': pending_completions,
        'total_volunteer_hours': total_hours,
        'verification_status': organization.verification_status.value
    }

