# TaskFlow 

> **Manage projects, assign tasks, track progress, and collaborate with your team all in one beautiful, ethereal workspace.**

TaskFlow is a modern, full-stack project management application engineered to streamline team productivity. Built with a stunning **Premium Ethereal Glassmorphism** aesthetic, it features beautiful soft glows, translucent floating cards, and animated aurora backgrounds that react dynamically to both light and dark modes.

---

##  Core Features

- **Role-Based Access Control (RBAC):** Strict separation between `Admin` and `Member` roles. Only Admins can invite team members and manage workspaces.
- **Interactive Analytics Dashboard:** Real-time visualizations of project progress and task status distributions using dynamic pie and bar charts.
- **Granular Task Tracking:** Create projects, assign tasks to specific team members, set priorities, and track deadlines.
- **Team Management UI:** Admins have a dedicated interface to manage their organization's members, handling onboarding and offboarding securely.
- **Ethereal Dark/Light Mode:** A fully integrated theme toggler that gracefully transitions the entire pastel color palette and glassmorphism shadows.
- **Blazing Fast Next.js 16:** Built on the bleeding edge App Router with server actions and instantaneous UI updates.

## 🛠️ Technology Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + Custom Glassmorphism UI
- **Database:** SQLite
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Visualizations:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🎨 UI/UX Aesthetic 

This application uses a highly customized **Ethereal Glassmorphism** design system:
- **Palette:** Soft Lavenders (`#A66CFF`), Cyans (`#8EEBFF`), Pastel Pinks (`#F0ABFC`), and Frosted White.
- **Backgrounds:** Smooth, fixed aurora-style radial gradients.
- **Components:** Deep translucent cards with `backdrop-blur(24px)`, eliminating harsh borders and hard shadows.
- **Typography:** Clean, readable `Inter` font for professional productivity.

---

## Local Development Setup

To run TaskFlow locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/task-manager-.git
cd task-manager-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the required environment variables:
```env
# The local SQLite database file
DATABASE_URL=file:local.db

# Used for encrypting session cookies (generate a random secure string)
SESSION_SECRET=super_secret_key_change_me_in_production
```

### 4. Database Setup (Drizzle ORM)
Push the database schema to your local SQLite file and seed it with initial data (optional):
```bash
# Push the schema
npm run db:push

# (Optional) Seed the database
npm run db:seed
```

### 5. Start the development server
```bash
npm run dev
```

Open [https://task-manager-production-b55e.up.railway.app/] with your browser to see the result.

---

## 🔐 Authentication Flow
- **Sign Up:** The `/signup` route is strictly for **Admins** creating new workspaces.
- **Member Login:** Members cannot sign up. They must be added by an Admin via the Dashboard's **Team** page. They will log in using the credentials provided by the Admin.

---
