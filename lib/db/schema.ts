import { serial, varchar, text, boolean, timestamp, integer, date, pgEnum, pgTable, uniqueIndex, foreignKey, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============ ENUMS ============

export const userRoleEnum = pgEnum('user_role', ['asn', 'admin', 'super_admin'])
export const webinarStatusEnum = pgEnum('webinar_status', ['draft', 'publish', 'selesai'])
export const sertifikatStatusEnum = pgEnum('sertifikat_status', ['diajukan', 'disetujui', 'ditolak'])
export const pembelajaranStatusEnum = pgEnum('pembelajaran_status', ['belum_mulai', 'proses', 'selesai'])
export const webinarQuestionTypeEnum = pgEnum('webinar_question_type', ['post_test', 'monev'])
export const pembelajaranQuestionTypeEnum = pgEnum('pembelajaran_question_type', ['pre_test', 'post_test', 'monev'])

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
    tanggal_mulai: timestamp('tanggal_mulai'),
    tanggal_selesai: timestamp('tanggal_selesai'),
    kuota: integer('kuota'),
    penyelenggara: varchar('penyelenggara', { length: 255 }),
    link_zoom: text('link_zoom'),
    link_youtube: text('link_youtube'),
    link_materi: text('link_materi'),
    link_post_test: text('link_post_test'),
    link_monev: text('link_monev'),
    template_sertifikat: text('template_sertifikat'),
    sertifikat_config: text('sertifikat_config'),
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
    nomor_sertifikat: varchar('nomor_sertifikat', { length: 255 }),
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
    tipe: varchar('tipe', { length: 20 }).default('video'),
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
    kategori: varchar('kategori', { length: 100 }).default('PENGUMUMAN/INFORMASI LAINNYA').notNull(),
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

export const carouselsTable = pgTable(
  'carousels',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    subtitle: text('subtitle'),
    image: text('image').notNull(),
    link: text('link'),
    cta_text: varchar('cta_text', { length: 50 }).default('Lihat Detail'),
    is_active: boolean('is_active').default(true).notNull(),
    order: integer('order').default(0).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  }
)

export const webinarQuestionsTable = pgTable(
  'webinar_questions',
  {
    id: serial('id').primaryKey(),
    webinar_id: integer('webinar_id').notNull(),
    type: webinarQuestionTypeEnum('type').notNull(),
    question_text: text('question_text').notNull(),
    order: integer('order').default(0).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    webinarFk: foreignKey({ columns: [table.webinar_id], foreignColumns: [webinarsTable.id] }).onDelete('cascade'),
    webinarIdIdx: index('webinar_questions_webinar_id_idx').on(table.webinar_id),
  })
)

export const webinarOptionsTable = pgTable(
  'webinar_options',
  {
    id: serial('id').primaryKey(),
    question_id: integer('question_id').notNull(),
    option_text: text('option_text').notNull(),
    is_correct: boolean('is_correct').default(false).notNull(),
    order: integer('order').default(0).notNull(),
  },
  (table) => ({
    questionFk: foreignKey({ columns: [table.question_id], foreignColumns: [webinarQuestionsTable.id] }).onDelete('cascade'),
    questionIdIdx: index('webinar_options_question_id_idx').on(table.question_id),
  })
)

export const webinarUserAnswersTable = pgTable(
  'webinar_user_answers',
  {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').notNull(),
    webinar_id: integer('webinar_id').notNull(),
    question_id: integer('question_id').notNull(),
    option_id: integer('option_id').notNull(),
    type: webinarQuestionTypeEnum('type').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userFk: foreignKey({ columns: [table.user_id], foreignColumns: [usersTable.id] }).onDelete('cascade'),
    webinarFk: foreignKey({ columns: [table.webinar_id], foreignColumns: [webinarsTable.id] }).onDelete('cascade'),
    questionFk: foreignKey({ columns: [table.question_id], foreignColumns: [webinarQuestionsTable.id] }).onDelete('cascade'),
    optionFk: foreignKey({ columns: [table.option_id], foreignColumns: [webinarOptionsTable.id] }).onDelete('cascade'),
    userWebinarIdx: index('webinar_user_answers_user_webinar_idx').on(table.user_id, table.webinar_id),
  })
)

export const webinarAttendancesTable = pgTable(
  'webinar_attendances',
  {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').notNull(),
    webinar_id: integer('webinar_id').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userFk: foreignKey({ columns: [table.user_id], foreignColumns: [usersTable.id] }).onDelete('cascade'),
    webinarFk: foreignKey({ columns: [table.webinar_id], foreignColumns: [webinarsTable.id] }).onDelete('cascade'),
    userWebinarIdx: uniqueIndex('webinar_attendances_user_webinar_idx').on(table.user_id, table.webinar_id),
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
  questions: many(webinarQuestionsTable),
  userAnswers: many(webinarUserAnswersTable),
  attendances: many(webinarAttendancesTable),
}))

export const webinarAttendancesRelations = relations(webinarAttendancesTable, ({ one }) => ({
  user: one(usersTable, { fields: [webinarAttendancesTable.user_id], references: [usersTable.id] }),
  webinar: one(webinarsTable, { fields: [webinarAttendancesTable.webinar_id], references: [webinarsTable.id] }),
}))

