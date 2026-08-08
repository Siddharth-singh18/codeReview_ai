# 🏗️ Architecture & Technical Design Document

## System Overview

The **AI Code Review Assistant** is architected as a layered monorepo comprising a NestJS backend REST API and a Next.js 16 frontend app.

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 16 Client (App)                   │
│  (Shiki Syntax Engine, Glassmorphic UI, Feature Modules)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API / JWT
┌──────────────────────────────▼──────────────────────────────┐
│                    NestJS Backend API                       │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐ │
│  │ AuthModule   │ProjectsModule│ReviewsModule │ChatModule│ │
│  ├──────────────┼──────────────┼──────────────┼──────────┤ │
│  │AIProviders   │ ToolsModule  │ FilesModule  │Throttler │ │
│  └──────────────┴──────────────┴──────────────┴──────────┘ │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma ORM
┌──────────────────────────────▼──────────────────────────────┐
│                    PostgreSQL Database                      │
│   (User, Project, File, AIProviderConfig, Review, Chat)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Layered Modular Architecture

### 1. Data Scoping & Security
- **Strict Tenant Isolation**: All endpoints verify user ownership via NestJS `JwtAuthGuard` and `@User('userId')` decorator. Database queries include `where: { userId }` or relational project checks to prevent unauthorized access.
- **AES-256 Key Encryption**: AI Provider credentials (e.g. OpenAI API keys) are encrypted using AES-256-CTR before saving to PostgreSQL and decrypted only in memory when constructing HTTP client instances.

### 2. AI Provider Abstraction
The system utilizes a polymorphic Strategy Pattern for AI Providers:
- **Base Interface**: `AIProvider` defining `.complete(messages, options)`.
- **Implementations**:
  - `OpenAIProvider` — OpenAI API integration.
  - `OllamaProvider` — Local Ollama LLM endpoint.
  - `LMStudioProvider` — Local LM Studio instance.
  - `OpenRouterProvider` — OpenRouter multi-model gateway.
  - `GenericOpenAIProvider` — Standard v1/chat/completions compatible endpoints.

### 3. Review & Defensive Parsing Pipeline
```
[Trigger Review Request] 
      │
      ▼
[Gather Target File Contents] 
      │
      ▼
[Assemble System Prompt Template (Security / Performance / Quality)]
      │
      ▼
[Invoke AI Provider Strategy]
      │
      ▼
[Defensive JSON Sanitization & Parsing]
      │ (Fallback to unstructured block if parsing fails)
      ▼
[Persist Review Record in DB] ──► [Return Structured Report JSON to UI]
```

### 4. Code Chat & Context Retrieval
- When a user sends a message in Code Chat, the system retrieves up to 20 codebase files for the project.
- Files are bundled into the System Prompt as grounded codebase context (`--- FILE: path ---`).
- History array is passed to allow multi-turn conversational pair programming.
