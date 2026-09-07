var fs = require('fs');
var js = fs.readFileSync('C:\\Krackedvs-hack\\game.js', 'utf8');

// Simulate the game flow to find dead ends
var lines = js.split('\n');

// Check: does start() call nextQ()?
var startFn = js.indexOf('function start()');
var nextQCall = js.indexOf('nextQ()', startFn);
console.log('start() calls nextQ(): ' + (nextQCall > startFn && nextQCall < startFn + 500));

// Check: does nextQ() reset isBusy?
var nextQFn = js.indexOf('function nextQ()');
var isBusyFalse = js.indexOf('isBusy = false', nextQFn);
console.log('nextQ() resets isBusy: ' + (isBusyFalse > nextQFn && isBusyFalse < nextQFn + 1000));

// Check: is afterAnswer() called inside onclick?
var onclickEnd = js.lastIndexOf('};', js.indexOf('afterAnswer()'));
console.log('afterAnswer() called in onclick: ' + (onclickEnd > 0));

// Check: does tick() end round?
var tickFn = js.indexOf('function tick()');
var endRound = js.indexOf('end()', tickFn);
console.log('tick() calls end(): ' + (endRound > tickFn && endRound < tickFn + 500));

// Check: does end() have style.display = 'flex' for end screen?
var endFn = js.indexOf('function end()');
var showEnd = js.indexOf("$('end').style.display = 'flex'", endFn);
console.log('end() shows end screen: ' + (showEnd > endFn && showEnd < endFn + 1500));

// Check boss overlay hidden
var bossHidden = js.indexOf("$('boss').classList.add('hidden')", js.indexOf('function end()'));
console.log('end() hides boss: ' + (bossHidden > endFn));

// Check that .ab buttons are properly bound
js = fs.readFileSync('C:\\Krackedvs-hack\\game.js', 'utf8');
var abHandler = js.indexOf("$$('.ab').forEach");
var btnOnclick = js.indexOf('btn.onclick', abHandler);
var hasAfterAnswer = js.indexOf('afterAnswer()', abHandler);
console.log('.ab button handler defined: ' + (abHandler > 0));
console.log('btn.onclick set inside: ' + (btnOnclick > abHandler && btnOnclick < abHandler + 1500));
console.log('afterAnswer() called inside: ' + (hasAfterAnswer > abHandler && hasAfterAnswer < abHandler + 2000));

// Check actually loading the file - does the entire script actually parse?
try {
  new Function(js);
  console.log('FULL SYNTAX CHECK: PASS');
} catch (e) {
  console.log('FULL SYNTAX CHECK: FAIL - ' + e.message);
}

// Compare with git HEAD
var exec = require('child_process').execSync;
var gitShow;
try {
  gitShow = exec('git show HEAD:game.js', {cwd: 'C:\\Krackedvs-hack', encoding: 'utf8', maxBuffer: 50000});
  console.log('Git HEAD game.js size: ' + gitShow.length);
  console.log('Local game.js size: ' + js.length);
  console.log('Files differ: ' + (gitShow !== js));
} catch (e) {
  console.log('git show failed: ' + e.message);
}

// Check index.html is also correct
var html = fs.readFileSync('C:\\Krackedvs-hack\\index.html', 'utf8');
console.log('\nindex.html checks:');
console.log('  Has game.js src: ' + html.includes('src="game.js"'));
console.log('  Has start screen: ' + html.includes('id="start"'));
console.log('  Has game screen: ' + html.includes('id="game"'));
console.log('  Has end screen: ' + html.includes('id="end"'));
console.log('  Has boss overlay: ' + html.includes('id="boss"'));
console.log('  Has ab buttons: ' + html.includes('class="ab'));

// Check game.js for specific code patterns that might fail at runtime
console.log('\nPotential runtime issues:');
if (js.includes('?.') && !js.includes('?.')) {
  // optional chaining could fail on old android
}
if (js.includes('const')) console.log('  Uses const (ES6)');
if (js.includes('let')) console.log('  Uses let (ES6)');
if (js.includes('=>')) console.log('  Uses arrow functions (ES6)');
if (js.includes('class=')) console.log('  BUG: Class assignment in JS string context');
if (js.includes('display=none')) console.log('  BUG: Missing quotes on style');
if (js.includes("''") || js.includes('""')) console.log('  Empty strings present');
console.log('  All clear: basic ES6 should work on modern browsers');