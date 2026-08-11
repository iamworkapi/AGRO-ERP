# AgriPrali ERP - Backend

Express API in front of MongoDB (via Mongoose). The frontend never talks to
the database directly - every request goes through this service, which is
the single place role-based access control (Super Admin > Warehouse Admin >
Supervisor) and audit logging are enforced.

## Folder structure

```
backend/
├── server.js                 # entrypoint - connects to Mongo, then listens
├── scripts/
│   ├── createSuperAdmin.js   # one-off bootstrap for the first Super Admin
│   └── seedDefaultUsers.js   # dev/demo: one ready-to-use login per role
└── src/
    ├── app.js                # express app: middleware + route mounting
    ├── config/                # env validation, Mongo connection
    ├── constants/             # role names
    ├── models/                 # Mongoose schemas - the data layer
    ├── routes/                # URL -> controller wiring, one file per resource
    ├── controllers/           # HTTP layer: parse req, call service, send res
    ├── services/               # business logic + all Mongoose queries live here
    ├── validators/             # zod schemas used by the validate() middleware
    ├── middleware/             # authenticate, authorize, validate, error handling
    └── utils/                  # ApiError, ApiResponse, asyncHandler, jwt
```

Each resource (warehouses, employees, weight-machines, stock-entries,
profiles, audit-logs) follows the same route -> controller -> service ->
model pattern, so once you're oriented in one module the rest read the same
way.

## Data model

| Collection | Purpose |
|---|---|
| `User` | One document per login. `role` is one of `super_admin` / `warehouse_admin` / `supervisor`. Passwords are hashed with bcrypt; never returned in API responses. |
| `Warehouse` | The central entity. `admin` / `supervisor` are UNIQUE (sparse) refs into `User` - a warehouse always has exactly one of each, and a person can run at most one warehouse at a time. Role/status of the assigned user is validated in `warehouse.service.js` before every create/update. |
| `WeightMachine` | Physical scales installed at a warehouse. |
| `StockEntry` | Inward/outward weighment records against a machine - this is the "weight machine stock" a Supervisor maintains. `netWeightKg` is computed in a pre-save hook (`gross - tare`). Starts `pending`, an Admin/Super Admin reviews to `approved`/`rejected`. |
| `Employee` | Staff roster per warehouse, managed by the Supervisor. |
| `AuditLog` | Append-only trail written by the service layer on every mutation - what lets an Admin monitor their Supervisor, and the Super Admin monitor everyone. |
| `Counter` | Backs atomic warehouse code generation (`WH-0001`, ...) via `$inc`, since Mongo has no native sequence. |
| `RevokedToken` | One row per logged-out JWT (`jti` + expiry). Checked on every request in `authenticate.js` so logout actually invalidates the token instead of just being a client-side illusion. A TTL index auto-deletes rows once the token would have expired anyway. |
| `PasswordResetOtp` | One active reset code per user (hashed, like a password). TTL index expires it after 10 minutes; also capped at 5 incorrect attempts. See "Password reset" below. |

Nothing stores "which warehouse is this person in" redundantly - it's always
derived from `Warehouse.admin` / `Warehouse.supervisor`, so that link can't
drift out of sync (see `warehouseScope.service.js`).

## Setup

1. Create a MongoDB database (Atlas or local) and grab its connection string.
2. `cp .env.example .env` and fill in `MONGODB_URI` and a random `JWT_SECRET`
   (32+ characters - `openssl rand -hex 32` works well; the server refuses to
   start with a short or placeholder secret).
   **Never commit `.env` or paste real credentials into chat/issues** -
   `.env` is already gitignored.
