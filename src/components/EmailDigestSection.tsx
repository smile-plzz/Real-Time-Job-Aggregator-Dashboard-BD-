import React, { useState, useMemo, useEffect } from 'react';
import { Job } from '../types';
import { generateEmailHtml } from '../utils/emailTemplate';
import { generateJobsCsv, downloadJobsCsv } from '../utils/csvExport';
import { 
  Mail, Send, Clock, CheckCircle2, AlertCircle, Sparkles, 
  Settings, Terminal, ExternalLink, Filter, Copy, FileText, Check, ChevronRight, Zap, RefreshCw, Layout, Users, Sliders,
  Download, Search, ArrowUpDown, FileSpreadsheet
} from 'lucide-react';

interface EmailDigestSectionProps {
  jobs: Job[];
  initialCategory?: string;
}

export function EmailDigestSection({ jobs, initialCategory = 'all' }: EmailDigestSectionProps) {
  // Subscription & Filter Preferences State
  const [subEmail, setSubEmail] = useState('');
  const [subFrequency, setSubFrequency] = useState<'daily' | 'weekly'>('daily');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory !== 'all' ? [initialCategory] : ['all']);
  const [selectedExpLevels, setSelectedExpLevels] = useState<string[]>(['all']);
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>(['all']);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['all']);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'company' | 'title' | 'category' | 'exp'>('latest');
  const [maxJobsCount, setMaxJobsCount] = useState<number | 'all'>('all');
  const [attachCsv, setAttachCsv] = useState<boolean>(true);
  const [templateTheme, setTemplateTheme] = useState<'modern-indigo' | 'minimal-dark' | 'emerald-clean' | 'royal-violet'>('modern-indigo');

  // Manual Test Email State
  const [testRecipientEmail, setTestRecipientEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSendSuccess, setTestSendSuccess] = useState(false);
  const [dispatchMessage, setDispatchMessage] = useState<string | null>(null);

  // General UI States
  const [showPreview, setShowPreview] = useState(true);
  const [previewTab, setPreviewTab] = useState<'visual' | 'code'>('visual');
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [subSaved, setSubSaved] = useState(false);
  const [activeSubscribersCount, setActiveSubscribersCount] = useState<number>(0);

  // Fetch active subscriber stats on mount
  useEffect(() => {
    fetchSubscribersCount();
  }, []);

  const fetchSubscribersCount = async () => {
    try {
      const resp = await fetch('/api/subscribers');
      if (resp.ok) {
        const data = await resp.json();
        setActiveSubscribersCount(data.totalActive || 0);
      }
    } catch (e) {
      // Ignore background fetch error
    }
  };

  // Helper toggle functions for multi-select aspects
  const toggleCategory = (cat: string) => {
    if (cat === 'all') {
      setSelectedCategories(['all']);
      return;
    }
    const currentWithoutAll = selectedCategories.filter(c => c !== 'all');
    if (currentWithoutAll.includes(cat)) {
      const next = currentWithoutAll.filter(c => c !== cat);
      setSelectedCategories(next.length === 0 ? ['all'] : next);
    } else {
      setSelectedCategories([...currentWithoutAll, cat]);
    }
  };

  const toggleExpLevel = (lvl: string) => {
    if (lvl === 'all') {
      setSelectedExpLevels(['all']);
      return;
    }
    const currentWithoutAll = selectedExpLevels.filter(l => l !== 'all');
    if (currentWithoutAll.includes(lvl)) {
      const next = currentWithoutAll.filter(l => l !== lvl);
      setSelectedExpLevels(next.length === 0 ? ['all'] : next);
    } else {
      setSelectedExpLevels([...currentWithoutAll, lvl]);
    }
  };

  const toggleWorkMode = (mode: string) => {
    if (mode === 'all') {
      setSelectedWorkModes(['all']);
      return;
    }
    const currentWithoutAll = selectedWorkModes.filter(m => m !== 'all');
    if (currentWithoutAll.includes(mode)) {
      const next = currentWithoutAll.filter(m => m !== mode);
      setSelectedWorkModes(next.length === 0 ? ['all'] : next);
    } else {
      setSelectedWorkModes([...currentWithoutAll, mode]);
    }
  };

  const toggleLocation = (loc: string) => {
    if (loc === 'all') {
      setSelectedLocations(['all']);
      return;
    }
    const currentWithoutAll = selectedLocations.filter(l => l !== 'all');
    if (currentWithoutAll.includes(loc)) {
      const next = currentWithoutAll.filter(l => l !== loc);
      setSelectedLocations(next.length === 0 ? ['all'] : next);
    } else {
      setSelectedLocations([...currentWithoutAll, loc]);
    }
  };

  // Filter & Sort Jobs based on selected multi-aspect preferences & search query
  const matchingJobs = useMemo(() => {
    const filtered = jobs.filter(job => {
      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = job.title.toLowerCase().includes(q);
        const compMatch = job.companyName.toLowerCase().includes(q);
        const skillsMatch = Array.isArray(job.skills) && job.skills.some(s => s.toLowerCase().includes(q));
        if (!titleMatch && !compMatch && !skillsMatch) return false;
      }

      // Categories filter
      if (!selectedCategories.includes('all') && selectedCategories.length > 0) {
        if (!selectedCategories.includes(job.category)) return false;
      }

      // Experience Level filter
      if (!selectedExpLevels.includes('all') && selectedExpLevels.length > 0) {
        if (!selectedExpLevels.includes(job.experienceLevel)) return false;
      }

      // Work Mode filter
      if (!selectedWorkModes.includes('all') && selectedWorkModes.length > 0) {
        const typeLower = (job.type || '').toLowerCase();
        const matchesMode = selectedWorkModes.some(m => {
          if (m === 'remote') return typeLower.includes('remote');
          if (m === 'hybrid') return typeLower.includes('hybrid');
          if (m === 'onsite') return !typeLower.includes('remote') && !typeLower.includes('hybrid');
          return true;
        });
        if (!matchesMode) return false;
      }

      // Location filter
      if (!selectedLocations.includes('all') && selectedLocations.length > 0) {
        const locLower = (job.location || '').toLowerCase();
        const matchesLoc = selectedLocations.some(l => locLower.includes(l.toLowerCase()));
        if (!matchesLoc) return false;
      }

      return true;
    });

    // Sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === 'latest') {
        const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'company') {
        return a.companyName.localeCompare(b.companyName);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      if (sortBy === 'exp') {
        return a.experienceLevel.localeCompare(b.experienceLevel);
      }
      return 0;
    });
  }, [jobs, searchQuery, selectedCategories, selectedExpLevels, selectedWorkModes, selectedLocations, sortBy]);

  // Jobs that will actually be included in email & CSV
  const finalDigestJobs = useMemo(() => {
    if (maxJobsCount === 'all') {
      return matchingJobs;
    }
    return matchingJobs.slice(0, maxJobsCount);
  }, [matchingJobs, maxJobsCount]);

  // Generate Modern HTML Email Content
  const generatedEmailHtml = useMemo(() => {
    const jobsForEmail = finalDigestJobs.length > 0 ? finalDigestJobs : jobs.slice(0, maxJobsCount === 'all' ? jobs.length : Math.min(10, maxJobsCount));
    return generateEmailHtml({
      jobs: jobsForEmail,
      recipientEmail: testRecipientEmail || subEmail || 'subscriber@techhub.bd',
      theme: templateTheme,
      filterSummary: `${jobsForEmail.length} Position${jobsForEmail.length === 1 ? '' : 's'} Included ${attachCsv ? '• CSV Attached' : ''}`,
      isFallback: matchingJobs.length === 0
    });
  }, [finalDigestJobs, jobs, maxJobsCount, subEmail, testRecipientEmail, templateTheme, attachCsv, matchingJobs]);

  // CSV content for download/attachment
  const generatedCsvString = useMemo(() => {
    const jobsForCsv = finalDigestJobs.length > 0 ? finalDigestJobs : jobs;
    return generateJobsCsv(jobsForCsv);
  }, [finalDigestJobs, jobs]);

  // Handle Save Subscription Preferences
  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail || !subEmail.includes('@')) {
      alert('Please enter a valid subscriber email address.');
      return;
    }

    try {
      const resp = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: subEmail,
          frequency: subFrequency,
          categories: selectedCategories,
          experienceLevels: selectedExpLevels,
          workModes: selectedWorkModes,
          locations: selectedLocations,
          maxJobs: maxJobsCount === 'all' ? 9999 : maxJobsCount,
          templateTheme
        })
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        setSubSaved(true);
        fetchSubscribersCount();
        setTimeout(() => setSubSaved(false), 6000);
      } else {
        alert(data.error || 'Failed to save subscription.');
      }
    } catch (err) {
      alert('Network error registering subscription.');
    }
  };

  // Handle Send Instant Email Digest (with optional CSV attachment)
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = testRecipientEmail || subEmail;
    if (!target || !target.includes('@')) {
      alert('Please enter a valid recipient email address.');
      return;
    }

    setIsSendingTest(true);
    setTestSendSuccess(false);
    setDispatchMessage(null);

    const jobsCountToSend = finalDigestJobs.length > 0 ? finalDigestJobs.length : jobs.length;

    try {
      const response = await fetch('/api/send-job-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: target,
          subject: `Daily Tech Job Digest (${jobsCountToSend} Openings)`,
          htmlContent: generatedEmailHtml,
          jobCount: jobsCountToSend,
          csvContent: attachCsv ? generatedCsvString : undefined
        })
      });

      const data = await response.json();
      setIsSendingTest(false);

      if (response.ok && data.success) {
        setTestSendSuccess(true);
        setDispatchMessage(data.message || `Digest successfully sent to ${target}`);
        setTimeout(() => setTestSendSuccess(false), 8000);
      } else {
        alert(data.error || 'Failed to dispatch email digest.');
      }
    } catch (err) {
      setIsSendingTest(false);
      alert('Network error connecting to email API service.');
    }
  };

  const copyEmailHtml = () => {
    navigator.clipboard.writeText(generatedEmailHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  const handleDownloadCsv = () => {
    downloadJobsCsv(finalDigestJobs.length > 0 ? finalDigestJobs : jobs, `scraped_tech_jobs_${finalDigestJobs.length}_entries.csv`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 space-y-8 shadow-sm" id="email-digest-hub">
      
      {/* Title & Introduction Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
            <Mail className="w-3.5 h-3.5 text-indigo-600" />
            Instant Email Digest &amp; CSV Export System
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Email Job Digest with CSV Attachment
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Filter, sort, search, show all scraped job entries, and send styled email digests directly to your inbox with full CSV data attached.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Download CSV ({finalDigestJobs.length} Jobs)
          </button>

          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold px-3 py-1.5 rounded-xl">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>{activeSubscribersCount} Subscriber{activeSubscribersCount === 1 ? '' : 's'}</span>
          </div>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-gray-500" />
            {showPreview ? 'Hide Live Preview' : 'Show Live Email Preview'}
          </button>
        </div>
      </div>

      {/* Grid: Preferences & Email Dispatch Controls vs Email Template Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Filter, Sort & Instant Email Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 border border-indigo-100 rounded-2xl p-5 sm:p-6 space-y-5">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-600 text-white">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Email Digest Filtering &amp; Controls</h3>
                  <p className="text-xs text-gray-500">Tailor job entries before sending email or exporting CSV</p>
                </div>
              </div>

              <span className="text-xs font-bold text-indigo-600 bg-indigo-100/70 px-2.5 py-1 rounded-full">
                {matchingJobs.length} Scraped Jobs
              </span>
            </div>

            {/* Keyword Search & Sorting Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-white border border-gray-200 rounded-xl">
              <div className="sm:col-span-7 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by title, skill, or company..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-5 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 font-medium"
                >
                  <option value="latest">Sort: Latest Added</option>
                  <option value="company">Sort: Company Name</option>
                  <option value="title">Sort: Job Title</option>
                  <option value="category">Sort: Category</option>
                  <option value="exp">Sort: Experience Level</option>
                </select>
              </div>
            </div>

            {/* Form & Controls */}
            <div className="space-y-4">
              
              {/* Aspect 1: Tech Categories Multi-select */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  1. Preferred Categories
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All Categories' },
                    { id: 'frontend', label: 'Frontend' },
                    { id: 'backend', label: 'Backend' },
                    { id: 'fullstack', label: 'Full Stack' },
                    { id: 'mobile', label: 'Mobile' },
                    { id: 'devops', label: 'DevOps/Cloud' },
                    { id: 'qa', label: 'QA & Testing' },
                    { id: 'product', label: 'Product' },
                    { id: 'design', label: 'UI/UX Design' }
                  ].map(cat => {
                    const active = selectedCategories.includes(cat.id);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          active 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect 2: Experience Levels */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  2. Experience Level
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'Any Level' },
                    { id: 'intern', label: 'Freshers / Intern' },
                    { id: 'junior', label: 'Junior (1-2 yrs)' },
                    { id: 'mid', label: 'Mid-Level' },
                    { id: 'senior', label: 'Senior (5+ yrs)' },
                    { id: 'lead', label: 'Lead / Principal' }
                  ].map(lvl => {
                    const active = selectedExpLevels.includes(lvl.id);
                    return (
                      <button
                        type="button"
                        key={lvl.id}
                        onClick={() => toggleExpLevel(lvl.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          active 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect 3: Work Mode & Max Entries / Show All */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    3. Work Mode
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', label: 'All Modes' },
                      { id: 'remote', label: 'Remote' },
                      { id: 'hybrid', label: 'Hybrid' },
                      { id: 'onsite', label: 'On-site' }
                    ].map(wm => {
                      const active = selectedWorkModes.includes(wm.id);
                      return (
                        <button
                          type="button"
                          key={wm.id}
                          onClick={() => toggleWorkMode(wm.id)}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            active 
                              ? 'bg-purple-600 text-white shadow-sm' 
                              : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {wm.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    4. Max Jobs to Include
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[5, 10, 25, 50].map(count => (
                      <button
                        type="button"
                        key={count}
                        onClick={() => setMaxJobsCount(count)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          maxJobsCount === count 
                            ? 'bg-gray-900 text-white shadow-sm' 
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setMaxJobsCount('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        maxJobsCount === 'all' 
                          ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300' 
                          : 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                      }`}
                    >
                      Show All ({matchingJobs.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Aspect 4: Attach CSV & Email Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                <div className="sm:col-span-6 bg-white p-2.5 border border-gray-200 rounded-xl flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      Attach CSV File
                    </label>
                    <p className="text-[11px] text-gray-500">Include .csv attachment in email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={attachCsv}
                    onChange={e => setAttachCsv(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    5. Email Theme
                  </label>
                  <select
                    value={templateTheme}
                    onChange={e => setTemplateTheme(e.target.value as any)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800"
                  >
                    <option value="modern-indigo">Modern Indigo</option>
                    <option value="minimal-dark">Minimal Dark</option>
                    <option value="emerald-clean">Emerald Clean</option>
                    <option value="royal-violet">Royal Violet</option>
                  </select>
                </div>
              </div>

              {/* Save Subscription Row */}
              <form onSubmit={handleSaveSubscription} className="pt-2 flex flex-col sm:flex-row items-center gap-3 border-t border-gray-200/80">
                <div className="flex-1 w-full">
                  <input
                    type="email"
                    placeholder="Enter email to subscribe daily..."
                    value={subEmail}
                    onChange={e => setSubEmail(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Save Subscription
                </button>
                {subSaved && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Saved!
                  </div>
                )}
              </form>

            </div>
          </div>

          {/* Instant Email Dispatcher Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold">Dispatch Instant Email with CSV</h4>
              </div>

              {attachCsv && (
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                  CSV Attached
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Sends an instant email containing {finalDigestJobs.length} position{finalDigestJobs.length === 1 ? '' : 's'} {attachCsv ? 'and attaches a full CSV file' : ''} directly to your inbox via Resend API.
            </p>

            <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter recipient email address..."
                value={testRecipientEmail}
                onChange={e => setTestRecipientEmail(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isSendingTest}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                {isSendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {isSendingTest ? 'Sending Email & CSV...' : 'Send Email Now'}
              </button>
            </form>

            {testSendSuccess && dispatchMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{dispatchMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Email Preview & HTML Code */}
        {showPreview && (
          <div className="lg:col-span-6 space-y-4 animate-in fade-in">
            
            {/* Live Template Header Controls */}
            <div className="bg-gray-100 p-2 rounded-2xl flex flex-wrap items-center justify-between gap-2 border border-gray-200">
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setPreviewTab('visual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewTab === 'visual' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Visual Rendering ({finalDigestJobs.length} Jobs)
                </button>
                <button
                  onClick={() => setPreviewTab('code')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewTab === 'code' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  HTML Code
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCsv}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Download matching entries as CSV spreadsheet"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  CSV
                </button>

                <button
                  onClick={() => {
                    const blob = new Blob([generatedEmailHtml], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `bd-tech-job-digest-${templateTheme}.html`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold text-indigo-700 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Download raw HTML email template"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  .HTML
                </button>

                <button
                  onClick={copyEmailHtml}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 text-xs font-bold text-gray-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                  {copiedHtml ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Visual Tab */}
            {previewTab === 'visual' && (
              <div className="border border-gray-300 rounded-2xl overflow-hidden bg-white shadow-sm min-h-[580px] flex flex-col">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs text-gray-600 font-mono flex items-center justify-between">
                  <span>Subject: Daily Tech Job Digest ({finalDigestJobs.length} Openings)</span>
                  <div className="flex items-center gap-2">
                    {attachCsv && <span className="font-sans text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">CSV Attached</span>}
                    <span className="font-sans text-[11px] bg-gray-200 px-2 py-0.5 rounded text-gray-700 font-bold uppercase">{templateTheme}</span>
                  </div>
                </div>
                <iframe
                  title="Live Email Digest Preview"
                  srcDoc={generatedEmailHtml}
                  className="w-full flex-1 min-h-[520px] border-none"
                />
              </div>
            )}

            {/* Code Tab */}
            {previewTab === 'code' && (
              <div className="relative border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 p-4 font-mono text-xs text-emerald-400 min-h-[580px] max-h-[600px] overflow-y-auto">
                <pre className="whitespace-pre-wrap break-all">{generatedEmailHtml}</pre>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}

