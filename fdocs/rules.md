# Enterprise Engineering Standards & Rules - RS Industries B2B Platform

## 1. Core Engineering Directives

### 1.1 Integrity & Architectural Rigor
- **Layering Isolation:** Controllers MUST NOT execute database queries directly; Database logic belongs in Repositories/Services.
- **Zero Symptom-Masking:** Never suppress errors with silent `try/catch` blocks, empty fallback objects, or disabled tests.
- **Traceability:** All backend logs must include the request `Correlation ID` for auditability.

---

## 2. Front-End Standards (`UI/` & `ADMIN_APP/`)

### 2.1 React Native & Component Rules
- Use Functional Components exclusively with explicit prop validation.
- All dynamic list renderings (`FlatList`) MUST specify a unique, stable `keyExtractor` (e.g., `item => item._id`).
- Destructure Zustand hooks using specific selectors to prevent unnecessary component re-renders:
  ```javascript
  // Recommended
  const products = useProductStore(state => state.products);
  const fetchProducts = useProductStore(state => state.fetchProducts);
  ```

### 2.2 Styling Standards (NativeWind / Tailwind CSS)
- **100% Utility Classes:** Custom inline `style={...}` objects are prohibited except for dynamic dynamic values (e.g. dynamic animation height).
- Clean class composition using layout utilities (`flex-1`, `flex-row`, `items-center`, `justify-between`, `gap-2`, `px-4`, `py-3`).
- Theme consistency using designated RS Industries tokens (`bg-slate-950`, `bg-blue-600`, `bg-slate-50`, `text-slate-900`, `bg-emerald-600`, `bg-rose-600`).

---

## 3. Backend Architecture & API Standards (`backend/`)

### 3.1 Unified API Response Contract
Every controller MUST return responses using the standard application response helpers:
```json
// Success Response (HTTP 200 / 201)
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  },
  "correlationId": "req-987213-abc"
}

// Error Response (HTTP 4xx / 5xx)
{
  "success": false,
  "error": "Insufficient stock for product prod_201",
  "code": "INSUFFICIENT_STOCK",
  "correlationId": "req-987213-abc"
}
```

### 3.2 Double-Entry Financial Safeguards
- **Atomic Operations:** Orders placed against `LEDGER` credit MUST execute within an atomic transaction.
- **Balance Validation:** Always re-validate shopkeeper available credit (`creditLimit - outstandingBalance`) on the backend server before creating debit entries.

---

## 4. Security & Quality Assurance Rules
- **Input Sanitization:** All incoming body, query, and path parameters MUST be validated before processing.
- **Security Headers:** Express server must configure Helmet, CORS origin restriction, and rate limiting headers.
- **Zero Hardcoded Secrets:** Environment secrets (`JWT_SECRET`, database URIs, API keys) must be loaded strictly from `.env` files.
