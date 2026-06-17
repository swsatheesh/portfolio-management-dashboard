# Portfolio Management Dashboard

A full-stack Portfolio Management Dashboard built using React, TypeScript, Node.js, Express and TypeORM.

This project was developed as part of a technical assessment and demonstrates authentication, portfolio management, transaction history, performance metrics, automated testing, Docker-based development and API documentation.

---

# Features

### Authentication

* JWT-based login
* Protected API routes
* User profile endpoint

### Investments

* Create investments
* Update investments
* Delete investments
* View holdings

Supported asset types:

* STOCK
* BOND
* MUTUAL_FUND
* ETF
* CASH

### Transactions

* BUY transactions
* SELL transactions
* Transaction history
* Delete transactions

### Portfolio Dashboard

* Total invested amount
* Current portfolio value
* Gain/Loss calculation
* Percentage return
* Asset allocation chart

### Developer Experience

* Docker-first workflow
* Swagger API documentation
* REST Client collections
* Jest unit tests
* React Testing Library

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* React Router

## Backend

* Node.js
* Express
* TypeScript
* TypeORM

## Database

Development:

* SQLite

Production:

* PostgreSQL

## Testing

* Jest
* Supertest
* React Testing Library

## Documentation

* Swagger UI
* Markdown documentation
* REST Client collections

---

# Quick Start

Start the application:

```bash
docker compose -f docker-compose.dev.yml up --build
```

---

# Application URLs

| Service     | URL                            |
| ----------- | ------------------------------ |
| Frontend    | http://localhost:5173          |
| Backend API | http://localhost:3000          |
| Swagger UI  | http://localhost:3000/api-docs |

---

# Demo Credentials

Development automatically seeds an admin account:

```text
Email: admin@test.com
Password: password123
```

---

# Running Tests

## Backend

```bash
docker compose -f docker-compose.dev.yml exec api pnpm test
```

## Frontend

```bash
docker compose -f docker-compose.dev.yml exec web pnpm test
```

## Run All Tests

```bash
docker compose -f docker-compose.dev.yml exec api pnpm test && \
docker compose -f docker-compose.dev.yml exec web pnpm test
```

---

# Build Verification

Backend:

```bash
docker compose -f docker-compose.dev.yml exec api pnpm run build
```

Frontend:

```bash
docker compose -f docker-compose.dev.yml exec web pnpm run build
```

---

# Project Structure

```text
portfolio-management-dashboard
│
├── apps
│   ├── api
│   └── web
│
├── docs
│
├── docker-compose.dev.yml
│
└── README.md
```

---

# API Testing

Swagger:

```text
http://localhost:3000/api-docs
```

REST Client files:

```text
apps/api/rest/
├── auth.http
├── investments.http
├── transactions.http
└── portfolio.http
```

---

# Documentation

Available in:

```text
docs/
```

* ARCHITECTURE.md
* API_TESTING.md
* REVIEWER_GUIDE.md
* AI_DISCLOSURE.md

---

# Design Decisions

* Vite was chosen instead of Next.js because SSR was not required.
* SQLite is used for local development to simplify setup.
* PostgreSQL configuration is prepared for production environments.
* Docker is used from the beginning to ensure consistent environments.
* TypeORM enables smooth migration between SQLite and PostgreSQL.

---

# AI Usage

Generative AI tools were used to assist with:

* Documentation drafting
* Boilerplate generation
* Test case suggestions

All generated output was reviewed, modified and validated manually.

See:

```text
docs/AI_DISCLOSURE.md
```

---

# Reviewer Notes

This repository follows an incremental development approach with separate commits representing each implementation stage.

Thank you for reviewing this submission.
