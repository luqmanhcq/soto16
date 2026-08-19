import 'dotenv/config'
import { db } from '../lib/db'
import { sql } from 'drizzle-orm'

async function test() {
    try {
        const version = await db.execute(sql`SELECT version()`)
        console.log('VERSION:', JSON.stringify(version))

        try {
            const r1 = await db.execute(sql`SELECT json_build_array(1, 1, 'a', true, 1)`)
            console.log('json_build_array(5 args):', JSON.stringify(r1))
        } catch (e: any) {
            console.log('json_build_array(5 args) ERROR:', e?.cause?.message || e?.message)
        }

        try {
            const r2 = await db.execute(sql`SELECT json_build_array(1, 'a', true)`)
            console.log('json_build_array(3 args):', JSON.stringify(r2))
        } catch (e: any) {
            console.log('json_build_array(3 args) ERROR:', e?.cause?.message || e?.message)
        }

        try {
            const r3 = await db.execute(sql`SELECT json_agg(json_build_array(id)) FROM users LIMIT 1`)
            console.log('json_agg with json_build_array(1 arg):', JSON.stringify(r3))
        } catch (e: any) {
            console.log('json_agg ERROR:', e?.cause?.message || e?.message)
        }
    } catch (error) {
        console.error('ERROR:', error)
    } finally {
        process.exit(0)
    }
}

test()