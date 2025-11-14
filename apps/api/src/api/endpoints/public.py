"""
Public endpoints for browsing opportunities, organizations, and volunteers.
No authentication required.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from src.core.database import get_db
from src.models.models import (
    Opportunity, Organization, User, Application, VolunteerHistory,
    OpportunityStatus, OrganizationStatus, UserRole, ApplicationStatus, CompletionStatus
)
from src.schemas.opportunity import OpportunitySummary, OpportunityResponse
from src.schemas.organization import OrganizationPublicProfile
from src.schemas.user import VolunteerPublicProfile

router = APIRouter()


@router.get('/opportunities', response_model=List[OpportunitySummary])
def browse_opportunities(
    city: Optional[str] = Query(None, description='Filter by city'),
    category: Optional[str] = Query(None, description='Filter by category'),
    skills: Optional[str] = Query(None, description='Filter by required skills'),
    ngo_name: Optional[str] = Query(None, description='Filter by NGO name'),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Browse all active opportunities (public access).
    
    Filters:
    - city: City location
    - category: Opportunity category
    - skills: Skills needed (partial match)
    - ngo_name: Organization name (partial match)
    """
    query = db.query(
        Opportunity,
        Organization.organization_name.label('organization_name')
    ).join(Organization, Opportunity.organization_id == Organization.id)
    
    # Only show active opportunities
    query = query.filter(Opportunity.status == OpportunityStatus.ACTIVE)
    
    # Apply filters
    if city:
        query = query.filter(Opportunity.city.ilike(f'%{city}%'))
    
    if category:
        query = query.filter(Opportunity.category.ilike(f'%{category}%'))
    
    if skills:
        query = query.filter(Opportunity.skills_needed.ilike(f'%{skills}%'))
    
    if ngo_name:
        query = query.filter(Organization.organization_name.ilike(f'%{ngo_name}%'))
    
    # Sort by most recent
    query = query.order_by(desc(Opportunity.created_at))
    
    # Pagination
    results = query.offset(skip).limit(limit).all()
    
    # Build response
    opportunities = []
    for opp, org_name in results:
        opp_dict = {
            'id': opp.id,
            'title': opp.title,
            'description': opp.description,
            'city': opp.city,
            'category': opp.category,
            'organization_id': opp.organization_id,
            'organization_name': org_name,
            'spots_available': opp.spots_available,
            'spots_filled': opp.spots_filled,
            'application_deadline': opp.application_deadline,
            'status': opp.status,
            'created_at': opp.created_at
        }
        opportunities.append(OpportunitySummary(**opp_dict))
    
    return opportunities


@router.get('/opportunities/{opportunity_id}', response_model=OpportunityResponse)
def get_opportunity_details(
    opportunity_id: int,
    db: Session = Depends(get_db)
):
    """Get full details of an opportunity (public access)."""
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail='Opportunity not found')
    
    return opportunity


