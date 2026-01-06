# Fluxo Financeiro Pessoal

## Overview

A personal finance management application built for tracking income, expenses, and savings goals. The app is designed in Portuguese (Brazilian) and provides a dashboard with charts, tabs for managing different financial categories, and motorcycle expense tracking. It follows a monorepo structure with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite with hot module replacement
- **Form Handling**: React Hook Form with Zod validation

The frontend uses a tab-based navigation system with views for Dashboard, Incomes (Receitas), Fixed Expenses (Gastos Fixos), Variable Expenses (Gastos Variáveis), Savings (Economia), and Motorcycle Details (Moto).

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful endpoints under `/api/*`
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Validation**: Zod schemas shared between frontend and backend

Routes are defined in `shared/routes.ts` with type-safe input/output schemas, enabling consistent validation across the stack.

### Data Storage
- **Database**: PostgreSQL (provisioned via Replit)
- **Schema Location**: `shared/schema.ts`
- **Tables**:
  - `incomes`: Monthly income records (CLT, app, ifood, auxilio)
  - `fixed_expenses`: Recurring monthly expenses
  - `variable_expenses`: One-time expenses per month
  - `savings_goals`: Monthly savings targets and progress
  - `settings`: Generic JSON settings storage (used for motorcycle details)

### Project Structure
```
Fluxo-Financeiro-Pessoal/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/ui/  # shadcn/ui components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Route components
│   │   └── lib/            # Utilities
├── server/          # Express backend
│   ├── index.ts     # Server entry point
│   ├── routes.ts    # API route handlers
│   ├── storage.ts   # Database operations
│   └── db.ts        # Database connection
└── shared/          # Shared code
    ├── schema.ts    # Drizzle schemas + Zod validators
    └── routes.ts    # API route definitions
```

### Development vs Production
- **Development**: Uses Vite dev server with HMR, proxied through Express
- **Production**: Client built to `dist/public`, server bundled with esbuild to `dist/index.cjs`

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connected via `DATABASE_URL` environment variable
- **Drizzle Kit**: Schema migrations via `npm run db:push`

### UI Libraries
- **Radix UI**: Headless component primitives (dialog, tabs, select, etc.)
- **Recharts**: Dashboard charting library
- **Lucide React**: Icon library
- **Framer Motion**: Animations (listed in requirements)

### Key NPM Packages
- `@tanstack/react-query`: Data fetching and caching
- `drizzle-orm` + `drizzle-zod`: Type-safe database operations
- `express-session` + `connect-pg-simple`: Session management (if auth is added)
- `date-fns`: Date formatting utilities