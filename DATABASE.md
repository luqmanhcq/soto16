DATABASE.md

SI-SOTO — Database Design (PostgreSQL + Drizzle ORM)

---

⚠️ AI DATABASE RULES (WAJIB)

AI HARUS mengikuti aturan ini:

1. Gunakan PostgreSQL + Drizzle ORM
2. Gunakan snake_case untuk SEMUA nama
3. Semua tabel wajib punya:
   - id (primary key)
   - created_at
   - updated_at
4. Semua relasi WAJIB pakai foreign key
5. Gunakan ENUM untuk field status (JANGAN string bebas)
6. Gunakan index untuk field penting
7. DILARANG:
   - Tanpa FK
   - Tanpa index di field penting
   - Gunakan naming selain snake_case

---

1. GLOBAL CONVENTION

Naming

- Table: snake_case
- Column: snake_case
- PK: id
- FK: {table}_id

Timestamp

- created_at → default now()
- updated_at → auto update

---

2. ENUM DEFINITIONS (WAJIB)

user_role

- asn
- admin
- super_admin

webinar_status

- draft
- publish
- selesai

sertifikat_status

- diajukan
- disetujui
- ditolak

pembelajaran_status

- belum_mulai
- proses
- selesai

---

3. TABLE DEFINITIONS

---

🔹 users

id SERIAL PRIMARY KEY
nip VARCHAR(18) UNIQUE NOT NULL
nama VARCHAR(255) NOT NULL
email VARCHAR(100) UNIQUE NOT NULL
password TEXT NOT NULL
jabatan VARCHAR(100)
golongan VARCHAR(50)
unit_kerja VARCHAR(255)

role user_role DEFAULT 'asn'
is_active BOOLEAN DEFAULT TRUE

created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

Index:

- email (unique)
- nip (unique)

---

🔹 webinars

id SERIAL PRIMARY KEY
nama_webinar VARCHAR(255) NOT NULL
slug VARCHAR(255) UNIQUE NOT NULL
kategori VARCHAR(100)
deskripsi TEXT
narasumber VARCHAR(255)

jumlah_jp INTEGER
nilai_min INTEGER

tanggal_mulai DATE
tanggal_selesai DATE

kuota INTEGER
penyelenggara VARCHAR(255)

link_daftar TEXT
link_zoom TEXT
link_youtube TEXT
link_materi TEXT
link_post_test TEXT

gambar TEXT

status webinar_status DEFAULT 'draft'

created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

Index:

- slug (unique)

---

🔹 webinar_participants

id SERIAL PRIMARY KEY
user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
webinar_id INT NOT NULL REFERENCES webinars(id) ON DELETE CASCADE

created_at TIMESTAMP DEFAULT NOW()

Constraint:

- UNIQUE (user_id, webinar_id)

---

🔹 pembelajaran

id SERIAL PRIMARY KEY
nama VARCHAR(255) NOT NULL
slug VARCHAR(255) UNIQUE NOT NULL
kategori VARCHAR(100)
deskripsi TEXT

jumlah_jp INTEGER
gambar TEXT

link_pretest TEXT
link_posttest TEXT

created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

---

🔹 materi

id SERIAL PRIMARY KEY
pembelajaran_id INT NOT NULL REFERENCES pembelajaran(id) ON DELETE CASCADE

nama VARCHAR(255) NOT NULL
urutan INTEGER NOT NULL

link_file TEXT
link_video TEXT

created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

Index:

- pembelajaran_id

---

🔹 pembelajaran_progress

id SERIAL PRIMARY KEY
user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
pembelajaran_id INT NOT NULL REFERENCES pembelajaran(id) ON DELETE CASCADE

status pembelajaran_status DEFAULT 'belum_mulai'
progress INTEGER DEFAULT 0

tanggal_selesai TIMESTAMP

created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

Constraint:

- UNIQUE (user_id, pembelajaran_id)

---

🔹 sertifikat_usulan

id SERIAL PRIMARY KEY
user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE

nama_diklat VARCHAR(255) NOT NULL
tanggal_pelaksanaan DATE

jumlah_jp INTEGER
penyelenggara VARCHAR(255)

status sertifikat_status DEFAULT 'diajukan'

file_usulan TEXT
file_sertifikat TEXT

created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

Index:

- user_id

---

🔹 pengumuman

id SERIAL PRIMARY KEY
judul VARCHAR(255) NOT NULL
slug VARCHAR(255) UNIQUE NOT NULL

deskripsi TEXT
gambar TEXT
link_file TEXT

created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()

---

4. RELATIONSHIPS

- users ↔ webinars → webinar_participants (many-to-many)
- users → pembelajaran_progress → pembelajaran
- pembelajaran → materi (one-to-many)
- users → sertifikat_usulan (one-to-many)

---

5. INDEXING RULES (WAJIB)

AI WAJIB menambahkan index pada:

- users.email
- users.nip
- webinars.slug
- pembelajaran.slug
- semua foreign key

---

6. TRANSACTION RULE

Gunakan transaction jika:

- Insert lebih dari 1 tabel
- Update + insert bersamaan

---

7. AI IMPLEMENTATION RULE

Saat generate Drizzle schema:

WAJIB:

- Gunakan enum untuk status
- Gunakan relations()
- Gunakan index()
- Gunakan default value

DILARANG:

- Gunakan string bebas untuk status
- Tidak pakai relasi
- Tidak pakai index

---

🚀 FINAL NOTE

Database ini adalah:

- Sudah normalized
- Siap production
- AI-friendly
- Siap generate backend otomatis

Jika AI melanggar aturan ini → ERROR