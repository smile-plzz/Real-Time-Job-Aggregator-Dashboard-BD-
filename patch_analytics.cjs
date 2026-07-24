const fs = require('fs');

let content = fs.readFileSync('src/components/AnalyticsDashboard.tsx', 'utf8');

const newInsights = `
      {/* Advanced Market Insights Panel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Zap className="w-4 h-4 text-amber-500" />
          Advanced Market & Talent Trends
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm text-gray-700">
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <Flame className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 mb-1">MERN Stack Continues Dominance</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  The demand for React/Next.js combined with Node.js/Express continues to dominate the startup and mid-level enterprise sector. Companies are heavily prioritizing engineers who can traverse the entire stack to optimize team sizes.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 mb-1">QA Automation Shift</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Manual testing roles are seeing a sharp decline, replaced by a surge in demand for QA Automation Engineers proficient in Cypress, Playwright, and Selenium. 
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Fintech & Edtech Surges</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Fintech and Edtech are the fastest-growing sectors for new hires this quarter. They are heavily recruiting senior backend engineers with experience in high-concurrency systems and microservices architectures.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <Building2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Hybrid Work Standardization</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  While fully remote roles remain highly sought after, over 65% of companies are now standardizing on a 3-day on-site hybrid model. Flexibility is often used as a negotiation lever instead of salary bumps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
`;

content = content.replace(
  /<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/,
  (match) => `        </div>\n      </div>\n${newInsights}\n    </div>\n  );\n}`
);

fs.writeFileSync('src/components/AnalyticsDashboard.tsx', content);
