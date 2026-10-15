

# FactoryFlow 

REST API to organize production in an industrial workshop: products and their composition, raw material inventory, and manufacturing orders from planning to completion.

Built with **Node.js, Express and MongoDB (Mongoose)**, secured with **JWT** and role-based access (Admin and Operator), and fully containerized with **Docker Compose**.

---

## Table of contents

1. [Context](#1-context)
2. [How the API answers the project question](#2-how-the-api-answers-the-project-question)
3. [Tech stack](#3-tech-stack)
4. [Class diagram](#4-class-diagram)
5. [Architecture](#5-architecture)
6. [Getting started](#6-getting-started)
7. [Environment variables](#7-environment-variables)
8. [Roles and permissions](#8-roles-and-permissions)
9. [API endpoints](#9-api-endpoints)
10. [Business rules](#10-business-rules)
11. [Error handling](#11-error-handling)
12. [Tests](#12-tests)
13. [Demonstration flow](#13-demonstration-flow)

---

## 1. Context

An industrial company in Safi manufactures products from several raw materials. Product, stock and production-order information was scattered across files: an order could be issued without enough material, consumption was not always recorded, and the manager had no view of production progress.

FactoryFlow centralizes this tracking. Each product has a **composition** (the materials and quantities needed for one unit). Before an order starts, the API **calculates the requirements, checks the stock and records the consumption**.

## 2. How the API answers the project question

> *How to design an API that organizes production, protects actions according to user role, and guarantees reliable inventory?*

- **Organizes production.** An order follows a strict workflow: `PLANNED → IN_PROGRESS → COMPLETED`, and only a `PLANNED` order can be canceled. Admins plan and assign orders; operators start and complete them. Every order keeps its creation, start and end dates and the users involved.
- **Protects actions by role.** Every route (except installation and login) requires a valid JWT. The role (`ADMIN` or `OPERATOR`) is checked on the server for each route: an operator cannot create materials, and an admin cannot start an order.
- **Guarantees reliable inventory.**
  - Stock can only change through **stock entries** and **order starts**, never by editing a material directly.
  - Starting an order is a **single MongoDB transaction**: the status change, the stock deduction and the stock movements are saved together, or nothing is saved.
  - If any material is missing, the start is refused and **no quantity is deducted**.
  - A second start of the same order is refused and **never deducts the stock twice**.
  - Every change of stock leaves a **movement** (`IN` or `OUT`) with its date and user.
  - An order keeps a **copy of the product composition** made at creation, so later product changes never alter existing orders.

## 3. Tech stack

| Area | Technology |
|---|---|
| Runtime / framework | Node.js, Express |
| Database | MongoDB (single-node replica set, required for transactions) with Mongoose |
| Authentication | JWT (`jsonwebtoken`), passwords hashed with `bcryptjs` |
| Tests | Jest (unit tests of the services, repositories mocked) |
| Containers | Docker and Docker Compose |

## 4. Class diagram

![FactoryFlow UML class diagram](<src/uml/Blank diagram (1).png>)



**Classes:** `User`, `Installation`, `Material`, `Product`, `CompositionLine`, `Order`, `OrderCompositionLine`, `StockMovement`.
**Enumerations:** `Role` (`ADMIN`, `OPERATOR`), `OrderStatus` (`PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELED`), `MovementType` (`IN`, `OUT`).

## 5. Architecture

The code is split in layers, each with one responsibility:

| Layer | Responsibility |
|---|---|
| **routes** | Define the URLs and attach the middlewares (authentication, role) |
| **controllers** | Handle the HTTP exchange only: read the request, call a service, send the response |
| **services** | Contain the business rules and the transactions |
| **repositories** | Group all the access to MongoDB |
| **models** | Mongoose schemas |
| **middlewares** | JWT authentication, role control, global error handling |

```
factoryflow-api/
├── src/
│   ├── config/db.js                 # MongoDB connection
│   ├── models/                      # Mongoose schemas
│   ├── repositories/                # database access
│   ├── services/                    # business rules
│   ├── controllers/                 # HTTP layer
│   ├── routes/                      # URLs
│   ├── middlewares/                 # auth, roles, error handler
│   ├── utils/                       # AppError, catchAsync
│   ├── app.js                       # Express app
│   └── server.js                    # entry point
├── tests/
│   ├── services/                    # Jest unit tests
│   └── helpers/fakeTransaction.js
├── docs/                            # class diagram
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── package.json
```

## 6. Getting started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- (optional, to run the tests locally) Node.js 20+

### Installation

```bash
# 1. Clone the repository and enter it
git clone <repository-url>
cd factoryflow-api

# 2. Create your environment file
cp .env.example .env
# then edit .env and set a long random JWT_SECRET

# 3. Start the API and MongoDB
docker compose up --build
```

Wait until the logs show:

```
MongoDB connected
Server running on port 3000
```

The first start takes 10 to 20 seconds, because MongoDB initializes its replica set.

### Check that it works

```
GET http://localhost:3000/api/health
```
```json
{ "api": "ok", "database": "connected" }
```

### Install the application (create the first admin)

```
GET  http://localhost:3000/api/installation/status      ->  { "installed": false }
POST http://localhost:3000/api/installation
```
```json
{
  "name": "First Admin",
  "email": "admin@factoryflow.com",
  "password": "admin123"
}
```

The installation can be done only once. Then log in with `POST /api/auth/login` to get a token.

### Docker details

- **Live code changes:** `./src` is mounted in the container and `nodemon` restarts the server on each change. No rebuild is needed after editing the code.
- **Persistent data:** the database is stored in the `mongo_data` volume, so data survives `docker compose down` and restarts. To erase it completely, run `docker compose down -v`.
- **Packages:** after changing `package.json`, rebuild with `docker compose up --build`.

## 7. Environment variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port of the API | `3000` |
| `MONGO_URI` | MongoDB connection string (the host is the Compose service name `mongo`) | `mongodb://mongo:27017/factoryflow?replicaSet=rs0` |
| `JWT_SECRET` | Secret used to sign the tokens (long and random) | `change_this_secret` |
| `JWT_EXPIRES_IN` | Token lifetime | `1d` |

The `.env` file is never committed. Only `.env.example` is in the repository.

## 8. Roles and permissions

Send the token in every protected request: `Authorization: Bearer <token>`.

| Area | Public | ADMIN | OPERATOR |
|---|:---:|:---:|:---:|
| Installation status and installation | Yes | | |
| Login | Yes | | |
| View my profile | | Yes | Yes |
| Create accounts (operators and admins) | | Yes | |
| Materials, stock entries, movements, alerts | | Yes | |
| Products and composition | | Yes | |
| Create, modify, cancel and list all orders | | Yes | |
| View my assigned orders, start, complete, history | | | Yes |

## 9. API endpoints

### Installation and authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | API and database status |
| GET | `/api/installation/status` | Public | Is the application installed? |
| POST | `/api/installation` | Public (once) | Create the first admin and initialize the app |
| POST | `/api/auth/login` | Public | Log in, returns a JWT |
| GET | `/api/users/me` | Authenticated | View my profile |
| POST | `/api/users` | Admin | Create an operator or an admin account |

### Raw materials and stock (Admin)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/materials` | Create a material (unique reference, unit, stock, reorder point) |
| GET | `/api/materials` | List materials |
| GET | `/api/materials/alerts` | Materials at or below their reorder point |
| GET | `/api/materials/:id` | View a material |
| PATCH | `/api/materials/:id` | Modify name, unit or reorder point |
| POST | `/api/materials/:id/entries` | Record a stock entry (quantity > 0) |
| GET | `/api/materials/:id/movements` | View the movements of a material |

### Products (Admin)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/products` | Create a product with its composition |
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | View a product with its composition |
| PATCH | `/api/products/:id` | Modify the name and/or the composition |

### Orders (Admin)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Create an order and assign it to an operator |
| GET | `/api/orders` | List orders. Filters: `status`, `product`, `from`, `to`. Pagination: `page`, `limit` |
| GET | `/api/orders/:id` | View an order |
| PATCH | `/api/orders/:id` | Modify quantity or operator (only if `PLANNED`) |
| PATCH | `/api/orders/:id/cancel` | Cancel an order (only if `PLANNED`) |

### Operator space (Operator)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/operator/orders` | My assigned orders (optional `?status=`) |
| GET | `/api/operator/orders/history` | My completed orders |
| GET | `/api/operator/orders/:id` | Details of one of my orders |
| POST | `/api/operator/orders/:id/start` | Start an order (checks the stock and deducts it) |
| POST | `/api/operator/orders/:id/complete` | Complete an order in progress |

## 10. Business rules

**Data**
- Product, material and email values are unique.
- A material has a unit, an available quantity and a reorder point. The initial stock and the reorder point can be `0`; composition, entry and order quantities must be strictly positive.
- A product uses at least one existing material, and a material appears only once in its composition.
- Creation and modification dates are kept on every record.

**Order workflow**

```
PLANNED ──start──> IN_PROGRESS ──complete──> COMPLETED
   │
   └──cancel──> CANCELED        (only a PLANNED order can be canceled)
```

**Starting an order**

The requirements are calculated by multiplying the unit composition by the quantity to manufacture.

> Example: a product needs 2 kg of material A and 3 units of material B. To manufacture 10 products, the API checks that 20 kg of A and 30 units of B are available before starting.

1. The order must be assigned to the operator and be `PLANNED`.
2. The stock of every material is checked. If one is insufficient, the start is refused with the list of missing materials and nothing is deducted.
3. In one transaction: the status becomes `IN_PROGRESS`, every material is deducted and an `OUT` movement is recorded for each one. If any step fails, nothing is saved.

## 11. Error handling

Every error uses the same JSON format:

```json
{ "status": 409, "error": "Email already used" }
```

| Code | Meaning | Examples |
|---|---|---|
| 400 | Invalid request | Missing field, bad email, quantity of 0, unknown status filter, invalid id |
| 401 | Not authenticated | Missing, invalid or expired token, wrong login |
| 403 | Not allowed | An operator calls an admin route |
| 404 | Not found | Unknown material, product, order or route |
| 409 | Conflict | Duplicate reference or email, second installation, invalid status change, insufficient stock |
| 500 | Server error | Unexpected error (details are only written to the server logs) |

## 12. Tests

Unit tests with **Jest** cover the business rules of the services. The repositories are mocked, so the tests need no database.

```bash
npm install
npm test
```

| Service | What is verified |
|---|---|
| Installation | First admin creation, second installation refused |
| Materials | Unique reference, stock entries and `IN` movements, quantity of 0 refused |
| Products | Composition rules (empty, repeated material, quantity of 0) |
| Operator | Start with stock check and deduction, missing stock refuses and deducts nothing, second start refused, completion rules |

Inside Docker: `docker compose exec api npm test`.

## 13. Demonstration flow

A complete scenario to try the API (Postman or any HTTP client):

1. `POST /api/installation` to create the first admin, then `POST /api/auth/login` to get its token.
2. `POST /api/users` to create an operator:
   ```json
   { "name": "Operator One", "email": "op@factoryflow.com", "password": "secret1", "role": "OPERATOR" }
   ```
3. `POST /api/materials` twice: `{ "reference": "MAT-001", "name": "Wood", "unit": "kg", "quantity": 25, "reorderPoint": 10 }` and `{ "reference": "MAT-002", "name": "Screws", "unit": "unit", "quantity": 25, "reorderPoint": 10 }`.
4. `POST /api/products` with a composition of 2 Wood and 3 Screws per unit.
5. `POST /api/orders` for 10 products assigned to the operator.
6. Log in as the operator and `POST /api/operator/orders/:id/start`. The start is **refused (409)**: 20 Wood are available but 30 Screws are needed and only 25 exist, and nothing is deducted.
7. As admin, `POST /api/materials/:id/entries` with `{ "quantity": 20 }` on Screws.
8. As operator, start the order again. It succeeds, the stock becomes 5 Wood and 15 Screws, and two `OUT` movements are recorded.
9. Start it a third time: refused (409), with no second deduction.
10. `POST /api/operator/orders/:id/complete`, then `GET /api/operator/orders/history`.

---

## Author

Salmane Karroum, Youcode, 2026.
