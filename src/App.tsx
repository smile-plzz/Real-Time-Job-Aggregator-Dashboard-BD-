/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Layers, Cpu, AlertCircle, Trash2, Building, AlertTriangle, BarChart3, BookOpen } from 'lucide-react';

import { Company, Job, ScrapeStats } from './types';
import StatsSection from './components/StatsSection';
import CompanyList from './components/CompanyList';
import JobsFeed from './components/JobsFeed';
import JobDetailModal from './components/JobDetailModal';
import ManualAddModal from './components/ManualAddModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import CrawlerDocs from './components/CrawlerDocs';

export default function App() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<ScrapeStats>({
    totalCompanies: 0,
    scrapedCompanies: 0,
    totalJobs: 0,
    activeCompaniesCount: 0,
    categoryBreakdown: {},
    experienceBreakdown: {}
  });

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'jobs' | 'directory' | 'analytics' | 'docs'>('jobs');
  
  // Loading & Global States
  const [loading, setLoading] = useState(true);
  const [bulkScraping, setBulkScraping] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Helper for resilient server communication with exponential backoff retry
  const fetchWithRetry = async (url: string, options?: RequestInit, retries = 2, delay = 1000): Promise<Response> => {
    try {
      const res = await fetch(url, options);
      if (!res.ok && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      return res;
    } catch (err) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw err;
    }
  };

  // Trigger temporary toast notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Main fetch functions
  const fetchAllData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [compRes, jobsRes, statsRes] = await Promise.all([
        fetchWithRetry('/api/companies'),
        fetchWithRetry('/api/jobs'),
        fetchWithRetry('/api/stats')
      ]);

      if (compRes.ok && jobsRes.ok && statsRes.ok) {
        const compData = await compRes.json();
        const jobsData = await jobsRes.json();
        const statsData = await statsRes.json();

        setCompanies(compData);
        setJobs(jobsData);
        setStats(statsData);

        // Turn off bulk loading indicator once all scheduled items complete
        const isCurrentlyScraping = compData.some((c: any) => c.scrapeStatus === 'scraping');
        if (!isCurrentlyScraping && bulkScraping) {
          setBulkScraping(false);
          showNotification('Bulk scanning operation completed!', 'success');
        }
      } else {
        throw new Error('Server returned non-ok response statuses');
      }
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
      // Only display the error banner if the load was active and expected (non-silent)
      if (!silent) {
        showNotification('Failed to retrieve latest data from server. Please refresh.', 'error');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Poll server for updates if anything is in a 'scraping' state (fully self-cleaning)
  useEffect(() => {
    const isAnyScraping = companies.some(c => c.scrapeStatus === 'scraping');
    
    let intervalId: NodeJS.Timeout | null = null;
    if (isAnyScraping) {
      intervalId = setInterval(() => {
        fetchAllData(true);
      }, 4000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [companies, bulkScraping]);

  // Handle single company scrape triggers
  const handleScrapeCompany = async (companyName: string, careerUrl: string | null, mode: 'direct' | 'search') => {
    // Optimistic local state update
    setCompanies(prev => prev.map(c => 
      c.name === companyName ? { ...c, scrapeStatus: 'scraping', error: undefined } : c
    ));

    showNotification(`Scanning career portal for ${companyName}...`, 'info');

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, careerUrl, mode })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showNotification(
          data.jobsExtracted > 0 
            ? `Successfully extracted ${data.jobsExtracted} jobs from ${companyName}!`
            : `Scan complete: No active openings found on ${companyName}'s career page.`,
          'success'
        );
        fetchAllData(true);
      } else {
        throw new Error(data.error || 'Scraper endpoint returned failed response');
      }
    } catch (err: any) {
      console.error(`Failed to scan ${companyName}:`, err);
      showNotification(err.message || `An error occurred while scanning ${companyName}`, 'error');
      
      // Update local company item with error
      setCompanies(prev => prev.map(c => 
        c.name === companyName 
          ? { ...c, scrapeStatus: 'failed', error: err.message || 'Scrape operation failed' } 
          : c
      ));
    }
  };

  // Handle Bulk Scrapes
  const handleBulkScrape = async (selectedCompanies: Company[], heuristic = false) => {
    setBulkScraping(true);
    showNotification(`Initiated ${heuristic ? 'heuristic deep' : 'fast'} scan for ${selectedCompanies.length} companies...`, 'info');

    // Set matching companies to scraping optimistically
    const selectedNames = selectedCompanies.map(sc => sc.name);
    setCompanies(prev => prev.map(c => 
      selectedNames.includes(c.name) ? { ...c, scrapeStatus: 'scraping', error: undefined } : c
    ));

    try {
      const response = await fetch('/api/scrape-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companiesToScrape: selectedCompanies.map(sc => sc.name), heuristic })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start bulk scan');
      }
    } catch (err: any) {
      console.error('Failed to initiate bulk scanning:', err);
      showNotification(err.message || 'Bulk scan failed to start', 'error');
      setBulkScraping(false);
      fetchAllData(true);
    }
  };

  // Handle saving manually added listings
  const handleSaveManualJob = async (jobData: any) => {
    const response = await fetch('/api/jobs/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });

    if (response.ok) {
      showNotification('Custom listing added successfully!', 'success');
      fetchAllData(true);
    } else {
      const err = await response.json();
      throw new Error(err.error || 'Failed to record custom listing');
    }
  };

  // Handle Cache resets
  const handleResetCache = async () => {
    if (!confirm('Are you sure you want to reset the cache? This will clear all scraped jobs and restore the initial seed listings.')) {
      return;
    }

    try {
      setResetting(true);
      const response = await fetch('/api/reset-cache', { method: 'POST' });
      if (response.ok) {
        showNotification('Cache reset: Default seed listings restored.', 'success');
        fetchAllData();
      } else {
        showNotification('Failed to clear cached listings', 'error');
      }
    } catch (err) {
      console.error('Reset cache error:', err);
      showNotification('An error occurred during cache wipe', 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#E2E8F0] flex flex-col justify-between" id="applet-container">
      {/* Top Header Navigation Panel */}
      <header className="bg-[#0D1117]/80 backdrop-blur-md text-white border-b border-[#161B22] sticky top-0 z-40 py-5 px-6 shrink-0" id="main-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-slate-100">
                Real-Time Job Aggregator Dashboard
                <span className="text-[10px] uppercase tracking-wider font-mono bg-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/10 font-bold">
                  Heuristic Engine
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic Career Scraper for Bangladesh IT Company Directories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAllData()}
              className="p-2.5 bg-[#161B22] hover:bg-[#1f2631] text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#30363d]"
              title="Refresh dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Feed
            </button>
            
            <button
              onClick={handleResetCache}
              disabled={resetting}
              className="px-3.5 py-2.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-600 hover:text-white text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Wipe scraped jobs and reset to seed listings"
            >
              <Trash2 className="w-4 h-4" />
              Reset Cache
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Core Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full" id="main-content">
        {/* Tab Selection Switcher */}
        <div className="flex border-b border-[#161B22] mb-6 overflow-x-auto whitespace-nowrap scrollbar-none" id="dashboard-tab-navigation">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-6 py-3.5 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'jobs'
                ? 'border-indigo-500 text-indigo-400 font-bold bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            Jobs Board
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-6 py-3.5 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'directory'
                ? 'border-indigo-500 text-indigo-400 font-bold bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-4 h-4 text-indigo-400" />
            Company Directory &amp; Directory Info
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3.5 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'analytics'
                ? 'border-indigo-500 text-indigo-400 font-bold bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Market Analytics Dashboard
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-6 py-3.5 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'docs'
                ? 'border-indigo-500 text-indigo-400 font-bold bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            System Docs &amp; Crawler Guide
          </button>
        </div>

        {/* Global Loading state overlay */}
        {loading && (
          <div className="py-24 text-center flex flex-col items-center justify-center" id="global-loader">
            <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
            <p className="font-semibold text-slate-200">Loading Dashboard Records...</p>
            <p className="text-xs text-slate-500 mt-1">Retrieving companies and active listings from database cache</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'jobs' && (
                <motion.div
                  key="jobs-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* 1. Statistics Summary Block */}
                  <StatsSection 
                    stats={stats} 
                    isResetting={resetting} 
                    onReset={handleResetCache} 
                  />

                  {/* 2. Full-width Jobs Feed list */}
                  <div className="w-full" id="jobs-tab-content">
                    <JobsFeed 
                      jobs={jobs} 
                      onSelectJob={setSelectedJob} 
                      onOpenAddModal={() => setIsAddModalOpen(true)}
                      companies={companies}
                      bulkScraping={bulkScraping}
                      onBulkScrape={handleBulkScrape}
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'directory' && (
                <motion.div
                  key="directory-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                  id="directory-tab-content"
                >
                  <CompanyList 
                    companies={companies} 
                    onScrape={handleScrapeCompany}
                    bulkScraping={bulkScraping}
                    onBulkScrape={handleBulkScrape}
                  />
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                  id="analytics-tab-content"
                >
                  <AnalyticsDashboard 
                    companies={companies} 
                    jobs={jobs} 
                  />
                </motion.div>
              )}

              {activeTab === 'docs' && (
                <motion.div
                  key="docs-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                  id="docs-tab-content"
                >
                  <CrawlerDocs />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer Navigation Credits Panel */}
      <footer className="bg-[#0D1117] border-t border-[#161B22] py-6 text-center text-xs text-slate-500" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium text-slate-400">
            Real-Time Job Aggregator &mdash; High-Fidelity Heuristic Crawler Engine &amp; Just Apply Directory
          </p>
          <p className="font-mono text-[10px] text-slate-500">
            Bangladesh IT Directory Contact List
          </p>
        </div>
      </footer>

      {/* Shared Floating Notification Alert Toasts */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl border text-xs font-semibold flex items-center gap-2 max-w-sm ${
              notification.type === 'success'
                ? 'bg-[#0D1117] text-emerald-400 border-emerald-500/30'
                : notification.type === 'error'
                ? 'bg-[#0D1117] text-rose-400 border-rose-500/30'
                : 'bg-[#0D1117] text-indigo-400 border-indigo-500/30'
            }`}
          >
            <AlertCircle className={`w-4.5 h-4.5 ${
              notification.type === 'success' ? 'text-emerald-500' : notification.type === 'error' ? 'text-rose-500' : 'text-indigo-500'
            }`} />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {selectedJob && (
          <JobDetailModal 
            job={selectedJob} 
            onClose={() => setSelectedJob(null)} 
          />
        )}
        
        {isAddModalOpen && (
          <ManualAddModal 
            companies={companies} 
            onClose={() => setIsAddModalOpen(false)} 
            onSave={handleSaveManualJob}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
