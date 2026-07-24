const fs = require('fs');

let content = fs.readFileSync('src/components/CrawlerDocs.tsx', 'utf8');

// Fix dark gradients
content = content.replace(
  /bg-gradient-to-br from-\[\#161B22\] to-\[\#0D1117\]/g,
  'bg-gradient-to-br from-indigo-50 to-white'
);

content = content.replace(
  /bg-gradient-to-r from-indigo-950\/20 via-\[\#0D1117\] to-violet-950\/20 border border-indigo-500\/15/g,
  'bg-gradient-to-r from-indigo-50 via-white to-violet-50 border border-indigo-100'
);

content = content.replace(
  /bg-gradient-to-r from-emerald-950\/20 via-\[\#0D1117\] to-teal-950\/20 border border-emerald-500\/15/g,
  'bg-gradient-to-r from-emerald-50 via-white to-teal-50 border border-emerald-100'
);

content = content.replace(
  /text-\[\#30363d\]/g,
  'text-gray-200'
);

fs.writeFileSync('src/components/CrawlerDocs.tsx', content);
