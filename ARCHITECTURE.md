# System Architecture — AI Code Review Assistant

## Overview

The system is designed as a clean monorepo separating the NestJS API server and Next.js App Router client application.

```
ai_code_review_assistant/
├── backend/            # NestJS Application
│   ├── prisma/         # Schema & DB Migrations
│   └── src/            # Layered Modules (auth, users, projects, files, ai-providers, reviews, chat)
└── frontend/           # Next.js App Router Application
    ├── src/app/        # Page routes
    ├── src/components/ # Shared UI components
    ├── src/features/   # Feature-scoped hooks, components, and types
    └── src/lib/        # Centralized API client & utils
```

## Backend Modular Layering

Each domain follows strict NestJS module boundaries (`module -> controller -> service -> repository/Prisma`):

1. **Auth Module**: Registration, login, JWT issuance, and request validation.
2. **Projects Module**: User-scoped project CRUD operations.
3. **Files Module**: Multipart repository uploads, zip unpacking (`adm-zip`), tree generation, and content storage.
4. **AI Providers Module**: Provider configuration CRUD with AES-256 encrypted API key storage and runtime polymorphic provider adapter dispatching.
5. **Reviews Module**: Structured prompt orchestration (Security, Performance, Quality), response JSON validation, and history persistence.
6. **Chat Module**: Contextual retrieval over uploaded codebase files and session chat.

## Database Schema Model (Prisma)

- **User**: Authentication credentials.
- **Project**: Owned by User; groups files, reviews, and chat sessions.
- **File**: Unpacked codebase files linked to Project.
- **AIProviderConfig**: User-owned provider connection info (encrypted key, base URL, model name).
- **Review**: Persisted structured JSON AI review outputs.
- **ChatSession & Message**: Persisted interaction history.
