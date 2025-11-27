#!/bin/bash

# Deployment script for Just a Drop
# This script helps with deploying and managing the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if .env.production exists
check_env_file() {
    if [ ! -f .env.production ]; then
        print_error ".env.production file not found!"
        print_info "Please copy .env.production.example to .env.production and fill in your values"
        echo "  cp .env.production.example .env.production"
        exit 1
    fi
    print_success ".env.production file found"
}

# Build and start services
deploy() {
    print_info "Starting deployment..."

    check_env_file

    print_info "Building Docker images..."
    docker compose --env-file .env.production build --no-cache

    print_success "Docker images built successfully"

    print_info "Starting services..."
    docker compose --env-file .env.production up -d

    print_success "Services started successfully"

    print_info "Waiting for database to be ready..."
    sleep 5

    print_info "Running database migrations..."
    docker compose --env-file .env.production exec api bun run --cwd /app/packages/db db:migrate

    print_success "Database migrations completed"

    print_info "Deployment completed!"
    print_info "Your application should be available at:"
    echo "  - https://justadrop.xyz (Frontend)"
    echo "  - https://api.justadrop.xyz (API)"
}

# Redeploy (rebuild and restart)
redeploy() {
    print_info "Redeploying application..."

    check_env_file

    print_info "Stopping services..."
    docker compose --env-file .env.production down

    print_info "Rebuilding images..."
    docker compose --env-file .env.production build --no-cache

    print_info "Starting services..."
    docker compose --env-file .env.production up -d

    print_success "Redeployment completed!"
}

# Stop services
stop() {
    print_info "Stopping services..."
    docker compose --env-file .env.production down
    print_success "Services stopped"
}

# View logs
logs() {
    if [ -z "$1" ]; then
        docker compose --env-file .env.production logs -f
    else
        docker compose --env-file .env.production logs -f "$1"
    fi
}

# Show status
status() {
    docker compose --env-file .env.production ps
}

# Backup database
backup() {
    print_info "Creating database backup..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker compose --env-file .env.production exec -T db pg_dump -U postgres justadrop > "$BACKUP_FILE"
    print_success "Database backup created: $BACKUP_FILE"
}

# Restore database
restore() {
    if [ -z "$1" ]; then
        print_error "Please specify backup file"
        echo "Usage: ./deploy.sh restore <backup_file>"
        exit 1
    fi

    if [ ! -f "$1" ]; then
        print_error "Backup file not found: $1"
        exit 1
    fi

    print_warning "This will restore the database from backup. Are you sure? (yes/no)"
    read -r response
    if [ "$response" != "yes" ]; then
        print_info "Restore cancelled"
        exit 0
    fi

    print_info "Restoring database from $1..."
    docker compose --env-file .env.production exec -T db psql -U postgres justadrop < "$1"
    print_success "Database restored successfully"
}

# Seed admin user
seed_admin() {
    print_info "Creating admin user..."
    docker compose --env-file .env.production exec api bun run --cwd /app/packages/db seed:admin
    print_success "Admin user created"
}

# Show help
show_help() {
    echo "Just a Drop - Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  deploy      - Build and deploy the application"
    echo "  redeploy    - Rebuild and restart all services"
    echo "  stop        - Stop all services"
    echo "  restart     - Restart all services"
    echo "  logs [svc]  - View logs (optional: specify service name)"
    echo "  status      - Show service status"
    echo "  backup      - Create database backup"
    echo "  restore     - Restore database from backup"
    echo "  seed-admin  - Create initial admin user"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh deploy"
    echo "  ./deploy.sh logs api"
    echo "  ./deploy.sh restore backup_20240101_120000.sql"
}

# Main script logic
case "$1" in
    deploy)
        deploy
        ;;
    redeploy)
        redeploy
        ;;
    stop)
        stop
        ;;
    restart)
        docker compose --env-file .env.production restart
        print_success "Services restarted"
        ;;
    logs)
        logs "$2"
        ;;
    status)
        status
        ;;
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    seed-admin)
        seed_admin
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
