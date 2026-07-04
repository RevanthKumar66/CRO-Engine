import { Schema, Type } from '@google/genai';

/**
 * Enforces structured output format from Gemini models.
 */
export const croAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.INTEGER,
      description: "Global e-commerce Conversion Rate Optimization score from 0 to 100.",
    },
    pageScores: {
      type: Type.OBJECT,
      properties: {
        homepage: { type: Type.INTEGER },
        pdp: { type: Type.INTEGER },
        collection: { type: Type.INTEGER },
        cart: { type: Type.INTEGER },
      },
      required: ["homepage", "pdp", "collection", "cart"],
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          pageType: {
            type: Type.STRING,
            enum: ["homepage", "pdp", "collection", "cart"],
          },
          category: {
            type: Type.STRING,
            enum: ["copywriting", "layout", "cta", "trust", "mobile", "performance"],
          },
          finding: {
            type: Type.STRING,
            description: "A descriptive finding statement highlighting a UX friction or opportunity.",
          },
          rationale: {
            type: Type.STRING,
            description: "Psychological explanation or rationale for why it matters for conversion rates.",
          },
          actionSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Step-by-step resolution instructions for merchant or developers.",
          },
          impact: {
            type: Type.STRING,
            enum: ["HIGH", "MEDIUM", "LOW"],
          },
          effort: {
            type: Type.STRING,
            enum: ["HIGH", "MEDIUM", "LOW"],
          },
        },
        required: ["pageType", "category", "finding", "rationale", "actionSteps", "impact", "effort"],
      },
    },
  },
  required: ["overallScore", "pageScores", "recommendations"],
};
