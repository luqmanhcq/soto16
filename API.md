API.md

SI-SOTO — API Specification (Next.js App Router)

---

⚠️ AI API RULES (WAJIB)

AI HARUS mengikuti:

1. Gunakan struktur:
   API → Service → Repository

2. API Route HANYA:
   
   - Validasi Zod
   - Call service
   - Return response

3. WAJIB:
   
   - TypeScript strict
   - DTO untuk request & response
   - try-catch error handling
   - async/await

4. DILARANG:
   
   - Business logic di API
   - Query DB langsung di API
   - Response tidak sesuai format

---

1. GLOBAL STANDARD

Base URL

/api

Format

- JSON
- RESTful

---

2. RESPONSE STANDARD (WAJIB)

✅ Success

{
  "success": true,
  "message": "Success",
  "data": {}
}

❌ Error

{
  "success": false,
  "message": "Error message",
  "errors": []
}

---

3. HTTP STATUS CODE (WAJIB)

- 200 → Success
- 201 → Created
- 400 → Bad Request
- 401 → Unauthorized
- 403 → Forbidden
- 404 → Not Found
- 500 → Internal Server Error

---

4. AUTHENTICATION

Method

- JWT (HTTP-only cookies RECOMMENDED)

Header (optional fallback)

Authorization: Bearer <token>

Middleware Rules

- Validasi token di middleware
- Inject user ke request
- Role check di middleware / API (BUKAN service)

---

5. DTO CONTRACT (WAJIB)

Semua request & response HARUS pakai DTO.

Contoh:

type LoginDto = {
  email: string
  password: string
}

---

6. MODULE: AUTH

🔹 POST /api/auth/register

Request

{
  "nip": "string",
  "nama": "string",
  "email": "string",
  "password": "string"
}

Response

- 201 Created

---

🔹 POST /api/auth/login

Request

{
  "email": "string",
  "password": "string"
}

Response

{
  "success": true,
  "message": "Login success",
  "data": {
    "token": "jwt_token",
    "user": {}
  }
}

---

🔹 GET /api/auth/me

- Auth required

---

7. MODULE: USERS

🔹 GET /api/users/profile

- Auth required

---

🔹 PUT /api/users/profile

Request

{
  "nama": "string",
  "jabatan": "string",
  "unit_kerja": "string"
}

---

8. MODULE: WEBINAR

🔹 GET /api/webinars

Query:

- kategori
- status

---

🔹 GET /api/webinars/:id

---

🔹 POST /api/webinars

- Role: admin / super_admin

---

🔹 PUT /api/webinars/:id

---

🔹 DELETE /api/webinars/:id

---

🔹 POST /api/webinars/:id/join

- Auth required

---

🔹 GET /api/webinars/:id/participants

- Role: admin

---

9. MODULE: PEMBELAJARAN

🔹 GET /api/pembelajaran

---

🔹 GET /api/pembelajaran/:id

---

🔹 POST /api/pembelajaran

- Role: admin

---

🔹 PUT /api/pembelajaran/:id

---

🔹 DELETE /api/pembelajaran/:id

---

10. MODULE: MATERI

🔹 GET /api/materi/:pembelajaran_id

---

🔹 POST /api/materi

---

🔹 PUT /api/materi/:id

---

🔹 DELETE /api/materi/:id

---

11. MODULE: PROGRESS

🔹 GET /api/progress/:pembelajaran_id

- Auth required

---

🔹 POST /api/progress

Request

{
  "pembelajaran_id": 1,
  "progress": 50,
  "status": "proses"
}

---

12. MODULE: SERTIFIKAT

🔹 GET /api/sertifikat

- Auth required

---

🔹 POST /api/sertifikat

Request

{
  "nama_diklat": "string",
  "tanggal_pelaksanaan": "YYYY-MM-DD",
  "jumlah_jp": 0,
  "penyelenggara": "string"
}

---

🔹 PUT /api/sertifikat/:id

---

🔹 POST /api/sertifikat/:id/approve

- Role: admin

---

🔹 POST /api/sertifikat/:id/reject

- Role: admin

---

🔹 GET /api/sertifikat/:id/download

- Auth required

---

13. MODULE: DASHBOARD

🔹 GET /api/dashboard/stats

- Role: admin

Response

{
  "success": true,
  "data": {
    "total_webinar": 0,
    "total_pembelajaran": 0,
    "total_sertifikat": 0
  }
}

---

14. MODULE: PENGUMUMAN

🔹 GET /api/pengumuman

---

🔹 GET /api/pengumuman/:slug

---

🔹 POST /api/pengumuman

- Role: admin

---

🔹 PUT /api/pengumuman/:id

---

🔹 DELETE /api/pengumuman/:id

---

15. VALIDATION (WAJIB)

Gunakan Zod untuk:

- Validasi input
- Sanitasi data
- Format error

---

16. ERROR HANDLING STANDARD

Gunakan pattern:

try {
  // logic
} catch (error) {
  return errorResponse()
}

---

17. AI IMPLEMENTATION RULE

Saat generate API:

WAJIB:

- Gunakan DTO
- Gunakan Zod
- Gunakan service layer
- Gunakan response standard

DILARANG:

- Return data mentah
- Skip validation
- Skip error handling

---

🚀 FINAL NOTE

API ini:

- Konsisten dengan database
- Konsisten dengan arsitektur
- Siap generate backend otomatis
- AI-friendly

Jika AI melanggar → ERROR