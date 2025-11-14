from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Enum, ForeignKey, Float
from sqlalchemy.orm import relationship
import enum

from src.core.database import Base


class UserRole(str, enum.Enum):
    """User role enum."""
    VOLUNTEER = 'volunteer'
    ORGANIZATION = 'organization'
    ADMIN = 'admin'


class OrganizationStatus(str, enum.Enum):
    """Organization verification status."""
    PENDING = 'pending'
    VERIFIED = 'verified'
    REJECTED = 'rejected'


class ApplicationStatus(str, enum.Enum):
    """Application status enum."""
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'


class OpportunityStatus(str, enum.Enum):
    """Opportunity status enum."""
    DRAFT = 'draft'
    ACTIVE = 'active'
    CLOSED = 'closed'
    COMPLETED = 'completed'


class CompletionStatus(str, enum.Enum):
    """Volunteer completion request status."""
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'


class User(Base):
    """User model with role-based access."""
    
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.VOLUNTEER)
    phone = Column(String(20), nullable=True)
    bio = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)  # JSON string of skills
    location = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    availability = Column(Text, nullable=True)  # Available hours/schedule
    profile_visibility = Column(Boolean, default=True)  # Public profile
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = relationship('Organization', back_populates='user', uselist=False, foreign_keys='Organization.user_id')
    applications = relationship('Application', back_populates='volunteer', foreign_keys='Application.volunteer_id')
    bookmarks = relationship('Bookmark', back_populates='volunteer')
    volunteer_history = relationship('VolunteerHistory', back_populates='volunteer')
    verified_organizations = relationship('Organization', foreign_keys='Organization.verified_by')
    
    def __repr__(self):
        return f'<User {self.username} ({self.role.value})>'


class Organization(Base):
    """Organization/NGO profile."""
    
    __tablename__ = 'organizations'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    organization_name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    registration_number = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)  # Cause area
    verification_status = Column(Enum(OrganizationStatus), default=OrganizationStatus.PENDING)
    verification_notes = Column(Text, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship('User', back_populates='organization', foreign_keys=[user_id])
    verifier = relationship('User', foreign_keys=[verified_by], overlaps='verified_organizations')
    opportunities = relationship('Opportunity', back_populates='organization')
    
    def __repr__(self):
        return f'<Organization {self.organization_name} ({self.verification_status.value})>'


class Opportunity(Base):
    """Volunteer opportunity."""
    
    __tablename__ = 'opportunities'
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey('organizations.id'), nullable=False)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    city = Column(String(100), nullable=True, index=True)
    location = Column(String(255), nullable=True)  # Detailed address
    category = Column(String(100), nullable=True, index=True)
    skills_needed = Column(Text, nullable=True)  # JSON string
    time_commitment = Column(String(100), nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    application_deadline = Column(DateTime, nullable=True)
    spots_available = Column(Integer, nullable=True)
    spots_filled = Column(Integer, default=0)
    status = Column(Enum(OpportunityStatus), default=OpportunityStatus.DRAFT, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = relationship('Organization', back_populates='opportunities')
    applications = relationship('Application', back_populates='opportunity')
    bookmarks = relationship('Bookmark', back_populates='opportunity')
    volunteer_history = relationship('VolunteerHistory', back_populates='opportunity')
    
    def __repr__(self):
        return f'<Opportunity {self.title} ({self.status.value})>'


class Application(Base):
    """Volunteer application to opportunity."""
    
    __tablename__ = 'applications'
    
    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey('opportunities.id'), nullable=False)
    volunteer_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    cover_letter = Column(Text, nullable=True)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    review_notes = Column(Text, nullable=True)
    
    # Completion workflow
    completion_status = Column(Enum(CompletionStatus), nullable=True)
    completion_requested_at = Column(DateTime, nullable=True)
    hours_completed = Column(Float, nullable=True)
    completion_notes = Column(Text, nullable=True)  # Volunteer's notes
    completion_approved_at = Column(DateTime, nullable=True)
    completion_reviewed_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    completion_review_notes = Column(Text, nullable=True)  # NGO's notes
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    opportunity = relationship('Opportunity', back_populates='applications')
    volunteer = relationship('User', back_populates='applications', foreign_keys=[volunteer_id])
    reviewer = relationship('User', foreign_keys=[reviewed_by])
    completion_reviewer = relationship('User', foreign_keys=[completion_reviewed_by])
    
    def __repr__(self):
        return f'<Application {self.id} ({self.status.value})>'


class Bookmark(Base):
    """Saved opportunities by volunteers."""
    
    __tablename__ = 'bookmarks'
    
    id = Column(Integer, primary_key=True, index=True)
    volunteer_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    opportunity_id = Column(Integer, ForeignKey('opportunities.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    volunteer = relationship('User', back_populates='bookmarks')
    opportunity = relationship('Opportunity', back_populates='bookmarks')
    
    def __repr__(self):
        return f'<Bookmark {self.volunteer_id} -> {self.opportunity_id}>'


class VolunteerHistory(Base):
    """Track volunteer hours and completed work."""
    
    __tablename__ = 'volunteer_history'
    
    id = Column(Integer, primary_key=True, index=True)
    volunteer_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    opportunity_id = Column(Integer, ForeignKey('opportunities.id'), nullable=False)
    application_id = Column(Integer, ForeignKey('applications.id'), nullable=True)
    hours_contributed = Column(Float, default=0.0)
    activity_date = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    volunteer = relationship('User', back_populates='volunteer_history')
    opportunity = relationship('Opportunity', back_populates='volunteer_history')
    
    def __repr__(self):
        return f'<VolunteerHistory {self.volunteer_id}: {self.hours_contributed}h>'

