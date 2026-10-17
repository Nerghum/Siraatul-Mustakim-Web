# Authentication Implementation Guide

## Overview

The authentication system now supports both **phone OTP** and **email/password** based authentication with role-based access control (Admin role).

## Database Schema

### User Model

```javascript
{
  phone: String (unique, optional),
  email: String (unique, optional),
  password: String (hashed with bcryptjs),
  role: 'user' | 'admin' (default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### 1. Phone OTP Authentication (Existing)

#### Sign In with Phone

```
POST /api/auth/signin
Content-Type: application/json

{
  "phone": "+1234567890"
}

Response:
{
  "message": "OTP sent to phone number",
  "phone": "+1234567890",
  "otp": "12345"
}
```

#### Verify OTP

```
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phone": "+1234567890",
  "otp": "12345"
}

Response:
{
  "user": {
    "id": "user_id",
    "phone": "+1234567890",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

---

### 2. Email/Password Authentication (New)

#### Login with Email and Password

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "admin@example.com",
    "role": "admin"
  },
  "token": "jwt_token_here"
}
```

#### Create Admin User (Protected Route - Admin Only)

```
POST /api/auth/create-admin
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "email": "newadmin@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "user": {
    "id": "new_admin_id",
    "email": "newadmin@example.com",
    "role": "admin"
  },
  "message": "Admin user created successfully"
}
```

---

### 3. Get Current User (Protected Route)

```
GET /api/auth/me
Authorization: Bearer jwt_token_here

Response:
{
  "user": {
    "id": "user_id",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## Setup Instructions

### 1. Create First Admin User

Since the `/api/auth/create-admin` endpoint requires an admin token, follow these steps to create the first admin:

**Option A: Direct Database Insert**

```javascript
db.users.insertOne({
  email: "admin@example.com",
  password: "hashed_password", // Use bcryptjs to hash
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

**Option B: Temporary Route (Remove After First Admin Created)**
Create a temporary endpoint that doesn't require authentication, use it once, then remove it.

---

## JWT Token Structure

The JWT token contains:

```javascript
{
  id: "user_id",
  email: "user@example.com", // or phone for OTP auth
  role: "admin" | "user",
  iat: timestamp,
  exp: timestamp
}
```

---

## Frontend Integration

### 1. Login Service

```typescript
// services/auth.ts
interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    role: "admin" | "user";
  };
  token: string;
}

async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

// Store token in localStorage or cookie
function setAuthToken(token: string) {
  localStorage.setItem("authToken", token);
}

// Include token in all requests
function getAuthHeader() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
```

### 2. Protected API Calls

```typescript
async function createAdmin(email: string, password: string) {
  const response = await fetch("/api/auth/create-admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}
```

### 3. NextAuth Integration (Optional)

If using NextAuth, update the credentials provider:

```typescript
// auth.ts
credentials: {
  email: { label: "Email", type: "email" },
  password: { label: "Password", type: "password" }
},
async authorize(credentials) {
  const response = await fetch(`${baseURL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) return null;

  const { user, token } = await response.json();
  return {
    ...user,
    accessToken: token,
  };
}
```

---

## Security Notes

1. **Password Hashing**: Passwords are automatically hashed using bcryptjs before saving.
2. **Token Expiration**: Set via `JWT_EXPIRES_IN` env variable (default: 7 days).
3. **Admin Middleware**: Only users with `role: 'admin'` can create new admins.
4. **Password Minimum**: Must be at least 6 characters.
5. **Unique Constraints**: Both email and phone are unique per user (sparse indexes allow null).

---

## Environment Variables

```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

---

## Code Structure

- **Models**: `models/User.js` - User schema with email/password/role
- **Services**: `services/authService.js` - Business logic (emailSignIn, createAdmin)
- **Controllers**: `controllers/authController.js` - Request handlers
- **Middleware**:
  - `middleware/auth.js` - JWT verification (protect)
  - `middleware/adminAuth.js` - Admin role verification (protectAdmin)
- **Routes**: `routes/authRoutes.js` - API endpoints
