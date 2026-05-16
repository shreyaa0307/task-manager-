# Task Manager

> A modern task and team workspace built with Next.js, TypeScript, Tailwind CSS, and Drizzle ORM.

This repository hosts a full-stack project management application for creating projects, assigning tasks, managing team members, and tracking progress with a polished dashboard UI.

---

## Live Demo

The app is deployed and available at:

<https://task-manager-production-b55e.up.railway.app>

Use this link to access the hosted version directly.

---

## Core Features

- `Admin` and `Member` role-based access
- Create and manage projects
- Assign tasks to team members with status tracking
- Dedicated dashboard and productivity views
- Team member management from the dashboard
- Light/Dark theme support
- Responsive glassmorphism-inspired UI

---

## Technology Stack

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Drizzle ORM** with **SQLite**
- **Recharts** for charts
- **Lucide React** icons
- **Framer Motion** animations
- **bcryptjs** for password hashing
- **next-themes** for theme switching

---

## Development Setup

If you want to run the app locally for development or testing, follow these steps.

### 1. Install dependencies

```bash
npm install
```

### 2. Add environment variables

Create a `.env.local` file in the project root with:

```env
DATABASE_URL=file:./dev.db
SESSION_SECRET=your_secret_key_here
```

### 3. Start the development server

```bash
npm run dev
```

Open <http://localhost:3000> in your browser.

> Note: If you only want to use the app, the deployed Railway URL is already available.

---

## Project Structure

- `app/` — Next.js pages and layout routes
- `components/` — reusable UI components
- `db/` — database configuration and schema files
- `lib/` — authentication, session, and API helper utilities
- `drizzle.config.ts` — Drizzle ORM config
- `middleware.ts` — request and auth middleware

---

## Available Scripts

- `npm run dev` — start the development server
- `npm run build` — build the app for production
- `npm run start` — start the production server
- `npm run lint` — run ESLint checks

---

## Notes

- The deployed app is hosted on Railway at the link above.
- Local setup is optional and only required for development or code changes.
- Member accounts are usually managed by Admins through the dashboard, rather than by open signup.

---

## License

This project is currently private. Add a license section if you choose to publish it publicly.
