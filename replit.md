# Emagrecimento Inteligente - Replit Configuration

## Overview

This is a full-stack weight loss application built with TypeScript, React, Express, and PostgreSQL. The platform provides a comprehensive health management system with course modules, community features, exercise tracking, meal logging, reflection tools, and progress analytics. The application focuses on intelligent weight management through behavioral insights and community support.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js 20
- **Database ORM**: Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple

### Data Storage
- **Primary Database**: PostgreSQL 16
- **Connection**: Neon serverless database with connection pooling
- **Schema Management**: Drizzle Kit for migrations
- **Session Storage**: Database-backed sessions for authentication

## Key Components

### Authentication System
- **Provider**: Replit Auth integration
- **Session Management**: Server-side sessions stored in PostgreSQL
- **User Management**: User profiles with weight tracking and points system
- **Security**: HTTP-only cookies, CSRF protection

### Core Features
1. **Dashboard**: Personal stats, weight tracking, meal overview
2. **Course System**: Video modules with progress tracking
3. **Community Forum**: Topic-based discussions with user interactions
4. **Exercise System**: Daily mental exercises with scoring
5. **Meal Tracking**: Food logging with categorization
6. **Reflection Tool**: Daily behavior and mood tracking
7. **Evolution Analytics**: Weight trends and insights with AI-powered analysis

### Database Schema
- **Users**: Profile management with weight and points tracking
- **Course System**: Modules, user progress, video completions
- **Forum**: Topics, comments, user interactions
- **Health Tracking**: Meals, weight entries, behavior reflections
- **Exercise System**: Daily exercises with user responses
- **Points System**: Achievement tracking and gamification

## Data Flow

### Authentication Flow
1. User authenticates via Replit OAuth
2. Server validates and creates/updates user profile
3. Session established with PostgreSQL storage
4. Client receives authenticated user data

### Content Delivery
1. React SPA served via Vite in development
2. API routes handle data operations
3. Real-time updates via React Query
4. Optimistic updates for better UX

### Data Operations
1. Client requests data via React Query
2. Express API validates authentication
3. Drizzle ORM executes database operations
4. Results cached and synchronized across components

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **openai**: AI insights generation
- **express-session**: Session management
- **passport**: Authentication strategy

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **recharts**: Data visualization charts

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **tsx**: TypeScript execution
- **esbuild**: Production bundling

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 via Replit
- **Database**: PostgreSQL 16 provision
- **Hot Reload**: Vite HMR for frontend changes
- **Server Restart**: tsx watch mode for backend changes

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: esbuild bundle to `dist/index.js`
- **Database**: Drizzle migrations via `db:push`
- **Deployment**: Replit autoscale deployment target

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Session encryption key
- **OPENAI_API_KEY**: AI insights integration
- **REPLIT_DOMAINS**: Authentication domains
- **ISSUER_URL**: OAuth issuer endpoint

## Changelog

```
Changelog:
- June 16, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```