# Bangladesh Tech Careers Aggregator & Analytics Engine

An elegant, real-time full-stack job board and career aggregator specializing in **Bangladesh Technology & Software Engineering Companies**. It live-scrapes job directories, sanitizes metadata, parses structured inputs, normalizes roles, and generates deep market analytics.

---

## 🚀 Key Architectural Features

### 1. Multi-Tier High-Fidelity Scraping Pipeline
To parse live listings from highly non-standard corporate sites, the aggregator processes targets using three hierarchical **Precision Tiers**:
*   **Tier 1: Schema.org JSON-LD (Precision: ~100%)**
    *   Traverses document headers searching for standardized JSON-LD `<script type="application/ld+json">` blobs defining `JobPosting` objects.
*   **Tier 2: State Hydration Parsing (Precision: ~90%)**
    *   Harvests pre-rendered React, Next, or Nuxt JSON states (such as `__NEXT_DATA__` or dynamic states) embedded in script elements before DOM hydration occurs.
*   **Tier 3: Heuristic Selector Engine (Precision: ~80%)**
    *   Analyzes body trees, parent densities, and anchor links to extract titles, descriptions, and direct URLs.

### 2. Multi-Path Directory Probing
When direct crawls return no results, the engine fires a parallel probe pipeline:
1.  **Alternative Career Link Discovery**: Inspects primary page anchor elements for labels matching `/careers`, `/career-hub`, etc.
2.  **Domain Root Suffix Scanning**: Dynamically falls back to standard suffixes (`/career`, `/careers`, `/jobs`, `/vacancies`) on the origin host.

---

## 🛠️ Defenses & Network Error Resolution

The crawler has been hardened with defenses to withstand common corporate server crashes and DNS anomalies:

1.  **Obsolete & Defunct Host Redirector**:
    Automatically redirects defunct, offline, or obsolete recruiter recruitment platforms to active career portals:
    *   `jobs.divineit.net` ➔ Redirects to the active `divineit.net/career` portal.
    *   `people.aamra.com.bd` ➔ Safe fallback to the primary `aamra.com.bd` enterprise directory.
    *   `talent.talent-troop.com` ➔ Stripped and redirected to active domains like `era.com.bd/career` or the primary website address.
2.  **Network Resolution Guard**:
    Intercepts and handles system-level connection errors gracefully (such as `getaddrinfo ENOTFOUND`, `UND_ERR_CONNECT_TIMEOUT`, and `fetch failed`). Instead of aborting the crawler execution loop, the engine captures the state and proceeds with cached datasets.
3.  **Extended Scraper Timeout Grace**:
    Timeout limits have been expanded (15s for primary crawls, 8s for deep detail scans) to tolerate slow Bangladesh shared-hosting career servers.
4.  **Graceful SSL/TLS Bypass**:
    The crawler bypasses expired certificates on smaller portals securely inside the container environment using:
    ```js
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    ```
5.  **Punctuation-Split URLs**:
    Semicolon and comma-separated directories (e.g., `people.aamra.com.bd; aamratechnologies.com`) are auto-split, trimmed, and parsed defensively.

---

## 📊 Rich Market Perspectives & Salary Analytics

The app includes an **Advanced Analytics Dashboard** featuring live-processed statistical metrics:

*   **Market Vitality Index**: Real-time evaluation of job density across the Dhaka tech ecosystem.
*   **Tech Spec Intensity**: Metrics tracking average programming skills and frameworks specified per role.
*   **Flexibility Quotient**: Dynamic percentage representing the prevalence of Remote and Hybrid schedules.
*   **Crawl Confidence Index**: A weighted metric tracking standards compliance (Tiers 1, 2, and 3).
*   **Work Mode Mix (Pie Chart)**: Segmented visual distribution of Fully On-Site, Hybrid, and 100% Remote positions.
*   **Discovery Source Capture Quality (Bar Chart)**: Segmented breakdown showcasing the extraction mechanisms used.
*   **Role Category Salary Range Chart**: A comprehensive multi-bar chart comparing **Minimum, Average, and Maximum BDT monthly salaries** for frontend, backend, fullstack, mobile, DevOps, QA, product, UI/UX, and other engineering disciplines.
*   **Salary Disclosure Rate Progress**: A gauge calculating the percentage of job listings providing explicit wage indicators.
*   **Strategic Market Narrative Panels**: Expert summaries discussing technology saturation (Node.js, TypeScript), geographic centralization (Gulshan, Banani, Mirpur), and salary transparency.

---

## 📦 Getting Started

### Installation
Install backend and client dependencies:
```bash
npm install
```

### Development Server
Boot the server (the entry point `server.ts` wraps the Express API server and proxies Vite middleware for live HMR):
```bash
npm run dev
```

### Production Build
Bundle client assets using Vite and transpile the Express server into a standalone bundled `.cjs` script using `esbuild`:
```bash
npm run build
npm start
```
