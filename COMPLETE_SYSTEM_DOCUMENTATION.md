# Srini Trading — Super Admin Mission Control Terminal
## Complete System Architecture, Infrastructure & Operational Master Knowledge Base

> **Document Type:** Comprehensive System Documentation & Technical Specification  
> **Target Audience:** Developers, DevOps Engineers, System Architects, and AI Assistants (Gemini, ChatGPT, Claude)  
> **Source Specification:** `input.md`  
> **Version:** 1.0.0 (Production-Ready Technical Reference)  
> **Primary Technology Stack:** Python 3.12 (FastAPI, SQLModel, Pydantic v2), Next.js 16.4 (React 19, TypeScript, Tailwind CSS), SQLite, Fernet Cryptography, JWT (HS256)

---

## 1. Executive Summary & System Overview

### 1.1 Purpose & Problem Statement
**Srini Trading** is a high-performance algorithmic trading operations terminal designed specifically for a **Super Admin** to centrally control user accounts, broker credentials, order placement authorization, and real-time notification dispatch.

Algorithmic trading systems interacting with multi-client accounts face critical financial and compliance risks:
1. **Unintended Order Routing:** Erroneous or automated trading signals sent to a client broker without explicit administrative consent.
2. **Credential Vulnerability:** Plaintext leakage of API keys, access secrets, session tokens, and TOTP seeds.
3. **Broker Desynchronization:** Daily session expiries causing order rejections during market hours.
4. **Client Over-reach:** Clients improperly accessing internal algorithmic switches or terminal administrative controls.

### 1.2 Core Architectural Principles
- **Strict Role Isolation:** Only the authenticated Super Admin has access to the terminal UI and administrative endpoints. End users never access the terminal; they only receive external WhatsApp and Telegram alerts.
- **Fail-Safe Live Order Interlock:** Live order placement defaults to `OFF` (`False`) for every user upon creation and requires explicit multi-factor preconditions (`User Active` + `Broker Connected`) before it can ever be enabled.
- **Zero-Exposure Credential Storage:** Sensitive broker credentials are encrypted symmetrically with AES-CBC/HMAC via Fernet cryptography before persistent storage and are **never** returned across the API or rendered in the DOM.
- **Audited State Transitions:** Every administrative toggle, authentication event, access revocation, and simulated order execution is immutably logged to an SQLite audit ledger.

---

## 2. High-Level System Architecture & Flow Diagrams

### 2.1 Layered Architecture Overview

```
                      +---------------------------------------+
                      |       Super Admin Web Browser        |
                      |   (Next.js 16.4 / React 19 Client)    |
                      +---------------------------------------+
                                          |
                              HTTP / REST JSON (JWT Auth)
                                          v
                      +---------------------------------------+
                      |         FastAPI ASGI Gateway          |
                      |          (Uvicorn on :8000)           |
                      +---------------------------------------+
                                          |
         +--------------------------------+--------------------------------+
         |                                |                                |
         v                                v                                v
+------------------+             +------------------+             +------------------+
| Security Engine  |             |  Database Layer  |             | Safety Validator |
| - Bcrypt Hashing |             | - SQLModel ORM   |             | - 3-Tier Check   |
| - JWT (HS256)    |             | - SQLite DB      |             | - Revoke Cutoff  |
| - Fernet Crypt   |             | - Audit Logs     |             | - Live Orders    |
+------------------+             +------------------+             +------------------+
         |                                                                 |
         v                                                                 v
+------------------+                                              +------------------+
| External Brokers |                                              |  Alert Gateways  |
| Zerodha, Angel,  |                                              | WhatsApp Webhook |
| Upstox, Dhan, etc|                                              | Telegram Bot API |
+------------------+                                              +------------------+
```

### 2.2 Live Order Safety Interlock Flowchart

