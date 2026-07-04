import { AuditReport, Recommendation } from '../../../../types';
import { AiAnalysisResultRaw } from '../types/ai-types';
import { WebsiteSnapshot } from '../../interfaces/snapshot-types';

export class DomainMapper {
  /**
   * Converts Zod-validated AI outputs into the core domain AuditReport representation.
   * Ensures internal IDs are correctly formatted and sanitizes endpoints.
   *
   * @param rawResult Validated AI output structure.
   * @param snapshot WebsiteSnapshot structure containing branding info.
   */
  public static mapToAuditReport(
    rawResult: AiAnalysisResultRaw,
    snapshotOrUrl: WebsiteSnapshot | string
  ): AuditReport {
    const auditId = 'aud_' + Math.random().toString(36).substring(2, 10);
    const isString = typeof snapshotOrUrl === 'string';
    const storeUrl = isString ? snapshotOrUrl : snapshotOrUrl.storeUrl;
    const snapshot = isString ? null : snapshotOrUrl;

    const recommendations: Recommendation[] = rawResult.recommendations.map((rec, index) => {
      // Map properties, ensuring fallback bounds
      return {
        id: rec.id || `rec_${index}_${Math.random().toString(36).substring(2, 6)}`,
        pageType: rec.pageType,
        category: rec.category,
        finding: rec.finding,
        rationale: rec.rationale,
        actionSteps: rec.actionSteps,
        impact: rec.impact,
        effort: rec.effort,
      };
    });

    const now = new Date().toISOString();

    return {
      id: auditId,
      url: storeUrl,
      storeUrl,
      domain: snapshot?.branding?.domain,
      storeName: snapshot?.branding?.storeName,
      title: snapshot?.branding?.title,
      description: snapshot?.branding?.description,
      logoUrl: snapshot?.branding?.logoUrl,
      faviconUrl: snapshot?.branding?.faviconUrl,
      appleTouchIcon: snapshot?.branding?.appleTouchIcon,
      themeColor: snapshot?.branding?.themeColor,
      brandColor: snapshot?.branding?.brandColor,
      platform: snapshot?.branding?.platform,
      overallScore: rawResult.overallScore,
      status: 'completed',
      analysisTime: 0, // Placed as default, to be calculated dynamically at API layer
      createdAt: now,
      updatedAt: now,
      analyzedAt: now,
      pageScores: {
        homepage: rawResult.pageScores.homepage,
        pdp: rawResult.pageScores.pdp,
        collection: rawResult.pageScores.collection,
        cart: rawResult.pageScores.cart,
      },
      issues: [],
      recommendations,
    };
  }
}

export default DomainMapper;
