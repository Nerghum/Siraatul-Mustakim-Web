# Siraatul Mustaqim (সিরাতুল মুস্তাকীম)

A comprehensive, bilingual (Bengali/English) Islamic web and mobile platform featuring Masail, Q&A, Bayan, Books, Quran, Supplications (Dua), Malfuzat, Notice announcements, dynamic Advertisements, and a full-featured **Donation & Payment Gateway System (bKash & SSLCommerz)**.

---

## 📁 Repository Structure

```
siratul-mustakim/
├── backend/       # Express.js REST API with MongoDB & Mongoose
├── admin/         # Next.js Admin Panel with Tailwind CSS, Recharts & Base UI
├── frontend/      # Next.js Public Web Application
├── app/           # React Native / Expo Mobile Application
└── README.md      # Platform & Payment Gateway Documentation
```

---

## 💳 Payment Gateway & Donation Integration (bKash & SSLCommerz)

The platform includes a dynamic donation engine supporting **bKash Tokenized Checkout** and **SSLCommerz Hosted Checkout** (Visa, Mastercard, UnionPay, and Bangladeshi Mobile Financial Services).

### 1. Webhook, Callback, and Return URLs

Configure these URLs in your **SSLCommerz Merchant Panel** and **bKash Merchant Portal**:

#### **A. SSLCommerz Configuration**

| URL Type | Endpoint Path | Description |
| :--- | :--- | :--- |
| **IPN / Webhook URL** | `POST {BASE_URL}/api/payments/ssl/ipn` | Server-to-server instant payment notification handler (auto-validates payment). |
| **Success Callback URL** | `POST {BASE_URL}/api/payments/ssl/success` | SSLCommerz redirects the user's browser here upon successful payment. |
| **Fail Callback URL** | `POST {BASE_URL}/api/payments/ssl/fail` | SSLCommerz redirects here if the transaction fails. |
| **Cancel Callback URL** | `POST {BASE_URL}/api/payments/ssl/cancel` | SSLCommerz redirects here if the donor cancels the transaction. |
| **Frontend Confirmation / Receipt** | `GET {FRONTEND_BASE_URL}/payment/success?tran_id={TRAN_ID}` | Final donation confirmation receipt page with printable summary. |
| **Frontend Failure Page** | `GET {FRONTEND_BASE_URL}/payment/fail?tran_id={TRAN_ID}` | User-friendly retry page. |
| **Frontend Cancel Page** | `GET {FRONTEND_BASE_URL}/payment/cancel?tran_id={TRAN_ID}` | Cancellation feedback page. |

> **Note on SSLCommerz:** During session initialization, the backend automatically attaches `success_url`, `fail_url`, `cancel_url`, and `ipn_url` in the API payload. The merchant panel defaults serve as a fallback.

---

#### **B. bKash Tokenized Checkout Configuration**

| URL Type | Endpoint Path | Description |
| :--- | :--- | :--- |
| **Callback / Webhook URL** | `GET/POST {BASE_URL}/api/payments/bkash/callback` | bKash redirects to this backend endpoint with `paymentID` and `status`. |
| **Frontend Confirmation / Receipt** | `GET {FRONTEND_BASE_URL}/payment/success?tran_id={TRAN_ID}` | Final donation confirmation receipt page with printable summary. |
| **Frontend Failure Page** | `GET {FRONTEND_BASE_URL}/payment/fail?tran_id={TRAN_ID}` | bKash failure return page. |
| **Frontend Cancel Page** | `GET {FRONTEND_BASE_URL}/payment/cancel?tran_id={TRAN_ID}` | bKash cancellation return page. |

---

### 2. Environment Variables Configuration

Set these variables in `backend/.env`:

#### **Localhost Development (`backend/.env`):**
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/siraatul-mustakim
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d
BASE_URL=http://localhost:5001
FRONTEND_BASE_URL=http://localhost:3000
```

#### **Production Server (`backend/.env`):**
```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/siraatul-mustakim
JWT_SECRET=your-production-strong-jwt-secret
JWT_EXPIRES_IN=7d
BASE_URL=https://api.yourdomain.com
FRONTEND_BASE_URL=https://yourdomain.com
```

---

### 3. URL Resolution Examples

#### **Localhost Environment:**
- **bKash Callback:** `http://localhost:5001/api/payments/bkash/callback`
- **SSLCommerz IPN / Webhook:** `http://localhost:5001/api/payments/ssl/ipn`
- **SSLCommerz Success:** `http://localhost:5001/api/payments/ssl/success`
- **SSLCommerz Fail:** `http://localhost:5001/api/payments/ssl/fail`
- **SSLCommerz Cancel:** `http://localhost:5001/api/payments/ssl/cancel`
- **Frontend Success Receipt:** `http://localhost:3000/payment/success`
- **Frontend Failure Page:** `http://localhost:3000/payment/fail`
- **Frontend Cancel Page:** `http://localhost:3000/payment/cancel`

