'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import { Container } from '@/components/common/Container';
import {
  BookOpen,
  ChevronRight,
  AlertTriangle,
  Layers,
  Code2,
  Brain,
  Database,
  Globe,
  FolderOpen,
  Lock,
  Zap,
  TestTube2,
  Rocket,
  Scale,
  Lightbulb,
  Search,
  Target,
  BarChart3,
  Server,
  Cpu,
  FlaskConical,
} from 'lucide-react';

const SECTIONS = [
  { id: 'problem', title: '1. Problem Statement', icon: AlertTriangle },
  { id: 'goals', title: '2. Goals & Non-Goals', icon: Target },
  { id: 'requirements', title: '3. Requirements', icon: BookOpen },
  { id: 'architecture', title: '4. System Architecture', icon: Layers },
  { id: 'frontend', title: '5. Frontend Architecture', icon: Globe },
  { id: 'backend', title: '6. Backend Architecture', icon: Server },
  { id: 'ai-pipeline', title: '7. AI Pipeline Design', icon: Brain },
  { id: 'intelligence', title: '8. Website Intelligence', icon: Search },
  { id: 'mongodb', title: '9. MongoDB Design', icon: Database },
  { id: 'api', title: '10. API Design & Contracts', icon: Code2 },
  { id: 'structure', title: '11. Folder Structure', icon: FolderOpen },
  { id: 'prompts', title: '12. Prompt Engineering', icon: Cpu },
  { id: 'security', title: '13. Security Architecture', icon: Lock },
  { id: 'performance', title: '14. Performance Architecture', icon: Zap },
  { id: 'testing', title: '15. Testing Strategy', icon: FlaskConical },
  { id: 'deployment', title: '16. Deployment Architecture', icon: Rocket },
  { id: 'tradeoffs', title: '17. Engineering Trade-offs', icon: Scale },
  { id: 'future', title: '18. Future Work & Roadmap', icon: Lightbulb },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="my-4 overflow-x-auto rounded-md bg-slate-950 border border-slate-800 p-4 text-xs leading-relaxed text-slate-300 font-mono">
      <code>{children}</code>
    </pre>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-12 mb-4 text-xl font-bold tracking-tight text-text-primary scroll-mt-24 border-b border-border-muted pb-3"
    >
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 mb-2 text-base font-semibold text-text-primary">{children}</h3>;
}

function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('mb-3 text-sm leading-7 text-text-secondary', className)}>{children}</p>;
}

