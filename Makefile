.PHONY: help up down restart logs clean install migrate seed

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start all services
	docker-compose up -d

build: ## Build all services
	docker-compose up --build -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

clean: ## Stop and remove all containers, networks, volumes
	docker-compose down -v
	docker system prune -f

install: ## Install dependencies in all services
	docker-compose exec backend pnpm install
	docker-compose exec frontend pnpm install

migrate: ## Run database migrations
	docker-compose exec backend pnpm run db:migrate

seed: ## Seed database with initial data
	docker-compose exec backend pnpm run seed

setup: build migrate seed ## Complete initial setup (build, migrate, seed)

shell-backend: ## Access backend container shell
	docker-compose exec backend sh

shell-frontend: ## Access frontend container shell
	docker-compose exec frontend sh

shell-db: ## Access PostgreSQL shell
	docker-compose exec postgres psql -U martnex -d martnex

status: ## Show status of all services
	docker-compose ps

restart-backend: ## Restart backend service
	docker-compose restart backend

restart-frontend: ## Restart frontend service
	docker-compose restart frontend
