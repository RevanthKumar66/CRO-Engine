'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Copy,
  Eye,
  Layout,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  RefreshCw,
  ExternalLink,
  ClipboardList,
  BarChart2,
  Lightbulb,
  Check,
  Square,
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { Container } from '@/components/common/Container';
import { PageWrapper } from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/feedback/Badge';
import { Loading } from '@/components/common/Loading';
import { routes } from '@/config/routes';
import { AuditReport, Recommendation } from '../../../../types';

const BrandIcon: React.FC<{
  logoUrl?: string;
  faviconUrl?: string;
  storeName: string;
}> = ({ logoUrl, faviconUrl, storeName }) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const [favFailed, setFavFailed] = useState(false);

  if (logoUrl && !logoFailed) {
    return (
      <img
        src={logoUrl}
        alt={`${storeName} logo`}
        onError={() => setLogoFailed(true)}
        className="h-8 w-auto max-w-[150px] object-contain"
        style={{ mixBlendMode: 'multiply' }}
        loading="lazy"
      />
    );
  }

  if (faviconUrl && !favFailed) {
    return (
      <img
        src={faviconUrl}
        alt={`${storeName} favicon`}
        onError={() => setFavFailed(true)}
        className="h-5 w-5 object-contain"
        loading="lazy"
      />
    );
  }

  return null;
};

// Score helpers
const getScoreLabel = (score: number) => {
  if (score >= 80) return { label: 'Good Performance', color: 'text-accent-emerald' };
  if (score >= 50) return { label: 'Needs Improvement', color: 'text-accent-amber' };
  return { label: 'Needs Attention', color: 'text-accent-rose' };
};

const getScoreRingColor = (score: number) => {
  if (score >= 80) return 'border-accent-emerald text-accent-emerald';
  if (score >= 50) return 'border-accent-amber text-accent-amber';
  return 'border-accent-rose text-accent-rose';
};

const getScoreStars = (score: number) => {
  const stars = Math.round((score / 100) * 5);
  return Array.from({ length: 5 }, (_, i) => i < stars);
};

const getPageTrend = (score: number) => {
  if (score >= 80)
    return {
      icon: <TrendingUp className="h-3 w-3" />,
      label: 'Strong',
      color: 'text-accent-emerald',
    };
  if (score >= 50)
    return { icon: <Minus className="h-3 w-3" />, label: 'Average', color: 'text-accent-amber' };
  return {
    icon: <TrendingDown className="h-3 w-3" />,
    label: 'Needs Work',
    color: 'text-accent-rose',
  };
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'copywriting':
      return <Copy className="h-3.5 w-3.5" />;
    case 'cta':
      return <ShoppingCart className="h-3.5 w-3.5" />;
    case 'layout':
      return <Layout className="h-3.5 w-3.5" />;
    default:
      return <Eye className="h-3.5 w-3.5" />;
  }
};