function Callout({
  type = 'info',
  children,
}: {
  type?: 'info' | 'warning' | 'critical';
  children: React.ReactNode;
}) {
  const styles = {
    info: 'bg-blue-50 border-accent-violet/30 text-blue-900',
    warning: 'bg-amber-50 border-accent-amber/30 text-amber-900',
    critical: 'bg-rose-50 border-accent-rose/30 text-rose-900',
  };
  return (
    <div className={cn('my-4 rounded-md border-l-4 p-4 text-sm leading-6', styles[type])}>
      {children}
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-md border border-border-muted">
      <table className="w-full text-xs">
        <thead className="bg-bg-secondary border-b border-border-muted">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 text-left font-semibold text-text-primary">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-bg-secondary/50'}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-text-secondary">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ children, color = 'violet' }: { children: string; color?: string }) {
  const colors: Record<string, string> = {
    violet: 'bg-accent-violet/10 text-accent-violet border-accent-violet/20',
    emerald: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20',
    rose: 'bg-accent-rose/10 text-accent-rose border-accent-rose/20',
    amber: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
  };
  return (
    <span
      className={cn(
        'inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold',
        colors[color] || colors.violet
      )}
    >
      {children}
    </span>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('problem');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -70% 0%', threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Page header */}
      <div className="border-b border-border-muted bg-bg-secondary/60">
        <Container>
          <div className="py-8 space-y-1">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
              <span>CRO Engine</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-text-primary font-medium">
                Architecture & Engineering Design
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Engineering Documentation
            </h1>
            <p className="text-sm text-text-secondary max-w-2xl">
              Comprehensive system architecture, design decisions, implementation details, and
              engineering trade-offs for the CRO Engine — written at senior engineer level.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge color="violet">Version 1.0.0</Badge>
              <Badge color="emerald">Production</Badge>
              <Badge color="amber">Next.js 15 · Gemini AI · MongoDB Atlas</Badge>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="flex gap-8 py-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20 space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted px-3 pb-2">
                Sections
              </p>
              {SECTIONS.map(({ id, title, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={cn(
                    'w-full flex items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-all duration-150',
                    activeSection === id
                      ? 'bg-accent-violet/10 text-accent-violet font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="leading-tight">{title}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <main ref={contentRef} className="flex-1 min-w-0 max-w-3xl">
            {/* ── 1. Problem Statement ─────────────────────────────── */}
            <SectionTitle id="problem">1. Problem Statement</SectionTitle>
            <SubTitle>1.1 Background</SubTitle>
            <P>
              Conversion Rate Optimization (CRO) is the systematic process of increasing the
              percentage of website visitors who take a desired action — purchasing a product,
              adding items to cart, or completing checkout.
            </P>
            <P>
              For Shopify merchants, the difference between a 1% and 3% conversion rate on a store
              generating $1M/year is <strong>$20,000 in incremental revenue</strong> — without
              acquiring a single additional visitor.
            </P>
            <Callout type="warning">
              Professional CRO audits from agencies cost $5,000–$25,000 per engagement, take 2–4
              weeks, and require specialized knowledge of e-commerce UX heuristics, consumer
              psychology, and Shopify-specific patterns.
            </Callout>
            <SubTitle>1.2 The Problem</SubTitle>
            <P>
              There is no accessible, automated tool that: understands Shopify-specific storefront
              patterns, applies established CRO heuristics, produces actionable prioritized
              recommendations, and runs at internet scale in seconds rather than weeks.
            </P>
            <Table
              headers={['Solution', 'Gap']}
              rows={[
                [
                  'Google PageSpeed / GTmetrix',
                  'Technical performance only — no conversion psychology',
                ],
                [
                  'Hotjar / VWO / Optimizely',
                  'Requires existing traffic data and weeks of A/B testing',
                ],
                ['Agency CRO Audits', 'Expensive ($5K–$25K), slow (2–4 weeks), not scalable'],
              ]}
            />

            {/* ── 2. Goals ─────────────────────────────────────────── */}
            <SectionTitle id="goals">2. Goals & Non-Goals</SectionTitle>
            <Table
              headers={['Goal', 'Priority', 'Description']}
              rows={[
                ['URL-to-report in <30 seconds', 'P0', 'Core product promise: instant analysis'],
                ['Structured JSON recommendations', 'P0', 'Machine-readable, typed output'],
                ['SSRF protection', 'P0', 'No internal network access via URL input'],
                ['MongoDB persistence', 'P1', 'Audits stored and retrievable by ID'],
                ['Dashboard for past audits', 'P1', 'Browse and compare historical results'],
                ['PWA support', 'P2', 'Manifest, theme color, icon set'],
              ]}
            />
            <SubTitle>Non-Goals</SubTitle>
            <Table
              headers={['Non-Goal', 'Rationale']}
              rows={[
                [
                  'Real-time A/B testing',
                  'Requires traffic instrumentation — separate product domain',
                ],
                [
                  'Browser-rendered SPA scraping',
                  'Puppeteer overhead 10x — most Shopify stores render SSR',
                ],
                ['Multi-language support', 'English-only in v1'],
                ['User authentication', 'Single-user portfolio project in v1'],
              ]}
            />

            {/* ── 3. Requirements ──────────────────────────────────── */}
            <SectionTitle id="requirements">3. Requirements</SectionTitle>
            <SubTitle>3.1 Functional Requirements</SubTitle>
            <P>
              <strong>FR-01 — URL Input:</strong> Accept a public HTTPS URL, normalize it, validate
              against SSRF protection, reject malformed inputs before any I/O.
            </P>
            <P>
              <strong>FR-02 — Storefront Scraping:</strong> Fetch and parse the HTML, extracting
              headings, CTAs, navigation, and product metadata without executing JavaScript.
            </P>
            <P>
              <strong>FR-03 — DOM Minification:</strong> Strip scripts, styles, SVG, and redundant
              layout — reduce HTML token count by ≥70%.
            </P>
            <P>
              <strong>FR-04 — AI Audit:</strong> Use a versioned prompt with Gemini to produce a
              structured JSON `AuditReport`.
            </P>
            <P>
              <strong>FR-05 — Self-Correction:</strong> Validate AI responses via Zod. Retry with a
              self-correction prompt up to 3 times on failure.
            </P>
            <P>
              <strong>FR-06 — Persistence:</strong> Persist each `AuditReport` to MongoDB Atlas with
              idempotent upsert on audit ID.
            </P>
            <SubTitle>3.2 Non-Functional Requirements</SubTitle>
            <Table
              headers={['NFR', 'Target']}
              rows={[
                ['URL validation latency', '<50ms'],
                ['DOM extraction latency', '<5 seconds'],
                ['AI analysis latency', '<20 seconds'],
                ['Total end-to-end (P95)', '<30 seconds'],
                ['AI retry limit', '≤3 attempts'],
                ['Test pass rate (CI)', '100%'],
                ['TypeScript errors (CI)', '0'],
              ]}
            />

            {/* ── 4. Architecture ──────────────────────────────────── */}
            <SectionTitle id="architecture">4. System Architecture Overview</SectionTitle>
            <P>
              CRO Engine is a full-stack Next.js 15 application. The frontend, backend API routes,
              and server-side services all live within a single Next.js project — eliminating the
              need for a separate API server.
            </P>
            <SubTitle>4.1 Request Lifecycle</SubTitle>
            <CodeBlock>
              {`1. User submits URL → POST /api/v1/analyze
2. requestId generated: "req_" + 8-char alphanumeric
3. Input parsed → Zod validation (400 on failure)
4. URL normalized → SSRF check (422 on block)
5. SnapshotOrchestrator.generateSnapshot(url)
   a. WebsiteFetcher.fetch(url)  → raw HTML
   b. DomMinifier.minify(html)   → ~85% smaller
   c. Returns WebsiteSnapshot
6. AnalysisOrchestrator.analyze(snapshot)
   a. ContextBuilder.build()     → prompt context string
   b. PromptBuilder.build()      → full system+user prompt
   c. GeminiClient.generate()    → raw AI text
   d. JsonParser.extract()       → raw JSON object
   e. SchemaValidator.validate() → typed AuditData
      → if fail: retry (max 3 attempts)
   f. DomainMapper.toDomain()    → AuditReport
7. AuditRepository.save(report) → MongoDB upsert
8. Return { id } → client redirects to /audits/:id`}
            </CodeBlock>

            {/* ── 5. Frontend ──────────────────────────────────────── */}
            <SectionTitle id="frontend">5. Frontend Architecture</SectionTitle>
            <Table
              headers={['Technology', 'Version', 'Rationale']}
              rows={[
                ['Next.js', '15.x', 'App Router, Server Components, collocated API routes'],
                ['React', '19.x', 'Concurrent rendering, improved hydration'],
                ['TypeScript', '5.6', 'Strict mode, full type safety'],
                ['Tailwind CSS', '4.x', 'CSS custom properties design token system'],
                ['react-hook-form', '7.x', 'Uncontrolled forms with Zod resolver'],
                ['CVA', '0.7', 'Type-safe component variants'],
                ['lucide-react', '0.468', 'Consistent, tree-shakeable SVG icons'],
              ]}
            />
            <SubTitle>5.1 App Router Structure</SubTitle>
            <CodeBlock>
              {`src/app/
├── layout.tsx         # Root layout: Header, Footer, global metadata
├── page.tsx           # Landing page (/)
├── error.tsx          # Global error boundary
├── not-found.tsx      # 404 page
├── sitemap.ts         # Dynamic sitemap.xml generator
├── robots.ts          # robots.txt generator
├── manifest.ts        # PWA manifest generator
├── dashboard/page.tsx # Past audits list (/dashboard)
├── audits/[id]/page.tsx  # Audit detail (/audits/:id)
├── docs/page.tsx      # Documentation (/docs)
└── api/v1/            # Backend API routes`}
            </CodeBlock>
            <SubTitle>5.2 Design System</SubTitle>
            <P>
              The design system is defined entirely in{' '}
              <code className="text-xs bg-bg-secondary rounded px-1 py-0.5">
                src/styles/globals.css
              </code>{' '}
              using CSS custom properties. Tailwind v4 references these tokens via the{' '}
              <code className="text-xs bg-bg-secondary rounded px-1 py-0.5">@theme</code> directive:
            </P>
            <CodeBlock>
              {`/* Typography */
--text-primary: #0f172a;
--text-secondary: #475569;
--text-muted: #94a3b8;

/* Backgrounds */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--bg-card: #ffffff;

/* Accents */
--accent-violet: #1e40af;  /* Primary brand */
--accent-emerald: #059669; /* Success / good scores */
--accent-amber: #d97706;   /* Warning / medium scores */
--accent-rose: #e11d48;    /* Error / low scores */`}
            </CodeBlock>

            {/* ── 6. Backend ──────────────────────────────────────── */}
            <SectionTitle id="backend">6. Backend Architecture</SectionTitle>
            <P>
              CRO Engine uses Next.js 15 App Router API routes (
              <code className="text-xs bg-bg-secondary rounded px-1 py-0.5">route.ts</code> files)
              as the backend layer. This eliminates the need for a separate Express.js server,
              reducing operational complexity and enabling TypeScript sharing across client and
              server.
            </P>
            <SubTitle>6.1 Error Hierarchy</SubTitle>
            <CodeBlock>
              {`class ApiError extends Error {
  constructor(
    public code: ErrorCodes,
    public message: string,
    public statusCode: number,
    public cause?: unknown,
  ) {}
}

class ValidationError extends ApiError { /* 400 */ }
class NotFoundError   extends ApiError { /* 404 */ }
class ScrapingError   extends ApiError { /* 422 */ }
class AiAnalysisError extends ApiError { /* 503 */ }`}
            </CodeBlock>
            <SubTitle>6.2 Structured Logging</SubTitle>
            <CodeBlock>
              {`// Every log entry is structured JSON
{
  "timestamp": "2026-07-04T16:00:00.000Z",
  "level": "INFO",
  "message": "Website extraction completed",
  "meta": {
    "requestId": "req_abc123",
    "durationMs": 2847
  }
}`}
            </CodeBlock>

            {/* ── 7. AI Pipeline ───────────────────────────────────── */}
            <SectionTitle id="ai-pipeline">7. AI Pipeline Design</SectionTitle>
            <P>
              The AI analysis pipeline transforms variable, messy real-world HTML into a structured,
              typed domain model through a series of deterministic transformations.
            </P>
            <SubTitle>7.1 Self-Correction Retry Loop</SubTitle>
            <Callout type="info">
              The self-correction loop is the most critical reliability mechanism. When Gemini
              output fails Zod validation, the system retries with a prompt that includes the exact
              validation errors — giving the model precise instructions on what to fix.
            </Callout>
            <CodeBlock>
              {`for (let attempt = 1; attempt <= 3; attempt++) {
  // First attempt: standard prompt
  // Subsequent: self-correction prompt with error context
  const prompt = attempt === 1
    ? promptBuilder.build(context)
    : promptBuilder.buildCorrection(context, lastErrors);

  const rawText = await geminiClient.generate(prompt);
  const rawJson = jsonParser.extract(rawText);
  const result  = schemaValidator.validate(rawJson);

  if (result.success) {
    return domainMapper.toDomain(result.data, snapshot);
  }

  lastErrors = JSON.stringify(result.error.format());
  logger.warn('Retrying with self-correction...', { attempt });
}

throw new AiAnalysisError('Max retries exceeded');`}
            </CodeBlock>
            <SubTitle>7.2 Gemini Configuration</SubTitle>
            <Table
              headers={['Parameter', 'Value', 'Rationale']}
              rows={[
                ['temperature', '0.2', 'Low = deterministic JSON, fewer hallucinations'],
                ['maxOutputTokens', '4096', 'Enough for 8–12 detailed recommendations'],
                ['timeout', '25 seconds', 'Hard ceiling on AI response time'],
                ['model', 'gemini-1.5-flash', 'Speed/cost optimized; Pro as fallback'],
              ]}
            />

            {/* ── 8. Website Intelligence ──────────────────────────── */}
            <SectionTitle id="intelligence">8. Website Intelligence Pipeline</SectionTitle>
            <SubTitle>8.1 DOM Minification</SubTitle>
            <P>
              The DOM Minifier is the most important performance engineering decision. Raw Shopify
              HTML frequently exceeds 400–800KB. The minifier applies Cheerio-based transforms to
              reduce this to ~15% of original size:
            </P>
            <Table
              headers={['Store', 'Raw HTML', 'Minified', 'Reduction']}
              rows={[
                ['Gymshark', '487 KB', '72 KB', '85.2%'],
                ['Allbirds', '312 KB', '48 KB', '84.6%'],
                ['ColourPop', '698 KB', '104 KB', '85.1%'],
              ]}
            />
            <CodeBlock>
              {`// Phases of minification
$('script, style, noscript, svg, iframe').remove();
$('link[rel="stylesheet"]').remove();
$('[data-reactroot], #__NEXT_DATA__').remove();

// Strip data-* and on* attributes
$('*').each((_, el) => {
  Object.keys(el.attribs).forEach(attr => {
    if (attr.startsWith('on') || attr.startsWith('data-')) {
      $(el).removeAttr(attr);
    }
  });
});

// Collapse whitespace
return $.html().replace(/\\s+/g, ' ').trim();`}
            </CodeBlock>

            {/* ── 9. MongoDB ───────────────────────────────────────── */}
            <SectionTitle id="mongodb">9. MongoDB Database Design</SectionTitle>
            <SubTitle>9.1 Collection: audits</SubTitle>
            <CodeBlock>
              {`{
  id: string,           // "aud_" + nanoid(8), unique
  storeUrl: string,     // Normalized store URL
  overallScore: number, // 0–100 CRO composite score
  analyzedAt: string,   // ISO 8601 timestamp
  pageScores: {
    homepage: number,
    pdp: number,
    collection: number,
    cart: number,
  },
  recommendations: [{
    id: string,
    pageType: 'homepage' | 'pdp' | 'collection' | 'cart',
    category: 'copywriting' | 'layout' | 'cta' | 'trust'
             | 'mobile' | 'performance',
    finding: string,
    rationale: string,
    actionSteps: string[],
    impact: 'HIGH' | 'MEDIUM' | 'LOW',
    effort: 'HIGH' | 'MEDIUM' | 'LOW',
  }],
}`}
            </CodeBlock>
            <SubTitle>9.2 Indexes</SubTitle>
            <Table
              headers={['Index', 'Fields', 'Purpose']}
              rows={[
                ['ux_audits_id', '{ id: 1 } unique', 'O(1) audit lookup by ID'],
                ['ix_audits_store_url', '{ storeUrl: 1 }', 'Filter audits by store'],
                ['ix_audits_analyzed_at', '{ analyzedAt: -1 }', 'Chronological sort for dashboard'],
              ]}
            />

            {/* ── 10. API ──────────────────────────────────────────── */}
            <SectionTitle id="api">10. API Design & Contracts</SectionTitle>
            <P>
              All API responses use a consistent{' '}
              <code className="text-xs bg-bg-secondary rounded px-1 py-0.5">
                ApiResponse&lt;T&gt;
              </code>{' '}
              envelope for predictable client-side handling:
            </P>
            <CodeBlock>
              {`// Success
{ "success": true, "data": { /* T */ } }

// Error
{ "success": false, "error": {
    "code": "VALIDATION_ERROR",
    "message": "URL is required",
    "details": { /* Zod error format */ }
  }
}`}
            </CodeBlock>
            <Table
              headers={['Method', 'Endpoint', 'Description', 'Auth']}
              rows={[
                ['POST', '/api/v1/analyze', 'Submit URL for AI audit', 'None'],
                ['GET', '/api/v1/audits', 'List 10 most recent audits', 'None'],
                ['GET', '/api/v1/audits/:id', 'Get specific audit by ID', 'None'],
                ['POST', '/api/v1/extract', 'Debug: raw DOM snapshot only', 'None'],
                ['GET', '/api/v1/health', 'Health check', 'None'],
              ]}
            />

            {/* ── 11. Folder Structure ─────────────────────────────── */}
            <SectionTitle id="structure">11. Folder Structure</SectionTitle>
            <CodeBlock>
              {`src/
├── app/              # Next.js App Router (pages + API routes)
├── components/       # UI component library
│   ├── common/       # Container, PageWrapper, ErrorBoundary
│   ├── feedback/     # Alert, Badge, Progress, Skeleton, Toast
│   ├── forms/        # Input, Textarea, Form
│   ├── layout/       # Header, Footer
│   └── ui/           # Button, Card, Badge (atomic)
├── config/           # env.ts, config.ts, routes.ts
├── lib/              # analytics.ts (vendor-agnostic)
├── server/           # All server-side services (never imported by pages directly)
│   ├── ai/           # AI pipeline (client, context, mapper, parser, prompts)
│   ├── crawler/      # WebsiteFetcher
│   ├── db/           # mongodb-client.ts, audit-repository.ts
│   ├── errors/       # ApiError hierarchy
│   ├── logger/       # StructuredLogger
│   ├── normalizer/   # URL normalization + SSRF
│   ├── snapshot/     # DOM extraction orchestration
│   └── validation/   # Zod input schemas
├── styles/           # globals.css (design tokens)
└── utils/            # cn, retry, timeout, safe-json-parse, assert-never`}
            </CodeBlock>

            {/* ── 12. Prompts ──────────────────────────────────────── */}
            <SectionTitle id="prompts">12. Prompt Engineering</SectionTitle>
            <SubTitle>12.1 Versioning Strategy</SubTitle>
            <P>
              All system prompts are stored as flat markdown files under{' '}
              <code className="text-xs bg-bg-secondary rounded px-1 py-0.5">prompts/v1.0.0/</code>.
              Prompt versions follow semantic versioning — a major bump signals a breaking change to
              the output schema.
            </P>
            <SubTitle>12.2 Prompt Structure</SubTitle>
            <CodeBlock>
              {`SYSTEM PROMPT:
"You are an expert Conversion Rate Optimization specialist with 15 years
of e-commerce experience. Evaluate the storefront against:
- Hick's Law (decision fatigue)
- Social proof visibility
- CTA clarity and visual hierarchy
- Above-the-fold value proposition
- Cart abandonment friction
- Mobile-first layout
Return ONLY the JSON object conforming to: {schema}"

USER PROMPT:
"Analyze: https://gymshark.com
HEADINGS: H1: 'Built for Champions', H2: 'Shop Men's Training'...
CTAs: 'Shop Now' → /collections/mens, 'Add to Bag' → (cart)...
CONTENT SAMPLE: [2000 chars of minified body text]"`}
            </CodeBlock>

            {/* ── 13. Security ─────────────────────────────────────── */}
            <SectionTitle id="security">13. Security Architecture</SectionTitle>
            <Callout type="critical">
              SSRF (Server-Side Request Forgery) is the most critical security risk. An attacker
              could supply internal URLs like <code>http://169.254.169.254/</code> (AWS metadata) or{' '}
              <code>http://localhost:27017</code> (MongoDB) to pivot into internal infrastructure.
            </Callout>
            <SubTitle>13.1 SSRF Protection — 4-Stage Pipeline</SubTitle>
            <Table
              headers={['Stage', 'Check', 'Blocks']}
              rows={[
                [
                  '1',
                  'Blocklisted hostnames',
                  'localhost, 127.0.0.1, ::1, metadata.google.internal',
                ],
                ['2', 'Private IP ranges (post-DNS)', '10.x, 172.16–31.x, 192.168.x, fc00:, fe80:'],
                ['3', 'Protocol enforcement', 'Only https: accepted'],
                ['4', 'URL parsing hardening', 'Malformed URLs that throw TypeError'],
              ]}
            />
            <SubTitle>13.2 Security Headers</SubTitle>
            <CodeBlock>
              {`'X-Frame-Options': 'DENY'
'X-Content-Type-Options': 'nosniff'
'Referrer-Policy': 'strict-origin-when-cross-origin'
'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'`}
            </CodeBlock>

            {/* ── 14. Performance ──────────────────────────────────── */}
            <SectionTitle id="performance">14. Performance Architecture</SectionTitle>
            <SubTitle>14.1 Token Cost Optimization (AI)</SubTitle>
            <P>
              The DOM Minifier is the primary cost lever. Gemini Flash is priced per input token:
            </P>
            <Table
              headers={['Scenario', '100 req/day', 'Cost/day']}
              rows={[
                ['Without minification', '48.7 MB HTML tokens', '~$9.74'],
                ['With minification (85% reduction)', '7.2 MB HTML tokens', '~$1.44'],
              ]}
            />
            <SubTitle>14.2 Rendering Strategies per Page</SubTitle>
            <Table
              headers={['Page', 'Strategy', 'Rationale']}
              rows={[
                ['/ (landing)', 'Static', 'No dynamic data; CDN cached'],
                ['/dashboard', 'Client-side fetch', 'Data changes frequently'],
                ['/audits/[id]', 'Client-side fetch', 'Personalized audit data'],
                ['/docs', 'Static', 'Markdown content; fully cacheable'],
              ]}
            />

            {/* ── 15. Testing ──────────────────────────────────────── */}
            <SectionTitle id="testing">15. Testing Strategy</SectionTitle>
            <Callout type="info">
              Core principle: "Test the contract, not the implementation." Each test verifies
              behavior from the outside, making tests robust to internal refactoring.
            </Callout>
            <Table
              headers={['Test Suite', 'Cases', 'Coverage']}
              rows={[
                ['url-normalizer.test.ts', '6', 'HTTPS enforcement, SSRF blocking'],
                ['schemas.test.ts', '8', 'Zod validation schemas'],
                ['snapshot-validator.test.ts', '2', 'Minimum content thresholds'],
                ['context-builder.test.ts', '1', 'Prompt context formatting'],
                ['prompt-builder.test.ts', '1', 'Template rendering'],
                ['domain-mapper.test.ts', '2', 'AI output → AuditReport mapping'],
                ['json-parser.test.ts', '5', 'Fence stripping, trailing commas'],
                ['app-error.test.ts', '4', 'Error class hierarchy'],
                ['audit-repository.test.ts', '4', 'save, findById, findRecent'],
                ['analysis-orchestrator.test.ts', '5', 'Retry loop, error bubbling'],
                ['extract-route.test.ts', '2', 'API route integration'],
                ['analyze-route.test.ts', '2', 'API route integration'],
                ['Total', '42', '100% pass rate'],
              ]}
            />

            {/* ── 16. Deployment ───────────────────────────────────── */}
            <SectionTitle id="deployment">16. Deployment Architecture</SectionTitle>
            <Table
              headers={['Layer', 'Service', 'Config']}
              rows={[
                ['Hosting', 'Vercel', 'Next.js first-party — zero config'],
                ['Database', 'MongoDB Atlas M0', '512MB free tier'],
                ['AI', 'Google AI Studio', 'Gemini 1.5 Flash API'],
                ['CDN', 'Vercel Edge Network', 'Automatic via Vercel deployment'],
                ['CI/CD', 'GitHub Actions', 'Lint → typecheck → test on every push'],
              ]}
            />
            <SubTitle>16.1 CI Pipeline</SubTitle>
            <CodeBlock>
              {`# .github/workflows/ci.yml
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - npm ci
      - npm run lint          # ESLint
      - npm run check-types   # tsc --noEmit (strict)
      - npm run test          # vitest run
# All three must pass — PR merge blocked otherwise`}
            </CodeBlock>

            {/* ── 17. Trade-offs ───────────────────────────────────── */}
            <SectionTitle id="tradeoffs">17. Engineering Trade-offs</SectionTitle>
            <SubTitle>Cheerio vs Puppeteer</SubTitle>
            <Table
              headers={['Aspect', 'Cheerio ✅', 'Puppeteer ❌']}
              rows={[
                ['Speed', '<1 second', '5–15 seconds (browser startup)'],
                ['Memory', '~50 MB', '~300 MB per instance'],
                ['JS execution', 'No', 'Yes'],
                ['Shopify SSR content', 'Available', 'Available'],
                ['Cost (serverless)', 'Low', 'High (memory/time billing)'],
              ]}
            />
            <SubTitle>Gemini vs GPT-4o</SubTitle>
            <Table
              headers={['Aspect', 'Gemini 1.5 Flash ✅', 'GPT-4o']}
              rows={[
                ['Cost', 'Lower', 'Higher'],
                ['Context window', '1M tokens', '128K tokens'],
                ['Free tier', 'Generous', 'Limited'],
                ['JSON reliability', 'Good (with Zod retry)', 'Good (with function calling)'],
              ]}
            />
            <SubTitle>MongoDB vs PostgreSQL</SubTitle>
            <Table
              headers={['Aspect', 'MongoDB ✅', 'PostgreSQL']}
              rows={[
                ['Schema flexibility', 'No migrations needed', 'Schema changes require migrations'],
                ['Nested arrays', 'Native document model', 'Requires JSONB or JOIN table'],
                ['Type safety (TS)', 'Good via typed generics', 'Excellent via Prisma'],
              ]}
            />

            {/* ── 18. Future Work ──────────────────────────────────── */}
            <SectionTitle id="future">18. Future Work & Roadmap</SectionTitle>
            <Table
              headers={['Feature', 'Priority', 'Description']}
              rows={[
                ['User Authentication', 'P1', 'Clerk/NextAuth — multi-tenant audit history'],
                ['PDF Report Export', 'P2', 'Professionally formatted PDF download'],
                ['Scheduled Audits', 'P2', 'Weekly automated re-analysis per store'],
                ['Recommendation Tracking', 'P1', 'Mark implemented, track score delta'],
                ['Competitor Comparison', 'P3', 'Side-by-side audit of two stores'],
                [
                  'Puppeteer Fallback',
                  'P2',
                  'Render JS-heavy SPA stores when Cheerio misses content',
                ],
                ['Redis Caching', 'P2', 'Cache identical URL analyses for 24h'],
                ['Shopify App Integration', 'P3', 'Native Shopify App Store listing with OAuth'],
                [
                  'Fine-tuned Model',
                  'P3',
                  'Improve schema reliability with domain-specific training',
                ],
              ]}
            />
            <SubTitle>Open Architecture Questions</SubTitle>
            <P>
              <strong>1. Multi-page crawling:</strong> Should we crawl 3–5 pages (homepage + PDP +
              collection + cart) simultaneously rather than just the homepage for deeper coverage?
            </P>
            <P>
              <strong>2. Vector embeddings:</strong> Could we embed past recommendations and
              semantically search them to provide "similar findings" context — improving AI quality
              without increasing prompt length?
            </P>
            <P>
              <strong>3. Fine-tuning:</strong> Could a fine-tuned model on historical CRO audit data
              outperform prompt-based Gemini on structured output reliability and domain-specific
              recommendation quality?
            </P>

            <div className="mt-16 pt-8 border-t border-border-muted text-center">
              <p className="text-xs text-text-muted">
                CRO Engine Engineering Documentation · Version 1.0.0 · Sprint 7 · July 2026
              </p>
              <p className="text-xs text-text-muted mt-1">
                This document is maintained alongside the codebase. Update when architecture
                decisions change.
              </p>
            </div>
          </main>
        </div>
      </Container>
    </div>
  );
}
