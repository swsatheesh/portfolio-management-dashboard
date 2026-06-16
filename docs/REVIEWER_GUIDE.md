# Reviewer Guide

Thank you for reviewing this submission.

This document provides a quick overview of the project, setup instructions, and the easiest ways to evaluate the implementation.

---

# Project Overview

This application is a **Portfolio Management Dashboard** built as part of the technical assessment.

Implemented features:

* JWT Authentication
* Investment Management (CRUD)
* Transaction History (BUY / SELL)
* Portfolio Summary & Performance Metrics
* Docker-based Development Environment
* Swagger API Documentation
* REST Client Collections
* Unit Tests (Backend & Frontend)

---

# Technology Stack

## Frontend

* React
* Vite
* TypeScript

## Backend

* Node.js
* Express
* TypeScript
* TypeORM

## Database

Development:

```text
SQLite
```

Production:

```text
PostgreSQL
```

## Testing

* Jest
* React Testing Library

## Documentation

* Swagger
* Markdown Documentation
* REST Client Collections

---

# Running the Application

Start the project:

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

Development automatically seeds an admin user.

```text
Email: admin@test.com
Password: password123
```

Seed execution is disabled in production.

---

# Available Features

## Authentication

* Login
* Protected routes
* JWT-based authorization

---

## Investments

Users can:

* Create investments
* Edit investments
* Delete investments
* View holdings

Supported asset types:

* STOCK
* BOND
* MUTUAL_FUND
* ETF
* CASH

---

## Transactions

Users can:

* Record BUY transactions
* Record SELL transactions
* View transaction history
* Delete transactions

---

## Portfolio Dashboard

The dashboard provides:

* Total invested amount
* Current portfolio value
* Gain / Loss amount
* Percentage return
* Asset allocation chart

---

# API Documentation

Swagger UI:

```text
http://localhost:3000/api-docs
```

Swagger provides:

* Interactive API testing
* Request examples
* Response schemas

---

# REST Client Files

Location:

```text
apps/api/rest/
```

Files:

```text
auth.http
investments.http
transactions.http
portfolio.http
```

These files can be executed using the VS Code REST Client extension.

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

# Additional Documentation

Available under:

```text
docs/
```

Files:

* ARCHITECTURE.md
* API_TESTING.md
* REVIEWER_GUIDE.md
* PROJECT_DECISIONS.md
* AI_DISCLOSURE.md

---

# Notes

* SQLite is used for local development to simplify setup.
* PostgreSQL configuration is prepared for production usage.
* Docker is used from the beginning to ensure consistent environments.
* The repository follows incremental commits to demonstrate development progress.

Thank you for your time and consideration.
