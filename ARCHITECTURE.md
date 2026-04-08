# 🏗️ SI-SOTO Backend Architecture

## Clean Architecture Diagram

```
┌─────────────────────────────────────────┐
│        NEXT.JS API ROUTES               │
│  app/api/auth/register/route.ts         │
│  app/api/auth/login/route.ts            │
│  app/api/auth/me/route.ts               │
│  app/api/users/profile/route.ts         │
└────────────────┬────────────────────────┘
                 │
       ┌─────────▼──────────┐
       │  VALIDATION        │
       │  (Zod Schemas)     │
       └─────────┬──────────┘
                 │
       ┌─────────▼──────────────┐
       │  SERVICE LAYER         │
       │  (Business Logic)      │
       │  auth.service.ts       │
       └────────┬───────────────┘
                │
       ┌────────▼──────────────┐
       │  REPOSITORY LAYER     │
       │  (Data Access)        │
       │  user.repository.ts   │
       └────────┬──────────────┘
                │
       ┌────────▼──────────────┐
       │  DATABASE             │
       │  (PostgreSQL +        │
       │   Drizzle ORM)        │
       └───────────────────────┘
```

---

## Configuration Files

```
drizzle.config.ts       # Drizzle configuration
.env.example            # Environment variables template
```

---

## Folder Structure

```
project/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts        ✅ POST - Registrasi user
│   │   │   ├── login/route.ts           ✅ POST - Login user
│   │   │   └── me/route.ts              ✅ GET  - Get current user
│   │   └── users/
│   │       └── profile/route.ts         ✅ PUT  - Update profile
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── lib/
│   ├── db/
│   │   ├── index.ts                     ✅ Database connection
│   │   └── schema.ts                    ✅ Drizzle schema + relations
│   │
│   ├── repositories/
│   │   └── user.repository.ts           ✅ User database operations
│   │
│   ├── services/
│   │   └── auth.service.ts              ✅ Auth business logic
│   │
│   ├── middleware/
│   │   └── auth.ts                      ✅ JWT middleware
│   │
│   ├── jwt.ts                           ✅ JWT utilities
│   ├── response.ts                      ✅ Response helpers
│   └── validation.ts                    ✅ Zod schemas
│
├── types/
│   └── dto.ts                           ✅ DTO definitions
│
├── drizzle.config.ts                    ✅ Drizzle config
├── .env.example                         ✅ Env template
├── package.json                         ✅ Dependencies
└── API_AUTH_DOCS.md                     ✅ Dokumentasi lengkap
```

---

## 📋 Implementation Checklist

### Phase 1: Auth Module ✅

- [x] Database schema (users table)
- [x] Drizzle ORM setup
- [x] User repository
- [x] Auth service
- [x] JWT utilities
- [x] Response helpers
- [x] Zod validation
- [x] Register endpoint
- [x] Login endpoint
- [x] Get profile endpoint
- [x] Update profile endpoint
- [x] Auth middleware
- [x] Documentation

### Phase 2: Webinar Module (Kerjakan Next)

- [ ] WebinarRepository
  - [ ] findAll (with filters)
  - [ ] findById
  - [ ] create (admin only)
  - [ ] update (admin only)
  - [ ] delete (admin only)

- [ ] WebinarService
  - [ ] getWebinars
  - [ ] getWebinarById
  - [ ] createWebinar
  - [ ] updateWebinar
  - [ ] deleteWebinar
  - [ ] joinWebinar
  - [ ] getParticipants

- [ ] API Routes
  - [ ] GET /api/webinars
  - [ ] GET /api/webinars/:id
  - [ ] POST /api/webinars (admin)
  - [ ] PUT /api/webinars/:id (admin)
  - [ ] DELETE /api/webinars/:id (admin)
  - [ ] POST /api/webinars/:id/join
  - [ ] GET /api/webinars/:id/participants

### Phase 3: Pembelajaran Module

