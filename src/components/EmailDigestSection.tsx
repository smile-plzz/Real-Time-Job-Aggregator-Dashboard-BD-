import React, { useState, useMemo, useEffect } from 'react';
import { Job } from '../types';
import { generateEmailHtml } from '../utils/emailTemplate';
import { 
  Mail, Send, Clock, CheckCircle2, AlertCircle, Sparkles, 
  Settings, Terminal, ExternalLink, Filter, Copy, FileText, Check, ChevronRight, Zap, RefreshCw, Layout, Users, Sliders
} from 'lucide-react';

interface EmailDigestSectionProps {
  jobs: Job[];
  initialCategory?: string;
}

export function EmailDigestSection({ jobs, initialCategory = 'all' }: EmailDigestSectionProps) {
  // Subscription Preferences State
  const [subEmail, setSubEmail] = useState('');
  const [subFrequency, setSubFrequency] = useState<'daily' | 'weekly'>('daily');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory !== 'all' ? [initialCategory] : ['all']);
  const [selectedExpLevels, setSelectedExpLevels] = useState<string[]>(['all']);
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>(['all']);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['all']);
  const [maxJobsCount, setMaxJobsCount] = useState<number>(10);
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
  const [isTriggeringCron, setIsTriggeringCron] = useState(false);
  const [cronResult, setCronResult] = useState<any>(null);

  // Architecture Guide Tab
  const [activeGuideTab, setActiveGuideTab] = useState<'gh-actions' | 'cron-job' | 'render-service'>('gh-actions');

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

  // Filter Jobs based on selected multi-aspect preferences
  const matchingJobs = useMemo(() => {
    return jobs.filter(job => {
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
  }, [jobs, selectedCategories, selectedExpLevels, selectedWorkModes, selectedLocations]);

  // Generate Modern HTML Email Content
  const generatedEmailHtml = useMemo(() => {
    const limitedJobs = matchingJobs.slice(0, maxJobsCount);
    return generateEmailHtml({
      jobs: limitedJobs.length > 0 ? limitedJobs : jobs.slice(0, Math.min(8, maxJobsCount)),
      recipientEmail: subEmail || testRecipientEmail || 'subscriber@techhub.bd',
      theme: templateTheme,
      filterSummary: `${matchingJobs.length} Matching Positions`,
      isFallback: matchingJobs.length === 0
    });
  }, [matchingJobs, jobs, maxJobsCount, subEmail, testRecipientEmail, templateTheme]);

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
          maxJobs: maxJobsCount,
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

  // Handle Send Manual Test Email
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

    try {
      const response = await fetch('/api/send-job-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: target,
          subject: `Daily Tech Job Digest (${matchingJobs.length} Openings)`,
          htmlContent: generatedEmailHtml,
          jobCount: matchingJobs.length
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

  // Trigger Cron Endpoint Manually
  const handleTriggerCronNow = async () => {
    setIsTriggeringCron(true);
    setCronResult(null);
    try {
      const resp = await fetch('/api/cron/daily-digest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer default_secret_token'
        }
      });
      const data = await resp.json();
      setIsTriggeringCron(false);
      setCronResult(data);
    } catch (err) {
      setIsTriggeringCron(false);
      alert('Failed triggering cron endpoint.');
    }
  };

  const copyEmailHtml = () => {
    navigator.clipboard.writeText(generatedEmailHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 space-y-8 shadow-sm" id="email-digest-hub">
      
      {/* Title & Introduction Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
            <Mail className="w-3.5 h-3.5 text-indigo-600" />
            Modern Email Digest &amp; Multi-Aspect Newsletter System
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Customizable Email Job Digest &amp; Cron Scheduler
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Personalize tech category preferences, work modes, and minimalist design themes. Automated via Render / GitHub Actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>{activeSubscribersCount} Active Subscriber{activeSubscribersCount === 1 ? '' : 's'}</span>
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

      {/* Grid: Preferences Setup vs Email Template Design & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Multi-Aspect Filter Preferences */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 border border-indigo-100 rounded-2xl p-5 sm:p-6 space-y-5">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-600 text-white">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Custom Alert Preferences</h3>
                  <p className="text-xs text-gray-500">Tailor what jobs trigger your daily email newsletter</p>
                </div>
              </div>

              <span className="text-xs font-bold text-indigo-600 bg-indigo-100/70 px-2.5 py-1 rounded-full">
                {matchingJobs.length} Jobs Match Today
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSubscription} className="space-y-4">
              
              {/* Subscriber Email & Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Subscriber Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={subEmail}
                    onChange={e => setSubEmail(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Frequency</label>
                  <select
                    value={subFrequency}
                    onChange={e => setSubFrequency(e.target.value as 'daily' | 'weekly')}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-medium text-gray-800"
                  >
                    <option value="daily">Daily (9 AM BST)</option>
                    <option value="weekly">Weekly (Mondays)</option>
                  </select>
                </div>
              </div>

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

              {/* Aspect 3: Work Mode */}
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
                    4. Max Jobs in Digest
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[5, 8, 10, 15, 20].map(count => (
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
                  </div>
                </div>
              </div>

              {/* Aspect 4: Minimalist Email Design Themes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  5. Minimalist Design Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'modern-indigo', name: 'Modern Indigo', color: 'bg-indigo-600' },
                    { id: 'minimal-dark', name: 'Minimal Dark', color: 'bg-slate-900' },
                    { id: 'emerald-clean', name: 'Emerald Clean', color: 'bg-emerald-600' },
                    { id: 'royal-violet', name: 'Royal Violet', color: 'bg-purple-700' }
                  ].map(thm => (
                    <button
                      type="button"
                      key={thm.id}
                      onClick={() => setTemplateTheme(thm.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        templateTheme === thm.id 
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20' 
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${thm.color}`} />
                      <span className="truncate">{thm.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Save &amp; Subscribe to Digest
                </button>

                {subSaved && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Subscription Preferences Saved!
                  </div>
                )}
              </div>

            </form>
          </div>

          {/* Instant Test Email Dispatcher Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold">Dispatch Test Email Now</h4>
            </div>
            <p className="text-xs text-slate-400">
              Send a test copy of this minimalist HTML template directly to your inbox via Resend API.
            </p>

            <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter recipient email..."
                value={testRecipientEmail}
                onChange={e => setTestRecipientEmail(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isSendingTest}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {isSendingTest ? 'Sending...' : 'Send Test Digest'}
              </button>
            </form>

            {testSendSuccess && dispatchMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold flex items-center gap-2">
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
            <div className="bg-gray-100 p-2 rounded-2xl flex items-center justify-between gap-2 border border-gray-200">
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setPreviewTab('visual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewTab === 'visual' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Visual Rendering
                </button>
                <button
                  onClick={() => setPreviewTab('code')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewTab === 'code' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  HTML Source Code
                </button>
              </div>

              <div className="flex items-center gap-2">
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
                  Download .html
                </button>

                <button
                  onClick={copyEmailHtml}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 text-xs font-bold text-gray-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                  {copiedHtml ? 'Copied HTML!' : 'Copy Code'}
                </button>
              </div>
            </div>

            {/* Visual Tab */}
            {previewTab === 'visual' && (
              <div className="border border-gray-300 rounded-2xl overflow-hidden bg-white shadow-sm min-h-[580px] flex flex-col">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs text-gray-500 font-mono flex items-center justify-between">
                  <span>Subject: Daily BD Tech Job Digest ({matchingJobs.length} Matching Positions)</span>
                  <span className="font-sans text-[11px] bg-gray-200 px-2 py-0.5 rounded text-gray-700 font-bold uppercase">{templateTheme}</span>
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

      {/* Section 3: Render Free Tier & GitHub Actions Automated Cron Hub */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold mb-2">
              <Terminal className="w-3.5 h-3.5" />
              Automated Daily Cron &amp; Scraper Dispatcher
            </div>
            <h3 className="text-lg font-bold text-white">Daily Morning Automation Hub</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Trigger scraper scans and newsletter dispatching automatically at 09:00 AM BST every day.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerCronNow}
              disabled={isTriggeringCron}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTriggeringCron ? 'animate-spin' : ''}`} />
              {isTriggeringCron ? 'Triggering Cron Scraper...' : 'Trigger Cron Worker Now'}
            </button>
          </div>
        </div>

        {/* Cron Execution Output Result Banner */}
        {cronResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 space-y-1 animate-in fade-in">
            <div className="font-bold text-amber-400">⚡ Cron Execution Response:</div>
            <div>Status: {cronResult.success ? 'SUCCESS' : 'FAILED'}</div>
            <div>Active Jobs Scraped: {cronResult.activeJobsCount}</div>
            <div>Total Subscribers Processed: {cronResult.totalSubscribers}</div>
            <div>Emails Delivered: {cronResult.emailsSent}</div>
            <div className="text-slate-400 text-[11px] pt-1">{cronResult.message}</div>
          </div>
        )}

        {/* Guide Selector Tabs */}
        <div className="space-y-4">
          <div className="flex bg-slate-800/80 p-1 rounded-xl text-xs font-semibold shrink-0 max-w-md">
            <button
              onClick={() => setActiveGuideTab('gh-actions')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeGuideTab === 'gh-actions' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. GitHub Actions Cron
            </button>
            <button
              onClick={() => setActiveGuideTab('cron-job')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeGuideTab === 'cron-job' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Cron-Job.org
            </button>
            <button
              onClick={() => setActiveGuideTab('render-service')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeGuideTab === 'render-service' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Backend API Route
            </button>
          </div>

          {/* Tab 1: GitHub Actions Cron */}
          {activeGuideTab === 'gh-actions' && (
            <div className="space-y-3 text-xs animate-in fade-in">
              <p className="text-slate-300 leading-relaxed">
                GitHub Actions automatically triggers at 9:00 AM BST (03:00 UTC) every day, pings your Render deployment endpoint, triggers the job scraper scan, and delivers filtered HTML digests to all subscribers.
              </p>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <span className="text-slate-500"># Workflow saved in .github/workflows/daily-scraper-newsletter.yml</span><br/>
                <span className="text-purple-400">name</span>: <span className="text-emerald-300">Daily Scraper &amp; Email Newsletter Cron</span><br/><br/>
                <span className="text-purple-400">on</span>:<br/>
                &nbsp;&nbsp;<span className="text-purple-400">schedule</span>:<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;- <span className="text-purple-400">cron</span>: <span className="text-amber-300">'0 3 * * *'</span><br/>
                &nbsp;&nbsp;<span className="text-purple-400">workflow_dispatch</span>:<br/><br/>
                <span className="text-purple-400">jobs</span>:<br/>
                &nbsp;&nbsp;<span className="text-purple-400">wake-scraper-and-send-email</span>:<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">runs-on</span>: <span className="text-emerald-300">ubuntu-latest</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">steps</span>:<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- <span className="text-purple-400">name</span>: <span className="text-emerald-300">Ping Render / App Service Endpoint</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">run</span>: |<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;curl -X POST "https://real-time-job-aggregator-dashboard-bd.onrender.com/api/cron/daily-digest" \<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-H "Authorization: Bearer \${'{ secrets.CRON_SECRET }'}" \<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-H "Content-Type: application/json"
              </div>
            </div>
          )}

          {/* Tab 2: Cron-Job.org */}
          {activeGuideTab === 'cron-job' && (
            <div className="space-y-3 text-xs animate-in fade-in">
              <p className="text-slate-300 leading-relaxed">
                If using an external HTTP pinger like <strong>cron-job.org</strong> or <strong>Upstash QStash</strong>:
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-slate-300 text-[11px]">
                <div>• Target Endpoint URL: <code className="text-amber-300">https://real-time-job-aggregator-dashboard-bd.onrender.com/api/cron/daily-digest</code></div>
                <div>• HTTP Method: <code className="text-indigo-400 font-bold">POST</code></div>
                <div>• Header: <code className="text-emerald-300">Authorization: Bearer default_secret_token</code></div>
                <div>• Schedule: Daily at 09:00 AM (Asia/Dhaka time)</div>
              </div>
            </div>
          )}

          {/* Tab 3: Server Endpoint */}
          {activeGuideTab === 'render-service' && (
            <div className="space-y-3 text-xs animate-in fade-in">
              <p className="text-slate-300 leading-relaxed">
                The backend endpoint <code className="text-indigo-300">/api/cron/daily-digest</code> performs smart filtering per subscriber and sends emails via Resend API:
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                app.<span className="text-indigo-400">post</span>(<span className="text-emerald-300">'/api/cron/daily-digest'</span>, <span className="text-purple-400">async</span> (req, res) =&gt; &#123;<br/>
                &nbsp;&nbsp;<span className="text-slate-500">// Scrapes fresh job listings across Bangladeshi tech portals</span><br/>
                &nbsp;&nbsp;<span className="text-purple-400">const</span> freshJobs = <span className="text-purple-400">await</span> <span className="text-indigo-400">getJobs</span>();<br/>
                &nbsp;&nbsp;<span className="text-purple-400">const</span> activeSubs = <span className="text-purple-400">await</span> <span className="text-indigo-400">getActiveSubscribers</span>();<br/><br/>
                &nbsp;&nbsp;<span className="text-purple-400">for</span> (<span className="text-purple-400">const</span> sub <span className="text-purple-400">of</span> activeSubs) &#123;<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">const</span> emailHtml = <span className="text-indigo-400">buildDigestHtmlForSubscriber</span>(sub, freshJobs);<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">await</span> <span className="text-indigo-400">sendViaResend</span>(sub.email, emailHtml);<br/>
                &nbsp;&nbsp;&#125;<br/>
                &nbsp;&nbsp;<span className="text-purple-400">return</span> res.<span className="text-indigo-400">json</span>(&#123; success: <span className="text-purple-400">true</span> &#125;);<br/>
                &#125;);
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
