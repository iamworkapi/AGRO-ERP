const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let count = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // We look for the exact signature of these icon containers
  // Example: width: 34, height: 34, borderRadius: 8, background: "...", color: "...", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
  
  const regex = /width:\s*34,\s*height:\s*34,\s*borderRadius:\s*8,([^]*?)fontSize:\s*14/g;
  
  if (regex.test(content)) {
    // Reset regex index before replace
    const newContent = content.replace(/width:\s*34,\s*height:\s*34,\s*borderRadius:\s*8,([^]*?)fontSize:\s*14/g, 
                                     'width: 42, height: 42, borderRadius: 10,$1fontSize: 20');
    fs.writeFileSync(f, newContent);
    count++;
  }
});

console.log('Replaced icon size in ' + count + ' files.');
