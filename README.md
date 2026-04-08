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

**1. Clone the repository**

```bash
git clone <your-repo-url>
cd expense_tracker
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up the database**

```bash
npx prisma db push
```

This syncs the Prisma schema to your PostgreSQL database.

**4. Start the Next.js dev server**

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

**5. Start the Inngest dev server** *(required for background jobs)*

In a separate terminal, run:

```bash
npx inngest-cli@latest dev
```

This starts the local Inngest dev server at [http://localhost:8288](http://localhost:8288) and connects to your Next.js app to process background jobs — including recurring transaction processing and budget alert emails.

> **Note:** Without the Inngest dev server running, scheduled/recurring transactions and budget alert emails will not trigger locally.

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
