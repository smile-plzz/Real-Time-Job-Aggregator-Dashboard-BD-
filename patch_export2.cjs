const fs = require('fs');

let content = fs.readFileSync('src/components/ExportSection.tsx', 'utf8');

// Add Markdown export button
content = content.replace(
  /<button\s+onClick=\{\(\) => handleExport\('json'\)\}[\s\S]*?<\/button>/,
  `<button
                     onClick={() => handleExport('json')}
                     disabled={(exportType === 'jobs' ? getFilteredJobsCount() : (exportType === 'companies' ? getFilteredCompaniesCount() : 6)) === 0}
                     className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                   >
                     <FileJson className="w-4 h-4 text-amber-400" />
                     Download JSON Payload
                   </button>
                   <button
                     onClick={() => handleExport('md')}
                     disabled={(exportType === 'jobs' ? getFilteredJobsCount() : (exportType === 'companies' ? getFilteredCompaniesCount() : 6)) === 0}
                     className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                   >
                     <FileJson className="w-4 h-4 text-purple-400" />
                     Download Markdown Report
                   </button>`
);

content = content.replace(
  `const handleExport = (format: 'csv' | 'json') => {`,
  `const handleExport = (format: 'csv' | 'json' | 'md') => {`
);

content = content.replace(
  `if (format === 'json') {`,
  `if (format === 'md') {
      let mdContent = '# TechHub BD Export Report\\n\\n';
      mdContent += \`Generated on: \${new Date().toLocaleDateString()}\\n\\n\`;
      
      if (exportType === 'analytics') {
        mdContent += '## Market Analytics Summary\\n\\n';
        exportData.forEach(item => {
           mdContent += \`- **\${item.Metric}**: \${item.Value}\\n\`;
        });
      } else {
        mdContent += \`## \${exportType === 'jobs' ? 'Job Listings' : 'Company Directory'}\\n\\n\`;
        mdContent += \`Total Records: \${exportData.length}\\n\\n\`;
        exportData.forEach((item, index) => {
          mdContent += \`### Record \${index + 1}\\n\`;
          Object.entries(item).forEach(([key, val]) => {
            mdContent += \`- **\${key}**: \${val}\\n\`;
          });
          mdContent += '\\n';
        });
      }
      
      const blob = new Blob([mdContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`\${filename}.md\`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'json') {`
);

fs.writeFileSync('src/components/ExportSection.tsx', content);
