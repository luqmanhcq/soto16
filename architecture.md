
ARCHITECTURE.md

SI-SOTO — Sistem Informasi Strategi Optimalisasi Talenta Organisasi
Corporate University Platform for ASN (Aparatur Sipil Negara)

---

⚠️ AI CODING RULES (WAJIB DIBACA)

AI HARUS mengikuti aturan ini TANPA PENGECUALIAN:

1. Gunakan Layered Architecture:
   API → Service → Repository → Database

2. DILARANG:
   
   - Business logic di API Route
   - Business logic di Repository
   - Query database langsung dari Service

3. WAJIB:
   
   - TypeScript strict mode
   - Validasi pakai Zod di API layer
   - Gunakan DTO untuk semua data transfer
   - Gunakan Drizzle ORM untuk semua query

4. Struktur folder HARUS sama persis dengan dokumen ini

---

1. SYSTEM OVERVIEW

SI-SOTO adalah platform pembelajaran ASN berbasis Next.js fullstack.

👥 Roles

- "asn" → user biasa
- "admin" → admin instansi
- "super_admin" → admin global

🎯 Core Features

- Home (public dan terdapat carosel slider, pencarian, list webinar, list pembelajaran mandiri)
- Webinar 
- Pembelajaran Mandiri 
- Sertifikat
- Profil ASN
- Dashboard (admin only)

---

2. ARCHITECTURE

🧠 Pattern

Fullstack Monorepo
Next.js App Router + Clean Architecture

🔄 Layer Flow

Client
↓
Next.js (App Router)
↓
API Route
↓
Service
↓
Repository
↓
Database (PostgreSQL)

---

📦 Layer Responsibility

API Route ("/app/api/**")

- Validasi input (Zod)
- Call service
- Return response

❌ Tidak boleh ada business logic

---

Service ("/lib/services/**")

- Semua business logic
- Orkestrasi repository

❌ Tidak boleh query DB langsung

---

Repository ("/lib/repositories/**")

- Query database via Drizzle

❌ Tidak boleh ada business logic

---

Database

- PostgreSQL
- Semua schema di Drizzle

---

3. RENDERING STRATEGY

Gunakan aturan ini:

- Server Component → default (data fetching)
- Client Component → interaksi user
- Server Action → simple mutation
- API Route → complex logic / auth / external API

---

4. TECH STACK

- Next.js 16 (App Router)
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Drizzle ORM
- Zod
- JWT (HTTP-only cookies)

---

5. FOLDER STRUCTURE (WAJIB SAMA)

project-root/

app/
  (auth)/
    login/page.tsx
    register/page.tsx

  (main)/
    layout.tsx
    dashboard/page.tsx
    webinar/page.tsx
    webinar/[id]/page.tsx
    pembelajaran/page.tsx
    pembelajaran/[id]/page.tsx
    sertifikat/page.tsx
    profil/page.tsx

  api/
    auth/
      login/route.ts
      register/route.ts
      logout/route.ts

    webinar/
      route.ts
      [id]/route.ts

    pembelajaran/
      route.ts

    sertifikat/
      route.ts

    dashboard/
      route.ts

components/
  ui/
  shared/

lib/
  db/
    schema.ts
    index.ts

  services/
    auth.service.ts
    user.service.ts
    webinar.service.ts
    pembelajaran.service.ts
    sertifikat.service.ts
    dashboard.service.ts

  repositories/
    user.repository.ts
    webinar.repository.ts
    pembelajaran.repository.ts
    sertifikat.repository.ts

  validations/
    auth.validation.ts
    user.validation.ts
    webinar.validation.ts
    sertifikat.validation.ts

hooks/
types/
utils/
styles/
public/

drizzle/migrations/

.env
drizzle.config.ts
next.config.js
tsconfig.json

---

6. SERVICE CONTRACT (WAJIB DIIKUTI)

AuthService

login(dto: LoginDto)
register(dto: RegisterDto)
logout(token: string)
verifyToken(token: string)

UserService

getProfile(userId: string)
updateProfile(userId: string, dto: UpdateProfileDto)

WebinarService

getAll(filters?)
getById(id: string)
create(dto)
join(webinarId, userId)

PembelajaranService

getAll()
getById(id)
trackProgress(userId, materiId)

SertifikatService

submit(dto)
approve(id, adminId)
reject(id, adminId, reason)
generate(id)
download(id, userId)

DashboardService

getStats()
getActivityLogs()

---

7. REQUEST FLOW (WAJIB DIIKUTI)

Contoh: Submit Sertifikat

1. Client → POST /api/sertifikat

2. API:
   
   - Validate Zod
   - Call service

3. Service:
   
   - Validasi bisnis
   - Call repository

4. Repository:
   
   - Insert DB via Drizzle

5. Return response ke client

---

8. NAMING CONVENTION

- file → kebab-case
- component → PascalCase
- function → camelCase
- variable → camelCase
- table → snake_case
- DTO → PascalCaseDto
- schema → camelCaseSchema

---

9. ENVIRONMENT

DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=

---

10. SECURITY RULES

- JWT disimpan di HTTP-only cookie
- Role check di middleware / API (BUKAN di service)
- Validasi semua input
- Jangan expose error sensitif

---

11. BEST PRACTICES (PENTING UNTUK AI)

- Selalu gunakan DTO (jangan kirim raw object)
- Gunakan transaction jika multi query
- Pisahkan logic per feature
- Jangan hardcode value
- Gunakan error handling standar

---

12. AI OUTPUT FORMAT (WAJIB)

Jika AI generate code:

- Gunakan TypeScript
- Gunakan async/await
- Gunakan Zod di API
- Gunakan struktur folder di atas
- Jangan buat file di luar struktur

13. Deskripsi Fitur (WAJIB)
- Home (public dan terdapat carosel slider, pencarian, list webinar, list pembelajaran mandiri)
- Webinar (terdapat crud, dimana bentuk list bisa lihat banyak orang untuk yang lain hanya admin dan admin super)
- Pembelajaran Mandiri  (terdapat crud, dimana bentuk list bisa lihat banyak orang untuk yang lain hanya admin dan admin super)
- Sertifikat(pengajuan sertifikat dari kegiatan, kemudian di aprove dan dibuatkan sertifikat)
- Profil ASN (profil asn, edit password, dan lain lain)
- Dashboard (semuanya bisa melihat cuma perbedaan informasi jika user biasa mengenai informasi tentang webinar yang diikuti, pemeblajan yang di ikuti, progres dan lain lain sehingga bisa seinformatif mungkin.)

---

🚀 FINAL NOTE

Dokumen ini adalah single source of truth.
Semua code HARUS mengikuti aturan ini.

Jika melanggar → dianggap ERROR.