```
[ Incoming Trade Signal / Order Execution Request ]
                          │
                          ▼
            [ 1. Is User Account Active? ]
                   ├── No  ──> REJECT: "BLOCKED_REVOKED_ACCESS" (Logged to Audit)
                   └── Yes
                          │
                          ▼
            [ 2. Is Live Orders Toggled ON? ]
                   ├── No  ──> REJECT: "BLOCKED_LIVE_ORDERS_OFF" (Safety Lock Engaged)
                   └── Yes
                          │
                          ▼
            [ 3. Is Broker Status 'Connected'? ]
                   ├── No  ──> REJECT: "BLOCKED_BROKER_STATUS" (Requires Reauthorization)
                   └── Yes
                          │
                          ▼
     [ PASS ALL GATES: Route Order to Broker Gateway ]
                          │
                          ▼
     [ Record Execution in Audit Ledger with Order ID ]
```

---

## 3. Repository Structure & Directory Map

```
Srini Trading - V1/
│
├── backend/                               # Python FastAPI Backend Service
│   ├── app/
│   │   ├── __init__.py                    # Python package initializer
│   │   ├── database.py                    # SQLite engine, session generator, init_db()
│   │   ├── models.py                      # SQLModel database schemas (SuperAdmin, User, AuditLog)
│   │   ├── schemas.py                     # Pydantic v2 validation models & request/response DTOs
│   │   ├── security.py                    # Bcrypt, JWT auth, Fernet symmetric encryption
│   │   └── routers/
│   │       ├── auth.py                    # Super Admin login, /me endpoint, token issuing
│   │       ├── brokers.py                 # Supported brokers catalog, handshake verification
│   │       ├── dashboard.py               # KPI counters, analytics, audit log streaming
│   │       ├── orders.py                  # Live order placement simulation & safety gating
│   │       └── users.py                   # Full user CRUD, live order toggles, alert switches
│   ├── venv/                              # Python 3.12 Virtual Environment
│   ├── main.py                            # FastAPI ASGI entrypoint, CORS setup, lifespan hook
│   ├── requirements.txt                   # Locked Python package dependencies
│   └── srini_trading.db                   # SQLite primary application database file
│
├── frontend/                              # Next.js 16 App Router Client
│   ├── public/                            # Static SVG assets & icons
│   ├── src/
│   │   ├── app/
│   │   │   ├── favicon.ico                # App icon
│   │   │   ├── globals.css                # Global Tailwind CSS definitions & tokens
│   │   │   ├── layout.tsx                 # Root layout with fonts & metadata
│   │   │   └── page.tsx                   # Main Mission Control dashboard view
│   │   ├── components/
│   │   │   ├── ui/                        # Reusable atomic UI components (Button, Badge, etc.)
│   │   │   ├── AddUserModal.tsx           # 3-step modal for user onboarding & broker sync
│   │   │   ├── EditUserModal.tsx          # User credential & profile updating modal
│   │   │   ├── AuditLogDrawer.tsx         # Slide-out real-time audit event timeline
│   │   │   ├── GatewayHealthCard.tsx      # System ping & broker health telemetry card
│   │   │   ├── LoginView.tsx              # Secure Super Admin login with 1-click autofill
│   │   │   ├── Navbar.tsx                 # Top navigation with status indicator & profile
│   │   │   ├── OrderSimulationModal.tsx   # Interactive trade execution test modal
│   │   │   ├── OrderVolumeChart.tsx       # Recharts visualizer for trading executions
│   │   │   ├── AlertDistributionChart.tsx # Notification distribution metrics
│   │   │   ├── StatsCards.tsx             # 4 primary KPI summary cards (Users, Orders, Brokers, Alerts)
│   │   │   ├── TerminalActivityCard.tsx   # Live stream of administrative actions
│   │   │   └── UserManagementTable.tsx    # Interactive user directory with instant toggle controls
│   │   ├── lib/
│   │   │   ├── api.ts                     # Type-safe API client with fetch wrapper & auth injection
│   │   │   └── utils.ts                   # Tailwind merge & utility formatting helpers
│   │   └── types/
│   │       └── index.ts                   # Shared TypeScript interfaces & enums
│   ├── package.json                       # Node dependencies & build scripts
│   ├── tsconfig.json                      # TypeScript strict compiler configuration
│   └── next.config.ts                     # Next.js bundler settings
│
├── test_api.py                            # Automated Python end-to-end integration test suite
├── input.md                               # Original feature specification requirement log
├── README.md                              # Quickstart documentation
└── COMPLETE_SYSTEM_DOCUMENTATION.md       # Master AI-referable system reference manual (this file)
```

