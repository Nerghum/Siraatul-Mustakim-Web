# Email/Password Auth Implementation - Frontend Guide

## 🎯 What's New

✅ Email/Password-based login  
✅ Role-based access control (Admin role)  
✅ JWT token authentication  
✅ Admin user creation  
✅ Existing phone OTP auth **still works** (no breaking changes)

---

## 📚 Backend Routes

### Public Routes (No Authentication Required)

```
POST /api/auth/login
  - Email: string
  - Password: string
  → Returns: token, user (id, email, role)

POST /api/auth/signin  (Phone OTP)
  - Phone: string
  → Returns: otp

POST /api/auth/verify-otp  (Phone OTP)
  - Phone: string
  - OTP: string
  → Returns: token, user
```

### Protected Routes (JWT Required)

```
GET /api/auth/me
  Headers: Authorization: Bearer {token}
  → Returns: current user data

POST /api/auth/create-admin  (Admin Only)
  Headers: Authorization: Bearer {token}
  - Email: string
  - Password: string
  → Returns: new admin user data
```

---

## 🚀 Quick Start for Frontend

### 1. Create First Admin (Backend Setup)

Run this command in the backend directory:

```bash
node scripts/createAdmin.js admin@example.com MyPassword123
```

### 2. Login Service (Frontend)

```typescript
// services/auth.ts
export async function loginWithEmail(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error((await response.json()).message);
  }

  const data = await response.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}
```

### 3. Protected API Call Example

```typescript
export async function createAdmin(email: string, password: string) {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/auth/create-admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error((await response.json()).message);
  }

  return response.json();
}
```

### 4. NextAuth Integration (If Using)

In your auth.ts:

```typescript
providers: [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        },
      );

      if (!response.ok) return null;

      const { user, token } = await response.json();
      return {
        ...user,
        accessToken: token,
      };
    },
  }),
];
```

---

## 📋 Database Collections

### Users Collection

```javascript
{
  _id: ObjectId,
  phone: String (optional),
  email: String (unique),
  password: String (hashed),
  role: 'user' | 'admin',
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Security Features

✅ Passwords hashed with bcryptjs  
✅ JWT token verification on protected routes  
✅ Admin-only middleware for sensitive operations  
✅ Token expiration (7 days default)  
✅ No plaintext passwords in responses

---

## 📝 Existing Auth (Still Works!)

Phone OTP authentication is **unchanged**:

- POST /api/auth/signin → get OTP
- POST /api/auth/verify-otp → get token

You can use both methods simultaneously!

---

## ✨ Usage Examples

### Login Form Component

```tsx
"use client";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Save token
      localStorage.setItem("token", data.token);

      // Redirect to dashboard
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

---

## 📋 Implementation Checklist

- [ ] Run `node scripts/createAdmin.js` to create first admin
- [ ] Test login endpoint with email/password
- [ ] Update frontend login form to use `/api/auth/login`
- [ ] Store JWT token in localStorage or cookies
- [ ] Include token in all protected API requests
- [ ] Add logout functionality
- [ ] Test role-based access (admin-only routes)
- [ ] Update NextAuth config if using

---

## 🛠️ Troubleshooting

**"Invalid email or password"**

- Check email and password are correct
- Verify admin user was created with createAdmin script

**"Admin access required"**

- User doesn't have admin role
- Use `/api/auth/create-admin` only with admin token

**"Unauthorized"**

- Missing Bearer token in Authorization header
- Token has expired (get a new one by logging in)

---

## 📞 Support

Check [AUTH-IMPLEMENTATION.md](./AUTH-IMPLEMENTATION.md) for detailed API documentation.
