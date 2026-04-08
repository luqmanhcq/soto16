# 🧪 API Testing Guide - SI-SOTO Auth Module

## 📋 Prerequisites

- PostgreSQL running locally
- Node.js 18+
- Postman atau Thunder Client (optional, bisa gunakan cURL)

---

## 🔧 Setup

### 1. Generate Migrations
```bash
npm run db:generate
npm run db:migrate
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Server Running
```
✓ Ready in 1.2s
✓ http://localhost:3000
```

---

## 🧪 Test Cases

### Test 1: Register User (Success)

**Endpoint:** `POST /api/auth/register`

**cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nip": "198701012020121001",
    "nama": "John Doe",
    "email": "john.doe@example.com",
    "password": "MyPassword123"
  }'
```

**Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/register`
- Body (JSON):
```json
{
  "nip": "198701012020121001",
  "nama": "John Doe",
  "email": "john.doe@example.com",
  "password": "MyPassword123"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "id": 1,
    "nip": "198701012020121001",
    "nama": "John Doe",
    "email": "john.doe@example.com",
    "role": "asn"
  }
}
```

---

### Test 2: Register User (Duplicate Email)

**Input:**
```json
{
  "nip": "198702012020121002",
  "nama": "Jane Doe",
  "email": "john.doe@example.com",
  "password": "MyPassword123"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Email sudah terdaftar"
}
```

---

### Test 3: Register User (Duplicate NIP)

**Input:**
```json
{
  "nip": "198701012020121001",
  "nama": "Another User",
  "email": "another@example.com",
  "password": "MyPassword123"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "NIP sudah terdaftar"
}
```

---

### Test 4: Register User (Invalid NIP Format)

**Input:**
```json
{
  "nip": "12345",
  "nama": "John Doe",
  "email": "test@example.com",
  "password": "MyPassword123"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "nip",
      "message": "String must contain exactly 18 character(s)"
    }
  ]
}
```

---

### Test 5: Register User (Invalid Email)

**Input:**
```json
{
  "nip": "198701012020121001",
  "nama": "John Doe",
  "email": "invalid-email",
  "password": "MyPassword123"
}
```

**Expected Response (400):**
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

### Test 6: Register User (Password Too Short)

**Input:**
```json
{
  "nip": "198701012020121001",
  "nama": "John Doe",
  "email": "john@example.com",
  "password": "123"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "password",
      "message": "String must contain at least 6 character(s)"
    }
  ]
}
```

---

### Test 7: Login User (Success)

**Endpoint:** `POST /api/auth/login`

**cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "nip": "199512122020011012",
    "password": "MyPassword123"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwi...",
    "user": {
      "id": 1,
      "nip": "198701012020121001",
      "nama": "John Doe",
      "email": "john.doe@example.com",
      "jabatan": null,
      "golongan": null,
      "unit_kerja": null,
      "role": "asn"
    }
  }
}
```

**Save Token:** Simpan token dari response untuk test selanjutnya.

---

### Test 8: Login User (Wrong Password)

**Input:**
```json
{
  "nip": "199512122020011012",
  "password": "WrongPassword"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "NIP atau password salah"
}
```

---

### Test 9: Login User (User Not Found)

**Input:**
```json
{
  "nip": "999999999999999999",
  "password": "MyPassword123"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "NIP atau password salah"
}
```

---

### Test 10: Get Profile (Success)

**Endpoint:** `GET /api/auth/me`

**cURL:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer {token}"
```

Replace `{token}` dengan token dari Test 7.

**Postman:**
- Method: `GET`
- URL: `http://localhost:3000/api/auth/me`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer {token}`

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "nip": "198701012020121001",
    "nama": "John Doe",
    "email": "john.doe@example.com",
    "jabatan": null,
    "golongan": null,
    "unit_kerja": null,
    "role": "asn",
    "is_active": true,
    "created_at": "2026-03-31T10:00:00.000Z",
    "updated_at": "2026-03-31T10:00:00.000Z"
  }
}
```

---

### Test 11: Get Profile (No Token)

**cURL:**
```bash
curl -X GET http://localhost:3000/api/auth/me
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Token tidak ditemukan"
}
```

---

### Test 12: Get Profile (Invalid Token)

**cURL:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer invalid-token-here"
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Token tidak valid"
}
```

---

### Test 13: Update Profile (Success)

**Endpoint:** `PUT /api/users/profile`

**cURL:**
```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Jane Doe Updated",
    "jabatan": "Kepala Seksi",
    "unit_kerja": "Seksi Teknologi Informasi"
  }'
```

Replace `{token}` dengan token dari Test 7.

