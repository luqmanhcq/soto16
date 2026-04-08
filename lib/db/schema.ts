import { serial, varchar, text, boolean, timestamp, integer, date, pgEnum, pgTable, uniqueIndex, foreignKey, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============ ENUMS ============

export const userRoleEnum = pgEnum('user_role', ['asn', 'admin', 'super_admin'])
export const webinarStatusEnum = pgEnum('webinar_status', ['draft', 'publish', 'selesai'])
export const webinarJenisEnum = pgEnum('webinar_jenis', ['internal', 'external'])
export const sertifikatStatusEnum = pgEnum('sertifikat_status', ['diajukan', 'disetujui', 'ditolak'])
export const pembelajaranStatusEnum = pgEnum('pembelajaran_status', ['belum_mulai', 'proses', 'selesai'])

// ============ TABLES ============

export const usersTable = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    nip: varchar('nip', { length: 18 }).notNull().unique(),
    nama: varchar('nama', { length: 255 }).notNull(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    password: text('password').notNull(),
    jabatan: varchar('jabatan', { length: 100 }),
    golongan: varchar('golongan', { length: 50 }),
    unit_kerja: varchar('unit_kerja', { length: 255 }),
    role: userRoleEnum('role').default('asn').notNull(),
    is_active: boolean('is_active').default(true).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    nipIdx: uniqueIndex('users_nip_idx').on(table.nip),
  })
)

export const webinarsTable = pgTable(
  'webinars',
  {
    id: serial('id').primaryKey(),
    nama_webinar: varchar('nama_webinar', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    kategori: varchar('kategori', { length: 100 }),
    deskripsi: text('deskripsi'),
    narasumber: text('narasumber'),
    jumlah_jp: integer('jumlah_jp'),
    nilai_min: integer('nilai_min'),
    tanggal_mulai: date('tanggal_mulai'),
    tanggal_selesai: date('tanggal_selesai'),
    kuota: integer('kuota'),
    penyelenggara: varchar('penyelenggara', { length: 255 }),
    jenis_webinar: webinarJenisEnum('jenis_webinar').default('external').notNull(),
    link_daftar: text('link_daftar'),
    link_zoom: text('link_zoom'),
    link_youtube: text('link_youtube'),
    link_materi: text('link_materi'),
    link_post_test: text('link_post_test'),
    link_monev: text('link_monev'),
    link_sertifikat: text('link_sertifikat'),
    gambar: text('gambar'),
    status: webinarStatusEnum('status').default('draft').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('webinars_slug_idx').on(table.slug),
  })
)

export const webinarParticipantsTable = pgTable(
  'webinar_participants',
  {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').notNull(),
    webinar_id: integer('webinar_id').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userFk: foreignKey({ columns: [table.user_id], foreignColumns: [usersTable.id] }).onDelete('cascade'),
    webinarFk: foreignKey({ columns: [table.webinar_id], foreignColumns: [webinarsTable.id] }).onDelete('cascade'),
    userWebinarIdx: uniqueIndex('webinar_participants_user_webinar_idx').on(table.user_id, table.webinar_id),
  })
)

