import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, ShieldCheck, HelpCircle, FileCode, CheckCircle2, AlertCircle, Sparkles, Zap, Cpu, Terminal, Layers } from 'lucide-react';

export default function CrawlerDocs() {
  return (
    <div className="space-y-8" id="crawler-docs-container">
      {/* Hero Welcome banner */}
      <div className="bg-gradient-to-br from-[#161B22] to-[#0D1117] border border-[#30363d] p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            System Architecture & Documentation
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            High-Fidelity Heuristic Crawler Engine
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Learn how this application live-scrapes job directories across <strong>Bangladesh Tech Companies</strong>. 
            Below is the technical specification of the multi-path routing, error-resilience logic, and precision classification pipelines.
          </p>
        </div>
      </div>

      {/* Grid of the 4 Key Fixes Implemented */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0D1117] border border-[#161B22] p-6 rounded-2xl space-y-4">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-200">1. Expired TLS/SSL Graceful Bypass</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Smaller corporate career hubs frequently suffer from expired SSL certificates (such as <code>creativeitsoft.net</code>). 
            To prevent execution-level exceptions, the crawler automatically bypasses strict TLS verification in a safe scraper environment using a custom bypass:
          </p>
          <pre className="p-3 bg-[#070A0F] border border-[#161B22] rounded-xl text-[10px] font-mono text-slate-400 overflow-x-auto">
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
          </pre>
        </div>

        <div className="bg-[#0D1117] border border-[#161B22] p-6 rounded-2xl space-y-4">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <FileCode className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-200">2. Semicolon &amp; Comma URL Splitting</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Some directory listings bundle multiple career domain names separated by punctuation characters (for example, 
            <code>people.aamra.com.bd; aamratechnologies.com/career</code>). The engine split-parses this field, extracts the 
            preferred segment, and formats the URL structure defensively:
          </p>
          <pre className="p-3 bg-[#070A0F] border border-[#161B22] rounded-xl text-[10px] font-mono text-slate-400 overflow-x-auto">
            const parts = url.split(/[;,|]/).map(p =&gt; p.trim());
          </pre>
        </div>

        <div className="bg-[#0D1117] border border-[#161B22] p-6 rounded-2xl space-y-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-200">3. Multi-Path Probe Suffixes</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            When career endpoints return empty lists, the engine initiates domain-level discovery using popular paths. 
            In <strong>Heuristic Scan Mode</strong>, these alternative endpoints are probed in parallel to discover previously invisible job listings:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {['/career', '/careers', '/jobs', '/vacancies'].map((suffix) => (
              <span key={suffix} className="px-2 py-0.5 rounded bg-[#161B22] text-[10px] text-slate-300 font-mono border border-[#30363d]">
                {suffix}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[#0D1117] border border-[#161B22] p-6 rounded-2xl space-y-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-200">4. Title Categorization Regular Expressions</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Extracted listings are mapped using custom Regular Expressions to normalize category designations for search, 
            adding fine-grained support for modern frameworks (e.g., MERN, React Native, Flutter, Shopify, and IT Systems).
          </p>
          <pre className="p-3 bg-[#070A0F] border border-[#161B22] rounded-xl text-[10px] font-mono text-slate-400 overflow-x-auto">
            {`// Normalizes categorizations like 'WordPress' -> 'frontend'
if (t.includes('wordpress') || t.includes('shopify')) 
  return 'frontend';`}
          </pre>
        </div>
      </div>

      {/* Dual Directory Merging Block */}
      <div className="bg-gradient-to-r from-indigo-950/20 via-[#0D1117] to-violet-950/20 border border-indigo-500/15 p-6 sm:p-8 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Layers className="text-indigo-400 w-5 h-5 animate-pulse" />
          Dual-Directory Synchronization Engine
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
          To provide the most complete representation of Bangladesh's software development landscape, our system live-fetches, 
          normalizes, and merges two dominant developer directories on the fly:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#070A0F] border border-[#161B22] p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-indigo-400">1. Just Apply Directory</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Maintained by <code>badhon495</code>. This contains high-integrity recruitment email addresses (HR/recruiter), 
              office directions, direct website links, and primary career portals for over 150+ Bangladeshi IT companies.
            </p>
          </div>
          <div className="bg-[#070A0F] border border-[#161B22] p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-violet-400">2. MBSTUPC Directory</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              A comprehensive open-source database of tech companies in Bangladesh. It contributes critical metadata 
              including team sizes (engineer counts), social profile links (Facebook, Twitter), and direct list of technology stacks.
            </p>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 italic leading-relaxed">
          * How the merge works: The server normalizes names (e.g. ignoring case, punctuation, and generic suffixes), maps keys, 
          enriches Just Apply contacts with MBSTUPC team size/tech attributes, and appends unique listings only present in one source.
        </p>
      </div>

      {/* Analytics & Geospatial Engine Block */}
      <div className="bg-gradient-to-r from-emerald-950/20 via-[#0D1117] to-teal-950/20 border border-emerald-500/15 p-6 sm:p-8 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="text-emerald-400 w-5 h-5 animate-pulse" />
          Analytics &amp; Geospatial Engine
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
          Beyond raw job aggregation, the engine processes location data and job metadata to generate rich market insights:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#070A0F] border border-[#161B22] p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-emerald-400">Geospatial Distribution Map</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Using Leaflet and geocoding heuristics, the system places tech companies on an interactive map of Dhaka, 
              allowing users to visualize tech hubs (e.g., Banani, Gulshan, Dhanmondi) and discover local opportunities.
            </p>
          </div>
          <div className="bg-[#070A0F] border border-[#161B22] p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-teal-400">Telemetry &amp; Salary Estimation</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              The analytics dashboard parses job metadata to estimate salary brackets (BDT), work modes (Remote/Hybrid/On-site), 
              and tracks the demand for specific technology stacks across all indexed roles in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Section */}
      <div className="bg-[#0D1117] border border-[#161B22] p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="text-indigo-400 w-5 h-5" />
            Live Scraper Pipeline Visualizer
          </h3>
          <p className="text-xs text-slate-400">
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
            <div key={item.step} className="bg-[#0A0C10] border border-[#161B22] p-4 rounded-xl relative group hover:border-[#30363d] transition-all">
              <div className="absolute top-2 right-2 text-[10px] font-mono font-bold text-slate-600 group-hover:text-indigo-400 transition-colors">
                {item.step}
              </div>
              <h4 className="text-xs font-bold text-slate-200 mt-2">{item.name}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{item.desc}</p>
              {idx < 4 && (
                <div className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 text-[#30363d]">
                  ➔
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* The 3 Precision Tiers explained */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="text-emerald-500 w-5 h-5" />
          The Three Extraction Precision Tiers
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
          The Aggregator separates crawl results into distinct precision groups, allowing you to instantly assess the accuracy 
          of any scraped job listing displayed on the Jobs Board.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0D1117] border border-emerald-500/20 p-5 rounded-2xl space-y-2 relative">
            <div className="absolute top-3 right-3 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Tier 1
            </div>
            <h4 className="text-sm font-bold text-slate-200">Schema JSON-LD</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standardized Structured Data payloads embedded in page headers. Extracted directly using official W3C and Schema.org 
              <code>JobPosting</code> definitions, resulting in near-perfect 100% extraction precision.
            </p>
          </div>

          <div className="bg-[#0D1117] border border-blue-500/20 p-5 rounded-2xl space-y-2 relative">
            <div className="absolute top-3 right-3 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
              Tier 2
            </div>
            <h4 className="text-sm font-bold text-slate-200">Hydration States</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracted from raw server-rendered script variables (such as <code>__NEXT_DATA__</code> or Nuxt State caches). 
              Highly accurate since the raw structured state of application listings is harvested before DOM rendering.
            </p>
          </div>

          <div className="bg-[#0D1117] border border-indigo-500/20 p-5 rounded-2xl space-y-2 relative">
            <div className="absolute top-3 right-3 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              Tier 3
            </div>
            <h4 className="text-sm font-bold text-slate-200">Heuristic Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generated by traversing the DOM body tree structure, calculating element scores, class names, and standard 
              job-related patterns. Fast and covers highly legacy non-standard layouts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
