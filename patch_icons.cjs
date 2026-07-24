const fs = require('fs');

let content = fs.readFileSync('src/components/CrawlerDocs.tsx', 'utf8');

content = content.replace(
  /import \{ BookOpen, ShieldCheck, HelpCircle, FileCode, CheckCircle2, AlertCircle, Sparkles, Zap, Cpu, Terminal, Layers \} from 'lucide-react';/g,
  `import { BookOpen, HelpCircle, CheckCircle2, AlertCircle, Sparkles, Zap, Cpu, Layers } from 'lucide-react';`
);

fs.writeFileSync('src/components/CrawlerDocs.tsx', content);
