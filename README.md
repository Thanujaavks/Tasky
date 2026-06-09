# Taskly — Employee Task Management App

A full-stack mobile application for employee task management, built with React Native (Expo), NativeWind, Node.js, Express.js, and MySQL.

## Features

### Admin
- Dashboard with real-time task statistics and team performance
- Full task CRUD (create, view, update, delete)
- Assign tasks to employees with priority and due dates
- Employee management (create, view, update, deactivate)
- Task filtering by status and priority, search

### Employee
- Personal dashboard with progress tracking
- View all assigned tasks with status and priority badges
- Update task status (Pending → In Progress → Completed)
- Add comments/activity notes to tasks
- Profile management and password change

### Bonus Features
- Task search (real-time debounced)
- Status and priority filtering with chips
- Pull-to-refresh on all list screens
- Dark mode support (system-aware via NativeWind)
- Overdue task detection and alerts

---

## Project Structure

```
Taskly/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/          # DB connection pool
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # JWT auth middleware
│   │   └── routes/          # API routes
│   ├── database/
│   │   └── schema.sql       # MySQL schema + seed data
│   ├── .env.example
│   └── package.json
└── frontend/                # React Native Expo app
    ├── app/                 # Expo Router screens
    │   ├── (auth)/          # Login
    │   ├── (admin)/         # Admin tabs & screens
    │   └── (employee)/      # Employee tabs & screens
    ├── components/          # Shared UI components
    ├── contexts/            # Auth context
    ├── services/            # API client
    └── types/               # TypeScript types
```

---

## Prerequisites

- Node.js 18+
- MySQL 8.0+
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Expo Go app

---

## Backend Setup

```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# Start the server
npm run dev   # development (nodemon)
npm start     # production
```

### Environment Variables (`.env`)

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=taskly_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
```

---

## Database Setup

```sql
-- Run the schema file in MySQL Workbench or CLI:
mysql -u root -p < backend/database/schema.sql
```

This creates the database, tables, and seeds demo accounts:

| Account | Email | Password | Role |
|---------|-------|----------|------|
| System Admin | admin@taskly.com | Admin@123 | admin |
| Alice Johnson | alice@taskly.com | Employee@123 | employee |
| Bob Smith | bob@taskly.com | Employee@123 | employee |
| Carol White | carol@taskly.com | Employee@123 | employee |

---

## Frontend Setup

```bash
cd frontend
npm install --legacy-peer-deps

# Update your backend IP in services/api.ts:
# const BASE_URL = 'http://<YOUR_MACHINE_IP>:5000/api';

# Start Expo
npm start

# Scan QR with Expo Go (Android) or press 'a' for Android emulator
```

> **Important:** Replace `192.168.1.100` in `frontend/services/api.ts` with your actual machine's local IP address (find it with `ipconfig` on Windows or `ifconfig` on Mac/Linux). Both your device and machine must be on the same Wi-Fi network.

---

## Build APK

```bash
cd frontend

# Install EAS CLI
npm install -g eas-cli
eas login

# Configure build
eas build:configure

# Build APK for Android
eas build --platform android --profile preview
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Get current user |

### Tasks (requires auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filter: status, priority, search) |
| GET | `/api/tasks/:id` | Get task + comments |
| POST | `/api/tasks` | Create task (admin only) |
| PUT | `/api/tasks/:id` | Update task (admin only) |
| PATCH | `/api/tasks/:id/status` | Update status |
| DELETE | `/api/tasks/:id` | Delete task (admin only) |
| GET | `/api/tasks/stats` | Task statistics |

### Users (requires auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/employees` | List employees (admin) |
| POST | `/api/users/employees` | Create employee (admin) |
| PUT | `/api/users/employees/:id` | Update employee (admin) |
| DELETE | `/api/users/employees/:id` | Deactivate employee (admin) |
| PUT | `/api/users/profile` | Update own profile |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native, Expo SDK 56, TypeScript |
| Styling | NativeWind 4 (Tailwind CSS) |
| Navigation | Expo Router (file-based) |
| Storage | AsyncStorage (session persistence) |
| Backend | Node.js, Express.js |
| Database | MySQL 8 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
