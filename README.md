# Astra Trading — Super Admin Mission Control (Python FastAPI + Next.js)

A high-performance **Super Admin Mission Control Terminal** built with **FastAPI (Python)**, **SQLite (SQLModel)**, and **Next.js 16 (React 19 + Tailwind CSS)** for managing multi-broker account integrations, live order routing safety locks, and automated independent WhatsApp & Telegram trade alerts.

---

## 🚀 Key Features Built From `input.md`

### 1. 🔐 Super Admin Terminal & Secure Authentication
- **Secure Authentication**: Bcrypt-hashed password authentication with signed JWT bearer tokens.
- **Pre-Configured Super Admin**:
  - **Username / Email**: `admin` or `admin@astratrading.com`
  - **Password**: `Admin@123456`
- **Zero-Exposure Credential Security**: All broker API keys, access secrets, and TOTP seeds are encrypted symmetrically via Fernet before database storage and **never** exposed in plaintext over the API or UI.

### 2. 👤 User & Broker Setup
- Streamlined 3-step setup modal:
  1. **User Profile**: Full name, international phone number, internal notes.
  2. **Broker Integration**: Select from supported Indian discount & institutional brokers (**Zerodha Kite**, **Angel One**, **Upstox**, **Dhan HQ**, **Fyers**, **Alice Blue**, **Kotak Neo**, **Shoonya**).
  3. **Real-Time Handshake Verification**: Interactive "Test & Verify Connection" button tests latency and returns live authentication state.
  4. **Connection Status Indicators**:
     - `Connected` (Green pulse)
     - `Requires Reauthorization` (Amber warning with 1-click re-auth action)
     - `Disconnected` (Gray/Red status)
  5. **Trading & Alerts Setup**: Configure Live Order Placement (strictly defaults to `OFF`) and WhatsApp / Telegram alerts.

### 3. ⚡ Live Order Placement Safety Engine
- Clear **ON / OFF Toggle** for every registered user.
- **Default State**: Newly added users default to **OFF** until explicitly activated.
- **Safety Interlock**:
  - `OFF`: Live order placement is completely halted. Incoming signals are rejected with audit log alerts.
  - `ON`: Orders permitted only if the user access is active and broker is connected.
  - **Auto-Lock on Revocation**: If a user's access is revoked, live order routing is instantly severed.

### 4. 📢 Independent WhatsApp & Telegram Alerts
- Independent toggles for **WhatsApp** and **Telegram** notifications.
- **Test Alert Dispatcher**: Send instant simulated test alerts to verify notification channels without placing trades.
- Users receive alerts only and have **zero** access to the Super Admin Terminal.

### 5. 🏛️ Elite Multi-Tab Sidebar & efferd-dashboard-2 Grid Design
- **Mission Control (Overview)**: 4 dense KPI cards, Live Order Volume chart with custom SVG gradient bars, Alert Distribution line chart with SVG glow filter, Gateway Cryptography Health, and Real-Time Activity feed.
- **User & Brokers**: Complete tabular account gateway with instant inline switches, phone copy buttons, and action menu.
- **Order Testbench**: Interactive routing sandbox with symbol picker, BUY/SELL side toggles, quantity, and safety interlock verification.
- **Audit Telemetry**: Real-time event stream filterable by action, user, and IP origin.
- **Gateway Health**: Fernet AES-256 vault status, supported broker endpoint diagnostics, and token freshness.
- **Terminal Settings**: Dual display mode support (**Royal Obsidian Dark Mode** & **Imperial Platinum Light Mode**) with instant live toggle and persistence.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.12, FastAPI 0.143, SQLModel, Pydantic v2, Uvicorn, Cryptography (Fernet), PyJWT, Bcrypt, HTTPX.
- **Frontend**: Next.js 16.4 (App Router), React 19, TypeScript, Tailwind CSS, Recharts, Lucide React icons.
- **Database**: SQLite (`astra_trading.db`) with automatic table creation and initial seed data.

---

## ⚡ Quick Start

### 1. Start FastAPI Backend (Port 8000)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation: `http://localhost:8000/docs`

### 2. Start Next.js Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
Terminal interface: `http://localhost:3000`
Standalone Reference Demo: `http://localhost:3000/demo`
