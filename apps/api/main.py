import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.core.database import engine
from src.core.migrations import run_migrations
from src.core.seed import seed_admin_user
from src.api.routes import api_router
from src.models import models

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager for FastAPI application.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info('Starting up application...')
    logger.info(f'Environment: {settings.ENVIRONMENT}')
    logger.info(f'Database URL: {settings.DATABASE_URL.split("@")[-1]}')  # Hide credentials
    
    # Run database migrations automatically
    try:
        run_migrations()
        logger.info('Database migrations applied successfully')
    except Exception as e:
        logger.error(f'Migration failed: {e}')
        # In production, you might want to prevent startup if migrations fail
        # raise
    
    # Seed admin user if not exists
    try:
        seed_admin_user()
        logger.info('Admin user seeding completed')
    except Exception as e:
        logger.warning(f'Admin user seeding failed or skipped: {e}')
    
    yield
    
    # Shutdown
    logger.info('Shutting down application...')


# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description='FastAPI application with SSR and PostgreSQL',
    docs_url='/api/docs',
    redoc_url='/api/redoc',
    openapi_url='/api/openapi.json',
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Mount static files
app.mount('/static', StaticFiles(directory='src/static'), name='static')

# Setup Jinja2 templates
templates = Jinja2Templates(directory='src/templates')

# Include API routes
app.include_router(api_router, prefix='/api')


# SSR Routes
@app.get('/', response_class=HTMLResponse)
async def home(request: Request):
    """Home page with server-side rendering."""
    return templates.TemplateResponse(
        'index.html',
        {
            'request': request,
            'title': 'Home',
            'project_name': settings.PROJECT_NAME
        }
    )


@app.get('/register', response_class=HTMLResponse)
async def register_page(request: Request):
    """Registration page."""
    return templates.TemplateResponse(
        'register.html',
        {
            'request': request,
            'title': 'Register',
            'project_name': settings.PROJECT_NAME
        }
    )


@app.get('/login', response_class=HTMLResponse)
async def login_page(request: Request):
    """Login page."""
    return templates.TemplateResponse(
        'login.html',
        {
            'request': request,
            'title': 'Sign In',
            'project_name': settings.PROJECT_NAME
        }
    )


@app.get('/opportunities', response_class=HTMLResponse)
async def opportunities_page(request: Request):
    """Browse opportunities page."""
    return templates.TemplateResponse(
        'opportunities.html',
        {
            'request': request,
            'title': 'Browse Opportunities',
            'project_name': settings.PROJECT_NAME
        }
    )


@app.get('/dashboard/volunteer', response_class=HTMLResponse)
async def volunteer_dashboard(request: Request):
    """Volunteer dashboard page."""
    return templates.TemplateResponse(
        'dashboard_volunteer.html',
        {
            'request': request,
            'title': 'Volunteer Dashboard',
            'project_name': settings.PROJECT_NAME
        }
    )


@app.get('/dashboard/organization', response_class=HTMLResponse)
async def organization_dashboard(request: Request):
    """Organization dashboard page."""
    return templates.TemplateResponse(
        'dashboard_organization.html',
        {
            'request': request,
            'title': 'Organization Dashboard',
            'project_name': settings.PROJECT_NAME
        }
    )


@app.get('/dashboard/admin', response_class=HTMLResponse)
async def admin_dashboard(request: Request):
    """Admin dashboard page."""
    return templates.TemplateResponse(
        'dashboard_admin.html',
        {
            'request': request,
            'title': 'Admin Dashboard',
            'project_name': settings.PROJECT_NAME
        }
    )


@app.get('/health')
async def health_check():
    """Health check endpoint."""
    return {
        'status': 'healthy',
        'environment': settings.ENVIRONMENT,
        'version': settings.VERSION
    }


if __name__ == '__main__':
    import uvicorn
    
    uvicorn.run(
        'main:app',
        host='0.0.0.0',
        port=8000,
        reload=settings.ENVIRONMENT == 'development'
    )

