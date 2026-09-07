var fs = require('fs');
var html = fs.readFileSync('C:\\Krackedvs-hack\\index.html', 'utf8');
var js = fs.readFileSync('C:\\Krackedvs-hack\\game.js', 'utf8');

// Check if buttons have value attribute set in JS
var setsValue = js.match(/\.value\s*=\s*fa\[/g);
console.log('JS sets button.value: ' + (setsValue ? setsValue.length : 0));

var readsValue = js.match(/this\.value/g);
console.log('JS reads this.value: ' + (readsValue ? readsValue.length : 0));

// Check what HTML buttons look like
var buttonLines = html.split('\n').filter(function(l) { return l.indexOf('<button') > -1 && l.indexOf('class="ab"') > -1; });
console.log('\nButton HTML samples:');
buttonLines.forEach(function(l) { console.log('  ' + l.trim().substring(0, 100)); });

// Confirm: button.value in HTML5 returns the value attribute content, not dataset
// If there's no value attribute, it returns '' (empty string)
console.log('\nDiagnosis:');
console.log('  Button .value without attribute: returns empty string');
console.log('  JS sets element.value = X: this sets the HTML value attribute (works)');
console.log('  JS reads this.value: this reads the HTML value attribute (works if set)');
console.log('  Verdict: Should work IF .value is actually being set');