---

## 4. Data Models & Database Specifications

The persistence layer uses **SQLModel**, combining SQLAlchemy ORM with Pydantic data validation.

### 4.1 Schema Definitions

#### Table: `super_admins`
Stores credentials for the administrative user authorized to access the terminal.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-inc | Unique Admin Identifier |
| `username` | `VARCHAR` | Unique, Indexed, Non-null | Login handle (e.g., `admin`) |
| `email` | `VARCHAR` | Unique, Indexed, Non-null | Admin contact email |
| `hashed_password` | `VARCHAR` | Non-null | Bcrypt salted hash (Cost factor 12) |
| `full_name` | `VARCHAR` | Default: "Super Admin" | Display name |
| `created_at` | `DATETIME` | Non-null, UTC | Timestamp of account provisioning |

#### Table: `users`
Represents registered trading clients whose broker accounts and execution permissions are managed.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-inc | `None` | Client ID |
| `name` | `VARCHAR` | Indexed, Non-null | Required | Full Name |
| `phone_number` | `VARCHAR` | Indexed, Non-null | Required | International phone (E.164 format) |
| `broker_name` | `VARCHAR` | Non-null | `"Zerodha Kite"` | Display name of the integrated broker |
| `broker_code` | `VARCHAR` | Non-null | `"zerodha"` | Machine identifier for broker API gateway |
| `broker_client_id` | `VARCHAR` | Non-null | `""` | Broker user ID (e.g. `ZR8921`) |
| `broker_status` | `VARCHAR` | Non-null | `"Disconnected"` | Enum: `Connected`, `Disconnected`, `Requires Reauthorization` |
| `broker_last_sync` | `DATETIME` | Nullable | `None` | UTC timestamp of last verified handshake |
| `broker_auth_message` | `TEXT` | Nullable | Default string | Diagnostic connection message |
| `encrypted_broker_credentials`| `TEXT` | Nullable | `None` | AES-Fernet encrypted JSON string of API keys/tokens |
| `is_active` | `BOOLEAN`| Non-null | `True` | Account access status (`True` = Active, `False` = Revoked) |
| `live_orders_enabled` | `BOOLEAN`| Non-null | `False` | **CRITICAL:** Defaults to `False` for strict safety |
| `whatsapp_alerts_enabled` | `BOOLEAN`| Non-null | `False` | WhatsApp alert dispatch permission |
| `telegram_alerts_enabled` | `BOOLEAN`| Non-null | `False` | Telegram alert dispatch permission |
| `telegram_chat_id` | `VARCHAR` | Nullable | `None` | Telegram Chat ID or `@handle` |
| `notes` | `TEXT` | Nullable | `None` | Internal admin notes / strategy tags |
| `created_at` | `DATETIME` | Non-null, UTC | `utcnow()` | Record creation timestamp |
| `updated_at` | `DATETIME` | Non-null, UTC | `utcnow()` | Last record modification timestamp |

#### Table: `audit_logs`
Immutable chronological ledger of all administrative interventions and order attempts.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-inc | Audit record ID |
| `timestamp` | `DATETIME` | Non-null, Indexed, UTC | Timestamp of occurrence |
| `action` | `VARCHAR` | Non-null, Indexed | Event code (e.g. `LIVE_ORDERS_TOGGLED`, `ORDER_BLOCKED_REVOKED_ACCESS`) |
| `user_id` | `INTEGER` | Nullable, Indexed | Affected user ID |
| `user_name` | `VARCHAR` | Nullable | Snapshot of user name at event time |
| `details` | `TEXT` | Non-null | Human-readable explanation and metadata |
| `severity` | `VARCHAR` | Non-null | Severity classification: `info`, `success`, `warning`, `danger` |

### 4.2 Seed Data & Initial State
On first startup via `init_db()`, the database automatically seeds:
1. **Super Admin Account:**
   - Username: `admin`
   - Email: `admin@srinitrading.com`
   - Password: `Admin@123456`
