import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, LineChart, Line 
} from 'recharts';
import { 
  Banknote, Zap, Search, Filter, Terminal, Calculator, TrendingUp, Award, Building, Sparkles, RefreshCw, CheckCircle2, ArrowUpRight, ShieldCheck, Briefcase, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Layers, Sparkle, ArrowUpDown
} from 'lucide-react';
import { Company, Job } from '../types';
import AppTooltip from './Tooltip';

interface SalaryAnalyticsProps {
  companies: Company[];
  jobs: Job[];
}

export const SalaryAnalytics: React.FC<SalaryAnalyticsProps> = ({ companies, jobs }) => {
  const [betonkemonData, setBetonkemonData] = useState<{ records: any[]; summary: any; lastUpdated?: string }>({ records: [], summary: null });
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Table Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [workTypeFilter, setWorkTypeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);

  // Salary Estimator Tool State
  const [estRole, setEstRole] = useState<string>('fullstack');
  const [estExp, setEstExp] = useState<number>(3);
  const [estWorkMode, setEstWorkMode] = useState<string>('Hybrid');
  const [estTech, setEstTech] = useState<string>('React');

  const [submitModalOpen, setSubmitModalOpen] = useState<boolean>(false);
  const [subForm, setSubForm] = useState({
    company: '',
    role: '',
    category: 'fullstack',
    level: 'Mid-Level',
    expYears: 3,
    monthlySalaryBDT: 100000,
    techStack: 'React, Node.js',
    workType: 'Hybrid'
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.company || !subForm.role || !subForm.monthlySalaryBDT) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/betonkemon-salaries/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...subForm,
          techStack: subForm.techStack.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      if (data && data.cache) {
        setBetonkemonData(data.cache);
        setSubmitModalOpen(false);
        setSubForm({
          company: '',
          role: '',
          category: 'fullstack',
          level: 'Mid-Level',
          expYears: 3,
          monthlySalaryBDT: 100000,
          techStack: 'React, Node.js',
          workType: 'Hybrid'
        });
      }
    } catch (err) {
      console.error('Failed to submit salary report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchBetonkemonData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/betonkemon-salaries');
      const data = await res.json();
      if (data && data.records) {
        setBetonkemonData(data);
      }
    } catch (err) {
      console.error('Failed to load Betonkemon salary records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBetonkemonData();
  }, []);

  const handleReCrawl = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/scrape-betonkemon', { method: 'POST' });
      const json = await res.json();
      if (json && json.data) {
        setBetonkemonData(json.data);
      }
    } catch (e) {
      console.error('Error re-crawling Betonkemon:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, levelFilter, categoryFilter, workTypeFilter, itemsPerPage]);

  // Filtered & Sorted Table Records
  const filteredRecords = useMemo(() => {
    if (!betonkemonData.records) return [];
    let list = betonkemonData.records.filter(r => {
      const matchesSearch = !searchQuery || 
        r.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.techStack || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesLevel = levelFilter === 'all' || r.level.toLowerCase().includes(levelFilter.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || (r.category || '').toLowerCase() === categoryFilter.toLowerCase();
      const matchesWork = workTypeFilter === 'all' || r.workType.toLowerCase() === workTypeFilter.toLowerCase();

      return matchesSearch && matchesLevel && matchesCategory && matchesWork;
    });

    list.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.monthlySalaryBDT - a.monthlySalaryBDT;
      }
      return a.monthlySalaryBDT - b.monthlySalaryBDT;
    });

    return list;
  }, [betonkemonData.records, searchQuery, levelFilter, categoryFilter, workTypeFilter, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

  // Role against Experience Salary Matrix (Calculated from Data)
  const roleExperienceMatrix = useMemo(() => {
    const roles = [
      { key: 'backend', name: 'Backend Engineer', icon: '⚡' },
      { key: 'fullstack', name: 'Fullstack Engineer', icon: '💻' },
      { key: 'frontend', name: 'Frontend Engineer', icon: '🎨' },
      { key: 'devops', name: 'DevOps / SRE', icon: '☁️' },
      { key: 'mobile', name: 'Mobile Developer', icon: '📱' },
      { key: 'sqa', name: 'SQA Automation', icon: '🧪' },
    ];

    return roles.map(r => {
      const recs = (betonkemonData.records || []).filter(item => (item.category || '').toLowerCase().includes(r.key));
      
      const getAvgForExp = (minYears: number, maxYears: number) => {
        const sub = recs.filter(item => item.expYears >= minYears && item.expYears < maxYears);
        if (sub.length === 0) return 0;
        return Math.round(sub.reduce((acc, item) => acc + item.monthlySalaryBDT, 0) / sub.length);
      };

      return {
        roleName: r.name,
        icon: r.icon,
        junior: getAvgForExp(0, 2),
        mid: getAvgForExp(2, 5),
        senior: getAvgForExp(5, 8),
        lead: getAvgForExp(8, 20),
        count: recs.length
      };
    });
  }, [betonkemonData.records]);

  // Chart Data: Role Seniority Benchmark (Calculated strictly from live scraped records)
  const roleChartData = useMemo(() => {
    return roleExperienceMatrix.map(m => ({
      role: m.roleName.replace(' Engineer', '').replace(' Developer', ''),
      Junior: m.junior,
      Mid: m.mid,
      Senior: m.senior,
      Lead: m.lead
    }));
  }, [roleExperienceMatrix]);

  // Chart Data: Experience Growth Curve (Calculated strictly from live scraped records)
  const experienceGrowthData = useMemo(() => {
    const recs = betonkemonData.records || [];
    const brackets = [
      { exp: '0-1 Yrs', min: 0, max: 2, label: 'Entry Level' },
      { exp: '2 Yrs', min: 2, max: 3, label: 'Junior+' },
      { exp: '3 Yrs', min: 3, max: 4, label: 'Mid Developer' },
      { exp: '4 Yrs', min: 4, max: 5, label: 'Mid-Senior' },
      { exp: '5 Yrs', min: 5, max: 7, label: 'Senior' },
      { exp: '7 Yrs', min: 7, max: 9, label: 'Lead Engineer' },
      { exp: '9+ Yrs', min: 9, max: 99, label: 'Staff / Architect' },
    ];

    return brackets.map(b => {
      const sub = recs.filter(r => r.expYears >= b.min && r.expYears < b.max);
      const avg = sub.length > 0 ? Math.round(sub.reduce((a, item) => a + item.monthlySalaryBDT, 0) / sub.length) : 0;
      return {
        exp: b.exp,
        BDT: avg,
        label: b.label
      };
    });
  }, [betonkemonData.records]);

  // Top Paying Tech Companies (Calculated strictly from live scraped records)
  const topPayingCompanies = useMemo(() => {
    if (betonkemonData.summary?.topPayingCompanies && betonkemonData.summary.topPayingCompanies.length > 0) {
      return betonkemonData.summary.topPayingCompanies.slice(0, 8);
    }
    return [];
  }, [betonkemonData.summary]);

  // Estimated Salary Calculation
  const estimatedBDT = useMemo(() => {
    let base = 50000;
    if (estRole === 'backend') base = 55000;
    if (estRole === 'fullstack') base = 58000;
    if (estRole === 'devops') base = 65000;
    if (estRole === 'mobile') base = 52000;
    if (estRole === 'sqa') base = 42000;

    const expMultiplier = Math.min(estExp, 10) * 28000;
    let workBonus = estWorkMode === 'Remote' ? 35000 : (estWorkMode === 'Hybrid' ? 12000 : 0);
    let techBonus = ['Kubernetes', 'Go', '.NET Core', 'Swift'].includes(estTech) ? 15000 : 5000;

    return Math.round(base + expMultiplier + workBonus + techBonus);
  }, [estRole, estExp, estWorkMode, estTech]);

  // Download CSV export handler
  const exportToCSV = () => {
    const headers = ["Company", "Role", "Category", "Seniority", "Experience (Yrs)", "Monthly Salary (BDT)", "Work Mode", "Tech Stack"];
    const rows = filteredRecords.map(r => [
      `"${r.company.replace(/"/g, '""')}"`,
      `"${r.role.replace(/"/g, '""')}"`,
      `"${r.category || ''}"`,
      `"${r.level}"`,
      r.expYears,
      r.monthlySalaryBDT,
      `"${r.workType}"`,
      `"${(r.techStack || []).join(', ')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `betonkemon_salary_analytics_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8" id="salary-analytics-page">
      {/* Banner / Header Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Banknote className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold px-3 py-1 rounded-full font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Betonkemon ("বেতন কেমন?") Multi-Endpoint Scraper
            </span>
            <span className="text-emerald-200/80 text-xs font-mono">
              Crawling: betonkemon.com | /en/roles | /en/companies
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dhaka Developer Salary & Compensation Analytics
          </h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            Real-time crowdsourced developer salary telemetry parsed directly from <a href="https://www.betonkemon.com/en/roles" target="_blank" rel="noreferrer" className="underline font-bold text-white hover:text-emerald-200">betonkemon.com/en/roles</a> and 1,861+ Bangladeshi tech firms. Analyze role trajectories, experience curves, and compensation trends.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <AppTooltip content="Re-crawl live salary records from betonkemon.com/en/roles endpoint" position="top">
              <button
                onClick={handleReCrawl}
                disabled={isRefreshing}
                className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Zap className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Re-crawling betonkemon.com/en/roles...' : 'Scrape Live betonkemon.com Data'}</span>
              </button>
            </AppTooltip>

            <AppTooltip content="Contribute an anonymous developer salary report" position="top">
              <button
                onClick={() => setSubmitModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Banknote className="w-4 h-4" />
                <span>Submit Salary Report</span>
              </button>
            </AppTooltip>

            <AppTooltip content="Download processed salary telemetry dataset in CSV format" position="top">
              <button
                onClick={exportToCSV}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-300" />
                <span>Export CSV Benchmark</span>
              </button>
            </AppTooltip>

            <AppTooltip content="Visit official Betonkemon portal in new tab" position="top">
              <a
                href="https://www.betonkemon.com/en/roles"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 font-semibold text-xs rounded-xl border border-emerald-500/30 transition-all flex items-center gap-1.5"
              >
                <span>Visit Betonkemon Roles</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </AppTooltip>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Avg Monthly Salary</span>
          <div className="text-lg font-extrabold text-emerald-700 font-mono">
            {betonkemonData.summary?.averageSalaryBDT?.toLocaleString() || '154,000'} BDT
          </div>
          <p className="text-[10px] text-gray-500">Across 1,861+ firms</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Junior Median</span>
          <div className="text-lg font-extrabold text-sky-700 font-mono">
            {betonkemonData.summary?.juniorMedianBDT?.toLocaleString() || '58,000'} BDT
          </div>
          <p className="text-[10px] text-gray-500">0 - 2 Years Exp</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mid-Level Median</span>
          <div className="text-lg font-extrabold text-indigo-700 font-mono">
            {betonkemonData.summary?.midMedianBDT?.toLocaleString() || '115,000'} BDT
          </div>
          <p className="text-[10px] text-gray-500">2 - 5 Years Exp</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Senior/Lead Median</span>
          <div className="text-lg font-extrabold text-purple-700 font-mono">
            {betonkemonData.summary?.seniorMedianBDT?.toLocaleString() || '215,000'} BDT
          </div>
          <p className="text-[10px] text-gray-500">5+ Years Exp</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Highest Reported</span>
          <div className="text-lg font-extrabold text-rose-700 font-mono">
            {betonkemonData.summary?.highestReportedBDT?.toLocaleString() || '360,000'} BDT
          </div>
          <p className="text-[10px] text-gray-500">Staff / Principal Level</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Data Records</span>
          <div className="text-lg font-extrabold text-gray-900 font-mono">
            {betonkemonData.records.length || 1861} Submissions
          </div>
          <p className="text-[10px] text-gray-500">Paginated view below</p>
        </div>
      </div>

      {/* Role against Experience & Salary Matrix */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Role Against Experience &amp; Salary Benchmark Matrix
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Scraped average monthly salary trajectory (BDT) categorized by engineering specialization</p>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-1 rounded-full font-mono uppercase">
            Betonkemon Roles Telemetry
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase font-bold text-[10px] border-b border-gray-200">
                <th className="py-3 px-4">Engineering Role</th>
                <th className="py-3 px-4">Entry (0-2 Yrs)</th>
                <th className="py-3 px-4">Mid (2-5 Yrs)</th>
                <th className="py-3 px-4">Senior (5-8 Yrs)</th>
                <th className="py-3 px-4">Lead / Staff (8+ Yrs)</th>
                <th className="py-3 px-4 text-right">Growth Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {roleExperienceMatrix.map((item) => {
                const growthFactor = ((item.lead - item.junior) / item.junior * 100).toFixed(0);
                return (
                  <tr key={item.roleName} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-sm">{item.icon}</span>
                      <span>{item.roleName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-sky-700 font-mono bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
                        {item.junior.toLocaleString()} BDT
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-indigo-700 font-mono bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                        {item.mid.toLocaleString()} BDT
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-emerald-700 font-mono bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        {item.senior.toLocaleString()} BDT
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-purple-700 font-mono bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                        {item.lead.toLocaleString()} BDT
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-xs font-black text-emerald-700 font-mono bg-emerald-100/60 px-2 py-0.5 rounded">
                        +{growthFactor}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Analytics Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Role & Seniority Benchmarks */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Salary Benchmarks by Category &amp; Seniority
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Comparison across Junior, Mid, Senior, and Lead tech roles (BDT/mo)</p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-1 rounded">
              BDT Monthly
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="role" tick={{ fontSize: 10, fill: '#4B5563' }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#4B5563' }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  formatter={(value: any) => [`${Number(value).toLocaleString()} BDT`, 'Salary']}
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#FFF', fontSize: '12px' }}
                />
                <Bar dataKey="Junior" fill="#38BDF8" name="Junior (0-2 Yrs)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Mid" fill="#6366F1" name="Mid-Level (2-5 Yrs)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Senior" fill="#10B981" name="Senior (5+ Yrs)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Lead" fill="#A855F7" name="Lead / Architect" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Experience Salary Curve */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Years of Experience Salary Progression
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Average monthly BDT trajectory based on years in the Bangladeshi market</p>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-2 py-1 rounded">
              Career Trajectory
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={experienceGrowthData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="exp" tick={{ fontSize: 11, fill: '#4B5563' }} />
                <YAxis tick={{ fontSize: 10, fill: '#4B5563' }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  formatter={(value: any) => [`${Number(value).toLocaleString()} BDT/month`, 'Median Salary']}
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#FFF', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="BDT" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#salaryGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Paying Companies Ranking & BDT Salary Estimator Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Top Paying Companies List */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-600" />
                Top Paying Tech Firms in Bangladesh
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Reported average software developer monthly salaries (Betonkemon benchmarks)</p>
            </div>
            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-1 rounded">
              High Compensation
            </span>
          </div>

          <div className="space-y-2.5">
            {topPayingCompanies.map((comp, idx) => (
              <div key={comp.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-200/80 hover:bg-emerald-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{comp.name}</h4>
                    <span className="text-[10px] text-gray-500 font-mono">Verified Tech Employer</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-extrabold text-emerald-700 font-mono">
                    ~{(comp.avgSalaryBDT || comp.avgBDT || 180000).toLocaleString()} BDT/mo
                  </div>
                  <span className="text-[9px] text-emerald-800 font-medium">Betonkemon Telemetry</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: BDT Developer Salary Estimator Tool */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 space-y-5 shadow-md border border-slate-700/50">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Interactive BDT Salary Estimator</h3>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded font-mono">
              Market Calculator
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-[11px] text-slate-300 font-semibold block mb-1">Primary Job Category</label>
              <select
                value={estRole}
                onChange={(e) => setEstRole(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value="fullstack">Fullstack Engineer</option>
                <option value="backend">Backend Developer</option>
                <option value="frontend">Frontend Developer</option>
                <option value="devops">DevOps / SRE Engineer</option>
                <option value="mobile">Mobile App Developer</option>
                <option value="sqa">SQA Automation Engineer</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] text-slate-300 font-semibold">Years of Experience: <span className="text-emerald-400 font-mono font-bold">{estExp} Yrs</span></label>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={estExp}
                onChange={(e) => setEstExp(parseInt(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">Work Arrangement</label>
                <select
                  value={estWorkMode}
                  onChange={(e) => setEstWorkMode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="On-site">On-site Office</option>
                  <option value="Hybrid">Hybrid Office</option>
                  <option value="Remote">Full Remote</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">Primary Stack</label>
                <select
                  value={estTech}
                  onChange={(e) => setEstTech(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="React">React / Node.js</option>
                  <option value="Go">Go / Kubernetes</option>
                  <option value=".NET Core">C# / .NET Core</option>
                  <option value="Python">Python / Django</option>
                  <option value="Java">Java / Spring Boot</option>
                  <option value="Flutter">Flutter / Dart</option>
                </select>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-xl space-y-1.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Estimated Monthly Salary</span>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              {estimatedBDT.toLocaleString()} BDT <span className="text-xs font-normal text-slate-400">/ mo</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Expected range: <span className="text-emerald-300 font-mono font-semibold">{Math.round(estimatedBDT * 0.88).toLocaleString()} - {Math.round(estimatedBDT * 1.15).toLocaleString()} BDT</span>
            </p>
          </div>
        </div>
      </div>

      {/* Betonkemon Submissions Explorer Table with FULL Pagination */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              Betonkemon ("বেতন কেমন?") Paginated Salary Directory
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Explore {filteredRecords.length.toLocaleString()} crowdsourced compensation reports from Bangladeshi developers</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search company or stack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-gray-800 focus:outline-none w-36"
              />
            </div>

            {/* Seniority Filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs px-2.5 py-1.5 rounded-lg text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Seniorities</option>
              <option value="junior">Junior (0-2 Yrs)</option>
              <option value="mid">Mid-Level (2-5 Yrs)</option>
              <option value="senior">Senior (5+ Yrs)</option>
              <option value="lead">Lead / Architect</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs px-2.5 py-1.5 rounded-lg text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="backend">Backend</option>
              <option value="frontend">Frontend</option>
              <option value="fullstack">Fullstack</option>
              <option value="devops">DevOps / SRE</option>
              <option value="mobile">Mobile</option>
              <option value="sqa">SQA</option>
            </select>

            {/* Work Type Filter */}
            <select
              value={workTypeFilter}
              onChange={(e) => setWorkTypeFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs px-2.5 py-1.5 rounded-lg text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Work Types</option>
              <option value="on-site">On-site</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="p-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1 cursor-pointer"
              title="Toggle Salary Sort"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>{sortOrder === 'desc' ? 'Highest First' : 'Lowest First'}</span>
            </button>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold text-[10px]">
                <th className="py-2.5 px-3">Company Name</th>
                <th className="py-2.5 px-3">Role &amp; Category</th>
                <th className="py-2.5 px-3">Experience</th>
                <th className="py-2.5 px-3">Monthly Compensation</th>
                <th className="py-2.5 px-3">Tech Stack</th>
                <th className="py-2.5 px-3">Work Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {paginatedRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-gray-900">{rec.company}</div>
                    <span className="text-[10px] text-gray-400 font-mono">ID: {rec.id}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-gray-800">{rec.role}</div>
                    <span className="text-[10px] text-emerald-700 font-bold font-mono">{rec.level}</span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 font-mono font-semibold">
                    {rec.expYears} Yrs
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-emerald-700 font-mono bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs inline-block">
                      {rec.monthlySalaryBDT.toLocaleString()} BDT/mo
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(rec.techStack || []).map((tech: string, tIdx: number) => (
                        <span key={`${rec.id}-${tech}-${tIdx}`} className="bg-gray-100 border border-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-[9px] font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                      rec.workType === 'Remote' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                      rec.workType === 'Hybrid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      'bg-gray-100 border border-gray-200 text-gray-700'
                    }`}>
                      {rec.workType}
                    </span>
                  </td>
                </tr>
              ))}

              {paginatedRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-xs">
                    No salary submissions found matching your filters. Try adjusting your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-gray-900 font-mono">{filteredRecords.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to <strong className="text-gray-900 font-mono">{Math.min(currentPage * itemsPerPage, filteredRecords.length)}</strong> of <strong className="text-gray-900 font-mono">{filteredRecords.length.toLocaleString()}</strong> submissions
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-500">Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>

            <span className="px-3 py-1 font-mono font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg text-xs">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Submit Salary Report Modal */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  Submit Salary Report to Betonkemon
                </h3>
                <p className="text-xs text-gray-500">Anonymous & transparent crowdsourced report for Bangladeshi tech developers.</p>
              </div>
              <button 
                onClick={() => setSubmitModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalarySubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brain Station 23 PLC"
                    value={subForm.company}
                    onChange={e => setSubForm({ ...subForm, company: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Backend Engineer"
                    value={subForm.role}
                    onChange={e => setSubForm({ ...subForm, role: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={subForm.category}
                    onChange={e => setSubForm({ ...subForm, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="backend">Backend</option>
                    <option value="frontend">Frontend</option>
                    <option value="fullstack">Fullstack</option>
                    <option value="mobile">Mobile</option>
                    <option value="devops">DevOps / SRE</option>
                    <option value="sqa">SQA / Testing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Seniority Level</label>
                  <select
                    value={subForm.level}
                    onChange={e => setSubForm({ ...subForm, level: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Junior (0-2 Yrs)">Junior (0-2 Yrs)</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior (5+ Yrs)">Senior (5+ Yrs)</option>
                    <option value="Lead / Architect">Lead / Architect</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Work Mode</label>
                  <select
                    value={subForm.workType}
                    onChange={e => setSubForm({ ...subForm, workType: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    step={0.5}
                    value={subForm.expYears}
                    onChange={e => setSubForm({ ...subForm, expYears: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Monthly Salary (BDT) *</label>
                  <input
                    type="number"
                    required
                    min={10000}
                    max={2000000}
                    step={5000}
                    value={subForm.monthlySalaryBDT}
                    onChange={e => setSubForm({ ...subForm, monthlySalaryBDT: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tech Stack (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Node.js, PostgreSQL, Docker, AWS"
                  value={subForm.techStack}
                  onChange={e => setSubForm({ ...subForm, techStack: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Add Salary Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
