# Shopify CRO Opportunity Engine - Coding Standards

This document establishes the architectural guidelines, formatting expectations, TypeScript principles, and code review criteria to be adhered to during development.

---

## 1. Naming & Folder Organization
* **Directory Structure**: Feature-based directory layouts. Shared components live in `src/ui`, domain errors in `src/core/errors`, and core features in `src/features/`.
* **File Names**:
  - React Components: PascalCase (e.g., `AuditReportCard.tsx`).
  - TypeScript Files / Utilities: kebab-case (e.g., `storefront-scraper.ts`).
  - Stylesheets: kebab-case (e.g., `dashboard-styles.css`).
* **Variables / Functions**: camelCase (e.g., `calculateScore`).
* **Interfaces / Types**: PascalCase, prefixed optionally where clarity is required (e.g., `StorefrontMetadata`). Avoid prepending with `I` (e.g., write `AuditReport` instead of `IAuditReport`).

---

## 2. TypeScript Rules
* **Strict Mode**: `strict: true` must be configured in `tsconfig.json`.
* **No Implicit Any**: Explicitly reject `any` variables. If a generic object is required, utilize `unknown` or record bindings like `Record<string, unknown>`.
* **Explicit Return Types**: All public class methods and API route controllers must declare explicit return types.
* **Discriminated Unions**: Prefer discriminated unions for handling complex state models (such as API statuses or state machines).

---

## 3. Server Rules & Best Practices
* **Controller-Service Decoupling**: Routers (`src/server/index.ts`) must only validate inputs and map response payloads. Business logic, scraping, and AI queries belong inside the service controllers (`src/features/...`).
* **Statelessness**: The API layer must remain completely stateless. Shared session storage must utilize cached databases (like Redis) rather than server memory variables.
* **Graceful Shutdown**: Intercept `SIGTERM` and `SIGINT` signals to close active database connections and complete outstanding queries.

---

## 4. Input Validation & Error Policies
* **Fail Fast**: Validate incoming HTTP parameters immediately using Zod schemas before executing scrapers or AI pipelines.
* **Central Error Mapping**: Throw custom, domain-specific errors (derived from `AppError`). Avoid exposing raw database or SDK details to the client. Let the Express global error-handler format outbound response payloads.
* **Sensitive Inputs**: Sanitize and escape URLs to prevent malicious scripts, injection codes, or internal address ranges (SSRF prevention).

---

## 5. Structured Logging & Comments
* **No `console.log`**: Standard output must use a unified logger framework (such as `pino` or `winston`).
* **Log Levels**:
  - `info`: Key flow milestones (e.g., "Scraping completed for shopify-store.com").
  - `warn`: Recoverable warnings (e.g., "Scraper hit rate limit; retrying...").
  - `error`: Operational or system failures (e.g., "Gemini API parsing failed: invalid schema response").
* **Self-Documenting Code**: Focus comments on the "Why" rather than the "What." Explain complex scraper regex strings or AI context minification logic.

---

## 6. Version Control: Git, Branching, and PRs

### Branch Naming Conventions
* Feature additions: `feat/feature-name`
* Bug fixes: `fix/bug-description`
* Optimization / Refactoring: `refactor/optimization-scope`
* Infrastructure / CI: `chore/task-name`

### Commit Message Conventions (Conventional Commits)
Commits must follow the format: `<type>(<scope>): <short description>`.
- Examples:
  - `feat(scraper): extract heading elements and storefront forms`
  - `fix(ai): repair structured JSON schema mismatch for PDP score`

---

## 7. Code Review Checklist
Before marking a Pull Request (PR) as "Ready for Review," verification of the following items is required:

- [ ] **TypeScript**: The project compiles successfully with zero warnings under strict configurations.
- [ ] **Tests**: Every new feature is covered by unit tests, achieving at least 80% coverage.
- [ ] **Error Handling**: Every API route returns a structured, predictable error contract upon failure.
- [ ] **Security**: Inputs are validated via Zod, and URL formats are checked against SSRF vectors.
- [ ] **Performance**: Scraping DOM minification runs on target elements without keeping massive buffers in RAM.
- [ ] **Design Tokens**: Frontend styles match the custom property variables defined in the design system.