- [ ] PembelajaranRepository
- [ ] PembelajaranService
- [ ] API Routes

### Phase 4: Progress & Certificates

- [ ] Progress tracking
- [ ] Certificate management
- [ ] Approval workflow

### Phase 5: Admin Dashboard

- [ ] Dashboard stats
- [ ] User management
- [ ] Content management

### Phase 6: Additional Features

- [ ] File uploads
- [ ] Email notifications
- [ ] Search & filtering
- [ ] Pagination
- [ ] Rate limiting
- [ ] Logging
- [ ] Caching

---

## 🔑 Naming Conventions Applied

✅ **Database**
- Table names: `snake_case` (users, webinars, pembelajaran)
- Column names: `snake_case` (user_id, created_at, unit_kerja)
- Primary key: `id`
- Foreign keys: `{table}_id` (user_id, webinar_id)
- Timestamps: `created_at`, `updated_at`

✅ **Code**
- Folders: `kebab-case` (auth, repositories, services)
- Files: `kebab-case` (auth.service.ts, user.repository.ts)
- Classes: `PascalCase` (UserRepository, AuthService)
- Functions: `camelCase` (createUser, getUserById)
- Variables: `camelCase` (userId, userName)
- Constants: `UPPER_CASE`

✅ **API**
- Routes: `/api/resource/action` (GET, POST, PUT, DELETE)
- Response: Standard JSON with `success`, `message`, `data`

---

## 🚀 Development Workflow

### 1. Setup Database

```bash
# Install dependencies
npm install

# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Open Drizzle Studio
npm run db:studio
```

### 2. Start Development

```bash
npm run dev
```

Server akan jalan di `http://localhost:3000`

### 3. Test API

Gunakan cURL, Postman, atau Thunder Client untuk test endpoints.

---

## 🛡️ Security Implemented

- [x] Password hashing dengan bcryptjs
- [x] JWT token authentication
- [x] Input validation dengan Zod
- [x] Role-based access control (struktur siap)
- [x] Error handling tanpa exposing sensitive info
- [x] CORS ready

---

## ⚡ Performance

- [ ] Database indexing sudah setup (created in schema)
- [ ] Query optimization ready
- [ ] Connection pooling (postgres driver handles)
- [ ] Caching ready for implementation
- [ ] Rate limiting ready for implementation

---

## 📚 Key Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.2.1 | Framework |
| React | 19.2.4 | UI Library |
| TypeScript | ^5 | Type Safety |
| Drizzle ORM | ^0.33.0 | Database ORM |
| PostgreSQL | - | Database |
| Zod | ^3.22.4 | Validation |
| bcryptjs | ^2.4.3 | Password Hashing |
| jsonwebtoken | ^9.1.2 | JWT |
| Tailwind CSS | ^4 | Styling |

---

## 📖 Entry Points

**Register User:**
```
POST /api/auth/register
→ app/api/auth/register/route.ts
→ authService.register()
→ userRepository.create()
```

**Login User:**
```
POST /api/auth/login
→ app/api/auth/login/route.ts
→ authService.login()
→ userRepository.findByEmail()
→ JWT token generated
```

**Get Profile:**
```
GET /api/auth/me (with token)
→ app/api/auth/me/route.ts
→ withAuth middleware (verify JWT)
→ authService.getUserById()
```

---

## 🎯 Next Steps

1. **Test Auth Module**
   - Test register, login, get profile, update profile
   - Verify error handling
   - Test JWT expiration

2. **Implement Webinar Module**
   - Following same clean architecture pattern
   - Add role-based access control
   - Add filtering & pagination

3. **Add Logging & Monitoring**
   - Implement structured logging
   - Add error tracking

4. **Add Tests**
   - Unit tests for services
   - Integration tests for API routes
   - E2E tests for workflows

5. **Deploy**
   - Setup CI/CD pipeline
   - Prepare production environment
   - Database backup strategy
