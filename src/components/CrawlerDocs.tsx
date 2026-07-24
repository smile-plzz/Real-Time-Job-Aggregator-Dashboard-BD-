import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, HelpCircle, CheckCircle2, AlertCircle, Sparkles, Zap, Cpu, Layers } from 'lucide-react';

export default function CrawlerDocs() {
  return (
    <div className="space-y-8" id="crawler-docs-container">
      {/* Quad Directory Merging Block */}
      <div className="bg-gradient-to-r from-indigo-50 via-white to-emerald-50 border border-indigo-100 p-6 sm:p-8 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Layers className="text-indigo-600 w-5 h-5 animate-pulse" />
          Quad-Directory &amp; Salary Telemetry Engine
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed max-w-4xl">
          To provide the most complete representation of Bangladesh's software development landscape, our system live-fetches, 
          normalizes, and merges four key industry directories and salary platforms on the fly:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-indigo-600">1. Just Apply Directory</h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Maintained by <code>badhon495</code>. Contains recruitment HR email addresses, 
              office locations, direct website links, and primary career portals for 150+ Bangladeshi IT companies.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-violet-600">2. MBSTUPC Directory</h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Open-source database contributing critical metadata including engineering team size metrics, social profiles, 
              and primary technology stacks.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-emerald-600">3. Bangladesh Yellow Pages</h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Parsed from <code>Computer_software_solution</code> category. Contributes verified telephone numbers, 
              Banani/Uttara/Mirpur office addresses, and custom enterprise software categories.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-teal-600">4. Betonkemon ("বেতন কেমন?")</h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Crawls <code>betonkemon.com</code> salary transparency submissions. Contributes crowdsourced developer compensation 
              data, experience salary curves, and tech stack salary premiums.
            </p>
          </div>
        </div>
        <p className="text-[11px] text-gray-500 italic leading-relaxed">
          * How the merge works: The server normalizes company names (ignoring punctuation and suffixes like Ltd / PLC), maps keys, 
          enriches contact emails, phone numbers, and salary benchmarks into a single unified directory.
        </p>
      </div>

      {/* Predictive Hiring Forecasting & Telemetry Block */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-orange-50 border border-amber-100 p-6 sm:p-8 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Zap className="text-amber-600 w-5 h-5 animate-pulse" />
          Predictive Hiring &amp; Telemetry Forecasting Engine
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed max-w-4xl">
          The system evaluates active job listings, skill co-occurrence, and company category distributions to project 
          upcoming hiring demand trajectories into 2026:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-amber-600">1. Historical Growth Trajectory</h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Calculates quarterly volume baselines across Fullstack, Backend, Frontend, DevOps, and AI roles to establish baseline momentum.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-orange-600">2. Predictive Extrapolation Model</h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Projects upcoming quarterly hiring needs (Q1–Q4 2026), highlighting domain acceleration factors such as AI/Data +120% YoY growth.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-indigo-600">3. Real-Time Market Pulse</h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Dynamic radar charts, salary density bell curves, and employer activity rankings computed directly from live scraped data.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics & Geospatial Engine Block */}
      <div className="bg-gradient-to-r from-emerald-50 via-white to-teal-50 border border-emerald-100 p-6 sm:p-8 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="text-emerald-600 w-5 h-5 animate-pulse" />
          Analytics &amp; Geospatial Engine
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed max-w-4xl">
          Beyond raw job aggregation, the engine processes location data and job metadata to generate rich market insights:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-emerald-600">Geospatial Distribution Map</h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Using Leaflet and geocoding heuristics, the system places tech companies on an interactive map of Dhaka, 
              allowing users to visualize tech hubs (e.g., Banani, Gulshan, Dhanmondi) and discover local opportunities.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-teal-400">Telemetry &amp; Salary Estimation</h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              The analytics dashboard parses job metadata to estimate salary brackets (BDT), work modes (Remote/Hybrid/On-site), 
              and tracks the demand for specific technology stacks across all indexed roles in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Section */}
      <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Cpu className="text-indigo-600 w-5 h-5" />
            Live Scraper Pipeline Visualizer
          </h3>
          <p className="text-xs text-gray-600">
            A step-by-step breakdown of how the backend executes scraper runs when initiated.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative">
          {[
            { step: "01", name: "URL Sanitizer", desc: "Corrects protocols, splits semicolon aggregates, validates schema rules." },
            { step: "02", name: "Network Fetch", desc: "Emits a header-disguised server request. Handles redirects & SSL expires." },
            { step: "03", name: "Extract JSON/DOM", desc: "Searches JSON-LD schemas first, falls back to hydration states & ASTs." },
            { step: "04", name: "Heuristic Score", desc: "Applies CSS selectors for job titles, links, and compensation values." },
            { step: "05", name: "Job Structuring", desc: "Classifies technologies into indexable categories with metadata." }
          ].map((item, idx) => (
            <div key={item.step} className="bg-white border border-gray-200 p-4 rounded-xl relative group hover:border-gray-300 transition-all">
              <div className="absolute top-2 right-2 text-[10px] font-mono font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                {item.step}
              </div>
              <h4 className="text-xs font-bold text-gray-900 mt-2">{item.name}</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed mt-1">{item.desc}</p>
              {idx < 4 && (
                <div className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 text-gray-200">
                  ➔
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* The 3 Precision Tiers explained */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="text-emerald-500 w-5 h-5" />
          The Three Extraction Precision Tiers
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed max-w-4xl">
          The Aggregator separates crawl results into distinct precision groups, allowing you to instantly assess the accuracy 
          of any scraped job listing displayed on the Jobs Board.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-emerald-500/20 p-5 rounded-2xl space-y-2 relative">
            <div className="absolute top-3 right-3 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Tier 1
            </div>
            <h4 className="text-sm font-bold text-gray-900">Schema JSON-LD</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Standardized Structured Data payloads embedded in page headers. Extracted directly using official W3C and Schema.org 
              <code>JobPosting</code> definitions, resulting in near-perfect 100% extraction precision.
            </p>
          </div>

          <div className="bg-white border border-blue-500/20 p-5 rounded-2xl space-y-2 relative">
            <div className="absolute top-3 right-3 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
              Tier 2
            </div>
            <h4 className="text-sm font-bold text-gray-900">Hydration States</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Extracted from raw server-rendered script variables (such as <code>__NEXT_DATA__</code> or Nuxt State caches). 
              Highly accurate since the raw structured state of application listings is harvested before DOM rendering.
            </p>
          </div>

          <div className="bg-white border border-indigo-500/20 p-5 rounded-2xl space-y-2 relative">
            <div className="absolute top-3 right-3 text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              Tier 3
            </div>
            <h4 className="text-sm font-bold text-gray-900">Heuristic Engine</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Generated by traversing the DOM body tree structure, calculating element scores, class names, and standard 
              job-related patterns. Fast and covers highly legacy non-standard layouts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
