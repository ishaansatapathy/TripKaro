# TripKaro 🌍

**TripKaro** is a modern, full-stack travel planning platform built for solo travelers and groups alike. Plan day-by-day itineraries, collaborate in real time, explore local spots on an interactive map, stay safe with one-tap SOS, discover community trips, and track every rupee of your travel budget — all in one place.

---

## ✨ Features

### 🗓️ Trip Planning
- Create and manage trips with custom date ranges
- Build **day-by-day itineraries** with activities, time slots, and cost estimates
- **Role-based access control** — Owner, Editor, and Viewer roles per trip
- Invite collaborators and plan together in real time (powered by Convex)
- **Checklist panels** to track packing lists and to-dos per trip
- **Reservation tracking** — hotels, restaurants, tours, and transport bookings
- **Attachment uploads** — share documents, tickets, and photos within a trip
- Inline **comment threads** on activities and days for team discussion

### 💰 Budget & Expense Tracking
- Log expenses by category: Hotel, Transport, Food, Tickets, Other
- Track who paid and split costs between trip members
- Visual budget summary panel per trip

### 🗺️ Smart Explorer
- **Interactive map** powered by Leaflet + OpenStreetMap
- Auto-detects your location and loads nearby places via the **Overpass API**
- Filter by: Attractions, Restaurants, Hospitals, Police stations
- **Turn-by-turn route planning** using the free OSRM routing engine
- Click any place to see name, address, phone, opening hours, and website

### 👥 Community Trips
- Browse **public group trips** with destinations, dates, difficulty, and open spots
- View trip details and request to join a travel group
- Trips range from easy beach getaways to hard high-altitude treks

### 💬 Traveler Chat
- Group chats and direct messages with fellow travelers
- View message history with timestamps and read receipts
- Chat UI with online presence indicators and unread message counts

### 🆘 Travel Safety (SOS)
- **One-tap SOS button** that shares your live location with emergency contacts
- Shows nearby **hospitals and police stations** on a map
- Works offline, 24/7 active
- Silent trigger support and safe-walk tracking

### 🏷️ Travel Deals
- Personalized deal discovery for flights, stays, and experiences
- Matched to your upcoming trips

### 🔐 Authentication
- Secure sign-in and sign-up via **Clerk**
- JWT-based authentication integrated with both the Express backend and Convex
- Protected routes — unauthenticated users are redirected to sign-in

### 🎨 UI & Animations
- Smooth scroll experiences powered by **Lenis**
- GSAP-powered animated text, blur transitions, and entrance effects
- 3D animated paper plane hero scene using **React Three Fiber + Three.js**
- Click spark effects, rotating headlines, and scroll-stacked cards
- Fully responsive, mobile-friendly design with **Tailwind CSS v4**

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | Core UI framework |
| Vite | Build tool and dev server |
| React Router DOM v7 | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| Shadcn/UI + Radix UI | Accessible UI components |
| Clerk (`@clerk/react`) | Authentication & user management |
| Convex | Real-time database & backend functions |
| Leaflet + React Leaflet | Interactive maps |
| Three.js + React Three Fiber | 3D scenes (hero plane animation) |
| GSAP + `@gsap/react` | Scroll and entrance animations |
| Lenis | Smooth scroll |
| Motion (Framer Motion) | UI micro-animations |
| Lucide React | Icon library |

### Backend (REST API)
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| Clerk (`@clerk/express`) | JWT auth middleware |
| Multer | File upload handling |
| CORS + dotenv | Config and cross-origin support |

### Real-time / Database
| Technology | Purpose |
|---|---|
| Convex | Real-time reactive database (trips, activities, comments, expenses, checklists, attachments, reservations) |

### External APIs
| API | Purpose |
|---|---|
| OpenStreetMap | Map tiles |
| Overpass API | Nearby places (attractions, restaurants, hospitals, police) |
| OSRM | Free turn-by-turn routing |
| Clerk | Authentication |

---

## 📁 Project Structure

```
trip-planner/
├── src/                        # Frontend source
│   ├── app/                    # Page components (route-based)
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/          # Trip dashboard
│   │   ├── trip-planning/      # Full itinerary planner
│   │   ├── explorer/           # Interactive map explorer
│   │   ├── community/          # Public community trips
│   │   ├── chat/               # Traveler messaging
│   │   ├── safety/             # SOS & safety tools
│   │   ├── deals/              # Travel deals
│   │   ├── sign-in/            # Auth pages
│   │   └── sign-up/
│   ├── components/             # Reusable UI components
│   │   ├── trip/               # Trip-specific components (ActivityCard, BudgetPanel, etc.)
│   │   └── ...                 # Animated UI, Navbar, Footer, etc.
│   └── lib/                    # Utilities and API helpers
├── convex/                     # Convex backend (real-time DB)
│   ├── schema.ts               # Full database schema
│   ├── trips.ts, activities.ts, expenses.ts, etc.
│   └── lib/permissions.ts      # Role-based access logic
├── backend/                    # Express REST API
│   ├── server.js
│   ├── routes/                 # trips, activities, expenses, comments, etc.
│   ├── models/                 # Mongoose models
│   └── middleware/auth.js      # Clerk JWT verification
└── public/                     # Static assets
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) account
- MongoDB instance (local or Atlas)

### 1. Install frontend dependencies
```bash
cd trip-planner
npm install
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root:
```env
VITE_CONVEX_URL=your_convex_deployment_url
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Create a `.env` file in `backend/`:
```env
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
PORT=5000
```

### 4. Run the development servers

Frontend:
```bash
npm run dev
```

Backend:
```bash
cd backend
npm run dev
```

Convex:
```bash
npx convex dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start frontend dev server (Vite) |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `cd backend && npm run dev` | Start backend with watch mode |
| `npx convex dev` | Start Convex real-time sync |

---

## 🔒 Security

- All protected routes require Clerk authentication
- Backend routes verify Clerk JWTs via middleware before any DB operation
- Role-based permissions enforced in Convex (`owner`, `editor`, `viewer`)
- File uploads validated and stored securely via Multer + Convex storage

---

## 🏆 Built For

**ChaiCode Hackathon** — Built with ❤️ to solve real travel pain points for modern Indian travelers.

