"""Database migration utilities."""
import logging
from pathlib import Path

from alembic import command
from alembic.config import Config

logger = logging.getLogger(__name__)


def run_migrations():
    """
    Run Alembic migrations programmatically.
    Executes upgrade to head on application startup.
    """
    try:
        # Get the alembic.ini path (in the project root)
        alembic_cfg = Config('alembic.ini')
        
        logger.info('Running database migrations...')
        
        # Run migrations to latest version
        command.upgrade(alembic_cfg, 'head')
        
        logger.info('Database migrations completed successfully')
        
    except Exception as e:
        logger.error(f'Failed to run migrations: {e}')
        raise


def rollback_migration(revision: str = '-1'):
    """
    Rollback migrations to a specific revision.
    
    Args:
        revision: Target revision (default: -1 for one step back)
    """
    try:
        alembic_cfg = Config('alembic.ini')
        
        logger.info(f'Rolling back migration to revision: {revision}')
        
        # Downgrade to specified revision
        command.downgrade(alembic_cfg, revision)
        
        logger.info('Migration rollback completed successfully')
        
    except Exception as e:
        logger.error(f'Failed to rollback migration: {e}')
        raise


def get_current_revision():
    """Get the current database revision."""
    try:
        from alembic.runtime.migration import MigrationContext
        from src.core.database import engine
        
        with engine.connect() as conn:
            context = MigrationContext.configure(conn)
            current_rev = context.get_current_revision()
            return current_rev
            
    except Exception as e:
        logger.error(f'Failed to get current revision: {e}')
        return None

