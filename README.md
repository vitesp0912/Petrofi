## PetroFi Landing Page – Dev Setup

This repo contains the **PetroFi marketing site**:
- **Frontend**: React (CRA + Tailwind + shadcn-style UI)
- **Demo form**: currently sends details via email from the user’s mail client (no backend storage yet)

### Project structure

- **`frontend/`** – React single-page landing site (deploy this folder to Vercel)
  - `src/App.js` – main page layout (all sections)
  - `src/components/` – page sections (`HeroSection`, `DemoSection`, etc.)
  - `src/components/ui/` – reusable UI primitives (buttons, inputs, cards…)
  - `src/hooks/` – scroll animations, toast hook
  - `api/send-demo-mail.js` – Vercel serverless function: sends demo form via SMTP (uses env vars)
  - `tailwind.config.js`, `postcss.config.js`, `craco.config.js` – styling/build config
- **`memory/PRD.md`** – product requirements and feature list
- **`design_guidelines.json`** – visual/design system and layout guidelines
- **`test_result.md`** – shared test state (for automated agents; keep as-is)
- **`test_reports/`** – historical test artifacts (safe to delete if you don’t need them)

---

### Prerequisites

- **Node.js** 18+ and **Yarn** (v1)

---

### 1. Frontend – React app

From the repo root:

```bash
cd frontend
yarn install
```

Optional: copy `frontend/.env.example` to `frontend/.env` and set SMTP variables for the demo form API (see **Demo form & SMTP** below). Do not commit `.env` (it is in `.gitignore`).

Now run the dev server:

```bash
cd frontend
yarn start
```

This will start the CRA dev server (via `craco`) on `http://localhost:3000`.

---

### 2. Demo form & SMTP (Vercel)

- The **Book Your Free Demo** form first POSTs to `/api/send-demo-mail` (Vercel serverless function). If that succeeds, the request is sent by email via SMTP and the user sees “Request received!”.
- If the API is unavailable or misconfigured, the site falls back to opening the user’s email client (`mailto:`) so the request can still be sent.

**Environment variables (set in Vercel Dashboard → Settings → Environment Variables, or in `frontend/.env` for local):**

| Variable | Description |
|----------|-------------|
| `SMTP_MAIL_HOST` | e.g. `smtp.gmail.com` |
| `SMTP_MAIL_PORT` | e.g. `587` |
| `SMTP_MAIL_USER` | Sender email (e.g. `petrofibusiness@gmail.com`) |
| `SMTP_MAIL_APP_PASSWORD` | Gmail App Password (not your normal password; create at [Google App Passwords](https://myaccount.google.com/apppasswords)) |
| `DEMO_MAIL_TO` | Where to receive demo requests (e.g. same as `SMTP_MAIL_USER`) |

See `frontend/.env.example` for a template. The API runs only when deployed on Vercel (or when using `vercel dev` locally); with `yarn start` alone, the form will use the mailto fallback.
