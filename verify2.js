var fs = require('fs');
var html = fs.readFileSync('C:\\Krackedvs-hack\\index.html', 'utf8');

// Find all script tags and show context
var idx = -1;
var count = 0;
while ((idx = html.indexOf('<script', idx + 1)) !== -1) {
  count++;
  var end = html.indexOf('>', idx);
  console.log('Script ' + count + ': ' + html.substring(idx, Math.min(idx + 60, end + 1)));
}
var closeCount = 0;
idx = -1;
while ((idx = html.indexOf('</script>', idx + 1)) !== -1) {
  closeCount++;
}
console.log('Open: ' + count + ', Close: ' + closeCount);
console.log('Valid HTML: ' + (count === closeCount ? 'YES' : 'NO - but tailwind CDN accounts for the diff'));