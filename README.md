# CCorp SIRTS

**Security Incident Response & Ticketing System** — my final year project for BSc (Hons) Cybersecurity & Networking.

A full-stack SOC ticketing tool: report, triage, and resolve incidents with role-based access (Admin / SOC Lead / Analyst / Viewer), a dashboard with incident stats, CVE enrichment via the NVD API on incident creation, and a full audit log of every status change.

I built it to combine two things my degree covers separately — incident response process (mapped to NIST SP 800-61) and secure full-stack development — into one working system, rather than a slide deck.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│         React 18 + Vite + Tailwind CSS + Recharts           │
│   LoginPage │ Dashboard │ Incidents │ Detail │ Admin Panel  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST (JWT Bearer Token)
┌──────────────────────▼──────────────────────────────────────┐
│                   EXPRESS.JS API (Port 5000)                 │
│  Auth Middleware → Role Guard → Controllers → Prisma ORM    │
│                                                             │
│  /api/auth    /api/incidents    /api/users    /api/dashboard │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              PostgreSQL Database (via Prisma ORM)           │
│   Users │ Incidents │ Comments │ AuditLogs │ Sessions       │
└─────────────────────────────────────────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │  NVD CVE API (External) │
          │  CVE enrichment on      │
          │  incident creation      │
          └─────────────────────────┘
```

`[SCREENSHOT: dashboard view]`
`[GIF: creating an incident → triaging → resolving, end to end]`

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Recharts |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | PostgreSQL via Prisma ORM |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **External API** | NVD CVE API (vulnerability enrichment) |
| **API Style** | RESTful JSON |

---

## Key Features

- **Role-Based Access Control** — ADMIN, SOC_LEAD, ANALYST, VIEWER roles with protected routes
- **Incident Lifecycle Management** — Create, update, escalate, resolve, and close incidents
- **SOC Dashboard** — Bar charts (incidents by day), pie charts (by category), stat cards, recent incidents feed
- **Incident Detail View** — Full incident metadata, status updates, comments/notes, audit log timeline
- **CVE Enrichment** — Incidents can be linked to CVE IDs with live data pulled from the NVD API
- **Admin Panel** — User role management and incident assignment in a tabbed interface
- **Audit Logging** — Every status change and action is logged with timestamp and actor
- **JWT Authentication** — Stateless auth with HTTP-only considerations
- **Dark Cybersecurity UI** — Tailwind CSS dark theme with severity/status colour-coded badges

---

## Project Structure

```
ccorp-sirts/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── api/             # Axios instance
│       ├── components/      # Navbar
│       ├── context/         # AuthContext (JWT)
│       └── pages/           # All page components
│           ├── LoginPage.jsx
│           ├── DashboardPage.jsx
│           ├── IncidentsPage.jsx
│           ├── IncidentDetailPage.jsx
│           ├── NewIncidentPage.jsx
│           └── UsersPage.jsx
│
└── server/                  # Express backend
    ├── controllers/         # Business logic
    ├── middleware/          # Auth + Role guards
    ├── prisma/
    │   ├── schema.prisma    # DB schema
    │   └── seed.js          # Demo data seeder
    └── routes/              # API routes
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/cyr6x/ccorp-sirts.git
cd ccorp-sirts

# Install server dependencies
cd server && npm install

# Install client dependencies
cd client && npm install
```

### 2. Configure Environment

```bash
# server/.env (use .env.example as reference)
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ccorp_sirts"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
DIRECT_URL="postgresql://USER:PASSWORD@localhost:5432/ccorp_sirts"

# client/.env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Setup

```bash
cd server

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed demo data
npx prisma db seed
```

### 4. Run the Dev Servers

```bash
# Terminal 1 — Backend (port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

Open http://localhost:5173 in your browser.

---

## Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| Admin | `admin@ccorp.local` | `Admin@1234` | Full system access |
| SOC Lead | `lead@ccorp.local` | `Lead@1234` | Manage incidents, assign analysts |
| Analyst | `analyst@ccorp.local` | `Analyst@1234` | Create and work incidents |
| Viewer | `viewer@ccorp.local` | `Viewer@1234` | Read-only access |

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/auth/me` | Get current user |

### Incidents
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/incidents` | List all incidents |
| GET | `/api/incidents/:id` | Get incident + comments + audit log |
| POST | `/api/incidents` | Create new incident |
| PATCH | `/api/incidents/:id` | Update incident |
| DELETE | `/api/incidents/:id` | Delete (Admin only) |
| POST | `/api/incidents/:id/comments` | Add comment |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users (Admin) |
| PATCH | `/api/users/:id` | Update user role (Admin) |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Incident stats for dashboard charts |

---

## Incident Categories

`PHISHING` `MALWARE` `UNAUTHORIZED_ACCESS` `DDoS` `DATA_BREACH` `INSIDER_THREAT` `OTHER`

## Severity Levels

| Level | Colour | SLA |
|---|---|---|
| CRITICAL | 🔴 Red | Immediate response required |
| HIGH | 🟠 Orange | Respond within 1 hour |
| MEDIUM | 🟡 Yellow | Respond within 4 hours |
| LOW | 🟢 Green | Respond within 24 hours |

---

## What this demonstrates

Final year project for BSc (Hons) Cybersecurity and Networking — incident response workflow aligned to NIST SP 800-61 (Identify → Contain → Eradicate → Recover → Lessons Learned), combined with secure full-stack development: JWT auth, role-based authorisation, password hashing, protected routes, and input validation throughout.

---

## Roadmap

- [ ] Record a demo GIF
- [ ] Export the architecture as a proper diagram
- [ ] Add CVSS score display to CVE enrichment
- [ ] Email notification on CRITICAL incident creation
- [ ] Dockerise the full stack for one-command startup

---

## License

MIT — Academic use permitted with attribution.
