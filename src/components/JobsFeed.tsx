/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Briefcase, Calendar, ChevronRight, Sparkles, SlidersHorizontal, Filter, X, Cpu, Zap, RefreshCw, Flame, CheckCircle2, AlertTriangle, AlertCircle, XCircle, ShieldCheck, Check, HelpCircle, Building, ShieldAlert } from 'lucide-react';
import { Job, Company, validateJob } from '../types';

interface JobsFeedProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onOpenAddModal: () => void;
  companies: Company[];
  bulkScraping: boolean;
  onBulkScrape: (companies: Company[], heuristic?: boolean) => void;
}

export default function JobsFeed({ 
  jobs, 
  onSelectJob, 
  onOpenAddModal, 
  companies = [], 
  bulkScraping = false, 
  onBulkScrape 
}: JobsFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [salaryFilter, setSalaryFilter] = useState('all');
  const [selectedSkillTag, setSelectedSkillTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [activeInfoKey, setActiveInfoKey] = useState<string | null>(null);

  // Categories mapping for UI badging
  const categoryLabels: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    fullstack: 'Fullstack',
    mobile: 'Mobile',
    devops: 'DevOps & Infra',
    qa: 'QA & Testing',
    product: 'Product',
    design: 'Design',
    other: 'General'
  };

  const categoryColors: Record<string, string> = {
    frontend: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    backend: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    fullstack: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    mobile: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    devops: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    qa: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    product: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    design: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    other: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  const experienceLabels: Record<string, string> = {
    intern: 'Internship',
    junior: 'Junior (1-2 yrs)',
    mid: 'Mid-Level',
    senior: 'Senior (5+ yrs)',
    lead: 'Lead / Principal',
    unspecified: 'Unspecified'
  };

  const experienceColors: Record<string, string> = {
    intern: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    junior: 'bg-[#161B22] text-slate-300 border-slate-700/50',
    mid: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    senior: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    lead: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    unspecified: 'bg-[#161B22] text-slate-500 border-slate-800'
  };

  // Get unique companies from active jobs
  const companiesList = Array.from(new Set(jobs.map(j => j.companyName))).sort();

  // Curate trending/popular hot technology tags based on active jobs frequency, or fallback to standard ones
  const popularTechSkills = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(job => {
      (job.skills || []).forEach(skill => {
        const norm = skill.trim();
        counts[norm] = (counts[norm] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [jobs]);

  // Handle clearing all active filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setExperienceFilter('all');
    setCompanyFilter('all');
    setJobTypeFilter('all');
    setSalaryFilter('all');
    setSelectedSkillTag(null);
  };

  // Parsing salary boundaries for filter selection
  const matchesSalaryBracket = (job: Job) => {
    if (salaryFilter === 'all') return true;
    const salary = (job.salary || '').toLowerCase();
    
    if (salaryFilter === 'negotiable') {
      return salary.includes('negotiable') || salary === '';
    }

    // Extract numbers from BDT range strings
    const numbers = salary.match(/\d[\d,.]*/g);
    if (!numbers || numbers.length === 0) {
      return salaryFilter === 'negotiable';
    }

    const lastNum = parseInt(numbers[numbers.length - 1].replace(/[^0-9]/g, ''), 10) || 0;

    if (salaryFilter === 'high') {
      return lastNum >= 100000;
    }
    if (salaryFilter === 'mid') {
      return lastNum >= 50000 && lastNum < 100000;
    }
    if (salaryFilter === 'low') {
      return lastNum > 0 && lastNum < 50000;
    }
    return true;
  };

  // Match Job Type helper
  const matchesJobType = (job: Job) => {
    if (jobTypeFilter === 'all') return true;
    const type = job.type.toLowerCase();
    const filter = jobTypeFilter.toLowerCase();
    
    if (filter === 'remote') {
      return type.includes('remote') || (job.location && job.location.toLowerCase().includes('remote'));
    }
    if (filter === 'hybrid') {
      return type.includes('hybrid') || (job.location && job.location.toLowerCase().includes('hybrid'));
    }
    if (filter === 'internship') {
      return type.includes('intern') || job.experienceLevel === 'intern';
    }
    if (filter === 'fulltime') {
      return type.includes('full') || type.includes('permanent');
    }
    return true;
  };

  // Apply filtering rules in memory
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      (job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.skills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.summary && job.summary.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
    const matchesExperience = experienceFilter === 'all' || job.experienceLevel === experienceFilter;
    const matchesCompany = companyFilter === 'all' || job.companyName === companyFilter;
    
    const matchesSelectedSkill = !selectedSkillTag || 
      job.skills.some(s => s.toLowerCase() === selectedSkillTag.toLowerCase());

    return matchesSearch && matchesCategory && matchesExperience && matchesCompany && matchesSelectedSkill && matchesSalaryBracket(job) && matchesJobType(job);
  });

  // Calculate maximum salary helper for precise sorting
  const getMaxSalary = (job: Job) => {
    const salaryStr = job.salary;
    if (!salaryStr) return 0;
    const numbers = salaryStr.match(/\d[\d,.]*/g);
    if (numbers && numbers.length > 0) {
      return parseInt(numbers[numbers.length - 1].replace(/[^0-9]/g, ''), 10) || 0;
    }
    return 0;
  };

  // Calculate seniority weight for sorting
  const getSeniorityWeight = (level: string) => {
    const weights: Record<string, number> = {
      lead: 5,
      senior: 4,
      mid: 3,
      junior: 2,
      intern: 1,
      unspecified: 0
    };
    return weights[level] || 0;
  };

  const isLowConfidence = (job: Job) => {
    const issues = validateJob(job);
    return issues.some(issue => issue.type === 'error' || issue.type === 'warning');
  };

  // Apply sorting rules
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const aLow = isLowConfidence(a);
    const bLow = isLowConfidence(b);
    if (aLow && !bLow) return 1;
    if (!aLow && bLow) return -1;

    if (sortBy === 'newest') {
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    } else if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'salary-desc') {
      return getMaxSalary(b) - getMaxSalary(a);
    } else if (sortBy === 'experience-desc') {
      return getSeniorityWeight(b.experienceLevel) - getSeniorityWeight(a.experienceLevel);
    }
    return 0;
  });

  const isFiltersActive = searchQuery !== '' || 
    categoryFilter !== 'all' || 
    experienceFilter !== 'all' || 
    companyFilter !== 'all' || 
    jobTypeFilter !== 'all' || 
    salaryFilter !== 'all' || 
    selectedSkillTag !== null;

  // Format relative date for listing cards
  const formatTimeAgo = (isoString: string) => {
    const addedDate = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - addedDate.getTime();
    const diffHrs = Math.floor(diffMs / (3600000));
    
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-6" id="jobs-aggregator-section">
      {/* Feed Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 fill-indigo-500/20" />
            Consolidated Aggregated Jobs Feed
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time scraped openings from active company careers. Updated live.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            + Add Manual Listing
          </button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-[#0D1117] border border-[#161B22] rounded-xl text-xs font-semibold text-slate-300 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="alphabetical">Job Title A-Z</option>
            <option value="salary-desc">Highest Salary (Est.)</option>
            <option value="experience-desc">Senior &amp; Lead First</option>
          </select>
        </div>
      </div>

      {/* Live Scraper Panel */}
      <div className="bg-[#0D1117] border border-[#161B22] p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative overflow-hidden" id="jobs-scraper-panel">
        {/* Decorative ambient gradient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${bulkScraping ? 'bg-indigo-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${bulkScraping ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Dynamic Career Scraper Controller
            </h3>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {bulkScraping 
              ? "Running career board crawls across the directory. Finding new vacancies using structural selectors and multi-path heuristics..." 
              : "Scan company directories to aggregate active vacancies live from their actual careers pages using deep parsing."}
          </p>

          {/* List current company scanning, if any */}
          {bulkScraping ? (
            <div className="mt-3 flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-slate-500 font-mono">Current Activity:</span>
              {companies.filter(c => c.scrapeStatus === 'scraping').slice(0, 3).map(c => (
                <span key={c.name} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin text-indigo-400" />
                  Crawling {c.name}
                </span>
              ))}
              {companies.filter(c => c.scrapeStatus === 'scraping').length > 3 && (
                <span className="text-[10px] font-mono text-slate-500 px-1">
                  +{companies.filter(c => c.scrapeStatus === 'scraping').length - 3} more
                </span>
              )}
            </div>
          ) : (
            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/80" />
              <span>Scraper Engine Idle. Ready to audit <strong>{companies.length} Bangladesh Tech Companies</strong> directories.</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
          <button
            onClick={() => onBulkScrape && onBulkScrape(companies, false)}
            disabled={bulkScraping}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              bulkScraping 
                ? 'bg-[#161B22]/50 border-[#161B22] text-slate-500 cursor-not-allowed'
                : 'bg-[#161B22] hover:bg-[#21262d] text-slate-100 border-[#30363d] shadow-sm hover:border-slate-500'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 text-amber-400 ${bulkScraping ? 'opacity-40' : 'animate-bounce'}`} />
            Scan All (Fast)
          </button>

          <button
            onClick={() => onBulkScrape && onBulkScrape(companies, true)}
            disabled={bulkScraping}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              bulkScraping 
                ? 'bg-[#161B22]/50 border-[#161B22] text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-indigo-500/30 shadow-md shadow-indigo-900/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            Heuristic Scan All (Deep Crawl)
          </button>
        </div>
      </div>

      {/* Advanced Filtering Control Panel */}
      <div className="bg-[#0D1117] p-5 rounded-2xl border border-[#161B22] shadow-xs space-y-4" id="jobs-filters-panel">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Advanced Filter Toolkit
          </span>
          {isFiltersActive && (
            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold normal-case">
              {filteredJobs.length} matches filtered
            </span>
          )}
        </div>

        {/* Primary Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search title, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs placeholder-slate-500 text-slate-200 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/40 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/40 cursor-pointer transition-all"
          >
            <option value="all">All Departments / Roles</option>
            {Object.entries(categoryLabels).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>

          {/* Experience Dropdown */}
          <select
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/40 cursor-pointer transition-all"
          >
            <option value="all">All Experience Levels</option>
            {Object.entries(experienceLabels).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>

          {/* Company Dropdown */}
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/40 cursor-pointer transition-all"
          >
            <option value="all">All Companies ({companiesList.length})</option>
            {companiesList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Job Type Dropdown */}
          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/40 cursor-pointer transition-all"
          >
            <option value="all">All Work Types</option>
            <option value="fulltime">Full-time Roles</option>
            <option value="remote">Remote Roles</option>
            <option value="hybrid">Hybrid Roles</option>
            <option value="internship">Internships</option>
          </select>

          {/* Salary Filter */}
          <select
            value={salaryFilter}
            onChange={(e) => setSalaryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/40 cursor-pointer transition-all"
          >
            <option value="all">All Salary Levels</option>
            <option value="high">High Budget (BDT 100K+)</option>
            <option value="mid">Mid Budget (BDT 50K - 100K)</option>
            <option value="low">Entry Budget (BDT &lt; 50K)</option>
            <option value="negotiable">Negotiable Salary</option>
          </select>
        </div>

        {/* Tactical Quick-Search Trending Skill Badges */}
        {popularTechSkills.length > 0 && (
          <div className="pt-2 border-t border-[#161B22]/50 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none" id="jobs-skills-quickfilter">
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase shrink-0">
              Hot Tech stacks:
            </span>
            <div className="flex items-center gap-1.5">
              {popularTechSkills.map(tech => {
                const isSelected = selectedSkillTag?.toLowerCase() === tech.name.toLowerCase();
                return (
                  <button
                    key={tech.name}
                    onClick={() => setSelectedSkillTag(isSelected ? null : tech.name)}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500'
                        : 'bg-[#0A0C10] text-slate-400 border-[#161B22] hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{tech.name}</span>
                    <span className={`text-[8px] font-bold px-1 rounded-sm ${
                      isSelected ? 'bg-indigo-500/35 text-indigo-300' : 'bg-[#161B22] text-slate-500'
                    }`}>
                      {tech.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Clear Filter Toolbar */}
        {isFiltersActive && (
          <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#161B22]" id="active-filters-toolbar">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Active filters on
              </span>
              <span className="text-[10px] bg-[#161B22] text-slate-300 border border-[#30363d] px-2.5 py-0.5 rounded-full font-semibold">
                {sortedJobs.length} match{sortedJobs.length !== 1 ? 'es' : ''} found
              </span>
            </div>
            
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Jobs Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="jobs-grid">
        <AnimatePresence mode="popLayout">
          {sortedJobs.length > 0 ? (
            sortedJobs.map((job, index) => {
              const issues = validateJob(job);
              const errors = issues.filter(i => i.type === 'error');
              const warnings = issues.filter(i => i.type === 'warning');
              
              let auditBadge = null;
              if (errors.length > 0) {
                auditBadge = (
                  <span title={`${errors.length} Critical errors flagged`} className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded flex-shrink-0 font-mono">
                    <XCircle className="w-2.5 h-2.5" />
                    Failed ({errors.length})
                  </span>
                );
              } else if (warnings.length > 0) {
                auditBadge = (
                  <span title={`${warnings.length} Warnings flagged`} className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded flex-shrink-0 font-mono">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    Warning ({warnings.length})
                  </span>
                );
              } else {
                auditBadge = (
                  <span title="High fidelity verification passed" className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex-shrink-0 font-mono">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Verified
                  </span>
                );
              }
              
              return (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -8 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }}
                onClick={() => onSelectJob(job)}
                className="bg-[#0D1117] border border-[#161B22] rounded-2xl hover:border-indigo-500/35 transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className={`absolute top-0 left-0 w-1.5 h-full transition-all ${
                  errors.length > 0 
                    ? 'bg-rose-500/50 group-hover:bg-rose-500' 
                    : warnings.length > 0 
                    ? 'bg-amber-500/50 group-hover:bg-amber-500' 
                    : 'bg-emerald-500/20 group-hover:bg-emerald-500'
                }`} />
                <div>
                  {/* Top Details Row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 group-hover:text-indigo-400 transition-colors">
                          {job.companyName}
                        </span>
                        {auditBadge}
                      </div>
                      <h3 className="text-base font-semibold text-slate-100 tracking-tight leading-snug group-hover:text-white mt-0.5">
                        {job.title}
                      </h3>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 self-start whitespace-nowrap bg-[#0A0C10] border border-[#161B22] px-2 py-0.5 rounded-full">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatTimeAgo(job.dateAdded)}
                    </span>
                  </div>

                  {/* Summary / Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {job.summary || "No description loaded."}
                  </p>

                  {/* Badges / Meta tags Row */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${categoryColors[job.category]}`}>
                      {categoryLabels[job.category]}
                    </span>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${experienceColors[job.experienceLevel]}`}>
                      {experienceLabels[job.experienceLevel]}
                    </span>

                    <span className="text-[10px] font-semibold text-slate-300 bg-[#161B22] border border-[#30363d] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-500" />
                      {job.type}
                    </span>

                    <span className="text-[10px] font-semibold text-slate-300 bg-[#161B22] border border-[#30363d] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {job.location}
                    </span>
                  </div>
                </div>

                {/* Footer Section with Skills and CTA */}
                <div className="pt-4 border-t border-[#161B22] flex items-center justify-between gap-2 mt-auto">
                  {/* Skill Badges */}
                  <div className="flex flex-wrap gap-1 items-center overflow-hidden max-h-6">
                    {(job.skills || []).slice(0, 3).map((skill, idx) => (
                      <span key={`${skill}-${idx}`} className="text-[10px] font-mono font-medium text-slate-400 bg-[#0A0C10] px-2 py-0.5 rounded-md border border-[#161B22]">
                        {skill}
                      </span>
                    ))}
                    {(job.skills || []).length > 3 && (
                      <span className="text-[9px] text-slate-500 font-bold font-mono px-1">
                        +{(job.skills || []).length - 3}
                      </span>
                    )}
                  </div>

                  {/* Apply / Navigate CTA */}
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-indigo-400 flex items-center gap-0.5 transition-colors shrink-0">
                    Details
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </motion.div>
            )})
          ) : (
            <div className="md:col-span-2 bg-[#0D1117] border border-[#161B22] rounded-3xl p-6 sm:p-10 flex flex-col items-center text-center relative overflow-hidden" id="guided-onboarding-launchpad">
              {/* Background ambient lighting */}
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-2xl space-y-6 z-10">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                  <Cpu className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                    Bangladesh Tech Careers Aggregator
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Rather than displaying stale, preloaded demo data, this workspace initializes empty for 100% accurate results. To begin aggregating actual active vacancies from local company careers directories, trigger the live scanner below.
                  </p>
                </div>

                {/* Info Buttons Grid with Active Expanded Descriptions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                  <div className="flex flex-col border border-[#161B22] bg-[#0A0C10]/60 p-4 rounded-xl transition-all hover:border-[#30363d]/50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-200">400+ Tech Directories</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setActiveInfoKey(activeInfoKey === 'directory' ? null : 'directory')}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded cursor-pointer transition-colors whitespace-nowrap"
                      >
                        {activeInfoKey === 'directory' ? 'Hide' : 'Info'}
                      </button>
                    </div>
                    {activeInfoKey === 'directory' ? (
                      <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed border-t border-[#161B22] pt-2">
                        Our index is populated in real time from the community-driven list of verified software teams, design agencies, and tech employers in Bangladesh.
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 mt-1">Compiled from verified local employer catalogs.</p>
                    )}
                  </div>

                  <div className="flex flex-col border border-[#161B22] bg-[#0A0C10]/60 p-4 rounded-xl transition-all hover:border-[#30363d]/50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-200">Multi-Tier Crawler</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setActiveInfoKey(activeInfoKey === 'scraper' ? null : 'scraper')}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded cursor-pointer transition-colors whitespace-nowrap"
                      >
                        {activeInfoKey === 'scraper' ? 'Hide' : 'Info'}
                      </button>
                    </div>
                    {activeInfoKey === 'scraper' ? (
                      <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed border-t border-[#161B22] pt-2">
                        The live scraper queries target job portals. It prioritizes semantic <strong>JSON-LD</strong> microdata first, next extracts <strong>Next/Nuxt hydration state</strong> variables, and uses selector heuristics as a final fallback.
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 mt-1">Direct server-side crawler with fallback selector parses.</p>
                    )}
                  </div>

                  <div className="flex flex-col border border-[#161B22] bg-[#0A0C10]/60 p-4 rounded-xl transition-all hover:border-[#30363d]/50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-200">Listing Fidelity Auditing</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setActiveInfoKey(activeInfoKey === 'auditing' ? null : 'auditing')}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded cursor-pointer transition-colors whitespace-nowrap"
                      >
                        {activeInfoKey === 'auditing' ? 'Hide' : 'Info'}
                      </button>
                    </div>
                    {activeInfoKey === 'auditing' ? (
                      <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed border-t border-[#161B22] pt-2">
                        To assure extraction fidelity, every single vacancy undergoes automated validation checks for missing descriptions, placeholder links, generic titles, or empty skill mappings.
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 mt-1">Automatic flagging for incomplete or suspicious listings.</p>
                    )}
                  </div>

                  <div className="flex flex-col border border-[#161B22] bg-[#0A0C10]/60 p-4 rounded-xl transition-all hover:border-[#30363d]/50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-200">Interactive Control Tab</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setActiveInfoKey(activeInfoKey === 'interactive' ? null : 'interactive')}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded cursor-pointer transition-colors whitespace-nowrap"
                      >
                        {activeInfoKey === 'interactive' ? 'Hide' : 'Info'}
                      </button>
                    </div>
                    {activeInfoKey === 'interactive' ? (
                      <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed border-t border-[#161B22] pt-2">
                        Head over to the <strong>Tech Directory</strong> tab to run highly-targeted crawls of specific individual companies, or view live extraction logs as they stream in.
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 mt-1">Target specific companies for single-employer scans.</p>
                    )}
                  </div>
                </div>

                {/* Actions Row */}
                <div className="pt-6 border-t border-[#161B22] flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => onBulkScrape && onBulkScrape(companies, false)}
                    disabled={bulkScraping}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
                    Launch Scraper Engine (Fast Scan)
                  </button>
                  <button
                    type="button"
                    onClick={onOpenAddModal}
                    className="w-full sm:w-auto px-5 py-3 bg-[#161B22] hover:bg-[#21262d] border border-[#30363d] hover:border-slate-500 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    + Register Manual Listing
                  </button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
