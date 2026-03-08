Next.js Booking App with Prisma and Custom Auth

A booking management application built with Next.js and Prisma, featuring a simple email/password authentication system (bcrypt + JWT) and role-based access control.

Tech Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Database: PostgreSQL via Prisma ORM
- Authentication: Custom credentials (hashed password + JWT cookie)
- Styling: Tailwind CSS + DaisyUI

Features

- Signup / login using email & password stored in the database
- Passwords hashed with bcrypt
- JWT stored in HTTP-only cookie for session management
- Protected routes enforced by middleware and server components
- CRUD user management for admins
- Dashboard for providers where they can create services and view customers
- Available slot utility and booking logic
- Responsive UI with DaisyUI

Environment

- `DATABASE_URL` points to Postgres
- `JWT_SECRET` used for signing tokens

Development

```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Build for production
npm start        # Start production server
npm run seed     # Seed database with sample data (password = 'password' for all accounts)
```
