"""
Database seeding script to create initial admin user.
Run this once to set up the default admin account.
"""

import logging
from sqlalchemy.orm import Session
from src.core.database import SessionLocal, engine
from src.models.models import User, UserRole, Base
from src.core.security import hash_password

logger = logging.getLogger(__name__)

# Default admin credentials
DEFAULT_ADMIN_EMAIL = "admin@justadrop.xyz"
DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_PASSWORD = "admin123"  # Change this in production!
DEFAULT_ADMIN_FULL_NAME = "System Administrator"


def create_admin_user(db: Session) -> User:
    """Create the default admin user if it doesn't exist."""
    
    # Check if admin already exists
    existing_admin = db.query(User).filter(
        User.username == DEFAULT_ADMIN_USERNAME
    ).first()
    
    if existing_admin:
        logger.info(f"Admin user '{DEFAULT_ADMIN_USERNAME}' already exists")
        return existing_admin
    
    # Create new admin user
    admin_user = User(
        email=DEFAULT_ADMIN_EMAIL,
        username=DEFAULT_ADMIN_USERNAME,
        hashed_password=hash_password(DEFAULT_ADMIN_PASSWORD),
        full_name=DEFAULT_ADMIN_FULL_NAME,
        role=UserRole.ADMIN,
        is_active=True
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    logger.info(f"✅ Created admin user: {DEFAULT_ADMIN_USERNAME}")
    logger.warning(f"⚠️  Default password: {DEFAULT_ADMIN_PASSWORD}")
    logger.warning("⚠️  Please change the admin password immediately!")
    
    return admin_user


def seed_admin_user():
    """Seed admin user (called automatically on startup)."""
    db = SessionLocal()
    try:
        create_admin_user(db)
    except Exception as e:
        logger.error(f"Failed to seed admin user: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def seed_database():
    """Main seeding function."""
    logger.info("Starting database seeding...")
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Create admin user
        admin = create_admin_user(db)
        
        logger.info("✅ Database seeding completed successfully!")
        logger.info(f"""
        ═══════════════════════════════════════════
        Admin Login Credentials:
        ═══════════════════════════════════════════
        Username: {admin.username}
        Email:    {admin.email}
        Password: {DEFAULT_ADMIN_PASSWORD}
        ═══════════════════════════════════════════
        ⚠️  IMPORTANT: Change the password after first login!
        """)
        
    except Exception as e:
        logger.error(f"❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    seed_database()