#### **Live Production Environment:**
*(Assuming API domain is `api.siraatulmustaqim.com` and Frontend domain is `siraatulmustaqim.com`)*
- **bKash Callback:** `https://api.siraatulmustaqim.com/api/payments/bkash/callback`
- **SSLCommerz IPN / Webhook:** `https://api.siraatulmustaqim.com/api/payments/ssl/ipn`
- **SSLCommerz Success:** `https://api.siraatulmustaqim.com/api/payments/ssl/success`
- **SSLCommerz Fail:** `https://api.siraatulmustaqim.com/api/payments/ssl/fail`
- **SSLCommerz Cancel:** `https://api.siraatulmustaqim.com/api/payments/ssl/cancel`
- **Frontend Success Receipt:** `https://siraatulmustaqim.com/payment/success`
- **Frontend Failure Page:** `https://siraatulmustaqim.com/payment/fail`
- **Frontend Cancel Page:** `https://siraatulmustaqim.com/payment/cancel`

---

## 🛠️ Admin Area Payment & Donation Features

Access the donation management suite at `/admin/donations`:

1. **Dashboard & Analytics:**
   - **Key Metrics:** Total Collected, Total Donors, This Month's Collection, Today's Collection.
   - **Charts:** Daily collections by sector (General vs Zakat) and Monthly totals using Recharts.
   - **Gateway Status:** Live status monitoring for bKash and SSLCommerz.

2. **Donation Transactions:**
   - Complete list of all transactions with real-time status badges (`Success`, `Pending`, `Failed`, `Cancelled`).
   - Filters by **Status**, **Gateway (bKash / SSLCommerz)**, and **Sector (General / Zakat)**.
   - **Details Modal:** View donor contact, fund breakdown, date, admin notes, and raw gateway execution payloads.

3. **Donors List:**
   - Aggregated donor directory grouped by phone number.
   - Shows Total Donated, Donation Count, Last Donation Date, and quick filters to inspect all transactions by that donor.

4. **Gateway Settings (Credentials):**
   - **bKash:** App Key, App Secret, Username, Password, Merchant Number, Sandbox/Live toggle, Enable/Disable toggle.
   - **SSLCommerz:** Store ID, Store Password, Sandbox/Live toggle, Enable/Disable toggle.
   - Password fields include secure masking with show/hide toggles.

5. **Sectors & Quick Amounts:**
   - Configure donation sectors/funds (General, Zakat, Madrasa, etc.) and preset donation amounts.

---

## 📡 Payment Endpoints Reference

### Public API Endpoints
- `GET /api/payments/public-gateways` — Returns list of active payment gateways.
- `GET /api/payments/donations/config` — Fetches active donation funds and quick amounts.
- `POST /api/payments/initiate` — Initiates donation session (bKash / SSLCommerz) and links to User by phone number.
- `GET /api/payments/user/:phone` — Retrieves user account details, total donated, donation count, last donation preferences, and recent donation history (supports all BD phone number formats: `01...`, `+880...`, `880...`).
- `GET /api/payments/bkash/verify?tran_id={id}` — Verifies bKash payment receipt data.
- `GET /api/payments/ssl/verify?tran_id={id}` — Verifies SSLCommerz payment receipt data.

### Payment Gateway Webhooks
- `POST/GET /api/payments/bkash/callback` — bKash checkout callback handler.
- `POST /api/payments/ssl/success` — SSLCommerz success return handler.
- `POST /api/payments/ssl/fail` — SSLCommerz failure return handler.
- `POST /api/payments/ssl/cancel` — SSLCommerz cancellation return handler.
- `POST /api/payments/ssl/ipn` — SSLCommerz IPN (Instant Payment Notification) listener.

### Admin API Endpoints *(Protected: Requires Bearer Token with Admin Role)*
- `GET /api/payments/admin/stats` — Donation statistics and dashboard charts data.
- `GET /api/payments/donations/history` — Paginated transactions history with search and filter parameters.
- `GET /api/payments/admin/donors` — Aggregated donors list with totals.
- `GET /api/payments/admin/donations/:id` — Single transaction detail.
- `PATCH /api/payments/admin/donations/:id/status` — Updates transaction status or admin notes.
- `GET /api/payments/admin/gateways` — Fetches bKash and SSLCommerz settings (masked secrets).
- `PUT /api/payments/admin/gateways` — Saves/updates gateway credentials and environment mode.
- `PUT /api/payments/donations/config` — Saves donation sectors, funds, and quick amounts.

---

## 🚀 Running the Project Locally

### 1. Backend
```bash
cd backend
npm install
npm run dev     # Runs on http://localhost:5001
```

### 2. Admin Panel
```bash
cd admin
pnpm install
pnpm dev        # Runs on http://localhost:3001
```

### 3. Frontend Web
```bash
cd frontend
pnpm install
pnpm dev        # Runs on http://localhost:3000
```

### 4. Mobile App (React Native / Expo)
```bash
cd app
npm install
npx expo start
```