export const webinarQuestionsRelations = relations(webinarQuestionsTable, ({ one, many }) => ({
  webinar: one(webinarsTable, { fields: [webinarQuestionsTable.webinar_id], references: [webinarsTable.id] }),
  options: many(webinarOptionsTable),
}))

export const webinarOptionsRelations = relations(webinarOptionsTable, ({ one }) => ({
  question: one(webinarQuestionsTable, { fields: [webinarOptionsTable.question_id], references: [webinarQuestionsTable.id] }),
}))

export const webinarUserAnswersRelations = relations(webinarUserAnswersTable, ({ one }) => ({
  user: one(usersTable, { fields: [webinarUserAnswersTable.user_id], references: [usersTable.id] }),
  webinar: one(webinarsTable, { fields: [webinarUserAnswersTable.webinar_id], references: [webinarsTable.id] }),
  question: one(webinarQuestionsTable, { fields: [webinarUserAnswersTable.question_id], references: [webinarQuestionsTable.id] }),
  option: one(webinarOptionsTable, { fields: [webinarUserAnswersTable.option_id], references: [webinarOptionsTable.id] }),
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

// ============ PEMBELAJARAN QUESTIONS ============

export const pembelajaranQuestionsTable = pgTable(
  'pembelajaran_questions',
  {
    id: serial('id').primaryKey(),
    pembelajaran_id: integer('pembelajaran_id').notNull(),
    type: pembelajaranQuestionTypeEnum('type').notNull(),
    question_text: text('question_text').notNull(),
    order: integer('order').default(0).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    pembelajaranFk: foreignKey({ columns: [table.pembelajaran_id], foreignColumns: [pembelajaranTable.id] }).onDelete('cascade'),
    pembelajaranIdIdx: index('pembelajaran_questions_pembelajaran_id_idx').on(table.pembelajaran_id),
  })
)

export const pembelajaranOptionsTable = pgTable(
  'pembelajaran_options',
  {
    id: serial('id').primaryKey(),
    question_id: integer('question_id').notNull(),
    option_text: text('option_text').notNull(),
    is_correct: boolean('is_correct').default(false).notNull(),
    order: integer('order').default(0).notNull(),
  },
  (table) => ({
    questionFk: foreignKey({ columns: [table.question_id], foreignColumns: [pembelajaranQuestionsTable.id] }).onDelete('cascade'),
    questionIdIdx: index('pembelajaran_options_question_id_idx').on(table.question_id),
  })
)

export const pembelajaranUserAnswersTable = pgTable(
  'pembelajaran_user_answers',
  {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').notNull(),
    pembelajaran_id: integer('pembelajaran_id').notNull(),
    question_id: integer('question_id').notNull(),
    option_id: integer('option_id').notNull(),
    type: pembelajaranQuestionTypeEnum('type').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userFk: foreignKey({ columns: [table.user_id], foreignColumns: [usersTable.id] }).onDelete('cascade'),
    pembelajaranFk: foreignKey({ columns: [table.pembelajaran_id], foreignColumns: [pembelajaranTable.id] }).onDelete('cascade'),
    questionFk: foreignKey({ columns: [table.question_id], foreignColumns: [pembelajaranQuestionsTable.id] }).onDelete('cascade'),
    optionFk: foreignKey({ columns: [table.option_id], foreignColumns: [pembelajaranOptionsTable.id] }).onDelete('cascade'),
    userPembelajaranIdx: index('pembelajaran_user_answers_user_pembelajaran_idx').on(table.user_id, table.pembelajaran_id),
  })
)

// ============ PEMBELAJARAN QUESTION RELATIONS ============

export const pembelajaranQuestionsRelations = relations(pembelajaranQuestionsTable, ({ one, many }) => ({
  pembelajaran: one(pembelajaranTable, { fields: [pembelajaranQuestionsTable.pembelajaran_id], references: [pembelajaranTable.id] }),
  options: many(pembelajaranOptionsTable),
}))

export const pembelajaranOptionsRelations = relations(pembelajaranOptionsTable, ({ one }) => ({
  question: one(pembelajaranQuestionsTable, { fields: [pembelajaranOptionsTable.question_id], references: [pembelajaranQuestionsTable.id] }),
}))

export const pembelajaranUserAnswersRelations = relations(pembelajaranUserAnswersTable, ({ one }) => ({
  user: one(usersTable, { fields: [pembelajaranUserAnswersTable.user_id], references: [usersTable.id] }),
  pembelajaran: one(pembelajaranTable, { fields: [pembelajaranUserAnswersTable.pembelajaran_id], references: [pembelajaranTable.id] }),
  question: one(pembelajaranQuestionsTable, { fields: [pembelajaranUserAnswersTable.question_id], references: [pembelajaranQuestionsTable.id] }),
  option: one(pembelajaranOptionsTable, { fields: [pembelajaranUserAnswersTable.option_id], references: [pembelajaranOptionsTable.id] }),
}))
