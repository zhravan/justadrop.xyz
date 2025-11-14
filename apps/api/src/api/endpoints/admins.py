"""
Admin endpoints for platform management.
Requires authentication as an admin.
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from src.core.database import get_db
from src.core.security import get_current_admin
from src.models.models import (
    User, Organization, Opportunity, Application, VolunteerHistory,
    UserRole, OrganizationStatus, OpportunityStatus, ApplicationStatus
)
from src.schemas.organization import OrganizationResponse, OrganizationVerify
from src.schemas.user import UserResponse
from src.core.notifications import notify_organization_verified, notify_organization_rejected

router = APIRouter()


# ========== Organization Verification ==========

@router.get('/organizations/pending', response_model=List[OrganizationResponse])
def get_pending_organizations(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all organizations pending verification."""
    organizations = db.query(Organization).filter(
        Organization.verification_status == OrganizationStatus.PENDING
    ).order_by(Organization.created_at.asc()).all()
    
    return organizations


@router.get('/organizations', response_model=List[OrganizationResponse])
def get_all_organizations(
    verification_status: Optional[str] = Query(None, pattern='^(pending|verified|rejected)$'),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all organizations with optional status filter."""
    query = db.query(Organization)
    
    if verification_status:
        status_map = {
            'pending': OrganizationStatus.PENDING,
            'verified': OrganizationStatus.VERIFIED,
            'rejected': OrganizationStatus.REJECTED
        }
        query = query.filter(Organization.verification_status == status_map[verification_status])
    
    organizations = query.order_by(Organization.created_at.desc()).all()
    
    return organizations


@router.get('/organizations/{org_id}', response_model=OrganizationResponse)
def get_organization(
    org_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get organization details."""
    organization = db.query(Organization).filter(Organization.id == org_id).first()
    
    if not organization:
        raise HTTPException(status_code=404, detail='Organization not found')
    
    return organization


@router.post('/organizations/{org_id}/verify', response_model=OrganizationResponse)
def verify_organization(
    org_id: int,
    verification: OrganizationVerify,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Verify or reject an organization."""
    organization = db.query(Organization).filter(Organization.id == org_id).first()
    
    if not organization:
        raise HTTPException(status_code=404, detail='Organization not found')
    
    if organization.verification_status != OrganizationStatus.PENDING:
        raise HTTPException(status_code=400, detail='Organization already processed')
    
    # Update verification status
    status_map = {
        'verified': OrganizationStatus.VERIFIED,
        'rejected': OrganizationStatus.REJECTED
    }
    organization.verification_status = status_map[verification.verification_status]
    organization.verification_notes = verification.verification_notes
    organization.verified_at = datetime.utcnow()
    organization.verified_by = current_user.id
    
    db.commit()
    db.refresh(organization)
    
    # Send notification
    org_user = db.query(User).filter(User.id == organization.user_id).first()
    
    if org_user:
        if organization.verification_status == OrganizationStatus.VERIFIED:
            notify_organization_verified(org_user.email, organization.organization_name)
        else:
            notify_organization_rejected(
                org_user.email,
                organization.organization_name,
                verification.verification_notes
            )
    
    return organization


# ========== User Management ==========

@router.get('/users', response_model=List[UserResponse])
def get_all_users(
    role: Optional[str] = Query(None, pattern='^(volunteer|organization|admin)$'),
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all users with filters."""
    query = db.query(User)
    
    if role:
        role_map = {
            'volunteer': UserRole.VOLUNTEER,
            'organization': UserRole.ORGANIZATION,
            'admin': UserRole.ADMIN
        }
        query = query.filter(User.role == role_map[role])
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    return users


@router.get('/users/{user_id}', response_model=UserResponse)
def get_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get user details."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    return user


@router.patch('/users/{user_id}/activate', response_model=UserResponse)
def activate_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Activate a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    user.is_active = True
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    return user


@router.patch('/users/{user_id}/deactivate', response_model=UserResponse)
def deactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Deactivate a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    if user.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail='Cannot deactivate admin accounts')
    
    user.is_active = False
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    return user


# ========== Platform Statistics ==========

@router.get('/stats')
def get_platform_stats(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get platform-wide statistics."""
    # User stats
    total_users = db.query(func.count(User.id)).scalar()
    total_volunteers = db.query(func.count(User.id)).filter(
        User.role == UserRole.VOLUNTEER
    ).scalar()
    total_organizations = db.query(func.count(User.id)).filter(
        User.role == UserRole.ORGANIZATION
    ).scalar()
    
    # Organization verification stats
    pending_verifications = db.query(func.count(Organization.id)).filter(
        Organization.verification_status == OrganizationStatus.PENDING
    ).scalar()
    verified_organizations = db.query(func.count(Organization.id)).filter(
        Organization.verification_status == OrganizationStatus.VERIFIED
    ).scalar()
    
    # Opportunity stats
    total_opportunities = db.query(func.count(Opportunity.id)).scalar()
    active_opportunities = db.query(func.count(Opportunity.id)).filter(
        Opportunity.status == OpportunityStatus.ACTIVE
    ).scalar()
    
    # Application stats
    total_applications = db.query(func.count(Application.id)).scalar()
    pending_applications = db.query(func.count(Application.id)).filter(
        Application.status == ApplicationStatus.PENDING
    ).scalar()
    approved_applications = db.query(func.count(Application.id)).filter(
        Application.status == ApplicationStatus.APPROVED
    ).scalar()
    
    # Volunteer hours
    total_hours = db.query(func.sum(VolunteerHistory.hours_contributed)).scalar() or 0.0
    
    return {
        'users': {
            'total': total_users,
            'volunteers': total_volunteers,
            'organizations': total_organizations
        },
        'organizations': {
            'pending_verifications': pending_verifications,
            'verified': verified_organizations
        },
        'opportunities': {
            'total': total_opportunities,
            'active': active_opportunities
        },
        'applications': {
            'total': total_applications,
            'pending': pending_applications,
            'approved': approved_applications
        },
        'impact': {
            'total_volunteer_hours': total_hours
        }
    }


@router.get('/opportunities', response_model=List)
def get_all_opportunities(
    status: Optional[str] = Query(None, pattern='^(draft|active|closed|completed)$'),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all opportunities with optional status filter."""
    query = db.query(
        Opportunity.id,
        Opportunity.title,
        Opportunity.status,
        Opportunity.city,
        Opportunity.category,
        Opportunity.created_at,
        Organization.organization_name,
        Organization.verification_status
    ).join(Organization, Opportunity.organization_id == Organization.id)
    
    if status:
        status_map = {
            'draft': OpportunityStatus.DRAFT,
            'active': OpportunityStatus.ACTIVE,
            'closed': OpportunityStatus.CLOSED,
            'completed': OpportunityStatus.COMPLETED
        }
        query = query.filter(Opportunity.status == status_map[status])
    
    query = query.order_by(desc(Opportunity.created_at))
    
    results = query.offset(skip).limit(limit).all()
    
    opportunities = []
    for opp in results:
        opportunities.append({
            'id': opp.id,
            'title': opp.title,
            'status': opp.status.value,
            'city': opp.city,
            'category': opp.category,
            'created_at': opp.created_at,
            'organization_name': opp.organization_name,
            'organization_verified': opp.verification_status == OrganizationStatus.VERIFIED
        })
    
    return opportunities


@router.get('/recent-activity')
def get_recent_activity(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get recent platform activity."""
    # Recent users
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(5).all()
    
    # Recent applications
    recent_applications = db.query(Application).order_by(desc(Application.created_at)).limit(5).all()
    
    # Recent opportunities
    recent_opportunities = db.query(Opportunity).order_by(desc(Opportunity.created_at)).limit(5).all()
    
    # Pending organization verifications
    pending_orgs = db.query(Organization).filter(
        Organization.verification_status == OrganizationStatus.PENDING
    ).order_by(desc(Organization.created_at)).limit(5).all()
    
    return {
        'recent_users': [
            {
                'id': u.id,
                'username': u.username,
                'role': u.role.value,
                'created_at': u.created_at
            } for u in recent_users
        ],
        'recent_applications': [
            {
                'id': a.id,
                'volunteer_id': a.volunteer_id,
                'opportunity_id': a.opportunity_id,
                'status': a.status.value,
                'created_at': a.created_at
            } for a in recent_applications
        ],
        'recent_opportunities': [
            {
                'id': o.id,
                'title': o.title,
                'organization_id': o.organization_id,
                'status': o.status.value,
                'created_at': o.created_at
            } for o in recent_opportunities
        ],
        'pending_verifications': [
            {
                'id': org.id,
                'organization_name': org.organization_name,
                'created_at': org.created_at
            } for org in pending_orgs
        ]
    }

