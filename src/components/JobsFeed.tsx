/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Briefcase, Calendar, ChevronRight, Sparkles, SlidersHorizontal, Filter, X, Cpu, Zap, RefreshCw, Flame, CheckCircle2 } from 'lucide-react';
import { Job, Company } from '../types';

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
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
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

  // Apply sorting rules
  const sortedJobs = [...filteredJobs].sort((a, b) => {
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
            sortedJobs.map((job, index) => (
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
                <div className="absolute top-0 left-0 w-1.5 h-full bg-transparent group-hover:bg-indigo-500 transition-all" />

                <div>
                  {/* Top Details Row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 group-hover:text-indigo-400 transition-colors">
                        {job.companyName}
                      </span>
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
                    {job.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="text-[10px] font-mono font-medium text-slate-400 bg-[#0A0C10] px-2 py-0.5 rounded-md border border-[#161B22]">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="text-[9px] text-slate-500 font-bold font-mono px-1">
                        +{job.skills.length - 3}
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
            ))
          ) : (
            <div className="md:col-span-2 py-16 text-center text-slate-500 text-sm bg-[#0D1117] border border-[#161B22] rounded-2xl p-8 flex flex-col items-center justify-center">
              <Briefcase className="w-10 h-10 text-slate-600 mb-2" />
              <p className="font-semibold text-slate-200">No Job Listings Aggregated</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Try scanning companies in the directory above to aggregate active job vacancies live from their careers page.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
