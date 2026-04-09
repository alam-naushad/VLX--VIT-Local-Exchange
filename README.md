# VLX Marketplace (MVP v1)

Monorepo with:

- `backend/`: Express + MongoDB (Mongoose) API
- `frontend/`: React + Vite + Tailwind UI

## Features in MVP v1

- Signup/login with **@vitstudent.ac.in** email verification (OTP)
- Profile page (name/year/WhatsApp number)
- Create listings with image upload (Cloudinary)
- Browse + search + filter listings
- Product detail page + **WhatsApp seller** CTA
- Mark own listing as **sold**
- Report listing
- Basic admin moderation (`/admin`)

## Local setup

### 1) Backend

Create `backend/.env` using `backend/.env.example` as a template.

Required:

- `MONGO_URI`
- `JWT_SECRET`
- `EMAIL_USERNAME` / `EMAIL_PASSWORD` (Gmail app password recommended)
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
- `CORS_ORIGINS` (comma-separated allowed frontend origins)
- Optional: `ADMIN_EMAIL` (the user registered with this email becomes `admin`)

Run:

```bash
cd backend
npm install
npm run dev
```

### 2) Frontend

In `frontend/.env`, set either:

- `VITE_API_URL=https://<your-backend>/api`
  - or -
- `VITE_API_BASE_URL=https://<your-backend>`

Run:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (usually `http://localhost:5173/` or next free port).

## Deployment notes

- Do **not** commit `.env` files (they contain secrets).
- If you ever accidentally exposed secrets, **rotate them immediately** (MongoDB password, JWT secret, Gmail app password, Cloudinary keys).
- Deploy backend and frontend separately.
- Frontend must point to backend via `VITE_API_URL` or `VITE_API_BASE_URL`.

