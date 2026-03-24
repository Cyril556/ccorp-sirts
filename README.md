# CCorp SIRTS

**Security Incident Response & Ticketing System** — BSc (Hons) Cybersecurity & Networking | Final Year Project

> A full-stack web application for Security Operations Centre (SOC) teams to report, track, triage, and resolve security incidents with role-based access control, real-time dashboards, and a complete audit trail.

---

## Features

- **Role-Based Access Control** — ADMIN, SOC_LEAD, ANALYST, VIEWER roles with protected routes
- **Incident Lifecycle Management** — Create, update, escalate, resolve, and close incidents
- **SOC Dashboard** — Bar charts (incidents by day), pie charts (by category), stat cards, recent incidents feed
- **Incident Detail View** — Full incident metadata, status updates, comments/notes, audit log timeline
- **Admin Panel** — User role management and incident assignment in a tabbed interface
- **Audit Logging** — Every status change and action is logged with timestamp and actor
- **JWT Authentication** — Stateless auth with HTTP-only considerations
- **Dark Cybersecurity UI** — Tailwind CSS dark theme with severity/status colour-coded badges

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Recharts |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | PostgreSQL via Prisma ORM |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **API** | RESTful JSON API |

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
git clone https://github.com/Cyril556/ccorp-sirts.git
cd ccorp-sirts

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment

```bash
# server/.env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ccorp_sirts"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000

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

### 4. Run Development Servers

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

## API Endpoints

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

| Level | Colour | Description |
|---|---|---|
| CRITICAL | Red | Immediate response required |
| HIGH | Orange | Respond within 1 hour |
| MEDIUM | Yellow | Respond within 4 hours |
| LOW | Green | Respond within 24 hours |

---

## Academic Context

This project was developed as the Final Year Project for BSc (Hons) Cybersecurity and Networking. It demonstrates practical application of:

- **Network Security** — JWT authentication, role-based authorisation
- **Incident Response** — Structured IR workflow (identify, contain, eradicate, recover)
- **Secure Development** — Password hashing, protected API routes, input validation
- **SOC Operations** — Analyst workflows, escalation paths, audit trails

---

## License

MIT — Academic use permitted with attribution.
