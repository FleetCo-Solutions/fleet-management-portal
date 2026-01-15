# Fleet Management Portal (Admin)

Admin portal for managing multiple fleet management companies. This application allows super admins to create and manage companies, view analytics, and oversee the entire fleet management system.

## Features

- **Company Management**: Create, and manage multiple companies
- **User Management**: Manage system-wide users
- **Analytics Dashboard**: View system-wide analytics and metrics
- **Headless Architecture**: Consumes external APIs for all data operations

## Prerequisites

- Node.js 18+ and pnpm

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
   # API Base URL (Required)
   NEXT_PUBLIC_API_BASE_URL=https://solutions.fleetcotelematics.com

   # Auth Secret (Required for NextAuth session encryption)
   AUTH_SECRET=your-secret-key-here
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
│   └── auth/          # NextAuth catch-all route (proxy to external API)
└── auth.ts            # NextAuth configuration

actions/               # Server actions (API Proxies)
├── companies.ts       # Company CRUD operations
├── systemUsers.ts     # System User operations
└── passwordReset.ts   # Password reset logic

lib/
├── api-client.ts      # Core External API Client
└── api-endpoints.ts   # API URL Constants
```

## Key Technologies

- **Next.js 15.4.8**: React framework with App Router
- **NextAuth**: Authentication with JWT (Proxied to external API)
- **TanStack Query**: Data fetching and caching
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Type safety

## API Integration

This project is a **Headless Frontend** that communicates exclusively with an external backend:
- **Base URL**: `https://solutions.fleetcotelematics.com`
- **Authentication**: JWT-based. Tokens are retrieved via `/api/adminusers/login` and stored in the NextAuth session for subsequent requests.

## Known Limitations

- **Edit Functionality**: Currently disabled pending API updates for "Edit Company" and "Edit User" endpoints.
