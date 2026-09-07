var fs = require('fs');
var js = fs.readFileSync('C:\\Krackedvs-hack\\game.js', 'utf8');

// Check syntax
try {
  new Function(js);
  console.log('SYNTAX: OK');
} catch (e) {
  console.log('SYNTAX ERROR: ' + e.message);
}

// Check all $() references match actual HTML IDs
var html = fs.readFileSync('C:\\Krackedvs-hack\\index.html', 'utf8');
var refs = js.match(/\$\(['"][a-z0-9_-]+['"]\)/g) || [];
var missing = [];
var refSet = {};
refs.forEach(function(r) {
  var id = r.match(/['"]([^'"]+)['"]/)[1];
  refSet[id] = (refSet[id] || 0) + 1;
  if (html.indexOf('id="' + id + '"') === -1 && html.indexOf('id="' + id) === -1) {
    missing.push(id);
  }
});

console.log('\nDOM refs used in game.js:');
Object.keys(refSet).sort().forEach(function(id) {
  console.log('  $("' + id + '") x' + refSet[id]);
});

if (missing.length > 0) {
  console.log('\nMISSING from HTML: ' + missing.join(', '));
} else {
  console.log('\nAll DOM refs match HTML IDs: OK');
}

// Check onclick handlers match element ids
var handlers = js.match(/\$\(['"][^'"]+['"]\)\.onclick/g) || [];
console.log('\nonclick handlers:');
handlers.forEach(function(h) {
  var id = h.match(/['"]([^'"]+)['"]/)[1];
  var elExists = html.indexOf('id="' + id + '"') > -1;
  console.log('  $("' + id + '").onclick -> ' + (elExists ? 'OK' : 'MISSING'));
});

console.log('\nFile sizes:');
console.log('  index.html: ' + html.length + ' bytes');
console.log('  game.js: ' + js.length + ' bytes');