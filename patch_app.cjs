const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import for MarketPulse
if (!content.includes('import MarketPulse')) {
  content = content.replace(
    /import AnalyticsDashboard from '\.\/components\/AnalyticsDashboard';/,
    `import AnalyticsDashboard from './components/AnalyticsDashboard';\nimport MarketPulse from './components/MarketPulse';`
  );
}

// Ensure Activity icon is imported
if (!content.includes('Activity')) {
  content = content.replace(
    /import \{([^{}]*)\} from 'lucide-react';/,
    (match, p1) => {
      if (!p1.includes('Activity')) {
        return `import { Activity, ${p1} } from 'lucide-react';`;
      }
      return match;
    }
  );
}

// Add the new tab button
content = content.replace(
  /<button\s+onClick=\{\(\) => setActiveTab\('analytics'\)\}[\s\S]*?<\/button>/,
  match => match + `
          <button
            onClick={() => setActiveTab('pulse')}
            className={\`px-4 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 \${
              activeTab === 'pulse'
                ? 'border-indigo-500 text-indigo-600 font-bold bg-indigo-500/5 rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg'
            }\`}
          >
            <Activity className={\`w-4 h-4 \${activeTab === 'pulse' ? 'text-indigo-600' : 'text-gray-500'}\`} />
            Market Pulse
          </button>`
);

// Add the tab content
content = content.replace(
  /\{\/\* Tab Content Sections \*\/\}[\s\S]*?<AnimatePresence mode="wait">/,
  `{/* Tab Content Sections */}
        <div className="relative">
          <AnimatePresence mode="wait">`
);

content = content.replace(
  /\{activeTab === 'analytics' && \([\s\S]*?<\/motion\.div>\s*\)\}/,
  match => match + `
            {activeTab === 'pulse' && (
              <motion.div
                key="pulse"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MarketPulse jobs={jobs} companies={companies} />
              </motion.div>
            )}`
);

fs.writeFileSync('src/App.tsx', content);
