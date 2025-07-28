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

### Sandbox Mode Implementation (January 2025)
- **Sandbox environment configured** for testing with Amazon SP-API development credentials
- **Amazon Brazil account connected** (BEKZA, A2T1SY156TAAGD, A2Q3Y263D00KWC) successfully
- **Database structure corrected** with missing columns (sku, image_url) added
- **Sample data creation** implemented for testing without real API calls
- **Connection testing adapted** for sandbox environment

### OAuth Implementation & Testing (January 2025)
- **Complete OAuth workflow implemented** following Amazon SP-API documentation
- **Production domain configured** (profit.guivasques.app) with proper callback URLs
- **Real Amazon credentials integrated** (LWA App ID, SP-API App ID, Client Secret)
- **OAuth URL fixed for draft apps** - added required `version=beta` parameter for applications in draft state
- **OAuth workflow tested with real credentials** - code successfully obtained but token exchange failed due to "Client authentication failed"
- **LWA credentials issue identified** - redirect URI or client credentials need configuration in Amazon Developer Console
- **Diagnostic page created** at /oauth-diagnostic with step-by-step troubleshooting guide
- **Amazon LWA documentation reviewed** - identified exact configuration requirements for redirect URIs and allowed origins
- **LWA setup guide created** at /lwa-setup with complete step-by-step configuration instructions
- **Refresh token updated** by user but "Client authentication failed" error persists
- **Root cause confirmed**: Client ID/Secret from different Security Profile than refresh token
- **Solution identified**: Must use matching LWA credentials from same Security Profile that generated refresh token
- **LWA credentials updated** with correct values from Amazon Developer Console
- **OAuth workflow successfully tested** - authorization completed and access tokens obtained
- **Amazon account connected** - BKZA account now showing as "Conectado" in production
- **System fully operational** with real Amazon SP-API integration working
- **Support page created** at /support with comprehensive help content and contact info
- **Professional email configured** (suporte@guivasques.app) for official support channel

### Multi-User Security Implementation (January 2025)
- **Complete data isolation** enforced at database and API level
- **User-scoped queries** implemented for all product, cost, and Amazon account operations
- **Authorization checks** added to all protected routes with 403 Access Denied responses
- **User ownership validation** for all CRUD operations on user-specific resources
- **Amazon account segregation** ensuring users only see their own marketplace connections
- **Comprehensive security review** completed for all API endpoints and database queries

### Product Synchronization Fixes (January 2025)
- **Critical SP-API Integration Issues Resolved** - Fixed major problems preventing product synchronization
- **Sandbox/Test Data Removal** - Eliminated hardcoded test products from sync-products endpoint
- **Real SP-API Service Integration** - Route now properly uses `amazonSPService.syncProducts()` for actual Amazon data
- **Enhanced Credential Validation** - Implemented `validateAccountCredentials()` with token refresh testing
- **Pre-sync Validation** - System now validates credentials before attempting synchronization operations
- **Improved Error Handling** - Account status automatically updated to 'authorization_error' when credentials fail
- **Brazil Region Configuration** - Fixed SP-API client configuration for Brazilian marketplace (A2Q3Y263D00KWC)
- **Environment-based Configuration** - Sandbox/production mode now properly controlled via environment variables
- **Dual Product Retrieval Strategy** - Implemented FBA Inventory API as primary with Listings API fallback
- **Product Data Enrichment** - Added Catalog API integration for complete product details (images, descriptions)
- **Debug Endpoint Added** - New `/api/amazon-accounts/:id/debug` endpoint for connection diagnostics
- **Comprehensive Logging** - Enhanced logging with emojis and detailed status information for troubleshooting

### SP-API Service Improvements (January 2025)
- **Client Configuration Enhanced** - Better region mapping with Brazil support (br → na with correct marketplace)
- **Endpoint Version Control** - Specified API versions: Catalog 2022-04-01, Listings 2021-08-01, Reports v2021-06-30
- **Debug Mode Integration** - Development logging controlled via NODE_ENV environment variable
- **Multiple Product Sources** - FBA Inventory API for active inventory, Listings API for all products
- **Real-time Token Validation** - LWA token refresh testing before API calls
- **Marketplace Participation Testing** - Connection validation using seller marketplace data
- **Robust Error Recovery** - Graceful fallback between different SP-API endpoints
- **Account Status Management** - Automatic status updates based on API response success/failure

### New API Endpoints (January 2025)
- **Debug Endpoint**: `GET /api/amazon-accounts/:id/debug` - Comprehensive connection and credential testing
- **Enhanced Sync**: `POST /api/amazon-accounts/:id/sync-products` - Now uses real SP-API with detailed response
- **Validation Tests**: Three-tier validation (credentials → connection → marketplace participation)
- **Detailed Responses**: Structured JSON responses with operation counts and error details

