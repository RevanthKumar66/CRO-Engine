# CRO Engine — System Architecture & Engineering Design Document

**Version:** 1.0.0
**Status:** Production
**Authors:** CRO Engine Engineering Team
**Last Updated:** July 2026

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Goals & Non-Goals](#2-goals--non-goals)
3. [Requirements](#3-requirements)
4. [System Architecture Overview](#4-system-architecture-overview)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Backend Architecture](#6-backend-architecture)
7. [AI Pipeline Design](#7-ai-pipeline-design)
8. [Website Intelligence Pipeline](#8-website-intelligence-pipeline)
9. [MongoDB Database Design](#9-mongodb-database-design)
10. [API Design & Contracts](#10-api-design--contracts)
11. [Folder Structure](#11-folder-structure)
12. [Prompt Engineering](#12-prompt-engineering)
13. [Security Architecture](#13-security-architecture)
14. [Performance Architecture](#14-performance-architecture)
15. [Testing Strategy](#15-testing-strategy)
16. [Deployment Architecture](#16-deployment-architecture)
17. [Engineering Trade-offs](#17-engineering-trade-offs)
18. [Future Work & Roadmap](#18-future-work--roadmap)

---

## 1. Problem Statement

### 1.1 Background

Conversion Rate Optimization (CRO) is the systematic process of increasing the percentage of website visitors who take a desired action — purchasing a product, adding items to cart, signing up for a newsletter, or completing checkout.

For Shopify merchants, the difference between a 1% and 3% conversion rate on a store generating $1M/year in revenue is $20,000 in incremental revenue — without acquiring a single additional visitor.

However, professional CRO audits from agencies cost $5,000–$25,000 per engagement. They are performed manually, take 2–4 weeks, and require specialized knowledge of e-commerce UX heuristics, consumer psychology, and Shopify-specific patterns.

### 1.2 The Problem

There is no accessible, automated tool that:

1. **Understands Shopify-specific storefront patterns** (product pages, collection pages, cart behavior)
2. **Applies established CRO heuristics** from conversion psychology research
3. **Produces actionable, prioritized recommendations** that a developer can implement without needing a CRO consultant
4. **Runs at internet scale** — analyzing any public Shopify store on demand in seconds, not weeks

Existing solutions fall into one of three categories:

- **Generic page speed tools** (Google PageSpeed, GTmetrix): Focus on technical performance, not conversion psychology
- **Expensive CRO platforms** (Hotjar, VWO, Optimizely): Require traffic data, A/B testing infrastructure, and weeks to produce conclusions
- **Manual agency audits**: Expensive, slow, and not scalable

### 1.3 The Opportunity

Large Language Models trained on vast corpora of web content, UX research, and consumer psychology literature can be directed to evaluate storefronts against expert-level CRO heuristics — producing structured, expert-quality recommendations at near-zero marginal cost.

The engineering challenge is making this reliable: LLMs must produce consistent, structured JSON outputs from unstructured, highly variable real-world HTML across thousands of different Shopify themes.

---

## 2. Goals & Non-Goals

### 2.1 Goals

| Goal | Priority | Description |
|---|---|---|
| URL-to-report in <30 seconds | P0 | Core product promise: instant analysis |
| Structured JSON recommendations | P0 | Machine-readable, typed recommendations |
| Shopify storefront support | P0 | Homepage, PDP, Collection, Cart |
| SSRF protection | P0 | No internal network access via URL input |
| MongoDB persistence | P1 | Audits stored and retrievable by ID |
| Dashboard for past audits | P1 | Browse and compare historical audits |
| Zero vendor lock-in | P2 | Analytics, database, AI model swappable |
| PWA support | P2 | Manifest, theme color, icon set |
| SEO optimization | P2 | Sitemap, robots.txt, OpenGraph, Twitter cards |

### 2.2 Non-Goals

| Non-Goal | Rationale |
|---|---|
| Real-time A/B testing | Requires traffic instrumentation — separate product domain |
| Browser-rendered SPA scraping | Puppeteer overhead is 10x; most Shopify stores render SSR |
| Multi-language support | English-only in v1 |
| Competitor comparison | Scope expansion for future product |
| Heatmap recording | Requires client-side JS injection into target stores |
| User authentication / multi-tenancy | Single-user portfolio product in v1 |
| Webhook notifications | Not required for current product scope |

---

## 3. Requirements

### 3.1 Functional Requirements

**FR-01 — URL Input & Validation**
The system MUST accept a public HTTPS URL, normalize it, validate it against SSRF protection rules, and reject malformed or private-network URLs before making any outbound request.

**FR-02 — Storefront Scraping**
The system MUST fetch and parse the HTML of the submitted store URL, extracting headings, CTAs, navigation elements, product titles, and page structural metadata without executing JavaScript.

**FR-03 — DOM Minification**
The system MUST strip scripts, styles, SVG, inline event handlers, comments, and redundant layout elements to reduce HTML token count by ≥70% before passing content to the AI model.

**FR-04 — AI Audit**
The system MUST use a versioned prompt to instruct Gemini to analyze the minified storefront content against CRO heuristics and return a structured JSON object conforming to the `AuditReport` schema.

**FR-05 — Response Validation & Self-Correction**
The system MUST validate AI responses against a Zod schema. If validation fails, the system MUST retry with a self-correction prompt up to 3 times before raising a typed error.

**FR-06 — Persistence**
The system MUST persist each completed `AuditReport` to MongoDB Atlas with an upsert strategy (idempotent on re-runs of the same audit ID).

**FR-07 — Audit Retrieval**
The system MUST provide an API endpoint to retrieve an audit by its unique string ID.

**FR-08 — Past Audits List**
The system MUST provide an API endpoint returning the 10 most recent audits, sorted in descending chronological order.

**FR-09 — Dashboard UI**
The system MUST provide a UI page rendering pageable audit reports with search filtering by store URL.

**FR-10 — Loading Experience**
During AI analysis, the UI MUST display a step-by-step animated checklist mirroring the 8 phases of the pipeline.

### 3.2 Non-Functional Requirements

**NFR-01 — Latency**
- URL validation: <50ms
- DOM extraction: <5 seconds
- AI analysis: <20 seconds
- Total end-to-end: <30 seconds (P95)

**NFR-02 — Reliability**
- AI self-correction: ≤3 retries before error
- MongoDB connection: lazy-initialized, pooled, retries on transient failure

**NFR-03 — Security**
- All URL inputs must be validated against SSRF blocklist before DNS resolution
- No secrets exposed in client-side bundles
- Security headers on all responses

**NFR-04 — Maintainability**
- Zero circular dependencies between layers
- All AI prompts versioned as flat files
- Full JSDoc on all public service methods

**NFR-05 — Testability**
- All external I/O (Gemini, MongoDB, HTTP fetch) must be injectable/mockable
- 100% unit test pass rate in CI

**NFR-06 — Observability**
- Structured JSON logs for every pipeline phase
- Request correlation IDs propagated through all log entries
- Phase-level latency metrics logged on every request

---

## 4. System Architecture Overview

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser / Client                         │
│                                                                 │
│   Landing Page    Dashboard     Audit Details    Docs           │
│   (/page.tsx)     (/dashboard)  (/audits/[id])  (/docs)        │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js 15 App Router                        │
│                                                                 │
│   React Server Components  │  Client Components                │
│   Static Generation        │  useEffect / useState             │
│   Edge Middleware          │  react-hook-form + Zod             │
└──────────┬──────────────────────────────────────────────────────┘
           │
    ┌──────┴────────────────────────────┐
    │         API Routes (Node.js)      │
    │                                   │
    │  POST /api/v1/analyze             │
    │  GET  /api/v1/audits              │
    │  GET  /api/v1/audits/:id          │
    │  POST /api/v1/extract             │
    │  GET  /api/v1/health              │
    └──────┬───────────────┬───────────┘
           │               │
    ┌──────▼──────┐  ┌────▼────────────┐
    │  Snapshot   │  │   Analysis      │
    │  Pipeline   │  │   Pipeline      │
    │             │  │                 │
    │ URLNorm     │  │ ContextBuilder  │
    │ Fetcher     │  │ PromptBuilder   │
    │ DomMinifier │  │ GeminiClient    │
    └──────┬──────┘  │ JsonParser      │
           │         │ SchemaValidator │
           └────┬────│ DomainMapper    │
                │    └────────────────┘
                │
         ┌──────▼──────────────┐
         │   MongoDB Atlas     │
         │   AuditRepository   │
         │   Collection:audits │
         └─────────────────────┘
```

### 4.2 Request Lifecycle

Every `/api/v1/analyze` request flows through these phases in strict sequence:

```
1. Request received → requestId generated
2. Input parsed → Zod validation
3. URL normalized → SSRF check
4. SnapshotOrchestrator.generateSnapshot(url)
   a. WebsiteFetcher.fetch(url) → raw HTML
   b. DomMinifier.minify(html) → token-reduced content
   c. Returns WebsiteSnapshot
5. AnalysisOrchestrator.analyze(snapshot)
   a. ContextBuilder.buildContext(snapshot) → prompt context string
   b. PromptBuilder.buildPrompt(context) → full system+user prompt
   c. GeminiClient.generate(prompt) → raw AI response string
   d. JsonParser.extract(response) → raw JSON object
   e. SchemaValidator.validate(json) → typed AuditData
      → if fail: retry with self-correction prompt (max 3 attempts)
   f. DomainMapper.toDomain(validated) → AuditReport
6. AuditRepository.save(report) → MongoDB upsert
7. Return { id: report.id }
8. Client polls /audits/:id via router redirect
```

### 4.3 Component Interaction Diagram

```
page.tsx
  └── form submit (URL)
        └── POST /api/v1/analyze
              ├── urlNormalizer.normalize()
              ├── SnapshotOrchestrator
              │     ├── WebsiteFetcher
              │     └── DomMinifier
              └── AnalysisOrchestrator
                    ├── ContextBuilder
                    ├── PromptBuilder
                    ├── GeminiClient
                    │     └── @google/genai SDK
                    ├── JsonParser
                    ├── SchemaValidator (Zod)
                    │     └── retry loop (max 3)
                    └── DomainMapper
                          └── AuditRepository
                                └── MongoDB Atlas
```

---

## 5. Frontend Architecture

### 5.1 Technology Decisions

| Technology | Version | Rationale |
|---|---|---|
| Next.js | 15.x | App Router, Server Components, collocated API routes |
| React | 19.x | Concurrent rendering, improved hydration |
| TypeScript | 5.6 | Strict mode, full type safety across client and server |
| Tailwind CSS | 4.x | Utility-first, design token system via CSS custom properties |
| react-hook-form | 7.x | Uncontrolled form management with Zod resolver integration |
| Zod | 3.x | Runtime schema validation, shared with server-side |
| lucide-react | 0.468 | Consistent, lightweight SVG icon set |
| CVA | 0.7 | Class Variance Authority for type-safe component variants |

### 5.2 App Router Structure

Next.js 15 App Router uses a file-system based routing model with collocated layout, loading, and error boundaries:

```
src/app/
├── layout.tsx         # Root layout: Header, Footer, global metadata
├── page.tsx           # Landing page (/)
├── error.tsx          # Global error boundary
├── not-found.tsx      # 404 page
├── sitemap.ts         # Dynamic sitemap.xml generator
├── robots.ts          # robots.txt generator
├── manifest.ts        # PWA manifest generator
├── dashboard/
│   └── page.tsx       # Past audits list (/dashboard)
├── audits/
│   └── [id]/
│       └── page.tsx   # Audit detail (/audits/:id)
├── docs/
│   └── page.tsx       # Documentation (/docs)
└── api/
    └── v1/
        ├── analyze/route.ts
        ├── audits/route.ts
        ├── audits/[id]/route.ts
        ├── extract/route.ts
        └── health/route.ts
```

### 5.3 Component Architecture

Components are organized by purpose, not by feature:

```
src/components/
├── common/           # Layout primitives
│   ├── Container.tsx     # Max-width centering wrapper
│   ├── PageWrapper.tsx   # Entry animation + padding
│   ├── Loading.tsx       # Global skeleton states
│   └── ErrorBoundary.tsx # Client-side error capture
├── feedback/         # User communication
│   ├── Alert.tsx         # Severity-colored alert boxes
│   ├── Badge.tsx         # Status pill badges
│   ├── Progress.tsx      # Progress bar
│   ├── Skeleton.tsx      # Loading placeholder
│   ├── Spinner.tsx       # Circular loading indicator
│   └── Toast.tsx         # Ephemeral notifications
├── forms/            # Form inputs
│   ├── Input.tsx
│   ├── Textarea.tsx
│   └── Form.tsx
├── layout/           # App chrome
│   ├── Header.tsx
│   └── Footer.tsx
├── navigation/       # Navigation elements
├── typography/       # Heading, Paragraph, Label
├── overlays/         # Modals, sheets, drawers
└── ui/               # Core atomic components
    ├── Button.tsx        # CVA variants: primary/secondary/outline/ghost
    ├── Card.tsx          # Glassmorphic card with sub-components
    └── Badge.tsx
```

### 5.4 Design System

The design system is defined entirely in `src/styles/globals.css` using CSS custom properties (tokens):

```css
:root {
  /* Background tokens */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-card: #ffffff;

  /* Text tokens */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;

  /* Accent tokens */
  --accent-violet: #1e40af;
  --accent-emerald: #059669;
  --accent-amber: #d97706;
  --accent-rose: #e11d48;

  /* Border tokens */
  --border-muted: #e2e8f0;

  /* Glassmorphic card */
  .glassmorphic-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
  }
}
```

Tailwind v4 references these tokens via the `@theme` directive, enabling full utility class access (e.g., `bg-accent-violet`, `text-text-secondary`).

### 5.5 State Management

No global state management library is used. State is local to each component via `useState` / `useEffect` with the following patterns:

| Pattern | Usage |
|---|---|
| `useState` | Form state, loading flags, API data |
| `useEffect` + `fetch` | Data fetching on dashboard, audit detail pages |
| `useRouter` | Programmatic navigation post-analysis |
| react-hook-form | URL input form with Zod validation |
| URL params | Audit ID passed via route parameter |

### 5.6 Loading Experience Architecture

The AI analysis loading screen uses a phase-based animation system:

```typescript
const LOADING_PHASES = [
  { id: 'connect',  icon: Laptop,      text: 'Connecting to Store...' },
  { id: 'download', icon: Search,      text: 'Downloading HTML...' },
  { id: 'detect',   icon: Layout,      text: 'Detecting Layout...' },
  { id: 'extract',  icon: Target,      text: 'Extracting Products...' },
  { id: 'context',  icon: Brain,       text: 'Building AI Context...' },
  { id: 'gemini',   icon: Sparkles,    text: 'Running Gemini Analysis...' },
  { id: 'validate', icon: ShieldCheck, text: 'Validating Response...' },
  { id: 'report',   icon: FileText,    text: 'Generating CRO Report...' },
];
```

Each step auto-advances via a `setTimeout` loop in `runLoadingSequence()`. Completed steps render a green checkmark; the active step renders a spinning `Loader2` icon. Steps not yet reached are dimmed at `opacity-30`.

The UI is replaced by this loading screen once `isSubmitting = true` — a full-page takeover replacing the hero section with the checklist.

---

## 6. Backend Architecture

### 6.1 Next.js API Routes as Backend

CRO Engine uses Next.js 15 App Router API routes (`route.ts` files) as the backend layer. This eliminates the need for a separate Express.js server, reducing operational complexity and enabling full TypeScript sharing between client and server.

All API routes are located under `src/app/api/v1/` and follow RESTful conventions.

### 6.2 Server-Side Service Layer

Business logic is organized into discrete, single-responsibility service classes under `src/server/`:

```
src/server/
├── ai/               # AI inference pipeline
│   ├── client/       # Gemini API wrapper
│   ├── context/      # Prompt context builder
│   ├── mapper/       # Raw AI → domain model
│   ├── orchestrator/ # Analysis pipeline coordinator
│   ├── parser/       # JSON extraction from AI text
│   ├── prompts/      # Versioned prompt builder
│   └── validator/    # Zod schema validation of AI responses
├── crawler/          # HTTP fetcher
├── db/               # MongoDB client + repository
├── errors/           # Typed error classes
├── logger/           # Structured JSON logger
├── normalizer/       # URL normalization + SSRF
├── snapshot/         # DOM extraction pipeline
└── validators/       # Storefront snapshot validators
```

### 6.3 Error Architecture

All application errors extend a base `ApiError` class with typed `ErrorCodes`:

```typescript
export class ApiError extends Error {
  constructor(
    public readonly code: ErrorCodes,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly cause?: unknown
  ) {}
}

// Typed subclasses
export class ValidationError extends ApiError { /* statusCode: 400 */ }
export class NotFoundError extends ApiError    { /* statusCode: 404 */ }
export class ScrapingError extends ApiError    { /* statusCode: 422 */ }
export class AiAnalysisError extends ApiError  { /* statusCode: 503 */ }
```

The `responseHelpers.fromError(error)` function maps any thrown error to a standardized `{ status, payload }` tuple for consistent API responses.

### 6.4 Structured Logging

The `StructuredLogger` class wraps all log output in JSON format with:

```json
{
  "timestamp": "2026-07-04T16:00:00.000Z",
  "level": "INFO",
  "message": "Website extraction completed",
  "meta": {
    "requestId": "req_abc123",
    "durationMs": 2847
  }
}
```

Every log entry optionally carries `meta` — an arbitrary object for contextual data. The logger supports `info`, `warn`, `error`, and `debug` levels, suppressing `debug` in production.

### 6.5 Request Lifecycle Observability

Every `/api/v1/analyze` request generates a unique `requestId` (`req_` + 8-char alphanumeric). This ID is propagated through all log entries for the lifetime of the request, enabling full correlation across extraction, AI, and database log lines.

Phase-level latency is measured and logged:
```json
{
  "totalDurationMs": 18420,
  "extractionDurationMs": 3200,
  "aiDurationMs": 14800,
  "dbDurationMs": 420
}
```

---

## 7. AI Pipeline Design

### 7.1 Pipeline Overview

The AI analysis pipeline is the core engineering challenge of CRO Engine. It transforms variable, messy real-world HTML into a structured, typed domain model through a series of deterministic transformations:

```
WebsiteSnapshot
    │
    ▼
ContextBuilder.buildContext()
    │  Formats snapshot fields into a structured markdown-like context string
    │  Includes: URL, platform, headings list, CTAs list, content snippet
    ▼
PromptBuilder.buildPrompt(context)
    │  Injects context into versioned system prompt template
    │  System prompt defines: task, output schema, heuristic categories
    ▼
GeminiClient.generate(fullPrompt)
    │  Calls @google/genai SDK with timeout + retry wrapper
    │  Returns raw text string from model
    ▼
JsonParser.extract(rawText)
    │  Strips markdown fencing (```json ... ```)
    │  Removes trailing commas (invalid JSON from some models)
    │  Parses to raw JS object
    ▼
SchemaValidator.validate(rawObject)
    │  Applies Zod schema: overallScore, pageScores, recommendations[]
    │  If fails → triggers self-correction retry (max 3 attempts)
    ▼
DomainMapper.toDomain(validatedData)
    │  Maps raw validated AI output to AuditReport domain type
    │  Assigns report ID, timestamp, storeUrl
    ▼
AuditReport (fully typed, persisted)
```

### 7.2 Self-Correction Retry Loop

The self-correction loop is the most critical reliability mechanism in the system:

```typescript
async analyze(snapshot: WebsiteSnapshot): Promise<AuditReport> {
  const MAX_ATTEMPTS = 3;
  let lastValidationErrors = '';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // Build prompt (with error context on retries)
    const prompt = attempt === 1
      ? this.promptBuilder.build(context)
      : this.promptBuilder.buildCorrection(context, lastValidationErrors);

    const rawText = await this.geminiClient.generate(prompt);
    const rawJson = this.jsonParser.extract(rawText);
    const validation = this.schemaValidator.validate(rawJson);

    if (validation.success) {
      return this.domainMapper.toDomain(validation.data, snapshot);
    }

    lastValidationErrors = JSON.stringify(validation.error.format());
    logger.warn('AI response failed Zod schema validation. Retrying...', {
      attempt, validationErrors: lastValidationErrors
    });
  }

  throw new AiAnalysisError('AI failed to produce valid response after 3 attempts');
}
```

On each retry, the correction prompt includes the exact Zod validation errors as context, instructing Gemini to fix specific fields. This "chain-of-thought correction" pattern reliably resolves most schema violations in one retry.

### 7.3 Gemini Client

The `GeminiClient` wraps the `@google/genai` SDK with:

1. **Timeout wrapper** — Rejects if model takes >25 seconds
2. **Error mapping** — API errors mapped to typed `AiAnalysisError`
3. **Model config** — Temperature: 0.2 (low creativity, high consistency), max output tokens: 4096

```typescript
export class GeminiClient {
  private model = 'gemini-1.5-flash';

  async generate(prompt: string): Promise<string> {
    const response = await withTimeout(
      this.client.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 0.2, maxOutputTokens: 4096 },
      }),
      25_000 // 25 second timeout
    );
    return response.candidates[0].content.parts[0].text;
  }
}
```

### 7.4 JSON Parser

LLMs frequently wrap JSON output in markdown code fences (`\`\`\`json ... \`\`\``). Some also produce trailing commas or single quotes in JSON. The `JsonParser` handles all known patterns:

```typescript
export class JsonParser {
  extract(raw: string): unknown {
    // Step 1: Strip markdown code fences
    const stripped = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();

    // Step 2: Remove trailing commas before } and ]
    const cleaned = stripped.replace(/,(\s*[}\]])/g, '$1');

    // Step 3: Parse
    return JSON.parse(cleaned);
  }
}
```

### 7.5 Schema Validation

The Zod schema enforces the full `AuditReport` structure:

```typescript
const recommendationSchema = z.object({
  pageType: z.enum(['homepage', 'pdp', 'collection', 'cart']),
  category: z.enum(['copywriting', 'layout', 'cta', 'trust', 'mobile', 'performance']),
  finding: z.string().min(10),
  rationale: z.string().min(10),
  actionSteps: z.array(z.string()).min(1),
  impact: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  effort: z.enum(['HIGH', 'MEDIUM', 'LOW']),
});

const auditDataSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string().min(10),
  pageScores: z.object({
    homepage: z.number().min(0).max(100),
    pdp: z.number().min(0).max(100),
    collection: z.number().min(0).max(100),
    cart: z.number().min(0).max(100),
  }),
  nextActions: z.array(z.string()).min(1),
  recommendations: z.array(recommendationSchema).min(1),
});
```

---

## 8. Website Intelligence Pipeline

### 8.1 Overview

The Website Intelligence Pipeline is responsible for fetching a public URL and transforming raw HTML into a structured, AI-friendly representation called a `WebsiteSnapshot`. This snapshot contains only the semantic content needed for CRO analysis — stripped of all non-content noise.

### 8.2 URL Normalization

All submitted URLs pass through `UrlNormalizer` before any HTTP request:

**Stage 1 — Format Validation**
```
https://gymshark.com/products  ← valid
ftp://example.com              ← rejected (non-HTTP protocol)
not-a-url                      ← rejected (invalid format)
```

**Stage 2 — Protocol Enforcement**
All HTTP URLs are upgraded to HTTPS. HTTP-only stores receive a graceful error.

**Stage 3 — Shopify URL Detection**
The normalizer identifies common Shopify URL patterns and normalizes to the store root for homepage analysis:
```
https://store.myshopify.com/collections/all → https://store.myshopify.com/
https://gymshark.com/products/t-shirt       → https://gymshark.com/
```

**Stage 4 — SSRF Validation (Critical)**
See Section 13 (Security Architecture) for full SSRF details.

### 8.3 WebsiteFetcher

The `WebsiteFetcher` uses Axios with strict timeout and content-length limits:

```typescript
const response = await axios.get(url, {
  timeout: 8_000,              // 8 second connect+read timeout
  maxContentLength: 5_242_880, // 5MB max response body
  headers: {
    'User-Agent': 'CROEngine/1.0 (compatible; +https://cro-engine.vercel.app)',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'en-US,en;q=0.9',
  },
  maxRedirects: 3,             // Follow up to 3 redirects
});
```

The `User-Agent` identifies the scraper. Professional scraping practice includes self-identification to allow webmasters to whitelist or rate-limit accordingly.

### 8.4 DOM Minification Engine

The DOM Minifier is one of the most important performance engineering decisions in the system. Raw Shopify HTML frequently exceeds 400–800KB — far too large for cost-efficient AI prompting.

The minifier applies a series of Cheerio-based transforms:

```typescript
export class DomMinifier {
  minify(html: string): string {
    const $ = cheerio.load(html);

    // Phase 1: Remove non-content elements entirely
    $('script, style, noscript, svg, iframe, canvas').remove();
    $('link[rel="stylesheet"], link[rel="preload"]').remove();
    $('meta[name="viewport"]').remove();
    $('[data-reactroot], #__NEXT_DATA__').remove();

    // Phase 2: Strip inline event handlers and data attributes
    $('*').each((_, el) => {
      if (el.type !== 'tag') return;
      Object.keys(el.attribs || {}).forEach(attr => {
        if (attr.startsWith('on') || attr.startsWith('data-')) {
          $(el).removeAttr(attr);
        }
      });
    });

    // Phase 3: Collapse whitespace
    return $.html().replace(/\s+/g, ' ').trim();
  }
}
```

**Token Reduction Results (empirical):**

| Store | Raw HTML | Minified | Reduction |
|---|---|---|---|
| Gymshark | 487KB | 72KB | 85.2% |
| Allbirds | 312KB | 48KB | 84.6% |
| ColourPop | 698KB | 104KB | 85.1% |

### 8.5 Snapshot Validator

Before passing content to the AI pipeline, the `SnapshotValidator` ensures the extracted snapshot meets minimum quality thresholds:

- At least 1 detected heading (store has parseable content)
- At least 1 CTA button/link detected
- Content snippet is non-empty
- Detected platform is `shopify` or `unknown`

Shopify detection uses a CSS class heuristic: Shopify stores almost always include the class `shopify-payment-button`, the meta generator `Shopify`, or have `cdn.shopify.com` resources. Platform detection is informational — it does not gate analysis.

---

## 9. MongoDB Database Design

### 9.1 Database Selection Rationale

MongoDB Atlas was selected over a relational database for the following reasons:

| Factor | MongoDB | PostgreSQL |
|---|---|---|
| Schema evolution | Flexible — AI output shape may evolve | Migrations required for schema changes |
| Free tier | Atlas M0 (512MB free) | Neon/Supabase (512MB free) |
| Deployment | Cloud-native, no infrastructure management | Requires connection pooling config |
| Nested documents | Native — recommendations[] nested array | Requires JOIN or JSONB column |
| Indexing | Compound indexes on multiple fields | Similar |

### 9.2 Collection Design

**Collection: `audits`**

```typescript
interface AuditDocument {
  id: string;                // Primary identifier: "aud_" + nanoid(8)
  storeUrl: string;          // Normalized store URL
  overallScore: number;      // 0-100 composite CRO score
  analyzedAt: string;        // ISO 8601 timestamp
  pageScores: {
    homepage: number;        // 0-100
    pdp: number;             // 0-100 (Product Detail Page)
    collection: number;      // 0-100
    cart: number;            // 0-100
  };
  recommendations: Array<{
    id: string;              // "rec_" + nanoid(8)
    pageType: string;        // 'homepage' | 'pdp' | 'collection' | 'cart'
    category: string;        // 'copywriting' | 'layout' | 'cta' | 'trust' | 'mobile' | 'performance'
    finding: string;         // Specific issue identified
    rationale: string;       // Why it matters for CRO
    actionSteps: string[];   // Concrete developer tasks
    impact: string;          // 'HIGH' | 'MEDIUM' | 'LOW'
    effort: string;          // 'HIGH' | 'MEDIUM' | 'LOW'
  }>;
}
```

### 9.3 Indexes

Three indexes are maintained on the `audits` collection:

```javascript
// Unique index on audit ID for O(1) lookups
{ id: 1 } // unique: true, name: 'ux_audits_id'

// Index on storeUrl for store-based filtering
{ storeUrl: 1 } // name: 'ix_audits_store_url'

// Index on analyzedAt (descending) for "recent audits" queries
{ analyzedAt: -1 } // name: 'ix_audits_analyzed_at'
```

### 9.4 Connection Architecture

MongoDB connections are managed via a singleton promise pattern to support Next.js's server-side rendering model:

```typescript
// src/server/db/mongodb-client.ts
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to prevent hot-reload exhausting connections
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a fresh connection promise
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}
```

**Connection Pool Settings:**
```javascript
{
  maxPoolSize: 10,    // Max concurrent connections
  minPoolSize: 2,     // Maintain warm connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}
```

### 9.5 Repository Layer

The `AuditRepository` class provides a clean data access interface:

```typescript
export class AuditRepository {
  static async save(report: AuditReport): Promise<void>      // Upsert by ID
  static async findById(id: string): Promise<AuditReport | null>
  static async findRecent(limit?: number): Promise<AuditReport[]>  // Default: 10
}
```

All methods:
- Strip the internal MongoDB `_id` field before returning domain objects
- Use lazy index initialization (indexes created once per process startup)
- Map database errors to typed `ApiError` instances

---

## 10. API Design & Contracts

### 10.1 API Versioning Strategy

All API endpoints are versioned under `/api/v1/`. This allows future `/api/v2/` additions without breaking existing integrations. The version is part of the path, not a header — simpler caching and logging.

### 10.2 Response Envelope

All API responses use a consistent `ApiResponse<T>` envelope:

```typescript
// Success
{
  "success": true,
  "data": { /* T */ }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "URL is required",
    "details": { /* Zod error format */ }
  }
}
```

### 10.3 Endpoints

**POST /api/v1/analyze**
```
Request:  { "url": "https://gymshark.com" }
Response: { "success": true, "data": { AuditReport } }
Status:   200 OK
Errors:   400 (validation), 422 (scraping), 503 (AI failure), 500 (unexpected)
```

**GET /api/v1/audits**
```
Request:  (no body)
Response: { "success": true, "data": AuditReport[] }
Status:   200 OK
Errors:   500 (DB failure)
Notes:    Returns 10 most recent, sorted by analyzedAt DESC
```

**GET /api/v1/audits/:id**
```
Request:  (URL param: id)
Response: { "success": true, "data": AuditReport }
Status:   200 OK
Errors:   404 (not found), 500 (DB failure)
```

**POST /api/v1/extract**
```
Request:  { "url": "https://gymshark.com" }
Response: { "success": true, "data": { WebsiteSnapshot } }
Status:   200 OK
Notes:    Debug/testing endpoint — returns raw snapshot without AI
```

**GET /api/v1/health**
```
Request:  (no body)
Response: { "success": true, "data": { "status": "healthy", "timestamp": "..." } }
Status:   200 OK
Notes:    Used by deployment health checks
```

### 10.4 HTTP Status Code Usage

| Code | Usage |
|---|---|
| 200 | Successful GET or successful analyze |
| 201 | Resource created (deprecated path via /audits POST) |
| 400 | Validation failure — bad input |
| 404 | Resource not found |
| 422 | Unprocessable entity — scraping failed, store unreachable |
| 500 | Internal server error |
| 503 | Upstream AI service unavailable |

---

## 11. Folder Structure

### 11.1 Full Annotated Tree

```
CRO/
├── .editorconfig                  # Editor formatting rules
├── .env                           # Local secrets (gitignored)
├── .env.example                   # Template for required variables
├── .eslintrc.json                 # ESLint configuration
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI: lint → typecheck → test
├── .gitignore
├── .lintstagedrc.json             # Pre-commit: lint + format staged files
├── .prettierrc                    # Prettier formatting options
├── ARCHITECTURE.md                # This document
├── CHANGELOG.md                   # Version history
├── CONTRIBUTING.md                # Contributing guide
├── LICENSE                        # MIT License
├── README.md                      # Open-source project README
├── docs/                          # Extended engineering documentation
│   ├── 01-prd.md                  # Product Requirements Document
│   ├── 02-hld.md                  # High Level Design
│   ├── 03-lld.md                  # Low Level Design
│   ├── 04-api-contract.md         # API contracts
│   ├── 05-domain-model.md         # Domain model definitions
│   ├── 06-design-system.md        # UI design tokens and system
│   ├── 07-coding-standards.md     # Code style and patterns
│   ├── 08-development-roadmap.md  # Sprint planning history
│   ├── 09-engineering-decisions.md # ADRs (Architecture Decision Records)
│   ├── 10-ai-design.md            # AI pipeline technical details
│   ├── 11-testing-strategy.md     # Testing approach
│   ├── 12-future-improvements.md  # Backlog
│   ├── 13-engineering-audit-report.md # Sprint 6 audit
│   ├── 14-showcase-materials.md   # LinkedIn / portfolio content
│   └── 15-final-metrics.md        # Sprint 7 metrics report
├── next.config.js                 # Next.js config: security headers, redirects
├── next-env.d.ts                  # Next.js TypeScript definitions
├── package.json
├── postcss.config.js
├── prompts/                       # Versioned AI system prompts
│   └── v1.0.0/
│       └── system-prompt.md
├── public/
│   └── assets/
│       ├── CRO-main-Logo.png      # Full wordmark logo
│       ├── cro-ico-logo.png       # Icon-only logo
│       ├── cro-ico-logo.svg       # SVG vector icon
│       └── favicon.ico            # Browser tab favicon
├── scripts/                       # Developer utility scripts
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/v1/               # Backend API routes
│   │   ├── audits/[id]/          # Audit detail page
│   │   ├── dashboard/            # Past audits dashboard
│   │   ├── docs/                 # Engineering docs viewer
│   │   ├── error.tsx             # Global error boundary
│   │   ├── fonts.ts              # Geist font configuration
│   │   ├── layout.tsx            # Root layout + metadata
│   │   ├── manifest.ts           # PWA web manifest
│   │   ├── not-found.tsx         # 404 page
│   │   ├── page.tsx              # Landing page
│   │   ├── robots.ts             # robots.txt
│   │   └── sitemap.ts            # sitemap.xml
│   ├── components/               # UI component library
│   ├── config/                   # App configuration
│   │   ├── config.ts             # Validated config object
│   │   ├── env.ts                # Zod environment validation
│   │   └── routes.ts             # Centralized route constants
│   ├── constants/                # Application-wide constants
│   ├── core/                     # Core domain types/errors
│   ├── features/                 # Feature-specific logic
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Shared utilities
│   │   └── analytics.ts          # Vendor-agnostic analytics
│   ├── server/                   # Server-side services
│   │   ├── ai/                   # AI pipeline
│   │   ├── api/                  # Response helpers
│   │   ├── crawler/              # HTTP fetching
│   │   ├── db/                   # MongoDB client + repository
│   │   ├── errors/               # Error class hierarchy
│   │   ├── logger/               # Structured logging
│   │   ├── normalizer/           # URL normalization
│   │   ├── snapshot/             # DOM extraction
│   │   ├── validation/           # Input schemas
│   │   └── validators/           # Snapshot quality validators
│   ├── services/                 # Cross-cutting services
│   ├── styles/                   # Global CSS and design tokens
│   ├── tokens/                   # Design token constants (TS)
│   ├── ui/                       # UI primitive types
│   └── utils/                    # Pure utility functions
│       ├── assert-never.ts       # Exhaustive switch helper
│       ├── cn.ts                 # Tailwind class merger
│       ├── retry.ts              # Generic retry wrapper
│       ├── safe-json-parse.ts    # JSON.parse without throws
│       └── timeout.ts            # Promise timeout wrapper
├── tsconfig.json
├── types/
│   └── index.d.ts                # Shared domain type definitions
└── vitest.config.ts
```

---

## 12. Prompt Engineering

### 12.1 Versioning Strategy

All AI system prompts are stored as flat markdown files under `prompts/v{major}.{minor}.{patch}/`. Prompt versions follow semantic versioning:

- **Major** — Breaking change to output schema structure
- **Minor** — New heuristic categories or scoring changes
- **Patch** — Wording improvements, clarity fixes

The `PromptBuilder` reads the active version from config and constructs the full prompt by injecting the snapshot context into the template.

### 12.2 Prompt Structure

The prompt consists of two parts passed to the Gemini API:

**System Prompt** — Defines the AI persona, task, and output schema:
```
You are an expert Conversion Rate Optimization specialist with 15 years of 
experience auditing e-commerce storefronts. You evaluate Shopify store pages 
against established UX heuristics including:

- Hick's Law (decision fatigue from too many choices)
- The Paradox of Choice (choice overload reduces conversions)
- Social proof visibility (reviews, trust badges, ratings)
- CTA clarity and visual hierarchy
- Above-the-fold value proposition
- Cart abandonment friction points
- Mobile-first layout assessment
- Trust signal placement

You will receive a structured representation of a Shopify storefront and must
return a JSON object conforming EXACTLY to the following schema:

{schema}

Return ONLY the JSON object. No markdown, no explanations.
```

**User Prompt** — Contains the extracted storefront context:
```
Analyze the following Shopify storefront:

URL: https://gymshark.com
Platform: Shopify

HEADINGS:
- H1: "Built for Champions"
- H2: "Shop Men's Training"
- H2: "New Arrivals"

CTAs:
- "Shop Now" → /collections/mens
- "Add to Bag" → (cart)
- "View All" → /collections/all

CONTENT SAMPLE:
[First 2000 chars of minified body text]

Provide a comprehensive CRO audit with a minimum of 8 recommendations.
```

### 12.3 Self-Correction Prompt

When the primary response fails Zod validation, the correction prompt is:

```
Your previous response failed JSON schema validation with these errors:

{validationErrors}

The schema requires these exact fields:
- overallScore: number (0-100)
- pageScores: { homepage, pdp, collection, cart } each 0-100
- recommendations: array with at least 1 item, each having:
  - pageType: one of 'homepage' | 'pdp' | 'collection' | 'cart'
  - category: one of 'copywriting' | 'layout' | 'cta' | 'trust' | 'mobile' | 'performance'
  - impact: one of 'HIGH' | 'MEDIUM' | 'LOW'
  - effort: one of 'HIGH' | 'MEDIUM' | 'LOW'
  - actionSteps: non-empty array of strings

Please provide the corrected JSON object only.
```

### 12.4 Temperature & Generation Config

| Parameter | Value | Rationale |
|---|---|---|
| `temperature` | 0.2 | Low = more deterministic JSON, fewer hallucinations |
| `maxOutputTokens` | 4096 | Enough for 8-12 detailed recommendations |
| `topP` | default (0.95) | Nucleus sampling for quality without rigidity |
| `topK` | default (64) | Standard top-k sampling |

---

## 13. Security Architecture

### 13.1 SSRF Protection (Critical)

Server-Side Request Forgery (SSRF) is the most critical security risk in any application that makes outbound HTTP requests based on user-supplied URLs. An attacker could supply:

```
http://169.254.169.254/latest/meta-data/  ← AWS metadata endpoint
http://10.0.0.1/admin                      ← Internal service
http://localhost:27017                      ← Local MongoDB
http://192.168.1.1/                        ← Router admin panel
```

CRO Engine implements a multi-stage SSRF protection:

**Stage 1 — Blocklisted Hostnames**
```typescript
const BLOCKED_HOSTNAMES = [
  'localhost', '127.0.0.1', '::1', '0.0.0.0',
  'metadata.google.internal', '169.254.169.254',
];
```

**Stage 2 — Private IP Range Blocking**
After DNS resolution, the resolved IP is checked against all RFC1918 ranges:
```typescript
const PRIVATE_RANGES = [
  /^10\./,                    // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
  /^192\.168\./,              // 192.168.0.0/16
  /^127\./,                   // Loopback
  /^::1$/,                    // IPv6 loopback
  /^fc00:/,                   // IPv6 ULA
  /^fe80:/,                   // IPv6 link-local
];
```

**Stage 3 — Protocol Enforcement**
Only `https:` URLs accepted. HTTP is rejected.

**Stage 4 — URL Parsing Hardening**
URLs are parsed with the native `URL` constructor. Malformed URLs that throw `TypeError` are rejected before any I/O.

### 13.2 Security Headers

Configured in `next.config.js` via the `headers()` function:

```javascript
{
  'X-Frame-Options': 'DENY',                          // No iframe embedding
  'X-Content-Type-Options': 'nosniff',                // No MIME sniffing
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}
```

### 13.3 Input Validation

All API inputs are validated at the boundary using Zod schemas before any processing:

```typescript
export const urlSchema = z
  .string()
  .min(1, 'URL is required')
  .url('Must be a valid URL')
  .refine(url => url.startsWith('https://'), 'URL must use HTTPS');
```

### 13.4 Secret Management

All secrets (`GEMINI_API_KEY`, `MONGODB_URI`) are:
- Loaded exclusively from environment variables
- Validated at startup via Zod (app fails fast if missing in production)
- Never exposed in client-side bundles (only used in `src/server/` files)
- Excluded from `.gitignore`

---

## 14. Performance Architecture

### 14.1 Token Cost Optimization

The DOM Minifier is the primary cost optimization. Gemini Flash is priced per input/output token. Reducing 487KB HTML to 72KB reduces per-request AI token cost by ~85%.

Without minification at scale:
- 100 requests/day × 487KB = 48.7MB of HTML tokens
- Estimated cost at Gemini pricing: ~$9.74/day

With minification:
- 100 requests/day × 72KB = 7.2MB of HTML tokens
- Estimated cost: ~$1.44/day

**85% cost reduction** with zero impact on recommendation quality.

### 14.2 MongoDB Connection Pooling

Cold-start MongoDB connections add ~800ms to the first request. The singleton connection promise pattern ensures:

1. The connection is established once per Node.js process
2. Subsequent requests reuse existing connections from the pool
3. Next.js hot-reload in development reuses the global connection

### 14.3 Next.js Rendering Strategies

| Page | Strategy | Rationale |
|---|---|---|
| `/` (landing) | Static | No dynamic data; cached at CDN edge |
| `/dashboard` | Client-side fetch | Data changes frequently; no SSR needed |
| `/audits/[id]` | Client-side fetch | Personalized; no shared cache benefit |
| `/docs` | Static | Markdown content; fully cacheable |

### 14.4 Bundle Optimization

- Only `lucide-react` icons actually used are imported (tree-shaken)
- No runtime moment.js or lodash — native Date and array methods used
- `next/image` for all image assets — automatic WebP conversion and lazy loading

---

## 15. Testing Strategy

### 15.1 Testing Philosophy

> "Test the contract, not the implementation."

Each test verifies the *behavior* of a unit from the outside, not the internal implementation details. This makes tests robust to refactoring.

### 15.2 Test Architecture

```
Test Type        | Tool    | Coverage
─────────────────|─────────|──────────────
Unit Tests       | Vitest  | Domain logic, transformers, validators
Integration Tests| Vitest  | API route handlers (mocked dependencies)
Type Checking    | tsc     | Full TypeScript strict compilation
Linting          | ESLint  | Code quality rules
```

### 15.3 Mocking Strategy

External I/O is mocked at the module boundary using `vi.mock()`:

```typescript
// Mock MongoDB client — prevents actual DB connections in tests
vi.mock('./mongodb-client', () => ({
  clientPromise: Promise.resolve({
    db: vi.fn().mockReturnValue({
      collection: vi.fn().mockReturnValue({
        replaceOne: mockReplaceOne,
        findOne: mockFindOne,
        find: () => ({ sort: () => ({ limit: () => ({ toArray: mockToArray }) }) }),
      }),
    }),
  }),
}));

// Mock Gemini client — prevents actual API calls in tests
vi.mock('@/server/ai/client/gemini-client', () => ({
  GeminiClient: vi.fn().mockImplementation(() => ({
    generate: mockGeminiGenerate,
  })),
}));
```

### 15.4 Test Coverage Summary

| Suite | Tests | Coverage Area |
|---|---|---|
| `url-normalizer.test.ts` | 6 | HTTPS enforcement, Shopify detection, SSRF blocking |
| `schemas.test.ts` | 8 | Zod validation schemas |
| `snapshot-validator.test.ts` | 2 | Minimum content thresholds |
| `context-builder.test.ts` | 1 | Prompt context formatting |
| `prompt-builder.test.ts` | 1 | Template rendering |
| `domain-mapper.test.ts` | 2 | AI output → AuditReport mapping |
| `json-parser.test.ts` | 5 | Markdown fence stripping, trailing commas |
| `app-error.test.ts` | 4 | Error class hierarchy |
| `audit-repository.test.ts` | 4 | save, findById, findRecent |
| `analysis-orchestrator.test.ts` | 5 | Retry loop, error bubbling |
| `extract-route.test.ts` | 2 | API route integration |
| `analyze-route.test.ts` | 2 | API route integration |
| **Total** | **42** | |

### 15.5 CI Pipeline

GitHub Actions runs on every push and pull request:

```yaml
jobs:
  ci:
    steps:
      - npm ci
      - npm run lint          # ESLint
      - npm run check-types   # tsc --noEmit
      - npm run test          # vitest run
```

All three must pass for a PR to merge. The `check-types` job runs in strict TypeScript mode — no implicit any, no unused variables.

---

## 16. Deployment Architecture

### 16.1 Production Stack

| Layer | Service | Config |
|---|---|---|
| Hosting | Vercel | Next.js first-party deployment |
| Database | MongoDB Atlas | M0 free tier (512MB) |
| AI | Google AI Studio | Gemini 1.5 Flash API |
| CDN | Vercel Edge Network | Automatic via Vercel |
| CI/CD | GitHub Actions | Lint → typecheck → test |

### 16.2 Environment Variables

```bash
# Required — application will fail at startup without these
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cro-engine

# Optional — affects SEO and deployment URL metadata
NEXT_PUBLIC_APP_URL=https://your-deployed-domain.com
```

The `NEXT_PUBLIC_` prefix makes the URL available in client-side bundles (for OG metadata). All other variables are server-side only.

### 16.3 Vercel Deployment Configuration

Vercel auto-detects Next.js and configures:
- **Build Command:** `npm run build`
- **Output:** `.next/` directory
- **Node.js Version:** 20.x
- **Region:** Auto (nearest to user)
- **Edge Functions:** None — all API routes run on Node.js runtime for MongoDB compatibility

### 16.4 Health Check

The `/api/v1/health` endpoint returns:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-07-04T16:00:00.000Z",
    "services": {
      "geminiApi": "connected",
      "scraperEngine": "idle"
    }
  }
}
```

This endpoint can be used by uptime monitoring services (UptimeRobot, Checkly) to alert on downtime.

### 16.5 Next.js Security Headers

Configured via `next.config.js` `headers()` function — applied on every response at the CDN edge level, not the Node.js application level:

```javascript
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ],
  }];
}
```

---

## 17. Engineering Trade-offs

### 17.1 Cheerio vs Puppeteer

| Aspect | Cheerio | Puppeteer |
|---|---|---|
| Speed | <1 second | 5–15 seconds (browser startup) |
| Memory | ~50MB | ~300MB per browser instance |
| JavaScript execution | ❌ No | ✅ Yes |
| Shopify SSR content | ✅ Available | ✅ Available |
| Shopify SPA content | ❌ Missing | ✅ Available |
| Cost (serverless) | Low | High (memory/time billing) |
| **Decision** | ✅ **Chosen** | ❌ Rejected |

**Rationale:** The vast majority of Shopify themes use server-side rendering for core content (headings, CTAs, product titles) — the exact content needed for CRO analysis. JavaScript-rendered content (recommendations widgets, review counts loaded async) is supplementary for a first-pass CRO audit.

### 17.2 Gemini vs OpenAI GPT-4

| Aspect | Gemini 1.5 Flash | GPT-4o |
|---|---|---|
| Cost | Lower | Higher |
| Structured JSON | Reliable with Zod retry | Reliable with function calling |
| Context window | 1M tokens | 128K tokens |
| Free tier | Generous | Limited |
| Self-hosted | ❌ | ❌ |
| **Decision** | ✅ **Chosen** | Considered |

**Rationale:** Gemini 1.5 Flash offers a generous free tier, sufficient JSON reliability with our retry loop, and a massively larger context window (useful for analyzing long storefront HTML without aggressive truncation).

### 17.3 MongoDB vs PostgreSQL

| Aspect | MongoDB Atlas | PostgreSQL (Neon) |
|---|---|---|
| Schema flexibility | ✅ No migrations needed | ❌ Schema changes require migrations |
| Nested arrays | ✅ Native document model | ❌ Requires JSONB column |
| Free tier | ✅ M0 512MB | ✅ 512MB |
| Type safety (TS) | Good via typed generics | Excellent via Prisma |
| **Decision** | ✅ **Chosen** | Considered |

**Rationale:** The `recommendations[]` array is a variable-length nested document that would require either a JSONB column or a separate `recommendations` table with JOINs in PostgreSQL. MongoDB's document model maps directly to the `AuditReport` TypeScript type without any ORM mapping layer.

### 17.4 No Global State Management

**Decision:** No Redux, Zustand, or Context API for global state.

**Rationale:** The application has three isolated data domains:
1. Landing page form state — local to `page.tsx`
2. Dashboard audit list — local to `dashboard/page.tsx`
3. Audit detail — local to `audits/[id]/page.tsx`

None of these share state. Adding a global store would introduce indirection, boilerplate, and potential bugs with no architectural benefit.

### 17.5 Zod on Both Client and Server

**Decision:** Use the same Zod schemas for both client-side form validation and server-side API input validation.

**Rationale:** Zod schemas are defined once in `src/server/validation/schemas.ts` and imported by both the react-hook-form resolver on the client and the API route handlers on the server. This eliminates validation drift between the two layers — impossible for the client to send something the server would reject.

---

## 18. Future Work & Roadmap

### 18.1 Near-Term (Next Sprint)

| Feature | Priority | Description |
|---|---|---|
| User Authentication | P1 | Clerk/NextAuth — multi-tenant audit history |
| Webhook Notifications | P2 | Notify via email/Slack when analysis completes |
| Re-run Analysis | P2 | One-click re-analyze with updated AI model |
| PDF Report Export | P2 | Export audit as professionally formatted PDF |
| Competitor Comparison | P3 | Side-by-side audit of two stores |

### 18.2 Medium-Term

| Feature | Priority | Description |
|---|---|---|
| Scheduled Audits | P2 | Weekly/monthly automated re-analysis |
| Change Detection | P2 | Alert when store changes affect CRO score |
| Team Workspaces | P2 | Shared audit history for agencies |
| Recommendation Tracking | P1 | Mark recommendations implemented, track score change |
| Shopify App Integration | P3 | Install directly from Shopify App Store |

### 18.3 Infrastructure Evolution

| Upgrade | Trigger | Description |
|---|---|---|
| PostgreSQL migration | >10K audits | Better query performance at scale |
| Puppeteer fallback | SPA stores increasing | Render JS-heavy stores when Cheerio fails |
| Redis caching | >1K req/day | Cache identical URL analyses for 24h |
| Background jobs | Long-running analyses | BullMQ or Vercel Cron for async processing |
| Multi-model support | GPT-4/Claude availability | A/B test AI models for quality comparison |
| Rate limiting | Production abuse | Redis-based sliding window per IP/user |

### 18.4 Open Questions

1. **Shopify App Store:** Is there a path to productizing CRO Engine as a native Shopify app with merchant OAuth and real analytics data access?

2. **Fine-tuning:** Could a fine-tuned model on historical CRO audit data outperform prompt-based Gemini on structured output reliability and domain-specific quality?

3. **Embeddings:** Could we vector-embed past recommendations and semantically search them to provide "similar findings" context — improving AI quality without increasing prompt length?

4. **Multi-page analysis:** Should we crawl and analyze 3-5 pages (homepage + one PDP + one collection + cart) simultaneously rather than just the homepage for deeper coverage?

---

*This document is maintained alongside the codebase. When architecture decisions change, this document must be updated.*

*CRO Engine Engineering Team — Sprint 7 — July 2026*
