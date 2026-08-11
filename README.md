# AgriPrali ERP

A warehouse/procurement management system for agricultural commodities
(maize, PRALLI crop residue, seeds, fertiliser) built around a strict
three-tier role hierarchy: **Super Admin → Warehouse Admin → Supervisor**.
Full-stack: a React dashboard talking to an Express + MongoDB API it
doesn't share with anyone else.

This file is the project-level map. For backend-specific detail (data
model, every endpoint, security hardening), see **[backend/README.md](backend/README.md)**.

---

## 1. The business workflow this system enforces

Every warehouse ("procurement hub") needs exactly one person accountable
for it and exactly one person running its floor. The app makes that
structural, not just a convention:

```
                     ┌───────────────┐
                     │  Super Admin  │  provisioned out-of-band (npm run seed /
                     │               │  create-super-admin) - never self-registered
                     └───────┬───────┘
                             │ creates warehouses, assigns staff,
                             │ approves signups, sees everything everywhere
                             ▼
                  ┌─────────────────────┐
                  │   Warehouse Admin    │  self-registers → pending → Super Admin
                  │  (one per warehouse) │  approves → assignable to a warehouse
                  └──────────┬───────────┘
                             │ monitors their warehouse: reviews the
                             │ Supervisor's stock entries, reads the
                             │ audit log, watches the employee roster
                             ▼
                  ┌─────────────────────┐
                  │     Supervisor       │  self-registers the same way as an Admin
                  │  (one per warehouse) │
                  └──────────┬───────────┘
                             │ runs the floor day to day
                             ▼
        ┌─────────────────────────────────────────┐
        │  Weight machine stock (inward/outward)   │
        │  Employee roster (staff/field workers)   │
        └───────────────────────────────────────────┘
```

**Step by step, this is how a warehouse actually gets stood up and run:**

1. A Warehouse Admin and a Supervisor each self-register
   (`POST /auth/register`) and sit in `pending` status - they cannot log in
   yet.
2. The Super Admin approves them (`PATCH /profiles/:id/approve`). Now
   they're `active`, but not yet attached to anything.
3. The Super Admin creates a warehouse (`POST /warehouses`), picking one
   *available* (active, unassigned) Warehouse Admin and one available
   Supervisor from dropdowns that only ever show eligible candidates.
   The warehouse now has exactly one of each - enforced by a unique index
   on both `admin` and `supervisor`, not just app-level convention.
4. The Supervisor logs in and maintains their warehouse: logs weight
   machine stock entries (inward/outward, with gross/tare/net weight and
   moisture %) and manages the employee roster (staff, field workers -
   these are records the Supervisor adds, not separate logins).
5. The Warehouse Admin logs in and reviews - approves or rejects each
   stock entry the Supervisor logged, and reads the audit trail for their
   warehouse. This is the "Admin monitors Supervisor" loop.
6. The Super Admin can see all of it: every warehouse, every profile,
   every audit log entry, across the whole system - the "Super Admin
   monitors everyone" loop.

Every mutation (warehouse created, stock entry logged, employee added,
profile approved, ...) is written to an append-only audit log
(`AuditLog` / `GET /audit-logs`) with who did it and from which warehouse -
that's the mechanism the monitoring loops above actually run on.

## 2. Authentication & session lifecycle

- **Register**: Warehouse Admin or Supervisor only (Super Admin is
  provisioned separately, see §5) - starts `pending`.
