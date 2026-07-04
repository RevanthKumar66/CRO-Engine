# Shopify CRO Opportunity Engine - Future Improvements

This document outlines the product roadmap and technical architecture plans beyond the MVP release. It covers competitor differences, authentication, scalability, multi-tenancy, and visual improvements.

---

## 1. Competitor Comparison & Unique Value Proposition

| Feature | Competitor Apps (e.g., Hotjar, PageSpeed) | Shopify CRO Opportunity Engine (Future) |
| :--- | :--- | :--- |
| **Audit Focus** | Raw code performance or user-session recording. | Contextual, UX psychology, copywriting evaluation. |
| **Actionability** | Large, overwhelming heatmaps or abstract speed metrics. | Granular "Quick Win" cards, developer code snippets, and exact copy replacements. |
| **Automation** | Requires manual installation of tracking scripts. | No-install, instant URL-based auditing. |
| **Self-Healing** | None. Merchant must edit code manually. | Direct Shopify Theme API hooks to apply changes with one click. |

---

## 2. Post-MVP Feature Backlog

### Authentication & Tenant Accounts
* **Goal**: Enable merchants to create secure accounts, saving their history and store configuration profiles.
* **Architecture**: Implement OAuth2 based Shopify Admin authentication, allowing users to log in directly via their Shopify store credentials.

### Audit History & Change Tracking
* **Goal**: Keep a history of past audits so merchants can visualize their CRO improvements over time.
* **Architecture**: Set up a relational database (e.g., PostgreSQL) to track scores, date records, and completed checklist items.

### PDF & Team Exports
* **Goal**: Allow digital agencies and marketing consultants to download professional PDF reports of the generated audit to share with clients or development teams.
* **Architecture**: Implement server-side rendering of reports (using Puppeteer or light HTML-to-PDF exporters).

### Multi-Tenant Team Workspaces
* **Goal**: Support collaborative workspaces where multiple team members (developers, designers, marketers) can track audit checklist progress and assign tasks.
* **Architecture**: Implement role-based access control (RBAC) with Owner, Admin, and Developer privileges.

---

## 3. Technical & Architectural Scalability

### Advanced Scraping (Playwright Pool)
To support JavaScript-heavy headless stores (such as custom Hydrogen/Headless Shopify storefronts), we will implement a worker pool running Playwright instances inside serverless functions or container environments (e.g., AWS Fargate).

### Distributed Caching (Redis)
Move from memory-cache to a dedicated Redis cluster to share storefront scraping and AI evaluation states across multi-instance API deployments, lowering costs and latency under heavy traffic loads.

### Webhook Event Engine
Support webhook events. For example, trigger automated scans whenever the Shopify storefront registers a `themes/update` webhook event, ensuring new visual layouts do not break existing CRO setups.
