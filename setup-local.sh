#!/bin/bash

# Local Development Setup Script
# Sets up .venv with Poetry for local development

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}FastAPI Local Development Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if Poetry is installed
if ! command -v poetry &> /dev/null; then
    echo -e "${RED}Error: Poetry is not installed.${NC}"
    echo ""
    echo "Install Poetry:"
    echo "  macOS/Linux: curl -sSL https://install.python-poetry.org | python3 -"
    echo "  macOS (Homebrew): brew install poetry"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Poetry is installed${NC}"
poetry --version
echo ""

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠ PostgreSQL client not found locally${NC}"
    echo "You can either:"
    echo "  1. Install PostgreSQL locally: brew install postgresql"
    echo "  2. Use Docker for database: docker-compose up -d db"
    echo ""
fi

# Navigate to API directory
cd apps/api

# Configure Poetry to create .venv in project
echo -e "${YELLOW}Configuring Poetry...${NC}"
poetry config virtualenvs.in-project true
echo -e "${GREEN}✓ Poetry will create .venv in project${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo ""
    
    # Generate secret key if openssl is available
    if command -v openssl &> /dev/null; then
        SECRET_KEY=$(openssl rand -hex 32)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/your-secret-key-change-in-production-use-openssl-rand-hex-32/$SECRET_KEY/" .env
        else
            # Linux
            sed -i "s/your-secret-key-change-in-production-use-openssl-rand-hex-32/$SECRET_KEY/" .env
        fi
        echo -e "${GREEN}✓ Generated SECRET_KEY${NC}"
    else
        echo -e "${YELLOW}⚠ Please update SECRET_KEY in .env manually${NC}"
    fi
    echo ""
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
    echo ""
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
poetry install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Show virtual environment path
VENV_PATH=$(poetry env info --path)
echo -e "${GREEN}✓ Virtual environment created at:${NC}"
echo "  $VENV_PATH"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Start database (choose one):"
echo "   ${YELLOW}Option A:${NC} Use Docker"
echo "     cd ../.."
echo "     docker-compose up -d db"
echo ""
echo "   ${YELLOW}Option B:${NC} Use local PostgreSQL"
echo "     brew services start postgresql"
echo "     createdb justadrop_db"
echo ""
echo "2. Run migrations:"
echo "     cd apps/api"
echo "     poetry run alembic upgrade head"
echo ""
echo "3. Start the server:"
echo "     poetry run uvicorn main:app --reload"
echo ""
echo "4. Or use the Makefile:"
echo "     make local-dev    # Complete local setup"
echo "     make local-run    # Just start server"
echo ""
echo "Access the application:"
echo "  - API: http://localhost:8000"
echo "  - Docs: http://localhost:8000/api/docs"
echo ""

