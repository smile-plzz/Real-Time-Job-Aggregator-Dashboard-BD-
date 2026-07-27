import React, { useMemo, useState } from 'react';
import { Job, Company, validateJob } from '../types';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, CartesianGrid, Legend 
} from 'recharts';
import { 
  TrendingUp, Activity, Zap, Cpu, Flame, Compass, Building2, 
  Briefcase, Award, CheckCircle2, ShieldCheck, PieChart as PieIcon, 
  BarChart3, Layers, Sparkles, AlertCircle, Check, Globe, MapPin, Laptop,
  ExternalLink, ChevronRight, Filter
} from 'lucide-react';
import { DetailModal, DetailModalProps } from './DetailModal';

interface MarketPulseProps {
  jobs: Job[];
  companies: Company[];
}

const CATEGORY_COLORS: Record<string, string> = {
  frontend: '#6366F1',   // Indigo
  backend: '#8B5CF6',    // Violet
  fullstack: '#EC4899',  // Pink
  mobile: '#3B82F6',     // Blue
  devops: '#10B981',     // Emerald
  qa: '#F59E0B',         // Amber
  product: '#06B6D4',    // Cyan
  design: '#14B8A6',     // Teal
  other: '#6B7280'       // Gray
};

const CATEGORY_LABELS: Record<string, string> = {
  frontend: 'Frontend Eng.',
  backend: 'Backend Eng.',
  fullstack: 'Fullstack Eng.',
  mobile: 'Mobile Apps',
  devops: 'DevOps & Cloud',
  qa: 'QA & Testing',
  product: 'Product & Mgmt',
  design: 'UI/UX Design',
  other: 'Other Tech'
};

const EXPERIENCE_LABELS: Record<string, string> = {
  intern: 'Internship',
  junior: 'Junior (0-2 yrs)',
  mid: 'Mid-Level (2-5 yrs)',
  senior: 'Senior (5+ yrs)',
  lead: 'Lead / Principal',
  unspecified: 'Unspecified'
};

