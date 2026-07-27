/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Sparkles, RefreshCw, Layers, Cpu, AlertCircle, Trash2, Building, AlertTriangle, BarChart3, BookOpen, Download, Banknote } from 'lucide-react';

import { Company, Job, ScrapeStats } from './types';
import StatsSection from './components/StatsSection';
import CompanyList from './components/CompanyList';
import JobsFeed from './components/JobsFeed';
import JobDetailModal from './components/JobDetailModal';
// No manual listing imports needed
import AnalyticsDashboard from './components/AnalyticsDashboard';
import MarketPulse from './components/MarketPulse';
import CrawlerDocs from './components/CrawlerDocs';
import ExportSection from './components/ExportSection';

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
  const [activeTab, setActiveTab] = useState<'jobs' | 'directory' | 'analytics' | 'pulse' | 'docs' | 'export'>('jobs');
  
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

  const handleStopBulkScrape = async () => {
    try {
      await fetch('/api/scrape-bulk/stop', { method: 'POST' });
      setBulkScraping(false);
      showNotification('Bulk scan stopped.', 'info');
      fetchAllData(true);
    } catch (err) {
      console.error('Failed to stop bulk scanning:', err);
    }
  };

  // Manual job creation removed

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
    <div className="min-h-screen text-gray-900 flex flex-col justify-between relative" id="applet-container">
      {/* Top Header Navigation Panel */}
      <header className="bg-white/95 backdrop-blur-xl text-gray-900 border-b border-gray-200 sticky top-0 z-40 py-5 px-6 shrink-0 shadow-sm" id="main-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/20 text-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
                TechHub BD Intelligence
                <span className="text-[9px] uppercase tracking-wider font-mono bg-indigo-500/10 text-indigo-600 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-semibold">
                  Live Engine
                </span>
              </h1>
              <p className="text-xs text-gray-600 mt-0.5 font-medium">
                Real-Time Career Aggregator & Company Directory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAllData()}
              className="px-3.5 py-2.5 bg-white hover:bg-gray-100 text-gray-800 hover:text-gray-900 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-gray-200 hover:border-gray-300 shadow-sm"
              title="Refresh dashboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Data
            </button>
            
            <button
              onClick={handleResetCache}
              disabled={resetting}
              className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              title="Wipe scraped jobs and reset to seed listings"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {resetting ? 'Resetting...' : 'Reset System'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Core Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full" id="main-content">
        {/* Tab Selection Switcher */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none gap-2" id="dashboard-tab-navigation">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'jobs'
                ? 'border-indigo-500 text-indigo-600 font-bold bg-indigo-500/5 rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg'
            }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === 'jobs' ? 'text-indigo-600' : 'text-gray-500'}`} />
            Active Jobs
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'directory'
                ? 'border-indigo-500 text-indigo-600 font-bold bg-indigo-500/5 rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg'
            }`}
          >
            <Building className={`w-4 h-4 ${activeTab === 'directory' ? 'text-indigo-600' : 'text-gray-500'}`} />
            Tech Directory
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'analytics'
                ? 'border-indigo-500 text-indigo-600 font-bold bg-indigo-500/5 rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg'
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-indigo-600' : 'text-gray-500'}`} />
            Market Analytics
          </button>
          <button
            onClick={() => setActiveTab('pulse')}
            className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'pulse'
                ? 'border-indigo-500 text-indigo-600 font-bold bg-indigo-500/5 rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg'
            }`}
          >
            <Activity className={`w-4 h-4 ${activeTab === 'pulse' ? 'text-indigo-600' : 'text-gray-500'}`} />
            Market Pulse
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'docs'
                ? 'border-indigo-500 text-indigo-600 font-bold bg-indigo-500/5 rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'docs' ? 'text-indigo-600' : 'text-gray-500'}`} />
            System Architecture
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'export'
                ? 'border-indigo-500 text-indigo-600 font-bold bg-indigo-500/5 rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg'
            }`}
          >
            <Download className={`w-4 h-4 ${activeTab === 'export' ? 'text-indigo-600' : 'text-gray-500'}`} />
            Export Data
          </button>
        </div>

        {/* Global Loading state overlay */}
        {loading && (
          <div className="py-24 text-center flex flex-col items-center justify-center" id="global-loader">
            <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
            <p className="font-semibold text-gray-900">Loading Dashboard Records...</p>
            <p className="text-xs text-gray-500 mt-1">Retrieving companies and active listings from database cache</p>
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
                    onStopBulkScrape={handleStopBulkScrape}
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
            {activeTab === 'pulse' && (
              <motion.div
                key="pulse"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MarketPulse jobs={jobs} companies={companies} />
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
              {activeTab === 'export' && (
                <motion.div
                  key="export-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                  id="export-tab-content"
                >
                  <ExportSection companies={companies} jobs={jobs} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer Navigation Credits Panel */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12 text-center text-xs text-gray-500 relative z-10" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium text-gray-600">
            TechHub BD &mdash; High-Fidelity Heuristic Crawler Engine & Directory
          </p>
          <div className="flex items-center gap-4">
            <p className="font-mono text-[10px] text-gray-500">
              Aggregating from MBSTUPC & JustApply
            </p>
          </div>
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
                ? 'bg-white text-emerald-600 border-emerald-500/30'
                : notification.type === 'error'
                ? 'bg-white text-rose-600 border-rose-500/30'
                : 'bg-white text-indigo-600 border-indigo-500/30'
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
            company={companies.find(c => c.name === selectedJob.companyName)}
            onClose={() => setSelectedJob(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
