import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined')
}

const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 })

async function main() {
    console.log('⏳ Running migrations...')
    
    const start = Date.now()
    
    try {
        await migrate(drizzle(migrationClient), {
            migrationsFolder: 'drizzle',
        })
        
        const end = Date.now()
        console.log(`✅ Migrations completed in ${end - start}ms`)
    } catch (error) {
        console.error('❌ Migration failed:')
        console.error(error)
        process.exit(1)
    } finally {
        await migrationClient.end()
    }
}

main()
