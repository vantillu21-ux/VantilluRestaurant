const fs = require('fs');
const file = 'c:/Users/menen/Desktop/Vantillu Resto/frontend/components/AdminDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { API_URL }')) {
  content = content.replace('import React', 'import { API_URL } from "../lib/api";\nimport React');
}

// Replace single-quoted fetches
content = content.replace(/fetch\('(\/api\/[^']+)'/g, 'fetch(`${API_URL}$1`');

// Replace backtick fetches
content = content.replace(/fetch\(\`(\/api\/[^\`]+)\`/g, 'fetch(`${API_URL}$1`');

fs.writeFileSync(file, content);
console.log('Done!');