// Sticky Tab IDs
const TABS = [
  { id: 'overview', label: 'Overview', icon: <BarChart2 className="h-3.5 w-3.5" /> },
  { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb className="h-3.5 w-3.5" /> },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AuditDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [completedRecs, setCompletedRecs] = useState<Record<string, boolean>>({});
  const [filterPageType, setFilterPageType] = useState<string>('all');
  const [filterImpact, setFilterImpact] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const recsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const id = params?.id;
        if (!id) return;
        const response = await fetch(`/api/v1/audits/${id}`);
        const resData = await response.json();
        if (!response.ok || !resData.success) {
          throw new Error(resData.error?.message || 'Failed to retrieve audit report.');
        }
        setAudit(resData.data);
      } catch (err: any) {
        setError(err.message || 'An error occurred fetching the audit.');
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, [params?.id]);

  const toggleChecklist = (id: string) => {
    setCompletedRecs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyReport = () => {
    if (!audit) return;
    const text = `CRO Audit Report\nStore: ${audit.storeUrl}\nScore: ${audit.overallScore}/100\nAnalyzed: ${new Date(audit.analyzedAt).toLocaleString()}\n\n${audit.recommendations.map((r, i) => `${i + 1}. [${r.impact}] ${r.finding}\n   ${r.rationale}\n   Steps: ${r.actionSteps.join('; ')}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToRecs = () => {
    setActiveTab('recommendations');
    recsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) return <Loading message="Loading conversion audit..." />;

  if (error || !audit) {
    return (
      <Container>
        <PageWrapper className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center space-y-6">
          <AlertCircle className="h-14 w-14 text-accent-rose" />
          <h2 className="text-xl font-bold text-text-primary">Audit Not Found</h2>
          <p className="max-w-md text-sm text-text-secondary">
            {error || 'The audit report you requested does not exist or has expired.'}
          </p>
          <Button onClick={() => router.push(routes.web.home)} variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Start New Audit
          </Button>
        </PageWrapper>
      </Container>
    );
  }

  const filteredRecommendations = audit.recommendations.filter((rec) => {
    const matchesPage = filterPageType === 'all' || rec.pageType === filterPageType;
    const matchesImpact = filterImpact === 'all' || rec.impact === filterImpact;
    return matchesPage && matchesImpact;
  });

  const completedCount = Object.values(completedRecs).filter(Boolean).length;
  const totalRecs = audit.recommendations.length;
  const scoreInfo = getScoreLabel(audit.overallScore);
  const stars = getScoreStars(audit.overallScore);

  return (
    <div className="w-full">
      {/* ── Page Header ── */}
      <div className="border-b border-border-muted/30 bg-bg-primary">
        <Container>
          <div className="flex items-center justify-between py-4">
            <Button variant="ghost" onClick={() => router.push(routes.web.home)} size="sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" />{' '}
              <span className="hidden sm:inline">New Audit</span>
            </Button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyReport}
                className="inline-flex items-center justify-center h-8 w-8 sm:w-auto sm:gap-1.5 rounded-md border border-border-muted sm:px-3 text-xs font-medium text-text-secondary transition-colors duration-150 hover:border-accent-violet hover:text-accent-violet"
                title="Copy Report"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-accent-emerald" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Report'}</span>
              </button>
              <button
                onClick={() => router.push(routes.web.home)}
                className="inline-flex items-center justify-center h-8 w-8 sm:w-auto sm:gap-1.5 rounded-md border border-border-muted sm:px-3 text-xs font-medium text-text-secondary transition-colors duration-150 hover:border-accent-violet hover:text-accent-violet"
                title="Analyze Another"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Analyze Another</span>
              </button>
              <a
                href={audit.storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-8 w-8 sm:w-auto sm:gap-1.5 rounded-md border border-border-muted sm:px-3 text-xs font-medium text-text-secondary transition-colors duration-150 hover:border-accent-violet hover:text-accent-violet"
                title="View Store"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">View Store</span>
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Sticky Tab Bar ── */}
      <div className="sticky top-14 z-30 border-b border-border-muted bg-bg-primary/90 backdrop-blur-md">
        <Container>
          <div className="flex items-center gap-1 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'recommendations') scrollToRecs();
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-150',
                  activeTab === tab.id
                    ? 'border-accent-violet text-accent-violet'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </Container>
      </div>

      <Container>
        <PageWrapper className="space-y-8">
          {/* ── Branded Report Header ── */}
          <Card className="glassmorphic-card p-4 sm:p-5 rounded-md border-border-muted/50 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <BrandIcon
                logoUrl={audit.logoUrl}
                faviconUrl={audit.faviconUrl}
                storeName={audit.storeName || audit.storeUrl}
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-text-primary leading-tight">
                    {audit.storeName || audit.storeUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </h1>
                  {audit.platform === 'shopify' ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent-violet/10 text-accent-violet border border-accent-violet/20 uppercase tracking-wider">
                      Shopify
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary flex-wrap">
                  <span>
                    {audit.domain ||
                      audit.storeUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                  </span>
                  <span className="text-border-muted">•</span>
                  <span>
                    Analyzed:{' '}
                    {new Date(audit.analyzedAt || audit.createdAt || '').toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {audit.analysisTime ? (
                    <>
                      <span className="text-border-muted">•</span>
                      <span>Duration: {audit.analysisTime}s</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right side stats */}
            <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
              <div className="text-right">
                <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider block">
                  Status
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-emerald mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                </span>
              </div>
              <div className="border-l border-border-muted/50 h-8 hidden md:block" />
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider block">
                    Overall Score
                  </span>
                  <span className={cn('text-xs font-bold block mt-0.5', scoreInfo.color)}>
                    {scoreInfo.label}
                  </span>
                </div>
                <div
                  className={cn(
                    'flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 text-xs sm:text-base font-extrabold shrink-0',
                    getScoreRingColor(audit.overallScore)
                  )}
                >
                  {audit.overallScore}
                </div>
              </div>
            </div>
          </Card>

          {/* ── Overview Section ── */}
          <div id="overview" className="grid md:grid-cols-3 gap-5">
            {/* Store + page scores */}
            <Card className="glassmorphic-card md:col-span-2">
              <CardHeader className="pb-4">
                <span className="text-xs text-accent-violet font-semibold uppercase tracking-wider">
                  Storefront Audit
                </span>
                <CardTitle className="text-xl mt-1 break-all leading-snug">
                  {audit.storeUrl}
                </CardTitle>
                <CardDescription className="text-xs">
                  Analyzed on{' '}
                  {new Date(audit.analyzedAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-3 border-t border-border-muted/30 pt-4">
                {Object.entries(audit.pageScores).map(([page, score]) => {
                  const trend = getPageTrend(score);
                  return (
                    <div
                      key={page}
                      className="rounded-md border border-border-muted p-3 text-center space-y-1"
                    >
                      <span className="text-xs text-text-secondary font-medium capitalize block">
                        {page === 'pdp' ? 'PDP' : page}
                      </span>
                      <div
                        className={`text-xl font-bold ${score >= 80 ? 'text-accent-emerald' : score >= 50 ? 'text-accent-amber' : 'text-accent-rose'}`}
                      >
                        {score}
                      </div>
                      <div
                        className={`inline-flex items-center gap-0.5 text-xs font-medium ${trend.color}`}
                      >
                        {trend.icon}
                        <span>{trend.label}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Overall score card */}
            <Card className="glassmorphic-card flex flex-col items-center justify-center p-6 text-center gap-3">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Overall Score
              </span>
              <div
                className={cn(
                  'flex h-24 w-24 items-center justify-center rounded-full border-4 text-3xl font-extrabold',
                  getScoreRingColor(audit.overallScore)
                )}
              >
                {audit.overallScore}
              </div>
              {/* Star rating */}
              <div className="flex items-center gap-0.5">
                {stars.map((filled, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      filled ? 'fill-accent-amber text-accent-amber' : 'text-border-muted'
                    )}
                  />
                ))}
              </div>
              <span className={cn('text-xs font-semibold', scoreInfo.color)}>
                {scoreInfo.label}
              </span>
              {/* Progress to recommendations CTA */}
              {totalRecs > 0 && (
                <button
                  onClick={scrollToRecs}
                  className="text-xs text-accent-violet hover:underline font-medium mt-1"
                >
                  {completedCount}/{totalRecs} completed
                </button>
              )}
            </Card>
          </div>

          {/* ── Recommendations Section ── */}
          <div id="recommendations" ref={recsRef} className="space-y-5">
            {/* Section header with filters and progress */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border-muted/30 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold tracking-tight">Optimization Opportunities</h3>
                {totalRecs > 0 && (
                  <p className="text-xs text-text-muted">
                    Completed{' '}
                    <span className="font-semibold text-text-secondary">
                      {completedCount} / {totalRecs}
                    </span>{' '}
                    recommendations
                  </p>
                )}
              </div>

              <div className="w-full sm:w-auto flex flex-row gap-2">
                <select
                  value={filterPageType}
                  onChange={(e) => setFilterPageType(e.target.value)}
                  className="flex-1 sm:flex-initial rounded-md border border-border-muted bg-bg-secondary px-3 py-1.5 text-xs text-text-primary focus:border-accent-violet focus:outline-none transition-colors duration-150"
                >
                  <option value="all">All Pages</option>
                  <option value="homepage">Homepage</option>
                  <option value="pdp">Product Detail (PDP)</option>
                  <option value="collection">Collection</option>
                  <option value="cart">Cart</option>
                </select>
                <select
                  value={filterImpact}
                  onChange={(e) => setFilterImpact(e.target.value)}
                  className="flex-1 sm:flex-initial rounded-md border border-border-muted bg-bg-secondary px-3 py-1.5 text-xs text-text-primary focus:border-accent-violet focus:outline-none transition-colors duration-150"
                >
                  <option value="all">All Impact</option>
                  <option value="HIGH">High Impact</option>
                  <option value="MEDIUM">Medium Impact</option>
                  <option value="LOW">Low Impact</option>
                </select>
              </div>
            </div>

            {/* Cards */}
            {filteredRecommendations.length === 0 ? (
              <div className="glassmorphic-card rounded-lg border border-dashed border-border-muted p-12 text-center">
                <p className="text-sm text-text-secondary">
                  No recommendations match your active filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecommendations.map((rec) => {
                  const isCompleted = !!completedRecs[rec.id];
                  return (
                    <div
                      key={rec.id}
                      className={cn(
                        'glassmorphic-card rounded-lg border-l-2 transition-all duration-150',
                        isCompleted
                          ? 'opacity-60 border-l-accent-emerald'
                          : 'border-l-accent-violet'
                      )}
                    >
                      {/* Card Header — badges + mark complete top-right */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-border-muted/30">
                        <div className="flex items-center gap-2">
                          <span className="text-accent-violet">
                            {getCategoryIcon(rec.category)}
                          </span>
                          <span className="text-sm font-semibold capitalize text-text-primary">
                            {rec.pageType} — {rec.category}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <Badge variant={rec.impact === 'HIGH' ? 'destructive' : 'warning'}>
                            {rec.impact} Impact
                          </Badge>
                          <Badge variant="default">{rec.effort} Effort</Badge>
                          {/* Mark complete — top-right of header */}
                          <button
                            onClick={() => toggleChecklist(rec.id)}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors duration-150',
                              isCompleted
                                ? 'border-accent-emerald/30 bg-accent-emerald/5 text-accent-emerald'
                                : 'border-border-muted text-text-secondary hover:border-accent-violet hover:text-accent-violet'
                            )}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" /> Done
                              </>
                            ) : (
                              <>
                                <Square className="h-3.5 w-3.5" /> Complete
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Card Body — spacing instead of dividers */}
                      <div className="px-5 py-5 space-y-5">
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1.5">
                            Finding
                          </h4>
                          <p className="text-sm text-text-primary leading-relaxed">{rec.finding}</p>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1.5">
                            Rationale
                          </h4>
                          <p className="text-sm text-text-secondary leading-relaxed">
                            {rec.rationale}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">
                            Developer Tasks
                          </h4>
                          <ul className="space-y-2">
                            {rec.actionSteps.map((step, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2.5 text-sm text-text-secondary"
                              >
                                {/* Interactive checkbox feel */}
                                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border-muted bg-bg-secondary">
                                  <span className="h-1.5 w-1.5 rounded-sm bg-accent-violet" />
                                </span>
                                <span className="leading-relaxed">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </PageWrapper>
      </Container>
    </div>
  );
}
