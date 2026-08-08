# 🧠 Comprehensive AI Usage & Disclosure Report

## 📌 Executive Summary
This document serves as the **Mandatory AI Usage Disclosure Report** for the **AI Code Review Assistant** project in full compliance with the AI Usage Policy.

It details:
1. **AI Tools Used**: Antigravity, Claude 3.5 Sonnet, Gemini 2.0 Flash, ChatGPT, Ollama (`qwen2.5-coder:7b`).
2. **Key Architectural & Implementation Decisions Explained**: Detailed technical justifications for every major design decision in the codebase to ensure complete developer mastery during technical interviews/evaluations.
3. **Defensive AI Engineering**: Methods used to enforce structured output, prevent hallucinations, and parse unstructured LLM outputs safely.

---

## 🛠️ 1. AI Tools & Models Disclosed

| Tool / Provider | Use Case | Extent of Contribution |
| :--- | :--- | :--- |
| **Antigravity AI Assistant** | Full-Stack Architecture, Monorepo Setup, Code Editing | Interactive pair programming, scaffold generation, and automated refactoring. |
| **Claude 3.5 Sonnet / Gemini** | High-level system design & prompt template engineering | Formulating strict JSON enforcement schemas and system prompts. |
| **Ollama (`qwen2.5-coder:7b`)** | Local offline LLM testing & code reviews | Local inference integration and connectivity validation. |

---

## 💡 2. Implementation Decisions & Interview Prep Guide

Below is the technical rationale behind every critical decision in this repository:

### A. Why NestJS & Next.js 16 Monorepo?
- **NestJS (Backend)**: Provides an enterprise-grade modular architecture (Controllers, Services, Guards, Modules) out of the box with built-in dependency injection. This makes adding new AI Provider strategies or Review Templates zero-friction.
- **Next.js 16 (Frontend)**: Utilizes App Router, Turbopack compilation, and React Client/Server components for snappy UI state updates and server-side rendering.

### B. Polymorphic Strategy Pattern for AI Providers
- **Decision**: Created an abstract `AIProvider` base class with concrete implementations (`OpenAIProvider`, `OllamaProvider`, `LMStudioProvider`, `OpenRouterProvider`).
- **Why**: Allows users to seamlessly switch between local open-source LLMs (like `qwen2.5-coder`) and cloud providers without changing a single line of review or chat service logic.

### C. AES-256-CTR Encryption at Rest for API Keys
- **Decision**: User API keys are encrypted using AES-256-CTR in NestJS before being saved to PostgreSQL (`aiProviderConfig.apiKey`).
- **Why**: API keys should never be stored in plain text in database tables. The key is decrypted in memory only when establishing an outbound HTTP client request to the LLM endpoint.

### D. Defensive JSON Sanitization Engine
- **Problem**: LLMs often output markdown block wrappers (```json ... ```) or extra conversational commentary despite strict system instructions.
- **Solution**:
  1. Implemented a regex backtick stripper (`cleanJsonResponse`) before calling `JSON.parse()`.
  2. Built a fallback wrapper that catches parse errors and packages unstructured raw LLM text into a safe `General Findings` issue card, preventing UI runtime crashes.

### E. In-Memory Zip Extraction & Filtering
- **Decision**: Used `adm-zip` to extract uploaded repository archives directly in memory buffer without writing intermediate raw files to disk.
- **Why**: Prevents storage bloat, mitigates path-traversal vulnerability risks, and automatically filters out `.git` and `node_modules` folders.

### F. RAG-Like Codebase Context Grounding for Chat
- **Decision**: Reads top repository files and injects them directly into the System Prompt (`--- FILE: filename ---`).
- **Why**: Gives the AI full contextual awareness of project architecture so answers to questions like *"How does auth work?"* are grounded directly in the user's actual codebase.

---

## 🎯 3. Defensive AI & System Prompts Engineered

### Security Audit System Prompt
```text
You are an expert security auditor. Perform an OWASP vulnerability scan on the provided source code files.
Return ONLY valid JSON matching this schema:
{
  "summary": "Overall security assessment",
  "issues": [
    {
      "title": "Short title",
      "description": "Detailed flaw explanation",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "filePath": "relative/path/to/file",
      "lineRef": 42,
      "recommendation": "Code fix snippet"
    }
  ]
}
```

---

## 📜 4. Developer Disclosure Statement

*"I acknowledge the use of AI coding tools during the development of this project. I have reviewed, understood, and tested every component, file, and module in this codebase. I am prepared to explain all architectural decisions, code paths, and design choices during technical interviews."*
