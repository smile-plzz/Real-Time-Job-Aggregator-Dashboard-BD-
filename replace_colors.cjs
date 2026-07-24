const fs = require('fs');
const path = require('path');

function replaceColors(content) {
    let newContent = content;
    const replacements = [
        [/bg-\[\#0A0C10\]/g, 'bg-white'],
        [/bg-\[\#0D1117\]/g, 'bg-white'],
        [/bg-\[\#161B22\]/g, 'bg-gray-100'],
        [/bg-\[\#070A0F\]/g, 'bg-gray-50'],
        [/border-\[\#161B22\]/g, 'border-gray-200'],
        [/border-\[\#30363d\]/g, 'border-gray-300'],
        [/text-\[\#E2E8F0\]/g, 'text-gray-900'],
        [/text-slate-100/g, 'text-gray-900'],
        [/text-slate-200/g, 'text-gray-900'],
        [/text-slate-300/g, 'text-gray-800'],
        [/text-slate-400/g, 'text-gray-600'],
        [/text-slate-500/g, 'text-gray-500'],
        [/hover:bg-\[\#161B22\]/g, 'hover:bg-gray-50'],
        [/hover:bg-\[\#1f2631\]/g, 'hover:bg-gray-100'],
        [/hover:border-\[\#30363d\]/g, 'hover:border-gray-300'],
        [/bg-slate-800\/30/g, 'bg-gray-100'],
        [/text-indigo-400/g, 'text-indigo-600'],
        [/text-emerald-400/g, 'text-emerald-600'],
        [/text-rose-400/g, 'text-rose-600'],
        [/text-cyan-400/g, 'text-cyan-600'],
        [/text-amber-400/g, 'text-amber-600']
    ];

    for (const [regex, replacement] of replacements) {
        newContent = newContent.replace(regex, replacement);
    }
    
    // Careful with text-white, mostly used in header or buttons. 
    // Header text-white -> text-gray-900, but let's just do it manually for App.tsx if needed.
    
    return newContent;
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const newContent = replaceColors(content);
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory('./src');
