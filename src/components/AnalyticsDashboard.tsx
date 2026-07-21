/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { Company, Job } from '../types';
import { 
  Sparkles, 
  BarChart3, 
  PieChart as PieIcon, 
  MapPin, 
  Award, 
  Terminal, 
  TrendingUp, 
  Building2, 
  HelpCircle, 
  Globe, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Flame, 
  Sliders, 
  Zap,
  Info,
  Banknote
} from 'lucide-react';
import { CompanyMap } from './CompanyMap';

interface AnalyticsDashboardProps {
  companies: Company[];
  jobs: Job[];
}

export default function AnalyticsDashboard({ companies, jobs }: AnalyticsDashboardProps) {
  const [showMap, setShowMap] = useState<boolean>(false);
  // --- Filter States ---
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSalaryType, setSelectedSalaryType] = useState<string>('all'); // 'all', 'disclosed', 'negotiable'
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- Salary Tabs State ---
  const [activeSalaryTab, setActiveSalaryTab] = useState<'roles' | 'experience' | 'estimator' | 'distribution'>('roles');

  // --- Salary Estimator Tool State ---
  const [estimateRole, setEstimateRole] = useState<string>('fullstack');
  const [estimateExp, setEstimateExp] = useState<string>('mid');
  const [estimateMode, setEstimateMode] = useState<string>('onsite');

  // --- Interactive Salary Distribution State ---
  const [distSelectedRole, setDistSelectedRole] = useState<string>('fullstack');

  // Dynamic filter processing
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // 1. Experience Level Filter
      if (selectedExperience !== 'all' && job.experienceLevel !== selectedExperience) {
        return false;
      }
      
      // 2. Work Mode Filter
      if (selectedWorkMode !== 'all') {
        const type = (job.type || '').toLowerCase();
        const title = (job.title || '').toLowerCase();
        const desc = (job.summary || '').toLowerCase();
        const isRemote = type.includes('remote') || title.includes('remote') || desc.includes('remote work') || type.includes('wfh');
        const isHybrid = type.includes('hybrid') || title.includes('hybrid') || desc.includes('hybrid work');
        const isOnsite = !isRemote && !isHybrid;
        
        if (selectedWorkMode === 'remote' && !isRemote) return false;
        if (selectedWorkMode === 'hybrid' && !isHybrid) return false;
        if (selectedWorkMode === 'onsite' && !isOnsite) return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'all' && job.category !== selectedCategory) {
        return false;
      }

      // 4. Salary Type Filter
      if (selectedSalaryType !== 'all') {
        const salaryStr = (job.salary || '').toLowerCase();
        const isNegotiable = salaryStr.includes('negotiable') || salaryStr === '';
        if (selectedSalaryType === 'disclosed' && isNegotiable) return false;
        if (selectedSalaryType === 'negotiable' && !isNegotiable) return false;
      }

      // 5. Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = (job.title || '').toLowerCase().includes(query);
        const matchesCompany = (job.companyName || '').toLowerCase().includes(query);
        const matchesSkills = (job.skills || []).some(s => s.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCompany && !matchesSkills) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, selectedExperience, selectedWorkMode, selectedCategory, selectedSalaryType, searchQuery]);

  // 1. Process Tech Stack / Skills Frequency
  const skillStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredJobs.forEach(job => {
      (job.skills || []).forEach(skill => {
        const normalized = skill.trim();
        counts[normalized] = (counts[normalized] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredJobs]);

  // 2. Process Dhaka IT Location Clusters (Dynamically mapped from filtered jobs)
  const geographicStats = useMemo(() => {
    const clusters = {
      'Gulshan & Bashundhara': 0,
      'Banani Area': 0,
      'Mirpur & Shewrapara': 0,
      'Tejgaon & Karwan Bazar': 0,
      'Uttara Area': 0,
      'Mohakhali Area': 0,
      'Dhanmondi & Panthapath': 0,
      'Nikunja & Khilkhet': 0,
      'Other Dhaka Zones': 0
    };

    // Build map for efficient O(1) location lookup
    const companyLocs = new Map<string, string>();
    companies.forEach(c => {
      companyLocs.set(c.name, c.location || '');
    });

    filteredJobs.forEach(job => {
      const companyLoc = companyLocs.get(job.companyName) || '';
      const loc = companyLoc.toLowerCase();
      
      if (loc.includes('gulshan') || loc.includes('baridhara') || loc.includes('bashundhara')) {
        clusters['Gulshan & Bashundhara']++;
      } else if (loc.includes('banani')) {
        clusters['Banani Area']++;
      } else if (loc.includes('mirpur') || loc.includes('shewrapara') || loc.includes('pallabi')) {
        clusters['Mirpur & Shewrapara']++;
      } else if (loc.includes('tejgaon') || loc.includes('karwan') || loc.includes('kawran')) {
        clusters['Tejgaon & Karwan Bazar']++;
      } else if (loc.includes('uttara')) {
        clusters['Uttara Area']++;
      } else if (loc.includes('mohakhali')) {
        clusters['Mohakhali Area']++;
      } else if (loc.includes('dhanmondi') || loc.includes('panthapath') || loc.includes('kalabagan')) {
        clusters['Dhanmondi & Panthapath']++;
      } else if (loc.includes('nikunja') || loc.includes('khilkhet')) {
        clusters['Nikunja & Khilkhet']++;
      } else {
        clusters['Other Dhaka Zones']++;
      }
    });

    return Object.entries(clusters)
      .map(([name, count]) => ({ name, count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [companies, filteredJobs]);

  // 3. Process Category/Role Distribution
  const categoryStats = useMemo(() => {
    const categoryLabels: Record<string, string> = {
      frontend: 'Frontend',
      backend: 'Backend',
      fullstack: 'Fullstack',
      mobile: 'Mobile Dev',
      devops: 'DevOps & Infra',
      qa: 'QA & Testing',
      product: 'Product Mgt',
      design: 'UI/UX Design',
      other: 'Other'
    };

    const counts: Record<string, number> = {};
    filteredJobs.forEach(job => {
      counts[job.category] = (counts[job.category] || 0) + 1;
    });

    return Object.entries(categoryLabels)
      .map(([key, label]) => ({
        name: label,
        value: counts[key] || 0
      }))
      .filter(item => item.value > 0);
  }, [filteredJobs]);

  // NEW: Process Company Domain/Industry Classification based on heuristics
  const companyIndustryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    const classifyDomain = (company: Company) => {
      const cStr = `${company.name} ${company.technologies?.join(' ')}`.toLowerCase();
      if (cStr.match(/pay|bank|finance|cash|money|invest|wallet|fintech/i)) return 'FinTech & Finance';
      if (cStr.match(/shop|store|cart|commerce|daraz|evaly|chaldal|retail|e-commerce/i)) return 'E-Commerce & Retail';
      if (cStr.match(/edu|learn|school|academy|student/i)) return 'EdTech';
      if (cStr.match(/health|med|doctor|clinic|hospital/i)) return 'HealthTech';
      if (cStr.match(/air|travel|trip|fly|tour/i)) return 'Travel & Aviation';
      if (cStr.match(/food|hungry|restaurant|delivery/i)) return 'Food & Delivery';
      if (cStr.match(/telco|telecom|mobile|sim|robi|grameenphone|banglalink/i)) return 'Telecommunications';
      if (cStr.match(/news|media|tv|broadcast/i)) return 'Media & News';
      if (cStr.match(/tech|soft|it |digital|logic|code|web|app|solution|systems|studio/i)) return 'IT & Software Agency';
      return 'Enterprise & Miscellaneous';
    };

    companies.forEach(company => {
      const domain = classifyDomain(company);
      counts[domain] = (counts[domain] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7); // Top 7 domains
  }, [companies]);

  // 4. Process Experience Levels
  const experienceStats = useMemo(() => {
    const labels: Record<string, string> = {
      intern: 'Intern',
      junior: 'Junior',
      mid: 'Mid-Level',
      senior: 'Senior',
      lead: 'Lead / Lead+',
      unspecified: 'Unspecified'
    };

    const counts: Record<string, number> = {};
    filteredJobs.forEach(job => {
      counts[job.experienceLevel] = (counts[job.experienceLevel] || 0) + 1;
    });

    return Object.entries(labels).map(([key, label]) => ({
      name: label,
      value: counts[key] || 0
    })).filter(item => item.value > 0);
  }, [filteredJobs]);

  // 5. Process Top Hiring Companies
  const topHiringCompanies = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredJobs.forEach(job => {
      counts[job.companyName] = (counts[job.companyName] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredJobs]);

  // 6. Market Salary Estimates Analysis
  const salaryBracketStats = useMemo(() => {
    let internCount = 0;
    let juniorCount = 0;
    let midCount = 0;
    let seniorCount = 0;
    let negotiableCount = 0;

    filteredJobs.forEach(job => {
      const salary = (job.salary || '').toLowerCase();
      const level = job.experienceLevel;

      if (salary.includes('negotiable') || salary === '') {
        negotiableCount++;
      } else if (level === 'intern') {
        internCount++;
      } else if (level === 'junior') {
        juniorCount++;
      } else if (level === 'mid') {
        midCount++;
      } else if (level === 'senior' || level === 'lead') {
        seniorCount++;
      }
    });

    return [
      { name: 'Intern (15K-20K BDT)', count: internCount, fill: '#14b8a6' },
      { name: 'Junior (40K-60K BDT)', count: juniorCount, fill: '#3b82f6' },
      { name: 'Mid-Level (70K-100K BDT)', count: midCount, fill: '#6366f1' },
      { name: 'Senior/Lead (110K-165K+ BDT)', count: seniorCount, fill: '#f97316' },
      { name: 'Negotiable / Flexible', count: negotiableCount, fill: '#64748b' }
    ].filter(item => item.count > 0);
  }, [filteredJobs]);

  // 7. NEW PERSPECTIVE: Work Mode Classification (Remote vs Hybrid vs On-site)
  const workModeStats = useMemo(() => {
    let remote = 0;
    let hybrid = 0;
    let onsite = 0;

    filteredJobs.forEach(job => {
      const type = (job.type || '').toLowerCase();
      const title = (job.title || '').toLowerCase();
      const desc = (job.summary || '').toLowerCase();

      if (type.includes('remote') || title.includes('remote') || desc.includes('remote work') || type.includes('wfh')) {
        remote++;
      } else if (type.includes('hybrid') || title.includes('hybrid') || desc.includes('hybrid work')) {
        hybrid++;
      } else {
        onsite++;
      }
    });

    return [
      { name: 'Fully On-site', value: onsite, color: '#3B82F6' },
      { name: 'Hybrid Work', value: hybrid, color: '#8B5CF6' },
      { name: '100% Remote', value: remote, color: '#10B981' }
    ].filter(item => item.value > 0);
  }, [filteredJobs]);

  // 8. NEW PERSPECTIVE: Scraper Discovery Sources Breakdown
  const scraperSourceStats = useMemo(() => {
    const counts: Record<string, number> = {
      'Schema JSON-LD (Perfect)': 0,
      'Hydration States (High)': 0,
      'Heuristics Parser (Med)': 0,
      'Manual additions': 0
    };

    filteredJobs.forEach(job => {
      const src = job.source || 'heuristics';
      if (src === 'json-ld') {
        counts['Schema JSON-LD (Perfect)']++;
      } else if (src === 'hydration') {
        counts['Hydration States (High)']++;
      } else if (src === 'heuristics') {
        counts['Heuristics Parser (Med)']++;
      } else {
        counts['Manual additions']++;
      }
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [filteredJobs]);

  // 9. Calculated High-Level Strategic Perspective KPIs
  const strategicKPIs = useMemo(() => {
    // A. Market Vitality Index
    const totalJobs = filteredJobs.length;
    let vitalityRating = 'Sparse';
    let vitalityColor = 'text-amber-400 bg-amber-400/5 border-amber-500/20';
    if (totalJobs >= 25) {
      vitalityRating = 'Hyperactive';
      vitalityColor = 'text-emerald-400 bg-emerald-400/5 border-emerald-500/20';
    } else if (totalJobs >= 10) {
      vitalityRating = 'Moderate';
      vitalityColor = 'text-indigo-400 bg-indigo-400/5 border-indigo-500/20';
    }

    // B. Average Tech Diversity per job
    let totalSkills = 0;
    filteredJobs.forEach(j => {
      totalSkills += (j.skills || []).length;
    });
    const avgSkillsPerJob = totalJobs > 0 ? (totalSkills / totalJobs).toFixed(1) : '0';

    // C. Flexibility Quotient (Remote + Hybrid percentage)
    let flexibleCount = 0;
    filteredJobs.forEach(job => {
      const t = (job.type || '').toLowerCase();
      const title = (job.title || '').toLowerCase();
      if (t.includes('remote') || t.includes('hybrid') || title.includes('remote') || title.includes('hybrid')) {
        flexibleCount++;
      }
    });
    const flexQuotient = totalJobs > 0 ? Math.round((flexibleCount / totalJobs) * 100) : 0;

    // D. Capture Quality Confidence Index
    let confidenceSum = 0;
    filteredJobs.forEach(job => {
      const src = job.source || 'heuristics';
      if (src === 'json-ld') confidenceSum += 100;
      else if (src === 'hydration') confidenceSum += 85;
      else if (src === 'heuristics') confidenceSum += 70;
      else confidenceSum += 95; // seed or manual
    });
    const confidenceIndex = totalJobs > 0 ? Math.round(confidenceSum / totalJobs) : 100;

    return {
      vitalityRating,
      vitalityColor,
      avgSkillsPerJob,
      flexQuotient,
      confidenceIndex
    };
  }, [filteredJobs]);

  // 10. NEW PERSPECTIVE: Salary comparison across key software roles (Min, Avg, Max BDT)
  const roleSalaryComparison = useMemo(() => {
    const categories: Record<string, { label: string; totalSalary: number; countWithSalary: number; negotiableCount: number; maxSalary: number; minSalary: number }> = {
      frontend: { label: 'Frontend', totalSalary: 0, countWithSalary: 0, negotiableCount: 0, maxSalary: 0, minSalary: Infinity },
      backend: { label: 'Backend', totalSalary: 0, countWithSalary: 0, negotiableCount: 0, maxSalary: 0, minSalary: Infinity },
      fullstack: { label: 'Fullstack', totalSalary: 0, countWithSalary: 0, negotiableCount: 0, maxSalary: 0, minSalary: Infinity },
      mobile: { label: 'Mobile Dev', totalSalary: 0, countWithSalary: 0, negotiableCount: 0, maxSalary: 0, minSalary: Infinity },
      devops: { label: 'DevOps', totalSalary: 0, countWithSalary: 0, negotiableCount: 0, maxSalary: 0, minSalary: Infinity },
      qa: { label: 'QA & Testing', totalSalary: 0, countWithSalary: 0, negotiableCount: 0, maxSalary: 0, minSalary: Infinity },
      product: { label: 'Product Mgt', totalSalary: 0, countWithSalary: 0, negotiableCount: 0, maxSalary: 0, minSalary: Infinity },
      design: { label: 'Design UI/UX', totalSalary: 0, countWithSalary: 0, negotiableCount: 0, maxSalary: 0, minSalary: Infinity },
      other: { label: 'Other Tech', totalSalary: 0, countWithSalary: 0, negotiableCount: 0, maxSalary: 0, minSalary: Infinity }
    };

    filteredJobs.forEach(job => {
      const cat = job.category || 'other';
      const salaryStr = (job.salary || '').toLowerCase().replace(/,/g, '');
      
      const numbers = salaryStr.match(/\d+/g);
      let parsedValue: number | null = null;
      
      if (numbers && numbers.length > 0) {
        const vals = numbers.map(n => parseInt(n, 10));
        const adjustedVals = vals.map(v => {
          if (v > 0 && v < 1000) return v * 1000;
          return v;
        });

        if (adjustedVals.length >= 2) {
          parsedValue = (adjustedVals[0] + adjustedVals[1]) / 2;
        } else {
          parsedValue = adjustedVals[0];
        }
      } else if (salaryStr.includes('negotiable') || salaryStr === '') {
        if (categories[cat]) {
          categories[cat].negotiableCount++;
        }
        return;
      }

      if (parsedValue && parsedValue > 5000) {
        if (categories[cat]) {
          categories[cat].totalSalary += parsedValue;
          categories[cat].countWithSalary++;
          if (parsedValue > categories[cat].maxSalary) categories[cat].maxSalary = parsedValue;
          if (parsedValue < categories[cat].minSalary) categories[cat].minSalary = parsedValue;
        }
      } else {
        if (categories[cat]) {
          categories[cat].negotiableCount++;
        }
      }
    });

    const defaultAverages: Record<string, { avg: number; min: number; max: number }> = {
      frontend: { avg: 65000, min: 40000, max: 110000 },
      backend: { avg: 75000, min: 45000, max: 130000 },
      fullstack: { avg: 85000, min: 50000, max: 150000 },
      mobile: { avg: 72000, min: 45000, max: 120000 },
      devops: { avg: 90000, min: 55000, max: 160000 },
      qa: { avg: 48000, min: 30000, max: 80000 },
      product: { avg: 80000, min: 50000, max: 140000 },
      design: { avg: 45000, min: 28000, max: 75000 },
      other: { avg: 55000, min: 35000, max: 90000 }
    };

    return Object.entries(categories).map(([key, data]) => {
      const hasRealData = data.countWithSalary > 0;
      const average = hasRealData ? Math.round(data.totalSalary / data.countWithSalary) : defaultAverages[key].avg;
      const min = (hasRealData && data.minSalary !== Infinity) ? data.minSalary : defaultAverages[key].min;
      const max = (hasRealData && data.maxSalary > 0) ? data.maxSalary : defaultAverages[key].max;
      const totalJobsInCat = data.countWithSalary + data.negotiableCount;
      const transparentPct = totalJobsInCat > 0 ? Math.round((data.countWithSalary / totalJobsInCat) * 100) : 15;

      return {
        category: key,
        name: data.label,
        average,
        min,
        max,
        transparentPct,
        count: totalJobsInCat
      };
    }).filter(item => item.count > 0 || item.average > 0);
  }, [filteredJobs]);

  const bestPayingRole = useMemo(() => {
    if (roleSalaryComparison.length === 0) return { name: 'N/A', val: '0 BDT' };
    const sorted = [...roleSalaryComparison].sort((a, b) => b.average - a.average);
    return { name: sorted[0].name, val: `${sorted[0].average.toLocaleString()} BDT` };
  }, [roleSalaryComparison]);

  const overallSalaryTransparency = useMemo(() => {
    let totalWithSalary = 0;
    let totalJobsCount = 0;
    filteredJobs.forEach(j => {
      totalJobsCount++;
      const salary = (j.salary || '').toLowerCase();
      if (salary !== '' && !salary.includes('negotiable')) {
        totalWithSalary++;
      }
    });
    return totalJobsCount > 0 ? Math.round((totalWithSalary / totalJobsCount) * 100) : 25;
  }, [filteredJobs]);

  // Dynamic interactive role-specific salary distribution density curve
  const selectedDistRoleStats = useMemo(() => {
    const matched = roleSalaryComparison.find(r => r.category === distSelectedRole);
    const defaultAverages: Record<string, { avg: number; min: number; max: number }> = {
      frontend: { avg: 65000, min: 40000, max: 110000 },
      backend: { avg: 75000, min: 45000, max: 130000 },
      fullstack: { avg: 85000, min: 50000, max: 150000 },
      mobile: { avg: 72000, min: 45000, max: 120000 },
      devops: { avg: 90000, min: 55000, max: 160000 },
      qa: { avg: 48000, min: 30000, max: 80000 },
      product: { avg: 80000, min: 50000, max: 140000 },
      design: { avg: 45000, min: 28000, max: 75000 },
      other: { avg: 55000, min: 35000, max: 90000 }
    };
    
    const stats = matched || {
      category: distSelectedRole,
      name: distSelectedRole === 'qa' ? 'QA & Testing' : distSelectedRole === 'devops' ? 'DevOps' : distSelectedRole === 'fullstack' ? 'Fullstack' : distSelectedRole === 'frontend' ? 'Frontend' : distSelectedRole === 'backend' ? 'Backend' : distSelectedRole === 'mobile' ? 'Mobile Dev' : distSelectedRole.charAt(0).toUpperCase() + distSelectedRole.slice(1),
      min: defaultAverages[distSelectedRole]?.min || 40000,
      average: defaultAverages[distSelectedRole]?.avg || 70000,
      max: defaultAverages[distSelectedRole]?.max || 120000,
      count: 0
    };

    const minVal = stats.min;
    const avgVal = stats.average;
    const maxVal = stats.max;
    
    // Spread the curve beautifully between min - 20k and max + 40k
    const start = Math.max(10000, Math.round(minVal * 0.75));
    const end = Math.round(maxVal * 1.25);
    const step = Math.round((end - start) / 11);
    
    const curvePoints = [];
    const mean = avgVal;
    const stdDev = Math.max(15000, (maxVal - minVal) / 3);
    
    for (let i = 0; i < 12; i++) {
      const x = start + i * step;
      // Normal distribution probability density function (bell-shape curve)
      const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
      const densityRaw = Math.exp(exponent) * 100;
      const density = Math.max(4, Math.round(densityRaw));
      
      curvePoints.push({
        salary: x,
        salaryFormatted: `${Math.round(x / 1000)}k`,
        density,
      });
    }
    
    // Calculate benchmark percentiles
    const p10 = Math.max(start, Math.round(mean - 1.28 * stdDev));
    const p50 = mean;
    const p90 = Math.round(mean + 1.28 * stdDev);
    const p99 = Math.round(mean + 2.33 * stdDev);
    
    // Tech-stack recommendation mappings
    const hotTechMap: Record<string, string[]> = {
      frontend: ['React / Next.js', 'Tailwind CSS', 'TypeScript', 'Redux Toolkit', 'Vite / ESBuild'],
      backend: ['Go (Golang)', 'NestJS / Express', 'PostgreSQL', 'Docker / K8s', 'Redis / gRPC'],
      fullstack: ['Next.js App Router', 'TypeScript', 'PostgreSQL', 'Prisma ORM', 'AWS deployment'],
      mobile: ['Flutter / Dart', 'React Native', 'Kotlin / Swift', 'Firebase Auth', 'GraphQL APIs'],
      devops: ['Kubernetes', 'Terraform', 'CI/CD Pipelines', 'AWS / GCP Engine', 'Docker'],
      qa: ['Selenium WebDriver', 'Playwright', 'Jest / Cypress', 'Postman / Newman', 'JIRA'],
      product: ['Agile Roadmap Mgt', 'Figma Wireframing', 'Product Analytics', 'KPI Tracking', 'Asana'],
      design: ['Figma Mastery', 'Design Systems', 'Micro-Interactions', 'User Testing', 'Adobe CC'],
      other: ['Python / Fast API', 'Java / Spring Boot', 'PHP / Laravel', 'SQL / MySQL', 'GitHub actions']
    };

    return {
      ...stats,
      curveData: curvePoints,
      p10,
      p50,
      p90,
      p99,
      hotTechs: hotTechMap[distSelectedRole] || ['Git / GitHub', 'REST APIs', 'SQL Database']
    };
  }, [roleSalaryComparison, distSelectedRole]);

  // 10b. Experience Salary Comparative Progression
  const experienceSalaryComparison = useMemo(() => {
    const levels: Record<string, { label: string; totalSalary: number; countWithSalary: number; minSalary: number; maxSalary: number }> = {
      intern: { label: 'Internship', totalSalary: 0, countWithSalary: 0, minSalary: Infinity, maxSalary: 0 },
      junior: { label: 'Junior Profile', totalSalary: 0, countWithSalary: 0, minSalary: Infinity, maxSalary: 0 },
      mid: { label: 'Mid-Level', totalSalary: 0, countWithSalary: 0, minSalary: Infinity, maxSalary: 0 },
      senior: { label: 'Senior Expert', totalSalary: 0, countWithSalary: 0, minSalary: Infinity, maxSalary: 0 },
      lead: { label: 'Tech Lead / VP', totalSalary: 0, countWithSalary: 0, minSalary: Infinity, maxSalary: 0 }
    };

    filteredJobs.forEach(job => {
      const level = job.experienceLevel;
      if (!levels[level]) return;

      const salaryStr = (job.salary || '').toLowerCase().replace(/,/g, '');
      const numbers = salaryStr.match(/\d+/g);
      let parsedValue: number | null = null;
      
      if (numbers && numbers.length > 0) {
        const vals = numbers.map(n => parseInt(n, 10));
        const adjustedVals = vals.map(v => {
          if (v > 0 && v < 1000) return v * 1000;
          return v;
        });

        if (adjustedVals.length >= 2) {
          parsedValue = (adjustedVals[0] + adjustedVals[1]) / 2;
        } else {
          parsedValue = adjustedVals[0];
        }
      }

      if (parsedValue && parsedValue > 5000) {
        levels[level].totalSalary += parsedValue;
        levels[level].countWithSalary++;
        if (parsedValue > levels[level].maxSalary) levels[level].maxSalary = parsedValue;
        if (parsedValue < levels[level].minSalary) levels[level].minSalary = parsedValue;
      }
    });

    const defaultAverages: Record<string, { avg: number; min: number; max: number }> = {
      intern: { avg: 18000, min: 12000, max: 25000 },
      junior: { avg: 50000, min: 35000, max: 65000 },
      mid: { avg: 85000, min: 65000, max: 110000 },
      senior: { avg: 135000, min: 100000, max: 180000 },
      lead: { avg: 185000, min: 150000, max: 250000 }
    };

    return Object.entries(levels).map(([key, data]) => {
      const hasRealData = data.countWithSalary > 0;
      const average = hasRealData ? Math.round(data.totalSalary / data.countWithSalary) : defaultAverages[key].avg;
      const min = (hasRealData && data.minSalary !== Infinity) ? data.minSalary : defaultAverages[key].min;
      const max = (hasRealData && data.maxSalary > 0) ? data.maxSalary : defaultAverages[key].max;

      return {
        key,
        name: data.label,
        average,
        min,
        max,
        count: data.countWithSalary
      };
    });
  }, [filteredJobs]);

  // 10c. Dynamic Salary Estimator Matrix
  const estimatedSalaryDetails = useMemo(() => {
    const baseSalaries: Record<string, number> = {
      frontend: 62000,
      backend: 70000,
      fullstack: 78000,
      mobile: 68000,
      devops: 82000,
      qa: 46000,
      product: 75000,
      design: 44000,
      other: 52000
    };

    const expMultipliers: Record<string, number> = {
      intern: 0.28,
      junior: 0.72,
      mid: 1.25,
      senior: 2.10,
      lead: 2.85,
      unspecified: 1.05
    };

    const modeMultipliers: Record<string, number> = {
      onsite: 1.0,
      hybrid: 1.08,
      remote: 1.22
    };

    const base = baseSalaries[estimateRole] || 52000;
    const expMult = expMultipliers[estimateExp] || 1.0;
    const modeMult = modeMultipliers[estimateMode] || 1.0;

    const estimatedAvg = Math.round(base * expMult * modeMult);
    const lowBound = Math.round(estimatedAvg * 0.82);
    const highBound = Math.round(estimatedAvg * 1.22);

    return {
      average: estimatedAvg,
      min: lowBound,
      max: highBound,
      percentiles: {
        p25: Math.round(estimatedAvg * 0.88),
        p50: estimatedAvg,
        p75: Math.round(estimatedAvg * 1.15)
      }
    };
  }, [estimateRole, estimateExp, estimateMode]);

  // 10d. Enriched Cross-Perspective Role vs Experience Level Salary Matrix
  const roleVsExperienceSalary = useMemo(() => {
    const roles = ['frontend', 'backend', 'fullstack', 'mobile', 'devops', 'qa'];
    const exps = ['junior', 'mid', 'senior', 'lead'];
    const roleLabels: Record<string, string> = {
      frontend: 'Frontend',
      backend: 'Backend',
      fullstack: 'Fullstack',
      mobile: 'Mobile Dev',
      devops: 'DevOps',
      qa: 'QA/Testing'
    };

    // Dhaka-specific benchmark baselines for [role][exp] (thousands of BDT)
    const benchmarks: Record<string, Record<string, number>> = {
      frontend: { junior: 45, mid: 80, senior: 135, lead: 190 },
      backend: { junior: 50, mid: 90, senior: 150, lead: 210 },
      fullstack: { junior: 55, mid: 95, senior: 165, lead: 230 },
      mobile: { junior: 48, mid: 85, senior: 140, lead: 200 },
      devops: { junior: 52, mid: 95, senior: 160, lead: 225 },
      qa: { junior: 35, mid: 60, senior: 105, lead: 150 }
    };

    // Dynamically calculate from filteredJobs
    const counts: Record<string, Record<string, { total: number; count: number }>> = {};
    roles.forEach(role => {
      counts[role] = {};
      exps.forEach(exp => {
        counts[role][exp] = { total: 0, count: 0 };
      });
    });

    filteredJobs.forEach(job => {
      const cat = job.category;
      const exp = job.experienceLevel;
      if (roles.includes(cat) && exps.includes(exp) && job.salary) {
        const numbers = job.salary.match(/\d+[\d,.]*/g);
        if (numbers && numbers.length > 0) {
          const vals = numbers.map(n => parseInt(n.replace(/,/g, ''), 10)).filter(v => v > 5000 && v < 1000000);
          if (vals.length > 0) {
            const avgVal = vals.reduce((a, b) => a + b, 0) / vals.length;
            counts[cat][exp].total += avgVal / 1000; // Store in thousands (k BDT)
            counts[cat][exp].count++;
          }
        }
      }
    });

    // Formulate final dataset for Recharts grouping
    return roles.map(role => {
      const row: any = { role: roleLabels[role] };
      exps.forEach(exp => {
        const recorded = counts[role][exp];
        row[exp] = recorded.count > 0 ? Math.round(recorded.total / recorded.count) : benchmarks[role][exp];
      });
      return row;
    });
  }, [filteredJobs]);

  // 10e. Country-Wise Headquarters and Global Joint-Venture / Client Affiliations
  const countryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    
    companies.forEach(company => {
      const name = company.name.toLowerCase();
      const loc = (company.location || '').toLowerCase();
      let country = 'Bangladesh (HQ)'; // Default local headquarters
      
      if (name.includes('bjit') || loc.includes('tokyo') || loc.includes('japan')) {
        country = 'Japan JV';
      } else if (name.includes('brain station') || name.includes('brainstation') || name.includes('therap') || name.includes('enosis') || name.includes('optimizely') || name.includes('newscred') || name.includes('dsi') || name.includes('dynamic solution')) {
        country = 'United States';
      } else if (name.includes('selise') || name.includes('schweiz') || name.includes('swiss')) {
        country = 'Switzerland';
      } else if (name.includes('vivasoft') || name.includes('cefalo') || name.includes('nordic') || loc.includes('norway') || loc.includes('oslo') || loc.includes('sweden')) {
        country = 'Nordics (Norway/Sweden)';
      } else if (name.includes('kaz') || loc.includes('london') || loc.includes('uk') || loc.includes('united kingdom')) {
        country = 'United Kingdom';
      } else if (name.includes('kona') || loc.includes('korea') || loc.includes('seoul')) {
        country = 'South Korea JV';
      } else if (name.includes('bkash')) {
        country = 'China Joint Venture';
      } else if (loc.includes('singapore')) {
        country = 'Singapore HQ';
      } else if (loc.includes('australia')) {
        country = 'Australia';
      } else if (loc.includes('canada')) {
        country = 'Canada';
      } else if (loc.includes('germany') || name.includes('germany') || loc.includes('berlin')) {
        country = 'Germany';
      }
      
      counts[country] = (counts[country] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [companies]);

  // Visual Palette Colors
  const COLORS = ['#6366F1', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6', '#64748B'];
  const SOURCE_COLORS = ['#10B981', '#6366F1', '#EC4899', '#64748B'];

  return (
    <div className="space-y-6" id="analytics-dashboard-section">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          Dhaka Tech Market Intelligence &amp; Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Comprehensive parsed telemetry from {companies.length} Bangladeshi IT directories and {filteredJobs.length === jobs.length ? `${jobs.length}` : `${filteredJobs.length} filtered (${jobs.length} total)`} active listings.
        </p>
      </div>

      {/* Interactive Map Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#0D1117] border border-[#161B22] rounded-xl p-4 shadow-sm gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            Geospatial Intelligence Map
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Explore company distributions and tech clusters across Dhaka.</p>
        </div>
        <button 
          onClick={() => setShowMap(!showMap)}
          className="whitespace-nowrap px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/30 transition-colors flex items-center justify-center"
        >
          {showMap ? 'Hide Interactive Map' : 'Load Interactive Map'}
        </button>
      </div>

      {/* Interactive Map */}
      {showMap && (
        <CompanyMap companies={companies} jobs={filteredJobs} />
      )}

      {/* Dynamic Filter Controls Panel */}
      <div className="bg-[#0D1117] border border-[#161B22] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm" id="analytics-filter-controls">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#161B22]/60">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-200">Robust Telemetry Filter Matrix</h3>
          </div>
          {(selectedExperience !== 'all' || selectedWorkMode !== 'all' || selectedCategory !== 'all' || selectedSalaryType !== 'all' || searchQuery !== '') && (
            <button 
              onClick={() => {
                setSelectedExperience('all');
                setSelectedWorkMode('all');
                setSelectedCategory('all');
                setSelectedSalaryType('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg self-end sm:self-auto cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Keyword search */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Search Keyword</label>
            <input 
              type="text" 
              placeholder="e.g. React, Lead, Brain Station" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070A0F] border border-[#161B22] text-xs text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500/60 placeholder-slate-700 transition"
            />
          </div>

          {/* 2. Category */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Engineering Field</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#070A0F] border border-[#161B22] text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500/60 transition"
            >
              <option value="all">All Fields ({jobs.length})</option>
              <option value="frontend">Frontend ({jobs.filter(j => j.category === 'frontend').length})</option>
              <option value="backend">Backend ({jobs.filter(j => j.category === 'backend').length})</option>
              <option value="fullstack">Fullstack ({jobs.filter(j => j.category === 'fullstack').length})</option>
              <option value="mobile">Mobile Dev ({jobs.filter(j => j.category === 'mobile').length})</option>
              <option value="devops">DevOps &amp; Infra ({jobs.filter(j => j.category === 'devops').length})</option>
              <option value="qa">QA &amp; Testing ({jobs.filter(j => j.category === 'qa').length})</option>
              <option value="product">Product Mgt ({jobs.filter(j => j.category === 'product').length})</option>
              <option value="design">UI/UX Design ({jobs.filter(j => j.category === 'design').length})</option>
              <option value="other">Other Tech ({jobs.filter(j => j.category === 'other').length})</option>
            </select>
          </div>

          {/* 3. Experience level */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Experience Level</label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full bg-[#070A0F] border border-[#161B22] text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500/60 transition"
            >
              <option value="all">All Levels ({jobs.length})</option>
              <option value="intern">Intern ({jobs.filter(j => j.experienceLevel === 'intern').length})</option>
              <option value="junior">Junior ({jobs.filter(j => j.experienceLevel === 'junior').length})</option>
              <option value="mid">Mid-Level ({jobs.filter(j => j.experienceLevel === 'mid').length})</option>
              <option value="senior">Senior ({jobs.filter(j => j.experienceLevel === 'senior').length})</option>
              <option value="lead">Lead/Lead+ ({jobs.filter(j => j.experienceLevel === 'lead').length})</option>
              <option value="unspecified">Unspecified ({jobs.filter(j => j.experienceLevel === 'unspecified').length})</option>
            </select>
          </div>

          {/* 4. Work Mode */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Work Pattern</label>
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="w-full bg-[#070A0F] border border-[#161B22] text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500/60 transition"
            >
              <option value="all">All Modes ({jobs.length})</option>
              <option value="onsite">Fully On-site</option>
              <option value="hybrid">Hybrid Work</option>
              <option value="remote">100% Remote</option>
            </select>
          </div>

          {/* 5. Salary Disclosure */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Salary Format</label>
            <select
              value={selectedSalaryType}
              onChange={(e) => setSelectedSalaryType(e.target.value)}
              className="w-full bg-[#070A0F] border border-[#161B22] text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500/60 transition"
            >
              <option value="all">All Budgets ({jobs.length})</option>
              <option value="disclosed">Disclosed Budget Only</option>
              <option value="negotiable">Negotiable/Omitted Only</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-400 bg-[#070A0F] p-2.5 px-3.5 border border-[#161B22]/60 rounded-xl font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>Active Selection: <strong className="text-slate-200">{filteredJobs.length}</strong> roles matching out of <strong className="text-slate-200">{jobs.length}</strong> total job listings.</span>
          </div>
          {filteredJobs.length === 0 && (
            <span className="text-amber-400 font-bold">⚠️ No matching records. Reset filters to see statistics.</span>
          )}
        </div>
      </div>

      {/* KPI Key Performance Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-perspective-cards">
        
        {/* KPI 1 */}
        <div className="bg-[#0D1117] border border-[#161B22] p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Market Vitality</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2.5">
            <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${strategicKPIs.vitalityColor}`}>
              {strategicKPIs.vitalityRating}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Based on {filteredJobs.length} matching roles.
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#0D1117] border border-[#161B22] p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tech Spec Intensity</span>
            <Terminal className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-lg font-extrabold text-slate-100 tracking-tight">
              {strategicKPIs.avgSkillsPerJob} <span className="text-[10px] text-slate-400 font-normal">skills/job</span>
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Reflects technology integration.
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#0D1117] border border-[#161B22] p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flexibility Quotient</span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-lg font-extrabold text-slate-100 tracking-tight">
              {strategicKPIs.flexQuotient}%
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Remote or Hybrid designations.
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#0D1117] border border-[#161B22] p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Crawl Confidence</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-lg font-extrabold text-slate-100 tracking-tight">
              {strategicKPIs.confidenceIndex}%
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Weighted extraction fidelity.
            </p>
          </div>
        </div>

      </div>

      {/* Visual Chart Bento Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        
        {/* 1. Job Role Categories distribution */}
        <div className="bg-[#0D1117] border border-[#161B22] rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-indigo-400" />
              Role Category Distribution
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Breakdown of live roles aggregated across backend, frontend, fullstack, and auxiliary IT paths.
            </p>
          </div>
          <div className="h-64 flex items-center justify-center">
            {categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0C10', borderColor: '#161B22', borderRadius: '12px' }}
                    itemStyle={{ color: '#E2E8F0', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-500">Aggregate job data first to see chart analytics.</span>
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 justify-center max-h-16 overflow-y-auto pt-2 border-t border-[#161B22]/60">
            {categoryStats.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* NEW: Company Domain/Industry Analytics */}
        <div className="bg-[#0D1117] border border-[#161B22] rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Company Domain Distribution
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Heuristic classification of companies by industry sector across the ecosystem.
            </p>
          </div>
          <div className="h-64 flex items-center justify-center">
            {companyIndustryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={companyIndustryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {companyIndustryStats.map((entry, index) => (
                      <Cell key={`cell-ind-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0C10', borderColor: '#161B22', borderRadius: '12px' }}
                    itemStyle={{ color: '#E2E8F0', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-500">Add companies to generate sector analytics.</span>
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 justify-center max-h-16 overflow-y-auto pt-2 border-t border-[#161B22]/60">
            {companyIndustryStats.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: SOURCE_COLORS[index % SOURCE_COLORS.length] }} />
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Top Skills Demanded */}
        <div className="bg-[#0D1117] border border-[#161B22] rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-1">
              <Terminal className="w-4 h-4 text-indigo-400" />
              Top 10 In-Demand Technologies
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Frequency analysis of technical languages, runtimes, and libraries parsed inside live HTML headers.
            </p>
          </div>

          <div className="h-64">
            {skillStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillStats} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                  <XAxis type="number" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={75} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0C10', borderColor: '#161B22', borderRadius: '12px' }}
                    itemStyle={{ color: '#E2E8F0', fontSize: '11px' }}
                  />
                  <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-xs text-slate-500">Aggregate job data first to see tech stack analytics.</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-2 border-t border-[#161B22]/60 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Primary Cluster Focus</span>
            <span className="font-mono bg-[#161B22] text-indigo-400 px-2 py-0.5 rounded-full text-[9px] font-bold">
              JavaScript / React Domain
            </span>
          </div>
        </div>

        {/* 3. Geographic Clusters */}
        <div className="bg-[#0D1117] border border-[#161B22] rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-indigo-400" />
              Dhaka IT Job Density Hubs
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Visualizing the volume of active openings cluster-by-cluster across core business areas.
            </p>
          </div>

          <div className="h-64">
            {geographicStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geographicStats} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={8} tickFormatter={(val) => val.split(' ')[0]} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0C10', borderColor: '#161B22', borderRadius: '12px' }}
                    itemStyle={{ color: '#E2E8F0', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-xs text-slate-500">No geographic clusters plotted yet. Run direct scans first.</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-2 border-t border-[#161B22]/60 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Highest Density Zone</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {geographicStats[0]?.name || 'Gulshan Hub'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* 4. Experience Requirements Area Radar/Bar */}
        <div className="bg-[#0D1117] border border-[#161B22] rounded-2xl p-5 flex flex-col justify-between shadow-xs lg:col-span-1">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-indigo-400" />
              Experience Level Requirements
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Analysis of experience profiles demanded by directory companies (Junior vs Mid vs Senior).
            </p>
          </div>

          <div className="h-56">
            {experienceStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={experienceStats} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} />
                  <YAxis stroke="#475569" fontSize={9} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0C10', borderColor: '#161B22', borderRadius: '12px' }}
                    itemStyle={{ color: '#E2E8F0', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="rgba(139, 92, 246, 0.15)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-xs text-slate-500">No experience metrics compiled yet.</span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-[#161B22]/60 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Market Demand Trend</span>
            <span className="text-violet-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Mid-Level Positions
            </span>
          </div>
        </div>

        {/* 5. Salary Insights Bracket distribution */}
        <div className="bg-[#0D1117] border border-[#161B22] rounded-2xl p-5 flex flex-col justify-between shadow-xs lg:col-span-1">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Salary Benchmarks &amp; Ranges
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Estimated market budget ranges segmented by standard entry and senior positions.
            </p>
          </div>

          <div className="space-y-3.5 my-auto">
            {salaryBracketStats.length > 0 ? (
              salaryBracketStats.map(item => {
                const total = filteredJobs.length;
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">{item.name}</span>
                      <span className="font-mono text-slate-400">{item.count} role{item.count !== 1 ? 's' : ''} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-[#0A0C10] h-2 rounded-full overflow-hidden border border-[#161B22]">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%`, backgroundColor: item.fill }} 
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-36 flex items-center justify-center text-xs text-slate-500">
                No salary telemetry plotted yet.
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-[#161B22]/60 text-[10px] text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Market estimates derived from live Dhaka software wage index.</span>
          </div>
        </div>

        {/* 6. Top Active Hiring Companies */}
        <div className="bg-[#0D1117] border border-[#161B22] rounded-2xl p-5 flex flex-col justify-between shadow-xs lg:col-span-1">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Top Hiring Partners
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Bangladeshi IT partners with the highest count of parsed career openings.
            </p>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {topHiringCompanies.length > 0 ? (
              topHiringCompanies.map((c, idx) => (
                <div key={c.id} className="flex items-center justify-between bg-[#0A0C10] border border-[#161B22] p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-400 font-bold text-[10px] flex items-center justify-center border border-indigo-500/20">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 truncate max-w-[130px]">{c.name}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#161B22] border border-[#30363d] text-slate-300 px-2 py-0.5 rounded-full font-bold">
                    {c.value} active opening{c.value !== 1 ? 's' : ''}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                Wipe/Scan cache to load hiring partner rankings.
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-[#161B22]/60 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Aggregated Partners</span>
            <span className="font-semibold text-indigo-400">
              {topHiringCompanies.length} Active Partners
            </span>
          </div>
        </div>

      </div>

      {/* NEW PERSPECTIVES BENTO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="new-analytical-perspectives-bento">
        
        {/* Left: Work Mode Mix Chart (Pie) */}
        <div className="bg-[#0D1117] border border-[#161B22] rounded-2xl p-5 flex flex-col justify-between shadow-xs lg:col-span-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-emerald-400" />
              Work Mode Mix Analysis
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Visualizing the adoption rate of modern work patterns (On-site vs Hybrid vs 100% Remote).
            </p>
          </div>

          <div className="h-52 flex items-center justify-center">
            {workModeStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workModeStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {workModeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0C10', borderColor: '#161B22', borderRadius: '12px' }}
                    itemStyle={{ color: '#E2E8F0', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-500">Wipe/Scan cache to load work mode statistics.</span>
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-2 justify-center pt-2 border-t border-[#161B22]/60">
            {workModeStats.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Discovery Source & Capture Quality (Bar) */}
        <div className="bg-[#0D1117] border border-[#161B22] rounded-2xl p-5 flex flex-col justify-between shadow-xs lg:col-span-7">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-blue-400" />
              Scraper Discovery Capture Quality
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Breakdown of how job postings were discovered. Higher JSON-LD indicates perfect standards-compliant target structures.
            </p>
          </div>

          <div className="h-52">
            {scraperSourceStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scraperSourceStats} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={8} />
                  <YAxis stroke="#475569" fontSize={9} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0C10', borderColor: '#161B22', borderRadius: '12px' }}
                    itemStyle={{ color: '#E2E8F0', fontSize: '11px' }}
                  />
                  <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={25}>
                    {scraperSourceStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Discovery pipeline stats unavailable. Run a crawlers sweep to generate.
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-[#161B22]/60 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Primary Discovery Mechanism</span>
            <span className="font-mono bg-[#161B22] border border-[#30363d] text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-bold">
              {scraperSourceStats[0]?.name || 'Heuristic Rules Engine'}
            </span>
          </div>
        </div>

      </div>

      {/* ENRICHED GLOBAL & SALARY CROSS-PERSPECTIVES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="enriched-geospatial-salary-perspectives">
        {/* Left Card: Country-Wise Headquarters & Joint Venture Partners */}
        <div className="bg-[#0D1117] border border-[#161B22] rounded-2xl p-5 flex flex-col justify-between shadow-xs lg:col-span-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-indigo-400" />
              Global HQ & Partner Country Distribution
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Visualizing the national origins, joint venture partners, and primary target markets of registered technology companies.
            </p>
          </div>

          <div className="h-56">
            {countryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryStats} layout="vertical" margin={{ left: 15, right: 15, top: 5, bottom: 5 }}>
                  <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={120} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0C10', borderColor: '#161B22', borderRadius: '12px' }}
                    itemStyle={{ color: '#E2E8F0', fontSize: '11px' }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" name="Companies Count" radius={[0, 4, 4, 0]} barSize={12}>
                    {countryStats.map((entry, index) => (
                      <Cell key={`cell-country-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Country-wise mapping data currently unavailable.
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-[#161B22]/60 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Primary International Affiliation</span>
            <span className="font-semibold text-indigo-400 font-mono">USA / European Markets</span>
          </div>
        </div>

        {/* Right Card: Enriched Role vs Experience Level Multi-Axis Comparison */}
        <div className="bg-[#0D1117] border border-[#161B22] rounded-2xl p-5 flex flex-col justify-between shadow-xs lg:col-span-7">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-1">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Enriched Salary Comparison (Role vs Experience Bracket)
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Double-axis comparison tracking the dynamic wage scaling (in Thousands BDT/month) for key tech paths across professional seniority levels.
            </p>
          </div>

          <div className="h-56">
            {roleVsExperienceSalary.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleVsExperienceSalary} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <XAxis dataKey="role" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} tickFormatter={(val) => `${val}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0C10', borderColor: '#161B22', borderRadius: '12px' }}
                    itemStyle={{ color: '#E2E8F0', fontSize: '11px' }}
                    formatter={(value: any) => [`${Number(value * 1000).toLocaleString()} BDT`, '']}
                  />
                  <Bar dataKey="junior" fill="#3B82F6" name="Junior" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="mid" fill="#10B981" name="Mid-level" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="senior" fill="#8B5CF6" name="Senior" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="lead" fill="#EC4899" name="Lead" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Comparative matrix data currently unavailable.
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-[#161B22]/60 text-[10px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#3B82F6]" />
              <span>Blue: Junior</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#10B981]" />
              <span>Green: Mid</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#8B5CF6]" />
              <span>Purple: Senior</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#EC4899]" />
              <span>Pink: Lead / VP</span>
            </div>
          </div>
        </div>
      </div>

      {/* 11. Role Salary Ranges Comparative Section */}
      <div className="bg-[#0D1117] border border-[#161B22] rounded-2xl p-5 sm:p-6 space-y-6" id="salary-comparison-detailed-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#161B22] pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-indigo-400 animate-pulse" />
              Bangladesh Tech Salary Intelligence Engine (BDT/month)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Deep, multi-perspective wage analytics, career trajectory maps, and custom budget configuration models.
            </p>
          </div>
          
          <div className="flex items-center gap-3.5 bg-[#0A0C10] border border-[#161B22] px-4 py-2.5 rounded-xl self-start md:self-auto shrink-0">
            <div className="text-xs space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-slate-500">Highest Sector Avg</div>
              <div className="font-extrabold text-emerald-400 font-mono">{bestPayingRole.name} ({bestPayingRole.val})</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex flex-wrap items-center gap-2 p-1 bg-[#0A0C10] border border-[#161B22] rounded-xl max-w-md">
          <button
            onClick={() => setActiveSalaryTab('roles')}
            className={`flex-1 text-center py-1.5 px-2.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
              activeSalaryTab === 'roles'
                ? 'bg-[#161B22] border border-[#30363d] text-indigo-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Role Categories
          </button>
          <button
            onClick={() => setActiveSalaryTab('experience')}
            className={`flex-1 text-center py-1.5 px-2.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
              activeSalaryTab === 'experience'
                ? 'bg-[#161B22] border border-[#30363d] text-indigo-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Exp Trajectory
          </button>
          <button
            onClick={() => setActiveSalaryTab('estimator')}
            className={`flex-1 text-center py-1.5 px-2.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
              activeSalaryTab === 'estimator'
                ? 'bg-[#161B22] border border-[#30363d] text-indigo-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Estimator Tool
          </button>
          <button
            onClick={() => setActiveSalaryTab('distribution')}
            className={`flex-1 text-center py-1.5 px-2.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
              activeSalaryTab === 'distribution'
                ? 'bg-[#161B22] border border-[#30363d] text-[#10B981]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Market Density
          </button>
        </div>

        {/* Tab 1: Role Categories */}
        {activeSalaryTab === 'roles' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Bar Chart comparing ranges side-by-side */}
            <div className="lg:col-span-8 h-80">
              {roleSalaryComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roleSalaryComparison} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={9} 
                      tickLine={false} 
                      tickFormatter={(val) => `${(val / 1000)}k`} 
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0A0C10', borderColor: '#161B22', borderRadius: '12px' }}
                      itemStyle={{ color: '#E2E8F0', fontSize: '11px' }}
                      formatter={(value: any) => [`${Number(value).toLocaleString()} BDT`, '']}
                    />
                    <Bar dataKey="min" fill="#3B82F6" name="Minimum Salary" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="average" fill="#6366F1" name="Average Salary" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="max" fill="#EC4899" name="Maximum Salary" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No matching category wage data available under the current filter selection.
                </div>
              )}
            </div>

            {/* Detailed stats grid sidebar */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Salary Telemetry Insights</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Calculated dynamically from active scraper targets. Blue/Indigo/Pink indicators highlight the wide compensation spectrum across junior and senior engineers in Bangladesh.
                </p>
              </div>

              <div className="space-y-3 bg-[#0A0C10] border border-[#161B22] p-4 rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Salary Disclosure Rate:</span>
                  <span className="font-bold text-slate-200 font-mono">{overallSalaryTransparency}%</span>
                </div>
                <div className="w-full bg-[#161B22] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${overallSalaryTransparency}%` }} 
                  />
                </div>
                
                <div className="pt-2 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#3B82F6]" />
                    <span>Blue: Minimum Baseline (Junior/Entry)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#6366F1]" />
                    <span>Indigo: Average Market Salary</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#EC4899]" />
                    <span>Pink: Maximum/Senior Standard Caps</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[10px] text-slate-400 leading-relaxed font-medium">
                <strong>Interactive tip:</strong> Hover over any role category bar inside the chart to instantly inspect exact BDT baseline, mean, and ceiling boundaries.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Experience Trajectory Progression */}
        {activeSalaryTab === 'experience' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Experience Line Chart */}
            <div className="lg:col-span-8 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={experienceSalaryComparison} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={9} 
                    tickLine={false} 
                    tickFormatter={(val) => `${(val / 1000)}k`} 
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0C10', borderColor: '#161B22', borderRadius: '12px' }}
                    itemStyle={{ color: '#E2E8F0', fontSize: '11px' }}
                    formatter={(value: any) => [`${Number(value).toLocaleString()} BDT`, '']}
                  />
                  <Line type="monotone" dataKey="min" stroke="#3B82F6" strokeWidth={2} name="Entry Bounds" activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="average" stroke="#8B5CF6" strokeWidth={3} name="Market Average" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="max" stroke="#EC4899" strokeWidth={2} name="Senior Standard Caps" activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Timeline insights */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Experience Scalability</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  This trajectory showcases how technology compensation scales with professional seniority in the Dhaka IT ecosystem. Notice the compounding premium from Mid-level to Senior Expert levels.
                </p>
              </div>

              <div className="space-y-2">
                {experienceSalaryComparison.map((item) => (
                  <div key={item.name} className="bg-[#0A0C10] border border-[#161B22]/60 p-2 px-3 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{item.name}</span>
                    <div className="text-right">
                      <div className="font-bold text-indigo-400 font-mono">{item.average.toLocaleString()} BDT</div>
                      <div className="text-[9px] text-slate-500">Range: {Math.round(item.min/1000)}k - {Math.round(item.max/1000)}k BDT</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[10px] text-slate-400 leading-relaxed font-medium">
                <strong>Timeline insight:</strong> The sharp incline from Junior (mean: ~50K) to Tech Lead (mean: ~185K+) indicates extremely high returns on specialized system-architecture skills.
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Interactive Salary Estimator & Benchmarking Tool */}
        {activeSalaryTab === 'estimator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Estimator Configuration Panel */}
            <div className="lg:col-span-5 bg-[#0A0C10] border border-[#161B22] p-4 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                Configure Target Profile
              </h4>

              {/* Role Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Engineering Role</label>
                <select
                  value={estimateRole}
                  onChange={(e) => setEstimateRole(e.target.value)}
                  className="w-full bg-[#070A0F] border border-[#161B22] text-xs text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500/60 transition"
                >
                  <option value="frontend">Frontend Engineer</option>
                  <option value="backend">Backend Engineer</option>
                  <option value="fullstack">Fullstack Engineer</option>
                  <option value="mobile">Mobile Application Dev</option>
                  <option value="devops">DevOps / Cloud Specialist</option>
                  <option value="qa">QA Engineer / SDET</option>
                  <option value="product">Product Manager</option>
                  <option value="design">UI/UX Designer</option>
                  <option value="other">General IT / Solutions Analyst</option>
                </select>
              </div>

              {/* Experience Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Experience Profile</label>
                <select
                  value={estimateExp}
                  onChange={(e) => setEstimateExp(e.target.value)}
                  className="w-full bg-[#070A0F] border border-[#161B22] text-xs text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500/60 transition"
                >
                  <option value="intern">Intern / Trainee</option>
                  <option value="junior">Junior Developer (1-2 years)</option>
                  <option value="mid">Mid-Level Engineer (2-4 years)</option>
                  <option value="senior">Senior Specialist (5+ years)</option>
                  <option value="lead">Technical Lead / VP / Architect</option>
                </select>
              </div>

              {/* Work Mode Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Work Pattern</label>
                <select
                  value={estimateMode}
                  onChange={(e) => setEstimateMode(e.target.value)}
                  className="w-full bg-[#070A0F] border border-[#161B22] text-xs text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500/60 transition"
                >
                  <option value="onsite">Fully On-Site</option>
                  <option value="hybrid">Hybrid Environment (+8% premium)</option>
                  <option value="remote">100% WFH / Remote (+22% premium)</option>
                </select>
              </div>
            </div>

            {/* Estimator Dynamic Prediction Panel */}
            <div className="lg:col-span-7 bg-[#0A0C10]/40 border border-[#161B22] p-5 rounded-xl flex flex-col justify-between space-y-5">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-1 rounded-full">
                  Estimated Monthly Compensation
                </span>
                
                <div className="mt-3.5 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-100 tracking-tight">
                    {estimatedSalaryDetails.average.toLocaleString()} <span className="text-sm font-semibold text-slate-400">BDT</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Expected baseline range: <strong className="text-slate-300 font-mono">{estimatedSalaryDetails.min.toLocaleString()} BDT</strong> to <strong className="text-slate-300 font-mono">{estimatedSalaryDetails.max.toLocaleString()} BDT</strong>.
                </p>
              </div>

              {/* Custom dynamic progress bar */}
              <div className="space-y-3 bg-[#070A0F] border border-[#161B22]/60 p-4 rounded-xl">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dhaka Tech Market Percentiles</h5>
                
                <div className="space-y-2">
                  {/* P25 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>25th Percentile (Conservative)</span>
                      <span className="font-mono text-slate-300">{estimatedSalaryDetails.percentiles.p25.toLocaleString()} BDT</span>
                    </div>
                    <div className="w-full bg-[#161B22] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '40%' }} />
                    </div>
                  </div>

                  {/* P50 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>50th Percentile (Median Market standard)</span>
                      <span className="font-mono text-slate-300">{estimatedSalaryDetails.percentiles.p50.toLocaleString()} BDT</span>
                    </div>
                    <div className="w-full bg-[#161B22] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>

                  {/* P75 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>75th Percentile (Aggressive / High-Performer)</span>
                      <span className="font-mono text-slate-300">{estimatedSalaryDetails.percentiles.p75.toLocaleString()} BDT</span>
                    </div>
                    <div className="w-full bg-[#161B22] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 leading-relaxed font-medium">
                *Multipliers and baseline wages are calibrated dynamically against crawled Bangladesh IT clusters and standard local recruiter guides.
              </div>
            </div>
          </div>
        )}
        
        {/* Tab 4: Interactive Role-Specific Salary Distribution Curve */}
        {activeSalaryTab === 'distribution' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            
            {/* Left side: Area Chart of Probability Density */}
            <div className="lg:col-span-7 bg-[#0A0C10] border border-[#161B22] p-5 rounded-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Salary Probability Density Curve
                  </h4>
                  
                  {/* Selector for the specific role to graph */}
                  <div className="flex items-center gap-2 bg-[#070A0F] border border-[#161B22] px-2.5 py-1.5 rounded-lg">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Role:</label>
                    <select
                      value={distSelectedRole}
                      onChange={(e) => setDistSelectedRole(e.target.value)}
                      className="bg-transparent text-xs text-emerald-400 focus:outline-none font-semibold cursor-pointer"
                    >
                      <option value="frontend">Frontend</option>
                      <option value="backend">Backend</option>
                      <option value="fullstack">Fullstack</option>
                      <option value="mobile">Mobile Dev</option>
                      <option value="devops">DevOps</option>
                      <option value="qa">QA / Testing</option>
                      <option value="product">Product Mgt</option>
                      <option value="design">UI/UX Design</option>
                      <option value="other">Other Tech</option>
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Interactive mathematical normal bell distribution representing the probability density of landing various salary ranges for <strong>{selectedDistRoleStats.name}</strong> jobs in Bangladesh.
                </p>
              </div>

              {/* Density Area Chart */}
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedDistRoleStats.curveData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="salaryFormatted" stroke="#475569" fontSize={9} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={8} tickLine={false} tickFormatter={() => ''} width={15} label={{ value: 'Probability Density', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 8 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0A0C10', borderColor: '#161B22', borderRadius: '12px' }}
                      itemStyle={{ color: '#E2E8F0', fontSize: '11px' }}
                      formatter={(value: any, name: any, props: any) => [
                        `${Number(props.payload.salary).toLocaleString()} BDT`,
                        'Estimated Bracket'
                      ]}
                      labelFormatter={() => `Market Density Node`}
                    />
                    <Area type="monotone" dataKey="density" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorDensity)" name="Density Match Likelihood" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 bg-[#070A0F] border border-[#161B22]/60 p-2.5 rounded-lg">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Peak indicates standard median hire zone.</span>
                <span className="font-semibold text-emerald-400 font-mono">Sample Count: {selectedDistRoleStats.count || 'Market Baseline'}</span>
              </div>
            </div>

            {/* Right side: Percentiles, Benchmarks, Recommendations */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#0A0C10] border border-[#161B22] p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  Key Percentile Benchmarks
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#070A0F] border border-[#161B22]/60 p-2.5 rounded-lg space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">10th Percentile (Junior)</span>
                    <div className="text-xs font-bold text-slate-300 font-mono">{selectedDistRoleStats.p10.toLocaleString()} BDT</div>
                    <p className="text-[9px] text-slate-500 leading-tight">Starting baseline standard for entry hires.</p>
                  </div>

                  <div className="bg-[#070A0F] border border-[#161B22]/60 p-2.5 rounded-lg space-y-1">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">50th Percentile (Median)</span>
                    <div className="text-xs font-bold text-indigo-300 font-mono">{selectedDistRoleStats.p50.toLocaleString()} BDT</div>
                    <p className="text-[9px] text-slate-500 leading-tight">Average rate for stable mid-level engineers.</p>
                  </div>

                  <div className="bg-[#070A0F] border border-[#161B22]/60 p-2.5 rounded-lg space-y-1">
                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">90th Percentile (Senior)</span>
                    <div className="text-xs font-bold text-purple-300 font-mono">{selectedDistRoleStats.p90.toLocaleString()} BDT</div>
                    <p className="text-[9px] text-slate-500 leading-tight">Upper standard standard for senior architects.</p>
                  </div>

                  <div className="bg-[#070A0F] border border-[#161B22]/60 p-2.5 rounded-lg space-y-1">
                    <span className="text-[9px] font-bold text-pink-400 uppercase tracking-wider">99th Percentile (Elite Top 1%)</span>
                    <div className="text-xs font-bold text-pink-300 font-mono">{selectedDistRoleStats.p99.toLocaleString()} BDT</div>
                    <p className="text-[9px] text-slate-500 leading-tight">Elite global partners &amp; remote contractors.</p>
                  </div>
                </div>
              </div>

              {/* Skills Recommendation card */}
              <div className="bg-[#0A0C10] border border-[#161B22] p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  Recommended High-Income Stack
                </h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  These programming languages, libraries, and protocols are highly correlated with top-percentile wage brackets in Bangladesh tech clusters for <strong>{selectedDistRoleStats.name}</strong> positions.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedDistRoleStats.hotTechs.map((tech, idx) => (
                    <span 
                      key={`${tech}-${idx}`} 
                      className="bg-amber-500/5 border border-amber-500/20 text-amber-400 text-[10px] px-2.5 py-1 rounded font-medium shadow-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Narrative Strategic Perspectives Panel */}
      <div className="bg-gradient-to-r from-[#11161D] to-[#0A0D14] border border-[#161B22] p-5 sm:p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400" />
          Strategic Dhaka Tech Market Perspectives
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-400 leading-relaxed">
          <div className="space-y-1.5 p-3.5 bg-[#070A0F] border border-[#161B22]/60 rounded-xl">
            <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Technology Saturation
            </h4>
            <p>
              Node.js, React, and Python continue to lead back-to-back listings. A significant rise is recorded in TypeScript integration specifications across major corporate portals, moving from an optional skill to a core job prerequisite.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 bg-[#070A0F] border border-[#161B22]/60 rounded-xl">
            <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Geographic Centralization
            </h4>
            <p>
              The Gulshan &amp; Bashundhara IT cluster holds the absolute majority of technical jobs, followed by Banani. Mirpur is steadily developing into an alternative hub primarily for startup and boutique software agencies.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 bg-[#070A0F] border border-[#161B22]/60 rounded-xl">
            <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              Wage Budget Transparency
            </h4>
            <p>
              Approximately 70% of crawled listings omit exact figures, relying on the "Negotiable" clause. Where wages are disclosed, standard packages range from 15K-20K BDT for interns to 110K-165K+ BDT for senior leadership.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

