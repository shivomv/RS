# Enterprise System Memory & Architectural Decision Log - RS Industries B2B Platform

## 1. System Context & Project History
- **Origins:** Converted 100% of legacy Flutter app screens and widgets to modular React Native with NativeWind (Tailwind CSS engine).
- **Architecture:** Monorepo architecture containing:
  - Mobile UI (`UI/`)
  - Admin Portal (`ADMIN_APP/`)
  - Express API Backend Server (`backend/`)
  - Governance & Specifications (`fdocs/`)

---

## 2. Architectural Decision Records (ADRs)

### ADR-01: Decoupled 4-Tier Backend Layering
- **Decision:** All 15 domain modules (`backend/src/modules/*`) strictly enforce Router -> Controller -> Service -> Repository separation.
- **Rationale:** Facilitates unit testing, enforces clean code principles, and enables future extraction into microservices if volume demands.

### ADR-02: NativeWind UI System & Zero Inline Styles
- **Decision:** 100% component styling implemented via Tailwind CSS classes via NativeWind.
- **Rationale:** Ensures design consistency across mobile and tablet form factors, reduces bundle overhead, and accelerates visual iteration.

### ADR-03: Double-Entry Ledger Transactional Consistency
- **Decision:** Orders checked out using `LEDGER` account credit execute within ACID transaction boundaries that update shopkeeper `outstandingBalance` and emit an immutable `Ledger` transaction log.
- **Rationale:** Prevents balance drift, race conditions, and phantom credit usage.

---

## 3. Active Execution Pointer & State Log
- **Documentation Phase:** Complete. All 6 files in `fdocs/` updated with enterprise scalable system design specifications.
- **Next Phase:** Implementation and verification of Backend, Mobile Client, and Admin Portal as defined in Phase 2-5 of `fdocs/taks.md`.