## Technical Implementation Details

### SP-API Integration Architecture

#### Product Synchronization Flow
1. **Credential Validation** (`validateAccountCredentials()`)
   - Tests LWA token refresh capability
   - Validates SP-API client configuration
   - Updates account status based on validation results

2. **Dual API Strategy**
   - **Primary**: FBA Inventory API (`getInventorySummaries`) - Active inventory with quantities
   - **Fallback**: Listings Items API (`getListingsItems`) - All product listings
   - **Enhancement**: Catalog Items API (`getCatalogItem`) - Product details, images, descriptions

3. **Data Processing Pipeline**
   - SKU-based duplicate detection
   - Product creation/update with enriched data
   - Amazon listing management with marketplace-specific data
   - Error handling with detailed logging

#### Configuration Management
```typescript
// SP-API Client Configuration
{
  region: credentials.region === 'br' ? 'na' : credentials.region,
  use_sandbox: process.env.NODE_ENV === 'development' && process.env.AMAZON_USE_SANDBOX === 'true',
  endpoints_versions: {
    'catalog': '2022-04-01',
    'listings': '2021-08-01', 
    'reports': 'v2021-06-30'
  }
}
```

### Error Handling & Recovery
- **Token Expiration**: Automatic refresh token validation
- **API Failures**: Graceful fallback between endpoints
- **Rate Limiting**: Built-in retry logic via amazon-sp-api library
- **Account Status**: Real-time updates ('connected', 'authorization_error', 'error')

### Debug & Monitoring
- **Comprehensive Logging**: Emoji-enhanced logs for easy identification
- **Debug Endpoint**: Multi-tier validation testing
- **Connection Testing**: Marketplace participation verification
- **Credential Validation**: LWA token refresh testing

### Critical Bug Fixes - Token Persistence & Error 500 Resolution (January 2025)
- **Error 500 Fixed in Product Sync** - Resolved critical synchronization failures with comprehensive error handling
- **Token Persistence Issue Resolved** - Fixed refresh token not being maintained, requiring constant reconnection
- **Enhanced Credential Validation** - Added 15-second timeout to prevent hanging on token validation
- **Robust Error Handling** - Implemented detailed logging and graceful fallback between API endpoints
- **Automatic Token Refresh** - System now automatically refreshes expired access tokens before SP-API calls
- **Access Token Storage** - Properly store access tokens with expiration timestamps for better persistence
- **Dual API Strategy Enhanced** - Improved error handling for both FBA Inventory and Listings APIs with specific error messages
- **Individual Item Processing** - Added try/catch for each product item to prevent single failures from breaking entire sync
- **Debug Logging Improved** - Enhanced console logging with detailed API response information for troubleshooting

### Token Management Improvements (January 2025)
- **Expiration Tracking** - Access tokens now stored with proper expiration timestamps
- **Automatic Refresh Logic** - Client automatically checks token expiration before API calls
- **Persistent Authentication** - Users no longer need to constantly reconnect Amazon accounts
- **Enhanced OAuth Flow** - OAuth callback now properly saves both access and refresh tokens with expiration data
- **Client Cache Management** - SP-API client cache cleared automatically after token refresh

### Error Handling & Debugging Enhancements (January 2025)
- **Timeout Protection** - Added 15-second timeout to token refresh calls to prevent indefinite hanging
- **Detailed API Response Logging** - Console logs now show success status, data availability, and item counts
- **Graceful Degradation** - System attempts FBA Inventory API first, falls back to Listings API with specific error messages
- **Individual Item Error Isolation** - Processing errors for single products no longer break entire synchronization
- **Comprehensive Error Messages** - Users receive specific error information instead of generic 500 errors

## Local Development Setup (July 2025)

### Debugging Amazon Integration Error 500

Durante a investigação do erro 500 persistente na sincronização com Amazon, foi implementado um sistema completo de desenvolvimento local para permitir debugging efetivo:

#### Problema Identificado
- **Error 500 na sincronização de produtos**: Causado por falha na validação de credenciais Amazon
- **Token persistence issues**: Sistema tentando usar credenciais inválidas/expiradas
- **Database connection timeouts**: Conexão com Neon falhando em ambiente local

#### Soluções Implementadas

1. **Mock Authentication System (`server/replitAuth.ts`)**
   - Bypass de autenticação Replit quando `SKIP_AUTH=true`
   - Mock user criado automaticamente: `dev-user-123`
   - Endpoints de login/logout funcionais para desenvolvimento local

2. **Mock Database System (`server/mockDb.ts`, `server/storage.ts`)**
   - MockStorage class implementando interface IStorage
   - Dados de teste pré-populados (usuário, conta Amazon, produtos)
   - Fallback automático quando `SKIP_AUTH=true`

