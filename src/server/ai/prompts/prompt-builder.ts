import { systemPromptV1 } from './system-v1';
import { createUserPromptV1 } from './user-v1';

export interface CompiledPrompt {
  systemInstruction: string;
  userContent: string;
  version: string;
}

export class PromptBuilder {
  /**
   * Compiles prompt templates and version-controlled instructions.
   *
   * @param storefrontContext Minified storefront context string.
   */
  public static buildV1(storefrontContext: string): CompiledPrompt {
    return {
      systemInstruction: systemPromptV1,
      userContent: createUserPromptV1(storefrontContext),
      version: 'v1.0.0',
    };
  }
}

export default PromptBuilder;
