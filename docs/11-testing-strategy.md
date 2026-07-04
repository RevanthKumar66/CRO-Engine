# Shopify CRO Opportunity Engine - Testing Strategy

This document outlines the testing philosophy, automated test framework, manual verification protocols, and edge case checklist for the Shopify CRO Opportunity Engine.

---

## 1. Testing Philosophy
We maintain a test-driven development (TDD) inspired mindset to ensure the reliability of the system, particularly around scraping and AI output parsing.
* **Coverage Targets**: Minimum 80% code coverage across all core features. 100% coverage for the DOM processing and validation layers.
* **Scraper Isolation**: We do not hit live e-commerce websites during automated testing. All network calls are stubbed or mocked using local HTML mock fixtures.
* **Determinism**: We test the validation layers and prompt composition independently from live Gemini API calls, using static mock JSON outputs.

---

## 2. Testing Levels & Matrix

| Testing Level | Scope / Target | Tools | Target Frequency |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | Scraper DOM minification, Zod schema validation, API formatting utilities. | Vitest / Jest | Run on every local commit and CI pull request. |
| **Integration Tests** | Flow between HTTP API request, mock scraping execution, and Mock Gemini responses. | Supertest, Vitest | Run on CI branch merges. |
| **E2E / Automated Checks**| Scanning the local mockup storefronts and rendering dashboards. | Playwright (Future) | Run during pre-release staging deployments. |
| **Manual Verification** | Verify mobile styling responsiveness, screen reader cues, and dark mode layout balances. | Browser DevTools | Performed before PR approvals. |

---

## 3. Mock Strategy & Fixtures

To support offline and predictable testing, we maintain mock storefront templates in the codebase:

1. **`tests/fixtures/shopify-mock-homepage.html`**: A standard public Shopify page source featuring CDN assets, Shopify global JS variables, and sample layouts.
2. **`tests/fixtures/non-shopify-page.html`**: A standard page source missing e-commerce selectors, used to verify Shopify platform identification.
3. **`tests/fixtures/gemini-mock-response.json`**: A valid JSON response payload matching the structured recommendation contracts.

---

## 4. Key Edge Cases to Validate

* **Scraper Failures**:
  - Target URL returns 403 Forbidden or 404 Not Found (ensure we map to `ERR_SCRAPING_FAILED`).
  - Page is extremely large (> 5MB) (validate token limit truncation handles it gracefully).
  - Target URL resolves to local loopback addresses (validate SSRF blocks it).
* **Gemini JSON Mismatch**:
  - Model returns invalid JSON syntax (verify retry strategy escalates or handles the exception).
  - Model returns valid JSON but misses required properties (Zod schema should throw, triggering fallback).
* **UI Responsiveness**:
  - Score indicators and radial gauges resize cleanly down to `320px` width without horizontal scrollbars.

---

## 5. Sample Unit Test Code Pattern

```typescript
import { minifyHTML } from '../../features/scraper/dom-minifier';

describe('DOM Minifier Module', () => {
  it('should remove script and style blocks from raw HTML', () => {
    const rawHTML = `
      <html>
        <head>
          <style>body { background: red; }</style>
        </head>
        <body>
          <h1>Product Title</h1>
          <script>console.log("analytics");</script>
        </body>
      </html>
    `;
    const minified = minifyHTML(rawHTML);
    expect(minified).not.toContain('<style>');
    expect(minified).not.toContain('<script>');
    expect(minified).toContain('<h1>Product Title</h1>');
  });
});
```
