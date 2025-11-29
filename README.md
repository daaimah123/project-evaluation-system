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

- [x] Phase 1: Project setup and infrastructure
- [ ] Phase 2: Backend core (auth, project management)
- [ ] Phase 3: GitHub integration with access checking
- [ ] Phase 4: Sanitization and AI evaluation
- [ ] Phase 5: Submission and evaluation flow
- [ ] Phase 6: Frontend foundation
- [ ] Phase 7: Project template UI
- [ ] Phase 8: Submission UI
- [ ] Phase 9: Evaluation review UI
- [ ] Phase 10: Dashboard and analytics
- [ ] Phase 11: Polish and deploy
- [ ] Phase 12: Testing and launch

## MIT License