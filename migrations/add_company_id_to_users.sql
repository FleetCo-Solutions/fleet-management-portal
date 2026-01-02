-- Add company_id column to users table
-- This links users to companies in the admin portal

ALTER TABLE users 
ADD COLUMN company_id UUID;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS company_idx ON users(company_id);

-- Update comment
COMMENT ON COLUMN users.company_id IS 'References admin_companies.id - links user to their company';
