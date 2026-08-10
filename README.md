# Social Media Content Creation & Publishing Platform

A full-stack web application for creating, reviewing, scheduling, and publishing social media content across multiple platforms. Built with React, Node.js, Express, and MySQL.

## Features

- **User Authentication** — Registration, login, logout with JWT-based auth and bcrypt password hashing
- **Role-Based Access Control** — Admin, Content Creator, and Reviewer roles with protected routes
- **Content Management** — Full CRUD operations with search and filter by platform/status
- **Content Workflow** — Draft → Pending Review → Approved → Scheduled → Published (with rejection path)
- **Review System** — Reviewers can approve or reject content with comments
- **Publishing & Scheduling** — Schedule approved content and publish when ready
- **Dashboard** — Statistics overview with charts (status distribution, platform breakdown)
- **User Management** — Admin panel for managing users and roles

## Technology Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | React.js, React Router, Recharts |
| Backend    | Node.js, Express.js           |
| Database   | MySQL (mysql2 driver)         |
| Auth       | JWT, bcrypt                   |
| API        | REST API                      |
| Styling    | CSS                           |

## Prerequisites

- **Node.js** v18 or higher
- **MySQL** v8.0 or higher
- **npm** v9 or higher

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd social-media-content-platform
```

### 2. Set up the database

Start MySQL and run the schema:

```bash
mysql -u root -p < database/schema.sql
```

Seed the database with sample data (recommended — generates proper bcrypt password hashes):

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npm run seed
```

Alternatively, use the SQL seed file directly (requires pre-generated bcrypt hashes):

```bash
mysql -u root -p < database/seed.sql
```

### 3. Configure environment variables

Copy the example env file and update values:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=social_media_platform
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:5173
```

### 4. Install and run the backend

```bash
cd server
npm install
npm run dev
```

The API runs at `http://localhost:5000`.

### 5. Install and run the frontend

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Sample Login Credentials

All sample users use the password: **Password123!**

| Role            | Email                |
|-----------------|----------------------|
| Admin           | admin@platform.com   |
| Content Creator | sarah@platform.com   |
| Content Creator | mike@platform.com    |
| Reviewer        | lisa@platform.com    |
| Reviewer        | john@platform.com    |

## Project Structure

```
social-media-content-platform/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context provider
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                  # Express backend
│   ├── config/              # Database configuration
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth & error middleware
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── services/            # Validation & business logic
│   ├── scripts/             # Database seed script
│   ├── tests/               # API tests
│   └── server.js
├── database/
│   ├── schema.sql           # Database schema
│   └── seed.sql             # Sample data
└── README.md
```

## Database Schema

### Entity Relationship

```
users (1) ──── (N) social_contents
                      │
                      ├── (N) content_reviews ──── (1) users (reviewer)
                      │
                      └── (1) publishing_schedule
```

### Tables

**users**
| Column     | Type         | Description              |
|------------|--------------|--------------------------|
| id         | INT PK       | Auto-increment ID        |
| name       | VARCHAR(100) | Full name                |
| email      | VARCHAR(255) | Unique email             |
| password   | VARCHAR(255) | bcrypt hashed password   |
| role       | ENUM         | admin, content_creator, reviewer |
| created_at | TIMESTAMP    | Creation timestamp       |
| updated_at | TIMESTAMP    | Last update timestamp    |

**social_contents**
| Column       | Type         | Description                        |
|--------------|--------------|------------------------------------|
| id           | INT PK       | Auto-increment ID                  |
| title        | VARCHAR(255) | Content title                      |
| caption      | TEXT         | Post caption/body                  |
| media_url    | VARCHAR(500) | URL to media asset                 |
| platform     | ENUM         | instagram, facebook, twitter, etc. |
| hashtags     | VARCHAR(500) | Hashtag string                     |
| status       | ENUM         | Workflow status                    |
| scheduled_at | DATETIME     | Scheduled publish time             |
| created_by   | INT FK       | References users.id                |
| created_at   | TIMESTAMP    | Creation timestamp                 |
| updated_at   | TIMESTAMP    | Last update timestamp              |

**content_reviews**
| Column      | Type      | Description              |
|-------------|-----------|--------------------------|
| id          | INT PK    | Auto-increment ID        |
| content_id  | INT FK    | References social_contents.id |
| reviewer_id | INT FK    | References users.id      |
| status      | ENUM      | approved, rejected       |
| comments    | TEXT      | Review feedback          |
| reviewed_at | TIMESTAMP | Review timestamp         |

