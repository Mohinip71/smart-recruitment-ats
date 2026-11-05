# Smart ATS – Backend

A full-stack Applicant Tracking System (ATS) backend designed to streamline recruitment workflows, candidate applications, interview scheduling, offer management, and onboarding.

## Features

### Authentication & Authorization
- Candidate and recruiter registration and login.
- JWT-based authentication using HTTP-only cookies.
- Role-based access control.
- Protected API endpoints.

### Job Management
- Create and manage job postings.
- Publish, close, and archive jobs.
- Public job listing and job details.

### Application Management
- Candidates can apply for jobs.
- Candidates can track their applications.
- Recruiters can view applications for their jobs.
- Application status management.

### Candidate Profile
- Create and update candidate profiles.
- Upload resumes in PDF format.
- Upload profile photos.
- Secure, temporary resume download links.

### Interview Management
- Schedule interviews.
- View candidate interviews.
- View interviews associated with jobs.
- Update interview status.

### Offer Management
- Create job offers.
- Candidates can accept or reject offers.
- Offer status management.

### Onboarding
- Automatic onboarding initiation after offer acceptance.
- View onboarding details.
- Update onboarding status.

### Notifications
- Retrieve personal notifications.
- Mark notifications as read.

### Analytics
- Recruiter and administrator dashboard analytics.

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Backend framework |
| PostgreSQL | Relational database |
| Prisma ORM | Database access |
| JWT | Authentication |
| bcrypt | Password hashing |
| Cloudinary | Resume and image storage |
| Multer | File upload handling |
| Helmet | HTTP security headers |
| express-rate-limit | Rate limiting |

## Project Structure

```text
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── analytics.controller.js
│   │   ├── application.controller.js
│   │   ├── auth.controller.js
│   │   ├── interview.controller.js
│   │   ├── job.controller.js
│   │   ├── notification.controller.js
│   │   ├── offer.controller.js
│   │   ├── onboarding.controller.js
│   │   └── profile.controller.js
│   ├── db/
│   │   └── prisma.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── role.middleware.js
│   │   └── upload.middleware.js
│   ├── routes/
│   │   ├── analytics.routes.js
│   │   ├── application.routes.js
│   │   ├── auth.routes.js
│   │   ├── interview.routes.js
│   │   ├── job.routes.js
│   │   ├── notification.routes.js
│   │   ├── offer.routes.js
│   │   ├── onboarding.routes.js
│   │   └── profile.routes.js
│   ├── services/
│   │   └── notification.service.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
cd smart-ats/backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory.

Configure the required environment variables:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_strong_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Configure your PostgreSQL database and Cloudinary account before starting the server.

Run database migrations:

```bash
npx prisma migrate deploy
```

Generate Prisma Client:

```bash
npx prisma generate
```

Start the development server:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

## API Documentation

All API endpoints are prefixed with:

```text
http://localhost:5000/api
```

### 1. Authentication

Base URL: `/api/auth`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/signup` | Register a user | Public |
| POST | `/login` | Login | Public |
| POST | `/logout` | Logout | Public |
| GET | `/me` | Get logged-in user | Authenticated |

### 2. Jobs

Base URL: `/api/jobs`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/` | Create job | Recruiter/Admin |
| GET | `/` | Get jobs | Public |
| GET | `/:id` | Get job details | Public |
| PATCH | `/:id` | Update job | Recruiter/Admin |
| PATCH | `/:id/publish` | Publish job | Recruiter/Admin |
| PATCH | `/:id/close` | Close job | Recruiter/Admin |
| PATCH | `/:id/archive` | Archive job | Recruiter/Admin |

### 3. Applications

Base URL: `/api/applications`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/` | Apply for a job | Candidate |
| GET | `/my` | View own applications | Candidate |
| GET | `/job/:jobId` | View job applications | Recruiter/Admin |
| PATCH | `/:applicationId/status` | Update application status | Recruiter/Admin |

### 4. Candidate Profile

Base URL: `/api/profile`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/me` | Get candidate profile | Candidate |
| PUT | `/me` | Create/update profile | Candidate |
| POST | `/me/resume` | Upload PDF resume | Candidate |
| POST | `/me/photo` | Upload profile photo | Candidate |
| GET | `/me/resume/download` | Generate secure resume download link | Candidate |

File uploads use `multipart/form-data` with the field name `file`.

- Resume: PDF, maximum 5 MB.
- Profile photo: JPG, PNG or WEBP, maximum 3 MB.

Resume files are stored as authenticated Cloudinary assets. Download links are temporary and generated after authentication.

### 5. Interviews

Base URL: `/api/interviews`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/` | Schedule interview | Recruiter/Admin |
| GET | `/my` | View own interviews | Candidate |
| GET | `/job/:jobId` | View job interviews | Recruiter/Admin |
| PATCH | `/:interviewId/status` | Update interview status | Recruiter/Admin |

### 6. Offers

Base URL: `/api/offers`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/` | Create offer | Recruiter/Admin |
| GET | `/my` | View own offers | Candidate |
| PATCH | `/:offerId/status` | Accept/reject offer | Candidate |

### 7. Onboarding

Base URL: `/api/onboarding`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/my` | View own onboarding | Candidate |
| GET | `/offer/:offerId` | View onboarding by offer | Recruiter/Admin |
| PATCH | `/:onboardingId/status` | Update onboarding status | Recruiter/Admin |

### 8. Notifications

Base URL: `/api/notifications`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/my` | Get notifications | Authenticated |
| PATCH | `/:notificationId/read` | Mark notification as read | Authenticated |

### 9. Analytics

Base URL: `/api/analytics`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/dashboard` | Get dashboard analytics | Recruiter/Admin |

## Security

- JWT authentication with HTTP-only cookies.
- Role-based authorization.
- Password hashing using bcrypt.
- Helmet security headers.
- Authentication rate limiting.
- Request body size limits.
- File type and size validation.
- Secure resume download links.

## Environment Variables

Never commit your actual `.env` file or credentials to GitHub.

Use `.env.example` as a template.

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## Project Scope

Smart ATS backend provides recruitment workflow APIs for candidates, recruiters, and administrators.

Frontend integration and deployment are handled separately.

---
**Smart ATS – Recruitment Management System**