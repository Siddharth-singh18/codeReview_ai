# AI Usage & Engineering Rationale — AI Code Review Assistant

## AI Tools & Workflow

This application was developed using pair-programming with AI agents. Every line of code was crafted according to strict architectural guidelines, layered design patterns, and defensive programming standards.

## Key Engineering Decisions & Trade-offs

1. **JWT Auth (Access Token in Memory / HTTP Authorization header)**
   - *Rationale*: Keeps frontend state decoupled from server state while keeping client routing fast and stateless.

2. **Polymorphic AI Provider Abstraction (`AIProvider` interface)**
   - *Rationale*: Unified `/chat/completions` REST interface support allows zero code changes when switching between cloud models (OpenAI, OpenRouter) and local inference engines (LM Studio, Ollama).

3. **AES-256 API Key Encryption at Rest**
   - *Rationale*: API keys configured in the UI are never stored in plain text in the database.

4. **Lightweight Keyword / File Relevance Code Context Retrieval**
   - *Rationale*: High signal-to-cost ratio for code chat without requiring external vector database overhead for a 3-day project scope.
