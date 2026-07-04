'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  AlertCircle,
  ArrowRight,
  Plus,
  RefreshCw,
  Calendar,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { Container } from '@/components/common/Container';
import { PageWrapper } from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { routes } from '@/config/routes';
import type { AuditReport } from '../../../types/index.d';

export default function DashboardPage() {
  const router = useRouter();
  const [audits, setAudits] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAudits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(routes.api.audits);
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || 'Failed to fetch audits.');
      }
      setAudits(resData.data || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading recent audits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const getScoreInfo = (score: number) => {
    if (score >= 80)
      return {
        label: 'Good',
        color: 'text-accent-emerald bg-accent-emerald/5 border-accent-emerald/20',
      };
    if (score >= 50)
      return {
        label: 'Needs Improvement',
        color: 'text-accent-amber bg-accent-amber/5 border-accent-amber/20',
      };
    return {
      label: 'Needs Attention',
      color: 'text-accent-rose bg-accent-rose/5 border-accent-rose/20',
    };
  };

  const filteredAudits = audits.filter((audit) =>
    audit.storeUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container>
      <PageWrapper className="space-y-8 select-none py-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-muted/30 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-accent-violet" />
              Audits Dashboard
            </h1>
            <p className="text-sm text-text-secondary">
              Manage and view past Conversion Rate Optimization audits.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={fetchAudits} size="sm" className="h-9">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push(routes.web.home)}
              size="sm"
              className="h-9"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Audit
            </Button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-accent-violet" />
            <p className="text-sm text-text-muted">Loading your past audits...</p>
          </div>
        ) : error ? (
          <div className="rounded-md border border-accent-rose/25 bg-rose-50/60 p-6 text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="h-10 w-10 text-accent-rose mx-auto" />
            <h3 className="text-base font-bold text-text-primary">Load Failed</h3>
            <p className="text-xs text-text-secondary leading-relaxed">{error}</p>
            <Button variant="secondary" onClick={fetchAudits} size="sm">
              Retry
            </Button>
          </div>
        ) : audits.length === 0 ? (
          /* Empty State: No Audit */
          <div className="rounded-lg border border-dashed border-border-muted bg-bg-secondary p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-violet/10 text-accent-violet">
              <FileText className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-primary">No Audits Found</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                You haven&apos;t run any storefront conversion audits yet. Submit a Shopify store
                URL on the home page to start.
              </p>
            </div>
            <Button variant="primary" onClick={() => router.push(routes.web.home)} size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Start First Audit
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search Filter */}
            <div className="max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search audits by store URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-border-muted bg-bg-secondary pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-violet focus:outline-none transition-colors"
              />
            </div>

            {/* Audits List */}
            {filteredAudits.length === 0 ? (
              <div className="text-center py-12 text-text-secondary text-sm">
                No past audits match &quot;{searchQuery}&quot;.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAudits.map((audit) => {
                  const scoreMeta = getScoreInfo(audit.overallScore);
                  return (
                    <Card
                      key={audit.id}
                      className="glassmorphic-card transition-all cursor-pointer hover:border-accent-violet flex flex-col justify-between"
                      onClick={() => router.push(routes.web.audits(audit.id))}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-xs text-text-muted flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(audit.analyzedAt).toLocaleDateString()}
                          </span>
                          <span
                            className={cn(
                              'text-xs font-semibold px-2 py-0.5 rounded border capitalize',
                              scoreMeta.color
                            )}
                          >
                            {scoreMeta.label}
                          </span>
                        </div>
                        <CardTitle className="text-base font-bold text-text-primary mt-2 break-all line-clamp-1">
                          {audit.storeUrl.replace(/^https?:\/\//, '')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold text-text-primary">
                            {audit.overallScore}
                          </span>
                          <span className="text-xs text-text-muted">/100 Score</span>
                        </div>

                        {/* Page scores breakdown */}
                        <div className="grid grid-cols-4 gap-1 pt-2 border-t border-border-muted/30">
                          {Object.entries(audit.pageScores || {}).map(([page, score]) => (
                            <div key={page} className="text-center">
                              <span className="text-[10px] text-text-muted capitalize block">
                                {page === 'pdp' ? 'PDP' : page}
                              </span>
                              <span
                                className={cn(
                                  'text-xs font-bold block mt-0.5',
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

                        {/* Link overlay */}
                        <div className="flex items-center justify-between text-xs text-accent-violet font-semibold pt-2">
                          <span>View Full Report</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </PageWrapper>
    </Container>
  );
}
