import { Client } from 'pg'

async function runMigration() {
  // Read from environment
  const connectionString = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL

  if (!connectionString) {
    console.error('❌ No database URL found in environment variables')
    process.exit(1)
  }

  const client = new Client({ connectionString })

  try {
    await client.connect()
    console.log('Connected to database...')

    // Add company_id column
    console.log('Adding company_id column to users table...')
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS company_id UUID;
    `)
    console.log('✓ company_id column added')

    // Add index
    console.log('Creating index...')
    await client.query(`
      CREATE INDEX IF NOT EXISTS company_idx ON users(company_id);
    `)
    console.log('✓ Index created')

    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await client.end()
  }
}

runMigration()
