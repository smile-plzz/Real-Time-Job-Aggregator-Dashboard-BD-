/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { X, Building2, MapPin, Briefcase, Calendar, DollarSign, ExternalLink, Sparkles, AlertCircle, FileText } from 'lucide-react';
import { Job } from '../types';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
}

export default function JobDetailModal({ job, onClose }: JobDetailModalProps) {
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
                  job.skills.map(skill => (
                    <span
                      key={skill}
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
