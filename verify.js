var fs = require('fs');
var js = fs.readFileSync('C:\\Krackedvs-hack\\game.js', 'utf8');
try {
  new Function(js);
  console.log('game.js SYNTAX OK');
} catch (e) {
  console.log('ERROR: ' + e.message);
}

var html = fs.readFileSync('C:\\Krackedvs-hack\\index.html', 'utf8');
var open = html.split('<script>').length - 1;
var close = html.split('</script>').length - 1;
console.log('index.html: ' + open + ' script open, ' + close + ' close');
console.log('Has DOCTYPE: ' + html.startsWith('<!DOCTYPE'));
console.log('Has html end: ' + html.includes('</html>'));
console.log('Has game.js ref: ' + html.includes('game.js'));
console.log('Size: ' + (js.length + html.length) + ' bytes total');