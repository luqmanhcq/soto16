import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { usersTable } from './schema'
import * as schema from './schema'

const sql = postgres(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function main() {
    console.log('--- SEEDING USERS ---')

    // Hash common password
    const hashedPassword = await bcrypt.hash('password123', 10)

    // 1. Super Admin
    const superAdmin = {
        nip: '198001012000011001',
        nama: 'Super Admin SI-SOTO',
        email: 'superadmin@soto.go.id',
        password: hashedPassword,
        jabatan: 'Koordinator Global',
        golongan: 'IV/e',
        unit_kerja: 'Biro SDM Pusat',
        role: 'super_admin' as const,
    }

    // 2. Admin Instansi
    const adminInstansi = {
        nip: '198505052010011005',
        nama: 'Admin BKD Kota SOTO',
        email: 'admin@bkd.go.id',
        password: hashedPassword,
        jabatan: 'Pranata Komputer Madya',
        golongan: 'IV/a',
        unit_kerja: 'BKD Kota SOTO',
        role: 'admin' as const,
    }

    // 3. User ASN
    const userAsn = {
        nip: '199512122020011012',
        nama: 'Ahmad ASN Teladan',
        email: 'asn@example.com',
        password: hashedPassword,
        jabatan: 'Analis Kebijakan Pertama',
        golongan: 'III/a',
        unit_kerja: 'Dinas Komunikasi dan Informatika',
        role: 'asn' as const,
    }

    const users = [superAdmin, adminInstansi, userAsn]

    for (const user of users) {
        try {
            const existing = await db.query.usersTable.findFirst({
                where: (u, { eq }) => eq(u.email, user.email),
            })

            if (existing) {
                console.log(`User ${user.email} already exists, skipping.`)
                continue
            }

            await db.insert(usersTable).values(user)
            console.log(`Created user: ${user.nama} (${user.role})`)
        } catch (error) {
            console.error(`Error creating user ${user.email}:`, error)
        }
    }

    // --- SEEDING WEBINARS ---
    console.log('--- SEEDING WEBINARS ---')
    const webinars = [
        {
            nama_webinar: 'Transformasi Pelayanan Publik Digital',
            slug: 'transformasi-pelayanan-publik-digital',
            kategori: 'Teknologi Informasi',
            deskripsi: 'Membahas strategi percepatan transformasi digital di lingkungan instansi pemerintah sesuai SPBE.',
            narasumber: 'Bapak Rudiantara',
            jumlah_jp: 5,
            tanggal_mulai: '2026-04-15',
            tanggal_selesai: '2026-04-15',
            kuota: 100,
            penyelenggara: 'Dinas Kominfo',
            jenis_webinar: 'internal' as const,
            status: 'publish' as const,
            gambar: 'https://images.unsplash.com/photo-1573163281534-10d8479e3966?q=80&w=800'
        },
        {
            nama_webinar: 'Kepemimpinan Melayani di Era VUCA',
            slug: 'kepemimpinan-melayani-era-vuca',
            kategori: 'Leadership',
            deskripsi: 'Mengembangkan mindset kepemimpinan yang adaptif dan melayani untuk meningkatkan performa tim.',
            narasumber: 'Ibu Najwa Shihab',
            jumlah_jp: 3,
            tanggal_mulai: '2026-04-20',
            tanggal_selesai: '2026-04-20',
            kuota: 250,
            penyelenggara: 'BKD Provinsi',
            jenis_webinar: 'external' as const,
            status: 'publish' as const,
            gambar: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800'
        },
        {
            nama_webinar: 'Manajemen Keuangan Daerah Berbasis Akrual',
            slug: 'manajemen-keuangan-daerah',
            kategori: 'Keuangan Negara',
            deskripsi: 'Penyusunan laporan keuangan dengan standar akrual terbaru untuk akuntabilitas tinggi.',
            narasumber: 'Tim BPKP',
            jumlah_jp: 8,
            tanggal_mulai: '2026-05-10',
            tanggal_selesai: '2026-05-12',
            kuota: 50,
            penyelenggara: 'BPKAD',
            jenis_webinar: 'internal' as const,
            status: 'publish' as const,
            gambar: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800'
        }
    ]

    for (const webinar of webinars) {
        try {
            const existing = await db.query.webinarsTable.findFirst({
                where: (w, { eq }) => eq(w.slug, webinar.slug)
            })
            if (!existing) {
                await db.insert(schema.webinarsTable).values(webinar)
                console.log(`Created webinar: ${webinar.nama_webinar}`)
            }
        } catch (error) {
            console.error(`Error creating webinar ${webinar.nama_webinar}:`, error)
        }
    }

    // --- SEEDING PEMBELAJARAN ---
    console.log('--- SEEDING PEMBELAJARAN ---')
    const courses = [
        {
            nama: 'Dasar-dasar Cybersecurity untuk ASN',
            slug: 'cybersecurity-asn',
            kategori: 'Teknologi Informasi',
            deskripsi: 'Proteksi data pribadi dan instansi dari ancaman phising dan ransomware.',
            jumlah_jp: 10,
            gambar: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800'
        },
        {
            nama: 'Etika Komunikasi Publik dan Social Media',
            slug: 'etika-komunikasi-publik',
            kategori: 'Admin & Kebijakan',
            deskripsi: 'Panduan bersosial media bagi Aparatur Sipil Negara sesuai kode etik.',
            jumlah_jp: 4,
            gambar: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800'
        }
    ]

    for (const course of courses) {
        try {
            const existing = await db.query.pembelajaranTable.findFirst({
                where: (p, { eq }) => eq(p.slug, course.slug)
            })
            if (!existing) {
                await db.insert(schema.pembelajaranTable).values(course)
                console.log(`Created course: ${course.nama}`)
            }
        } catch (error) {
            console.error(`Error creating course ${course.nama}:`, error)
        }
    }

    console.log('--- SEEDING COMPLETED ---')
    process.exit(0)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
