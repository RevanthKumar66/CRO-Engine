# CRO Engine

> **AI-powered Conversion Rate Optimization audits for Shopify storefronts — in under 30 seconds.**

[![CI](https://github.com/your-username/cro-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/cro-engine/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/tests-42%20passing-brightgreen)]()

---

## What It Does

CRO Engine crawls any public Shopify storefront, extracts structural layout, CTAs, headings, and product page elements, then runs a structured Gemini AI audit pipeline to generate prioritized conversion recommendations — organized by page, impact, and implementation effort.

---

## Features

| Feature | Description |
|---|---|
| 🕷️ **Smart Scraper** | Cheerio-based HTML crawler with custom DOM minifier — reduces input token count by ~85% |
| 🧠 **Gemini AI Audit** | Structured JSON responses via Gemini 1.5 Flash with automatic self-correction retry loop |
| 🛡️ **SSRF Protection** | Blocks private IP ranges, local loopbacks, and internal hostnames |
| 📊 **Scored Reports** | Per-page scores (Homepage, PDP, Collection, Cart) + overall CRO score |
| 🎯 **Impact Matrix** | Each recommendation tagged by impact level, effort, and page type |
| 💾 **Persistent Audits** | MongoDB Atlas storage with async-safe connection pooling and index management |
| 🔍 **Past Audits Dashboard** | Browse all previous audits with search filtering and score badges |
| ✅ **42 Tests** | Full unit and integration test coverage via Vitest |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.6 (strict) |
| AI Engine | Google Gemini 1.5 Flash via `@google/genai` |
| Database | MongoDB Atlas |
| Scraper | Cheerio + Axios |
| Validation | Zod |
| Styling | Tailwind CSS v4 |
| Forms | React Hook Form |
| Testing | Vitest |
| CI | GitHub Actions |

---

## Architecture

```
Browser → Next.js App Router
       ↓
/api/v1/analyze (POST)
       ↓
   URL Normalizer           ← SSRF protection, Shopify URL normalization
       ↓
   SnapshotOrchestrator
       ├── WebsiteFetcher   ← Axios + Cheerio DOM extraction
       └── DomMinifier      ← Strips scripts, styles, SVG (~85% token reduction)
       ↓
   AnalysisOrchestrator
       ├── ContextBuilder   ← Formats page metadata into AI prompt context
       ├── PromptBuilder    ← Versioned system prompt (v1.0.0)
       ├── GeminiClient     ← AI inference with self-correction retry loop
       ├── JsonParser       ← Extracts JSON from markdown-fenced responses
       ├── SchemaValidator  ← Zod strict validation
       └── DomainMapper     ← Raw AI output → AuditReport domain model
       ↓
   AuditRepository          ← MongoDB Atlas upsert (with lazy index init)
       ↓
   Returns { id }  →  Browser redirects to /audits/:id
```

---

## Project Structure

```
CRO/
├── .github/workflows/        # GitHub Actions CI pipeline
├── docs/                     # Architecture, API contracts, design decisions
│   ├── 01-prd.md
│   ├── 02-hld.md
│   ├── 09-engineering-decisions.md
│   ├── 14-showcase-materials.md
│   └── 15-final-metrics.md
├── prompts/                  # Versioned Gemini system prompts
├── public/assets/            # Favicon, app icons, logos
├── src/
│   ├── app/                  # Next.js App Router pages + API routes
│   │   ├── api/v1/           # analyze, audits, extract, health endpoints
│   │   ├── audits/[id]/      # Audit detail dashboard
│   │   ├── dashboard/        # Past audits list
│   │   └── page.tsx          # Landing page with AI loading experience
│   ├── components/           # Reusable UI component library
│   ├── server/               # Backend services
│   │   ├── ai/               # Gemini client, orchestrator, parser, validator
│   │   ├── crawler/          # Storefront fetcher
│   │   ├── db/               # MongoDB repository
│   │   ├── errors/           # Typed application error classes
│   │   ├── logger/           # Structured JSON logger
│   │   ├── normalizer/       # URL normalization + SSRF protection
│   │   └── snapshot/         # DOM extraction orchestration
│   ├── lib/                  # Shared utilities (analytics abstraction)
│   ├── styles/               # Global CSS and design tokens
│   └── utils/                # Helpers (cn, retry, timeout, safe-json-parse)
└── types/                    # Shared TypeScript domain type definitions
```

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- Google Gemini API key ([Get one free](https://aistudio.google.com))
- MongoDB Atlas URI ([Free M0 tier](https://www.mongodb.com/cloud/atlas))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/cro-engine.git
cd cro-engine

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

### Environment Variables

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/cro-engine

# Optional
NEXT_PUBLIC_APP_URL=https://your-deployed-domain.com
```

### Development

```bash
npm run dev          # Start dev server at localhost:3000
npm run test         # Run all 42 unit + integration tests
npm run check-types  # TypeScript strict compilation check
npm run lint         # ESLint code quality check
npm run build        # Production build
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/analyze` | Submit a storefront URL for AI audit |
| `GET` | `/api/v1/audits` | Retrieve recent audits list |
| `GET` | `/api/v1/audits/:id` | Retrieve a specific audit report |
| `POST` | `/api/v1/extract` | Extract raw storefront DOM snapshot |
| `GET` | `/api/v1/health` | Health check endpoint |

**Analyze Request:**
```json
POST /api/v1/analyze
{ "url": "https://gymshark.com" }
```

**Analyze Response:**
```json
{
  "success": true,
  "data": {
    "id": "aud_abc123",
    "storeUrl": "https://gymshark.com",
    "overallScore": 74,
    "analyzedAt": "2026-07-04T16:00:00Z",
    "pageScores": { "homepage": 80, "pdp": 72, "collection": 70, "cart": 74 },
    "recommendations": [...]
  }
}
```

See [`docs/api.md`](docs/api.md) for full API documentation.

---

## Engineering Highlights

### DOM Minification Pipeline
Raw Shopify HTML can exceed 500KB. CRO Engine strips scripts, styles, SVGs, and redundant layout tags via a Cheerio-based minifier, reducing content to ~15% of original size for cost-efficient AI prompting.

### Gemini Self-Correction Loop
Gemini outputs are validated against a strict Zod schema. If validation fails, the system automatically retries with a corrective prompt up to 3 times before raising a typed error — achieving reliable structured JSON from real-world storefront complexity.

### SSRF Protection
All submitted URLs are normalized through a multi-stage validator that resolves DNS, rejects private IP ranges (RFC1918), blocks local loopbacks, and normalizes Shopify-specific URL patterns before any network request is made.

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines on submitting issues and pull requests.

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
