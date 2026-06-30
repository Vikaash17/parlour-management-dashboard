# Parlour Manager

A Progressive Web App (PWA) for managing a beauty parlour. Built for the owner to manage customers, services, visits, expenses, and generate reports.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Supabase (PostgreSQL)
- Recharts
- React Router v7
- React Hook Form + Zod
- Vite PWA Plugin

## Setup

### Prerequisites

- Node.js 18+
- A Supabase account (free tier works)

### 1. Clone and Install

```bash
git clone <repo-url> parlour-mgr
cd parlour-mgr
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the SQL Editor
3. Copy the contents of `supabase/schema.sql` and run it
4. Go to Project Settings → API and copy your URL and anon key

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## Deploy to Vercel

### Automatic (Recommended)

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Set environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Deploy - Vercel auto-detects Vite configuration

### Manual

```bash
npm install -g vercel
vercel
```

## PWA Features

- Installable on Android phones
- Works offline for previously loaded pages
- App icon and splash screen
- Full-screen mode

## Features

- **Dashboard** - Today's stats, monthly charts, top services, recent visits
- **Customers** - CRUD, search, profile view with visit history
- **Services** - CRUD with categories and pricing
- **Visits** - Select customer, add services, auto-calculate total
- **Expenses** - CRUD with categories
- **Reports** - Filter by period, export to CSV/Excel
- **Settings** - Business name, currency, owner info

## Project Structure

```
src/
  components/
    charts/     # Recharts wrappers
    layout/     # Sidebar, BottomNav, AppLayout
    ui/         # Button, Input, Card, Modal, etc.
  pages/        # Dashboard, Customers, Services, Visits, Expenses, Reports, Settings
  services/     # Supabase API calls
  context/      # AuthContext, AppContext
  hooks/        # useOnlineStatus
  lib/          # supabase client, utils
  types/        # TypeScript definitions
supabase/       # SQL schema
```

## License

MIT
