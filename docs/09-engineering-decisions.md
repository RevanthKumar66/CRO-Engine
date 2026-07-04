# Shopify CRO Opportunity Engine - Architectural Decision Records (ADR)

This document contains the Architectural Decision Records (ADRs) for the Shopify CRO Opportunity Engine. It outlines the technical trade-offs, technologies selected, and the reasons for rejecting alternative approaches.

---

## ADR 01: Language & Core Stack Selection

### Context
We need a robust, scalable language and execution runtime to handle high-concurrency requests, network scraping, text processing, and AI integrations.

### Decision
Use **TypeScript** on a **Node.js** execution environment.

### Rationale
* **TypeScript** enforces type safety across the application boundaries, reducing runtime exceptions during scraper data mappings and AI payload validations.
* **Node.js** has excellent asynchronous I/O libraries (e.g., Axios, Express), which are critical for scraping storefronts in parallel.
* The official Google Gen AI SDK (`@google/genai`) has first-class TypeScript support.

### Rejected Alternatives
* **Python**: Rejected for the core web/API application stack. While excellent for AI, Node.js provides lower cold-start times on serverless environments and offers seamless integration with frontend rendering platforms.

---

## ADR 02: Storefront Scraping Strategy

### Context
The platform must extract DOM configurations, CTAs, headings, and copywriting text from target Shopify storefront pages.

### Decision
Use **Cheerio** combined with **Axios** (light HTTP parsing) as the primary scraping method, rather than a headless browser.

### Rationale
* **Performance**: Headless browser automation (e.g., Playwright/Puppeteer) consumes significant server resources (RAM/CPU) and adds 3-5 seconds of execution overhead per page load.
* **Efficiency**: Cheerio compiles clean HTML strings into a memory-light DOM representation, allowing fast, parallel operations.
* **Minification**: Since we discard styling scripts and render paths, Cheerio's selectors are sufficient to build the structural layouts.

### Rejected Alternatives
* **Playwright / Puppeteer**: Rejected for the MVP due to resource constraints and slow crawl times. It remains in future plans if the scraper needs to execute complex JavaScript-heavy checkouts.

---

## ADR 03: Gemini AI Model Selection & Configuration

### Context
We need an AI model capable of parsing storefront page structures and extracting UX optimization recommendations using strict JSON outputs.

### Decision
Use **Gemini 1.5 Flash** as the default engine, with a configuration template fallback to **Gemini 1.5 Pro**.

### Rationale
* **Cost & Speed**: Gemini 1.5 Flash is highly cost-effective and returns payloads in under 5 seconds (compared to 15+ seconds for 1.5 Pro).
* **Context Size**: Its 1M token context capacity allows the system to easily fit the minified storefront pages.
* **Structured Output**: Support for native `responseSchema` ensures the model output matches our Zod validator exactly, avoiding parsing failures.
* **Pro Fallback**: If Flash fails validation or encounters highly complex page layouts, the system automatically elevates the query to Gemini 1.5 Pro.

### Rejected Alternatives
* **GPT-4o / Claude 3.5 Sonnet**: Rejected due to higher execution costs, lack of standard 1M+ context capacity inside baseline tiers, and external API rate constraints.

---

## ADR 04: UI Styling Architecture

### Context
The dashboard UI must feel premium, responsive, clean, and fast, aligning with a modern SaaS style.

### Decision
Use **Vanilla CSS Custom Properties (CSS variables)** for the design token system and styling.

### Rationale
* **Control**: Vanilla CSS provides ultimate control over modern design patterns such as glassmorphism, animations, and radial score gauges.
* **Zero Compilation**: No runtime JavaScript styles or heavy compilation libraries are needed, ensuring instant dashboard loading times.
* **Framework Agnostic**: The design token structures can easily scale into React, Vue, or clean HTML templates.

### Rejected Alternatives
* **Tailwind CSS**: Tailwind is excellent but can lead to bloated, non-reusable markup class strings. Using vanilla CSS tokens ensures clean, highly maintainable design structures.
