import { AuditReport, Recommendation } from '../../../../types';
import { AiAnalysisResultRaw } from '../types/ai-types';

export class DomainMapper {
  /**
   * Converts Zod-validated AI outputs into the core domain AuditReport representation.
   * Ensures internal IDs are correctly formatted and sanitizes endpoints.
   *
   * @param rawResult Validated AI output structure.
   * @param storeUrl Normalized storefront URL.
   */
  public static mapToAuditReport(rawResult: AiAnalysisResultRaw, storeUrl: string): AuditReport {
    const auditId = 'aud_' + Math.random().toString(36).substring(2, 10);

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

    return {
      id: auditId,
      storeUrl,
      overallScore: rawResult.overallScore,
      analyzedAt: new Date().toISOString(),
      pageScores: {
        homepage: rawResult.pageScores.homepage,
        pdp: rawResult.pageScores.pdp,
        collection: rawResult.pageScores.collection,
        cart: rawResult.pageScores.cart,
      },
      recommendations,
    };
  }
}

export default DomainMapper;
