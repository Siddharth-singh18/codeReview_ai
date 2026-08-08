# 🧠 AI Integration & Prompt Engineering Log

## Overview
This document records the prompt engineering strategies, output formats, and defensive parsing techniques engineered for the **AI Code Review Assistant**.

---

## 1. System Prompt Strategies

### A. Security Review Prompt
- **Goal**: Detect OWASP vulnerabilities, injection vectors, hardcoded secrets, and authentication weaknesses.
- **Instruction**: Enforces strict JSON response format with explicit schema:
  - `summary`: High-level security posture evaluation.
  - `issues`: Array of objects with `title`, `description`, `severity` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), `filePath`, `lineRef`, and `recommendation`.

### B. Performance Review Prompt
- **Goal**: Identify algorithmic complexity bottlenecks (O(N^2) loops), unindexed database queries, memory leaks, and blocking I/O calls.

### C. Quality Review Prompt
- **Goal**: Evaluate clean code principles, DRY compliance, type safety, error handling, and maintainability.

---

## 2. Defensive JSON Parsing Engine

AI Providers often return markdown-wrapped JSON (e.g. ```json ... ```) or conversational commentary despite strict instructions. To guarantee system reliability:

### Defensive Cleaning Logic:
1. **Markdown Stripping**: Trims leading/trailing ```json and ``` fences.
2. **Robust Schema Normalization**: Validates mandatory fields (`summary`, `issues`). Fallbacks are supplied for missing title/description.
3. **Severity Mapping**: Ensures severity tags are normalized strictly to `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW`.
4. **Fallback Handler**: If JSON parsing fails due to invalid provider formatting, the raw response text is safely wrapped into a fallback `General Feedback` issue card so no information is lost and UI rendering never crashes.

---

## 3. Supported AI Providers

1. **OpenAI**: `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo`
2. **LM Studio**: `http://localhost:1234/v1` (Local llama/qwen models)
3. **Ollama**: `http://localhost:11434/v1` (Local mistral/codellama models)
4. **OpenRouter**: `https://openrouter.ai/api/v1` (Anthropic, DeepSeek, Meta models)
