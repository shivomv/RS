# Enterprise System Architecture & Infrastructure - RS Industries B2B Platform

## 1. High-Scale Enterprise System Topology

The **RS Industries B2B Platform** uses a modern, multi-tier decoupled monorepo architecture engineered for high concurrency, fault tolerance, and linear horizontal scalability.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|                                                                                   |
|  +-----------------------------------+     +-----------------------------------+  |
|  |     Shopkeeper Mobile App (`UI/`)  |     |   Admin Portal (`ADMIN_APP/`)     |  |
|  | React Native + NativeWind + Zustand|     |  React Native + NativeWind + API  |  |
|  +-----------------+-----------------+     +-----------------+-----------------+  |
+--------------------|-----------------------------------------|--------------------+
                     |                                         |
                     | HTTPS / TLS 1.3 / REST API / WSS        |
                     v                                         v
+-----------------------------------------------------------------------------------+
|                             API GATEWAY & SECURITY LAYER                          |
|                                                                                   |
|    - Reverse Proxy / Load Balancer (Nginx / Cloudflare)                           |
|    - Rate Limiting (Token Bucket / Sliding Window)                                |
|    - JWT Authentication Gate & Request Sanitization                              |
|    - Request Correlation ID Injector (`X-Correlation-ID`)                          |
+-------------------------------------+---------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------------+
|                        APPLICATION LAYER (`backend/src/*`)                        |
|                                                                                   |
|  +-----------------------+ +-----------------------+ +-------------------------+  |
|  | Auth & User Subsystem | | Order & Cart Service  | | Financial Ledger Engine |  |
|  +-----------------------+ +-----------------------+ +-------------------------+  |
|  | Product & Catalog Engine| | Inventory & SKU Sub  | | Support & Ticket Engine |  |
|  +-----------------------+ +-----------------------+ +-------------------------+  |
|                                                                                   |
|  Layered Core Architecture per Domain Module:                                     |
|  [ Router ] ----> [ Controller ] ----> [ Service ] ----> [ Repository / Data Access ]|
+-------------------------------------+---------------------------------------------+
                                      |
         +----------------------------+----------------------------+
         |                                                         |
         v                                                         v
+-----------------------------------+     +-----------------------------------+
|          DATA LAYER               |     |       CACHE & MESSAGE QUEUE       |
|                                   |     |                                   |
| Primary Database (MongoDB / PG)   |     | Redis In-Memory Cache (Catalog/Sess)|
| - B-Tree Indexes & Sharding       |     | Event Queue (BullMQ / Async Tasks)|
| - ACID Financial Transactions     |     | - Audit Trails & Push Alerts      |
+-----------------------------------+     +-----------------------------------+
```

---

## 2. Layered Software Design Pattern

### 2.1 Backend Layered Domain Pattern (`backend/src/modules/<domain>/`)
To prevent monolithic coupling and enable future microservices extraction, every backend module implements strict 4-tier layer decoupling:

1. **Routing Layer (`<domain>.routes.js`):**
   - Express router definition, middleware injection (Auth, RBAC, Rate Limiter, Request Validator).
2. **Controller Layer (`<domain>.controller.js`):**
   - Handles HTTP payload extraction, status code mappings, and standardized JSON output formatting via uniform response wrappers. Zero business logic.
3. **Service Layer (`<domain>.service.js`):**
   - Pure domain business logic, state machines, financial balance rules, bulk tier price computations, and event dispatching.
4. **Repository / Data Layer (`<domain>.repository.js` or `<domain>.model.js`):**
   - Data access abstraction. Interacts directly with database models or persistent storage, providing isolated CRUD query interfaces.

---

## 3. High-Scale Data Architecture & Indexing Strategy

### 3.1 Primary Data Schemas & Read/Write Optimization
- **Read-Heavy Collections (Catalog, Categories, Banners):**
  - Cached in Redis with TTL strategy (1 hour, invalidated on Admin catalog update).
  - Compound indexes on `{ category: 1, status: 1, price: 1 }` and text indexes on `{ title: "text", description: "text" }`.
- **Transactional Write-Heavy Collections (Orders, Ledgers, Audits):**
  - ACID Compliant transaction boundaries for order placement and double-entry ledger debiting.
  - Indexes on `{ shopkeeperId: 1, createdAt: -1 }` and `{ orderNumber: 1 }` for sub-10ms lookup latency.

---

## 4. Front-End Scalability Architecture (`UI/` & `ADMIN_APP/`)

### 4.1 State Management Slices (Zustand Modular Slices)
```
UI/src/store/
├── useAuthStore.js      # Identity, Token Lifecycle, User Context
├── useProductStore.js   # Catalog Cache, Category Filters, Search Term State
├── useCartStore.js      # Cart Items, Dynamic Tier Discounts, Item Totals
├── useOrderStore.js     # Active Orders, Order History, Status Tracking
├── useLedgerStore.js    # Credit Line, Outstanding Balance, Transaction Statements
└── index.js             # Consolidated Store Aggregator
```

### 4.2 Network & Performance Resilience Rules
- **API Service Abstraction (`UI/src/services/api.js`):**
  - Centralized Axios client configured with automatic request retries (exponential backoff for 5xx errors).
  - JWT Access Token automatic refreshing on 401 response via refresh token queue.
- **UI Performance Optimization:**
  - `FlatList` component optimization using `getItemLayout`, `initialNumToRender={8}`, `maxToRenderPerBatch={10}`, and `windowSize={5}`.
  - Image optimization with progressive loading and caching placeholders.

---

## 5. Security & Infrastructure Reliability Blueprint
- **Rate Limiting:** Global rate limiting (100 req/min per IP) and Auth rate limiting (5 login attempts/min).
- **Graceful Error Handling:** Centralized Express Error Middleware capturing standard operational errors without leaking internal stack traces in production.
- **Correlation ID Tracking:** Every incoming request receives a UUID `X-Correlation-ID` header, propagated through logging middleware for end-to-end trace auditing.
