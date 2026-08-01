const fs = require('fs');
const file = 'c:/Users/menen/Desktop/Vantillu Resto/frontend/components/AdminDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// The string looks like fetch(`${API_URL}/api/admin/login',
// We want to replace the closing single quote with a backtick
content = content.replace(/fetch\(\`\$\{API_URL\}\/api\/([^']+)'/g, 'fetch(`${API_URL}/api/$1`');

fs.writeFileSync(file, content);
console.log('Fixed quotes!');
