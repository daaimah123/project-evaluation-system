# Project Evaluation System

A PERN stack application for evaluating full-stack software engineering participant projects with AI-powered analysis and staff review workflows.

## Tech Stack

- **Frontend**: React + Vite + Material UI
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Hosting**: Render
- **AI**: Google Gemini API (free tier)
- **Version Control**: GitHub API integration

## Project Structure

```
project-evaluation-system/
├── client/          # React frontend (Vite)
├── server/          # Express backend
└── database/        # SQL migrations and seeds
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- GitHub Personal Access Token
- Google Gemini API Key

### Setup

1. **Clone and install dependencies:**

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

2. **Database setup:**

```bash
# Create database
createdb evaluations_dev

# Run migrations
psql -d evaluations_dev -f database/migrations/001_create_tables.sql

# Optional: Add sample data
psql -d evaluations_dev -f database/seeds/sample_data.sql
```

3. **Environment variables:**

```bash
# Backend
cp server/.env.example server/.env
# Edit server/.env with your credentials

# Frontend
cp client/.env.example client/.env
# Edit client/.env with your API URL
```

4. **Run development servers:**

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

5. **Access the application:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

## Key Features

- Staff authentication and authorization
- 26 configurable project templates with custom criteria
- GitHub repository analysis (public and private with access verification)
- PII sanitization before AI processing
- AI-powered evaluation using Google Gemini
- Staff review and editing of evaluations
- Participant progress tracking
- Privacy-preserving architecture

## Development Roadmap

- [X] Phase 1: Project setup and infrastructure
- [X] Phase 2: Backend core (auth, project management)
- [X] Phase 3: GitHub integration with access checking
- [X] Phase 4: Sanitization and AI evaluation
- [X] Phase 5: Submission and evaluation flow
- [X] Phase 6: Frontend foundation
- [X] Phase 7: Project template UI
- [X] Phase 8: Submission UI
- [ ] Phase 9: Evaluation review UI
- [ ] Phase 10: Dashboard and analytics
- [ ] Phase 11: Polish and deploy
- [ ] Phase 12: Testing and launch

## License

MIT

## Test Backend API

#### 1. Test Login (Get JWT Token)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techtonica.org","password":"admin123"}'
```

**Expected response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@techtonica.org",
    "name": "Admin User"
  }
}
```

**Save the token** - you'll need it for the next commands. Copy the `token` value.

#### 2. Test Get Current User

Replace `YOUR_TOKEN_HERE` with the actual token from step 1:

```shellscript
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 3. Test List Projects

```shellscript
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. Test Create Project

```shellscript
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "project_number": 1,
    "name": "Personal Portfolio",
    "description": "Build a personal portfolio website",
    "expected_timeline_days": 7,
    "tech_stack": ["HTML", "CSS", "JavaScript"]
  }'
```

#### 5. Test Create Project Criteria

First, you need a project ID from step 4. Replace `PROJECT_ID_HERE`:

```shellscript
curl -X POST http://localhost:5000/api/projects/PROJECT_ID_HERE/criteria \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Technical Implementation",
    "criterion": "Code Quality",
    "weight": 3,
    "level_1_description": "Code has many errors",
    "level_2_description": "Code works with some issues",
    "level_3_description": "Code is clean and functional",
    "level_4_description": "Code is exemplary with best practices"
  }'
```

#### 6. Test List Participants

```shellscript
curl -X GET http://localhost:5000/api/participants \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 7. Test Create Submission (Public Repo - Should Work)

Replace `PARTICIPANT_ID` and `PROJECT_ID` with actual IDs:

```shellscript
curl -X POST http://localhost:5000/api/submissions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "participant_id": "PARTICIPANT_ID",
    "project_id": "PROJECT_ID",
    "github_repo_url": "https://github.com/facebook/react"
  }'
```

#### 8. Test Create Submission (Private Repo - Should Fail with Access Error)

```shellscript
curl -X POST http://localhost:5000/api/submissions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "participant_id": "PARTICIPANT_ID",
    "project_id": "PROJECT_ID",
    "github_repo_url": "https://github.com/your-private-repo/example"
  }'
```

**Expected response:**

```json
{
  "error": "REPO_NOT_ACCESSIBLE",
  "message": "Cannot access repository",
  "isPrivate": true,
  "instructions": {
    "step1": "Ask participant to add 'techtonica-evaluator' as collaborator",
    "step2": "Or make repository temporarily public",
    "step3": "Try submitting again"
  }
}
```

#### 9. Test List Submissions

```shellscript
curl -X GET http://localhost:5000/api/submissions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 10. Test Get Specific Submission

Replace `SUBMISSION_ID`:

```shellscript
curl -X GET http://localhost:5000/api/submissions/SUBMISSION_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
