# TechHub BD Intelligence & Career Aggregator

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![React](https://img.shields.io/badge/react-19.0.1-61DAFB.svg?logo=react)
![Tailwind](https://img.shields.io/badge/tailwindcss-4.1-38B2AC.svg?logo=tailwind-css)
![Vite](https://img.shields.io/badge/vite-6.2-646CFF.svg?logo=vite)
![TypeScript](https://img.shields.io/badge/typescript-5.8-3178C6.svg?logo=typescript)

An elegant, real-time full-stack job board and career aggregator specializing in **Bangladesh Technology & Software Engineering Companies**. It live-scrapes job directories, sanitizes metadata, parses structured inputs, normalizes roles, provides instant email digest distribution with attached CSV reports, and generates deep market analytics with predictive AI forecasting, wrapped in a clean, high-contrast visual design.

---

## ✨ Features

- **Real-Time Job Aggregation**: Live scraping of 150+ Bangladesh tech companies with native support for the **BDTechJobs** pipeline.
- **Instant Email Digest & CSV Export**: Customizable email job newsletter system powered by Resend API that delivers filtered HTML digests directly to recipient inboxes with full `.csv` datasets attached for easy spreadsheet analysis.
- **Refined Data Export & Distribution Hub**: Download scraped job listings in CSV format, JSON payloads, or formatted Markdown reports with multi-criteria filtering (experience level, department, work mode).
- **Recently Posted & Scraped Sorting**: Instant sorting of jobs by `Recently Scraped / Posted First`, `Oldest First`, `Highest Compensation`, `Senior Roles`, and `Title (A-Z)`.
- **Predictive Hiring Trend Model**: Area & Line chart forecasting quarterly job demand into 2026 across Fullstack, Backend, Frontend, Cloud/DevOps, and AI/Data engineering disciplines.
- **Live Market Telemetry & Pulse**: Real-time statistics computing job category donuts, technical skill frequency bar charts, experience level radar charts, and top employer vacancy rankings.
- **Geospatial Intelligence Map**: Enhanced Leaflet-powered map supporting real-time user geolocation tracking, custom marker nodes, smooth camera animations ("flyTo"), and an interactive geocoder to locate tech hubs in Dhaka (Gulshan, Banani, Uttara, Dhanmondi).
- **Triple Directory Merging**: Live fetches, normalizes, and synthesizes developer directories from JustApply (`badhon495`), MBSTUPC (`MBSTUPC`), and Bangladesh Yellow Pages (`Computer_software_solution`).
- **Multi-Aspect Filtering**: Filter by experience level, role category, company, work pattern (On-site, Hybrid, 100% Remote), salary band, technology stack tags, and search query.

---

## 🚀 Key Architectural Features

### 1. Instant Email Digest & CSV Dispatch Engine
- **Resend API Integration**: Dispatches formatted HTML email newsletters containing custom-filtered job listings.
- **Automated CSV Attachment**: Converts matching job entries into standardized CSV format on the fly and attaches them directly to outgoing email dispatches.
- **Interactive Controls**: Features live HTML/visual preview modes, search keyword filtering, category selection, experience level controls, and one-click direct CSV spreadsheet downloads.

### 2. Predictive Hiring Demand Forecasting Model
Evaluates live scraped listings and historical quarterly volume to generate predictive trendlines projecting upcoming tech demand in Bangladesh through 2026. Includes discipline filters for Fullstack, Backend, Frontend, Cloud/DevOps, and AI & Data Science.

### 3. Multi-Tier High-Fidelity Scraping Pipeline
Processes target portals using three hierarchical **Precision Tiers**:
*   **Tier 1: Schema.org JSON-LD (Precision: ~100%)**
    Traverses document headers searching for standardized JSON-LD `<script type="application/ld+json">` blobs defining `JobPosting` objects.
*   **Tier 2: State Hydration Parsing (Precision: ~90%)**
    Harvests pre-rendered React, Next, or Nuxt JSON states (such as `__NEXT_DATA__` or dynamic states) embedded in script elements before DOM hydration occurs.
*   **Tier 3: Heuristic Selector Engine (Precision: ~80%)**
    Analyzes body trees, parent densities, and anchor links to extract titles, descriptions, and direct URLs with strict validation guards.

### 4. Triple Directory Source Synthesis
Synthesizes three primary developer directories on the fly:
*   **Just Apply Directory**: Live fetched from the `badhon495/just-apply` repository. Includes recruiter emails, direct website links, and career portals.
*   **MBSTUPC Directory**: Live crawled from the `MBSTUPC/tech-companies-in-bangladesh` database. Provides team size metadata, social profile links, and primary technology stacks.
*   **Bangladesh Yellow Pages**: Live parsed from the `Computer_software_solution` category directory. Adds verified office phone numbers, Banani/Uttara/Khilkhet office addresses, and software solution classifications.

---

## 📊 Market Intelligence & Export Center
- **Data Export Center**: Download refined job datasets in CSV format, JSON payloads, or Markdown summary reports.
- **Predictive Hiring Trend Chart**: Interactive forecasting area chart mapping hiring volume by quarter and domain.
- **Market Telemetry & Radar**: Experience distribution radar, technical stack demand, and top hiring employers.
- **Geospatial Hub Map**: Interactive geographic clustering across Gulshan, Banani, Mirpur, Dhanmondi, and Uttara.
- **Global Partner & Origins Breakdown**: Analyzes international joint ventures (Japan, USA, Switzerland, Nordics, UK, South Korea).

---

## 📦 Getting Started

### Installation
Install dependencies:
```bash
npm install
```

### Development Server
Boot the full-stack server (Express backend + Vite HMR frontend):
```bash
npm run dev
```

### Production Build & Deployment
Bundle client assets using Vite and transpile the Express server into a standalone bundled `.cjs` script using `esbuild`:
```bash
npm run build
npm start
```

### ☁️ Environment Configuration
To enable live email delivery via Resend, set the API key in `.env`:
```env
RESEND_API_KEY=re_your_resend_api_key_here
```
*(If omitted, the app gracefully operates in email preview mode with instant CSV file download support).*

