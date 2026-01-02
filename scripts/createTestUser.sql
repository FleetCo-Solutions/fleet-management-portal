-- Create a test admin user for the Fleet Management Portal
-- Password: Admin@123
-- Run this in your Supabase SQL Editor

INSERT INTO admin_system_users (
  first_name, 
  last_name, 
  email, 
  password_hash, 
  role, 
  status,
  department,
  created_at
) VALUES (
  'Admin',
  'User',
  'admin@fleetco.com',
  '$2b$10$qmriEZZl7DyInA4bDRt7CuEyW6dmJDp7G2HbrHTyenaIEg9UYGBMm',
  'super_admin',
  'active',
  'IT',
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify the user was created
SELECT id, first_name, last_name, email, role, status 
FROM admin_system_users 
WHERE email = 'admin@fleetco.com';
