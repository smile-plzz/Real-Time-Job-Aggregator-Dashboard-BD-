/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Building2, Briefcase, RefreshCw, BarChart2, CheckCircle2, TrendingUp } from 'lucide-react';
import { ScrapeStats } from '../types';

interface StatsSectionProps {
  stats: ScrapeStats;
  isResetting: boolean;
  onReset: () => void;
}

export default function StatsSection({ stats, isResetting, onReset }: StatsSectionProps) {
  // Map categories to user-friendly display labels
  const categoryLabels: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    fullstack: 'Fullstack',
    mobile: 'Mobile',
    devops: 'DevOps & Infra',
    qa: 'QA & Testing',
    product: 'Product Management',
    design: 'UI/UX Design',
    other: 'Other'
  };

  // Map category keys to background accent colors
  const categoryColors: Record<string, string> = {
    frontend: 'bg-blue-500',
    backend: 'bg-emerald-500',
    fullstack: 'bg-violet-500',
    mobile: 'bg-amber-500',
    devops: 'bg-rose-500',
    qa: 'bg-indigo-500',
    product: 'bg-cyan-500',
    design: 'bg-fuchsia-500',
    other: 'bg-slate-500'
  };

  const experienceLabels: Record<string, string> = {
    intern: 'Intern / Trainee',
    junior: 'Junior (1-2 yrs)',
    mid: 'Mid-Level (2-5 yrs)',
    senior: 'Senior (5+ yrs)',
    lead: 'Lead / Principal',
    unspecified: 'Unspecified'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  };

  // Find most listed category
  let topCategory = 'None';
  let maxCategoryCount = 0;
  Object.entries(stats.categoryBreakdown).forEach(([cat, count]) => {
    if (count > maxCategoryCount) {
      maxCategoryCount = count;
      topCategory = categoryLabels[cat] || cat;
    }
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      id="stats-dashboard"
    >
      {/* Metric Card 1: Total Companies */}
      <motion.div 
        variants={itemVariants}
        className="bg-[#0D1117] p-5 rounded-2xl border border-[#161B22] shadow-xs flex items-center justify-between hover:border-indigo-500/25 transition-colors"
        id="stat-card-companies"
      >
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Total Companies</span>
          <h3 className="text-3xl font-semibold tracking-tight text-slate-100 mt-1">{stats.totalCompanies}</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            From Merged Tech Directories
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
          <Building2 className="w-6 h-6" />
        </div>
      </motion.div>

      {/* Metric Card 2: Total Active Jobs */}
      <motion.div 
        variants={itemVariants}
        className="bg-[#0D1117] p-5 rounded-2xl border border-[#161B22] shadow-xs flex items-center justify-between hover:border-indigo-500/25 transition-colors"
        id="stat-card-jobs"
      >
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Aggregated Jobs</span>
          <h3 className="text-3xl font-semibold tracking-tight text-slate-100 mt-1">{stats.totalJobs}</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Scraped & Synced Live
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
          <Briefcase className="w-6 h-6" />
        </div>
      </motion.div>

      {/* Metric Card 3: Scraped Portals */}
      <motion.div 
        variants={itemVariants}
        className="bg-[#0D1117] p-5 rounded-2xl border border-[#161B22] shadow-xs flex items-center justify-between hover:border-indigo-500/25 transition-colors"
        id="stat-card-scanned"
      >
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Portals Scanned</span>
          <h3 className="text-3xl font-semibold tracking-tight text-slate-100 mt-1">
            {stats.scrapedCompanies} <span className="text-lg text-slate-500 font-normal">/ {stats.totalCompanies}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
            Active Sources: {stats.activeCompaniesCount}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/10">
          <RefreshCw className="w-6 h-6" />
        </div>
      </motion.div>

      {/* Metric Card 4: Top Demand Category */}
      <motion.div 
        variants={itemVariants}
        className="bg-[#0D1117] p-5 rounded-2xl border border-[#161B22] shadow-xs flex items-center justify-between hover:border-indigo-500/25 transition-colors"
        id="stat-card-demand"
      >
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Highest Demand</span>
          <h3 className="text-xl font-semibold tracking-tight text-slate-100 mt-2 truncate max-w-[170px]" title={topCategory}>
            {topCategory}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {maxCategoryCount > 0 ? `${maxCategoryCount} positions active` : 'No jobs loaded'}
            </p>
            <button 
              onClick={onReset}
              disabled={isResetting}
              className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 ml-2 font-medium"
              title="Reset aggregated jobs to seed data"
            >
              Reset Cache
            </button>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/10">
          <BarChart2 className="w-6 h-6" />
        </div>
      </motion.div>

      {/* Custom Handcrafted Distribution Visualizers */}
      <motion.div 
        variants={itemVariants}
        className="md:col-span-2 bg-[#0D1117] p-5 rounded-2xl border border-[#161B22] shadow-xs"
        id="category-distribution"
      >
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          Job Breakdown by Category
        </h4>
        <div className="space-y-3">
          {Object.keys(categoryLabels).map(key => {
            const count = stats.categoryBreakdown[key] || 0;
            const percentage = stats.totalJobs > 0 ? Math.round((count / stats.totalJobs) * 100) : 0;
            
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{categoryLabels[key]}</span>
                  <span className="text-slate-500 font-mono">{count} ({percentage}%)</span>
                </div>
                <div className="h-2 bg-[#161B22] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full ${categoryColors[key]} rounded-full`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="md:col-span-2 bg-[#0D1117] p-5 rounded-2xl border border-[#161B22] shadow-xs"
        id="experience-distribution"
      >
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Job Breakdown by Experience Level
        </h4>
        <div className="space-y-3">
          {Object.keys(experienceLabels).map(key => {
            const count = stats.experienceBreakdown[key] || 0;
            const percentage = stats.totalJobs > 0 ? Math.round((count / stats.totalJobs) * 100) : 0;
            
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{experienceLabels[key]}</span>
                  <span className="text-slate-500 font-mono">{count} ({percentage}%)</span>
                </div>
                <div className="h-2 bg-[#161B22] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
