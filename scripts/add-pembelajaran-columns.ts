import 'dotenv/config'
import { db } from '../lib/db'
import { sql } from 'drizzle-orm'

async function addColumns() {
    try {
        // Add columns with default (PostgreSQL doesn't allow IF NOT EXISTS with NOT NULL in one statement)
        try { await db.execute(sql`ALTER TABLE pembelajaran ADD COLUMN pre_test_duration INTEGER DEFAULT 30;`) } catch {}
        try { await db.execute(sql`ALTER TABLE pembelajaran ADD COLUMN post_test_duration INTEGER DEFAULT 60;`) } catch {}
        // Then set NOT NULL
        try { await db.execute(sql`ALTER TABLE pembelajaran ALTER COLUMN pre_test_duration SET NOT NULL;`) } catch {}
        try { await db.execute(sql`ALTER TABLE pembelajaran ALTER COLUMN post_test_duration SET NOT NULL;`) } catch {}
        console.log('Columns added successfully')
    } catch (error) {
        console.error('Error adding columns:', error)
    } finally {
        process.exit(0)
    }
}

addColumns()