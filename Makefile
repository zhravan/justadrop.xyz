.PHONY: help setup up down logs build restart clean migrate migration shell test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Initial setup - copy env file
	@echo "Setting up environment..."
	@if [ ! -f apps/api/.env ]; then \
		cp apps/api/.env.example apps/api/.env; \
		echo "Created .env file. Please update SECRET_KEY and other values."; \
	else \
		echo ".env file already exists."; \
	fi

up: ## Start all services
	docker-compose up -d
	@echo "Services started. Access:"
	@echo "  - API: http://localhost:8000"
	@echo "  - API Docs: http://localhost:8000/api/docs"
	@echo "  - pgAdmin: http://localhost:5050"

down: ## Stop all services
	docker-compose down

logs: ## View logs from all services
	docker-compose logs -f

logs-api: ## View logs from API service
	docker-compose logs -f api

logs-db: ## View logs from database service
	docker-compose logs -f db

build: ## Build or rebuild services
	docker-compose up -d --build

restart: ## Restart all services
	docker-compose restart

restart-api: ## Restart API service
	docker-compose restart api

clean: ## Stop and remove all containers, networks, volumes
	docker-compose down -v
	@echo "All containers, networks, and volumes removed."

migrate: ## Run database migrations (migrations run automatically on startup)
	docker-compose exec api poetry run alembic upgrade head

migration: ## Create a new migration (use: make migration MSG="description")
	docker-compose exec api poetry run alembic revision --autogenerate -m "$(MSG)"

downgrade: ## Rollback last migration
	docker-compose exec api poetry run alembic downgrade -1

seed: ## Manually seed database with admin user (auto-runs on startup)
	@echo "Seeding database with admin user..."
	docker-compose exec api python seed_db.py

shell: ## Access API container shell
	docker-compose exec api /bin/bash

db-shell: ## Access PostgreSQL shell
	docker-compose exec db psql -U postgres -d justadrop_db

test: ## Run tests
	docker-compose exec api poetry run pytest

format: ## Format code with Black
	docker-compose exec api poetry run black .

lint: ## Lint code with Ruff
	docker-compose exec api poetry run ruff check .

lint-fix: ## Lint and fix code with Ruff
	docker-compose exec api poetry run ruff check --fix .

type-check: ## Run type checking with mypy
	docker-compose exec api poetry run mypy src/

ps: ## Show running containers
	docker-compose ps

init: setup up ## Complete initial setup (migrations and seeding run automatically)
	@echo ""
	@echo "⏳ Waiting for services to start and auto-migrations to complete..."
	@sleep 5
	@echo ""
	@echo "✅ Application ready!"
	@echo "  - API: http://localhost:8000"
	@echo "  - Docs: http://localhost:8000/api/docs"
	@echo "  - pgAdmin: http://localhost:5050"
	@echo ""
	@echo "🔐 Default Admin Credentials:"
	@echo "  - Username: admin"
	@echo "  - Password: admin123"
	@echo "  ⚠️  Change password after first login!"
	@echo ""
	@echo "ℹ️  Migrations and seeding run automatically on startup"

# Local Development Commands (without Docker)
local-setup: ## Setup local development with .venv
	@echo "Setting up local development environment..."
	./setup-local.sh

local-install: ## Install dependencies in .venv
	cd apps/api && poetry config virtualenvs.in-project true && poetry install

local-run: ## Run server locally with .venv
	cd apps/api && poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000

local-migrate: ## Run migrations locally (migrations run automatically on startup)
	cd apps/api && poetry run alembic upgrade head

local-migration: ## Create migration locally (use: make local-migration MSG="description")
	cd apps/api && poetry run alembic revision --autogenerate -m "$(MSG)"

local-downgrade: ## Rollback last migration locally
	cd apps/api && poetry run alembic downgrade -1

local-seed: ## Manually seed database with admin user (auto-runs on startup)
	@echo "Seeding database with admin user..."
	cd apps/api && poetry run python seed_db.py

local-shell: ## Activate poetry shell
	cd apps/api && poetry shell

local-test: ## Run tests locally
	cd apps/api && poetry run pytest

local-format: ## Format code locally
	cd apps/api && poetry run black .

local-lint: ## Lint code locally
	cd apps/api && poetry run ruff check .

local-dev: local-install local-run ## Complete local dev setup (migrations run automatically)

