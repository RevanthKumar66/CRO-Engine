# Shopify CRO Opportunity Engine - Design System

This design system defines the UI patterns, visual layout tokens, CSS variables, accessibility guides, and UI components for the interactive dashboard. It uses a premium, modern dark-mode aesthetic with vibrant accent gradients and glassmorphism elements, inspired by design leaders like Vercel and Linear.

---

## 1. Core Tokens (CSS Custom Properties)

```css
:root {
  /* Color Palette - Premium Slate & Violet */
  --bg-primary: #09090b;       /* Zinc 950 */
  --bg-secondary: #18181b;     /* Zinc 900 */
  --bg-card: rgba(24, 24, 27, 0.65); /* Glassmorphic Base */
  --border-muted: #27272a;     /* Zinc 800 */
  --border-accent: #3f3f46;    /* Zinc 700 */

  /* Accent Colors */
  --accent-violet: #8b5cf6;    /* Violet 500 */
  --accent-violet-glow: rgba(139, 92, 246, 0.15);
  --accent-emerald: #10b981;   /* Emerald 500 (Success/High Score) */
  --accent-amber: #f59e0b;     /* Amber 500 (Medium Score) */
  --accent-rose: #f43f5e;      /* Rose 500 (Alert/Low Score) */

  /* Text Colors */
  --text-primary: #fafafa;     /* Zinc 50 */
  --text-secondary: #a1a1aa;   /* Zinc 400 */
  --text-muted: #71717a;       /* Zinc 500 */

  /* Typography */
  --font-sans: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  
  /* Font Sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;

  /* Spacing Grid (4px scale) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;

  /* Border Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-full: 9999px;

  /* Shadow / Glow Tokens */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
  --shadow-glow: 0 0 20px 0 rgba(139, 92, 246, 0.2);

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 2. Layout & Grid Systems
* **Breakpoints**:
  - Mobile: `375px` (Mobile-first entry designs)
  - Tablet: `768px`
  - Desktop: `1024px`
  - Wide Desktop: `1440px`
* **Grid**: 12-column responsive grid on desktops with `var(--space-6)` gaps. Max content container width is `1280px`.

---

## 3. UI Component Skeletons

### Cards (Glassmorphism & Interactive States)
```html
<div class="cro-card">
  <div class="cro-card-header">
    <span class="badge badge-high-impact">High Impact</span>
    <span class="badge badge-low-effort">Quick Win</span>
  </div>
  <h3 class="cro-card-title">Enable Sticky Add-To-Cart</h3>
  <p class="cro-card-description">Rationalization details and step-by-step guides go here.</p>
</div>
```
```css
.cro-card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-muted);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.cro-card:hover {
  border-color: var(--accent-violet);
  box-shadow: var(--shadow-glow);
}
```

### Action Buttons
* **Primary Button**: Large, violet gradient outline or fills with elegant hover scaling.
* **Secondary Button**: Minimal transparent slate background with clean borders.
```css
.btn-primary {
  font-family: var(--font-sans);
  font-weight: 500;
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--accent-violet) 0%, #a78bfa 100%);
  border: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: transform var(--transition-fast), filter var(--transition-fast);
}
.btn-primary:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}
```

### Input Fields
```css
.input-field {
  background: var(--bg-secondary);
  border: 1px solid var(--border-muted);
  color: var(--text-primary);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.input-field:focus {
  outline: none;
  border-color: var(--accent-violet);
  box-shadow: 0 0 0 2px var(--accent-violet-glow);
}
```

---

## 4. State Animations & Loading Micro-Animations
* **Pulse**: Used on scanning elements and layout skeletons to signify data-retrieval.
* **Progress Gauges**: Smooth circular stroke transition for score counters.
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.skeleton-loader {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}
```

---

## 5. Accessibility Guidelines (WCAG 2.1)
* **Contrast Compliance**: Primary text color (`#fafafa`) on cards (`#18181b`) yields a contrast ratio of `14.5:1`, passing AAA.
* **Focus Indicators**: Standard outline-free ring overrides must use active, high-visibility borders (`var(--accent-violet)`) to support keyboard users.
* **Screen Readers**: Interactive checklist items and gauge charts must include descriptive `aria-label`, `aria-checked`, and `aria-live="polite"` dynamic regions.
* **Keyboard Navigation**: Dashboard navigation tabs, audit triggers, and details panels must be fully interactive using `Tab` and `Enter/Space`.