- **Login**: email or phone + password → JWT access token. Client-side
  validation is Zod (mirroring the backend's own Zod schemas) before the
  request is even sent; every validation issue and every API error shows
  up as a toast, not a silent failure.
- **Protected routes**: the whole dashboard is gated behind a valid
  session (`ProtectedRoute`); two pages (Create Warehouse, Warehouse Admin
  Management) are further gated to Super Admin only, mirroring what the
  backend would reject anyway.
- **Session restore**: on every app load, the stored token is confirmed
  against `GET /auth/me` before anything renders - a stale/expired token
  never produces a flash of the dashboard before bouncing to `/login`.
- **Logout**: revokes that specific token server-side (`RevokedToken` +
  the token's `jti`) - it stops working on its very next use, not just
  once it naturally expires.
- **Forgot password**: real OTP flow, not a placeholder. A 6-digit code is
  emailed *and* texted to every contact channel on the account (whichever
  it has), expires in 10 minutes, and is capped at 5 attempts. Resetting
  the password bumps the account's `tokenVersion`, which invalidates
  *every* session that account had open anywhere - not just the device
  doing the reset.

## 3. Modules

| Module | Who touches it | What it does |
|---|---|---|
| **Warehouses** | Super Admin creates/edits; everyone sees their own | Central entity - name, code, commodity, address, exactly one admin + one supervisor. List view shows live staff count and approved stock totals (aggregated from the two modules below). |
| **Employees** | Supervisor manages; Admin/Super Admin read | Staff/field-worker roster per warehouse. Not logins - managed records. |
| **Weight machines** | Admin provisions; Supervisor maintains | Physical scale assets per warehouse - calibration dates, status. |
| **Stock entries** | Supervisor logs; Admin/Super Admin reviews | Inward/outward weighment against a machine - gross/tare/net weight, moisture %. Starts `pending`, reviewed to `approved`/`rejected`. |
| **Profiles** | Super Admin only | Org-wide people directory - approve signups, activate/deactivate accounts, see who's assigned where. |
| **Audit log** | Admin (own warehouse) / Super Admin (all) | Read-only trail of every mutation above. |

## 4. What's real vs. what's still scaffold

The proposal this app was scaffolded from lists 11 modules. **Warehouses,
Employees, Weight Machines, Stock Entries, Profiles, Audit Log, and Auth**
(everything in §2 and §3) are fully wired: real MongoDB collections, real
Express endpoints, real RBAC, real frontend calls - no mock data left in
that path.

**Attendance, Weighment slips (the legacy UI, distinct from Stock Entries),
Inventory, Purchase, Sales, Reports, Alerts, and Settings** are still
frontend-only scaffolding against `mockData.js` files, exactly as the
original proposal shipped them - there's no backend for these yet. Each
page's sibling `api.js` is where that gets wired up next, following the
same pattern as `src/features/warehouses/`.

## 5. Tech stack

| | |
|---|---|
| **Frontend** | React 18 + Vite, Redux Toolkit, React Router 6, Axios, **PrimeReact** (UI components) + PrimeIcons, **Zod** (validation) |
| **Backend** | Node/Express, **MongoDB** via Mongoose, JWT auth (bcrypt password hashing), Zod validation |
| **Security** | express-rate-limit, express-mongo-sanitize, helmet, scoped CORS, server-side token revocation, OTP-based password reset |
| **Delivery (optional)** | Nodemailer (SMTP, any provider) for reset-code emails, Twilio REST API (no SDK) for reset-code SMS - both fall back to logging to the console in dev if unconfigured |

## 6. Project structure

```
Project/
├── src/                    # frontend (this directory's package.json)
│   ├── pages/               # route screens
│   ├── components/common/   # shared UI, now on PrimeReact internally
│   ├── features/<name>/     # api.js + Redux slice/hook per domain
│   ├── validators/          # Zod schemas (mirrors backend/src/validators)
│   ├── routes/               # ProtectedRoute, route table
│   ├── utils/                # toast.js (global notifications), validate.js
│   └── services/apiClient.js # axios instance - auth header, error→toast, 401 handling
└── backend/                 # API (its own package.json) - see backend/README.md
    ├── src/
    │   ├── models/            # Mongoose schemas
    │   ├── services/          # business logic + all DB queries
    │   ├── controllers/, routes/, validators/, middleware/
    │   └── utils/              # jwt, mailer, sms, otp, mask
    └── scripts/                # createSuperAdmin.js, seedDefaultUsers.js
```

## 7. Getting started

**Backend first** (the frontend needs it running to do anything beyond
render the login screen) - full detail in
**[backend/README.md](backend/README.md)**, short version:

```bash
cd backend
cp .env.example .env        # fill in MONGODB_URI + a real JWT_SECRET
npm install
npm run seed                 # creates one login per role, see table below
npm run dev                  # http://localhost:4000
```

**Frontend:**

```bash
npm install
cp .env.example .env         # VITE_API_BASE_URL, defaults to the backend above
npm run dev                   # http://localhost:5173
```

### Default logins (dev/demo only)

Created by `npm run seed` in the backend, and match the "Quick Demo Login
Roles" buttons on the Login page exactly:

| Role | Identifier | Password |
|---|---|---|
| Super Admin | `superadmin@pralli.com` | `Password@123` |
| Warehouse Admin | `admin@pralli.com` | `Password@123` |
| Supervisor | `supervisor@pralli.com` | `Password@123` |

Never seed these against a real database - see backend/README.md's
security section for why.

## 8. Where to look next

- **Backend architecture, data model, every endpoint, RBAC rules, security
  hardening**: [backend/README.md](backend/README.md).
- **Adding a new page's real backend**: pick one of the still-mock modules
  in §4, and copy the pattern already used by `src/features/warehouses/`
  (`api.js` swaps mock calls for `apiClient` calls; the page and hook don't
  change).
