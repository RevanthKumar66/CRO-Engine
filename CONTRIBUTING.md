# Contributing to Shopify CRO Opportunity Engine

We welcome contributions from the community. To maintain production-quality standards and code review efficiency, please follow these guidelines when submitting pull requests.

---

## 1. Branch Naming & Commits

We follow standard Conventional Commit guidelines.

### Branch Names
* Use `feat/` for new features (e.g., `feat/add-cart-scraping`).
* Use `fix/` for bug fixes (e.g., `fix/gemini-fallback-logic`).
* Use `refactor/` for optimization or cleanup (e.g., `refactor/minifier-regex`).
* Use `chore/` for dependencies, updates, or CI config (e.g., `chore/tsconfig-updates`).

### Commit Messages
Format: `<type>(<scope>): <description>`
* Example: `feat(scraper): extract heading hierarchy from PDP`
* Example: `fix(server): return correct 429 payload for rate limit hits`

---

## 2. Style Guide & Design Token Rules
* **TypeScript strict checks**: Ensure all code compiles cleanly with no `any` annotations. Run `npm run check-types` before submitting.
* **Design Tokens**: Frontend components must always consume the design tokens defined in `src/ui/global.css` or [06-design-system.md](file:///c:/Users/Admin/OneDrive/Desktop/CRO/docs/06-design-system.md). Do not embed ad-hoc, hardcoded hex values or sizing grids.
* **Formatting**: We use standard formatting. Run `npm run format` to automatically clean up file indentations and spacing.

---

## 3. Pull Request Process
1. Fork the repository and create your feature branch from `main`.
2. Ensure all unit and integration tests run successfully:
   ```bash
   npm test
   ```
3. Update relevant documentation in `docs/` if your feature alters the API contract, domain, or AI schemas.
4. Open a Pull Request with a clear description of the changes, design decisions, and testing steps performed.
5. A project maintainer will review your code. Address any code review comments before approval.
