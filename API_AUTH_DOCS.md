# SI-SOTO API — Auth Module Documentation

## 📋 Daftar Isi

- [Struktur Folder](#struktur-folder)
- [Endpoint - Register](#endpoint-register)
- [Endpoint - Login](#endpoint-login)
- [Endpoint - Get Profile](#endpoint-get-profile)
- [Endpoint - Update Profile](#endpoint-update-profile)
- [Setup Database](#setup-database)
- [Testing](#testing)

---

## 🗂️ Struktur Folder

```
lib/
├── db/
│   ├── index.ts                 # Database connection
│   └── schema.ts                # Drizzle schema definitions
├── repositories/
│   └── user.repository.ts       # Database operations
├── services/
│   └── auth.service.ts          # Business logic
├── middleware/
│   └── auth.ts                  # JWT auth middleware
├── jwt.ts                       # JWT utilities
├── response.ts                  # Response helper
├── validation.ts                # Zod schemas
types/
├── dto.ts                       # DTO definitions
app/api/
├── auth/
│   ├── register/route.ts        # POST /api/auth/register
│   ├── login/route.ts           # POST /api/auth/login
│   └── me/route.ts              # GET /api/auth/me
└── users/
    └── profile/route.ts         # PUT /api/users/profile
```

---

## 🏗️ Clean Architecture

**API Route** → Handles HTTP, validation
↓
**Service** → Business logic
↓
**Repository** → Database operations
↓
**Database (Drizzle ORM)**

---

## 🔑 Authentication Flow

Request Header → Middleware Auth → Get User ID → Service → Repository → Database

---

## 📡 API Endpoints

### Endpoint: Register

**POST** `/api/auth/register`

**Request:**
```json
{
  "nip": "123456789012345678",
  "nama": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "id": 1,
    "nip": "123456789012345678",
    "nama": "John Doe",
    "email": "john@example.com",
    "role": "asn"
  }
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

---

### Endpoint: Login

**POST** `/api/auth/login`

**Request:**
```json
{
  "nip": "199512122020011012",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nip": "123456789012345678",
      "nama": "John Doe",
      "email": "john@example.com",
      "jabatan": null,
      "golongan": null,
      "unit_kerja": null,
      "role": "asn"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "NIP atau password salah"
}
```

---

### Endpoint: Get Profile

**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

atau melalui cookie

```
Cookie: auth_token=<token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "nip": "123456789012345678",
    "nama": "John Doe",
    "email": "john@example.com",
    "jabatan": null,
    "golongan": null,
    "unit_kerja": null,
    "role": "asn",
    "is_active": true,
    "created_at": "2026-03-31T10:00:00Z",
    "updated_at": "2026-03-31T10:00:00Z"
  }
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "message": "Token tidak ditemukan"
}
```

---

### Endpoint: Update Profile

**PUT** `/api/users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nama": "Jane Doe",
  "jabatan": "Kepala Bidang",
  "unit_kerja": "Bidang IT"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profil berhasil diperbarui",
  "data": {
    "id": 1,
    "nip": "123456789012345678",
    "nama": "Jane Doe",
    "email": "john@example.com",
    "jabatan": "Kepala Bidang",
    "golongan": null,
    "unit_kerja": "Bidang IT",
    "role": "asn",
    "is_active": true,
    "created_at": "2026-03-31T10:00:00Z",
    "updated_at": "2026-03-31T10:00:00Z"
  }
}
```

---

## 🗄️ Setup Database

### 1. Buat PostgreSQL Database

```bash
createdb soto16
```

### 2. Setup Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/soto16
JWT_SECRET=your-secret-key-here
```

### 3. Run Migrations

```bash
npm run db:generate
npm run db:migrate
```

Tambahkan scripts di `package.json`:
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate --config drizzle.config.ts",
    "db:migrate": "drizzle-kit migrate --config drizzle.config.ts",
    "db:studio": "drizzle-kit studio --config drizzle.config.ts"
  }
}
```

### 4. Start Development Server

```bash
npm run dev
```

---

## 🧪 Testing API

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nip": "123456789012345678",
    "nama": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

**Update Profile:**
```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Jane Doe",
    "jabatan": "Kepala Bidang"
  }'
```

---

## 📋 Key Files

| File | Tujuan |
|------|--------|
| `lib/db/schema.ts` | Database schema definitions |
| `lib/repositories/user.repository.ts` | Database layer |
| `lib/services/auth.service.ts` | Business logic |
| `lib/middleware/auth.ts` | JWT authentication |
| `app/api/auth/register/route.ts` | Register endpoint |
| `app/api/auth/login/route.ts` | Login endpoint |
| `app/api/auth/me/route.ts` | Get profile endpoint |

---

## ✅ Rules Diterapkan

✔️ PostgreSQL + Drizzle ORM
✔️ Snake_case naming convention
✔️ All tables have id, created_at, updated_at
✔️ Foreign keys with ON DELETE CASCADE
✔️ ENUM untuk status fields
✔️ Index pada field penting
✔️ Clean Architecture: API → Service → Repository
✔️ DTO untuk request & response
✔️ Zod validation
✔️ Try-catch error handling
✔️ JWT authentication
✔️ Response standard format

---

## 🚀 Next Steps

1. Tambahkan module webinar (create, join, list)
2. Tambahkan module pembelajaran
3. Tambahkan role-based access control
4. Tambahkan file upload untuk sertifikat
5. Tambahkan email verification
6. Tambahkan rate limiting
7. Tambahkan logging
8. Tambahkan unit tests
