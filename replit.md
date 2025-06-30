# Sistema Contable Pro - Replit.md

## Overview

Sistema Contable Pro is a full-stack accounting SaaS application designed for the Ecuadorian market. It's built with a client-server architecture using React/TypeScript on the frontend and Express.js on the backend, with PostgreSQL as the database and Drizzle ORM for database operations.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite with custom configuration
- **Routing**: Wouter for client-side routing
- **State Management**: React Context API for auth and company state
- **UI Framework**: ShadCN UI components with Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **Data Fetching**: TanStack React Query for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon Database serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Simple in-memory session store with JWT-like tokens
- **API Design**: RESTful API with structured error handling

### Database Schema
The application uses a relational database structure with the following entities:
- **Users**: Authentication and user management
- **Companies**: Multi-tenant company support
- **Clients**: Customer management per company
- **Invoices**: Invoice tracking with status management

## Key Components

### Authentication System
- JWT-like token-based authentication using session storage
- Secure token storage in localStorage with automatic header injection
- AuthGuard component for route protection
- AuthContext for global authentication state management

### Multi-Company Architecture
- Company-scoped data access ensuring tenant isolation
- CompanyContext for managing selected company state
- Company switcher UI component for easy switching between companies
- All business operations are scoped to the selected company

### Data Management
- Type-safe API client with centralized error handling
- React Query for caching, background updates, and optimistic updates
- Form validation using Zod schemas shared between client and server
- Toast notifications for user feedback

### UI/UX Design
- Modern dashboard layout with fixed sidebar navigation
- Responsive design using Tailwind CSS utilities
- Professional component library based on ShadCN UI
- Loading states and skeleton components for better UX

## Data Flow

1. **Authentication Flow**: User logs in → Server validates credentials → Returns session token → Client stores token → All subsequent requests include token
2. **Company Selection**: User selects company → Company ID stored in localStorage → All API calls scoped to selected company
3. **Data Operations**: User performs CRUD operations → React Query handles caching and updates → UI reflects changes optimistically
4. **Form Submissions**: Form validates with Zod → Data sent to API → Success/error feedback via toasts → Query cache invalidated

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon Database driver for PostgreSQL
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components for accessibility
- **react-hook-form**: Form state management
- **zod**: Runtime type validation and schema validation

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing

## Deployment Strategy

### Development
- Vite development server with HMR for frontend
- tsx for running TypeScript backend in development
- Environment variables for database configuration

### Production Build
- Vite builds optimized frontend bundle to `dist/public`
- esbuild bundles backend to `dist/index.js`
- Single deployment artifact with both frontend and backend

### Database
- Drizzle migrations stored in `/migrations` directory
- Database schema defined in `shared/schema.ts`
- Connection via environment variable `DATABASE_URL`

## Changelog
```
Changelog:
- June 30, 2025. Complete Accounting System Implementation - Implemented full Ecuador-compliant accounting system with: Accounting module with chart of accounts and journal entries, SRI integration for online export/import, Retention certificates with automatic calculations, Credit/Debit notes management, Proforma quotations with invoice conversion, Employee and payroll management with IESS calculations, Variable IVA rate (15%), Expanded database schema with all accounting tables, Complete navigation system with 11 modules, Professional UI for all accounting functions, AI-powered automatic accounting processes, All required Ecuador tax compliance features
- June 30, 2025. Complete system implementation - Built comprehensive invoice creation with line items and calculations, added detailed invoice viewer modal, implemented full reports system with analytics and client insights, created complete settings page with company management and user preferences, expanded database schema for invoices with subtotal/IVA/items/notes fields, added all navigation routes and UI components for complete accounting functionality
- June 30, 2025. Enhanced system architecture - Implemented robust form validation with React Hook Form + Zod, added comprehensive loading states and skeletons, created reusable error boundaries and empty state components, improved UX with professional dialog descriptions, unified TypeScript types across components
- June 30, 2025. Migration completed - Fixed API connection errors, unified ports to 5000, added CORS configuration, resolved date validation issues in dashboard
- June 29, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```