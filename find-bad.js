const fs = require('fs');
let c = fs.readFileSync('C:\\Krackedvs-hack\\index.html', 'utf8');

const s2 = c.indexOf('<script>', c.indexOf('<script>') + 1);
const e = c.lastIndexOf('</script>');
let js = c.substring(s2 + 8, e);

// Find all '<' chars in the JS that are NOT part of legitimate patterns
const lines = js.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Skip comments and strings
  const ltPos = line.indexOf('<');
  if (ltPos !== -1) {
    console.log('Line ' + (i + 1) + ' has < at col ' + ltPos + ': ' + line.trim());
  }
}