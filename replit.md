# ProfitHub - Amazon SP-API Management System

## Overview

ProfitHub is a complete management system for Amazon sellers that integrates with the Amazon Selling Partner API (SP-API). The system provides comprehensive functionality for managing products, costs, sales, and profitability analysis across multiple Amazon accounts. Built with a modern full-stack architecture using React, Express.js, and PostgreSQL with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the stack
- **Authentication**: Replit Auth (OAuth) with session management
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **API Design**: RESTful API with consistent error handling and validation

### Data Storage
- **Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle migrations with version control
- **Connection**: Neon serverless connection with connection pooling

## Key Components

### Authentication System
- **Replit OAuth Integration**: Seamless authentication using Replit's identity provider
- **Session Management**: Secure session handling with PostgreSQL storage
- **Authorization Middleware**: Route-level protection for authenticated users
- **User Profile Management**: User data synchronization and profile management

### Database Schema
- **Users**: Core user profiles with Replit integration
- **Amazon Accounts**: Multi-account support for different marketplaces
- **Products**: Internal product catalog with SKU management
- **Amazon Listings**: Marketplace-specific product listings
- **Product Costs**: Versioned cost tracking with historical data
- **Sales Orders**: Complete order management with line items
- **Financial Transactions**: Detailed transaction tracking with fees and deductions

### API Endpoints
- **Authentication**: `/api/auth/*` - User authentication and profile management
- **Amazon Accounts**: `/api/amazon-accounts` - Multi-account marketplace management
- **Products**: `/api/products` - Product catalog CRUD operations
- **Costs**: `/api/costs` - Cost management with versioning
- **Sales**: `/api/sales` - Sales data and analytics
- **Analytics**: `/api/analytics` - Dashboard metrics and reporting

### Frontend Components
- **Layout System**: Header, Sidebar, and main content areas
- **Dashboard**: KPI cards, charts, and quick actions
- **Data Tables**: Sortable, filterable tables for products, costs, and sales
- **Forms**: Validated forms for data entry and updates
- **Modals**: Dialog components for actions and confirmations

## Data Flow

### Authentication Flow
1. User clicks login → Redirected to Replit OAuth
2. OAuth callback → User data stored/updated in PostgreSQL
3. Session created → Persistent login across browser sessions
4. Protected routes → Middleware validates session before API access

### Data Synchronization
1. Amazon accounts connected via SP-API credentials
2. Periodic sync jobs pull product listings and sales data
3. Data normalized and stored in local database
4. Real-time updates reflected in frontend via React Query

### Cost Management
1. Users input product costs with effective dates
2. Historical cost versions preserved (never updated)
3. Profit calculations use appropriate cost version for each sale
4. Cost changes tracked for audit and analysis purposes

### Sales Processing
1. Sales data imported from Amazon SP-API
2. All fees, commissions, and deductions captured
3. Net revenue calculated after all marketplace fees
4. Profit computed using historical cost data

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI component primitives
- **wouter**: Lightweight React router
- **zod**: Runtime type validation

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Tailwind CSS**: Utility-first styling framework
- **Vite**: Fast development server and build tool
- **ESBuild**: Production backend bundling

### Authentication & Session
- **passport**: Authentication middleware
- **openid-client**: OAuth client for Replit integration
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR
- **Database**: Neon PostgreSQL with environment-specific connections
- **Environment Variables**: Secure credential management
- **Hot Reload**: Full-stack development with automatic reloading

### Production Build
- **Frontend**: Vite production build with asset optimization
- **Backend**: ESBuild bundle for Node.js deployment
- **Static Assets**: Served directly by Express in production
- **Database Migrations**: Automated schema updates via Drizzle

### Environment Configuration
- **DATABASE_URL**: Neon PostgreSQL connection string
- **SESSION_SECRET**: Secure session encryption key
- **REPL_ID**: Replit environment identifier
- **ISSUER_URL**: OAuth provider configuration

### Scalability Considerations
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Indexed database queries for performance
- **Caching Strategy**: React Query provides client-side caching
- **Modular Architecture**: Easy to extend with new marketplace integrations

## Recent Changes

### Amazon SP-API Integration Completed (January 2025)
- **Complete Amazon SP-API service** implemented with product, order, and financial data synchronization
- **Automated sync scheduler** with hourly, 6-hourly, and daily sync jobs using node-cron
- **Full REST API endpoints** for Amazon account management and sync operations
- **Frontend components** for connecting and managing Amazon accounts
- **Database schema updated** to support all SP-API data structures
- **Credential validation system** to test connections before saving accounts
- **Error handling and retry logic** for robust API integrations

The system now supports complete Amazon seller data integration and is ready for production use with real Amazon accounts.

The system is designed to be deployed on Replit's infrastructure but can be adapted for other hosting environments with minimal configuration changes. The architecture supports horizontal scaling through database connection pooling and stateless API design.