/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Save, Sparkles } from 'lucide-react';
import { Company } from '../types';

interface ManualAddModalProps {
  companies: Company[];
  onClose: () => void;
  onSave: (jobData: any) => Promise<void>;
}

export default function ManualAddModal({ companies, onClose, onSave }: ManualAddModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    department: 'Engineering',
    location: 'Dhaka, Bangladesh',
    type: 'Full-time',
    link: '',
    skills: '',
    experienceLevel: 'unspecified',
    category: 'other',
    salary: '',
    summary: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sortedCompanyNames = [...companies].map(c => c.name).sort();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) return setError('Job title is required');
    if (!formData.companyName) return setError('Please select or specify a company');
    if (formData.category === 'other' && !formData.skills.trim()) {
      setError('Please provide at least a few required skills');
    }

    try {
      setLoading(true);
      await onSave({
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : []
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register the manual listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="manual-add-modal">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#0A0C10]/80 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative transform overflow-hidden rounded-2xl bg-[#0D1117] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-[#161B22]"
        >
          {/* Header Strip */}
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

          {/* Close trigger button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161B22] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Add Custom Job Listing
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manually record an open vacancy to aggregate it into the master feed.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Job Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Senior Frontend Developer"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs placeholder-slate-500 text-slate-200 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/30 transition-all"
                />
              </div>

              {/* Company & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Company *</label>
                  <select
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/30 transition-all cursor-pointer"
                  >
                    <option value="">Select Company...</option>
                    {sortedCompanyNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
                  <input
                    type="text"
                    name="department"
                    placeholder="e.g. Product Engineering"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs placeholder-slate-500 text-slate-200 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/30 transition-all"
                  />
                </div>
              </div>

              {/* Category & Experience Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/30 transition-all cursor-pointer"
                  >
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="fullstack">Fullstack</option>
                    <option value="mobile">Mobile</option>
                    <option value="devops">DevOps</option>
                    <option value="qa">QA / Testing</option>
                    <option value="product">Product Management</option>
                    <option value="design">Design</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Experience Level</label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/30 transition-all cursor-pointer"
                  >
                    <option value="unspecified">Unspecified</option>
                    <option value="intern">Internship</option>
                    <option value="junior">Junior (1-2 yrs)</option>
                    <option value="mid">Mid-Level (2-5 yrs)</option>
                    <option value="senior">Senior (5+ yrs)</option>
                    <option value="lead">Lead / Principal</option>
                  </select>
                </div>
              </div>

              {/* Location, Job Type & Salary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs placeholder-slate-500 text-slate-200 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Job Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/30 transition-all cursor-pointer"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              {/* Application Link & Salary */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Apply Link</label>
                  <input
                    type="url"
                    name="link"
                    placeholder="https://company.com/apply"
                    value={formData.link}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs placeholder-slate-500 text-slate-200 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Salary bounds</label>
                  <input
                    type="text"
                    name="salary"
                    placeholder="e.g. BDT 80K - 110K"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs placeholder-slate-500 text-slate-200 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/30 transition-all"
                  />
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  name="skills"
                  placeholder="React, TypeScript, Tailwind CSS, Jest"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs placeholder-slate-500 text-slate-200 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/30 transition-all"
                />
              </div>

              {/* Brief Summary */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Brief Summary</label>
                <textarea
                  name="summary"
                  rows={3}
                  placeholder="Provide a 1-2 sentence description of the role's primary responsibilities..."
                  value={formData.summary}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#0A0C10] border border-[#161B22] rounded-xl text-xs placeholder-slate-500 text-slate-200 focus:outline-hidden focus:border-indigo-500 focus:bg-[#161B22]/30 transition-all resize-none"
                />
              </div>
            </div>

            {/* Form actions footer */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#161B22] mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 bg-[#161B22] hover:bg-[#1f2631] border border-[#30363d] rounded-xl text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Adding Listing...' : 'Save Job Listing'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
