# 🤖 AI-Powered Code Review Assistant

A full-stack, enterprise-grade automated code review and codebase intelligence platform built with **Next.js 16**, **NestJS**, **Prisma**, **PostgreSQL**, and **Polymorphic AI Providers** (OpenAI, Ollama, LM Studio, OpenRouter).

---

## 🌟 Key Features

- **🔐 Authentication & Ownership**: JWT auth with password hashing, protected routes, and strict `userId` data scoping across projects.
- **📁 Code Upload & Zip Processing**: In-memory `.zip` extraction filtering out `.git` & `node_modules` with a recursive file tree and Shiki-powered syntax highlighter (`github-dark-dimmed`).
- **🧠 Polymorphic AI Provider Engine**: Support for multiple AI providers (OpenAI, Local LM Studio, Ollama, OpenRouter) with AES-256 encrypted API key storage at rest.
- **🔍 3 Automated Review Templates**:
  - **SECURITY**: OWASP vulnerabilities, injection vectors, hardcoded secrets.
  - **PERFORMANCE**: Algorithmic complexity, DB query bottlenecks, memory leaks.
  - **QUALITY**: Clean code patterns, DRY principles, type safety, error handling.
- **📊 Color-Coded Findings**: Issue cards formatted by severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) with code recommendations and inline line references.
- **📜 Review History & Export**: Historical audit log with filtering, deletion, and one-click Markdown report export (`.md`).
- **💬 Code Chat (RAG)**: Interactive chat grounded directly in repository file context.
- **⚡ Bonus Tools**:
  - **Doc Generator**: Auto-synthesizes project README documentation.
  - **Tech Debt Radar**: Cyclomatic complexity scoring & prioritized refactoring tasks.
- **🛡️ Rate Limiting & Health Check**: Built-in rate limiting (`@nestjs/throttler`) and `/health` monitoring endpoint.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js >= 18.x
- PostgreSQL server (or local database instance)

### 1. Backend Setup
```bash
cd backend
npm install

# Copy environment template
cp .env.example .env

# Configure environment variables in backend/.env:
# DATABASE_URL="postgresql://postgres:admin@localhost:5432/ai_code_review_db?schema=public"
# JWT_SECRET="super-secret-jwt-key-32bytes!"
# ENCRYPTION_KEY="32-byte-long-secret-key-for-aes!!"

# Database Push & Generate Client
npx prisma db push
npx prisma generate

# Start Backend Dev Server (Port 3001)
npm run start:dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Copy environment template
cp .env.local.example .env.local

# Configure environment variables in frontend/.env.local:
# NEXT_PUBLIC_API_URL="http://localhost:3001"

# Start Frontend Dev Server (Port 3000)
npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## 🔌 API Endpoints Summary

### Auth
- `POST /auth/register` — Create new user account
- `POST /auth/login` — Authenticate user & return JWT token

### Projects & Files
- `GET /projects` — List user projects
- `POST /projects` — Create project
- `DELETE /projects/:id` — Delete project
- `POST /projects/:id/upload` — Upload ZIP repository
- `GET /projects/:id/tree` — Fetch file tree structure
- `GET /files/:id` — Fetch file details & content

### AI Providers
- `GET /ai-providers` — List configured AI providers
- `POST /ai-providers` — Add AI provider config (AES-256 encrypted)
- `POST /ai-providers/test` — Test provider connectivity
- `DELETE /ai-providers/:id` — Remove AI provider config

### Reviews & Chat
- `POST /projects/:id/reviews` — Execute automated AI review
- `GET /projects/:id/reviews` — Fetch review history
- `DELETE /reviews/:id` — Delete historical review entry
- `POST /projects/:id/chat` — Codebase chat completion

### Tools & Utilities
- `POST /projects/:id/generate-docs` — Synthesize Markdown documentation
- `POST /projects/:id/tech-debt` — Compute Tech Debt & Complexity score
- `GET /health` — Public health check status
