# AI-Powered Code Review Assistant

A production-oriented, monorepo application for automated code reviews, contextual chat with uploaded codebases, and technical debt analysis powered by runtime-configurable AI providers (OpenAI, LM Studio, Ollama, OpenRouter, and generic OpenAI-compatible endpoints).

## Monorepo Architecture

- **`frontend/`**: Next.js App Router, TypeScript (strict), Tailwind CSS (Dark Glassmorphism UI)
- **`backend/`**: NestJS, Prisma ORM, PostgreSQL, JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database running locally or remotely

### Installation & Local Setup

1. **Clone & Environment Setup**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md): System architecture, module structure, and design trade-offs.
- [`AI_USAGE.md`](./AI_USAGE.md): Breakdown of AI prompts, engineering decisions, and implementation highlights.
