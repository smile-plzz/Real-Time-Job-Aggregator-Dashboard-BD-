import React, { useMemo } from 'react';
import { Job, Company, validateJob } from '../types';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, CartesianGrid, Legend, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Activity, Zap, Cpu, Flame, Compass, Building2, 
  Briefcase, Award, CheckCircle2, ShieldCheck, PieChart as PieIcon, 
  BarChart3, Layers, Sparkles, AlertCircle, Check, Globe, MapPin, Laptop
} from 'lucide-react';

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
  // --- Live Scraped Data Computations ---

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
      { subject: 'Intern', count: expCounts.intern, fullMark: jobs.length },
      { subject: 'Junior', count: expCounts.junior, fullMark: jobs.length },
      { subject: 'Mid-Level', count: expCounts.mid, fullMark: jobs.length },
      { subject: 'Senior', count: expCounts.senior, fullMark: jobs.length },
      { subject: 'Lead / Mgr', count: expCounts.lead, fullMark: jobs.length },
      { subject: 'Unspecified', count: expCounts.unspecified, fullMark: jobs.length }
    ];
  }, [jobs]);

  // 4. Top Hiring Employers (Most Active Companies)
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

  // 5. Scrape Source Pipeline
  const sourcePipelineData = useMemo(() => {
    const sourceCounts: Record<string, number> = {};
    jobs.forEach(j => {
      const src = j.source || 'seed';
      const label = src === 'json-ld' ? 'Schema.org JSON-LD' :
                    src === 'hydration' ? 'Hydration State' :
                    src === 'heuristics' ? 'Heuristic Probe' : 'Directory Seed';
      sourceCounts[label] = (sourceCounts[label] || 0) + 1;
    });

    return Object.entries(sourceCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / (jobs.length || 1)) * 100)
    }));
  }, [jobs]);

  // 6. Quality Audit Metrics
  const qualityAuditStats = useMemo(() => {
    let highQuality = 0;
    let medQuality = 0;
    let lowQuality = 0;
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
      else if (score >= 50) medQuality++;
      else lowQuality++;
    });

    const avgScore = jobs.length ? Math.round(totalScore / jobs.length) : 100;

    return {
      avgScore,
      highQuality,
      medQuality,
      lowQuality,
      highPct: Math.round((highQuality / (jobs.length || 1)) * 100)
    };
  }, [jobs]);

  // 7. Work Mode & Remote Flexibility Breakdown
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
        { name: 'Remote', count: remote, color: '#10B981' },
        { name: 'Hybrid', count: hybrid, color: '#6366F1' },
        { name: 'Onsite', count: onsite, color: '#F59E0B' }
      ]
    };
  }, [jobs]);

  // 8. Regional Tech Hub Density & City Clusters
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

  // 9. Employer Scale & Hiring Volume Matrix
  const companyScaleData = useMemo(() => {
    let enterprise = 0; // 500+
    let scaleup = 0;    // 50-500
    let startup = 0;    // <50

    companies.forEach(c => {
      const sizeStr = c.size || '';
      if (sizeStr.includes('500') || sizeStr.includes('1000') || sizeStr.includes('Enterprise')) {
        enterprise += (c.jobCount || 1);
      } else if (sizeStr.includes('50-200') || sizeStr.includes('100-500')) {
        scaleup += (c.jobCount || 1);
      } else {
        startup += (c.jobCount || 1);
      }
    });

    return [
      { name: 'Enterprise (500+)', jobs: enterprise, fill: '#3B82F6' },
      { name: 'Mid-Scale (50-500)', jobs: scaleup, fill: '#8B5CF6' },
      { name: 'Startups & SMEs (<50)', jobs: startup, fill: '#EC4899' }
    ];
  }, [companies]);

  // Key summary badges computed directly from live data
  const topSkillName = topSkillsData[0]?.name || 'React';
  const topCategoryName = categoryData[0]?.name || 'Fullstack Eng.';
  const activeCompaniesCount = useMemo(() => new Set(jobs.map(j => j.companyName)).size, [jobs]);
  const disclosedSalaryCount = useMemo(() => 
    jobs.filter(j => j.salary && !j.salary.toLowerCase().includes('negotiable') && !j.salary.toLowerCase().includes('undisclosed')).length, 
  [jobs]);

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

          <div className="bg-gradient-to-br from-violet-50/60 to-white rounded-2xl p-5 border border-violet-100 relative overflow-hidden">
            <div className="absolute top-3 right-3 p-2 bg-violet-500/10 text-violet-600 rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-violet-600/80 mb-1">Top Demanded Tech</h4>
            <div className="text-2xl font-extrabold text-gray-900 mb-1 truncate">{topSkillName}</div>
            <p className="text-[11px] text-gray-500 font-medium">{topSkillsData[0]?.percentage || 0}% of all open tech roles</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50/60 to-white rounded-2xl p-5 border border-emerald-100 relative overflow-hidden">
            <div className="absolute top-3 right-3 p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-600/80 mb-1">Dominant Sector</h4>
            <div className="text-2xl font-extrabold text-gray-900 mb-1 truncate">{topCategoryName}</div>
            <p className="text-[11px] text-gray-500 font-medium">{categoryData[0]?.count || 0} listings currently active</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50/60 to-white rounded-2xl p-5 border border-amber-100 relative overflow-hidden">
            <div className="absolute top-3 right-3 p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-600/80 mb-1">Average Data Quality</h4>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{qualityAuditStats.avgScore}%</div>
            <p className="text-[11px] text-gray-500 font-medium">{qualityAuditStats.highPct}% high-fidelity validation</p>
          </div>
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
                <p className="text-xs text-gray-500 mt-0.5">Specialization breakdown of live scraped postings</p>
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
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} jobs`, 'Count']}
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
                <p className="text-xs text-gray-500 mt-0.5">Most requested technologies parsed from job descriptions</p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSkillsData} margin={{ top: 5, right: 10, left: -20, bottom: 25 }}>
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
                    formatter={(value: any) => [`${value} listings`, 'Frequency']}
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
                <p className="text-xs text-gray-500 mt-0.5">Distribution across seniority levels</p>
              </div>
            </div>

            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={experienceData}>
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
                <p className="text-xs text-gray-500 mt-0.5">Companies with the highest volume of active open vacancies</p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topEmployersData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }} width={110} />
                  <Tooltip 
                    formatter={(value: any) => [`${value} open positions`, 'Jobs']}
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
                <p className="text-xs text-gray-500 mt-0.5">Ratio of Remote, Hybrid, and Onsite positions</p>
              </div>
              <span className="text-[10px] font-bold font-mono px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                {workModeTelemetry.remotePct}% Remote Opportunities
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6 text-center">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="text-xs font-bold text-emerald-800">Remote</div>
                <div className="text-2xl font-black text-emerald-600 my-0.5">{workModeTelemetry.remote}</div>
                <div className="text-[10px] font-semibold text-emerald-700">{workModeTelemetry.remotePct}%</div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="text-xs font-bold text-indigo-800">Hybrid</div>
                <div className="text-2xl font-black text-indigo-600 my-0.5">{workModeTelemetry.hybrid}</div>
                <div className="text-[10px] font-semibold text-indigo-700">{workModeTelemetry.hybridPct}%</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="text-xs font-bold text-amber-800">Onsite</div>
                <div className="text-2xl font-black text-amber-600 my-0.5">{workModeTelemetry.onsite}</div>
                <div className="text-[10px] font-semibold text-amber-700">{workModeTelemetry.onsitePct}%</div>
              </div>
            </div>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workModeTelemetry.chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#374151', fontWeight: 600 }} width={70} />
                  <Tooltip 
                    formatter={(value: any) => [`${value} jobs`, 'Volume']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Regional Tech Hub Clusters (Dhaka vs Chittagong vs Sylhet vs Global) */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Regional Tech Hub Clusters
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Geographic density across Dhaka commercial zones &amp; hubs</p>
              </div>
            </div>

            <div className="space-y-3">
              {regionalHubData.map((hub, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-800">{hub.hub}</span>
                    <span className="font-mono text-gray-900">{hub.count} jobs ({hub.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(4, hub.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Section 4: Crawler Pipeline Data Source Breakdown & Live Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          <div className="lg:col-span-1 bg-gray-50/80 border border-gray-100 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-indigo-600" />
              Scraper Pipeline Extraction Sources
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Distribution of scraping mechanics used to extract active listings live:
            </p>
            <div className="space-y-3">
              {sourcePipelineData.map((src, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700">{src.name}</span>
                    <span className="text-gray-900">{src.count} ({src.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${src.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                Live Synthetic &amp; Scraped Intelligence Summary
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Bangladeshi Tech Ecosystem Overview</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Analysis of <strong className="text-white">{jobs.length} open roles</strong> reveals that <strong className="text-white">{topSkillName}</strong> is the single most required technology tag in Bangladesh right now. Fullstack and Backend specializations make up the majority of open roles, while salary transparency stands at <strong className="text-white">{Math.round((disclosedSalaryCount / (jobs.length || 1)) * 100)}%</strong>.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Live Data Synchronized
              </span>
              <span className="font-mono text-[11px]">
                {jobs.length} jobs &bull; {companies.length} companies indexed
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
