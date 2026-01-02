import { Client } from 'pg'

async function assignUsersToCompany() {
  const connectionString = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL
  if (!connectionString) {
    console.error('❌ No database URL found')
    process.exit(1)
  }

  const client = new Client({ connectionString })

  try {
    await client.connect()
    console.log('Connected to database...\n')

    // Show all companies
    console.log('📋 Available Companies:')
    const companies = await client.query('SELECT id, name FROM admin_companies ORDER BY name')
    companies.rows.forEach((c, i) => {
      console.log(`${i + 1}. ${c.name} (${c.id})`)
    })

    // Show all users without company_id
    console.log('\n👥 Users without company assignment:')
    const users = await client.query(`
      SELECT id, first_name, last_name, email 
      FROM users 
      WHERE company_id IS NULL AND deleted_at IS NULL
      ORDER BY first_name
    `)
    
    if (users.rows.length === 0) {
      console.log('No users found without company assignment')
    } else {
      users.rows.forEach((u, i) => {
        console.log(`${i + 1}. ${u.first_name} ${u.last_name} (${u.email})`)
      })
    }

    console.log('\n💡 To assign users to a company, run:')
    console.log('UPDATE users SET company_id = \'<company-id>\' WHERE email = \'<user-email>\';')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.end()
  }
}

assignUsersToCompany()
