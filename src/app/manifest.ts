import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CRO Engine',
    short_name: 'CRO Engine',
    description: 'AI-powered Conversion Rate Optimization insights for Shopify storefronts.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e40af',
    icons: [
      {
        src: '/assets/cro-ico-logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
