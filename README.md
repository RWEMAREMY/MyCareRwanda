# MyCareRwanda

MyCareRwanda is a caregiving platform that helps families quickly connect with trusted caretakers for hospital and home support in Rwanda.

The project currently includes a React frontend and an Express + MongoDB backend, with authentication, role management, caregiver discovery, and instant care request APIs.

## What This Project Does

- Helps families find and request caregivers based on care type and district.
- Supports account registration and login (email/password).
- Supports Google authentication.
- Provides password change and forgot-password (OTP by email) flows.
- Includes admin endpoints for listing users and updating user roles.
- Includes seed tooling to create an initial admin user.

## Tech Stack

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: MongoDB
- Email: Nodemailer (SMTP)
- Auth: Custom JWT-based auth + Google token verification

## Repository Structure

```text
MyCareRwanda/
  client/   # React application
  server/   # Express API
```

## Prerequisites

- Node.js 18+
- npm 9+
- A running MongoDB instance (local or Atlas)
- SMTP credentials for password reset emails (optional for local testing)

## Installation

1. Clone the repository.

```bash
git clone <your-repo-url>
cd MyCareRwanda
```

2. Install client dependencies.

```bash
npm -C client install
```

3. Install server dependencies.

```bash
npm -C server install
```

## Environment Setup

### Server environment

Create `server/.env` from `server/.env.example` and fill real values:

```bash
cp server/.env.example server/.env
```

Required/important fields:

- `PORT` (example: `5050`)
- `CLIENT_ORIGIN` (example: `http://localhost:5173`)
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `GOOGLE_CLIENT_ID` (for Google login)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (for OTP email)

### Client environment

Create `client/.env` (if missing) and set at least:

```env
VITE_API_BASE_URL=http://localhost:5050
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
```

## Running the Project

Run backend:

```bash
npm -C server run dev
```

Run frontend (new terminal):

```bash
npm -C client run dev
```

Open the app at:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5050`

## Optional: Seed Admin User

To create/update the default admin user:

```bash
npm -C server run seed
```

Default seeded admin email:

- `admin@mycarerwanda.com`

## Main API Endpoints

- `GET /` health-style message
- `GET /api/care-categories`
- `GET /api/caregivers`
- `POST /api/requests/instant-care`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `POST /api/auth/forgot-password/request-otp`
- `POST /api/auth/forgot-password/reset`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:userId/role`

## Current Roles

- `client`
- `hospital-caretaker`
- `children-caretaker`
- `admin`

## Notes

- If SMTP is not configured, OTP emails are not sent and OTP values are logged for development.
- Ensure `CLIENT_ORIGIN` matches your frontend URL to avoid CORS issues.
- The project status is active development; more booking/payment workflows are planned.

## Brand

**MyCareRwanda — Trusted Care for Your Loved Ones**
