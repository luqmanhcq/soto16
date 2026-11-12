import 'dotenv/config'
import { db } from '../lib/db'
import { siasnRiwayatSyncTable } from '../lib/db/schema'
import { sql } from 'drizzle-orm'
import { siasnKursusService } from '../lib/services/siasn-kursus.service'

async function pendingCount(): Promise<number> {
  const r = await db.select({ c: sql<number>`count(*)` }).from(siasnRiwayatSyncTable)
    .where(sql`${siasnRiwayatSyncTable.status} = 'synced' AND ${siasnRiwayatSyncTable.error_msg} LIKE 'FILE_PENDING:%'`)
  return Number((r[0] as any)?.c || 0)
}

async function main() {
  const BATCH = 3
  const MAX_ROUNDS = 120
  let totalDone = 0
  let noProgressRounds = 0
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const left = await pendingCount()
    console.log(`\n=== ronde ${round}: sisa ${left} ===`)
    if (left === 0) break
    const res = await siasnKursusService.retryPendingFiles(BATCH)
    totalDone += res.done
    for (const d of res.details) console.log(` - ${d.nip}: ${d.ok ? 'OK' : 'GAGAL'} ${d.message || ''}`)
    if (res.done === 0) {
      noProgressRounds++
      if (noProgressRounds >= 4) {
        console.log('4 ronde tanpa kemajuan (BKN kemungkinan down). Jeda 3 menit lalu lanjut...')
        await new Promise(r => setTimeout(r, 180000))
        noProgressRounds = 0
      } else {
        await new Promise(r => setTimeout(r, 15000))
      }
    } else {
      noProgressRounds = 0
    }
  }
  const left = await pendingCount()
  console.log(`\nSELESAI. file tersusul sesi ini: ${totalDone}, sisa: ${left}`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
