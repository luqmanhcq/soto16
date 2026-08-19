import 'dotenv/config'
import { db } from '../lib/db'
import { sql } from 'drizzle-orm'

async function createTables() {
    try {
        // pembelajaran_participants
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS pembelajaran_participants (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                pembelajaran_id INTEGER NOT NULL REFERENCES pembelajaran(id) ON DELETE CASCADE,
                enrolled_at TIMESTAMP DEFAULT NOW() NOT NULL,
                status VARCHAR(20) DEFAULT 'aktif' NOT NULL,
                UNIQUE (user_id, pembelajaran_id)
            );
        `)
        console.log('pembelajaran_participants table created')

        // pembelajaran_sertifikat
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS pembelajaran_sertifikat (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                pembelajaran_id INTEGER NOT NULL REFERENCES pembelajaran(id) ON DELETE CASCADE,
                nip VARCHAR(18) NOT NULL,
                nama VARCHAR(255) NOT NULL,
                jabatan VARCHAR(100),
                unit_kerja VARCHAR(255),
                nama_pembelajaran VARCHAR(255) NOT NULL,
                jumlah_jp INTEGER,
                pre_test_score INTEGER,
                post_test_score INTEGER,
                nomor_sertifikat VARCHAR(255) NOT NULL,
                file_sertifikat TEXT,
                tanggal_kelulusan TIMESTAMP DEFAULT NOW() NOT NULL,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
                UNIQUE (user_id, pembelajaran_id)
            );
        `)
        console.log('pembelajaran_sertifikat table created')

        console.log('All tables created successfully')
    } catch (error) {
        console.error('Error creating tables:', error)
    } finally {
        process.exit(0)
    }
}

createTables()