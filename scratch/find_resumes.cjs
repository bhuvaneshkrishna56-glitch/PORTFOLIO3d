const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
let output = '';

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
        if (line.includes('href={resumeUrl}') || line.includes('href={resume_url}')) {
          const relativePath = path.relative(path.join(__dirname, '..'), fullPath);
          output += `\n========================================\n`;
          output += `${relativePath}:${index + 1}\n`;
          output += `========================================\n`;
          const start = Math.max(0, index - 5);
          const end = Math.min(lines.length - 1, index + 5);
          for (let i = start; i <= end; i++) {
            const marker = (i === index) ? '=> ' : '   ';
            output += `${marker}${i + 1}: ${lines[i]}\n`;
          }
        }
      });
    }
  }
}

scanDir(srcDir);
fs.writeFileSync(path.join(__dirname, 'resumes_context.txt'), output, 'utf8');
console.log('Saved context output to scratch/resumes_context.txt');
