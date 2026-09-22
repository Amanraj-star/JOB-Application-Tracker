# Pipeline — Job Application Tracker

A full-stack kanban board for tracking job applications through a placement season:
`Wishlist → Applied → OA → Interview → Offer`, with a `Rejected` column for anything
that falls through. Built as a personal tool (and a good resume/interview story since
you built it to solve your own problem).

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt password hashing
- **Frontend:** React + Vite (a lighter fit than Next.js for a single-page authenticated
  app with no SEO/SSR need — swap in Next.js later if you want file-based routing or SSR)
- **Auth model:** multi-user. Each user only ever sees their own applications.

## Project structure

```
job-tracker/
  backend/
    config/db.js            MongoDB connection
    middleware/auth.js      JWT verification
    middleware/errorHandler.js
    models/User.js
    models/Application.js   stage enum + auto-tracked timeline
    routes/auth.js          register / login / me
    routes/applications.js  CRUD + drag-and-drop move endpoint + stats
    server.js
    .env.example
  frontend/
    src/
      api.js               fetch wrapper, attaches JWT
      context/AuthContext.jsx
      components/          AuthLayout, KanbanColumn, ApplicationCard, ApplicationModal, ProtectedRoute
      pages/                Login, Register, Board
      stageConfig.js
      styles/global.css
    vite.config.js          proxies /api to the backend in dev
```

## Running it locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI (local mongod, or a free MongoDB Atlas cluster)
# and generate a JWT_SECRET, e.g.:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
npm run dev
```

The API starts on `http://localhost:5000`. Health check: `GET /api/health`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5173`. In dev, Vite proxies `/api/*` to the backend, so no
CORS config is needed locally — `CLIENT_ORIGIN` in the backend `.env` only matters once
you deploy the two separately.

### 3. Use it

Go to `http://localhost:5173/register`, create an account, and start adding applications.
Drag cards between columns to move them through the pipeline — each move is saved to the
backend and appended to that application's stage history (visible when you reopen a card).

## API reference

All `/api/applications/*` routes require `Authorization: Bearer <token>`.

| Method | Route                        | Purpose                              |
|--------|-------------------------------|---------------------------------------|
| POST   | `/api/auth/register`          | Create account, returns JWT           |
| POST   | `/api/auth/login`              | Returns JWT                          |
| GET    | `/api/auth/me`                 | Current user                         |
| GET    | `/api/applications`            | List all of the user's applications  |
| GET    | `/api/applications/stats`      | Counts per stage                     |
| POST   | `/api/applications`            | Create an application                |
| GET    | `/api/applications/:id`        | Get one application                  |
| PUT    | `/api/applications/:id`        | Edit fields (company, notes, etc.)   |
| PATCH  | `/api/applications/:id/move`   | Change stage + column position       |
| DELETE | `/api/applications/:id`        | Remove an application                |

## Notes on choices worth mentioning in an interview

- **Auth:** JWT rather than sessions, so the API stays stateless and the same backend
  could serve a future mobile client without changes.
- **Stage history:** a Mongoose pre-save hook appends to `timeline` whenever `stage`
  changes, so you get a free audit trail without extra write calls from the frontend.
- **Reordering:** the `/move` endpoint shifts sibling `order` values server-side so drag
  position is authoritative from the backend, not just the client's local state.
- **Optimistic UI:** the board updates immediately on drop, then reconciles with the
  server response — keeps drag-and-drop feeling instant on a slow connection.

## Extending it

- Add a `GET /api/applications/upcoming` route + a "next action" reminder digest.
- Add company logos via a favicon/Clearbit lookup on `company`.
- Swap the Vite frontend for Next.js if you want server-rendered pages or an API-route
  based backend instead of a separate Express service.