2. **5 Test Users** covering every operational edge case:
   - **Rajesh Sharma:** Zerodha Kite, Connected, Live Orders `ON`, WhatsApp `ON`, Telegram `ON`.
   - **Pooja Patel:** Angel One, Connected, Live Orders `OFF` (Default), WhatsApp `ON`, Telegram `OFF`.
   - **Vikram Verma:** Upstox, `Requires Reauthorization` (Token expired at 06:00 AM), Live Orders `OFF`.
   - **Ananya Sen:** Dhan HQ, `Disconnected`, Access `Revoked` (`is_active = False`), Live Orders `OFF`.
   - **Karthik Iyer:** Fyers API v3, Connected, Live Orders `OFF`, WhatsApp `ON`, Telegram `ON`.

---

## 5. Security & Cryptographic Architecture

### 5.1 Symmetric Credential Encryption (Fernet AES-CBC)
All sensitive broker authentication artifacts (API keys, API secrets, JWT access tokens, TOTP seeds) are encrypted prior to database persistence:
- **Derivation Algorithm:** 
  $$\text{Key} = \text{URLSafeBase64}(\text{SHA-256}(\text{SECRET\_KEY}))$$
- **Cipher Suite:** Fernet provides symmetric encryption using AES-128 in CBC mode with PKCS7 padding and HMAC-SHA256 authentication.
- **Zero-Exposure Policy:** The API serializer converts encrypted credentials to a boolean `has_broker_credentials: bool`. Raw secrets are never sent over the wire.

```python
# Implementation Reference in backend/app/security.py
_raw_key = hashlib.sha256(SECRET_KEY.encode()).digest()
FERNET_KEY = base64.urlsafe_b64encode(_raw_key)
cipher_suite = Fernet(FERNET_KEY)

def encrypt_broker_credentials(creds: dict) -> str:
    raw_json = json.dumps(creds).encode("utf-8")
    return cipher_suite.encrypt(raw_json).decode("utf-8")
```

### 5.2 Super Admin Authentication & JWT Bearer Protocol
- **Password Storage:** Hashed using `bcrypt` with automatic random salt generation.
- **Session Tokens:** Signed JSON Web Tokens (`jwt`) using `HS256`.
- **Token Validity:** Configured for 24 hours (`1440 minutes`).
- **Authorization Header:** Clients pass `Authorization: Bearer <access_token>` in all authenticated HTTP requests.

---

## 6. Complete REST API Specifications

Base URL: `http://localhost:8000` (or reverse proxy URL)

### 6.1 Authentication Endpoints (`/api/auth`)

