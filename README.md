# TechHub BD Intelligence & Career Aggregator

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![React](https://img.shields.io/badge/react-19.0.1-61DAFB.svg?logo=react)
![Tailwind](https://img.shields.io/badge/tailwindcss-4.1-38B2AC.svg?logo=tailwind-css)
![Vite](https://img.shields.io/badge/vite-6.2-646CFF.svg?logo=vite)
![TypeScript](https://img.shields.io/badge/typescript-5.8-3178C6.svg?logo=typescript)

An elegant, real-time full-stack job board and career aggregator specializing in **Bangladesh Technology & Software Engineering Companies**. It live-scrapes job directories, sanitizes metadata, parses structured inputs, normalizes roles, and generates deep market analytics with predictive AI forecasting, wrapped in a clean, high-contrast visual design.

---

## ✨ Features

- **Real-Time Job Aggregation**: Live scraping of 150+ Bangladesh tech companies with native support for the **BDTechJobs** pipeline.
- **Recently Posted & Scraped Sorting**: Instant sorting of jobs by `Recently Scraped / Posted First`, `Oldest First`, `Highest Compensation`, `Senior Roles`, and `Title (A-Z)` with one-click quick pills.
- **Predictive Hiring Trend Model**: Area & Line chart forecasting quarterly job demand into 2026 across Fullstack, Backend, Frontend, DevOps, and AI/Data engineering disciplines.
- **Live Market Telemetry & Pulse**: Real-time statistics computing job category donuts, technical skill frequency bar charts, experience level radar charts, and top employer vacancy rankings.
- **Geospatial Intelligence Map**: Enhanced Leaflet-powered map supporting real-time user geolocation tracking, custom marker nodes, smooth camera animations ("flyTo"), and an interactive geocoder to locate tech hubs in Dhaka.
- **Enriched Market Analytics Dashboard**: Selective role and department filters, salary density curves, experience vs compensation benchmarks, and joint venture international origin breakdowns (USA, Japan, UK, Switzerland, Nordics).
- **Dual Directory Merging**: Live fetches, normalizes, and synthesizes developer directories from JustApply (`badhon495`) and MBSTUPC (`MBSTUPC`).
- **Advanced Filtering**: Filter by experience level, role category, company, work pattern (On-site, Hybrid, 100% Remote), salary band, and technology stack tags.

---

## 🚀 Key Architectural Features

### 1. Predictive Hiring Demand Forecasting Model
Evaluates live scraped listings and historical quarterly volume to generate predictive trendlines projecting upcoming tech demand in Bangladesh through 2026. Includes discipline filters for Fullstack, Backend, Frontend, Cloud/DevOps, and AI & Data Science.

### 2. Multi-Tier High-Fidelity Scraping Pipeline
To parse live listings from corporate sites, the aggregator processes targets using three hierarchical **Precision Tiers**:
*   **Tier 1: Schema.org JSON-LD (Precision: ~100%)**
    Traverses document headers searching for standardized JSON-LD `<script type="application/ld+json">` blobs defining `JobPosting` objects.
*   **Tier 2: State Hydration Parsing (Precision: ~90%)**
    Harvests pre-rendered React, Next, or Nuxt JSON states (such as `__NEXT_DATA__` or dynamic states) embedded in script elements before DOM hydration occurs.
*   **Tier 3: Heuristic Selector Engine (Precision: ~80%)**
    Analyzes body trees, parent densities, and anchor links to extract titles, descriptions, and direct URLs with strict validation guards.

### 3. Dual Directory Source Synthesis
Synthesizes two primary developer directories on the fly:
*   **Just Apply Directory**: Live fetched from the `badhon495/just-apply` repository. Includes recruiter emails, direct website links, and career portals.
*   **MBSTUPC Directory**: Live crawled from the `MBSTUPC/tech-companies-in-bangladesh` database. Provides team size metadata, social profile links, and primary technology stacks.

---

## 📊 Market Intelligence & Predictive Analytics
The **Advanced Analytics Dashboard** features:
*   **Predictive Hiring Trend Chart**: Interactive forecasting area chart mapping hiring volume by quarter and domain.
*   **Market Telemetry & Radar**: Experience distribution radar, technical stack demand, and top hiring employers.
*   **Geospatial Hub Map**: Interactive geographic clustering across Gulshan, Banani, Mirpur, Dhanmondi, and Uttara.
*   **Global Partner & Origins Breakdown**: Analyzes international joint ventures (Japan, USA, Switzerland, Nordics, UK, South Korea).
*   **Salary Estimator & Density Curves**: Bell curve salary distributions and custom compensation calculators (BDT).

---

## 🧹 Initial Load & State Design
To ensure optimal performance and reflect authentic data cycles:
*   **Organic Startup State**: The database caches begin with a **perfectly clean slate** on server initialization. No preload seed mock records are used.
*   **On-Demand Ingestion**: Users or administrators click **"Start Global Scan"** to dynamically fetch up-to-the-minute listings from the underlying scraping queues, compiling accurate directories from JustApply, MBSTUPC, and BDTechJobs on the fly.

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
