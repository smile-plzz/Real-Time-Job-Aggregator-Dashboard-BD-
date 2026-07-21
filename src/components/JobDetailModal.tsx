/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Job, Company, validateJob, ValidationIssue } from '../types';
import { 
  X, Building2, MapPin, Briefcase, Calendar, DollarSign, ExternalLink, 
  Sparkles, AlertCircle, FileText, AlertTriangle, Users, Globe, Mail, 
  CheckCircle2, ShieldAlert 
} from 'lucide-react';

interface JobDetailModalProps {
  job: Job | null;
  company?: Company;
  onClose: () => void;
}

export default function JobDetailModal({ job, company, onClose }: JobDetailModalProps) {
  if (!job) return null;

  const categoryLabels: Record<string, string> = {
    frontend: 'Frontend Engineering',
    backend: 'Backend Engineering',
    fullstack: 'Fullstack Engineering',
    mobile: 'Mobile App Development',
    devops: 'DevOps & Cloud Infrastructure',
    qa: 'Quality Assurance & Testing',
    product: 'Product Management',
    design: 'UI/UX Design',
    other: 'General Technology'
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const validationIssues = validateJob(job);
  const totalDeductions = validationIssues.reduce((acc, issue) => {
    if (issue.type === 'error') return acc + 30;
    if (issue.type === 'warning') return acc + 15;
    return acc + 5;
  }, 0);
  const qualityScore = Math.max(10, 100 - totalDeductions);
  
  let scoreColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  let scoreLabel = 'High Fidelity';
  if (qualityScore < 50) {
    scoreColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    scoreLabel = 'Low Fidelity';
  } else if (qualityScore < 85) {
    scoreColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    scoreLabel = 'Medium Fidelity';
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="job-detail-modal">
      {/* Overlay Backdrop */}
      <div className="fixed inset-0 bg-[#0A0C10]/80 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative transform overflow-hidden rounded-2xl bg-[#0D1117] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-[#161B22]"
        >
          {/* Header Image Accent */}
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

          {/* Close Trigger Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161B22] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8">
            {/* Header / Company Details */}
            <div className="flex items-start gap-4 mb-6 pr-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/25">
                <Building2 className="w-6 h-6" />
              </div>
              
              <div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{job.companyName}</span>
                <h3 className="text-xl font-bold text-slate-100 tracking-tight mt-0.5 leading-snug">
                  {job.title}
                </h3>
                <div className="text-xs text-slate-400 mt-1 font-semibold">
                  {categoryLabels[job.category]} &bull; {job.department}
                </div>
              </div>
            </div>

            {/* Listing Integrity Audit Section */}
            <div className="mb-6 bg-[#0A0C10] border border-[#161B22] rounded-xl p-5">
              <div className="flex items-center justify-between border-b border-[#161B22] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Listing Quality Audit</h4>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-medium font-mono">Quality Score:</span>
                  <div className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border font-mono ${scoreColor}`}>
                    {qualityScore}% &bull; {scoreLabel}
                  </div>
                </div>
              </div>

              {validationIssues.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Our live validator flagged the following structural/content issues with this aggregated listing:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {validationIssues.map((issue, idx) => {
                      const iconMap = {
                        error: <X className="w-3.5 h-3.5 text-rose-400" />,
                        warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
                        info: <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
                      };
                      const bgMap = {
                        error: 'bg-rose-500/5 border-rose-500/10 text-rose-300',
                        warning: 'bg-amber-500/5 border-amber-500/10 text-amber-300',
                        info: 'bg-blue-500/5 border-blue-500/10 text-blue-300'
                      };
                      return (
                        <div key={idx} className={`p-2.5 rounded-lg border text-xs flex gap-2.5 items-start ${bgMap[issue.type]}`}>
                          <div className="mt-0.5 shrink-0">{iconMap[issue.type]}</div>
                          <div>
                            <span className="font-bold tracking-wide block">{issue.message}</span>
                            <span className="text-[11px] text-slate-400 mt-0.5 block leading-normal">{issue.description}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold block">100% Validation Passed</span>
                    <span className="text-slate-400 text-[11px] mt-0.5 block">This listing conforms fully to high-fidelity schema standards. All critical descriptors, skills, and deep career paths were successfully parsed.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Company Info Box (if available) */}
            {company && (
              <div className="mb-6 p-4 rounded-xl border border-[#161B22] bg-[#0A0C10]/50">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  Company Snapshot
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {company.website && (
                    <div className="flex items-center gap-2 text-slate-300 hover:text-indigo-400 transition-colors">
                      <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="truncate">
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  {company.size && company.size !== 'Please update' && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{company.size} Employees</span>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-2 text-slate-300 hover:text-indigo-400 transition-colors">
                      <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                      <a href={`mailto:${company.email}`} className="truncate">{company.email}</a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 bg-[#0A0C10] p-4 rounded-xl border border-[#161B22] mb-6">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-slate-500" />
                <div className="text-xs">
                  <span className="block text-slate-500 font-medium">Location</span>
                  <span className="font-semibold text-slate-200">{job.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Briefcase className="w-4 h-4 text-slate-500" />
                <div className="text-xs">
                  <span className="block text-slate-500 font-medium">Job Type</span>
                  <span className="font-semibold text-slate-200">{job.type}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <div className="text-xs">
                  <span className="block text-slate-500 font-medium">Compensation Range</span>
                  <span className="font-semibold text-slate-200">{job.salary || 'Negotiable'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-slate-500" />
                <div className="text-xs">
                  <span className="block text-slate-500 font-medium">Scraped & Synced On</span>
                  <span className="font-semibold text-slate-200">{formatDate(job.dateAdded)}</span>
                </div>
              </div>
            </div>

            {/* Extracted Role Description */}
            <div className="mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-indigo-500/20" />
                Role Summary
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                {job.summary || "No description loaded for this listing."}
              </p>
            </div>

            {/* Core Stack / Skills Tags */}
            <div className="mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Required Skills & Technologies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {job.skills && job.skills.length > 0 ? (
                  job.skills.map((skill, idx) => (
                    <span
                      key={`${skill}-${idx}`}
                      className="text-xs font-mono font-semibold bg-[#161B22] border border-[#30363d] text-slate-300 px-3 py-1 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No skills listed</span>
                )}
              </div>
            </div>

            {/* Scraper Note Info Alert */}
            {job.id.startsWith('scraped') && (
              <div className="flex flex-col gap-2.5 bg-[#0A0C10] p-4 rounded-xl border border-[#161B22] text-slate-400 text-xs mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-slate-400">
                    This job listing was automatically extracted and structured from the company's real-time career page using our refined, high-fidelity server-side career portal crawler.
                  </p>
                </div>
                
                {/* Extraction Method Details */}
                <div className="mt-1 pt-2 border-t border-[#161B22] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-mono">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Scraper Extraction Pipeline:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase w-fit ${
                    job.source === 'json-ld' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : job.source === 'hydration' 
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {job.source === 'json-ld' 
                      ? 'Schema.org JSON-LD (Precision Tier 1)' 
                      : job.source === 'hydration' 
                      ? 'Hydration State Parsing (Precision Tier 2)' 
                      : 'Heuristic Selector Engine (Precision Tier 3)'}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#161B22]">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#161B22] hover:bg-[#1f2631] border border-[#30363d] rounded-xl text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Close View
              </button>
              
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                Apply via Company Portal
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
