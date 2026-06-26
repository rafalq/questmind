import * as dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

dotenv.config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const db = drizzle(pool)

async function main() {
  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './src/db/migration' })
  console.log('Migrations complete!')
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
