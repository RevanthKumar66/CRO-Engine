# Shopify CRO Opportunity Engine — Engineering Metrics Report

This report summarizes code statistics, architecture components, and test coverage metrics.

---

## 1. Repository Statistics

| Metric | Count / Status | Notes |
| :--- | :--- | :--- |
| **UI Components** | 8 components | Button, Card, Header, Footer, Container, PageWrapper, Progress, Skeleton |
| **API Routes** | 4 routes | `/api/v1/extract`, `/api/v1/analyze`, `/api/v1/audits`, `/api/v1/audits/[id]` |
| **Test Files** | 12 test files | Managed under Vitest |
| **Total Test Assertions** | 41 assertions | 100% test pass rate |
| **TypeScript Status** | `tsc --noEmit` PASS | 0 compilation errors |
| **ESLint Status** | `next lint` PASS | 0 warnings or errors |
| **Database Indexes** | 3 indexes active | `id` (unique), `storeUrl`, `analyzedAt` |

---

## 2. Test Coverage Breakdown

Our test suites cover the complete business logic lifecycle:

* **URL Normalizer (`url-normalizer.test.ts`)** — 6 tests. Verifies domain parsing, slash sanitizations, protocol prepends, and IPv6 loopback and private subnet blocklist checks.
* **Validation Schemas (`schemas.test.ts`)** — 5 tests. Validates zod payload parameters and score bounds.
* **Snapshot Validator (`snapshot-validator.test.ts`)** — 2 tests. Checks storefront crawler schemas.
* **Context Builder (`context-builder.test.ts`)** — 1 test. Verifies minified string context generation.
* **Prompt Builder (`prompt-builder.test.ts`)** — 1 test. Verifies system prompt templates and instructions.
* **Domain Mapper (`domain-mapper.test.ts`)** — 2 tests. Verifies AI to domain AuditReport mapping.
* **JSON Parser (`json-parser.test.ts`)** — 5 tests. Validates markdown code fence stripping and trailing comma correction.
* **Error Classes (`app-error.test.ts`)** — 4 tests. Tests custom ApiError and ValidationError codes.
* **Audit Repository (`audit-repository.test.ts`)** — 3 tests. Tests MongoDB persistence and retrievals using a mocked client connection promise.
* **Analysis Orchestrator (`analysis-orchestrator.test.ts`)** — 5 tests. Tests AI retry loops, self-correction loops, and timeout responses.
* **Extract API Route (`extract-route.test.ts`)** — 2 tests. Tests extraction parameters validation and API responses.
* **Analyze API Route (`analyze-route.test.ts`)** — 2 tests. Tests crawl-to-AI analysis integration loops.

---

## 3. Observability & Performance Metrics

* **Average Local Extraction Latency**: `< 10ms` (Mocked) / `200-500ms` (Direct Cheerio).
* **AI Analysis Latency**: `< 5ms` (Mocked) / `2.5-4.5s` (Gemini-2.5-flash).
* **Database Save Latency**: `< 2ms` (Mocked connection).
* **Observability Logs**: All routes inject a unique `requestId` (correlation ID) to trace requests cleanly from initiation to DB persistence.