**Postman:**
- Method: `PUT`
- URL: `http://localhost:3000/api/users/profile`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer {token}`
- Body (JSON):
```json
{
  "nama": "Jane Doe Updated",
  "jabatan": "Kepala Seksi",
  "unit_kerja": "Seksi Teknologi Informasi"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Profil berhasil diperbarui",
  "data": {
    "id": 1,
    "nip": "198701012020121001",
    "nama": "Jane Doe Updated",
    "email": "john.doe@example.com",
    "jabatan": "Kepala Seksi",
    "golongan": null,
    "unit_kerja": "Seksi Teknologi Informasi",
    "role": "asn",
    "is_active": true,
    "created_at": "2026-03-31T10:00:00.000Z",
    "updated_at": "2026-03-31T10:00:00.000Z"
  }
}
```

---

### Test 14: Update Profile (Partial Update)

**Input:**
```json
{
  "jabatan": "Kepala Bidang"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Profil berhasil diperbarui",
  "data": {
    "id": 1,
    "nip": "198701012020121001",
    "nama": "Jane Doe Updated",
    "email": "john.doe@example.com",
    "jabatan": "Kepala Bidang",
    "golongan": null,
    "unit_kerja": "Seksi Teknologi Informasi",
    "role": "asn",
    "is_active": true,
    "created_at": "2026-03-31T10:00:00.000Z",
    "updated_at": "2026-03-31T10:00:00.000Z"
  }
}
```

---

### Test 15: Update Profile (No Token)

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Token tidak ditemukan"
}
```

---

## 📊 Test Summary

| # | Test Case | Endpoint | Status | Notes |
|---|-----------|----------|--------|-------|
| 1 | Register Success | POST /api/auth/register | ✅ | 201 Created |
| 2 | Register Duplicate Email | POST /api/auth/register | ✅ | 400 Bad Request |
| 3 | Register Duplicate NIP | POST /api/auth/register | ✅ | 400 Bad Request |
| 4 | Register Invalid NIP | POST /api/auth/register | ✅ | 400 Validation Error |
| 5 | Register Invalid Email | POST /api/auth/register | ✅ | 400 Validation Error |
| 6 | Register Short Password | POST /api/auth/register | ✅ | 400 Validation Error |
| 7 | Login Success | POST /api/auth/login | ✅ | 200 OK + JWT |
| 8 | Login Wrong Password | POST /api/auth/login | ✅ | 400 Bad Request |
| 9 | Login User Not Found | POST /api/auth/login | ✅ | 400 Bad Request |
| 10 | Get Profile Success | GET /api/auth/me | ✅ | 200 OK |
| 11 | Get Profile No Token | GET /api/auth/me | ✅ | 401 Unauthorized |
| 12 | Get Profile Invalid Token | GET /api/auth/me | ✅ | 401 Unauthorized |
| 13 | Update Profile Success | PUT /api/users/profile | ✅ | 200 OK |
| 14 | Update Profile Partial | PUT /api/users/profile | ✅ | 200 OK |
| 15 | Update Profile No Token | PUT /api/users/profile | ✅ | 401 Unauthorized |

---

## 🔗 Test Flow Diagram

```
1. Register User ──→ Setup database with user
                    ↓
2. Get Profile    ← Can view profile before login (with token)
                    ↓
3. Login User     ──→ Get JWT token
                    ↓
4. Get Profile    ← Access with token
                    ↓
5. Update Profile ← Change user data
                    ↓
6. Get Profile    ← Verify changes applied
```

---

## 🚀 Automated Testing (Next)

Untuk production-ready, tambahkan:

```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev @testing-library/react-native
```

Buat file `__tests__/api/auth.test.ts` untuk automated tests.

---

## 📝 Notes

- Semua endpoint mengembalikan response dengan struktur standard
- Error responses selalu include `success: false` dan `message`
- Validation errors include array `errors` dengan `field` dan `message`
- JWT token valid selama 7 hari
- Password di-hash dengan bcryptjs (tidak bisa di-reverse)
- Database transactions digunakan untuk operasi yang kompleks

---

## 🎯 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:** Pastikan PostgreSQL running dan `DATABASE_URL` benar di `.env.local`

### JWT Token Invalid
```
Error: Token tidak valid
```
**Solution:** 
- Token sudah expired (7 hari)
- `JWT_SECRET` tidak sesuai
- Token sudah di-revoke

### User Not Active
```
Error: User tidak aktif
```
**Solution:** Admin perlu activate user di database

---

## 📚 References

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Zod Validation](https://zod.dev/)
- [JWT.io](https://jwt.io/)

---

Happy Testing! 🎉