3. `npm install`
4. `npm run create-super-admin` - bootstraps the first Super Admin account
   from `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` in `.env` (the only way
   to create one - `/auth/register` intentionally can't grant that role).
   Or `npm run seed` to create one login for **all three roles** at once
   (Super Admin, Warehouse Admin, Supervisor) - see "Default logins" below.
5. `npm run dev` - starts on `http://localhost:4000` (matches
   `VITE_API_BASE_URL=http://localhost:4000/api/v1` in the frontend's
   `.env.example`).

### Default logins (dev/demo only)

`npm run seed` creates one active, ready-to-use account per role so the app
is testable without a manual register-then-approve cycle. These match the
"Quick Demo Login Roles" buttons on the frontend's Login page exactly.
Defaults (override via the `.env` vars in `.env.example`):

| Role | Identifier | Password |
|---|---|---|
| Super Admin | `superadmin@pralli.com` | `Password@123` |
| Warehouse Admin | `admin@pralli.com` | `Password@123` |
| Supervisor | `supervisor@pralli.com` | `Password@123` |

These are well-known passwords by design (they're meant to be typed into a
demo). **Never run `npm run seed` against a production database**, and
rotate or delete these accounts before any real deployment.

## Role-based access, in one place

- **Super Admin**: full access to every warehouse, every profile. Only
  Super Admin can create/edit/deactivate warehouses and approve new
  Warehouse Admin / Supervisor signups.
- **Warehouse Admin**: read-only scope to their own warehouse's employees,
  weight machines, stock entries, and audit log. Reviews (approves/rejects)
  the Supervisor's stock entries - this is the "admin monitors supervisor"
  loop.
- **Supervisor**: full manage rights (create/update) on employees, weight
  machines, and stock entries, but only within their own warehouse.

Every route enforces this in two layers: `authorize(...roles)` (coarse role
gate, in the route file) and `assertCanAccessWarehouse` (fine-grained "is
this *your* warehouse" check, in the service layer).

## Auth

Custom email/phone + password auth (bcrypt hash, JWT access token) - there's
no Supabase Auth to lean on anymore, so this backend owns the full flow.
`POST /auth/logout` records the token's `jti` in `RevokedToken`, so it stops
working on the very next request rather than just being forgotten
client-side. Registration passwords must be 8+ characters with at least one
letter and one number (`validators/auth.validator.js`).

### Password reset (OTP, email + SMS)

1. `POST /auth/forgot-password { identifier }` - looks up the account by
   email or phone, generates a 6-digit code (`crypto.randomInt`, not
   `Math.random`), hashes it into `PasswordResetOtp`, and sends it to
   **every contact channel the account has on file** (email via
   `utils/mailer.js`, SMS via `utils/sms.js`) - not just whichever one was
   typed in, so losing access to one channel doesn't lock the user out. The
   response is intentionally identical whether or not the account exists,
   to avoid leaking which emails/phones are registered.
2. `POST /auth/reset-password { identifier, otp, newPassword }` - verifies
   the code (5 attempts max, then it's invalidated and a new one must be
   requested; 10-minute expiry either way), sets the new password, and
   **bumps `User.tokenVersion`** - every JWT issued before the reset embeds
   the old `tokenVersion`, so `authenticate.js` rejects them all on their
   next use. One password reset = every existing session everywhere logged
   out, not just the current device.

Without `SMTP_*` / `TWILIO_*` configured in `.env`, both senders fall back to
logging the code to the server console instead of failing - the whole flow
stays testable without any external account. See `.env.example` for what to
set when you do want real delivery.

## Session invalidation

Two independent mechanisms, for two different situations:
- **`RevokedToken`** (single-token logout): `POST /auth/logout` revokes
  *the one token it was called with*.
- **`User.tokenVersion`** (invalidate-everywhere): bumped on password reset.
  Every token embeds the `tokenVersion` it was issued under; a mismatch on
  any request means "this session predates a password reset" and is
  rejected, regardless of that individual token's own `jti`/expiry.

## Security hardening

- **Rate limiting** (`express-rate-limit`): 300 req/15min per IP across the
  whole API, a tighter 20 req/15min on `/auth/login` + `/auth/register` +
  `/auth/reset-password`, and an even tighter 5 req/hour on
  `/auth/forgot-password` specifically - it triggers a real email/SMS send,
  so it's both costlier to abuse and a more attractive target for spam.
- **NoSQL injection** (`express-mongo-sanitize`): strips any request key
  starting with `$` or containing `.` before it reaches a query - defense in
  depth on top of zod already rejecting non-string shapes on typed fields
  (e.g. a login `identifier` of `{"$gt": ""}` fails validation either way).
- **JWT secret strength**: `env.js` refuses to boot with a `JWT_SECRET`
  under 32 characters or the `.env.example` placeholder.
- **helmet** + scoped **CORS** (`CORS_ORIGIN`) were already in place from the
  initial build.

## API surface

All routes are prefixed `/api/v1` and (except `/auth/login`,
`/auth/register`) require `Authorization: Bearer <access_token>`.

| Method & path | Who | Purpose |
|---|---|---|
| POST `/auth/login` | anyone | Email/phone + password -> access token |
| POST `/auth/register` | anyone | Self-signup as Warehouse Admin or Supervisor, starts `pending` |
| GET `/auth/me` | any authenticated | Current profile + assigned warehouse id |
| POST `/auth/logout` | any authenticated | Revokes this token server-side (`RevokedToken`) |
| POST `/auth/forgot-password` | anyone | Emails/texts a 6-digit reset code to every channel on file |
| POST `/auth/reset-password` | anyone | Verifies the code, sets a new password, logs out every existing session |
| GET `/profiles` | Super Admin | People directory with warehouse assignment |
| PATCH `/profiles/:id/approve` | Super Admin | Flip a pending signup to active |
| PATCH `/profiles/:id/status` | Super Admin | Activate/deactivate an account |
| GET `/warehouses` | any (scoped) | List warehouses visible to you |
| GET `/warehouses/available-admins` \| `/available-supervisors` | Super Admin | Unassigned, active candidates for the Create Warehouse form |
| POST `/warehouses` | Super Admin | Create a warehouse (requires `adminId` + `supervisorId`) |
| PATCH `/warehouses/:id` | Super Admin | Edit / reassign staff |
| DELETE `/warehouses/:id` | Super Admin | Soft-deactivate, frees up its admin/supervisor |
| GET/POST `/employees`, PATCH/DELETE `/employees/:id` | Supervisor manages, Admin/Super Admin read | Warehouse staff roster |
| GET/POST `/weight-machines`, PATCH `/weight-machines/:id` | Admin provisions, Supervisor maintains | Scale assets |
| GET/POST `/stock-entries`, PATCH `/stock-entries/:id/review` | Supervisor logs, Admin/Super Admin reviews | Weighment stock records |
| GET `/audit-logs` | Warehouse Admin (own warehouse) / Super Admin (all) | Monitoring trail |

## Connecting the frontend

The frontend's `src/services/apiClient.js` already points at
`VITE_API_BASE_URL` and attaches `Authorization: Bearer <token>` from
`localStorage`. Each `src/features/*/api.js` module swaps its mock-data
calls for `apiClient` calls one file at a time - no page or hook needs to
change (see the frontend README's "Connecting the real backend" section).
