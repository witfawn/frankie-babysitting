# Frankie Babysitting App

A modern babysitting booking platform built with Next.js, Prisma, and shadcn/ui.

## Features

### For Frankie (Admin):
- Post availability windows (date + time range)
- View calendar of bookings
- Approve/decline booking requests
- Manage profile (bio, photo, hourly rate)
- Add new users (parents or admins) — auto-whitelisted
- Track referrals

### For Parents:
- View Frankie's availability calendar
- Request specific time within availability
- Save profile with kids info, address, emergency contacts
- Re-book quickly using saved info
- Refer friends (auto-whitelisted)

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Database:** SQLite with Prisma ORM
- **Authentication:** NextAuth.js with Google OAuth + Demo credentials
- **UI:** shadcn/ui components with Tailwind CSS
- **Styling:** Tailwind CSS 4 with CSS variables

## Getting Started

### Prerequisites
- Node.js 22+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd my-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env .env.local
# Edit .env.local with your Google OAuth credentials
```

4. Set up the database:
```bash
npx prisma migrate dev
npm run seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Accounts

For testing without Google OAuth, use these demo accounts:

- **Frankie (Admin):** `frankie@example.com`
- **Mom (Co-Admin):** `mom@example.com`
- **Sample Parent:** `parent@example.com`

## Project Structure

```
my-app/
├── app/
│   ├── admin/           # Admin pages (Frankie)
│   ├── api/             # API routes
│   ├── parent/          # Parent pages
│   ├── login/           # Login page
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home redirect
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── admin-nav.tsx    # Admin navigation
│   ├── parent-nav.tsx   # Parent navigation
│   └── providers.tsx    # Context providers
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Prisma client
│   └── utils.ts         # Utility functions
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Seed script
└── types/
    └── next-auth.d.ts   # TypeScript types
```

## Database Schema

### User
- id, name, email, role (ADMIN/PARENT)
- Profile fields: bio, hourlyRate, phone, address, kidsAges, emergency contacts

### Availability
- Frankie's posted time windows
- date, startTime, endTime, status

### Booking
- Parent's request within availability
- requestedStart, requestedEnd, numKids, kidsAges, address, emergency info
- status: PENDING, CONFIRMED, DECLINED, COMPLETED

### Referral
- Tracks who invited whom
- Auto-whitelist functionality

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Deployment

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## License

MIT
