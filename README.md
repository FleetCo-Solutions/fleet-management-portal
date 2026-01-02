# Fleet Management Portal (Admin)

Admin portal for managing multiple fleet management companies. This application allows super admins to create and manage companies, view analytics, and oversee the entire fleet management system.

## Features

- **Company Management**: Create, view, and manage multiple companies
- **User Management**: Automatically create admin users for new companies
- **Analytics Dashboard**: View system-wide analytics and metrics
- **Audit Logs**: Track all administrative actions
- **Multi-tenant Architecture**: Isolated data for each company

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (shared with fleetmanagement app)
- Resend API key (for email notifications)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fleet-management-portal
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   # Database (shared with fleetmanagement app)
   DATABASE_URL=postgresql://user:password@host:port/database
   LOCAL_DATABASE_URL=postgresql://user:password@host:port/database
   
   # Auth Secret (generate with: openssl rand -base64 32)
   AUTH_SECRET=your-secret-key-here
   
   # Email (optional, for notifications)
   RESEND_API_KEY=your-resend-api-key
   ```

4. **Set up the database**
   ```bash
   # Generate migration files
   pnpm drizzle-kit generate
   
   # Run migrations
   pnpm drizzle-kit migrate
   ```

5. **Create initial admin user** (if needed)
   ```bash
   # Use the createTestUser.sql script or create manually in database
   ```

## Running the Application

```bash
# Development mode
pnpm dev

# Production build
pnpm build
pnpm start
```

The admin portal runs on [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── admin/              # Admin dashboard and pages
│   ├── (pages)/       # Companies, analytics, settings
│   ├── components/    # Admin-specific components
│   └── layout/        # Admin layout wrapper
├── api/               # API routes
│   ├── auth/          # Authentication endpoints
│   └── companies/     # Company management APIs
├── db/                # Database schema and connection
└── auth.ts            # NextAuth configuration

actions/               # Server actions
├── companies.ts       # Company CRUD operations
└── passwordReset.ts   # Password reset logic
```

## Key Technologies

- **Next.js 15.4.8**: React framework with App Router
- **Drizzle ORM 0.44.7**: Type-safe database queries
- **NextAuth**: Authentication with JWT
- **TanStack Query**: Data fetching and caching
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Type safety

## Database Schema

### admin_companies
Stores company information

### admin_system_users
Super admin users who manage the portal

### admin_audit_logs
Tracks all administrative actions

### users (shared table)
Fleet users from the main fleetmanagement app, linked via `company_id`

## Default Credentials

**Note**: Change these immediately in production!

- When creating a new company, an admin user is auto-created with:
  - Email: company admin email
  - Password: `Welcome@123`

## Multi-tenant Architecture

- Each company has a unique `company_id` (UUID)
- All user data in the fleetmanagement database is filtered by `company_id`
- Companies are isolated and cannot access each other's data
- Admin portal manages companies; fleet app manages operations

## Related Projects

- **fleetmanagement**: Main fleet operations application (must be running on a different port)

## Development Notes

- Both applications share the same PostgreSQL database
- The portal manages companies; the fleet app manages vehicles, drivers, trips, etc.
- Authentication is handled separately in each app but uses the same user table
- Session includes `companyId` for data isolation
