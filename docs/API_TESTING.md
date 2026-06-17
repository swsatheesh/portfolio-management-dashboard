# API Testing Guide

This document describes the available methods for testing the Portfolio Management Dashboard APIs.

---

# Prerequisites

## Start the Application

Run:

```bash
docker compose -f docker-compose.dev.yml up --build
```

The following services should be available:

| Service    | URL                            |
| ---------- | ------------------------------ |
| Frontend   | http://localhost:5173          |
| API        | http://localhost:3000          |
| Swagger UI | http://localhost:3000/api-docs |

---

# Method 1 — Swagger UI

Swagger provides interactive API documentation.

Open:

```text
http://localhost:3000/api-docs
```

Using Swagger you can:

* Inspect endpoints
* View request schemas
* View response schemas
* Execute requests directly from the browser

Available API groups:

* Auth
* Investments
* Transactions
* Portfolio

---

# Method 2 — VS Code REST Client

Install the VS Code extension:

```text
REST Client
```

Author:

```text
Huachao Mao
```

---

## REST Client Files

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

---

## Authentication Flow

Open:

```text
apps/api/rest/auth.http
```

Execute:

### Health Check

```http
GET /health
```

### Login

```http
POST /api/auth/login
```

Credentials:

```text
email: admin@test.com
password: password123
```

The JWT token is automatically extracted:

```http
@token={{login.response.body.accessToken}}
```

### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer {{token}}
```

---

# Investment APIs

Open:

```text
apps/api/rest/investments.http
```

Operations:

* Create investment
* Retrieve investments
* Update investment
* Delete investment

Example investment:

```json
{
  "name": "Apple Inc.",
  "symbol": "AAPL",
  "assetType": "STOCK",
  "quantity": 10,
  "purchasePrice": 150,
  "currentPrice": 200
}
```

---

# Transaction APIs

Open:

```text
apps/api/rest/transactions.http
```

Operations:

* Create BUY transaction
* Create SELL transaction
* Retrieve transaction history
* Update transaction
* Delete transaction

Example:

```json
{
  "investmentId": "<investment-id>",
  "type": "BUY",
  "quantity": 10,
  "price": 150,
  "transactionDate": "2026-06-16T00:00:00.000Z"
}
```

---

# Portfolio APIs

Open:

```text
apps/api/rest/portfolio.http
```

Endpoint:

```http
GET /api/portfolio/summary
```

Returns:

* Total invested amount
* Current portfolio value
* Gain/Loss amount
* Gain/Loss percentage
* Asset allocation breakdown

---

# Running Automated Tests

## Backend Tests

```bash
docker compose -f docker-compose.dev.yml exec api pnpm test
```

---

## Frontend Tests

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

# Demo Credentials

```text
Email: admin@test.com
Password: password123
```

These credentials are automatically seeded during development and are disabled in production.
