const fs = require('fs');
let content = fs.readFileSync('src/components/JobDetailModal.tsx', 'utf8');

// The user wants a minimalist layout. Let's make it a 2-column grid.
// First, let's update the modal container to be wider.
content = content.replace(
  /sm:max-w-2xl/,
  'sm:max-w-4xl'
);

// We'll wrap the body content in a flex or grid.
content = content.replace(
  /<div className="p-6 sm:p-8">/,
  `<div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Details */}
              <div className="lg:col-span-2 space-y-8">`
);

// Let's remove the previous visual structure to flatten it and place it into the grid
content = content.replace(
  /\{\/\* Action Buttons \*\/\}[\s\S]*?<\/div>[\s]*<\/div>[\s]*<\/motion\.div>/,
  `</div>
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
                            {company.website.replace(/^https?:\\/\\//, '')}
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
                          <a href={\`mailto:\${company.email}\`} className="truncate">{company.email}</a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Apply Button */}
                <div className="pt-2">
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
                    className="w-full mt-3 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
`
);

// We also need to remove the previous elements that we moved to the right column
content = content.replace(
  /\{\/\* Company Info Box \(if available\) \*\/\}[\s\S]*?\{\/\* Quick Metadata Grid \*\/\}/,
  `{/* Quick Metadata Grid */}`
);

content = content.replace(
  /\{\/\* Quick Metadata Grid \*\/\}[\s\S]*?\{\/\* Extracted Role Description \*\/\}/,
  `{/* Extracted Role Description */}`
);

// Fix styling of remaining elements in the left column
content = content.replace(
  /mb-6 p-4 rounded-xl border border-gray-200 bg-white\/50/,
  `mb-6 p-4 rounded-xl border border-gray-100 bg-white/50`
);

content = content.replace(
  /mb-6 bg-white border border-gray-200 rounded-xl p-5/,
  `bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]`
);

content = content.replace(
  /text-xs font-mono uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5/g,
  `text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5`
);

content = content.replace(
  /text-sm text-gray-800 leading-relaxed bg-indigo-500\/5 p-4 rounded-xl border border-indigo-500\/10/,
  `text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap font-medium`
);

content = content.replace(
  /text-xs font-mono font-semibold bg-gray-100 border border-gray-300 text-gray-800 px-3 py-1 rounded-lg/g,
  `text-[11px] font-semibold bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg`
);

content = content.replace(
  /bg-white p-4 rounded-xl border border-gray-200 text-gray-600 text-xs mb-6/,
  `bg-gray-50 p-5 rounded-2xl border border-gray-100 text-gray-600 text-xs`
);

content = content.replace(
  /h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500/,
  `h-1.5 bg-gray-900`
);

content = content.replace(
  /w-12 h-12 rounded-xl bg-indigo-500\/10 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-500\/25/,
  `w-12 h-12 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0 border border-gray-200`
);

content = content.replace(
  /text-xs font-semibold text-indigo-600 uppercase tracking-wider/,
  `text-[10px] font-bold text-gray-500 uppercase tracking-wider`
);

content = content.replace(
  /text-xl font-bold text-gray-900 tracking-tight mt-0\.5 leading-snug/,
  `text-2xl font-extrabold text-gray-900 tracking-tight mt-1 leading-snug`
);

content = content.replace(
  /text-xs text-gray-600 mt-1 font-semibold/,
  `text-xs text-gray-500 mt-2 font-medium flex items-center gap-2`
);

fs.writeFileSync('src/components/JobDetailModal.tsx', content);
