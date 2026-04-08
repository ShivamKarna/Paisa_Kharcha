# Paisa Kharcha 💸

A smart, full-stack expense tracking web application that helps you manage your finances with ease — track transactions, set budgets, scan receipts with AI, and get alerted before you overspend.

![Paisa Kharcha Landing](./public/Paisa_Kharcha_Landing.png)

---

## Features

- **Multi-Account Support** — Manage multiple CURRENT and SAVINGS accounts in one place
- **Income & Expense Tracking** — Log transactions with categories, dates, and descriptions
- **AI Receipt Scanning** — Automatically extract transaction details from receipt images using Google Gemini
- **Budget Management** — Set monthly budgets per account and get email alerts when you're close to the limit
- **Recurring Transactions** — Schedule daily, weekly, monthly, or yearly recurring expenses/income
- **Dashboard & Charts** — Visualize spending trends and account balances with interactive charts
- **Secure Authentication** — User auth powered by Clerk

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | Clerk |
| AI | Google Gemini (`@google/generative-ai`) |
| Email | Resend + React Email |
| Background Jobs | Inngest |
| UI | Tailwind CSS v4, Radix UI, Recharts |
| Rate Limiting | Arcjet |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Accounts for: [Clerk](https://clerk.com), [Resend](https://resend.com), [Inngest](https://inngest.com), [Google AI Studio](https://aistudio.google.com)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd expense_tracker

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Google Gemini AI
GEMINI_API_KEY=

# Resend (Email)
RESEND_API_KEY=

# Arcjet (Rate Limiting)
ARCJET_KEY=
```

### Run Locally

```bash
# Push the database schema
npx prisma db push

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
├── app/
│   ├── (auth)/          # Sign-in / Sign-up pages
│   ├── (main)/          # Dashboard, Accounts, Transactions
│   └── api/             # API routes & Inngest functions
├── actions/             # Server Actions
├── components/          # Reusable UI components
├── emails/              # React Email templates
├── prisma/              # Database schema & migrations
└── public/              # Static assets
```
