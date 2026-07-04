/**
 * User Prompt Version 1.
 * Formats the preprocessed storefront context into the prompt structure.
 */
export function createUserPromptV1(storefrontContext: string): string {
  return `
Below is the preprocessed structural context for the Shopify storefront to audit:

=========================================================
STOREFRONT CONTEXT DATA
=========================================================
${storefrontContext}
=========================================================

Execute the CRO analysis and return the structured audit report.
`;
}

export default createUserPromptV1;
