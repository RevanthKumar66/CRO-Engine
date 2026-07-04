import { MetadataRoute } from 'next';
import { AuditRepository } from '@/server/db/audit-repository';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cro-engine.vercel.app';

  // Base routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 0.8,
    },
  ];

  // Try to load dynamic audits for SEO indexing
  try {
    const recentAudits = await AuditRepository.findRecent(100);
    const auditRoutes = recentAudits.map((audit) => ({
      url: `${baseUrl}/audits/${audit.id}`,
      lastModified: new Date(audit.analyzedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
    return [...routes, ...auditRoutes];
  } catch (error) {
    // Fallback if DB connection fails during static site generation
    return routes;
  }
}
