import 'dotenv/config'
import { db } from '../lib/db'
import { webinarsTable } from '../lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

async function main() {
    console.log('=== Update Overdue Webinars to Selesai ===')
    console.log(`Start: ${new Date().toISOString()}`)
    
    try {
        const now = new Date()
        console.log(`Current time: ${now.toISOString()}`)
        
        // First check what webinars would be updated using raw SQL
        const webinars = await db.execute(sql`
            SELECT id, nama_webinar, status, tanggal_selesai 
            FROM webinars 
            WHERE status = 'publish' 
            AND tanggal_selesai < ${now.toISOString()}
        `)
        
        console.log(`Found ${webinars.length} webinar(s) to update:`)
        for (const w of webinars) {
            console.log(`  - id=${w.id}: ${w.nama_webinar} (status=${w.status}, end=${w.tanggal_selesai})`)
        }
        
        if (webinars.length > 0) {
            // Use raw SQL for update
            await db.execute(sql`
                UPDATE webinars 
                SET status = 'selesai', updated_at = ${new Date().toISOString()}
                WHERE status = 'publish' 
                AND tanggal_selesai < ${now.toISOString()}
            `)
            console.log(`Updated ${webinars.length} webinar(s) to 'selesai'`)
        } else {
            console.log('No webinars to update')
        }
        
        console.log(`Done: ${new Date().toISOString()}`)
        process.exit(0)
    } catch (error) {
        console.error('Error:', error)
        process.exit(1)
    }
}

main()