/**
 * Centralized resource and asset paths inside the application.
 */
export const paths = {
  prompts: {
    systemPromptV1: 'prompts/system_prompts/v1.txt',
    analysisTemplate: 'prompts/templates/analysis_template.txt',
  },
  assets: {
    favicon: '/favicon.ico',
    logo: '/assets/logo.svg',
  },
} as const;

export default paths;
