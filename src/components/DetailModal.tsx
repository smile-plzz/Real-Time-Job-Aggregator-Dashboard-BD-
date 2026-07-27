import React, { useState, useMemo, useEffect } from 'react';
import { Job, Company } from '../types';
import Tooltip from './Tooltip';
import { 
  X, Briefcase, MapPin, Building2, ExternalLink, Search, 
  Banknote, Award, Sparkles, Filter, ChevronRight, Laptop, CheckCircle2,
  Globe, Mail, Users, AlertCircle, RefreshCw, ChevronDown, ChevronUp,
  SlidersHorizontal, LayoutList, LayoutGrid
} from 'lucide-react';

export interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  jobs: Job[];
  allJobs?: Job[];
  companyProfile?: Company;
  statsSummary?: { label: string; value: string | number; color?: string }[];
}

export function DetailModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  badge,
  jobs,
  allJobs,
  companyProfile,
  statsSummary
}: DetailModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExp, setSelectedExp] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Collapsible Layout State
  const [isOverviewCollapsed, setIsOverviewCollapsed] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Use provided jobs list, fallback to allJobs if jobs prop is empty
  const activePool = useMemo(() => {
    if (jobs && jobs.length > 0) return jobs;
    if (allJobs && allJobs.length > 0) return allJobs;
    return [];
  }, [jobs, allJobs]);

  // Fuzzy filter jobs inside modal
  const filteredJobs = useMemo(() => {
    return activePool.filter(j => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = j.title.toLowerCase().includes(q);
        const compMatch = j.companyName.toLowerCase().includes(q);
        const skillsMatch = Array.isArray(j.skills) && j.skills.some(s => s.toLowerCase().includes(q));
        const locMatch = (j.location || '').toLowerCase().includes(q);
        if (!titleMatch && !compMatch && !skillsMatch && !locMatch) return false;
      }

      if (selectedExp !== 'all') {
        const jExp = (j.experienceLevel || '').toLowerCase();
        const tExp = selectedExp.toLowerCase();
        if (jExp !== tExp) {
          const isJunior = tExp === 'junior' && (jExp.includes('junior') || jExp.includes('entry') || jExp.includes('0-2'));
          const isMid = tExp === 'mid' && (jExp.includes('mid') || jExp.includes('2-5'));
          const isSenior = tExp === 'senior' && (jExp.includes('senior') || jExp.includes('5+'));
          const isLead = tExp === 'lead' && (jExp.includes('lead') || jExp.includes('architect'));
          const isIntern = tExp === 'intern' && (jExp.includes('intern') || jExp.includes('trainee'));
          if (!isJunior && !isMid && !isSenior && !isLead && !isIntern) return false;
        }
      }

      if (selectedCategory !== 'all') {
        const jCat = (j.category || '').toLowerCase();
        if (jCat !== selectedCategory.toLowerCase()) return false;
      }

      if (selectedType !== 'all') {
        const jType = (j.type || '').toLowerCase();
        if (selectedType === 'remote' && !jType.includes('remote')) return false;
        if (selectedType === 'hybrid' && !jType.includes('hybrid')) return false;
        if (selectedType === 'onsite' && (jType.includes('remote') || jType.includes('hybrid'))) return false;
      }

      return true;
    });
  }, [activePool, searchQuery, selectedExp, selectedCategory, selectedType]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedExp !== 'all') count++;
    if (selectedCategory !== 'all') count++;
    if (selectedType !== 'all') count++;
    return count;
  }, [selectedExp, selectedCategory, selectedType]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedExp('all');
    setSelectedCategory('all');
    setSelectedType('all');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Backdrop Click to Close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Shell - Clean Minimalist White Box */}
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col z-10 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Minimalist Modern Header */}
        <div className="px-6 py-4.5 bg-white text-slate-900 flex items-center justify-between gap-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              {icon || <Briefcase className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">{title}</h3>
                {badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(companyProfile || (statsSummary && statsSummary.length > 0)) && (
              <Tooltip content={isOverviewCollapsed ? "Expand Overview Header" : "Collapse Overview Header"} position="bottom">
                <button
                  onClick={() => setIsOverviewCollapsed(!isOverviewCollapsed)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {isOverviewCollapsed ? (
                    <><span>Show Overview</span><ChevronDown className="w-3.5 h-3.5" /></>
                  ) : (
                    <><span>Hide Overview</span><ChevronUp className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </Tooltip>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer shrink-0"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Company Profile & Stats Overview Banner */}
        {!isOverviewCollapsed && (
          <div className="animate-in slide-in-from-top-2 duration-200 border-b border-slate-100">
            {/* Company Profile Header Banner */}
            {companyProfile && (
              <div className="px-6 py-4 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4 text-xs shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-lg shadow-2xs ring-2 ring-indigo-100 shrink-0">
                    {companyProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-900 text-sm">{companyProfile.name}</h4>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Tech Employer
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-1 flex-wrap font-medium">
                      {companyProfile.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-indigo-500" /> {companyProfile.location}</span>
                      )}
                      {companyProfile.size && companyProfile.size !== 'Please update' && (
                        <span className="flex items-center gap-1"><Users className="w-3 h-3 text-indigo-500" /> {companyProfile.size} employees</span>
                      )}
                      {companyProfile.email && (
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-indigo-500" /> {companyProfile.email}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {companyProfile.website && (
                    <Tooltip content="Open company official portal in a new tab" position="left">
                      <a
                        href={companyProfile.website.startsWith('http') ? companyProfile.website : `https://${companyProfile.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Company Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Tooltip>
                  )}
                </div>
              </div>
            )}

            {/* Stats Summary Cards Bar */}
            {statsSummary && statsSummary.length > 0 && (
              <div className="px-6 py-3.5 bg-slate-50/40 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                {statsSummary.map((stat, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-200/70 shadow-2xs">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{stat.label}</div>
                    <div className={`text-base font-black mt-0.5 ${stat.color || 'text-slate-900'}`}>{stat.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search & Collapsible Multi-Filter Toolbar */}
        <div className="px-6 py-3.5 bg-white border-b border-slate-100 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by job title, skill, or keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Toggle Filter Panel */}
              <button
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isFilterPanelOpen 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                {isFilterPanelOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {/* View Mode Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'detailed' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Detailed Cards"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'compact' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Compact List"
                >
                  <LayoutList className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Select Filters Row */}
          {isFilterPanelOpen && (
            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
              {/* Seniority Filter */}
              <select
                value={selectedExp}
                onChange={e => setSelectedExp(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Seniority</option>
                <option value="intern">Internship</option>
                <option value="junior">Junior (0-2 Yrs)</option>
                <option value="mid">Mid-Level (2-5 Yrs)</option>
                <option value="senior">Senior (5+ Yrs)</option>
                <option value="lead">Lead / Principal</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="fullstack">Fullstack</option>
                <option value="mobile">Mobile</option>
                <option value="devops">DevOps</option>
                <option value="qa">QA / SDET</option>
                <option value="product">Product</option>
                <option value="design">UI/UX</option>
              </select>

              {/* Work Type Filter */}
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Work Types</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>

              {/* Reset CTA if filtered */}
              {(searchQuery || selectedExp !== 'all' || selectedCategory !== 'all' || selectedType !== 'all') && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Reset Filters"
                >
                  <RefreshCw className="w-3 h-3 text-slate-500" />
                  <span>Reset All</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content Area: Jobs List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-800">No matching positions found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  {jobs.length === 0 
                    ? "There are currently no active job listings matching this specific segment. Try exploring other company profiles or categories!" 
                    : "No jobs matched your specific keyword or seniority filter inside this view."}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Show All Active Roles ({activePool.length})</span>
                </button>
              </div>
            </div>
          ) : (
            filteredJobs.map(job => {
              const isExpanded = expandedJobId === job.id;
              
              if (viewMode === 'compact') {
                return (
                  <div 
                    key={job.id} 
                    className="bg-white p-3.5 rounded-2xl border border-slate-200/80 hover:border-indigo-400 transition-all flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-black flex items-center justify-center text-xs shrink-0">
                        {job.companyName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-900 truncate">{job.title}</h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 shrink-0">
                            {job.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                          {job.companyName} • {job.location || 'Dhaka'} {job.salary ? `• ${job.salary}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        {isExpanded ? 'Hide' : 'Info'}
                      </button>
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={job.id} 
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-400/80 shadow-2xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-black text-slate-900 hover:text-indigo-600 transition-colors">
                          {job.title}
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/80 uppercase">
                          {job.category}
                        </span>
                        {job.experienceLevel && job.experienceLevel !== 'unspecified' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-100 uppercase">
                            {job.experienceLevel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap font-medium">
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                          {job.companyName}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location || 'Dhaka, Bangladesh'}
                        </span>
                        {job.type && (
                          <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] font-bold border border-emerald-100">
                            <Laptop className="w-3 h-3 text-emerald-600" />
                            {job.type}
                          </span>
                        )}
                        {job.salary && (
                          <span className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] font-bold border border-amber-100">
                            <Banknote className="w-3 h-3 text-amber-600" />
                            {job.salary}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'Details'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <a
                        href={job.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Skills Pills */}
                  {Array.isArray(job.skills) && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.skills.map((skill, sIdx) => (
                        <span 
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/60"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Collapsible Expanded Description & Requirements */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100 text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-xl space-y-2 animate-in fade-in duration-150">
                      <p className="font-bold text-slate-900">Job Description &amp; Core Requirements:</p>
                      <p className="whitespace-pre-line text-slate-600">{job.summary || "No full summary extracted for this position."}</p>
                      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Source: {job.source || 'Scraped Portal'}</span>
                        <a 
                          href={job.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-indigo-600 hover:underline font-bold flex items-center gap-1"
                        >
                          Direct Portal Link <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="font-medium">
            Showing <strong className="text-slate-900 font-bold">{filteredJobs.length}</strong> of <strong className="text-slate-900 font-bold">{activePool.length}</strong> listings
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer shadow-xs"
          >
            Close Modal
          </button>
        </div>

      </div>

    </div>
  );
}


