import { Client } from 'pg'

async function assignAllUsersToCompany() {
  const connectionString = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL
  const client = new Client({ connectionString })

  try {
    await client.connect()
    console.log('Assigning users to Tanzania Logistics Ltd...\n')

    const companyId = '03b37bfd-83b0-42d2-8af7-e31436cd81cb'

    // Assign all users without company_id to this company
    const result = await client.query(`
      UPDATE users 
      SET company_id = $1 
      WHERE company_id IS NULL 
        AND deleted_at IS NULL
      RETURNING first_name, last_name, email
    `, [companyId])

    console.log(`✅ Assigned ${result.rowCount} users to Tanzania Logistics Ltd:\n`)
    result.rows.forEach((u, i) => {
      console.log(`${i + 1}. ${u.first_name} ${u.last_name} (${u.email})`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.end()
  }
}

assignAllUsersToCompany()
