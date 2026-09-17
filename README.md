# BookMySeat — Smart Library Seat Reservation System

## What's in this scaffold

```
bookmyseat/
├── backend/
│   ├── config/db.js                  MongoDB connection
│   ├── models/
│   │   ├── User.js                   auth + bcrypt password hashing
│   │   ├── Seat.js                   seat layout (zone, row/col for grid rendering)
│   │   └── Reservation.js            the core entity — see status lifecycle below
│   ├── middleware/auth.js            JWT verification + role guard
│   ├── controllers/
│   │   ├── authController.js         register / login / me
│   │   ├── seatController.js         layout + availability + admin CRUD
│   │   ├── reservationController.js  booking, overlap detection, check-in, cancel
│   │   └── adminController.js        reservation oversight + usage stats
│   ├── routes/                       one file per resource
│   ├── utils/expireReservations.js   shared no-show sweep logic
│   ├── seed.js                       creates admin + student + ~50 seats
│   └── server.js                     Express app + cron job (runs every minute)
└── frontend-example/
    ├── SeatGrid.jsx                  seat map — the signature "departure board" screen
    ├── tailwind.config.js            dark theme tokens: colors, fonts, glow shadows, keyframes
    └── src/
        ├── index.css                  font imports + scanline/perforation textures
        ├── api.js                    fetch wrapper (register/login/me)
        ├── AuthContext.jsx           token persistence + hydration on load
        ├── Login.jsx                 login form
        ├── Register.jsx              registration form
        ├── RequireAuth.jsx           route guard (auth + optional role check)
        ├── ReservationHistory.jsx    list, check-in, cancel, filter by upcoming/past
        ├── AdminDashboard.jsx        stat cards, status breakdown, filterable reservation table
        └── App.jsx                   wires auth flow → role-aware tabbed dashboard
```

## Setup

```bash
cd backend
npm install
cp .env.example .env      # edit MONGO_URI / JWT_SECRET as needed
npm run seed               # creates admin@library.com / admin123 and student@library.com / student123
npm run dev                 # starts on http://localhost:5000
```

You'll need a local MongoDB running, or swap `MONGO_URI` in `.env` for an Atlas connection string.
The transaction used in `reservationController.js` requires MongoDB to be running as a replica set
(Atlas does this automatically; locally you can init a single-node replica set with `rs.initiate()`
in the mongo shell, or run `mongod --replSet rs0`).

## Reservation status lifecycle

```
booked → checked-in → completed
   │
   ├──→ cancelled        (student/admin cancels before check-in)
   └──→ expired           (checkInDeadline passes with no check-in)
```

`checkInDeadline` is `startTime + CHECKIN_GRACE_MINUTES` (default 15 min, set in `.env`).
Expiry happens two ways, both calling the same `expireOverdueReservations()`:
- **Lazily** — before every availability check and admin read, so a seat never appears "taken" past its deadline.
- **Actively** — a `node-cron` job in `server.js` sweeps every minute, so seats free up close to real-time even with no one browsing.

## Overlap / double-booking prevention

Since time slots are flexible (custom start/end, not fixed blocks), a booking conflicts with another if:

```
existing.startTime < new.endTime  AND  existing.endTime > new.startTime
```

`createReservation` runs this check and the insert inside a MongoDB transaction to close the race window
where two students could both pass the conflict check before either insert commits.

## Frontend auth flow

`frontend-example/src/` is a Vite + React + Tailwind setup (bring your own `vite.config.js` / `index.html` /
Tailwind config — this is just the app code). To wire it into a real project:

```bash
npm create vite@latest bookmyseat-frontend -- --template react
cd bookmyseat-frontend
npm install
npx tailwindcss init -p   # or your preferred Tailwind setup
# copy frontend-example/SeatGrid.jsx to src/
# copy frontend-example/src/* into src/
```

Set `VITE_API_URL` in a `.env` file at the frontend root (defaults to `http://localhost:5000` if unset).

**How it fits together:**
- `AuthContext.jsx` stores the JWT in `localStorage`, and re-validates it against `GET /api/auth/me` on
  every page load — so a stale/expired token gets cleared automatically instead of silently failing later.
- `Login.jsx` / `Register.jsx` are plain forms that call `login()` / `register()` from the context.
- `RequireAuth.jsx` is a guard you can wrap around any page: `<RequireAuth role="admin"><AdminDashboard /></RequireAuth>`.
- `App.jsx` shows the full flow end-to-end: unauthenticated → `AuthGate` (login/register toggle);
  authenticated → `Dashboard` (header + `SeatGrid`).

`ReservationHistory.jsx` lists the student's reservations (filterable by all/upcoming/past), shows a
live countdown to the check-in deadline once it's under 5 minutes away (styled red as a warning), and
exposes Check-in / Cancel actions inline. It polls `/api/reservations/me` every 30s so an expiry that
happened server-side (via cron) or on another device shows up without a manual refresh.

The admin dashboard (`AdminDashboard.jsx`, only reachable by `role="admin"`) shows:
- Stat cards: total seats, total reservations, no-show rate (`expired` + `no-show` as a % of all
  reservations), and the single busiest hour of day.
- A status breakdown strip across all six lifecycle states.
- A filterable table (by date and status) of every reservation system-wide, with an admin-side Cancel
  action for any still-active booking.

`App.jsx` branches by role: students see Reserve / My reservations tabs, admins see a single
Dashboard tab and skip the student-facing views entirely.

## Visual design

The frontend uses a dark "reading-room terminal" theme instead of a generic light dashboard:

- **Palette** — near-black navy background (`ink`), glowing lime for available/success, magenta for
  booked/expired/alerts, violet for selection, amber for check-in countdowns.
- **Type** — `Archivo Black` for display headings, `IBM Plex Mono` for data (seat codes, timestamps,
  labels), `Inter` for body text. Loaded via Google Fonts in `src/index.css`.
- **Signature element** — the seat grid (`SeatGrid.jsx`) renders seats like lights on a departure board:
  lime glow when open, violet pulse when selected, and a rotated "RESERVED" stamp animation on booking.
  Reservation history (`ReservationHistory.jsx`) renders each booking as a perforated ticket stub you can
  tear off (cancel) or check in from.
- All tokens live in `tailwind.config.js` (colors, fonts, glow shadows, keyframes) and `src/index.css`
  (font import, scanline/perforation textures, reduced-motion overrides).

To use it: make sure your Vite project's Tailwind config points at these files (or copy
`tailwind.config.js` in as-is), and import `src/index.css` once in your entry point (`main.jsx`):

```js
import './index.css';
```

## Next steps to build out

1. ~~Auth pages (login/register)~~ — done, see `frontend-example/src/`.
2. ~~Reservation history page + check-in button~~ — done, `ReservationHistory.jsx`.
3. ~~Admin dashboard~~ — done, `AdminDashboard.jsx`.
4. Add request validation (e.g. `express-validator` or `zod`) on top of the manual checks already in the controllers.
5. Rate-limit `/api/auth/login` to slow down brute-force attempts.
6. Consider a `Zone`/`Floor` collection if you want zones to have their own metadata (capacity, description) rather than being a plain string on `Seat`.
7. Add automated tests for the overlap logic specifically — it's the piece most worth proving correct with unit tests (e.g. adjacent-but-non-overlapping slots, fully-contained slots, partial overlaps).
