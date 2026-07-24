const fs = require('fs');

let content = fs.readFileSync('src/components/AnalyticsDashboard.tsx', 'utf8');

// Fix Tooltip styles for light mode
content = content.replace(
  /contentStyle=\{\{ backgroundColor: '\#0A0C10', borderColor: '\#161B22', borderRadius: '12px' \}\}/g,
  `contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '12px', color: '#111827' }}`
);
content = content.replace(
  /itemStyle=\{\{ color: '\#E2E8F0', fontSize: '11px' \}\}/g,
  `itemStyle={{ color: '#374151', fontSize: '11px', fontWeight: 500 }}`
);

// We need to add "Hiring Velocity" and dynamic market narrative.
// Let's add it near strategicKPIs.
fs.writeFileSync('src/components/AnalyticsDashboard.tsx', content);