export default function MarketPulse({ jobs, companies }: MarketPulseProps) {
  // --- Modal State ---
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    badge?: string;
    jobs: Job[];
    companyProfile?: Company;
    statsSummary?: { label: string; value: string | number; color?: string }[];
  }>({
    isOpen: false,
    title: '',
    jobs: []
  });

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  // Modal Handlers
  const openCompanyModal = (companyName: string) => {
    const compJobs = jobs.filter(j => j.companyName.toLowerCase().trim() === companyName.toLowerCase().trim());
    const profile = companies.find(c => c.name.toLowerCase().trim() === companyName.toLowerCase().trim());
    
    // Disclosed salaries count
    const disclosed = compJobs.filter(j => j.salary && !j.salary.toLowerCase().includes('negotiable')).length;

    setModalState({
      isOpen: true,
      title: `${companyName}`,
      subtitle: `Currently recruiting for ${compJobs.length} active position${compJobs.length === 1 ? '' : 's'} in Bangladesh`,
      icon: <Building2 className="w-6 h-6 text-indigo-400" />,
      badge: 'Actively Recruiting',
      jobs: compJobs,
      companyProfile: profile,
      statsSummary: [
        { label: 'Open Positions', value: compJobs.length, color: 'text-indigo-600' },
        { label: 'Disclosed Salary', value: `${disclosed} jobs`, color: 'text-amber-600' },
        { label: 'Location', value: profile?.location || compJobs[0]?.location || 'Dhaka', color: 'text-gray-900' },
        { label: 'Company Size', value: profile?.size || 'N/A', color: 'text-emerald-600' }
      ]
    });
  };

  const openCategoryModal = (catKey: string) => {
    const matchedJobs = jobs.filter(j => (j.category || 'other').toLowerCase() === catKey.toLowerCase());
    const catLabel = CATEGORY_LABELS[catKey] || catKey;

    setModalState({
      isOpen: true,
      title: `${catLabel} Positions`,
      subtitle: `Detailed breakdown of all ${matchedJobs.length} open roles in ${catLabel}`,
      icon: <PieIcon className="w-6 h-6 text-indigo-400" />,
      badge: `${Math.round((matchedJobs.length / (jobs.length || 1)) * 100)}% of Market`,
      jobs: matchedJobs,
      statsSummary: [
        { label: 'Category Roles', value: matchedJobs.length, color: 'text-indigo-600' },
        { label: 'Active Companies', value: new Set(matchedJobs.map(j => j.companyName)).size, color: 'text-violet-600' },
        { label: 'Remote Friendly', value: matchedJobs.filter(j => (j.type || '').toLowerCase().includes('remote')).length, color: 'text-emerald-600' }
      ]
    });
  };

  const openSkillModal = (skillName: string) => {
    const matchedJobs = jobs.filter(j => 
      Array.isArray(j.skills) && j.skills.some(s => s.toLowerCase().trim() === skillName.toLowerCase().trim())
    );

    setModalState({
      isOpen: true,
      title: `Skill Demand: ${skillName}`,
      subtitle: `${matchedJobs.length} active job posting${matchedJobs.length === 1 ? '' : 's'} explicitly requiring ${skillName}`,
      icon: <Flame className="w-6 h-6 text-amber-400" />,
      badge: 'In-Demand Tech',
      jobs: matchedJobs,
      statsSummary: [
        { label: 'Matching Jobs', value: matchedJobs.length, color: 'text-indigo-600' },
        { label: 'Employers Hiring', value: new Set(matchedJobs.map(j => j.companyName)).size, color: 'text-emerald-600' }
      ]
    });
  };

  const openExperienceModal = (expLevel: string) => {
    const matchedJobs = jobs.filter(j => {
      const jExp = (j.experienceLevel || 'unspecified').toLowerCase();
      const tExp = expLevel.toLowerCase();
      if (jExp === tExp) return true;
      if (tExp === 'junior' && (jExp.includes('junior') || jExp.includes('0-2') || jExp.includes('entry'))) return true;
      if (tExp === 'mid' && (jExp.includes('mid') || jExp.includes('2-5'))) return true;
      if (tExp === 'senior' && (jExp.includes('senior') || jExp.includes('5+'))) return true;
      if (tExp === 'lead' && (jExp.includes('lead') || jExp.includes('architect'))) return true;
      if (tExp === 'intern' && (jExp.includes('intern') || jExp.includes('trainee'))) return true;
      return false;
    });
    const label = EXPERIENCE_LABELS[expLevel] || expLevel;

    setModalState({
      isOpen: true,
      title: `Experience Level: ${label}`,
      subtitle: `Showing ${matchedJobs.length} active job listings for ${label} applicants`,
      icon: <Compass className="w-6 h-6 text-violet-400" />,
      badge: 'Seniority Filter',
      jobs: matchedJobs,
      statsSummary: [
        { label: 'Level Vacancies', value: matchedJobs.length, color: 'text-violet-600' },
        { label: 'Hiring Companies', value: new Set(matchedJobs.map(j => j.companyName)).size, color: 'text-indigo-600' }
      ]
    });
  };

  const openWorkModeModal = (mode: 'remote' | 'hybrid' | 'onsite') => {
    const matchedJobs = jobs.filter(j => {
      const typeLower = (j.type || '').toLowerCase();
      const titleLower = (j.title || '').toLowerCase();
      if (mode === 'remote') return typeLower.includes('remote') || titleLower.includes('remote');
      if (mode === 'hybrid') return typeLower.includes('hybrid') || titleLower.includes('hybrid');
      return !typeLower.includes('remote') && !typeLower.includes('hybrid') && !titleLower.includes('remote') && !titleLower.includes('hybrid');
    });

    const titleMap = { remote: 'Remote Positions', hybrid: 'Hybrid Positions', onsite: 'Onsite / Office Positions' };

    setModalState({
      isOpen: true,
      title: titleMap[mode],
      subtitle: `Showing ${matchedJobs.length} open positions with ${mode} work pattern`,
      icon: <Laptop className="w-6 h-6 text-emerald-400" />,
      badge: `${mode.toUpperCase()} WORK`,
      jobs: matchedJobs,
      statsSummary: [
        { label: 'Total Openings', value: matchedJobs.length, color: 'text-emerald-600' },
        { label: 'Unique Employers', value: new Set(matchedJobs.map(j => j.companyName)).size, color: 'text-indigo-600' }
      ]
    });
  };

  const openHubModal = (hubName: string) => {
    const matchedJobs = jobs.filter(j => {
      const loc = (j.location || '').toLowerCase();
      const type = (j.type || '').toLowerCase();
      if (hubName.includes('International Remote')) return type.includes('remote') || loc.includes('remote');
      if (hubName.includes('Gulshan')) return loc.includes('gulshan') || loc.includes('banani');
      if (hubName.includes('Uttara')) return loc.includes('uttara') || loc.includes('nikunja');
      if (hubName.includes('Dhanmondi')) return loc.includes('dhanmondi') || loc.includes('mohakhali');
      if (hubName.includes('Chattogram')) return loc.includes('chittagong') || loc.includes('chattogram') || loc.includes('sylhet');
      return true;
    });

    setModalState({
      isOpen: true,
      title: `Tech Cluster: ${hubName}`,
      subtitle: `Listings located in or remote to ${hubName}`,
      icon: <MapPin className="w-6 h-6 text-indigo-400" />,
      badge: 'Location Cluster',
      jobs: matchedJobs,
      statsSummary: [
        { label: 'Cluster Listings', value: matchedJobs.length, color: 'text-indigo-600' },
        { label: 'Companies', value: new Set(matchedJobs.map(j => j.companyName)).size, color: 'text-emerald-600' }
      ]
    });
  };

  // --- Computations ---

  // Actively Recruiting Companies (computed directly from live scraped jobs)
  const activelyRecruitingCompanies = useMemo(() => {
    const map: Record<string, { name: string; jobs: Job[]; companyProfile?: Company }> = {};
    
    jobs.forEach(j => {
      const cName = j.companyName || 'Unknown';
      if (!map[cName]) {
        const comp = companies.find(c => c.name.toLowerCase().trim() === cName.toLowerCase().trim());
        map[cName] = { name: cName, jobs: [], companyProfile: comp };
      }
      map[cName].jobs.push(j);
    });

    return Object.values(map).sort((a, b) => b.jobs.length - a.jobs.length);
  }, [jobs, companies]);

  // 1. Category Distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(j => {
      const cat = j.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([key, count]) => ({
        key,
        name: CATEGORY_LABELS[key] || key,
        count,
        percentage: Math.round((count / (jobs.length || 1)) * 100),
        color: CATEGORY_COLORS[key] || '#6B7280'
      }))
      .sort((a, b) => b.count - a.count);
  }, [jobs]);

  // 2. Top Skills Frequency
  const topSkillsData = useMemo(() => {
    const skillCounts: Record<string, number> = {};
    jobs.forEach(j => {
      if (Array.isArray(j.skills)) {
        j.skills.forEach(s => {
          if (!s) return;
          const cleanSkill = s.trim();
          if (cleanSkill.length > 0) {
            skillCounts[cleanSkill] = (skillCounts[cleanSkill] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(skillCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / (jobs.length || 1)) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [jobs]);

  // 3. Experience Level Radar & Distribution
  const experienceData = useMemo(() => {
    const expCounts: Record<string, number> = {
      intern: 0,
      junior: 0,
      mid: 0,
      senior: 0,
      lead: 0,
      unspecified: 0
    };

    jobs.forEach(j => {
      const lvl = j.experienceLevel || 'unspecified';
      if (expCounts[lvl] !== undefined) {
        expCounts[lvl]++;
      } else {
        expCounts.unspecified++;
      }
    });

    return [
      { key: 'intern', subject: 'Intern', count: expCounts.intern, fullMark: jobs.length },
      { key: 'junior', subject: 'Junior', count: expCounts.junior, fullMark: jobs.length },
      { key: 'mid', subject: 'Mid-Level', count: expCounts.mid, fullMark: jobs.length },
      { key: 'senior', subject: 'Senior', count: expCounts.senior, fullMark: jobs.length },
      { key: 'lead', subject: 'Lead / Mgr', count: expCounts.lead, fullMark: jobs.length },
      { key: 'unspecified', subject: 'Unspecified', count: expCounts.unspecified, fullMark: jobs.length }
    ];
  }, [jobs]);

  // 4. Top Hiring Employers
  const topEmployersData = useMemo(() => {
    const companyCounts: Record<string, number> = {};
    jobs.forEach(j => {
      const name = j.companyName || 'Unknown';
      companyCounts[name] = (companyCounts[name] || 0) + 1;
    });

    return Object.entries(companyCounts)
      .map(([name, count]) => ({
        name: name.length > 18 ? `${name.substring(0, 16)}...` : name,
        fullName: name,
        jobs: count
      }))
      .sort((a, b) => b.jobs - a.jobs)
      .slice(0, 8);
  }, [jobs]);

  // 5. Work Mode Telemetry
  const workModeTelemetry = useMemo(() => {
    let remote = 0;
    let hybrid = 0;
    let onsite = 0;

    jobs.forEach(j => {
      const typeLower = (j.type || '').toLowerCase();
      const titleLower = (j.title || '').toLowerCase();
      if (typeLower.includes('remote') || titleLower.includes('remote')) remote++;
      else if (typeLower.includes('hybrid') || titleLower.includes('hybrid')) hybrid++;
      else onsite++;
    });

    const total = jobs.length || 1;
    return {
      remote,
      hybrid,
      onsite,
      remotePct: Math.round((remote / total) * 100),
      hybridPct: Math.round((hybrid / total) * 100),
      onsitePct: Math.round((onsite / total) * 100),
      chartData: [
        { name: 'Remote', mode: 'remote' as const, count: remote, color: '#10B981' },
        { name: 'Hybrid', mode: 'hybrid' as const, count: hybrid, color: '#6366F1' },
        { name: 'Onsite', mode: 'onsite' as const, count: onsite, color: '#F59E0B' }
      ]
    };
  }, [jobs]);

  // 6. Regional Hubs
  const regionalHubData = useMemo(() => {
    const hubCounts: Record<string, number> = {
      'Gulshan & Banani (Dhaka)': 0,
      'Uttara & Nikunja (Dhaka)': 0,
      'Dhanmondi & Mohakhali': 0,
      'Chattogram / Sylhet': 0,
      'International Remote': 0,
      'Other BD Locations': 0
    };

    jobs.forEach(j => {
      const loc = (j.location || '').toLowerCase();
      const type = (j.type || '').toLowerCase();

      if (type.includes('remote') || loc.includes('remote')) {
        hubCounts['International Remote']++;
      } else if (loc.includes('gulshan') || loc.includes('banani')) {
        hubCounts['Gulshan & Banani (Dhaka)']++;
      } else if (loc.includes('uttara') || loc.includes('nikunja')) {
        hubCounts['Uttara & Nikunja (Dhaka)']++;
      } else if (loc.includes('dhanmondi') || loc.includes('mohakhali')) {
        hubCounts['Dhanmondi & Mohakhali']++;
      } else if (loc.includes('chittagong') || loc.includes('chattogram') || loc.includes('sylhet')) {
        hubCounts['Chattogram / Sylhet']++;
      } else {
        hubCounts['Other BD Locations']++;
      }
    });

    return Object.entries(hubCounts)
      .map(([hub, count]) => ({ hub, count, percentage: Math.round((count / (jobs.length || 1)) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [jobs]);

  // Quality audit
  const qualityAuditStats = useMemo(() => {
    let highQuality = 0;
    let totalScore = 0;

    jobs.forEach(j => {
      const issues = validateJob(j);
      const deductions = issues.reduce((acc, issue) => {
        if (issue.type === 'error') return acc + 30;
        if (issue.type === 'warning') return acc + 15;
        return acc + 5;
      }, 0);
      const score = Math.max(10, 100 - deductions);
      totalScore += score;
      if (score >= 85) highQuality++;
    });

    const avgScore = jobs.length ? Math.round(totalScore / jobs.length) : 100;
    return { avgScore, highPct: Math.round((highQuality / (jobs.length || 1)) * 100) };
  }, [jobs]);

  const topSkillName = topSkillsData[0]?.name || 'React';
  const topCategoryName = categoryData[0]?.name || 'Fullstack Eng.';
  const activeCompaniesCount = useMemo(() => new Set(jobs.map(j => j.companyName)).size, [jobs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Live Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-indigo-600 animate-pulse" />
              Live Market Telemetry & Pulse
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Dynamic real-time intelligence aggregated across <strong className="text-gray-800">{jobs.length} scraped jobs</strong> and <strong className="text-gray-800">{companies.length} Bangladeshi IT companies</strong>.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Scraping Engine
            </span>
          </div>
        </div>

        {/* Dynamic Metric Cards Computed Live */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-gradient-to-br from-indigo-50/60 to-white rounded-2xl p-5 border border-indigo-100 relative overflow-hidden">
            <div className="absolute top-3 right-3 p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600/80 mb-1">Total Active Listings</h4>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{jobs.length}</div>
            <p className="text-[11px] text-gray-500 font-medium">Across {activeCompaniesCount} active employers</p>
          </div>

          <div 
            onClick={() => topSkillsData[0] && openSkillModal(topSkillsData[0].name)}
            className="bg-gradient-to-br from-violet-50/60 to-white rounded-2xl p-5 border border-violet-100 relative overflow-hidden cursor-pointer hover:border-violet-300 transition-all group"
          >
            <div className="absolute top-3 right-3 p-2 bg-violet-500/10 text-violet-600 rounded-xl group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-violet-600/80 mb-1 flex items-center gap-1">
              Top Demanded Tech <ChevronRight className="w-3 h-3" />
            </h4>
            <div className="text-2xl font-extrabold text-gray-900 mb-1 truncate">{topSkillName}</div>
            <p className="text-[11px] text-violet-700 font-semibold">{topSkillsData[0]?.percentage || 0}% of all open tech roles</p>
          </div>

          <div 
            onClick={() => categoryData[0] && openCategoryModal(categoryData[0].key)}
            className="bg-gradient-to-br from-emerald-50/60 to-white rounded-2xl p-5 border border-emerald-100 relative overflow-hidden cursor-pointer hover:border-emerald-300 transition-all group"
          >
            <div className="absolute top-3 right-3 p-2 bg-emerald-500/10 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-600/80 mb-1 flex items-center gap-1">
              Dominant Sector <ChevronRight className="w-3 h-3" />
            </h4>
            <div className="text-2xl font-extrabold text-gray-900 mb-1 truncate">{topCategoryName}</div>
            <p className="text-[11px] text-emerald-700 font-semibold">{categoryData[0]?.count || 0} listings currently active</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50/60 to-white rounded-2xl p-5 border border-amber-100 relative overflow-hidden">
            <div className="absolute top-3 right-3 p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-600/80 mb-1">Data Quality Score</h4>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{qualityAuditStats.avgScore}%</div>
            <p className="text-[11px] text-gray-500 font-medium">{qualityAuditStats.highPct}% high-fidelity validation</p>
          </div>
        </div>

        {/* --- ACTIVELY RECRUITING COMPANIES SECTION --- */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-6 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold mb-2 border border-emerald-400/30">
                <Building2 className="w-3.5 h-3.5" />
                {activelyRecruitingCompanies.length} Companies Hiring Now
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">Actively Recruiting Tech Companies</h3>
              <p className="text-xs text-slate-400 mt-1">
                Top software &amp; IT companies with active open positions. Click any company card to reveal its open vacancies.
              </p>
            </div>
          </div>

          {activelyRecruitingCompanies.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No active companies loaded yet. Run a global scan to scrape live listings!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activelyRecruitingCompanies.map((item, idx) => {
                const compProfile = item.companyProfile;
                const compSkills = Array.from(new Set(item.jobs.flatMap(j => j.skills || []))).slice(0, 3);
                
                return (
                  <div
                    key={idx}
                    onClick={() => openCompanyModal(item.name)}
                    className="bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-2xl transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition-transform">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-white text-sm group-hover:text-indigo-300 transition-colors line-clamp-1">
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              {compProfile?.location ? (
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-indigo-400" /> {compProfile.location}</span>
                              ) : (
                                <span>Dhaka, Bangladesh</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                          {item.jobs.length} Open Role{item.jobs.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      {/* Required Stack Preview */}
                      {compSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {compSkills.map((sk, sIdx) => (
                            <span 
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-bold group-hover:text-indigo-300">
                      <span>Reveal Job Openings</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Charts Grid - Section 1: Category Breakdown & Top Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Job Category Distribution Donut Chart */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-indigo-600" />
                  Live Category Distribution
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Click any category to open detailed jobs list</p>
              </div>
            </div>

            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                    onClick={(entry: any) => entry && openCategoryModal(entry.key || entry.name)}
                    className="cursor-pointer"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} jobs (Click to reveal)`, 'Count']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                  />
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: '11px', paddingLeft: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 10 Technical Skills Frequency Bar Chart */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Top Technical Skills Demand
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Click any skill bar to view matching jobs</p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={topSkillsData} 
                  margin={{ top: 5, right: 10, left: -20, bottom: 25 }}
                  onClick={(data: any) => {
                    if (data && data.activePayload && data.activePayload[0]) {
                      openSkillModal(data.activePayload[0].payload.name);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#6B7280' }} 
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip 
                    formatter={(value: any) => [`${value} listings (Click to view)`, 'Frequency']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Charts Grid - Section 2: Experience Level Radar & Top Employers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Experience Level Requirements Radar Chart */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-violet-600" />
                  Experience Level Profile
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Click any seniority level badge to view jobs</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {experienceData.map((exp, idx) => (
                <button
                  key={idx}
                  onClick={() => openExperienceModal(exp.key)}
                  className="p-2.5 rounded-xl bg-violet-50/60 hover:bg-violet-100/80 border border-violet-100 text-left transition-all cursor-pointer group"
                >
                  <div className="text-[10px] font-bold text-violet-600 uppercase">{exp.subject}</div>
                  <div className="text-base font-extrabold text-gray-900 mt-0.5">{exp.count} jobs</div>
                </button>
              ))}
            </div>

            <div className="h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={experienceData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#4B5563', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 2']} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <Radar name="Jobs Count" dataKey="count" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
                  <Tooltip 
                    formatter={(value: any) => [`${value} jobs`, 'Count']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Hiring Employers Horizontal Bar Chart */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Top Hiring Employers
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Click any company bar to open its active vacancies</p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={topEmployersData} 
                  layout="vertical" 
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  onClick={(data: any) => {
                    if (data && data.activePayload && data.activePayload[0]) {
                      openCompanyModal(data.activePayload[0].payload.fullName);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }} width={110} />
                  <Tooltip 
                    formatter={(value: any) => [`${value} open positions (Click to view)`, 'Jobs']}
                    labelFormatter={(label) => `Company: ${label}`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                  />
                  <Bar dataKey="jobs" fill="#10B981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Charts Grid - Section 3: Work Mode Telemetry & Regional Tech Hub Density */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Work Mode & Remote Flexibility Breakdown */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-600" />
                  Work Mode &amp; Remote Telemetry
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Click any work pattern card to filter jobs</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6 text-center">
              <div 
                onClick={() => openWorkModeModal('remote')}
                className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-emerald-800">Remote</div>
                <div className="text-2xl font-black text-emerald-600 my-0.5">{workModeTelemetry.remote}</div>
                <div className="text-[10px] font-semibold text-emerald-700">{workModeTelemetry.remotePct}%</div>
              </div>
              <div 
                onClick={() => openWorkModeModal('hybrid')}
                className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 hover:border-indigo-300 transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-indigo-800">Hybrid</div>
                <div className="text-2xl font-black text-indigo-600 my-0.5">{workModeTelemetry.hybrid}</div>
                <div className="text-[10px] font-semibold text-indigo-700">{workModeTelemetry.hybridPct}%</div>
              </div>
              <div 
                onClick={() => openWorkModeModal('onsite')}
                className="p-3 rounded-xl bg-amber-50 border border-amber-100 hover:border-amber-300 transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-amber-800">Onsite</div>
                <div className="text-2xl font-black text-amber-600 my-0.5">{workModeTelemetry.onsite}</div>
                <div className="text-[10px] font-semibold text-amber-700">{workModeTelemetry.onsitePct}%</div>
              </div>
            </div>
          </div>

          {/* Regional Tech Hub Clusters */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Regional Tech Hub Clusters
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Click any location hub to view matching jobs</p>
              </div>
            </div>

            <div className="space-y-3">
              {regionalHubData.map((hub, idx) => (
                <div 
                  key={idx} 
                  onClick={() => openHubModal(hub.hub)}
                  className="space-y-1 cursor-pointer group p-1 hover:bg-indigo-50/50 rounded-lg transition-colors"
                >
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-800 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-500" />
                      {hub.hub}
                    </span>
                    <span className="font-mono text-gray-900">{hub.count} jobs ({hub.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500 group-hover:bg-indigo-500" 
                      style={{ width: `${Math.max(4, hub.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Detail Modal */}
      <DetailModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        subtitle={modalState.subtitle}
        icon={modalState.icon}
        badge={modalState.badge}
        jobs={modalState.jobs}
        allJobs={jobs}
        companyProfile={modalState.companyProfile}
        statsSummary={modalState.statsSummary}
      />

    </div>
  );
}
