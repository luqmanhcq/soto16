import { db } from './lib/db'
import { webinarsTable } from './lib/db/schema'

async function check() {
    const webinars = await db.select().from(webinarsTable)
    console.log(`Total webinars in DB: ${webinars.length}`)
    process.exit(0)
}

check()