#### `POST /api/auth/login`
Authenticates the Super Admin and issues a signed JWT token.
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "Admin@123456"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@srinitrading.com",
      "full_name": "Srini Trading Super Admin"
    }
  }
  ```
- **Errors:** `401 Unauthorized` for invalid credentials.

#### `GET /api/auth/me`
Retrieves current authenticated Super Admin profile from JWT.
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:** `SuperAdminOut` object.

---

### 6.2 User Management Endpoints (`/api/users`)

#### `GET /api/users`
Lists all registered users with optional filtering.
- **Query Parameters:**
  - `search` (string): Filters across name, phone number, client ID, or broker name.
  - `status` (string): Filter by broker status (`Connected`, `Disconnected`, `Requires Reauthorization`).
  - `is_active` (boolean): Filter active or revoked accounts.
  - `live_orders` (boolean): Filter users with live orders enabled/disabled.
- **Response `200 OK`:** Array of `UserOut` objects.

#### `POST /api/users`
Onboards a new client, integrates broker credentials, and initializes safety toggles.
- **Request Body (`UserCreate`):**
  ```json
  {
    "name": "Arjun Mehta",
    "phone_number": "+91 98111 22334",
    "broker_code": "dhan",
    "broker_client_id": "DHAN1042",
    "broker_auth_token": "dhan_token_991823",
    "live_orders_enabled": false,
    "whatsapp_alerts_enabled": true,
    "telegram_alerts_enabled": true,
    "telegram_chat_id": "@arjun_m",
    "notes": "Intraday momentum options client"
  }
  ```
- **Response `201 Created`:** `UserOut` object. Live orders strictly initialized to `false` if not provided.

#### `PUT /api/users/{user_id}`
Updates user details or modifies encrypted credentials.
- **Response `200 OK`:** Updated `UserOut` object.

#### `DELETE /api/users/{user_id}`
Permanently purges a client account and encrypted credentials from the database.
- **Response `204 No Content`:** Adds `USER_DELETED` entry to Audit Log.

---

### 6.3 Operational Safety Toggles & Controls

#### `POST /api/users/{user_id}/toggle-live-orders`
The primary safety valve controlling algorithmic order execution.
- **Request Body:** `{"live_orders_enabled": true}` (or `false`)
- **Preconditions for Activation (`true`):**
  1. User access must be **Active** (`is_active == True`). Returns `400 Bad Request` if revoked.
  2. Broker status must be **Connected** (`broker_status == "Connected"`). Returns `400 Bad Request` if disconnected or requiring reauthorization.
- **Response `200 OK`:** Updated `UserOut` object with audited state change.

#### `POST /api/users/{user_id}/toggle-access`
Revokes or restores client access to the system.
- **Request Body:** `{"is_active": false}` (or `true`)
- **Safety Rule:** If access is revoked (`is_active = false`), the system **automatically terminates Live Order Placement** (`live_orders_enabled = false`).

#### `POST /api/users/{user_id}/toggle-whatsapp`
Independently flips WhatsApp notification dispatch for the user.
- **Response `200 OK`:** Updated `UserOut` object.

#### `POST /api/users/{user_id}/toggle-telegram`
Independently flips Telegram notification dispatch for the user.
- **Response `200 OK`:** Updated `UserOut` object.

#### `POST /api/users/{user_id}/reauthorize-broker`
Simulates daily broker token refresh, switching status back to `Connected`.

#### `POST /api/users/{user_id}/test-alert`
Dispatches a test notification signal without placing an order.
- **Request Body:**
  ```json
  {
    "channel": "whatsapp",
    "custom_message": "Test alert message from Super Admin Terminal"
  }
  ```
- **Response `200 OK`:** Dispatch confirmation details and audit entry.

---

### 6.4 Broker Integration Endpoints (`/api/brokers`)

#### `GET /api/brokers`
Returns the catalog of supported Indian brokers and required credential specifications.
- **Brokers Supported:**
  1. `zerodha`: Zerodha Kite Connect (API Key, API Secret, Request Token)
  2. `angelone`: Angel One SmartAPI (API Key, Client Code, MPIN, TOTP)
  3. `upstox`: Upstox API v2 (API Key, Secret, Redirect Auth Code)
  4. `dhan`: Dhan HQ (Client ID, Access Token)
  5. `fyers`: Fyers API v3 (App ID, Secret Key, Auth Code)
  6. `aliceblue`: Alice Blue ANT API (User ID, API Key)
  7. `kotak`: Kotak Neo Trade API (Consumer Key, Consumer Secret, Mobile, Password)
  8. `shoonya`: Finvasia Shoonya (User ID, Password, Two-Factor TOTP, Vendor Key)

#### `POST /api/brokers/verify`
Tests broker API credentials in real time, measures connection latency, and returns connection status.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "status": "Connected",
    "message": "Broker authentication handshake successful. Latency: 42ms.",
    "latency_ms": 42,
    "broker_user_profile": {"client_id": "ZR8921", "account_type": "EQUITY_DERIVATIVES"}
  }
  ```

---

### 6.5 Order Execution & Safety Simulator (`/api/orders`)

#### `POST /api/orders/simulate`
Simulates trade execution through client broker connections while strictly enforcing all safety locks.
- **Request Body:**
  ```json
  {
    "user_id": 2,
    "symbol": "BANKNIFTY 52000 CE",
    "quantity": 15,
    "side": "BUY",
    "order_type": "MARKET",
    "price": 320.0
  }
  ```
