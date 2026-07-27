import React, { useState, useMemo } from 'react';
import { Job } from '../types';
import { 
  Mail, Send, Clock, CheckCircle2, AlertCircle, Sparkles, 
  Settings, Terminal, ExternalLink, Filter, Copy, FileText, Check, ChevronRight, Zap
} from 'lucide-react';

interface EmailDigestSectionProps {
  jobs: Job[];
  initialCategory?: string;
}

export function EmailDigestSection({ jobs, initialCategory = 'all' }: EmailDigestSectionProps) {
  // Manual Email Dispatch State
  const [recipientEmail, setRecipientEmail] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedWorkMode, setSelectedWorkMode] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [emailSubject, setEmailSubject] = useState('Daily Tech Job Digest | Curated Openings');
  
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Automated Subscription Preferences State
  const [subEmail, setSubEmail] = useState('');
  const [subScheduleTime, setSubScheduleTime] = useState('09:00');
  const [subFrequency, setSubFrequency] = useState<'daily' | 'weekly'>('daily');
  const [subSaved, setSubSaved] = useState(false);

  // Active Setup Tab for Architecture Guide
  const [activeGuideTab, setActiveGuideTab] = useState<'gh-actions' | 'cron-job' | 'render-service'>('gh-actions');

  // Filter Jobs based on selected preferences
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (selectedCategory !== 'all' && job.category !== selectedCategory) return false;
      
      if (selectedWorkMode !== 'all') {
        const typeLower = (job.type || '').toLowerCase();
        if (selectedWorkMode === 'remote' && !typeLower.includes('remote')) return false;
        if (selectedWorkMode === 'hybrid' && !typeLower.includes('hybrid')) return false;
        if (selectedWorkMode === 'onsite' && (typeLower.includes('remote') || typeLower.includes('hybrid'))) return false;
      }

      if (selectedExperience !== 'all' && job.experienceLevel !== selectedExperience) return false;

      if (searchKeyword.trim() !== '') {
        const query = searchKeyword.toLowerCase();
        const titleMatch = job.title.toLowerCase().includes(query);
        const compMatch = job.companyName.toLowerCase().includes(query);
        const skillsMatch = Array.isArray(job.skills) && job.skills.some(s => s.toLowerCase().includes(query));
        if (!titleMatch && !compMatch && !skillsMatch) return false;
      }

      return true;
    });
  }, [jobs, selectedCategory, selectedWorkMode, selectedExperience, searchKeyword]);

  // Generate HTML Email Content
  const generatedEmailHtml = useMemo(() => {
    const topJobs = filteredJobs.slice(0, 10);
    return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; }
    .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 20px; }
    .job-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 12px; background-color: #f8fafc; }
    .job-title { font-size: 16px; font-weight: bold; color: #4338ca; text-decoration: none; }
    .company { font-size: 13px; color: #64748b; font-weight: 600; margin-top: 4px; }
    .badge { display: inline-block; padding: 2px 8px; font-size: 11px; font-weight: 600; border-radius: 4px; background: #e0e7ff; color: #3730a3; margin-right: 6px; }
    .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 24px; border-t: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0; color: #1e1b4b;">⚡ Bangladesh Tech Job Digest</h2>
      <p style="margin: 6px 0 0; color: #64748b; font-size: 13px;">Curated active job openings matching your search criteria</p>
    </div>
    <p>Hello!</p>
    <p>Here are <strong>${filteredJobs.length} active tech opportunities</strong> matching your custom filters:</p>
    ${topJobs.map(j => `
      <div class="job-card">
        <a href="${j.link}" target="_blank" class="job-title">${j.title}</a>
        <div class="company">${j.companyName} • ${j.location || 'Dhaka'}</div>
        <div style="margin-top: 8px;">
          <span class="badge">${j.type || 'Full-time'}</span>
          <span class="badge" style="background:#dcfce7; color:#166534;">${j.experienceLevel ? j.experienceLevel.toUpperCase() : 'MID'}</span>
          ${j.salary ? `<span class="badge" style="background:#fef3c7; color:#92400e;">${j.salary}</span>` : ''}
        </div>
      </div>
    `).join('')}
    <div class="footer">
      <p>Sent via Bangladesh Tech Hub Scraper & Digest Engine.</p>
      <p><a href="#" style="color: #6366f1;">Manage Email Preferences</a> • <a href="#" style="color: #6366f1;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
  }, [filteredJobs]);

  const [dispatchMessage, setDispatchMessage] = useState<string | null>(null);

  const handleSendManualEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    setIsSending(true);
    setSendSuccess(false);
    setDispatchMessage(null);

    try {
      const response = await fetch('/api/send-job-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          subject: emailSubject || `Daily BD Tech Job Digest (${filteredJobs.length} Positions)`,
          htmlContent: generatedEmailHtml,
          jobCount: filteredJobs.length
        })
      });

      const data = await response.json();
      setIsSending(false);

      if (response.ok && data.success) {
        setSendSuccess(true);
        setDispatchMessage(data.message || `Delivered ${filteredJobs.length} filtered jobs to ${recipientEmail}`);
        setTimeout(() => setSendSuccess(false), 8000);
      } else {
        alert(data.error || 'Failed to dispatch email digest.');
      }
    } catch (err) {
      setIsSending(false);
      alert('Network error connecting to email API service.');
    }
  };

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
          categories: [selectedCategory],
          scheduleTime: subScheduleTime
        })
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        setSubSaved(true);
        setTimeout(() => setSubSaved(false), 6000);
      } else {
        alert(data.error || 'Failed to save subscription.');
      }
    } catch (err) {
      alert('Network error registering subscription.');
    }
  };

  const copyEmailHtml = () => {
    navigator.clipboard.writeText(generatedEmailHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm" id="email-digest-hub">
      
      {/* Title & Introduction Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
            <Mail className="w-3.5 h-3.5 text-indigo-600" />
            Automated Scraper Newsletter & Dispatch
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Email Job Digest & Automated Cron Scheduler
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Send customized job alerts manually or configure Render free-tier scheduled cron scrapers to wake up and email daily digests.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-gray-500" />
            {showPreview ? 'Hide HTML Preview' : 'Preview Email HTML'}
          </button>
        </div>
      </div>

      {/* Grid Layout: Manual Email Dispatch vs Automated Schedule Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Manual Email Dispatch Form */}
        <div className="lg:col-span-7 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50/80 rounded-2xl p-5 sm:p-6 border border-indigo-100 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Send Filtered Job Digest Manually</h3>
              <p className="text-xs text-gray-500">Dispatch live scraped jobs matching your filter criteria to any email address.</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-gray-200 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Category</label>
              <select 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-medium text-gray-800"
              >
                <option value="all">All Categories ({jobs.length})</option>
                <option value="frontend">Frontend Eng.</option>
                <option value="backend">Backend Eng.</option>
                <option value="fullstack">Fullstack Eng.</option>
                <option value="mobile">Mobile Apps</option>
                <option value="devops">DevOps &amp; Cloud</option>
                <option value="qa">QA &amp; Testing</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Work Mode</label>
              <select 
                value={selectedWorkMode} 
                onChange={e => setSelectedWorkMode(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-medium text-gray-800"
              >
                <option value="all">All Modes</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Experience</label>
              <select 
                value={selectedExperience} 
                onChange={e => setSelectedExperience(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-medium text-gray-800"
              >
                <option value="all">All Levels</option>
                <option value="junior">Junior (0-2 yrs)</option>
                <option value="mid">Mid-Level (2-5 yrs)</option>
                <option value="senior">Senior (5+ yrs)</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleSendManualEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Subject Line</label>
              <input
                type="text"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                placeholder="e.g. Daily Tech Job Digest"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Recipient Email Address *</label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                placeholder="e.g. developer@company.com"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="text-xs text-gray-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <strong>{filteredJobs.length} active postings</strong> selected for this email digest
              </div>

              <button
                type="submit"
                disabled={isSending || filteredJobs.length === 0}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin text-indigo-200" />
                    Dispatching Email...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Job Digest Now
                  </>
                )}
              </button>
            </div>

            {sendSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <strong>Email digest status:</strong> {dispatchMessage || `Delivered ${filteredJobs.length} filtered jobs to ${recipientEmail}.`}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Automated Subscriber Preferences & Schedule Settings */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-50/40 via-white to-amber-50/30 rounded-2xl p-5 sm:p-6 border border-emerald-100/80 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Subscribe for Scheduled Alerts</h3>
              <p className="text-xs text-gray-500">Configure daily automated newsletters pushed when scrapers wake up.</p>
            </div>
          </div>

          <form onSubmit={handleSaveSubscription} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Subscriber Email</label>
              <input
                type="email"
                required
                value={subEmail}
                onChange={e => setSubEmail(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                placeholder="your.email@gmail.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Daily Delivery Time</label>
                <select
                  value={subScheduleTime}
                  onChange={e => setSubScheduleTime(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-medium text-gray-800"
                >
                  <option value="08:00">08:00 AM BST</option>
                  <option value="09:00">09:00 AM BST (Morning)</option>
                  <option value="12:00">12:00 PM BST (Noon)</option>
                  <option value="18:00">06:00 PM BST (Evening)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Frequency</label>
                <select
                  value={subFrequency}
                  onChange={e => setSubFrequency(e.target.value as 'daily' | 'weekly')}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-medium text-gray-800"
                >
                  <option value="daily">Every Morning (Daily)</option>
                  <option value="weekly">Weekly Summary (Sunday)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              Save Subscriber Alert Preference
            </button>

            {subSaved && (
              <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                Alert scheduled! Scraper will wake up at <strong>{subScheduleTime} BST ({subFrequency})</strong> and dispatch newsletter to <span className="font-mono">{subEmail}</span>.
              </div>
            )}
          </form>

          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              Render Free Tier Sleep Handling
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800/90">
              Render free tier services enter sleep mode after 15 minutes of inactivity. See the guide below to wake up the scraper automatically at exact times using GitHub Actions or Cron-Job.org.
            </p>
          </div>
        </div>

      </div>

      {/* Email HTML Preview Accordion */}
      {showPreview && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 border border-slate-800 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Generated HTML Newsletter Digest Preview ({filteredJobs.length} jobs)
            </h4>
            <button
              onClick={copyEmailHtml}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedHtml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedHtml ? 'Copied HTML!' : 'Copy Raw HTML'}
            </button>
          </div>

          <div className="bg-white rounded-xl p-4 text-slate-900 max-h-96 overflow-y-auto border border-slate-700">
            <iframe
              title="Newsletter Preview"
              srcDoc={generatedEmailHtml}
              className="w-full h-80 border-0 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Render Free Tier Automated Cron & Scraper Architecture Guide */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold mb-2">
              <Terminal className="w-3.5 h-3.5" />
              Render Free Tier Cron &amp; Scraper Architecture
            </div>
            <h3 className="text-lg font-bold text-white">How to Wake Scraper &amp; Send Newsletters on Render Free Tier</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Since Render web services go to sleep on free trial, use a scheduled trigger to wake up the app and send emails.
            </p>
          </div>

          {/* Guide Selector Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setActiveGuideTab('gh-actions')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeGuideTab === 'gh-actions' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. GitHub Actions Cron (Recommended)
            </button>
            <button
              onClick={() => setActiveGuideTab('cron-job')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeGuideTab === 'cron-job' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Cron-Job.org / Upstash
            </button>
            <button
              onClick={() => setActiveGuideTab('render-service')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeGuideTab === 'render-service' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Backend API Route Code
            </button>
          </div>
        </div>

        {/* Tab 1: GitHub Actions Cron */}
        {activeGuideTab === 'gh-actions' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <p className="text-slate-300 leading-relaxed">
              GitHub Actions offers <strong>2,000 free workflow minutes/month</strong>. You can add a workflow file to automatically wake your Render app at 9:00 AM BST (03:00 UTC), run scraping, and trigger Resend or Nodemailer.
            </p>
            
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
              <span className="text-slate-500"># Save as .github/workflows/daily-scraper-newsletter.yml</span><br/>
              <span className="text-purple-400">name</span>: <span className="text-emerald-300">Daily Scraper &amp; Email Newsletter Cron</span><br/><br/>
              <span className="text-purple-400">on</span>:<br/>
              &nbsp;&nbsp;<span className="text-purple-400">schedule</span>:<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;- <span className="text-purple-400">cron</span>: <span className="text-amber-300">'0 3 * * *'</span> <span className="text-slate-500"># 3:00 AM UTC = 9:00 AM Bangladesh Standard Time</span><br/>
              &nbsp;&nbsp;<span className="text-purple-400">workflow_dispatch</span>: <span className="text-slate-500"># Allows manual trigger anytime</span><br/><br/>
              <span className="text-purple-400">jobs</span>:<br/>
              &nbsp;&nbsp;<span className="text-purple-400">trigger-scraper-and-email</span>:<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">runs-on</span>: <span className="text-emerald-300">ubuntu-latest</span><br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">steps</span>:<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- <span className="text-purple-400">name</span>: <span className="text-emerald-300">Ping Render Endpoint to Wake Up &amp; Dispatch Digest</span><br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">run</span>: |<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;curl -X POST https://your-app.onrender.com/api/cron/daily-digest \<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-H "Authorization: Bearer \${'{ secrets.CRON_SECRET }'}" \<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-H "Content-Type: application/json"
            </div>
          </div>
        )}

        {/* Tab 2: Cron-Job.org / Upstash QStash */}
        {activeGuideTab === 'cron-job' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <p className="text-slate-300 leading-relaxed">
              If you don't use GitHub Actions, you can use <strong>cron-job.org</strong> (100% free external HTTP pinger) or <strong>Upstash QStash</strong>:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h5 className="font-bold text-indigo-400 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Option A: Cron-Job.org (Free Webhook)
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                  <li>Create a free account on <code className="text-emerald-300">cron-job.org</code>.</li>
                  <li>Set Title: "Wake Scraper &amp; Send Job Digest".</li>
                  <li>URL: <code className="text-amber-300">https://your-app.onrender.com/api/cron/daily-digest</code></li>
                  <li>Schedule: Daily at 09:00 AM Asia/Dhaka.</li>
                  <li>Request Method: <code className="text-indigo-300">POST</code> with secret auth header.</li>
                </ol>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h5 className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Option B: Resend / SendGrid Integration
                </h5>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Use Resend API (<code className="text-emerald-300">npm install resend</code>) with 3,000 free emails/month to send responsive HTML job alerts directly to subscribers without managing SMTP credentials.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Server API Route Code */}
        {activeGuideTab === 'render-service' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <p className="text-slate-300 leading-relaxed">
              Add this endpoint in your Node/Express backend (<code className="text-indigo-300">server.ts</code> or <code className="text-indigo-300">/api/cron/daily-digest.ts</code>) to handle scheduled scraper triggers and emails:
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
              <span className="text-purple-400">import</span> express <span className="text-purple-400">from</span> <span className="text-emerald-300">'express'</span>;<br/>
              <span className="text-purple-400">import</span> &#123; Resend &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">'resend'</span>;<br/><br/>
              <span className="text-purple-400">const</span> resend = <span className="text-purple-400">new</span> Resend(process.env.<span className="text-amber-300">RESEND_API_KEY</span>);<br/><br/>
              app.<span className="text-indigo-400">post</span>(<span className="text-emerald-300">'/api/cron/daily-digest'</span>, <span className="text-purple-400">async</span> (req, res) =&gt; &#123;<br/>
              &nbsp;&nbsp;<span className="text-slate-500">// 1. Authenticate secret cron token</span><br/>
              &nbsp;&nbsp;<span className="text-purple-400">if</span> (req.headers.authorization !== <span className="text-emerald-300">'Bearer ' + process.env.CRON_SECRET</span>) &#123;<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> res.<span className="text-indigo-400">status</span>(401).<span className="text-indigo-400">json</span>(&#123; error: <span className="text-emerald-300">'Unauthorized'</span> &#125;);<br/>
              &nbsp;&nbsp;&#125;<br/><br/>
              &nbsp;&nbsp;<span className="text-slate-500">// 2. Wake scraper to fetch fresh jobs from Bangladeshi career portals</span><br/>
              &nbsp;&nbsp;<span className="text-purple-400">const</span> freshJobs = <span className="text-purple-400">await</span> <span className="text-indigo-400">runScraperEngine</span>();<br/><br/>
              &nbsp;&nbsp;<span className="text-slate-500">// 3. Query active subscribers and dispatch personalized HTML digests</span><br/>
              &nbsp;&nbsp;<span className="text-purple-400">const</span> subscribers = <span className="text-purple-400">await</span> <span className="text-indigo-400">getSubscribersFromDb</span>();<br/>
              &nbsp;&nbsp;<span className="text-purple-400">for</span> (<span className="text-purple-400">const</span> sub <span className="text-purple-400">of</span> subscribers) &#123;<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">const</span> matching = freshJobs.<span className="text-indigo-400">filter</span>(j =&gt; j.category === sub.preferredCategory);<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">await</span> resend.emails.<span className="text-indigo-400">send</span>(&#123;<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;from: <span className="text-emerald-300">'alerts@techhub.bd'</span>,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;to: sub.email,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;subject: <span className="text-emerald-300">'Daily Tech Jobs Digest'</span>,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;html: <span className="text-indigo-400">generateHtmlNewsletter</span>(matching)<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&#125;);<br/>
              &nbsp;&nbsp;&#125;<br/>
              &nbsp;&nbsp;<span className="text-purple-400">return</span> res.<span className="text-indigo-400">json</span>(&#123; success: <span className="text-purple-400">true</span>, dispatched: subscribers.length &#125;);<br/>
              &#125;);
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
