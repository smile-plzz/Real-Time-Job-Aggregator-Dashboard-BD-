/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Building2, ExternalLink, Globe, Linkedin, Mail, Play, AlertCircle, CheckCircle2, RefreshCw, Cpu, SlidersHorizontal, ArrowUpDown, MapPin, Sparkles, Layers } from 'lucide-react';
import { Company } from '../types';

interface CompanyListProps {
  companies: Company[];
  onScrape: (companyName: string, careerUrl: string | null, mode: 'direct' | 'search') => void;
  bulkScraping: boolean;
  onBulkScrape: (selectedCompanies: Company[]) => void;
}

export default function CompanyList({ companies, onScrape, bulkScraping, onBulkScrape }: CompanyListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(8);

  // Directory-specific counts
  const totalListed = companies.length;
  const totalScraped = companies.filter(c => c.scrapeStatus === 'completed').length;
  const totalFailed = companies.filter(c => c.scrapeStatus === 'failed').length;
  const totalScraping = companies.filter(c => c.scrapeStatus === 'scraping').length;
  const totalLiveJobs = companies.reduce((sum, c) => sum + (c.jobCount || 0), 0);
  const successRate = totalScraped > 0 ? Math.round((totalScraped / (totalScraped + totalFailed)) * 100) : 0;

  // Location filter matcher
  const matchesLocation = (company: Company) => {
    if (locationFilter === 'all') return true;
    const loc = (company.location || '').toLowerCase();
    
    if (locationFilter === 'gulshan') {
      return loc.includes('gulshan') || loc.includes('baridhara') || loc.includes('bashundhara');
    }
    if (locationFilter === 'banani') {
      return loc.includes('banani');
    }
    if (locationFilter === 'mirpur') {
      return loc.includes('mirpur') || loc.includes('shewrapara') || loc.includes('pallabi');
    }
    if (locationFilter === 'tejgaon') {
      return loc.includes('tejgaon') || loc.includes('karwan') || loc.includes('kawran');
    }
    if (locationFilter === 'uttara') {
      return loc.includes('uttara');
    }
    if (locationFilter === 'mohakhali') {
      return loc.includes('mohakhali');
    }
    if (locationFilter === 'dhanmondi') {
      return loc.includes('dhanmondi') || loc.includes('panthapath') || loc.includes('kalabagan');
    }
    if (locationFilter === 'nikunja') {
      return loc.includes('nikunja') || loc.includes('khilkhet');
    }
    if (locationFilter === 'other') {
      const knownAreas = ['gulshan', 'baridhara', 'bashundhara', 'banani', 'mirpur', 'shewrapara', 'pallabi', 'tejgaon', 'karwan', 'kawran', 'uttara', 'mohakhali', 'dhanmondi', 'panthapath', 'kalabagan', 'nikunja', 'khilkhet'];
      return !knownAreas.some(area => loc.includes(area));
    }
    return true;
  };

  // Channel filter matcher
  const matchesChannel = (company: Company) => {
    if (channelFilter === 'all') return true;
    if (channelFilter === 'career') return !!company.career;
    if (channelFilter === 'email') return !!company.email;
    if (channelFilter === 'linkedin') return !!company.linkedin;
    if (channelFilter === 'website') return !!company.website;
    return true;
  };

  // Filter companies
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.location && company.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company.website && company.website.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company.technologies && company.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase())));
    
    let matchesStatus = true;
    if (statusFilter === 'not_scanned') matchesStatus = !company.scrapeStatus || company.scrapeStatus === 'idle';
    else if (statusFilter === 'scraping') matchesStatus = company.scrapeStatus === 'scraping';
    else if (statusFilter === 'completed') matchesStatus = company.scrapeStatus === 'completed';
    else if (statusFilter === 'failed') matchesStatus = company.scrapeStatus === 'failed';
    else if (statusFilter === 'with_jobs') matchesStatus = company.jobCount && company.jobCount > 0;
    
    return matchesSearch && matchesStatus && matchesLocation(company) && matchesChannel(company);
  });

  // Sort companies
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'name-desc') {
      return b.name.localeCompare(a.name);
    }
    if (sortBy === 'jobs-desc') {
      return (b.jobCount || 0) - (a.jobCount || 0);
    }
    if (sortBy === 'jobs-asc') {
      return (a.jobCount || 0) - (b.jobCount || 0);
    }
    if (sortBy === 'status') {
      const statusOrder: Record<string, number> = { 'scraping': 1, 'completed': 2, 'failed': 3, 'idle': 4 };
      const orderA = statusOrder[a.scrapeStatus || 'idle'] || 4;
      const orderB = statusOrder[b.scrapeStatus || 'idle'] || 4;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  // Pagination calculations
  const isShowAll = itemsPerPage === 'all';
  const limit = isShowAll ? sortedCompanies.length : itemsPerPage;
  const totalPages = isShowAll ? 1 : Math.ceil(sortedCompanies.length / limit);
  const indexOfLastItem = isShowAll ? sortedCompanies.length : currentPage * limit;
  const indexOfFirstItem = isShowAll ? 0 : indexOfLastItem - limit;
  const currentCompanies = sortedCompanies.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const triggerBulkScrapeTop5 = () => {
    // Select top 5 companies that have a career URL and are not currently scanning
    const candidates = companies
      .filter(c => c.career && c.scrapeStatus !== 'scraping')
      .slice(0, 5);
    if (candidates.length > 0) {
      onBulkScrape(candidates);
    }
  };

  const triggerBulkScrapeAll = () => {
    // Select all companies that are not currently scanning
    const candidates = companies.filter(c => c.scrapeStatus !== 'scraping');
    if (candidates.length > 0) {
      onBulkScrape(candidates);
    }
  };

  return (
    <div className="bg-[#0D1117] rounded-2xl border border-[#161B22] p-6 shadow-xs" id="company-directory-section">
      {/* Directory Title and Search Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            Company Contact & Career Directory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active directory of {companies.length} Bangladeshi IT companies. Trigger direct heuristic crawlers on websites to find live software roles.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={triggerBulkScrapeTop5}
            disabled={bulkScraping}
            className="px-4 py-2 bg-[#161B22] hover:bg-[#1f2631] text-slate-200 border border-[#30363d] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs disabled:opacity-45 transition-all cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-indigo-400" />
            Bulk Scan Top 5 Portals
          </button>

          <button
            onClick={triggerBulkScrapeAll}
            disabled={bulkScraping}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 text-white fill-current animate-pulse" />
            Scan All {companies.length} Sites
          </button>
        </div>
      </div>

      {/* Quick Stats Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0A0C10] border border-[#161B22] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Companies</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold text-slate-100">{totalListed}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Bangladeshi Tech Directory</p>
          </div>
        </div>

        <div className="bg-[#0A0C10] border border-[#161B22] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Synced Portals</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold text-slate-100 flex items-center gap-1.5">
              {totalScraped}
              {totalScraping > 0 && (
                <span className="text-xs text-indigo-400 font-normal animate-pulse flex items-center gap-0.5">
                  ({totalScraping} active)
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Direct Crawlers Executed</p>
          </div>
        </div>

        <div className="bg-[#0A0C10] border border-[#161B22] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Discovered Jobs</span>
            <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold text-slate-100">{totalLiveJobs}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Real-time parsed software roles</p>
          </div>
        </div>

        <div className="bg-[#0A0C10] border border-[#161B22] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Crawl Accuracy / Success</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold text-slate-100">{successRate}%</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Direct Fetch Success Ratio</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6" id="directory-filters">
        {/* Search */}
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search name/address..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0A0C10] border border-[#161B22] rounded-xl text-sm placeholder-slate-500 text-slate-200 focus:outline-hidden focus:border-indigo-500/50 focus:bg-[#161B22]/30 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2.5 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs sm:text-sm text-slate-300 focus:outline-hidden focus:border-indigo-500/50 focus:bg-[#161B22]/30 transition-all cursor-pointer"
          >
            <option value="all">All Sync Statuses</option>
            <option value="not_scanned">Not Scanned Yet</option>
            <option value="scraping">Scanning Now...</option>
            <option value="completed">Scanned & Synced</option>
            <option value="with_jobs">Scanned - Has Jobs</option>
            <option value="failed">Scanned - Failed</option>
          </select>
        </div>

        {/* Location Zone Filter */}
        <div>
          <select
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2.5 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs sm:text-sm text-slate-300 focus:outline-hidden focus:border-indigo-500/50 focus:bg-[#161B22]/30 transition-all cursor-pointer"
          >
            <option value="all">All Dhaka Areas</option>
            <option value="gulshan">Gulshan, Baridhara & Bashundhara</option>
            <option value="banani">Banani Area</option>
            <option value="mirpur">Mirpur & Shewrapara</option>
            <option value="tejgaon">Tejgaon & Karwan Bazar</option>
            <option value="uttara">Uttara Area</option>
            <option value="mohakhali">Mohakhali Area</option>
            <option value="dhanmondi">Dhanmondi & Panthapath</option>
            <option value="nikunja">Nikunja & Khilkhet</option>
            <option value="other">Other / Outside Dhaka</option>
          </select>
        </div>

        {/* Channels Filter */}
        <div>
          <select
            value={channelFilter}
            onChange={(e) => {
              setChannelFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2.5 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs sm:text-sm text-slate-300 focus:outline-hidden focus:border-indigo-500/50 focus:bg-[#161B22]/30 transition-all cursor-pointer"
          >
            <option value="all">All Portals / Links</option>
            <option value="career">Has Career Portal</option>
            <option value="website">Has Website Link</option>
            <option value="email">Has HR Email</option>
            <option value="linkedin">Has LinkedIn Profile</option>
          </select>
        </div>

        {/* Sort By Filter */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2.5 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs sm:text-sm text-slate-300 focus:outline-hidden focus:border-indigo-500/50 focus:bg-[#161B22]/30 transition-all cursor-pointer"
          >
            <option value="name-asc">Sort: Name (A-Z)</option>
            <option value="name-desc">Sort: Name (Z-A)</option>
            <option value="jobs-desc">Sort: Jobs (Highest First)</option>
            <option value="jobs-asc">Sort: Jobs (Lowest First)</option>
            <option value="status">Sort: Scrape Status</option>
          </select>
        </div>
      </div>

      {/* Directory List Table */}
      <div className="overflow-x-auto border border-[#161B22] rounded-xl" id="directory-table">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0A0C10]/50 border-b border-[#161B22] text-slate-400 text-xs font-mono uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Company & Location</th>
              <th className="py-3 px-4 font-semibold">Channels</th>
              <th className="py-3 px-4 font-semibold">Scrape Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#161B22]">
            <AnimatePresence mode="popLayout">
              {currentCompanies.length > 0 ? (
                currentCompanies.map((company, index) => (
                  <motion.tr
                    key={company.name}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, delay: index * 0.02 }}
                    className="hover:bg-[#161B22]/40 text-slate-300 text-sm"
                  >
                    {/* Name & Location */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold text-slate-100">{company.name}</div>
                        {company.size && company.size !== 'Please update' && (
                          <span className="inline-flex items-center text-[10px] font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/15 px-1.5 py-0.5 rounded-md">
                            {company.size} Team
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 max-w-sm truncate" title={company.location}>
                        {company.location || 'Bangladesh'}
                      </div>
                      {company.technologies && company.technologies.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-2 max-w-sm">
                          {company.technologies.slice(0, 4).map(tech => (
                            <span key={tech} className="text-[10px] text-slate-400 bg-[#161B22]/60 px-1.5 py-0.5 rounded-md border border-[#30363d]/30 font-mono">
                              {tech}
                            </span>
                          ))}
                          {company.technologies.length > 4 && (
                            <span className="text-[9px] text-slate-500 font-medium font-mono">
                              +{company.technologies.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Links & Email */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 text-slate-400">
                        {company.website ? (
                          <a 
                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-indigo-400 transition-colors"
                            title={`Website: ${company.website}`}
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        ) : null}
                        
                        {company.career ? (
                          <a 
                            href={company.career.startsWith('http') ? company.career : `https://${company.career}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-violet-300 transition-colors flex items-center gap-0.5 text-xs font-medium bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/20"
                            title={`Career portal: ${company.career}`}
                          >
                            <span>Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-600">No Portal Listed</span>
                        )}

                        {company.email ? (
                          <a 
                            href={`mailto:${company.email}`}
                            className="hover:text-emerald-400 transition-colors"
                            title={`HR Email: ${company.email}`}
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        ) : null}

                        {company.linkedin ? (
                          <a 
                            href={company.linkedin.startsWith('http') ? company.linkedin : `https://${company.linkedin}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-indigo-400 transition-colors"
                            title="LinkedIn Profile"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        ) : null}

                        {company.facebook ? (
                          <a 
                            href={company.facebook.startsWith('http') ? company.facebook : `https://${company.facebook}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-indigo-400 transition-colors"
                            title="Facebook Profile"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                            </svg>
                          </a>
                        ) : null}

                        {company.twitter ? (
                          <a 
                            href={company.twitter.startsWith('http') ? company.twitter : `https://${company.twitter}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-indigo-400 transition-colors"
                            title="Twitter Profile"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                          </a>
                        ) : null}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {/* Render state-specific badging */}
                        {(!company.scrapeStatus || company.scrapeStatus === 'idle') && (
                          <span className="inline-flex items-center text-xs text-slate-400 font-medium px-2 py-1 rounded-full bg-[#161B22]">
                            Unscanned
                          </span>
                        )}

                        {company.scrapeStatus === 'scraping' && (
                          <span className="inline-flex items-center text-xs text-indigo-400 font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 gap-1.5 animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                            Scanning Portal
                          </span>
                        )}

                        {company.scrapeStatus === 'completed' && (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 gap-1 self-start">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Synced
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono pl-1">
                              {company.jobCount || 0} active job{company.jobCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}

                        {company.scrapeStatus === 'failed' && (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center text-xs text-rose-400 font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 gap-1 self-start" title={company.error}>
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                              Scan Error
                            </span>
                            <span className="text-[10px] text-rose-500/85 max-w-[150px] truncate pl-1" title={company.error}>
                              {company.error || 'Connection timed out'}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Direct Scrape Button */}
                        {company.career && (
                          <button
                            onClick={() => onScrape(company.name, company.career, 'direct')}
                            disabled={company.scrapeStatus === 'scraping'}
                            className="px-2.5 py-1.5 bg-[#161B22] text-slate-300 hover:bg-[#1f2631] hover:text-indigo-400 border border-[#30363d] hover:border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40"
                            title="Direct Scan (Fetches URL HTML and parses active jobs with heuristic scanner)"
                          >
                            <Play className="w-3 h-3 text-current fill-current" />
                            Direct Scan
                          </button>
                        )}

                        <button
                          onClick={() => onScrape(company.name, company.career, 'search')}
                          disabled={company.scrapeStatus === 'scraping'}
                          className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40"
                          title="Heuristic Scan (Deep scrape with automated catalog synthesis fallback)"
                        >
                          <Cpu className="w-3.5 h-3.5 text-current" />
                          Heuristic Scan
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                    No companies match your search criteria. Try a different name or status filter.
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Directory Table Pagination Controls */}
      {(totalPages > 1 || itemsPerPage === 'all' || filteredCompanies.length > 8) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-4 border-t border-[#161B22]" id="directory-pagination">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="font-semibold text-slate-300">{filteredCompanies.length > 0 ? indexOfFirstItem + 1 : 0}</span> to{' '}
              <span className="font-semibold text-slate-300">
                {Math.min(indexOfLastItem, filteredCompanies.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-300">{filteredCompanies.length}</span> companies
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="text-[11px] text-slate-500 font-medium">Page limit:</span>
              <div className="flex bg-[#0A0C10] border border-[#161B22] rounded-lg p-0.5 gap-0.5">
                {([8, 20, 50, 'all'] as const).map((size) => {
                  const isActive = itemsPerPage === size;
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setItemsPerPage(size);
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                          : 'text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {size === 'all' ? 'Show All' : size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {itemsPerPage !== 'all' && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-[#161B22] hover:bg-[#1f2631] disabled:opacity-40 text-slate-300 rounded-lg text-xs font-medium cursor-pointer transition-colors border border-[#30363d]"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                // Only render standard subset if too many pages
                if (
                  totalPages > 6 &&
                  pageNum !== 1 &&
                  pageNum !== totalPages &&
                  Math.abs(pageNum - currentPage) > 1
                ) {
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return <span key={pageNum} className="text-slate-600 text-xs px-1">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#161B22] text-slate-300 border border-[#30363d] hover:bg-[#1f2631]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-[#161B22] hover:bg-[#1f2631] disabled:opacity-40 text-slate-300 rounded-lg text-xs font-medium cursor-pointer transition-colors border border-[#30363d]"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
