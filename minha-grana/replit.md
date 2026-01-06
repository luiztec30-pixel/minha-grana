# Minha Grana - Personal Finance Manager

## Overview

Minha Grana ("My Money" in Portuguese) is a personal finance management application designed for Brazilian users. It provides comprehensive tracking of income sources, fixed and variable expenses, and savings goals. The application features a dashboard with financial charts, tab-based navigation for different financial categories, and includes specialized tracking for motorcycle expenses and travel planning.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Build Tool**: Vite with hot module replacement
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

The frontend follows a modular structure with:
- Tab-based navigation system for Dashboard, Receitas (Incomes), Gastos Fixos (Fixed Expenses), Gastos Variáveis (Variable Expenses), Economia (Savings), Moto (Motorcycle), and Viagem (Travel Planning)
- Protected routes requiring authentication
- Custom hooks for data fetching (`use-financial.ts`) and authentication (`use-auth.tsx`)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful endpoints under `/api/*`
- **Authentication**: Passport.js with local strategy, session-based auth using express-session
- **Session Storage**: PostgreSQL via connect-pg-simple
- **Validation**: Zod schemas shared between frontend and backend

Routes are defined in `shared/routes.ts` with type-safe input/output schemas, enabling consistent validation across the full stack. The storage layer (`server/storage.ts`) abstracts database operations.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Migration Tool**: drizzle-kit (`db:push` command)

**Database Tables**:
- `incomes`: Monthly income records with fields for CLT salary, app income, iFood income, and auxilio
- `fixed_expenses`: Recurring monthly expenses (rent, internet, etc.)
- `variable_expenses`: One-time expenses per month
- `savings_goals`: Monthly savings targets and progress tracking
- `settings`: Generic JSON settings storage (used for motorcycle details)
- `users`: User authentication with username/password

### Project Structure
```
minha-grana/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components (shadcn/ui)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Route components and views
│   │   └── lib/         # Utilities and query client
├── server/              # Express backend
│   ├── auth.ts          # Passport authentication setup
│   ├── db.ts            # Database connection
│   ├── routes.ts        # API route handlers
│   ├── storage.ts       # Data access layer
│   └── vite.ts          # Vite dev server integration
├── shared/              # Shared code between client/server
│   ├── routes.ts        # API route definitions with Zod schemas
│   └── schema.ts        # Drizzle database schema
└── drizzle/             # Database migrations
```

### Build Process
- Development: `npm run dev` runs tsx with Vite middleware
- Production: `npm run build` uses esbuild for server bundling and Vite for client
- Database: `npm run db:push` syncs schema to PostgreSQL

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **Passport.js**: Authentication middleware with local username/password strategy
- **express-session**: Session management with PostgreSQL session store
- **scrypt**: Password hashing using Node.js crypto module

### Frontend Libraries
- **Recharts**: Dashboard charts for visualizing income vs expenses
- **date-fns**: Date formatting and manipulation
- **Framer Motion**: Smooth animations and transitions (referenced in requirements)
- **Embla Carousel**: Carousel component for UI

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption (falls back to dev secret)