const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes('resume')) {
          const relativePath = path.relative(path.join(__dirname, '..'), fullPath);
          console.log(`${relativePath}:${index + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

scanDir(srcDir);
