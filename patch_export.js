const fs = require('fs');

let content = fs.readFileSync('src/components/ExportSection.tsx', 'utf8');

// Add analytics export option
content = content.replace(
  `const [exportType, setExportType] = useState<'jobs' | 'companies'>('jobs');`,
  `const [exportType, setExportType] = useState<'jobs' | 'companies' | 'analytics'>('jobs');`
);

content = content.replace(
    `<button
               onClick={() => setExportType('companies')}`,
    `<button
               onClick={() => setExportType('companies')}
               className={\`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer \${
                 exportType === 'companies' 
                   ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600' 
                   : 'bg-white border-gray-200 text-gray-600 hover:border-slate-700'
               }\`}
             >
                <Building className={\`w-6 h-6 \${exportType === 'companies' ? 'text-indigo-600' : 'text-gray-500'}\`} />
                <span className="font-semibold text-sm">Export Company Directory</span>
             </button>
             <button
               onClick={() => setExportType('analytics')}
               className={\`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer \${
                 exportType === 'analytics' 
                   ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600' 
                   : 'bg-white border-gray-200 text-gray-600 hover:border-slate-700'
               }\`}
             >
                <Layers className={\`w-6 h-6 \${exportType === 'analytics' ? 'text-indigo-600' : 'text-gray-500'}\`} />
                <span className="font-semibold text-sm">Export Analytics Summary</span>
             </button>`
);

// We need to carefully update the handleExport function to support 'analytics'
content = content.replace(
    `} else {
      let filtered = [...companies];`,
    `} else if (exportType === 'companies') {
      let filtered = [...companies];`
);

content = content.replace(
    `filename = \`techhub_companies_export_\${new Date().toISOString().split('T')[0]}\`;
    }`,
    `filename = \`techhub_companies_export_\${new Date().toISOString().split('T')[0]}\`;
    } else if (exportType === 'analytics') {
      const activeJobs = jobs.filter(j => !j.title.toLowerCase().includes('closed'));
      exportData = [
        {
          Metric: "Total Companies",
          Value: companies.length
        },
        {
          Metric: "Total Scanned Jobs",
          Value: jobs.length
        },
        {
          Metric: "Remote Opportunities",
          Value: activeJobs.filter(j => j.type.toLowerCase().includes('remote')).length
        },
        {
          Metric: "Junior Roles",
          Value: activeJobs.filter(j => j.experienceLevel === 'junior').length
        },
        {
          Metric: "Senior Roles",
          Value: activeJobs.filter(j => j.experienceLevel === 'senior' || j.experienceLevel === 'lead').length
        }
      ];
      filename = \`techhub_market_analytics_\${new Date().toISOString().split('T')[0]}\`;
    }`
);

fs.writeFileSync('src/components/ExportSection.tsx', content);