3. **User ID Utility (`server/authUtils.ts`)**
   - Função centralizada `getUserId()` para compatibilidade entre produção e desenvolvimento
   - Corrigiu todos os endpoints que acessavam `req.user.claims.sub` diretamente
   - Tratamento de erro consistente em todos os endpoints

4. **Arquivos Corrigidos**
   - `server/routes.ts` - Endpoint de usuário e produtos
   - `server/routes/amazon.ts` - Todos os endpoints Amazon (11 rotas)
   - `server/routes/amazonAuth.ts` - Endpoints de autenticação Amazon (3 rotas)
   - `server/index.ts` - Configuração do servidor para localhost

#### Configuração Local (`.env`)
```env
# Flags de desenvolvimento
SKIP_AUTH=true
NODE_ENV=development  
PORT=3000
AMAZON_USE_SANDBOX=true

# Database (opcional - usa mock se não configurado)
DATABASE_URL=postgresql://neondb_owner:...

# Session
SESSION_SECRET=local_development_secret_key
```

#### Diagnóstico do Error 500
O erro 500 estava sendo causado especificamente por:
1. **Credenciais Amazon inválidas** - Mock account não tem credenciais reais
2. **Validação de credenciais falhando** - `validateAccountCredentials()` retorna false
3. **Status da conta sendo alterado** para `authorization_error`

#### Logs de Debug Implementados
Sistema de logs detalhado com emojis para rastreamento:
- 🚀 SYNC START - Início do processo
- 📋 STEP - Cada etapa do processo  
- ✅/❌ VALIDATION - Resultado das validações
- 🔍 CREDENTIALS - Estado das credenciais
- 📊 ACCOUNT STATUS - Status da conta

#### Comandos para Desenvolvimento Local
```bash
# Iniciar servidor local
npm run dev

# Testar endpoints
curl http://127.0.0.1:3000/api/auth/user
curl http://127.0.0.1:3000/api/amazon-accounts
curl -X POST http://127.0.0.1:3000/api/amazon-accounts/test-account-1/sync-products
```

## Memory Notes
- **Always update replit.md** when making changes to document system evolution
- **User prefers simple language** - Avoid technical jargon in explanations
- **Token persistence was critical issue** - Users had to reconnect frequently before fix
- **Error 500 was blocking product sync** - System now provides detailed error feedback
- **Debugging enhanced with emoji logs** - Makes troubleshooting easier in console
- **Local development setup implemented** - Mock auth and database for debugging Error 500
- **Error 500 root cause identified** - Invalid Amazon credentials causing validation failure

### Latest Updates (July 28, 2025)
- **Migração completa do Replit Auth para JWT Authentication** - Sistema agora usa autenticação padrão com email/senha
- **Páginas de Login/Register criadas** - Interface completa com validação de formulários
- **Middleware JWT implementado** - Token Bearer authentication com bcrypt password hashing
- **Schema de usuários atualizado** - Adicionadas colunas password, isEmailVerified para autenticação padrão
- **Hook useAuth reescrito** - Gerenciamento de token via localStorage com auto-logout em token inválido
- **Rotas de autenticação** - /api/auth/login, /api/auth/register, /api/auth/user implementadas
- **Remoção das dependências Replit Auth** - Sistema 100% independente sem OAuth externo
- **Sistema de recuperação de senha implementado** - Envio de códigos de 6 dígitos via SMTP personalizado
- **SKIP_AUTH completamente removido** - Sistema agora usa apenas autenticação JWT pura em todos os ambientes
- **MockStorage removido** - Sistema usa exclusivamente banco de dados PostgreSQL para todas as operações
- **Usuário de teste criado** - guilherme@profithub.com com senha "Estrela10" para testes
- **Error 500 de login corrigido** - Problema de importação getUserId resolvido, sistema totalmente funcional
- **Sistema 100% estável** - Autenticação JWT funcionando perfeitamente em produção
- **Token automático implementado** - queryClient agora envia token JWT automaticamente em todas as requisições
- **Erro 401 resolvido** - Sistema de autenticação frontend-backend totalmente sincronizado
- **Bug region null corrigido** - AmazonAccountCard agora trata corretamente valores null na região

## Current System Status

The system is fully operational in production with **significantly improved** Amazon SP-API integration. The recent fixes have resolved critical synchronization issues and token persistence problems that were preventing reliable product data retrieval. OAuth authorization continues to work correctly, and the system now successfully processes real marketplace data from connected Amazon accounts with enhanced reliability, automatic token management, and comprehensive error handling.

**Development Environment**: Local debugging environment has been implemented with mock authentication and database systems to enable effective troubleshooting of integration issues without requiring production credentials.

The system is designed to be deployed on Replit's infrastructure but can be adapted for other hosting environments with minimal configuration changes. The architecture supports horizontal scaling through database connection pooling and stateless API design.