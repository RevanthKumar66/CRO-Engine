import { Schema, Type } from '@google/genai';

/**
 * Gemini SDK Schema definition enforcing strict JSON compliance.
 */
export const geminiAnalysisResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.INTEGER,
      description: "Aggregate e-commerce conversion optimization score from 0 to 100.",
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
    summary: {
      type: Type.STRING,
      description: "Overall e-commerce UX and copywriting summary review.",
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          pageType: {
            type: Type.STRING,
            enum: ["homepage", "pdp", "collection", "cart"],
          },
          category: {
            type: Type.STRING,
            enum: ["copywriting", "layout", "cta", "trust", "mobile", "performance"],
          },
          finding: { type: Type.STRING, description: "Direct statement of the problem." },
          evidence: { type: Type.STRING, description: "Specific HTML selector or text elements where the issue was found." },
          rationale: { type: Type.STRING, description: "E-commerce psychology or CRO justification." },
          actionSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Step-by-step developer resolution instructions.",
          },
          impact: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
          confidence: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
          effort: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
          priority: { type: Type.INTEGER, description: "1 = Critical/Quick Win, 2 = High, 3 = Medium, 4 = Low" },
        },
        required: [
          "id",
          "pageType",
          "category",
          "finding",
          "evidence",
          "rationale",
          "actionSteps",
          "impact",
          "confidence",
          "effort",
          "priority"
        ],
      },
    },
    nextActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Top 3 initial developer action items to run.",
    },
  },
  required: ["overallScore", "pageScores", "summary", "recommendations", "nextActions"],
};

export default geminiAnalysisResponseSchema;