@router.get('/organizations', response_model=List[OrganizationPublicProfile])
def browse_organizations(
    city: Optional[str] = Query(None, description='Filter by city'),
    category: Optional[str] = Query(None, description='Filter by category'),
    verified_only: bool = Query(False, description='Show only verified organizations'),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Browse all organizations (public access).
    
    Shows:
    - All public info
    - Verification status
    - Stats (opportunities, volunteers)
    """
    query = db.query(Organization)
    
    # Apply filters
    if city:
        query = query.filter(Organization.city.ilike(f'%{city}%'))
    
    if category:
        query = query.filter(Organization.category.ilike(f'%{category}%'))
    
    if verified_only:
        query = query.filter(Organization.verification_status == OrganizationStatus.VERIFIED)
    
    # Sort by verified first, then by most recent
    query = query.order_by(
        desc(Organization.verification_status == OrganizationStatus.VERIFIED),
        desc(Organization.created_at)
    )
    
    # Pagination
    orgs = query.offset(skip).limit(limit).all()
    
    # Build response with stats
    org_profiles = []
    for org in orgs:
        # Count opportunities
        total_opps = db.query(func.count(Opportunity.id)).filter(
            Opportunity.organization_id == org.id
        ).scalar()
        
        active_opps = db.query(func.count(Opportunity.id)).filter(
            Opportunity.organization_id == org.id,
            Opportunity.status == OpportunityStatus.ACTIVE
        ).scalar()
        
        # Count unique volunteers (approved applications)
        total_volunteers = db.query(func.count(func.distinct(Application.volunteer_id))).join(
            Opportunity, Application.opportunity_id == Opportunity.id
        ).filter(
            Opportunity.organization_id == org.id,
            Application.status == ApplicationStatus.APPROVED
        ).scalar()
        
        org_dict = {
            'id': org.id,
            'organization_name': org.organization_name,
            'description': org.description,
            'website': org.website,
            'city': org.city,
            'category': org.category,
            'contact_email': org.contact_email,
            'contact_phone': org.contact_phone,
            'verification_status': org.verification_status,
            'verified_at': org.verified_at,
            'total_opportunities': total_opps,
            'active_opportunities': active_opps,
            'total_volunteers': total_volunteers,
            'created_at': org.created_at
        }
        org_profiles.append(OrganizationPublicProfile(**org_dict))
    
    return org_profiles


@router.get('/organizations/{org_id}', response_model=OrganizationPublicProfile)
def get_organization_profile(
    org_id: int,
    db: Session = Depends(get_db)
):
    """Get full public profile of an organization."""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    
    if not org:
        raise HTTPException(status_code=404, detail='Organization not found')
    
    # Calculate stats
    total_opps = db.query(func.count(Opportunity.id)).filter(
        Opportunity.organization_id == org.id
    ).scalar()
    
    active_opps = db.query(func.count(Opportunity.id)).filter(
        Opportunity.organization_id == org.id,
        Opportunity.status == OpportunityStatus.ACTIVE
    ).scalar()
    
    total_volunteers = db.query(func.count(func.distinct(Application.volunteer_id))).join(
        Opportunity, Application.opportunity_id == Opportunity.id
    ).filter(
        Opportunity.organization_id == org.id,
        Application.status == ApplicationStatus.APPROVED
    ).scalar()
    
    org_dict = {
        'id': org.id,
        'organization_name': org.organization_name,
        'description': org.description,
        'website': org.website,
        'city': org.city,
        'category': org.category,
        'contact_email': org.contact_email,
        'contact_phone': org.contact_phone,
        'verification_status': org.verification_status,
        'verified_at': org.verified_at,
        'total_opportunities': total_opps,
        'active_opportunities': active_opps,
        'total_volunteers': total_volunteers,
        'created_at': org.created_at
    }
    
    return OrganizationPublicProfile(**org_dict)


@router.get('/volunteers', response_model=List[VolunteerPublicProfile])
def browse_volunteers(
    city: Optional[str] = Query(None, description='Filter by city'),
    skills: Optional[str] = Query(None, description='Filter by skills'),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Browse volunteer profiles (public access).
    
    Shows only profiles with profile_visibility=True.
    """
    query = db.query(User).filter(
        User.role == UserRole.VOLUNTEER,
        User.profile_visibility == True,
        User.is_active == True
    )
    
    # Apply filters
    if city:
        query = query.filter(User.city.ilike(f'%{city}%'))
    
    if skills:
        query = query.filter(User.skills.ilike(f'%{skills}%'))
    
    # Sort by most active (most hours)
    volunteers = query.offset(skip).limit(limit).all()
    
    # Build response with stats
    profiles = []
    for volunteer in volunteers:
        # Calculate total hours
        total_hours = db.query(func.sum(VolunteerHistory.hours_contributed)).filter(
            VolunteerHistory.volunteer_id == volunteer.id
        ).scalar() or 0.0
        
        # Count total opportunities applied to
        total_opps = db.query(func.count(Application.id)).filter(
            Application.volunteer_id == volunteer.id
        ).scalar() or 0
        
        # Count completed opportunities (completion approved)
        completed_opps = db.query(func.count(Application.id)).filter(
            Application.volunteer_id == volunteer.id,
            Application.completion_status == CompletionStatus.APPROVED
        ).scalar() or 0
        
        profile_dict = {
            'id': volunteer.id,
            'username': volunteer.username,
            'full_name': volunteer.full_name,
            'bio': volunteer.bio,
            'skills': volunteer.skills,
            'city': volunteer.city,
            'location': volunteer.location,
            'total_hours': total_hours,
            'total_opportunities': total_opps,
            'completed_opportunities': completed_opps,
            'created_at': volunteer.created_at
        }
        profiles.append(VolunteerPublicProfile(**profile_dict))
    
    return profiles


@router.get('/volunteers/{volunteer_id}', response_model=VolunteerPublicProfile)
def get_volunteer_profile(
    volunteer_id: int,
    db: Session = Depends(get_db)
):
    """Get public profile of a volunteer."""
    volunteer = db.query(User).filter(
        User.id == volunteer_id,
        User.role == UserRole.VOLUNTEER,
        User.is_active == True
    ).first()
    
    if not volunteer:
        raise HTTPException(status_code=404, detail='Volunteer not found')
    
    # Check if profile is public
    if not volunteer.profile_visibility:
        raise HTTPException(status_code=403, detail='This profile is private')
    
    # Calculate stats
    total_hours = db.query(func.sum(VolunteerHistory.hours_contributed)).filter(
        VolunteerHistory.volunteer_id == volunteer.id
    ).scalar() or 0.0
    
    total_opps = db.query(func.count(Application.id)).filter(
        Application.volunteer_id == volunteer.id
    ).scalar() or 0
    
    completed_opps = db.query(func.count(Application.id)).filter(
        Application.volunteer_id == volunteer.id,
        Application.completion_status == CompletionStatus.APPROVED
    ).scalar() or 0
    
    profile_dict = {
        'id': volunteer.id,
        'username': volunteer.username,
        'full_name': volunteer.full_name,
        'bio': volunteer.bio,
        'skills': volunteer.skills,
        'city': volunteer.city,
        'location': volunteer.location,
        'total_hours': total_hours,
        'total_opportunities': total_opps,
        'completed_opportunities': completed_opps,
        'created_at': volunteer.created_at
    }
    
    return VolunteerPublicProfile(**profile_dict)

