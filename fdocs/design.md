# Enterprise Design Specification & API Schemas - RS Industries B2B Platform

## 1. Design System & Visual Identity Specs

### 1.1 Enterprise Palette Tokens
- **Background Core:** `bg-slate-950` (Primary Dark Shell), `bg-slate-50` (Main Application Background)
- **Container Surfaces:** `bg-white` (Cards, Modals, Forms), `bg-slate-900` (Dark Accent Cards)
- **Brand Colors:** `bg-blue-600` (Primary Action Blue), `bg-blue-700` (Active States)
- **Status Colors:**
  - Success/Approved: `bg-emerald-600` / `text-emerald-600` / `bg-emerald-50`
  - Warning/Pending: `bg-amber-500` / `text-amber-600` / `bg-amber-50`
  - Danger/Rejected: `bg-rose-600` / `text-rose-600` / `bg-rose-50`
- **Text Hierarchy:**
  - Primary Text: `text-slate-900`
  - Subtitle Text: `text-slate-500`
  - Muted Text: `text-slate-400`

---

## 2. High-Scale Enterprise Database Schemas & Indexes

### 2.1 Shopkeeper Collection (`shopkeepers`)
```json
{
  "_id": "sk_101",
  "name": "Rajesh Kumar",
  "mobile": "9876543210",
  "shopName": "Rajesh Super Store",
  "gstNumber": "27AAACR12341ZV",
  "addresses": [
    {
      "_id": "addr_1",
      "tag": "Main Shop",
      "addressLine": "Shop 4, Market Complex",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "isDefault": true
    }
  ],
  "creditLimit": 50000,
  "outstandingBalance": 12500,
  "status": "ACTIVE",
  "role": "PARTNER",
  "createdAt": "2026-01-10T10:00:00Z"
}
```
**Database Indexes:**
- `{ mobile: 1 }` (Unique)
- `{ status: 1, role: 1 }`

---

### 2.2 Product Catalog Collection (`products`)
```json
{
  "_id": "prod_201",
  "title": "RS Heavy Duty PVC Cable 2.5mm",
  "category": "Cables & Wires",
  "sku": "RS-PVC-2.5MM",
  "description": "High conductivity copper PVC insulated cable for industrial use.",
  "price": 1200,
  "unit": "Bundle (100m)",
  "stock": 150,
  "image": "https://cdn.rs-industries.com/products/pvc-cable-2.5.jpg",
  "tieredPricing": [
    { "minQty": 1, "maxQty": 9, "price": 1200, "discountPercent": 0 },
    { "minQty": 10, "maxQty": 49, "price": 1100, "discountPercent": 8.33 },
    { "minQty": 50, "maxQty": 999, "price": 1000, "discountPercent": 16.67 }
  ],
  "isFeatured": true,
  "status": "ACTIVE"
}
```
**Database Indexes:**
- `{ category: 1, status: 1 }`
- `{ sku: 1 }` (Unique)
- `{ title: "text", description: "text" }` (Text Search Index)

---

### 2.3 Order Collection (`orders`)
```json
{
  "_id": "ord_901",
  "orderNumber": "RS-ORD-2026-0891",
  "shopkeeperId": "sk_101",
  "items": [
    {
      "productId": "prod_201",
      "title": "RS Heavy Duty PVC Cable 2.5mm",
      "quantity": 10,
      "unitPrice": 1100,
      "totalPrice": 11000
    }
  ],
  "totalAmount": 11000,
  "discountAmount": 1000,
  "finalAmount": 11000,
  "paymentMethod": "LEDGER",
  "paymentStatus": "POSTED_TO_LEDGER",
  "orderStatus": "DISPATCHED",
  "shippingAddress": {
    "addressLine": "Shop 4, Market Complex",
    "city": "Mumbai",
    "pincode": "400001"
  },
  "createdAt": "2026-09-18T14:30:00Z"
}
```
**Database Indexes:**
- `{ orderNumber: 1 }` (Unique)
- `{ shopkeeperId: 1, createdAt: -1 }`
- `{ orderStatus: 1 }`

---

### 2.4 Ledger Collection (`ledgers`)
```json
{
  "_id": "led_501",
  "shopkeeperId": "sk_101",
  "transactionType": "DEBIT",
  "amount": 11000,
  "runningBalance": 12500,
  "referenceType": "ORDER",
  "referenceId": "ord_901",
  "description": "Debit for Order #RS-ORD-2026-0891",
  "postedBy": "SYSTEM",
  "timestamp": "2026-09-18T14:30:00Z"
}
```
**Database Indexes:**
- `{ shopkeeperId: 1, timestamp: -1 }`
- `{ referenceId: 1 }`

---

## 3. High-Throughput REST API Endpoint Catalog

| Module | Method | Endpoint | Cache Strategy | Description |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/send-otp` | Rate Limited (5/min) | Request Mobile OTP |
| **Auth** | `POST` | `/api/auth/verify-otp` | Rate Limited (5/min) | Verify OTP & Generate JWT Pair |
| **Shopkeeper** | `GET` | `/api/shopkeepers/profile` | Auth Private | Fetch shopkeeper profile & balance |
| **Shopkeeper** | `PUT` | `/api/shopkeepers/profile` | Invalidate Profile Cache | Update profile / address list |
| **Products** | `GET` | `/api/products` | Redis Cache (30m) | Query product catalog with search/filters |
| **Products** | `GET` | `/api/products/:id` | Redis Cache (30m) | Detailed product view with price tiers |
| **Products** | `POST` | `/api/products` | Admin Auth / Invalidate | Admin: Create SKU entry |
| **Categories** | `GET` | `/api/categories` | Redis Cache (24h) | Retrieve category taxonomy |
| **Banners** | `GET` | `/api/banners` | Redis Cache (1h) | Promo banner list |
| **Cart** | `POST` | `/api/cart/sync` | Stateless Sync | Validate client cart against server stock |
| **Order** | `POST` | `/api/orders` | Transactional | Checkout cart & commit double-entry ledger |
| **Order** | `GET` | `/api/orders` | Auth Private Index | Fetch order history |
| **Order** | `PATCH`| `/api/orders/:id/status` | Admin Auth / Queue | Update order fulfillment status |
| **Ledger** | `GET` | `/api/ledgers/my-ledger` | Auth Private Index | Real-time financial statement |
| **Ticket** | `GET` | `/api/tickets` | Auth Private | Support tickets list |
| **Ticket** | `POST` | `/api/tickets` | Auth Private | Raise support ticket |
