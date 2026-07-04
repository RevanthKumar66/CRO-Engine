import { AuditReport, Recommendation } from '../../types';

export function generateMockAudit(storeUrl: string): AuditReport {
  const cleanUrl = storeUrl.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
  const auditId = 'aud_' + Math.random().toString(36).substring(2, 10);

  const recommendations: Recommendation[] = [
    {
      id: 'rec_mobile_cta_fold',
      pageType: 'pdp',
      category: 'cta',
      finding: 'Add to Cart button is pushed below the fold on standard mobile viewports.',
      rationale:
        'Mobile shoppers must scroll past large text description blocks to execute the primary conversion. Keeping the conversion trigger immediately reachable yields up to 15% increases in click-through rates.',
      actionSteps: [
        'Move the pricing block and primary Add to Cart button immediately below the product title grid.',
        'Apply a sticky mobile bottom CTA bar that animates into view once the primary button scrolls off-screen.',
      ],
      impact: 'HIGH',
      effort: 'MEDIUM',
    },
    {
      id: 'rec_trust_cart_abandon',
      pageType: 'cart',
      category: 'trust',
      finding: 'Cart page lacks trust indicators or purchase guarantees near checkout button.',
      rationale:
        'Buyer friction rises at high-risk steps like payment routing. Visual reassurance triggers lower basket abandonment rates.',
      actionSteps: [
        'Place security badges (e.g. SSL, secure payment processor icons) directly below the checkout button.',
        'Add a clear microcopy line: "Free 30-day returns & full warranty included."',
      ],
      impact: 'HIGH',
      effort: 'LOW',
    },
    {
      id: 'rec_copy_value_prop',
      pageType: 'homepage',
      category: 'copywriting',
      finding:
        'Homepage headline is focused on company description rather than client value proposition.',
      rationale:
        'Bounce rates double when visitors fail to understand what benefits the brand offers in the first 3 seconds.',
      actionSteps: [
        'Rewrite the header text to explain the core customer transformation: "Get X done in Y time".',
        'Incorporate a supporting subheadline highlighting primary competitive differentiators.',
      ],
      impact: 'MEDIUM',
      effort: 'LOW',
    },
    {
      id: 'rec_performance_grids',
      pageType: 'collection',
      category: 'performance',
      finding: 'Heavy grid images without proper lazy loading block browser parsing.',
      rationale:
        'A 100ms load delay lowers conversion rates. Keeping storefront image grids optimized improves layout transitions.',
      actionSteps: [
        'Enforce native loading="lazy" attributes on all collection page item thumbnails.',
        'Resize catalog image dimensions to match standard viewport dimensions.',
      ],
      impact: 'MEDIUM',
      effort: 'MEDIUM',
    },
  ];

  return {
    id: auditId,
    storeUrl: `https://${cleanUrl}`,
    overallScore: 72,
    analyzedAt: new Date().toISOString(),
    pageScores: {
      homepage: 78,
      pdp: 65,
      collection: 80,
      cart: 65,
    },
    recommendations,
  };
}
export default generateMockAudit;