- **Response (If Blocked):**
  ```json
  {
    "allowed": false,
    "status": "BLOCKED_LIVE_ORDERS_OFF",
    "reason": "Live order placement is switched OFF for Pooja Patel. Safety lock prevents execution.",
    "user_id": 2,
    "user_name": "Pooja Patel",
    "execution_time": "2026-10-09T15:44:56.123Z",
    "details": {"symbol": "BANKNIFTY 52000 CE", "quantity": 15, "side": "BUY"}
  }
  ```
- **Response (If Allowed):**
  ```json
  {
    "allowed": true,
    "status": "EXECUTED",
    "reason": "Order successfully routed to Angel One for Pooja Patel.",
    "user_id": 2,
    "user_name": "Pooja Patel",
    "execution_time": "2026-10-09T15:45:01.456Z",
    "details": {
      "order_id": "ORD-892104",
      "symbol": "BANKNIFTY 52000 CE",
      "quantity": 15,
      "price": 320.0,
      "broker": "Angel One",
      "client_id": "ANG9041"
    }
  }
  ```

---

### 6.6 Dashboard & Audit Endpoints (`/api/dashboard`)

#### `GET /api/dashboard/stats`
Returns aggregated operational metrics for the top KPI summary cards:
```json
{
  "total_users": 5,
  "active_users": 4,
  "revoked_users": 1,
  "live_orders_active": 1,
  "broker_connected": 3,
  "broker_reauth": 1,
  "broker_disconnected": 1,
  "whatsapp_alerts_active": 3,
  "telegram_alerts_active": 3
}
```

#### `GET /api/dashboard/audit-logs?limit=50`
Streams chronological audit events sorted latest first.

#### `GET /api/health`
Unauthenticated health probe returning service status (`online`).

---

## 7. Frontend User Interface Specifications

The frontend is built using **Next.js 16.4 (App Router)** and **Tailwind CSS v4** with a mission-control command deck aesthetic.

### 7.1 Key Component Architecture
1. **`Navbar` (`src/components/Navbar.tsx`):**
   - Live system operational status indicator (`Operational (42ms)`).
   - Super Admin profile pill with role badge.
   - Quick "Audit Log" toggle drawer trigger.
   - Secure Logout action (clears `srini_admin_token` and redirects to login).
2. **`StatsCards` (`src/components/StatsCards.tsx`):**
   - 4 responsive cards showing:
     - **Registered Users:** Total count + Active vs Revoked ratio.
     - **Live Order Placement:** Count of users with live trading currently enabled.
     - **Broker Integrations:** Connected vs Disconnected / Reauth ratio with colored status indicators.
     - **Active Feeds:** Total users subscribed to WhatsApp or Telegram notifications.
3. **`UserManagementTable` (`src/components/UserManagementTable.tsx`):**
   - Real-time search across names, phone numbers, brokers, and IDs.
   - Filter dropdowns for Broker Status, Live Orders state, and Access state.
   - Interactive table columns:
     - User Identity (Name & international phone number).
     - Broker Badge & Health indicator (`Connected` [Green], `Reauth Required` [Amber], `Disconnected` [Gray]).
     - Live Order Placement Switch (Red/Green switch button with instant backend synchronization).
     - WhatsApp & Telegram Alert toggles.
     - Access Status Pill (`Active` vs `Revoked`).
     - Actions Menu (`⋮`): Edit User, Reauthorize Broker, Send Test Alert, Simulate Order, Delete Account.
4. **`AddUserModal` (`src/components/AddUserModal.tsx`):**
   - Guided multi-step onboarding wizard:
     - Step 1: User Profile (Name, Phone number, internal notes).
     - Step 2: Broker Selection (Dropdown with 8 supported brokers + dynamic credential inputs).
     - Step 3: Real-Time Handshake Verification (Interactive button runs latency check and returns live connection result).
     - Step 4: Safety & Alerts Configuration (Live Orders strictly defaults to OFF).
