# TripKaro

TripKaro is a full-stack travel planning platform for solo travelers and groups. Plan trips day-by-day, collaborate with members, explore nearby places on maps, discover community trips, chat with travelers, and track travel deals.

## Live Deployment

- Frontend (Vercel): https://trip-karo.vercel.app
- Backend API (Render): https://tripkaro.onrender.com
- Health check: https://tripkaro.onrender.com/api/health

## Core Features

### Trip Planning
- Create and manage trips with date ranges.
- Build day-by-day itineraries with activities and costs.
- Role-based access (`owner`, `editor`, `viewer`).
- Reservations, checklists, comments, and file attachments.

### Community Trips
- Browse public trips by difficulty and availability.
- Working filters: `All`, `Easy`, `Moderate`, `Hard`, `This Month`, `Spots Available`.
- Join trips with live state updates (joined count and spots left).
- Join state persists in browser storage.

### Traveler Chat
- Separate conversation thread per chat item.
- Functional `All / Groups / Direct` tabs.
- Search conversations.
- Send messages into the currently selected thread.

### Smart Explorer
- Interactive map with Leaflet + OpenStreetMap.
- Nearby places from Overpass API.
- Route drawing using OSRM.
- Category-based discovery (attractions, restaurants, hospitals, police).

### Travel Deals
- Search deals by route (`from`, `to`) with sorting and filters.
- Case-insensitive route matching on backend.
- Deal cards with provider, airline, price, and redirect link.

### Safety
- SOS page and nearby emergency location support.

### Authentication
- Clerk auth on frontend and backend.
- Protected flows for signed-in user actions.

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- React Router
- Tailwind CSS
- Clerk (`@clerk/react`)
- Convex client
- Leaflet / React Leaflet

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Clerk (`@clerk/express`)
- CORS + dotenv
- Multer (uploads)

### External APIs
- OpenStreetMap (tiles)
- Overpass API (places)
- OSRM (routing)

## Project Structure

```text
trip-planner/
|- src/                      # Frontend
|  |- app/                   # Route pages
|  |- components/            # Reusable components
|  `- lib/                   # API helpers and utilities
|- backend/                  # Express API
|  |- controllers/
|  |- routes/
|  |- models/
|  `- scripts/               # seed scripts
|- convex/                   # Convex functions/schema
`- public/
```

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas (or local MongoDB)
- Clerk app
- Convex project

### 1) Install dependencies

```bash
npm install
cd backend && npm install
```

### 2) Frontend env (`.env.local` in repo root)

```env
VITE_API_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_CONVEX_URL=https://<your-project>.convex.cloud
```

### 3) Backend env (`backend/.env`)

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>
CLERK_SECRET_KEY=sk_...
CLERK_PUBLISHABLE_KEY=pk_...
FRONTEND_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

### 4) Run services

```bash
# frontend (root)
npm run dev

# backend
cd backend
npm run dev
```

Optional Convex dev:

```bash
npx convex dev
```

## Production Deployment (Current Setup)

- Frontend: Vercel (root project)
- Backend: Render (`rootDir: backend`)
- Database: MongoDB Atlas
- Realtime: Convex cloud

### Required Vercel env vars

```env
VITE_API_URL=https://tripkaro.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_CONVEX_URL=https://<your-project>.convex.cloud
```

### Required Render env vars

```env
MONGODB_URI=mongodb+srv://...
CLERK_SECRET_KEY=sk_...
CLERK_PUBLISHABLE_KEY=pk_...
FRONTEND_URL=https://trip-karo.vercel.app
NODE_ENV=production
```

## Useful Scripts

### Root
- `npm run dev` - start frontend dev server
- `npm run build` - build frontend
- `npm run lint` - run lint

### Backend (`backend/`)
- `npm run dev` - start backend in watch mode
- `npm run start` - start backend
- `npm run seed:deals` - seed deals collection

## Notes

- Render free tier can sleep on inactivity; first request may be slow.
- Keep Clerk and Mongo credentials private.
- Rotate keys/passwords if they were exposed.

## Hackathon

Built for ChaiCode Hackathon.