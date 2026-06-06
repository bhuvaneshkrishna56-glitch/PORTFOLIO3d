const fs = require('fs');
const path = require('path');
const dir = 'src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('View.jsx'));

files.forEach(f => {
  const code = fs.readFileSync(path.join(dir, f), 'utf8');
  const vars = ['categories', 'displaySkills', 'displayProjects', 'displayExperiences', 'socialLinks'];
  
  vars.forEach(v => {
    // Check if the variable is referenced in the file
    const isReferenced = code.includes(v);
    if (isReferenced) {
      // Check if it is declared with const, let, var, or as a state variable
      const declPattern = new RegExp(`(const|let|var|function)\\s+([^\\w\\s]*\\s*)?${v}\\b`);
      const isDeclared = declPattern.test(code);
      
      if (!isDeclared) {
        console.log(`ERROR in ${f}: "${v}" is used but not declared.`);
      }
    }
  });
});