5. **`OrderSimulationModal` (`src/components/OrderSimulationModal.tsx`):**
   - Selects user, trading symbol (e.g. `NIFTY 24500 CE`), side (`BUY`/`SELL`), quantity, and price.
   - Submits to `/api/orders/simulate` and displays instant visual validation:
     - Green execution badge if all 3 safety rules pass.
     - Red warning with exact safety denial reason if blocked.
6. **`AuditLogDrawer` (`src/components/AuditLogDrawer.tsx`):**
   - Slide-out drawer displaying real-time system activities with timestamps, severity badges, and user links.
7. **`LoginView` (`src/components/LoginView.tsx`):**
   - Secure username/password form.
   - Features 1-click **"Autofill Super Admin Demo Credentials"** button for testing.

---

## 8. Infrastructure, Deployment & DevOps Guide

### 8.1 Local Development Environment

#### Backend Setup
```powershell
# Navigate to backend directory
cd "backend"

# Activate Python virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start Uvicorn ASGI Server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs: `http://localhost:8000/docs`
- Health Probe: `http://localhost:8000/api/health`

#### Frontend Setup
```powershell
# Navigate to frontend directory
cd "frontend"

# Install Node dependencies
npm install

# Start Next.js Development Server
npm run dev
```
- Web Application: `http://localhost:3000`

---

### 8.2 Production Linux Deployment (Ubuntu / Debian VPS)