export const pembelajaranTable = pgTable(
  'pembelajaran',
  {
    id: serial('id').primaryKey(),
    nama: varchar('nama', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    kategori: varchar('kategori', { length: 100 }),
    deskripsi: text('deskripsi'),
    jumlah_jp: integer('jumlah_jp'),
    gambar: text('gambar'),
    link_pretest: text('link_pretest'),
    link_posttest: text('link_posttest'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('pembelajaran_slug_idx').on(table.slug),
  })
)

export const materiTable = pgTable(
  'materi',
  {
    id: serial('id').primaryKey(),
    pembelajaran_id: integer('pembelajaran_id').notNull(),
    nama: varchar('nama', { length: 255 }).notNull(),
    urutan: integer('urutan').notNull(),
    link_file: text('link_file'),
    link_video: text('link_video'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    pembelajaranFk: foreignKey({ columns: [table.pembelajaran_id], foreignColumns: [pembelajaranTable.id] }).onDelete('cascade'),
    pembelajaranIdIdx: index('materi_pembelajaran_id_idx').on(table.pembelajaran_id),
  })
)

export const pembelajaranProgressTable = pgTable(
  'pembelajaran_progress',
  {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').notNull(),
    pembelajaran_id: integer('pembelajaran_id').notNull(),
    status: pembelajaranStatusEnum('status').default('belum_mulai').notNull(),
    progress: integer('progress').default(0).notNull(),
    tanggal_selesai: timestamp('tanggal_selesai'),
    current_materi_id: integer('current_materi_id'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userFk: foreignKey({ columns: [table.user_id], foreignColumns: [usersTable.id] }).onDelete('cascade'),
    pembelajaranFk: foreignKey({ columns: [table.pembelajaran_id], foreignColumns: [pembelajaranTable.id] }).onDelete('cascade'),
    userPembelajaranIdx: uniqueIndex('pembelajaran_progress_user_pembelajaran_idx').on(table.user_id, table.pembelajaran_id),
  })
)

export const sertifikatUsulanTable = pgTable(
  'sertifikat_usulan',
  {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').notNull(),
    nama_diklat: varchar('nama_diklat', { length: 255 }).notNull(),
    tanggal_pelaksanaan: date('tanggal_pelaksanaan'),
    jumlah_jp: integer('jumlah_jp'),
    penyelenggara: varchar('penyelenggara', { length: 255 }),
    status: sertifikatStatusEnum('status').default('diajukan').notNull(),
    file_usulan: text('file_usulan'),
    file_sertifikat: text('file_sertifikat'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userFk: foreignKey({ columns: [table.user_id], foreignColumns: [usersTable.id] }).onDelete('cascade'),
    userIdIdx: index('sertifikat_usulan_user_id_idx').on(table.user_id),
  })
)

export const pengumumanTable = pgTable(
  'pengumuman',
  {
    id: serial('id').primaryKey(),
    judul: varchar('judul', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    deskripsi: text('deskripsi'),
    gambar: text('gambar'),
    link_file: text('link_file'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('pengumuman_slug_idx').on(table.slug),
  })
)

// ============ RELATIONS ============

export const usersRelations = relations(usersTable, ({ many }) => ({
  webinar_participants: many(webinarParticipantsTable),
  pembelajaran_progress: many(pembelajaranProgressTable),
  sertifikat_usulan: many(sertifikatUsulanTable),
}))

export const webinarsRelations = relations(webinarsTable, ({ many }) => ({
  participants: many(webinarParticipantsTable),
}))

export const webinarParticipantsRelations = relations(webinarParticipantsTable, ({ one }) => ({
  user: one(usersTable, { fields: [webinarParticipantsTable.user_id], references: [usersTable.id] }),
  webinar: one(webinarsTable, { fields: [webinarParticipantsTable.webinar_id], references: [webinarsTable.id] }),
}))

export const pembelajaranRelations = relations(pembelajaranTable, ({ many }) => ({
  materials: many(materiTable),
  progress: many(pembelajaranProgressTable),
}))

export const materiRelations = relations(materiTable, ({ one }) => ({
  pembelajaran: one(pembelajaranTable, { fields: [materiTable.pembelajaran_id], references: [pembelajaranTable.id] }),
}))

export const pembelajaranProgressRelations = relations(pembelajaranProgressTable, ({ one }) => ({
  user: one(usersTable, { fields: [pembelajaranProgressTable.user_id], references: [usersTable.id] }),
  pembelajaran: one(pembelajaranTable, { fields: [pembelajaranProgressTable.pembelajaran_id], references: [pembelajaranTable.id] }),
}))

export const sertifikatUsulanRelations = relations(sertifikatUsulanTable, ({ one }) => ({
  user: one(usersTable, { fields: [sertifikatUsulanTable.user_id], references: [usersTable.id] }),
}))
