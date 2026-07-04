import { describe, it, expect } from 'vitest';
import { PromptBuilder } from './prompt-builder';

describe('PromptBuilder Tests', () => {
  it('should compile system and user prompts correctly', () => {
    const mockContext = 'STOREFRONT URL: https://example.com\nTITLE: Sample Store';
    const compiled = PromptBuilder.buildV1(mockContext);

    expect(compiled.systemInstruction.toLowerCase()).toContain('conversion rate optimization');
    expect(compiled.userContent).toContain(mockContext);
    expect(compiled.version).toBe('v1.0.0');
  });
});