#### System Architecture on VPS
- **Reverse Proxy:** Nginx handling SSL termination (`certbot` / Let's Encrypt) and routing:
  - `/api/*` and `/docs` -> FastAPI Uvicorn upstream on `127.0.0.1:8000`
  - `/*` -> Next.js Node process on `127.0.0.1:3000`
- **Process Manager:** Systemd managing `srini-backend.service` and `srini-frontend.service`.

#### 1. Systemd Service for FastAPI (`/etc/systemd/system/srini-backend.service`)
```ini
[Unit]
Description=Srini Trading FastAPI Backend Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/srini-trading/backend
ExecStart=/var/www/srini-trading/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always
Environment="SECRET_KEY=production-super-secret-key-replace-me"
Environment="DATABASE_URL=sqlite:////var/www/srini-trading/backend/srini_trading.db"

[Install]
WantedBy=multi-user.target
```

#### 2. Systemd Service for Next.js (`/etc/systemd/system/srini-frontend.service`)
```ini
[Unit]
Description=Srini Trading Next.js Frontend Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/srini-trading/frontend
ExecStart=/usr/bin/npm run start -- -p 3000
Restart=always
Environment="NODE_ENV=production"
Environment="NEXT_PUBLIC_API_URL=https://terminal.yourdomain.com"

[Install]
WantedBy=multi-user.target
```

#### 3. Nginx Reverse Proxy Configuration (`/etc/nginx/sites-available/srini-trading`)
```nginx
server {
    server_name terminal.yourdomain.com;

    # Frontend Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend FastAPI Gateway
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Swagger Documentation
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host $host;
    }
    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
        proxy_set_header Host $host;
    }

    listen 443 ssl;
    # SSL certificates managed by Certbot
}
```

---

### 8.3 Containerized Deployment (Docker Compose)

Create `compose.yaml` in project root:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: srini_backend
    restart: always
    environment:
      - SECRET_KEY=super-strong-jwt-and-fernet-key-2026
      - DATABASE_URL=sqlite:///./srini_trading.db
    ports:
      - "8000:8000"
    volumes:
      - db_data:/app

  frontend:
    build: ./frontend
    container_name: srini_frontend
    restart: always
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  db_data:
```

---

## 9. Automated Testing & Verification Suite

The repository includes a comprehensive automated test suite in `test_api.py`.

### 9.1 Verification Test Cases
1. **Health Check Validation:** Confirms backend is running and returns `{"status": "online"}`.
2. **Super Admin Authentication:** Performs login with `admin` / `Admin@123456`, asserts JWT token retrieval.
3. **KPI Metrics Verification:** Queries `/api/dashboard/stats` and verifies counters.
4. **User Retrieval & State Check:** Fetches user list and validates broker connection statuses.
5. **Safety Gate Enforcement (Blocked Order):** Attempts an order simulation for a user whose `live_orders_enabled == False`. Asserts that the system blocks the order with `BLOCKED_LIVE_ORDERS_OFF`.
6. **Safety Gate Enforcement (Permitted Order):** Toggles `live_orders_enabled` to `True`. Submits order simulation again. Asserts `status == "EXECUTED"` with an assigned `order_id`. Resets toggle to `False`.
7. **Notification Alert Verification:** Tests dispatch to WhatsApp channel without trade execution.
8. **New User Onboarding Flow:** Creates a new client with broker credentials; asserts that `live_orders_enabled` defaults to `False`.
9. **Access Revocation Cutoff:** Revokes access for a user; verifies that order simulations are rejected with `BLOCKED_REVOKED_ACCESS`.
10. **Audit Log Inspection:** Validates that all above operations generated structured entries in the Audit Log feed.

### 9.2 Running the Test Suite
```powershell
backend\venv\Scripts\python.exe test_api.py
```
Expected output:
```
[OK] Health Check: {'status': 'online', ...}
[OK] Super Admin Authenticated: Srini Trading Super Admin (@admin)
[OK] Dashboard KPIs: Total Users=5, Live Orders ON=1, Connected Brokers=3
[OK] Order Safety Rule: Allowed=False, Status=BLOCKED_LIVE_ORDERS_OFF
[OK] Toggled Live Order Placement to ON for Pooja Patel.
[OK] Live Order Dispatched: Allowed=True, Status=EXECUTED, Order ID=ORD-XXXXXX
[OK] Reset Live Order Placement back to OFF.
[OK] Confirmed revoked access blocks orders: Account access is REVOKED.
ALL VERIFICATION TESTS PASSED SUCCESSFULLY! 100% SPEC COMPLIANCE CONFIRMED.
```

---

## 10. Frequently Asked Questions & AI Context Guidance

This section provides definitive answers to questions frequently asked by developers, engineers, and AI models:

### Q1: Why are broker credentials never returned when calling `GET /api/users`?
**A:** This is a core security requirement. Storing plaintext credentials in the browser state creates significant credential leakage vectors. Broker credentials are stored symmetrically encrypted (Fernet AES) on the server, and the API returns only `has_broker_credentials: true/false`.

### Q2: What happens if a client's access is revoked while their Live Order Placement is toggled ON?
**A:** The system enforces an automatic cascade lock in `toggle_user_access()` (`backend/app/routers/users.py`). When `is_active` is set to `False`, the system immediately sets `live_orders_enabled = False` and logs a warning in the Audit Log. Any subsequent order signal is rejected with `BLOCKED_REVOKED_ACCESS`.

### Q3: Can the Super Admin enable Live Orders for a user whose broker is disconnected?
**A:** No. `toggle_live_orders()` explicitly validates that `user.broker_status == "Connected"` and `user.is_active == True`. Attempting to enable live orders for a disconnected or re-auth required broker raises an HTTP `400 Bad Request`.

### Q4: How does the system handle broker daily session expiration (e.g. Zerodha 06:00 AM IST reset)?
**A:** Indian brokers invalidate access tokens daily between 05:30 AM and 06:30 AM IST. The user's status transitions to `Requires Reauthorization`. In this state, live orders are strictly blocked. The Super Admin clicks the **Reauthorize** action in the terminal, which triggers the broker's daily handshake flow, resets the status to `Connected`, and permits resumption of live trading.

### Q5: How can a developer migrate from SQLite to PostgreSQL in production?
**A:** Because the system uses **SQLModel** (built on SQLAlchemy), migrating to PostgreSQL requires:
1. Installing the async/sync PostgreSQL driver: `pip install psycopg2-binary`.
2. Setting the environment variable: `DATABASE_URL=postgresql://user:password@localhost:5432/srini_trading`.
3. The table structures and constraints will automatically initialize via `SQLModel.metadata.create_all(engine)`.

### Q6: Can end users log in to this terminal?
**A:** No. There is no client login screen. The terminal is exclusively a **Super Admin Mission Control Terminal**. End users interact with the system purely as recipients of automated WhatsApp and Telegram trade and position alerts.

---
