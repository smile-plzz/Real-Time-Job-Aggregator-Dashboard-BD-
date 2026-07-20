# TechHub BD Intelligence & Career Aggregator

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![React](https://img.shields.io/badge/react-19.0.1-61DAFB.svg?logo=react)
![Tailwind](https://img.shields.io/badge/tailwindcss-4.1-38B2AC.svg?logo=tailwind-css)
![Vite](https://img.shields.io/badge/vite-6.2-646CFF.svg?logo=vite)
![TypeScript](https://img.shields.io/badge/typescript-5.8-3178C6.svg?logo=typescript)

An elegant, real-time full-stack job board and career aggregator specializing in **Bangladesh Technology & Software Engineering Companies**. It live-scrapes job directories, sanitizes metadata, parses structured inputs, normalizes roles, and generates deep market analytics, wrapped in a beautiful **Dark Cosmic** UI theme.

---

## ✨ Features

- **Real-Time Job Aggregation**: Live scraping of 150+ Bangladesh tech companies.
- **Geospatial Intelligence Map**: Interactive Leaflet-powered map tracking tech clusters across Dhaka.
- **Market Analytics Dashboard**: Deep telemetry on salary distributions, work modes (Remote/Hybrid/On-site), and technology stack demand.
- **Dark Cosmic UI**: High-contrast, typography-focused dark mode design with subtle gradients, interactive motion, and grid layouts.
- **Dual Directory Merging**: Merges data from JustApply and MBSTUPC directories on the fly.
- **Advanced Filtering**: Filter by experience level, role category, company, salary band, and specific tech skills.

---

## 🚀 Key Architectural Features

### 1. Multi-Tier High-Fidelity Scraping Pipeline
To parse live listings from highly non-standard corporate sites, the aggregator processes targets using three hierarchical **Precision Tiers**:
*   **Tier 1: Schema.org JSON-LD (Precision: ~100%)**
    Traverses document headers searching for standardized JSON-LD `<script type="application/ld+json">` blobs defining `JobPosting` objects.
*   **Tier 2: State Hydration Parsing (Precision: ~90%)**
    Harvests pre-rendered React, Next, or Nuxt JSON states (such as `__NEXT_DATA__` or dynamic states) embedded in script elements before DOM hydration occurs.
*   **Tier 3: Heuristic Selector Engine (Precision: ~80%)**
    Analyzes body trees, parent densities, and anchor links to extract titles, descriptions, and direct URLs.

### 2. Multi-Path Directory Probing
When direct crawls return no results, the engine fires a parallel probe pipeline:
1.  **Alternative Career Link Discovery**: Inspects primary page anchor elements for labels matching `/careers`, `/career-hub`, etc.
2.  **Domain Root Suffix Scanning**: Dynamically falls back to standard suffixes (`/career`, `/careers`, `/jobs`, `/vacancies`) on the origin host.

### 3. Dual Directory Source Synthesis
To build the most comprehensive mapping of the Bangladeshi tech scene, the engine synthesizes two primary developer directories:
*   **Just Apply Directory**: Live fetched from the `badhon495/just-apply` data repository. Includes core contact emails, HR recruiter contacts, and registered websites.
*   **MBSTUPC Directory**: Live crawled and parsed from the `MBSTUPC/tech-companies-in-bangladesh` AsciiDoc database. Provides team size metadata, social media links, and primary technology stacks.

---

## 🛠️ Defenses & Network Error Resolution
The crawler has been hardened with defenses to withstand common corporate server crashes and DNS anomalies:
1.  **Obsolete & Defunct Host Redirector**: Automatically redirects defunct, offline, or obsolete recruitment platforms to active career portals.
2.  **Network Resolution Guard**: Intercepts and handles system-level connection errors gracefully (e.g., `getaddrinfo ENOTFOUND`, `UND_ERR_CONNECT_TIMEOUT`).
3.  **Extended Scraper Timeout Grace**: Timeout limits have been expanded to tolerate slow Bangladesh shared-hosting career servers.
4.  **Graceful SSL/TLS Bypass**: Bypasses expired certificates securely inside the container environment.
5.  **Punctuation-Split URLs**: Semicolon and comma-separated directories are auto-split, trimmed, and parsed defensively.

---

## 📊 Rich Market Perspectives & Salary Analytics
The app includes an **Advanced Analytics Dashboard** featuring live-processed statistical metrics:
*   **Geospatial Intelligence Map**: Visualizing company distributions and tech clusters across Dhaka.
*   **Market Vitality Index**: Real-time evaluation of job density across the Dhaka tech ecosystem.
*   **Tech Spec Intensity**: Metrics tracking average programming skills and frameworks specified per role.
*   **Flexibility Quotient**: Dynamic percentage representing the prevalence of Remote and Hybrid schedules.
*   **Salary Analytics**: A comprehensive multi-bar chart comparing Minimum, Average, and Maximum BDT monthly salaries.
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

### Production Build & Deployment
Bundle client assets using Vite and transpile the Express server into a standalone bundled `.cjs` script using `esbuild`:
```bash
npm run build
npm start
```

### ☁️ Deployment Compatibility
*   **Dual ESM/CJS Compatibility**: Built with custom path-resolution fallbacks enabling flawless execution both under ESM (`tsx` in local dev) and CJS (`node` in production) modes on host environments like Render or Cloud Run.
*   **Zero-Config Postinstall Compilation**: The `package.json` contains a `postinstall` script that automatically invokes the production compilation pipelines on remote builds, facilitating direct, zero-effort deployment flows.
