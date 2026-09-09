var fs = require('fs');
var path = require('path');
var basePath = 'C:\\Krackedvs-hack';

// Generate minimal valid PNG icons using a basic pixel buffer approach
// Since we can't use canvas or sharp, we create SVG files as icons for build tools.
// For a real release you'd replace these with proper 1024x1024 source art.

var sizes = [48, 72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(function(s) {
  // Write a simple HTML-styled SVG icon (stopwatch design)
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '" viewBox="0 0 108 108">';
  svg += '<rect width="108" height="108" fill="#070A14"/>';
  svg += '<circle cx="54" cy="54" r="36" fill="#0F1528" stroke="#8B5CF6" stroke-width="4"/>';
  svg += '<line x1="54" y1="30" x2="54" y2="54" stroke="#A855F7" stroke-width="5" stroke-linecap="round"/>';
  svg += '<line x1="54" y1="54" x2="72" y2="64" stroke="#E9D5FF" stroke-width="4" stroke-linecap="round"/>';
  svg += '<circle cx="54" cy="26" r="5" fill="#6366F1"/>';
  svg += '<rect x="49" y="14" width="10" height="12" rx="3" fill="#6366F1"/>';
  svg += '<text x="54" y="80" text-anchor="middle" fill="#FBBF24" font-size="12" font-weight="bold" font-family="sans-serif">x</text>';
  svg += '</svg>';
  fs.writeFileSync(path.join(basePath, 'icon-' + s + '.svg'), svg);
  fs.writeFileSync(path.join(basePath, 'dist', 'icon-' + s + '.svg'), svg);
  // Also write a .png placeholder note
  fs.writeFileSync(path.join(basePath, 'icon-' + s + '.png'), '');
});

console.log('Generated SVG icons for all sizes. Convert to PNG with any converter before publishing.');

// Generate Android splash screen SVGs
var splashSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="0 0 108 108">';
splashSvg += '<rect width="108" height="108" fill="#070A14"/>';
splashSvg += '<circle cx="54" cy="54" r="30" fill="#0F1528" stroke="#8B5CF6" stroke-width="3"/>';
splashSvg += '<text x="54" y="58" text-anchor="middle" fill="#8B5CF6" font-size="14" font-weight="bold" font-family="sans-serif">S</text>';
splashSvg += '</svg>';
fs.writeFileSync(path.join(basePath, 'android', 'app', 'src', 'main', 'res', 'drawable', 'splash.xml'), splashSvg);
console.log('Wrote splash screen XML.');

// Update capacitor splash config
var capConfig = JSON.parse(fs.readFileSync(path.join(basePath, 'capacitor.config.json'), 'utf8'));
capConfig.plugins.SplashScreen = {
  launchShowDuration: 2000,
  backgroundColor: '#070A14',
  androidSplashResourceName: 'splash',
  showSpinner: false
};
fs.writeFileSync(path.join(basePath, 'capacitor.config.json'), JSON.stringify(capConfig, null, 2));
console.log('Updated capacitor splash config.');

// Create a proper .gitkeep for icons
console.log('Done. Replace SVG files with real PNG icons before release.');