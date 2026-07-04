'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Laptop,
  ArrowRight,
  Dumbbell,
  Loader2,
  Check,
  Clock,
  Search,
  Brain,
  FileText,
  ChevronRight,
  Target,
  BarChart3,
  Smartphone,
  Layout,
} from 'lucide-react';

import { urlSchema } from '@/server/validation/schemas';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { routes } from '@/config/routes';
import { logger } from '@/server/logger/structured-logger';

const formSchema = z.object({ url: urlSchema });
type FormValues = z.infer<typeof formSchema>;

// Intelligent step-by-step loading phases (8 steps requested)
const LOADING_PHASES = [
  { id: 'connect', icon: Laptop, text: 'Connecting to Store...' },
  { id: 'download', icon: Search, text: 'Downloading HTML...' },
  { id: 'detect', icon: Layout, text: 'Detecting Layout...' },
  { id: 'extract', icon: Target, text: 'Extracting Products...' },
  { id: 'context', icon: Brain, text: 'Building AI Context...' },
  { id: 'gemini', icon: Sparkles, text: 'Running Gemini Analysis...' },
  { id: 'validate', icon: ShieldCheck, text: 'Validating Response...' },
  { id: 'report', icon: FileText, text: 'Generating CRO Report...' },
];

// Example stores — real brands communicate confidence
const EXAMPLE_STORES = [
  {
    url: 'https://gymshark.com',
    name: 'Gymshark',
    logo: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="4" fill="#000" />
        <path
          d="M8 22 L16 10 L24 22"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    url: 'https://allbirds.com',
    name: 'Allbirds',
    logo: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#6B8F5E" />
        <path
          d="M10 20 Q16 10 22 20"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="16" cy="14" r="2" fill="white" />
      </svg>
    ),
  },
  {
    url: 'https://colourpop.com',
    name: 'ColourPop',
    logo: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#C850C0" />
        <circle cx="11" cy="13" r="3" fill="white" />
        <circle cx="21" cy="13" r="3" fill="white" />
        <path
          d="M11 20 Q16 24 21 20"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set());
  const [currentPhase, setCurrentPhase] = useState(-1);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: '' },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('url');
      if (urlParam) {
        setValue('url', urlParam, { shouldValidate: true });
      }
    }
  }, [setValue]);

  // Intelligent loading — tick through phases with realistic timing
  const runLoadingSequence = async (auditId: string) => {
    setIsSubmitting(true);
    setApiError(null);
    setCompletedPhases(new Set());
    setCurrentPhase(0);

    for (let i = 0; i < LOADING_PHASES.length; i++) {
      setCurrentPhase(i);
      await new Promise((r) => setTimeout(r, i < 3 ? 700 : 900));
      setCompletedPhases((prev) => new Set([...prev, i]));
    }

    await new Promise((r) => setTimeout(r, 300));
    router.push(routes.web.audits(auditId));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setApiError(null);
      setIsButtonLoading(true); // Immediate button feedback before API response
      const response = await fetch(routes.api.analyze, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: data.url }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || 'Failed to initialize store audit.');
      }

      await runLoadingSequence(resData.data.id);
    } catch (err: any) {
      logger.error('Error during landing audit submit:', err);
      setApiError(err.message || 'An error occurred.');
      setIsSubmitting(false);
      setIsButtonLoading(false);
      setCurrentPhase(-1);
      setCompletedPhases(new Set());
    }
  };

  const handleExampleClick = (url: string) => {
    setValue('url', url, { shouldValidate: true });
  };

  // ─── Intelligent Loading Screen ─────────────────────────────────────────────
  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-text-primary">
              Analyzing Storefront
            </h2>
            <p className="text-sm text-text-secondary">Running conversion heuristics...</p>
          </div>

          <div className="space-y-3">
            {LOADING_PHASES.map((phase, index) => {
              const isDone = completedPhases.has(index);
              const isCurrent = currentPhase === index && !isDone;
              const Icon = phase.icon;

              return (
                <div
                  key={phase.id}
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    index > currentPhase ? 'opacity-30' : 'opacity-100'
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isDone
                        ? 'border-accent-emerald bg-accent-emerald/10 text-accent-emerald'
                        : isCurrent
                          ? 'border-accent-violet bg-accent-violet/10 text-accent-violet'
                          : 'border-border-muted text-text-muted'
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : isCurrent ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span
                    className={`text-sm transition-colors duration-200 ${
                      isDone
                        ? 'text-accent-emerald font-medium'
                        : isCurrent
                          ? 'text-text-primary font-medium'
                          : 'text-text-muted'
                    }`}
                  >
                    {phase.text}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="h-px bg-border-muted" />
          <p className="text-xs text-text-muted text-center">This usually takes 10–20 seconds</p>
        </div>
      </div>
    );
  }

  // ─── Landing Page ────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* ── Hero ── */}
      <section
        id="hero"
        className="relative overflow-hidden border-b border-border-muted/30 pt-8 pb-16 md:pt-10 md:pb-20 bg-gradient-to-b from-bg-primary via-bg-primary to-bg-secondary/40"
      >
        {/* Soft corner blobs */}
        <div className="absolute top-[-15%] left-[-8%] w-[300px] h-[300px] bg-sky-400/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-8%] w-[300px] h-[300px] bg-blue-400/25 rounded-full blur-3xl animate-pulse pointer-events-none" />

        <Container className="relative z-10">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-3">
            {/* Logo + Heading tightly grouped */}
            <div className="flex flex-col items-center gap-2">
              <Image
                src="/assets/cro-ico-logo.png"
                alt="CRO Engine"
                width={80}
                height={80}
                className="h-12 sm:h-20 w-auto object-contain"
                style={{ mixBlendMode: 'multiply' }}
                priority
              />
              <h1 className="text-2xl sm:text-3xl md:text-[2.75rem] font-bold tracking-tight leading-[1.2] text-text-primary">
                Find Conversion Bottlenecks
                <br />
                <span className="text-accent-violet">Before Your Customers Do.</span>
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-xs sm:text-sm md:text-base text-text-secondary leading-relaxed max-w-xl mx-auto pt-1">
              Analyze any Shopify storefront using AI and receive prioritized conversion
              recommendations in seconds.
            </p>
          </div>

          {/* ── URL Form ── */}
          <div className="max-w-2xl mx-auto mt-8">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center w-full"
            >
              <div className="flex-1">
                <input
                  id="url"
                  type="text"
                  placeholder="https://your-store.com"
                  disabled={isSubmitting}
                  className="w-full h-10 sm:h-12 rounded-md border border-border-muted bg-bg-secondary px-3.5 sm:px-4 text-xs sm:text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:border-accent-violet focus:outline-none focus:ring-1 focus:ring-accent-violet disabled:opacity-60"
                  {...register('url')}
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || isButtonLoading}
                className="h-10 sm:h-12 px-5 sm:px-6 shrink-0 inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-all duration-150 w-full sm:w-auto"
                variant="primary"
              >
                {isButtonLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Store</span>
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Validation errors */}
            {errors.url && (
              <div className="rounded-md border border-accent-rose/25 bg-rose-50/60 p-3 text-left text-xs text-rose-800 flex items-start gap-2.5 mt-3 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-accent-rose mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Invalid Store URL</span>
                  <span className="text-rose-700/90 leading-relaxed">{errors.url.message}</span>
                </div>
              </div>
            )}
            {apiError && (
              <div className="rounded-md border border-accent-rose/25 bg-rose-50/60 p-3 text-left text-xs text-rose-800 flex items-start gap-2.5 mt-3 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-accent-rose mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Analysis Failed</span>
                  <span className="text-rose-700/90 leading-relaxed">{apiError}</span>
                </div>
              </div>
            )}

            {/* ── Try Examples ── */}
            <div className="mt-5 text-center">
              <span className="text-xs font-semibold text-text-muted select-none">
                Try Examples
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                {EXAMPLE_STORES.map((store) => (
                  <button
                    key={store.url}
                    type="button"
                    disabled={isSubmitting || isButtonLoading}
                    onClick={() => handleExampleClick(store.url)}
                    className="inline-flex items-center gap-2 rounded-md border border-border-muted bg-white px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:border-accent-violet transition-colors duration-150 cursor-pointer disabled:opacity-50"
                  >
                    {store.logo}
                    <span>{store.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="pt-14 pb-16 md:pt-16 md:pb-20 border-b border-border-muted/30 bg-bg-primary"
      >
        <Container className="space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">How It Works</h2>
            <p className="text-sm text-text-secondary">
              Three steps from URL to actionable CRO intelligence.
            </p>
          </div>

          {/* Cards with flow arrows */}
          <div className="flex flex-col md:flex-row items-stretch gap-0 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="flex-1 rounded-lg border border-border-muted p-6 glassmorphic-card">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-violet/10 text-accent-violet">
                <Laptop className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-semibold mt-4 text-text-primary">1. Scan</h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                We extract CTAs, headings, product layout, and copy from public storefront pages —
                no installation needed.
              </p>
            </div>

            {/* Arrow → */}
            <div className="hidden md:flex items-center justify-center px-2 text-border-muted flex-shrink-0">
              <ChevronRight className="h-5 w-5 text-text-muted" />
            </div>
            <div className="flex md:hidden items-center justify-center py-2 text-text-muted">
              <span className="text-sm">↓</span>
            </div>

            {/* Step 2 */}
            <div className="flex-1 rounded-lg border border-border-muted p-6 glassmorphic-card">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-violet/10 text-accent-violet">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-semibold mt-4 text-text-primary">2. Analyze</h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Gemini AI maps layouts against e-commerce psychology heuristics to pinpoint exactly
                where buyers drop off.
              </p>
            </div>

            {/* Arrow → */}
            <div className="hidden md:flex items-center justify-center px-2 flex-shrink-0">
              <ChevronRight className="h-5 w-5 text-text-muted" />
            </div>
            <div className="flex md:hidden items-center justify-center py-2 text-text-muted">
              <span className="text-sm">↓</span>
            </div>

            {/* Step 3 */}
            <div className="flex-1 rounded-lg border border-border-muted p-6 glassmorphic-card">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-violet/10 text-accent-violet">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-semibold mt-4 text-text-primary">3. Recommendations</h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Receive prioritized, developer-ready tasks ranked by impact and implementation
                effort.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Capabilities ── */}
      <section className="py-14 md:py-18 bg-bg-primary/50">
        <Container className="space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Engine Capabilities</h2>
            <p className="text-sm text-text-secondary">
              Every audit covers the full Shopify customer journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                icon: <TrendingUp className="h-5 w-5 text-accent-violet" />,
                title: 'Improve Conversion',
                desc: 'Pinpoint missing value propositions and CTAs directly affecting purchase rates.',
              },
              {
                icon: <ShieldCheck className="h-5 w-5 text-accent-violet" />,
                title: 'Increase Trust',
                desc: 'Analyze cart configurations to surface missing trust signals and policy clearances.',
              },
              {
                icon: <Smartphone className="h-5 w-5 text-accent-violet" />,
                title: 'Mobile UX',
                desc: 'Identify CTA sizing and tap-target issues limiting mobile conversions.',
              },
              {
                icon: <Zap className="h-5 w-5 text-accent-violet" />,
                title: 'Copy Quality',
                desc: 'Evaluate whether headlines communicate outcomes or just describe products.',
              },
              {
                icon: <BarChart3 className="h-5 w-5 text-accent-violet" />,
                title: 'Page Scoring',
                desc: 'Each page type — homepage, PDP, collection, cart — gets an individual CRO score.',
              },
              {
                icon: <CheckCircle2 className="h-5 w-5 text-accent-violet" />,
                title: 'Dev-Ready Tasks',
                desc: 'Each recommendation comes with actionable steps ready for engineering execution.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="glassmorphic-card rounded-lg border border-border-muted p-5 space-y-2 flex flex-col"
              >
                {icon}
                <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
                <p className="text-xs text-text-secondary leading-relaxed flex-1">{desc}</p>
                <span className="inline-flex items-center gap-1 text-xs text-accent-violet font-medium pt-1 hover:underline cursor-pointer">
                  Learn More <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
