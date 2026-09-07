var fs = require('fs');
var vm = require('vm');

// Create a fake DOM environment
var html = fs.readFileSync('C:\\Krackedvs-hack\\index.html', 'utf8');
var js = fs.readFileSync('C:\\Krackedvs-hack\\game.js', 'utf8');

// Extract all element IDs from HTML
var idRegex = /id="([^"]+)"/g;
var match;
var ids = [];
while ((match = idRegex.exec(html)) !== null) {
  ids.push(match[1]);
}

// Build a minimal DOM mock with all the IDs
var dom = {};
ids.forEach(function(id) {
  dom[id] = {
    textContent: '',
    className: '',
    style: {},
    dataset: {},
    disabled: false,
    classList: {
      add: function() {},
      remove: function() {},
      contains: function() { return false; }
    },
    children: { length: 0 },
    innerHTML: '',
    onclick: null,
    appendChild: function() { return null; },
    remove: function() {},
    offsetWidth: 0
  };
});

// Mock document
var document = {
  getElementById: function(id) {
    if (!dom[id]) {
      console.log('WARNING: getElementById("' + id + '") returned null - ID not in HTML');
      return null;
    }
    return dom[id];
  },
  querySelectorAll: function(sel) {
    // Return all matching elements (simplified)
    var results = [];
    if (sel === '.ab') {
      for (var i = 0; i < 4; i++) {
        var el = { textContent: '', dataset: {}, disabled: false, className: '', onclick: null };
        results.push(el);
      }
    }
    if (sel === '.ba') {
      for (var i = 0; i < 4; i++) {
        var el = { textContent: '', dataset: {}, disabled: false, className: '', onclick: null };
        results.push(el);
      }
    }
    if (sel === '.range-btn') {
      var els = html.split('range-btn');
      for (var i = 1; i < els.length; i++) {
        var el = { textContent: '', dataset: {r: ''}, className: '', onclick: null, classList: { remove: function(){}, add: function(){} } };
        results.push(el);
      }
    }
    if (sel === '.dur-btn') {
      for (var i = 0; i < 3; i++) {
        var el = { textContent: '', dataset: {sec: ''}, className: '', onclick: null, classList: { remove: function(){}, add: function(){} } };
        results.push(el);
      }
    }
    if (sel === '.theme-btn') {
      for (var i = 0; i < 4; i++) {
        var el = { textContent: '', dataset: {theme: ''}, className: '', onclick: null, classList: { remove: function(){}, add: function(){} } };
        results.push(el);
      }
    }
    results.forEach(function(r) { r.forEach = Array.prototype.forEach; });
    return results;
  },
  body: { className: '' }
};

// Mock navigator
var navigator = { share: null, clipboard: { writeText: function() {} } };

// Mock localStorage
var store = {};
var localStorage = {
  getItem: function(k) { return store[k] || null; },
  setItem: function(k, v) { store[k] = v; },
  removeItem: function(k) { delete store[k]; }
};

// Mock AudioContext
var AudioContext = function() {};
AudioContext.prototype.createOscillator = function() { return { type: '', frequency: { value: 0 }, connect: function(){}, start: function(){}, stop: function(){} }; };
AudioContext.prototype.createGain = function() { return { gain: { value: 0, setValueAtTime: function(){}, exponentialRampToValueAtTime: function(){} }, connect: function(){} }; };

var window = { AudioContext: AudioContext, webkitAudioContext: AudioContext };

try {
  // Run the game.js in a sandbox with all mocks
  vm.runInNewContext(js, {
    document: document,
    window: window,
    navigator: navigator,
    localStorage: localStorage,
    AudioContext: AudioContext,
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    alert: function() {},
    confirm: function() { return false; },
    parseInt: parseInt,
    Math: Math,
    Date: Date,
    Array: Array,
    Object: Object,
    String: String,
    Number: Number,
    Boolean: Boolean,
    RegExp: RegExp,
    JSON: JSON,
    isNaN: isNaN,
    parseFloat: parseFloat
  });

  console.log('\n--- Script executed successfully ---');
  
  // Now simulate clicking Start
  var startBtn = dom['start-btn'];
  if (startBtn && startBtn.onclick) {
    console.log('Clicking Start button...');
    startBtn.onclick();
    console.log('Game state isActive: ' + (global.state ? global.state.isActive : 'N/A'));
    
    // Simulate clicking an answer button
    setTimeout(function() {
      if (dom['qt']) console.log('Question shown: ' + dom['qt'].textContent);
      console.log('Score: ' + (dom['score'] ? dom['score'].textContent : 'N/A'));
      console.log('Timer: ' + (dom['timer'] ? dom['timer'].textContent : 'N/A'));
    }, 500);
  } else {
    console.log('ERROR: Start button not found or onclick not set');
  }
} catch (e) {
  console.log('RUNTIME ERROR: ' + e.message);
  console.log(e.stack);
}