# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Base Documentation

**Always reference `replit.md`** - This is the foundational documentation that contains the complete system overview, architecture details, and recent development history. The replit.md file is the primary source of truth for understanding this codebase and should be consulted first when working on any task.

## Development Commands

```bash
# Development
npm run dev              # Start development server with hot reload
npm run check           # Type checking
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:push         # Push schema changes to database
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
- Replit OAuth integration in `server/replitAuth.ts`
- All API routes enforce user isolation via `isAuthenticated` middleware
- User-scoped queries prevent cross-user data access

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
- `SESSION_SECRET` - Session encryption key
- `AMAZON_LWA_APP_ID` - Amazon LWA client ID
- `AMAZON_LWA_CLIENT_SECRET` - Amazon LWA secret
- `AMAZON_REFRESH_TOKEN` - OAuth refresh token
- `AMAZON_AWS_ACCESS_KEY` - AWS access key for SP-API
- `AMAZON_AWS_SECRET_KEY` - AWS secret key
- `AMAZON_AWS_ROLE_ARN` - AWS role ARN
- `AMAZON_SP_API_APP_ID` - SP-API application ID

Optional:
- `AMAZON_USE_SANDBOX=true` - Enable sandbox mode in development

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

**Error Handling Pattern**
- All routes return consistent error JSON: `{ message: string, error?: any }`
- User ownership validation on all protected resources
- Automatic account status updates on SP-API failures

**Key Recent Improvements (refer to replit.md for full details)**
- Fixed product synchronization with real SP-API integration
- Enhanced credential validation with token refresh testing
- Implemented dual API strategy (FBA Inventory + Listings fallback)
- Added comprehensive debug endpoint for troubleshooting
- Improved Brazil marketplace configuration