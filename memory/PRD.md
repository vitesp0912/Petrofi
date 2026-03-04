# PetroFi Landing Page — PRD

## Problem Statement
Build a premium SaaS landing page for PetroFi — a petrol pump operations management platform targeted at petrol pump owners and managers in India. Goal: generate demo requests. Single-page scrolling website.

## Architecture
- **Frontend**: React (CRA + Tailwind CSS + Lucide React + Recharts)
- **Backend**: FastAPI (Python) + MongoDB
- **Fonts**: Outfit (headings) + Plus Jakarta Sans (body) via Google Fonts
- **Colors**: Navy #0D1B3E | Sky Blue #38B6FF | White | Black

## What's Been Implemented (Feb 2026)

### Frontend Sections (13 complete sections)
1. **Navbar** — Sticky glassmorphism, logo, nav links, Book Demo CTA, mobile hamburger menu
2. **Hero** — Split layout, gradient headline, 3 CTAs (Book Demo, Download App, Watch Tour), CSS dashboard mockup, trust badges, floating profit/shift badges
3. **Problem** — 4 pain point cards (Manual Registers, Cash Mismatch, Staff Accountability, Credit Chaos)
4. **Solution** — Before/after transformation visual, 5 checkpoints
5. **Modules** — 6 bento grid cards (Sales Tracking, Cash Reconciliation, Credit Ledger, Staff & Shift, Expense Tracking, Reports)
6. **Dashboard** — Dark navy section, 6 metric cards, Recharts AreaChart (weekly sales + digital)
7. **Benefits** — 6 benefit items with checkmarks
8. **Owner/Manager** — Tabbed toggle, 4 items each for owner and manager personas
9. **Screenshots** — 7 CSS phone mockups (Dashboard, Sales Entry, Digital Payments, Credit Ledger, Expense Entry, Reports, Shifts)
10. **Testimonials** — 3 cards with star ratings, placeholder testimonials
11. **Demo Form** — 5-field form (Name, Pump Name, City, Phone, Email) → saves to MongoDB
12. **Download** — App Store + Google Play buttons with real links
13. **Final CTA** — "Stop Managing With Registers" headline + 2 buttons
14. **Footer** — Logo, 4 link columns, email, app store links

### Backend API
- `GET /api/` — health check
- `POST /api/demo-request` — saves demo request to MongoDB `demo_requests` collection
- `GET /api/demo-requests` — lists all demo requests

### Animations
- CSS fade-up + fade-left/right with IntersectionObserver hook (useScrollAnimation)
- Transition delays for staggered card reveals
- Floating hero dashboard mockup animation

## App Store Links
- iOS: https://apps.apple.com/in/app/petrofi/id6758732447
- Android: https://play.google.com/store/apps/details?id=com.petrofi.app&hl=en_IN

## Test Results
- Backend: 5/5 tests passed ✅
- Frontend: 13/13 sections pass ✅
- Demo form submission → MongoDB verified ✅

## Prioritized Backlog

### P0 (Blocking for production)
- [ ] Add SMTP email notifications for demo form submissions (user will add later)
- [ ] Add rate limiting on /api/demo-request endpoint
- [ ] Replace placeholder testimonials with real pump owner quotes

### P1 (High value)
- [ ] Add real app screenshots when available
- [ ] Add Google Analytics / tracking for conversion events
- [ ] Add WhatsApp chat widget for instant inquiries
- [ ] Admin dashboard to view/export demo requests

### P2 (Nice to have)
- [ ] Add /api/demo-requests auth protection
- [ ] SEO meta tags and Open Graph
- [ ] Blog/resources page
- [ ] Multi-language support (Hindi)
