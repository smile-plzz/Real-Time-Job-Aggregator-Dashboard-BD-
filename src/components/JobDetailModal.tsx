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
  
  let scoreColor = 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
  let scoreLabel = 'High Fidelity';
  if (qualityScore < 50) {
    scoreColor = 'text-rose-600 bg-rose-500/10 border-rose-500/20';
    scoreLabel = 'Low Fidelity';
  } else if (qualityScore < 85) {
    scoreColor = 'text-amber-600 bg-amber-500/10 border-amber-500/20';
    scoreLabel = 'Medium Fidelity';
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="job-detail-modal">
      {/* Overlay Backdrop */}
      <div className="fixed inset-0 bg-white/80 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border border-gray-200"
        >
          {/* Header Image Accent */}
          <div className="h-1.5 bg-gray-900" />

          {/* Close Trigger Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Details */}
              <div className="lg:col-span-2 space-y-8">
            {/* Header / Company Details */}
            <div className="flex items-start gap-4 mb-6 pr-8">
              <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0 border border-gray-200">
                <Building2 className="w-6 h-6" />
              </div>
              
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{job.companyName}</span>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-1 leading-snug">
                  {job.title}
                </h3>
                <div className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-2">
                  {categoryLabels[job.category]} &bull; {job.department}
                </div>
              </div>
            </div>

            {/* Listing Integrity Audit Section */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-mono uppercase tracking-wider text-gray-600">Listing Quality Audit</h4>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-medium font-mono">Quality Score:</span>
                  <div className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border font-mono ${scoreColor}`}>
                    {qualityScore}% &bull; {scoreLabel}
                  </div>
                </div>
              </div>

              {validationIssues.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Our live validator flagged the following structural/content issues with this aggregated listing:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {validationIssues.map((issue, idx) => {
                      const iconMap = {
                        error: <X className="w-3.5 h-3.5 text-rose-600" />,
                        warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
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
                            <span className="text-[11px] text-gray-600 mt-0.5 block leading-normal">{issue.description}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs text-emerald-600 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">100% Validation Passed</span>
                    <span className="text-gray-600 text-[11px] mt-0.5 block">This listing conforms fully to high-fidelity schema standards. All critical descriptors, skills, and deep career paths were successfully parsed.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Role Description */}
            <div className="mb-6">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 fill-indigo-500/20" />
                Role Summary
              </h4>
              <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                {job.summary || "No description loaded for this listing."}
              </p>
            </div>

            {/* Core Stack / Skills Tags */}
            <div className="mb-6">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-500" />
                Required Skills & Technologies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {job.skills && job.skills.length > 0 ? (
                  job.skills.map((skill, idx) => (
                    <span
                      key={`${skill}-${idx}`}
                      className="text-[11px] font-semibold bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 italic">No skills listed</span>
                )}
              </div>
            </div>

            {/* Scraper Note Info Alert */}
            {job.id.startsWith('scraped') && (
              <div className="flex flex-col gap-2.5 bg-gray-50 p-5 rounded-2xl border border-gray-100 text-gray-600 text-xs">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4.5 h-4.5 text-gray-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-gray-600">
                    This job listing was automatically extracted and structured from the company's real-time career page using our refined, high-fidelity server-side career portal crawler.
                  </p>
                </div>
                
                {/* Extraction Method Details */}
                <div className="mt-1 pt-2 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-mono">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">Scraper Extraction Pipeline:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase w-fit ${
                    job.source === 'json-ld' 
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                      : job.source === 'hydration' 
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                      : 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
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

            </div>
              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Quick Metadata Grid */}
                <div className="space-y-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    Role Overview
                  </h4>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="text-xs">
                      <span className="block text-gray-500 font-medium mb-0.5">Location</span>
                      <span className="font-semibold text-gray-900">{job.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="text-xs">
                      <span className="block text-gray-500 font-medium mb-0.5">Job Type</span>
                      <span className="font-semibold text-gray-900">{job.type}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="text-xs">
                      <span className="block text-gray-500 font-medium mb-0.5">Compensation Range</span>
                      <span className="font-semibold text-gray-900">{job.salary || 'Negotiable'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="text-xs">
                      <span className="block text-gray-500 font-medium mb-0.5">Scraped On</span>
                      <span className="font-semibold text-gray-900">{formatDate(job.dateAdded)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Company Info Box (if available) */}
                {company && (
                  <div className="space-y-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      Company Details
                    </h4>
                    <div className="space-y-3 text-xs">
                      {company.website && (
                        <div className="flex items-center gap-2 text-gray-800 hover:text-indigo-600 transition-colors">
                          <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="truncate">
                            {company.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      {company.size && company.size !== 'Please update' && (
                        <div className="flex items-center gap-2 text-gray-800">
                          <Users className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>{company.size} Employees</span>
                        </div>
                      )}
                      {company.email && (
                        <div className="flex items-center gap-2 text-gray-800 hover:text-indigo-600 transition-colors">
                          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                          <a href={`mailto:${company.email}`} className="truncate">{company.email}</a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Apply Action Buttons */}
                <div className="pt-2 space-y-2.5">
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    Apply via Portal
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
