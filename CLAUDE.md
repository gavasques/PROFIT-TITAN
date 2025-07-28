# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Base Documentation

**Always reference `replit.md`** - This is the foundational documentation that contains the complete system overview, architecture details, and recent development history. The replit.md file is the primary source of truth for understanding this codebase and should be consulted first when working on any task.

## Development Commands

```bash
# Development
npm run dev              # Start development server (simplified - no --env-file needed)
npm run check           # Type checking
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:push         # Push schema changes to database

# Development with Mock Auth (automatic when NODE_ENV=development)
# Set SKIP_AUTH=true for local development without real JWT validation
```

## Architecture Overview

ProfitHub is a full-stack Amazon seller management system with React frontend and Express.js backend, using PostgreSQL with Drizzle ORM.

### Project Structure

- **`client/`** - React frontend (Vite + TypeScript)
  - `src/components/` - UI components (shadcn/ui + custom components)
  - `src/pages/` - Route pages
  - `src/hooks/` - Custom React hooks
  - `src/lib/` - Utilities and configurations

- **`server/`** - Express.js backend (TypeScript)
  - `routes/` - API route handlers (amazon.ts, amazonAuth.ts, products.ts)
  - `amazonSPService.ts` - Core Amazon SP-API integration service
  - `storage.ts` - Database abstraction layer
  - `syncScheduler.ts` - Automated sync jobs with node-cron

- **`shared/`** - Shared types and schemas
  - `schema.ts` - Drizzle database schema with Zod validation

### Core Systems

**Authentication & Multi-tenancy**
- **JWT Authentication System** with email/password login (`server/auth.ts`)
- bcrypt password hashing with 10 salt rounds
- JWT tokens with 7-day expiration
- Bearer token authentication via `Authorization: Bearer <token>` header
- Complete auth routes: `/api/auth/login`, `/api/auth/register`, `/api/auth/user`
- All API routes enforce user isolation via `isAuthenticated` middleware
- User-scoped queries prevent cross-user data access
- **Legacy Replit Auth support** available via `SKIP_AUTH=true` for development

**Amazon SP-API Integration**
- `amazonSPService.ts` handles all SP-API interactions
- Dual strategy: FBA Inventory API (primary) + Listings API (fallback)
- Product enrichment via Catalog API for images/descriptions
- Credential validation with token refresh testing
- Brazil marketplace support (region 'br' maps to 'na' with marketplace A2Q3Y263D00KWC)

**Database Design** 
- Multi-table architecture: users → amazonAccounts → products/amazonListings
- Versioned product costs with historical tracking
- Sales orders with line items and financial transactions
- PostgreSQL on Neon with connection pooling

**Sync Automation**
- `syncScheduler.ts` runs hourly/6-hourly/daily sync jobs
- Sync products, orders, and financial data from connected Amazon accounts
- Error handling with account status updates ('connected', 'authorization_error', 'error')

### Key API Endpoints

**Authentication (JWT)**
- `POST /api/auth/register` - User registration with email/password
- `POST /api/auth/login` - Login with email/password, returns JWT token
- `GET /api/auth/user` - Get current user profile (requires Bearer token)
- All authenticated routes require `Authorization: Bearer <jwt_token>` header

**Amazon Integration**
- `POST /api/amazon-accounts/:id/sync-products` - Real SP-API product sync
- `GET /api/amazon-accounts/:id/debug` - Connection diagnostics
- `POST /api/amazon-accounts/:id/test-auth` - Credential validation

**Product Management**
- `GET /api/products` - Paginated product listing with search
- `POST /api/products` - Create products with Zod validation
- `GET /api/products/:id/costs` - Product cost history
- `POST /api/products/:id/costs` - Add new cost version

### Environment Variables

Required for production:
- `DATABASE_URL` - Neon PostgreSQL connection
- `JWT_SECRET` - JWT token signing secret key
- `SESSION_SECRET` - Session encryption key (for compatibility)
- `AMAZON_LWA_APP_ID` - Amazon LWA client ID
- `AMAZON_LWA_CLIENT_SECRET` - Amazon LWA secret
- `AMAZON_REFRESH_TOKEN` - OAuth refresh token
- `AMAZON_AWS_ACCESS_KEY` - AWS access key for SP-API
- `AMAZON_AWS_SECRET_KEY` - AWS secret key
- `AMAZON_AWS_ROLE_ARN` - AWS role ARN
- `AMAZON_SP_API_APP_ID` - SP-API application ID

Development/Optional:
- `SKIP_AUTH=true` - Enable mock authentication for local development
- `AMAZON_USE_SANDBOX=true` - Enable sandbox mode in development
- `NODE_ENV=development` - Development mode flag

### Development Notes

**Communication Style**
- Use simple, everyday language as preferred by the developer
- Focus on practical solutions and clear explanations

**Database Migrations**
- Schema defined in `shared/schema.ts`
- Use `npm run db:push` to sync schema changes
- No manual migrations needed with Drizzle push

**Amazon SP-API Development**
- Use `/api/amazon-accounts/:id/debug` endpoint to troubleshoot connections
- Check credential validation before sync operations
- Monitor logs for emoji-tagged debug information
- Recent fixes have resolved critical product synchronization issues (see replit.md)

**Frontend State Management**
- TanStack Query for server state
- Wouter for lightweight routing
- shadcn/ui components with Tailwind CSS
- JWT token storage in localStorage with automatic logout on invalid tokens

**Authentication Flow**
1. **Registration**: `POST /api/auth/register` with email/password → JWT token returned
2. **Login**: `POST /api/auth/login` with credentials → JWT token returned  
3. **Token Usage**: Include `Authorization: Bearer <token>` header in all API requests
4. **Auto-logout**: Frontend automatically clears token on 401 responses
5. **Development Mode**: Use `SKIP_AUTH=true` to bypass JWT validation with mock user

**Database Schema Updates**
- `users` table now includes `password` (hashed), `isEmailVerified` columns
- Removed dependency on Replit-specific OAuth fields
- Maintained backward compatibility with existing user data

**Error Handling Pattern**
- All routes return consistent error JSON: `{ message: string, error?: any }`
- User ownership validation on all protected resources
- Automatic account status updates on SP-API failures
- JWT validation errors return 401 with clear error messages

**Key Recent Improvements (refer to replit.md for full details)**
- **Migration from Replit Auth to JWT Authentication (July 2025)** - Complete independence from external OAuth
- Added Login/Register pages with email/password authentication
- Fixed product synchronization with real SP-API integration
- Enhanced credential validation with token refresh testing
- Implemented dual API strategy (FBA Inventory + Listings fallback)
- Added comprehensive debug endpoint for troubleshooting
- Improved Brazil marketplace configuration
- **Local development environment** with mock auth and database systems

**Migration Note**: The system has been fully migrated from Replit OAuth to standard JWT authentication. The `SKIP_AUTH=true` flag maintains compatibility for local development and debugging. All `authUtils.ts` functions now handle both production JWT and development mock authentication seamlessly.