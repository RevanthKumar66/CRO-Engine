# CRO Engine — Showcase Materials

This document contains presentation-ready content for LinkedIn posts, portfolio descriptions, resume bullets, and technical interview talking points.

---

## LinkedIn Post Draft

> 🚀 Excited to share a personal engineering project I've been building: **CRO Engine** — an AI-powered Shopify Conversion Rate Optimization analyzer.
>
> What it does: You enter any Shopify store URL and get a structured audit in under 30 seconds. The system scrapes the storefront, runs it through a custom Gemini AI prompt pipeline with self-correction retry logic, and returns a prioritized CRO report scored per page type (Homepage, PDP, Collection, Cart).
>
> Engineering highlights:
> 🧠 **Gemini AI** with multi-attempt self-correction
> 🕷️ **Custom DOM minifier** — reduces HTML token count by ~85%
> 🛡️ **SSRF protection** — full private IP range blocking
> 🏗️ **MongoDB Atlas** — async-safe connection pooling with lazy index initialization
> ⚡ **Next.js 15** — App Router, Server Components, API Routes
>
> It's production-ready with structured logging, request correlation IDs, CI pipelines, and 100% unit + integration test coverage.
>
> [Link to GitHub Repo]
>
> Built from zero to full product in 7 sprints. Interesting challenge: getting Gemini to reliably return structured JSON from complex storefront HTML — solved with Zod schema validation + automatic prompt self-correction retries.
>
> Happy to chat architecture or AI reliability patterns. 🙌

---

## Portfolio Project Description

**CRO Engine** — Shopify Conversion Rate Optimization Analyzer

Full-stack AI application that crawls Shopify storefronts and generates actionable conversion recommendations via structured Gemini AI analysis. Built with Next.js 15, MongoDB Atlas, and TypeScript.

**Core Technical Achievements:**
- Engineered a custom HTML DOM minification pipeline that strips SVGs, scripts, and styles — reducing input token count by ~85% for cost-efficient AI prompting
- Implemented a Zod-enforced AI output validation loop with automatic self-correction retry — achieving reliable structured JSON from complex real-world HTML
- Built SSRF-safe URL normalization that resolves DNS, rejects private IP ranges, and normalizes Shopify-specific URL variants
- Established MongoDB Atlas repository layer with lazy async index initialization and clean domain model separation from persistence layer

---

## Resume Project Description (2-3 bullet format)

- Built a production-ready AI-powered SaaS tool (CRO Engine) analyzing Shopify storefronts using Google Gemini AI with structured self-correction retry loops, achieving reliable JSON schema compliance across real-world storefront HTML inputs
- Engineered custom DOM minifier reducing HTML token count by ~85%, enabling cost-efficient AI context construction within token limits, alongside SSRF-safe URL normalizer blocking 14 private IP ranges
- Implemented MongoDB Atlas persistence layer with lazy-initialized async indices, request correlation logging, full CI pipeline (GitHub Actions), and 42 unit/integration tests with 100% pass rate

---

## 2-Minute Demo Script

**[0:00 — 0:15] Open the app**
> "This is CRO Engine — an AI-powered storefront analyzer. You give it any Shopify URL and it returns a prioritized conversion optimization report in under 30 seconds."

**[0:15 — 0:35] Enter a real URL**
> "I'll use Gymshark's store URL. Hit Analyze. Notice the loading states — each step reflects a real pipeline phase: scraping, DOM minification, AI context building, Gemini analysis."

**[0:35 — 1:10] Show the dashboard**
> "Here's the result. We get an overall score — Gymshark scores 74 — broken down across Homepage, PDP, Collection, and Cart. Each recommendation includes an impact-effort matrix and specific developer action steps."

**[1:10 — 1:40] Technical deep dive**
> "The interesting engineering challenge was getting Gemini to reliably output structured JSON from messy real-world HTML. I solved this with a Zod validation loop — if the AI response fails schema validation, the system automatically retries with a self-correction prompt, up to 3 attempts."

**[1:40 — 2:00] Architecture summary**
> "The full stack: Next.js 15 App Router for the UI and API, MongoDB Atlas for persistence, custom Cheerio DOM scraper with our minifier, and Gemini 1.5 Flash as the AI engine. Clean separation between domain, infrastructure, and presentation layers."

---

## Architecture Explanation (Interview)

```
Browser → Next.js App Router
       → /api/v1/analyze (POST)
            → URL Normalizer (SSRF protection)
            → SnapshotOrchestrator
                → WebsiteFetcher (Cheerio + Axios)
                → DomMinifier (85% token reduction)
            → AnalysisOrchestrator
                → ContextBuilder (formats prompt context)
                → PromptBuilder (versioned system prompts)
                → GeminiClient (AI inference with retry)
                → JsonParser (extracts JSON from model output)
                → SchemaValidator (Zod validation)
                → DomainMapper (raw AI → AuditReport)
            → AuditRepository (MongoDB Atlas upsert)
       → Returns audit ID
Browser → /audits/:id → Fetches and renders full report
```

---

## Key Engineering Trade-offs

| Decision | Choice | Rationale |
|---|---|---|
| Scraping Engine | Cheerio vs Puppeteer | Cheerio: 10x faster, no browser overhead, enough for Shopify static HTML |
| AI Model | Gemini Flash vs GPT-4 | Free tier, fast inference, sufficient for structured JSON tasks |
| Validation | Zod + retry | Ensures contract compliance without brittle regex-based parsing |
| Database | MongoDB Atlas | Schema-flexible for evolving AI output shapes; free tier available |
| Framework | Next.js App Router | Unified full-stack without separate Express server |
| Token reduction | Custom DOM minifier | Avoids Cheerio's `.text()` which loses structural context |
