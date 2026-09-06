const fs = require('fs');
let c = fs.readFileSync('C:\\Krackedvs-hack\\index.html', 'utf8');

// Count script tags
const openTags = c.split('<script>').length - 1;
const closeTags = c.split('</script>').length - 1;
console.log('Script tags: ' + openTags + ' open, ' + closeTags + ' close');

if (openTags !== closeTags) {
  console.log('ERROR: Script tag mismatch!');
}

// Extract the game script (second one)
let s = c.indexOf('<script>');
s = c.indexOf('<script>', s + 1); // second script
let e = c.lastIndexOf('</script>');
let js = c.substring(s + 8, e);

// Check for common JS errors
const checks = [
  ['const state', 'State declaration'],
  ['function generateQuestion', 'generateQuestion'],
  ['function drawFromPool', 'drawFromPool'],
  ['function handleAnswer', 'handleAnswer'],
  ['function startGame', 'startGame'],
  ['function updatePhase', 'updatePhase'],
  ['function updateFrenzy', 'updateFrenzy'],
  ['function triggerBossBattle', 'triggerBossBattle'],
  ['function grantPowerup', 'grantPowerup'],
  ['function getScoreMultiplier', 'getScoreMultiplier'],
  ['function getGrade', 'getGrade'],
  ['function updateFlame', 'updateFlame'],
  ['function setMode', 'setMode'],
  ['askedPool', 'askedPool variable'],
  ['buildPool', 'buildPool function'],
  ['phasePool', 'phasePool variable'],
  ['rebuildPools', 'rebuildPools function'],
  ['currentPhase', 'currentPhase variable'],
];

checks.forEach(([pat, name]) => {
  if (js.includes(pat)) {
    console.log('OK: ' + name);
  } else {
    console.log('MISSING: ' + name);
  }
});

// Validate JS syntax
try {
  new Function(js);
  console.log('JS SYNTAX: OK');
} catch (err) {
  console.log('JS SYNTAX ERROR: ' + err.message);
  // Show the line
  const lines = js.split('\n');
  const match = err.message.match(/line (\d+)/i);
  if (match) {
    const lineNum = parseInt(match[1]);
    console.log('Near line ' + lineNum + ': ' + lines[Math.max(0, lineNum - 2)]);
    console.log('  ' + lines[Math.max(0, lineNum - 1)]);
    console.log('  ' + lines[lineNum]);
  }
}

// Check HTML structure
console.log('Has DOCTYPE: ' + c.startsWith('<!DOCTYPE'));
console.log('Has <html close: ' + c.includes('</html>'));
console.log('Has <body close: ' + c.includes('</body>'));
console.log('File size: ' + c.length + ' bytes');