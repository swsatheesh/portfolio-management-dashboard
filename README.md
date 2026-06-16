# Portfolio Management Dashboard

Assessment scaffold for a Portfolio Management Dashboard using React, TypeScript, Vite, Node.js, Express, REST API, TypeORM-ready configuration, Jest tests and Docker-first development.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript + REST API
- ORM: TypeORM planned from the first commit
- Development/Test DB: SQLite
- Production DB: PostgreSQL
- Testing: Jest, Supertest, React Testing Library
- Runtime: Docker Compose

## First commit

```bash
git add .
git commit -m "chore: initialize Docker-first React Vite and Express TypeScript monorepo"
```

## Start development environment

```bash
docker compose -f docker-compose.dev.yml up --build
```

Open:

- Web: http://localhost:5173
- API health: http://localhost:3000/health

## Stop development environment

```bash
docker compose -f docker-compose.dev.yml down
```

## Run tests inside Docker

```bash
# API tests
docker compose -f docker-compose.dev.yml exec api pnpm test

# Web tests
docker compose -f docker-compose.dev.yml exec web pnpm test

# All tests
docker compose -f docker-compose.dev.yml exec api pnpm test && docker compose -f docker-compose.dev.yml exec web pnpm test
```

## Build production containers

```bash
docker compose -f docker-compose.yml build
```

## Run production-like stack

```bash
docker compose -f docker-compose.yml up --build
```

Open:

- Web: http://localhost:8080
- API: http://localhost:3000
- PostgreSQL: localhost:5432

## Project structure

```text
apps/
  api/     Express REST API
  web/     React Vite frontend
docs/      Architecture and reviewer documentation
docker/    Docker-related scripts/config placeholders
```

## Notes for reviewer

This repository is intentionally built as a clean commit-by-commit assessment project. Docker is the primary workflow so the reviewer does not need to install pnpm or Node.js locally.