**publishing_schedule**
| Column       | Type      | Description                    |
|--------------|-----------|--------------------------------|
| id           | INT PK    | Auto-increment ID              |
| content_id   | INT FK    | References social_contents.id  |
| scheduled_at | DATETIME  | Scheduled publish time         |
| published_at | DATETIME  | Actual publish time            |
| status       | ENUM      | scheduled, published, cancelled |

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint          | Auth | Description        |
|--------|-------------------|------|--------------------|
| POST   | /auth/register    | No   | Register new user  |
| POST   | /auth/login       | No   | Login              |
| POST   | /auth/logout      | Yes  | Logout             |
| GET    | /auth/profile     | Yes  | Get current user   |

### Users (Admin only)

| Method | Endpoint    | Description    |
|--------|-------------|----------------|
| GET    | /users      | List all users |
| GET    | /users/:id  | Get user by ID |
| PUT    | /users/:id  | Update user    |
| DELETE | /users/:id  | Delete user    |

### Content

| Method | Endpoint              | Roles                  | Description          |
|--------|-----------------------|------------------------|----------------------|
| GET    | /content              | All                    | List content (filter: ?status=&platform=&search=) |
| GET    | /content/:id          | All                    | Get content by ID    |
| POST   | /content              | Admin, Creator         | Create content       |
| PUT    | /content/:id          | Admin, Creator         | Update content       |
| DELETE | /content/:id          | Admin, Creator         | Delete content       |
| POST   | /content/:id/submit   | Admin, Creator         | Submit for review    |
| POST   | /content/:id/schedule | Admin, Creator         | Schedule content     |
| POST   | /content/:id/publish  | Admin                  | Publish content      |

### Reviews (Admin, Reviewer)

| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| GET    | /reviews/pending            | List pending reviews  |
| GET    | /reviews/:contentId         | Get reviews for content |
| POST   | /reviews/:contentId/approve | Approve content      |
| POST   | /reviews/:contentId/reject  | Reject content        |

### Dashboard

| Method | Endpoint            | Description              |
|--------|---------------------|--------------------------|
| GET    | /dashboard/stats    | Dashboard statistics     |
| GET    | /dashboard/schedule | Publishing schedule      |

## Content Workflow

```
Draft ──→ Pending Review ──→ Approved ──→ Scheduled ──→ Published
                │                │
                ↓                ↓
            Rejected ←──────── Draft
                │
                ↓
              Draft (revise & resubmit)
```

### Valid Status Transitions

| From            | To                              |
|-----------------|---------------------------------|
| draft           | pending_review                  |
| pending_review  | approved, rejected, draft       |
| approved        | scheduled, draft                |
| rejected        | draft                           |
| scheduled       | published, approved             |
| published       | (terminal state)                |

## Testing

Run backend API tests:

```bash
cd server
npm test
```

### Test Cases Covered

| Test Case                    | Description                              |
|------------------------------|------------------------------------------|
| Registration                 | Valid registration with token response   |
| Duplicate registration       | Rejects duplicate email (409)            |
| Invalid email                | Rejects malformed email (400)            |
| Short password               | Rejects password < 8 chars (400)         |
| Valid login                  | Returns JWT token                        |
| Invalid login                | Rejects wrong credentials (401)          |
| Content creation             | Creates content with required fields     |
| Content editing              | Updates existing content                 |
| Content deletion             | Removes content                          |
| Submit for review            | Transitions draft → pending_review       |
| Review approval              | Approves pending content                 |
| Review rejection             | Rejects with required comments           |
| Role-based authorization     | Blocks unauthorized role access (403)    |
| Dashboard statistics         | Returns content counts                   |

## Deployment

### Backend (Node.js)

1. Set production environment variables on your server
2. Use a process manager like PM2:

```bash
cd server
npm install --production
pm2 start server.js --name social-media-api
```

### Frontend (React)

```bash
cd client
npm run build
```

Serve the `client/dist` folder with Nginx, Apache, or a static hosting service (Vercel, Netlify).

### Database

Use a managed MySQL service (AWS RDS, PlanetScale, etc.) and update `DB_*` environment variables accordingly.

## Known Limitations

- Media URLs are stored as strings; no file upload functionality
- No email notifications for review status changes
- No real-time updates (requires page refresh)
- Scheduled publishing requires manual admin publish action
- Single-tenant architecture (no organization/team support)

## Future Enhancements

- File/media upload with cloud storage (AWS S3, Cloudinary)
- Email notifications for workflow events
- Real-time updates via WebSockets
- Automated scheduled publishing via cron jobs
- Content analytics and engagement metrics
- Multi-platform simultaneous publishing
- Content templates and AI-assisted caption generation
- Audit log for all content changes
- Team/organization support with multi-tenant architecture

## License

This project is built for educational and internship demonstration purposes.
