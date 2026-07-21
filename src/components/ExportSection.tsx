/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Download, Filter, FileJson, FileSpreadsheet, Layers, Building, X } from 'lucide-react';
import { Company, Job } from '../types';

interface ExportSectionProps {
  companies: Company[];
  jobs: Job[];
}

export default function ExportSection({ companies, jobs }: ExportSectionProps) {
  const [exportType, setExportType] = useState<'jobs' | 'companies'>('jobs');

  // Filters for jobs
  const [jobExperience, setJobExperience] = useState('all');
  const [jobCategory, setJobCategory] = useState('all');
  const [jobType, setJobType] = useState('all');

  // Filters for companies
  const [companyStatus, setCompanyStatus] = useState('all');

  // Handle Export Logic
  const handleExport = (format: 'csv' | 'json') => {
    let exportData: any[] = [];
    let filename = '';

    if (exportType === 'jobs') {
      let filtered = [...jobs];
      if (jobExperience !== 'all') {
        filtered = filtered.filter(j => j.experienceLevel === jobExperience);
      }
      if (jobCategory !== 'all') {
        filtered = filtered.filter(j => j.category === jobCategory);
      }
      if (jobType !== 'all') {
        filtered = filtered.filter(j => j.type.toLowerCase().includes(jobType));
      }
      exportData = filtered.map(job => ({
        ID: job.id,
        Title: job.title,
        Company: job.companyName,
        Location: job.location,
        Type: job.type,
        Department: job.department,
        Experience: job.experienceLevel,
        Category: job.category,
        Salary: job.salary || 'N/A',
        DateAdded: new Date(job.dateAdded).toLocaleDateString(),
        Link: job.link,
        Skills: job.skills.join(', '),
      }));
      filename = `techhub_jobs_export_${new Date().toISOString().split('T')[0]}`;
    } else {
      let filtered = [...companies];
      if (companyStatus !== 'all') {
        if (companyStatus === 'not_scanned') filtered = filtered.filter(c => !c.scrapeStatus || c.scrapeStatus === 'idle');
        if (companyStatus === 'completed') filtered = filtered.filter(c => c.scrapeStatus === 'completed');
        if (companyStatus === 'failed') filtered = filtered.filter(c => c.scrapeStatus === 'failed');
        if (companyStatus === 'with_jobs') filtered = filtered.filter(c => c.jobCount && c.jobCount > 0);
      }
      exportData = filtered.map(comp => ({
        Name: comp.name,
        Location: comp.location,
        Website: comp.website,
        CareerPage: comp.career,
        Email: comp.email,
        LinkedIn: comp.linkedin,
        TeamSize: comp.size,
        TechStack: comp.technologies ? comp.technologies.join(', ') : '',
        ScrapeStatus: comp.scrapeStatus || 'idle',
        JobCount: comp.jobCount || 0,
      }));
      filename = `techhub_companies_export_${new Date().toISOString().split('T')[0]}`;
    }

    if (exportData.length === 0) {
      alert("No data matches your filters.");
      return;
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV
      const headers = Object.keys(exportData[0]);
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      for (const row of exportData) {
        const values = headers.map(header => {
          const val = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const escaped = ('' + val).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }
      
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getFilteredJobsCount = () => {
      let filtered = [...jobs];
      if (jobExperience !== 'all') {
        filtered = filtered.filter(j => j.experienceLevel === jobExperience);
      }
      if (jobCategory !== 'all') {
        filtered = filtered.filter(j => j.category === jobCategory);
      }
      if (jobType !== 'all') {
        filtered = filtered.filter(j => j.type.toLowerCase().includes(jobType));
      }
      return filtered.length;
  };
  
  const getFilteredCompaniesCount = () => {
      let filtered = [...companies];
      if (companyStatus !== 'all') {
        if (companyStatus === 'not_scanned') filtered = filtered.filter(c => !c.scrapeStatus || c.scrapeStatus === 'idle');
        if (companyStatus === 'completed') filtered = filtered.filter(c => c.scrapeStatus === 'completed');
        if (companyStatus === 'failed') filtered = filtered.filter(c => c.scrapeStatus === 'failed');
        if (companyStatus === 'with_jobs') filtered = filtered.filter(c => c.jobCount && c.jobCount > 0);
      }
      return filtered.length;
  }

  return (
    <div className="space-y-6" id="export-dashboard-section">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Download className="w-5 h-5 text-indigo-400" />
          Data Export &amp; Distribution
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate refined datasets in CSV or JSON formats for external reporting or ATS integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Col: Export Configuration */}
        <div className="md:col-span-8 bg-[#0D1117] border border-[#161B22] p-5 sm:p-6 rounded-2xl shadow-sm space-y-6">
            
          <div className="flex flex-col sm:flex-row gap-4 mb-2">
             <button
               onClick={() => setExportType('jobs')}
               className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                 exportType === 'jobs' 
                   ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                   : 'bg-[#0A0C10] border-[#161B22] text-slate-400 hover:border-slate-700'
               }`}
             >
                <Layers className={`w-6 h-6 ${exportType === 'jobs' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="font-semibold text-sm">Export Jobs Database</span>
             </button>
             <button
               onClick={() => setExportType('companies')}
               className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                 exportType === 'companies' 
                   ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                   : 'bg-[#0A0C10] border-[#161B22] text-slate-400 hover:border-slate-700'
               }`}
             >
                <Building className={`w-6 h-6 ${exportType === 'companies' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="font-semibold text-sm">Export Company Directory</span>
             </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-[#161B22] pb-2">
                <Filter className="w-4 h-4 text-slate-500" />
                Refine Dataset
            </h3>
            
            {exportType === 'jobs' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Experience</label>
                        <select
                            value={jobExperience}
                            onChange={(e) => setJobExperience(e.target.value)}
                            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/40 cursor-pointer transition-all"
                        >
                            <option value="all">All Levels</option>
                            <option value="intern">Intern / Trainee</option>
                            <option value="junior">Junior</option>
                            <option value="mid">Mid-Level</option>
                            <option value="senior">Senior</option>
                            <option value="lead">Lead / Principal</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Department</label>
                        <select
                            value={jobCategory}
                            onChange={(e) => setJobCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/40 cursor-pointer transition-all"
                        >
                            <option value="all">All Departments</option>
                            <option value="frontend">Frontend</option>
                            <option value="backend">Backend</option>
                            <option value="fullstack">Fullstack</option>
                            <option value="mobile">Mobile</option>
                            <option value="devops">DevOps / Cloud</option>
                            <option value="qa">QA / Testing</option>
                            <option value="product">Product / Project</option>
                            <option value="design">Design (UI/UX)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Work Type</label>
                        <select
                            value={jobType}
                            onChange={(e) => setJobType(e.target.value)}
                            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/40 cursor-pointer transition-all"
                        >
                            <option value="all">Any Work Type</option>
                            <option value="remote">Remote Only</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="full-time">Full-time</option>
                        </select>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Scrape Status</label>
                        <select
                            value={companyStatus}
                            onChange={(e) => setCompanyStatus(e.target.value)}
                            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/40 cursor-pointer transition-all"
                        >
                            <option value="all">All Statuses</option>
                            <option value="with_jobs">Has Active Jobs</option>
                            <option value="completed">Scanned Successfully</option>
                            <option value="not_scanned">Not Scanned Yet</option>
                            <option value="failed">Scan Failed</option>
                        </select>
                    </div>
                </div>
            )}
          </div>
          
          {(exportType === 'jobs' && (jobExperience !== 'all' || jobCategory !== 'all' || jobType !== 'all')) || 
           (exportType === 'companies' && companyStatus !== 'all') ? (
            <div className="flex justify-end">
                <button 
                  onClick={() => {
                      setJobExperience('all');
                      setJobCategory('all');
                      setJobType('all');
                      setCompanyStatus('all');
                  }}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition cursor-pointer"
                >
                    <X className="w-3.5 h-3.5" />
                    Clear Filters
                </button>
            </div>
           ) : null}

        </div>

        {/* Right Col: Export Summary & Actions */}
        <div className="md:col-span-4 space-y-4">
           <div className="bg-indigo-500/5 border border-indigo-500/15 p-5 rounded-2xl flex flex-col justify-center shadow-sm h-full">
               <div className="mb-6">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-2 block">
                    Dataset Snapshot
                 </span>
                 <div className="text-3xl font-bold text-slate-100 tracking-tight">
                    {exportType === 'jobs' ? getFilteredJobsCount() : getFilteredCompaniesCount()}
                 </div>
                 <p className="text-xs text-slate-400 mt-1">
                    Records matched and ready for export
                 </p>
               </div>
               
               <div className="space-y-3 mt-auto">
                   <button
                     onClick={() => handleExport('csv')}
                     disabled={(exportType === 'jobs' ? getFilteredJobsCount() : getFilteredCompaniesCount()) === 0}
                     className="w-full px-4 py-3 bg-[#161B22] hover:bg-[#1f2631] text-slate-200 border border-[#30363d] hover:border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                   >
                     <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                     Download CSV File
                   </button>
                   <button
                     onClick={() => handleExport('json')}
                     disabled={(exportType === 'jobs' ? getFilteredJobsCount() : getFilteredCompaniesCount()) === 0}
                     className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                   >
                     <FileJson className="w-4 h-4 text-amber-400" />
                     Download JSON Payload
                   </button>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}
