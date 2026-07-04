'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  AlertCircle,
  Plus,
  RefreshCw,
  LayoutDashboard,
  Calendar,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlayCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { Container } from '@/components/common/Container';
import { PageWrapper } from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { routes } from '@/config/routes';
import type { AuditReport } from '../../../types/index.d';

// BrandIcon displays the logo/favicon or falls back cleanly to text-only
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
        className="h-6 w-auto max-w-[120px] object-contain"
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
        className="h-4 w-4 object-contain"
        loading="lazy"
      />
    );
  }

  return null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [audits, setAudits] = useState<AuditReport[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    running: 0,
    failed: 0,
    averageScore: 0,
    highestScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & search states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // Reset to page 1 on search change
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset to page 1 on filter or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sortBy]);

  const fetchAudits = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (debouncedQuery) params.append('search', debouncedQuery);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (sortBy) params.append('sort', sortBy);
      params.append('page', currentPage.toString());
      params.append('limit', '10');

      const response = await fetch(`${routes.api.audits}?${params.toString()}`);
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || 'Failed to fetch audits.');
      }

      setAudits(resData.data.audits || []);
      setPagination(resData.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
      setStats(
        resData.data.stats || {
          total: 0,
          completed: 0,
          running: 0,
          failed: 0,
          averageScore: 0,
          highestScore: 0,
        }
      );
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading audits.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, statusFilter, sortBy, currentPage]);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent-emerald bg-accent-emerald/5 border-accent-emerald/20';
    if (score >= 50) return 'text-accent-amber bg-accent-amber/5 border-accent-amber/20';
    return 'text-accent-rose bg-accent-rose/5 border-accent-rose/20';
  };

  const getStatusBadge = (status?: string) => {
    const s = status || 'completed';
    switch (s) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent-violet/10 text-accent-violet border border-accent-violet/20">
            <RefreshCw className="h-3 w-3 animate-spin" /> Running
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent-rose/10 text-accent-rose border border-accent-rose/20">
            <XCircle className="h-3 w-3" /> Failed
          </span>
        );
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-text-secondary border border-border-muted">
            <PlayCircle className="h-3 w-3" /> Queued
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      <PageWrapper className="space-y-6 select-none py-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-muted/30 pb-5">
          <div className="space-y-0.5">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <LayoutDashboard className="h-4.5 w-4.5 text-accent-violet" />
              Audit History
            </h1>
            <p className="text-[11px] sm:text-xs text-text-secondary">
              Review and manage conversion optimization reports for analyzed storefronts.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={fetchAudits}
              size="sm"
              className="h-8 w-full sm:w-auto justify-center"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push(routes.web.home)}
              size="sm"
              className="h-8 w-full sm:w-auto justify-center"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Audit
            </Button>
          </div>
        </div>

        {/* Top Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
          <Card className="glassmorphic-card p-3 sm:p-4 rounded-md border-border-muted/60">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Total Audits
              </span>
              <Activity className="h-3.5 w-3.5 text-text-muted" />
            </div>
            <p className="text-base sm:text-lg font-bold text-text-primary mt-1">{stats.total}</p>
          </Card>
          <Card className="glassmorphic-card p-3 sm:p-4 rounded-md border-border-muted/60">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Average Score
              </span>
              <TrendingUp className="h-3.5 w-3.5 text-accent-violet" />
            </div>
            <p className="text-base sm:text-lg font-bold text-text-primary mt-1">
              {stats.averageScore} <span className="text-[10px] text-text-muted">/100</span>
            </p>
          </Card>
          <Card className="glassmorphic-card p-3 sm:p-4 rounded-md border-border-muted/60">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Highest Score
              </span>
              <Award className="h-3.5 w-3.5 text-accent-emerald" />
            </div>
            <p className="text-base sm:text-lg font-bold text-text-primary mt-1">
              {stats.highestScore} <span className="text-[10px] text-text-muted">/100</span>
            </p>
          </Card>
          <Card className="glassmorphic-card p-3 sm:p-4 rounded-md border-border-muted/60">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Status Overview
              </span>
              <span className="text-[9px] sm:text-[10px] text-accent-emerald font-semibold">
                {stats.completed} OK
              </span>
            </div>
            <div className="flex gap-2 mt-1.5 text-[9px] sm:text-[10px] text-text-secondary">
              <span>{stats.running} running</span>
              <span className="text-border-muted">|</span>
              <span>{stats.failed} failed</span>
            </div>
          </Card>
        </div>

        {/* Filters and Search Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-2">
          {/* Search bar */}
          <div className="w-full sm:max-w-xs relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search store name, domain, URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-border-muted bg-white pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-accent-violet focus:outline-none transition-colors h-8"
            />
          </div>

          {/* Filter / Sort actions */}
          <div className="flex flex-row gap-2 items-center justify-between sm:justify-end">
            <div className="flex-1 sm:flex-initial flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-text-muted uppercase shrink-0">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto rounded-md border border-border-muted bg-white px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent-violet h-8"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="running">Running</option>
                <option value="failed">Failed</option>
                <option value="queued">Queued</option>
              </select>
            </div>

            <div className="flex-1 sm:flex-initial flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-text-muted uppercase shrink-0">
                Sort
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto rounded-md border border-border-muted bg-white px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent-violet h-8"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highestScore">Highest Score</option>
                <option value="lowestScore">Lowest Score</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
            <RefreshCw className="h-6 w-6 animate-spin text-accent-violet" />
            <p className="text-xs text-text-muted">Loading audit history...</p>
          </div>
        ) : error ? (
          <div className="rounded-md border border-accent-rose/25 bg-rose-50/60 p-6 text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="h-8 w-8 text-accent-rose mx-auto" />
            <h3 className="text-sm font-bold text-text-primary">Load Failed</h3>
            <p className="text-xs text-text-secondary leading-relaxed">{error}</p>
            <Button variant="secondary" onClick={fetchAudits} size="sm">
              Retry
            </Button>
          </div>
        ) : audits.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-muted bg-bg-secondary p-12 text-center max-w-xl mx-auto space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent-violet/10 text-accent-violet">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary">No Audits Found</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                No reports match your filters. Run a new storefront audit to get started.
              </p>
            </div>
            <Button variant="primary" onClick={() => router.push(routes.web.home)} size="sm">
              Start Audit
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Audit List Grid */}
            {/* Desktop Audit List Grid */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {audits.map((audit) => {
                const scoreColor = getScoreColor(audit.overallScore);
                const displayStoreName =
                  audit.storeName || audit.storeUrl.replace(/^https?:\/\/(www\.)?/, '');
                const displayDomain =
                  audit.domain || audit.storeUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];

                return (
                  <Card
                    key={audit.id}
                    className="glassmorphic-card transition-all cursor-pointer hover:border-accent-violet/60 flex flex-col justify-between p-4 rounded-md border-border-muted/50"
                    onClick={() => router.push(routes.web.audits(audit.id))}
                  >
                    <div className="space-y-3">
                      {/* Top Bar: Logo, Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <BrandIcon
                            logoUrl={audit.logoUrl}
                            faviconUrl={audit.faviconUrl}
                            storeName={displayStoreName}
                          />
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-text-primary truncate">
                              {displayStoreName}
                            </h3>
                            <p className="text-[10px] text-text-muted truncate">{displayDomain}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={cn(
                              'text-xs font-extrabold px-1.5 py-0.5 rounded border',
                              scoreColor
                            )}
                          >
                            {audit.overallScore}
                          </span>
                          {getStatusBadge(audit.status)}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-border-muted/30 pt-2.5 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-text-muted" />
                            {new Date(audit.analyzedAt || audit.createdAt || '').toLocaleDateString(
                              undefined,
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )}
                          </span>
                          {audit.analysisTime ? (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-text-muted" />
                              {audit.analysisTime}s
                            </span>
                          ) : null}
                        </div>

                        {/* Page scores breakdown */}
                        <div className="grid grid-cols-4 gap-1 pt-1.5">
                          {Object.entries(audit.pageScores || {}).map(([page, score]) => (
                            <div key={page} className="text-center bg-bg-secondary/40 py-1 rounded">
                              <span className="text-[8px] text-text-muted uppercase block">
                                {page === 'pdp' ? 'PDP' : page}
                              </span>
                              <span
                                className={cn(
                                  'text-[10px] font-bold block mt-0.5',
                                  score >= 80
                                    ? 'text-accent-emerald'
                                    : score >= 50
                                      ? 'text-accent-amber'
                                      : 'text-accent-rose'
                                )}
                              >
                                {score}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Footer */}
                    <div className="flex items-center justify-between border-t border-border-muted/30 pt-3 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] px-2.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(routes.web.audits(audit.id));
                        }}
                      >
                        View Report
                      </Button>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] px-2 text-text-secondary hover:text-accent-violet"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/?url=${encodeURIComponent(audit.storeUrl)}`);
                          }}
                        >
                          Analyze Again
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-text-muted opacity-50 cursor-not-allowed"
                          disabled
                          title="Delete (Coming Soon)"
                          onClick={(e) => e.stopPropagation()}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Mobile Audit List Stack */}
            <div className="flex sm:hidden flex-col gap-2">
              {audits.map((audit) => {
                const scoreColor = getScoreColor(audit.overallScore);
                const displayStoreName =
                  audit.storeName || audit.storeUrl.replace(/^https?:\/\/(www\.)?/, '');
                return (
                  <div
                    key={audit.id}
                    className="flex items-center justify-between p-3 bg-white border border-border-muted/50 rounded-lg hover:border-accent-violet/60 transition-all cursor-pointer gap-3"
                    onClick={() => router.push(routes.web.audits(audit.id))}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <BrandIcon
                        logoUrl={audit.logoUrl}
                        faviconUrl={audit.faviconUrl}
                        storeName={displayStoreName}
                      />
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-text-primary truncate">
                          {displayStoreName}
                        </h3>
                        <p className="text-[9px] text-text-muted mt-0.5">
                          {new Date(audit.analyzedAt || audit.createdAt || '').toLocaleDateString(
                            undefined,
                            { month: 'short', day: 'numeric', year: 'numeric' }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusBadge(audit.status)}
                      <span
                        className={cn(
                          'text-xs font-extrabold px-1.5 py-0.5 rounded border leading-none',
                          scoreColor
                        )}
                      >
                        {audit.overallScore}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 ? (
              <div className="flex items-center justify-between pt-4 border-t border-border-muted/30">
                <span className="text-[10px] text-text-muted">
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total}{' '}
                  total audits)
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </PageWrapper>
    </Container>
  );
}
