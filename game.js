try {

var state = {
  score: 0, streak: 0, bestStreak: 0, timeRemaining: 60, totalTime: 60,
  current: null, missed: [], prev: null,
  timerId: null, active: false, busy: false,
  soundOn: true, rMin: 1, rMax: 10, baseMin: 1, baseMax: 10,
  ok: 0, bad: 0, total: 0,
  isBoss: false, phase: 1, frenzy: false,
  daily: false, seed: null,
  puzzleActive: false, puzzleType: null,
  tfMode: false, flashMode: false,
  recentWindow: [],
  factorPick: [], factorTarget: 0,
  adaptMin: 1, adaptMax: 10
};

var asked = {};
var questionPool = [];
var activePU = null, puTimer = null;
var bossAns = null;

function $(id) { return document.getElementById(id); }
function $$(sel) { return document.querySelectorAll(sel); }

function shuffle(a) {
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

function seededRng(seed) {
  return function() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}
var rng = Math.random;
function rand(min, max) { return Math.floor(rng() * (max - min + 1)) + min; }

function buildPool(min, max) {
  var pool = [], seen = {};
  for (var a = min; a <= max; a++) {
    for (var b = min; b <= max; b++) {
      var key = a + 'x' + b;
      if (!seen[key]) { seen[key] = true; pool.push({ q: a + ' x ' + b, a: a * b }); }
    }
  }
  return shuffle(pool);
}
function rebuildPool() { questionPool = shuffle(buildPool(state.adaptMin, state.adaptMax)); }
rebuildPool();

function draw() {
  if (questionPool.length === 0) rebuildPool();
  for (var i = 0; i < questionPool.length; i++) {
    var key = questionPool[i].q;
    if (!asked[key]) { asked[key] = true; return questionPool.splice(i, 1)[0]; }
  }
  asked = {};
  if (questionPool.length > 0) { asked[questionPool[0].q] = true; return questionPool.splice(0, 1)[0]; }
  rebuildPool();
  if (questionPool.length > 0) { asked[questionPool[0].q] = true; return questionPool.splice(0, 1)[0]; }
  return { q: rand(state.adaptMin, state.adaptMax) + ' x ' + rand(state.adaptMin, state.adaptMax), a: a * b };
}

var actx = null;
function ctx() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); return actx; }
function tone(f, d, t) {
  if (!state.soundOn) return;
  try { var c = ctx(), o = c.createOscillator(), g = c.createGain(); o.type = t || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.15, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(c.currentTime); o.stop(c.currentTime + d); } catch (e) {}
}
function haptic(p) { try { navigator.vibrate(p); } catch(e) {} }
function sc() { tone(523, 0.15); setTimeout(function() { tone(659, 0.15); }, 80); setTimeout(function() { tone(784, 0.2); }, 160); haptic(15); }
function sw() { tone(200, 0.25, 'sawtooth'); setTimeout(function() { tone(150, 0.3, 'sawtooth'); }, 120); haptic([30,20,30]); }
function st() { tone(880, 0.05, 'square'); }
function se() { tone(440, 0.2); setTimeout(function() { tone(350, 0.2); }, 200); setTimeout(function() { tone(260, 0.4); }, 400); }
function sb() { tone(330, 0.2, 'sawtooth'); setTimeout(function() { tone(440, 0.2, 'sawtooth'); }, 150); setTimeout(function() { tone(550, 0.3, 'sawtooth'); }, 300); }
function sp() { tone(880, 0.1); setTimeout(function() { tone(1100, 0.15); }, 80); }
function spuzzle() { tone(660, 0.1, 'triangle'); setTimeout(function() { tone(880, 0.15, 'triangle'); }, 100); }

var pb = { score: 0, streak: 0 };
try { var s = localStorage.getItem('sifir-pb'); if (s) pb = JSON.parse(s); } catch (e) {}
try { var s = localStorage.getItem('sifir-sound'); if (s === 'false') state.soundOn = false; } catch (e) {}
try { var t = localStorage.getItem('sifir-theme'); if (t) { document.body.className = document.body.className.replace(/theme-\w+/g, '').trim() + ' ' + t; } } catch (e) {}

function updPbUI() {
  var el = $('pb-score'); if (el) el.textContent = pb.score + ' correct';
  el = $('pb-streak'); if (el) el.textContent = pb.streak + ' streak';
  el = $('pb-motive'); if (el) el.textContent = pb.score > 0 ? 'Can you beat your top score?' : 'First sprint? Go!';
}
updPbUI();

function savePb(score, streak) {
  if (score > pb.score || (score === pb.score && streak > pb.streak)) {
    pb = { score: score, streak: streak };
    try { localStorage.setItem('sifir-pb', JSON.stringify(pb)); } catch (e) {}
    return true;
  }
  return false;
}

function soundUI() {
  var on = $('snd-on'), off = $('snd-off');
  if (on) on.style.display = state.soundOn ? '' : 'none';
  if (off) off.style.display = state.soundOn ? 'none' : '';
}

function calcPoints() {
  var base = 1;
  var bonus = 0;
  if (state.streak >= 10) bonus = 2;
  else if (state.streak >= 5) bonus = 1;
  var frenzy = state.frenzy ? 1 : 0;
  var total = base + bonus + frenzy;
  if (activePU && activePU.id === 'double') total *= 2;
  return total;
}

function flame(s) {
  var el = $('flame');
  if (!el) return;
  if (s < 3) { el.textContent = ''; return; }
  el.textContent = ['x', 'xx', 'xxx', 'xxxx'][Math.min(3, Math.floor((s - 3) / 2))];
}

function getPhase(t, total) {
  var r = (total - t) / total;
  if (r < 0.3) return 1;
  if (r < 0.6) return 2;
  return 3;
}

function updPhase(t, total) {
  var ph = getPhase(t, total);
  if (ph !== state.phase) {
    state.phase = ph;
    var el = $('phase');
    if (el) { el.textContent = 'PHASE ' + ph; el.style.color = ['', '#22c55e', '#f59e0b', '#ef4444'][ph]; }
  }
}

function updFrenzy(t) {
  var ov = $('frenzy');
  if (t <= 10 && t > 0) { state.frenzy = true; if (ov) ov.style.display = ''; }
  else { state.frenzy = false; if (ov) ov.style.display = 'none'; }
}

function updRangeIndicator() {
  var el = $('range-indicator');
  if (el) el.textContent = 'Range: ' + state.adaptMin + '-' + state.adaptMax;
}

// ============ ADAPTIVE DIFFICULTY (Prompt 2) ============
function updateAdaptive(correct) {
  state.recentWindow.push(correct);
  if (state.recentWindow.length > 5) state.recentWindow.shift();
  if (state.recentWindow.length < 3) return;
  var allCorrect = state.recentWindow.every(function(v) { return v; });
  var wrongCount = 0;
  state.recentWindow.forEach(function(v) { if (!v) wrongCount++; });
  if (allCorrect && state.adaptMax < 100) {
    state.adaptMin = Math.min(state.adaptMin + 2, 95);
    state.adaptMax = Math.min(state.adaptMax + 5, 100);
    rebuildPool(); updRangeIndicator();
  } else if (wrongCount >= 2) {
    state.adaptMin = Math.max(state.baseMin, state.adaptMin - 2);
    state.adaptMax = Math.max(state.baseMax, state.adaptMax - 3);
    rebuildPool(); updRangeIndicator();
  }
}

// ============ EXPONENTIAL BACKOFF (Prompt 5) ============
function pushMissed(q) {
  state.missed.push({ q: q.q, a: q.a, nextAt: state.total + 2, interval: 2 });
}

function popDueMissed() {
  for (var i = 0; i < state.missed.length; i++) {
    var m = state.missed[i];
    if (state.total >= m.nextAt) {
      state.missed.splice(i, 1);
      var newInterval = m.interval * 2;
      if (newInterval <= 20) {
        state.missed.push({ q: m.q, a: m.a, nextAt: state.total + newInterval, interval: newInterval });
      }
      return { q: m.q, a: m.a };
    }
  }
  return null;
}

// ============ PUZZLE TYPES (Prompt 3 - Factor) ============
var PUZZLE_TYPES = [
  {
    gen: function() {
      var a = rand(state.adaptMin, state.adaptMax), b = rand(state.adaptMin, state.adaptMax);
      return { q: '? x ' + b + ' = ' + (a * b), a: a };
    },
    label: 'FILL IN'
  },
  {
    gen: function() {
      var a = rand(state.adaptMin, state.adaptMax), step = rand(1, Math.max(1, Math.floor((state.adaptMax - state.adaptMin) / 3)));
      return { q: [a, a + step, a + 2 * step].join(', ') + ', ?', a: a + 3 * step };
    },
    label: 'SEQUENCE'
  },
  {
    gen: function() {
      var a = rand(state.adaptMin, Math.min(state.adaptMax, 12));
      return { q: a + ' x ' + a + ' = ?', a: a * a };
    },
    label: 'SQUARE'
  },
  {
    gen: function() {
      var a = rand(state.adaptMin, state.adaptMax), b = rand(state.adaptMin, state.adaptMax);
      return { q: (a * b) + ' / ' + a + ' = ?', a: b };
    },
    label: 'REVERSE'
  }
];

var FACTOR_PUZZLE_ACTIVE = false;
var FACTOR_CHOICES = [];

function genFactorPuzzle() {
  var a = rand(state.adaptMin, state.adaptMax), b = rand(state.adaptMin, state.adaptMax);
  var target = a * b;
  var choices = [a, b];
  var seen = {};
  seen[a] = true; seen[b] = true;
  while (choices.length < 4) {
    var c = rand(state.adaptMin, state.adaptMax);
    if (!seen[c]) { seen[c] = true; choices.push(c); }
  }
  FACTOR_CHOICES = shuffle(choices);
  FACTOR_PUZZLE_ACTIVE = true;
  state.factorPick = [];
  state.factorTarget = target;
  return { q: 'Find two factors of ' + target, a: a, isFactor: true };
}

// ============ CORE ============
function hud() {
  var el = $('score'); if (el) el.textContent = state.score + '';
  el = $('streak'); if (el) el.textContent = state.streak + '';
  el = $('bstreak'); if (el) el.textContent = state.bestStreak + '';
  el = $('timer'); if (el) { el.textContent = state.timeRemaining + ''; el.style.color = state.timeRemaining <= 10 ? '#f87171' : '#fbbf24'; }
  var r = state.timeRemaining / state.totalTime;
  var tb = $('tbar');
  if (tb) { tb.style.width = (r * 100) + '%'; tb.style.background = r <= 1/6 ? 'linear-gradient(90deg,#ef4444,#dc2626)' : r <= 0.5 ? 'linear-gradient(90deg,#f59e0b,#f97316)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)'; }
  updPhase(state.timeRemaining, state.totalTime);
  updFrenzy(state.timeRemaining);
}

function showQuestionUI(isTF, flashText) {
  var abDiv = $('ab-container');
  var tfDiv = $('tf-container');
  if (isTF) {
    abDiv.style.display = 'none';
    tfDiv.style.display = 'flex';
  } else {
    abDiv.style.display = '';
    tfDiv.style.display = 'none';
  }
  if (flashText) {
    $('qt').textContent = flashText;
    $('qt').style.color = '#a78bfa';
  }
}

function loadRegular() {
  var m = popDueMissed();
  if (m) return m;
  var useMissed = state.missed.length >= 3 && Math.random() < 0.4;
  if (useMissed) {
    var q = state.missed.shift();
    if (q.q === state.prev) { state.missed.push(q); q = state.missed.shift(); }
    return q;
  }
  var att = 0, q;
  do { q = draw(); att++; } while (q.q === state.prev && att < 50);
  return q;
}

function nextQ() {
  if (!state.active) { state.busy = false; return; }
  if (state.isBoss) { state.busy = false; return; }
  // Factor puzzle already active via second tap
  if (FACTOR_PUZZLE_ACTIVE) { state.busy = false; return; }
  // 15% puzzle (not TF mode)
  var usePuzzle = !state.tfMode && Math.random() < 0.15 && state.total > 3;
  var q;
  if (usePuzzle) {
    q = PUZZLE_TYPES[rand(0, PUZZLE_TYPES.length - 1)].gen();
    q.isPuzzle = true;
    state.puzzleActive = true;
  } else {
    state.puzzleActive = false;
    q = loadRegular();
  }
  state.current = q;
  state.prev = q.q;
  $('qt').innerHTML = q.q;
  $('qt').style.color = '';
  
  var isTF = state.tfMode && !q.isPuzzle;
  showQuestionUI(isTF);
  
  if (isTF) {
    // True/False: show equation with randomly correct/incorrect answer
    var showCorrect = Math.random() < 0.5;
    var displayed = showCorrect ? q.a : q.a + rand(1, Math.max(2, Math.floor(q.a * 0.2))) * (Math.random() < 0.5 ? 1 : -1);
    if (displayed < 0) displayed = q.a;
    $('qt').textContent = q.q + ' = ' + displayed;
    state.tfAnswer = showCorrect;
  } else if (!q.isPuzzle) {
    var fa = genOptions(q.a);
    var abs = $$('.ab');
    for (var i = 0; i < abs.length; i++) {
      abs[i].innerHTML = fa[i] + '';
      abs[i].setAttribute('dv', fa[i] + '');
      abs[i].disabled = false;
      abs[i].className = 'ab';
    }
  } else {
    var fa = genOptions(q.a);
    var abs = $$('.ab');
    for (var i = 0; i < abs.length; i++) {
      abs[i].innerHTML = fa[i] + '';
      abs[i].setAttribute('dv', fa[i] + '');
      abs[i].disabled = false;
      abs[i].className = 'ab';
    }
  }
  state.busy = false;
  
  // Flashed question mode (Prompt 4)
  if (state.flashMode && !isTF && !q.isPuzzle) {
    var qt = $('qt');
    qt.style.opacity = '1';
    var originalText = qt.innerHTML;
    setTimeout(function() {
      qt.style.opacity = '0';
      setTimeout(function() {
        qt.innerHTML = originalText;
        qt.style.opacity = '1';
      }, 400);
    }, 400);
  }
}

function genOptions(answer) {
  var os = new Set(); os.add(answer);
  while (os.size < 4) {
    var off = rand(1, Math.max(2, Math.floor(Math.abs(answer * 0.3)) + 1)) * (Math.random() < 0.5 ? 1 : -1);
    var v = answer + off;
    if (v >= 0 && !isNaN(v)) os.add(v);
  }
  return shuffle(Array.from(os));
}

// Answer buttons
var abs = $$('.ab');
for (var i = 0; i < abs.length; i++) {
  abs[i].onclick = function() {
    try {
      if (state.busy || !state.active) return;
      state.busy = true;
      if (FACTOR_PUZZLE_ACTIVE) {
        handleFactorClick(this);
        state.busy = false;
        return;
      }
      var v = this.getAttribute('dv');
      if (!v) { state.busy = false; return; }
      var q = state.current;
      if (!q) { state.busy = false; return; }
      var sel = parseInt(v, 10);
      if (isNaN(sel)) { state.busy = false; return; }
      var ok = sel === q.a;
      processAnswer(ok, q);
    } catch (e) { console.log('click err', e); state.busy = false; }
  };
}

function handleFactorClick(btn) {
  var v = parseInt(btn.getAttribute('dv'), 10);
  if (isNaN(v)) return;
  state.factorPick.push(v);
  btn.style.borderColor = '#a78bfa';
  btn.style.background = 'rgba(139,92,246,0.3)';
  if (state.factorPick.length === 2) {
    var a = state.factorPick[0], b = state.factorPick[1];
    if (a * b === state.factorTarget || b * a === state.factorTarget) {
      sc();
      state.score += 3; state.streak++; state.ok++;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      var btns = $$('.ab');
      for (var i = 0; i < btns.length; i++) { btns[i].className = 'ab'; btns[i].style.borderColor = ''; btns[i].style.background = ''; }
      FACTOR_PUZZLE_ACTIVE = false; state.factorPick = [];
      state.total++; hud();
      setTimeout(function() { nextQ(); }, 300);
    } else {
      sw();
      state.bad++;
      var btns = $$('.ab');
      for (var i = 0; i < btns.length; i++) { btns[i].className = 'ab wrong'; btns[i].style.borderColor = ''; btns[i].style.background = ''; }
      setTimeout(function() {
        var btns2 = $$('.ab');
        for (var i = 0; i < btns2.length; i++) { btns2[i].className = 'ab'; }
        FACTOR_PUZZLE_ACTIVE = false; state.factorPick = [];
        state.total++; hud();
        nextQ();
      }, 400);
    }
  }
}

// True/False buttons
$('tf-true').onclick = function() {
  try {
    if (state.busy || !state.active) return;
    state.busy = true;
    var q = state.current;
    if (!q) { state.busy = false; return; }
    processAnswer(state.tfAnswer, q);
  } catch (e) { state.busy = false; }
};
$('tf-false').onclick = function() {
  try {
    if (state.busy || !state.active) return;
    state.busy = true;
    var q = state.current;
    if (!q) { state.busy = false; return; }
    processAnswer(!state.tfAnswer, q);
  } catch (e) { state.busy = false; }
};

function processAnswer(ok, q) {
  if (ok) {
    sc();
    var pts = state.tfMode ? 2 : (q.isPuzzle ? calcPoints() + 2 : calcPoints());
    state.score += pts;
    state.streak++;
    state.ok++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
    if (state.tfMode) {
      $('tf-true').style.background = ok === state.tfAnswer ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)';
    }
    if (state.streak >= 3) {
      var pop = $('combo');
      if (pop) { pop.textContent = '+' + pts; pop.style.display = ''; setTimeout(function() { pop.style.display = 'none'; }, 600); }
    }
    flame(state.streak);
    updateAdaptive(true);
  } else {
    sw();
    state.streak = 0;
    state.bad++;
    if (state.tfMode) {
      $('tf-false').style.background = ok === state.tfAnswer ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)';
    }
    flame(0);
    updateAdaptive(false);
    if (!q.isPuzzle && !state.tfMode) pushMissed(q);
  }
  state.puzzleActive = false;
  state.total++; hud();
  // Factor puzzle every 8 answers
  if (state.ok > 0 && state.ok % 8 === 0 && !state.tfMode) {
    var fp = genFactorPuzzle();
    state.current = fp;
    $('qt').textContent = fp.q + ': ' + state.factorTarget;
    var fa = FACTOR_CHOICES;
    var abs = $$('.ab');
    for (var i = 0; i < abs.length; i++) {
      abs[i].innerHTML = fa[i] + '';
      abs[i].setAttribute('dv', fa[i] + '');
      abs[i].disabled = false;
      abs[i].className = 'ab';
      abs[i].style.borderColor = '';
      abs[i].style.background = '';
    }
    showQuestionUI(false);
    state.busy = false;
    setTimeout(function() {
      FACTOR_PUZZLE_ACTIVE = true;
    }, 100);
    return;
  }
  // Boss every 10 correct
  if (state.ok > 0 && state.ok % 10 === 0 && !state.tfMode) {
    setTimeout(function() { bossTrigger(); }, 300);
  }
  var self = this;
  setTimeout(function() {
    if (state.tfMode) {
      $('tf-true').style.background = 'rgba(34,197,94,0.15)';
      $('tf-false').style.background = 'rgba(239,68,68,0.15)';
    }
    nextQ();
  }, 300);
}

function bossTrigger() {
  state.isBoss = true; sb();
  var a = rand(12, Math.min(20, state.adaptMax * 2)), b = rand(12, Math.min(20, state.adaptMax * 2));
  bossAns = { a: a * b, q: a + ' x ' + b };
  $('bq').textContent = bossAns.q;
  var fa = genOptions(bossAns.a);
  var bas = $$('.ba');
  for (var i = 0; i < bas.length; i++) {
    bas[i].innerHTML = fa[i] + '';
    bas[i].setAttribute('dv', fa[i] + '');
    bas[i].disabled = false;
  }
  $('boss').style.display = '';
}

var bas = $$('.ba');
for (var i = 0; i < bas.length; i++) {
  bas[i].onclick = function() {
    try {
      if (state.busy || !state.active) return;
      state.busy = true;
      var v = this.getAttribute('dv');
      if (!v) { state.busy = false; return; }
      var sel = parseInt(v, 10);
      if (isNaN(sel)) { state.busy = false; return; }
      var ok = sel === bossAns.a;
      if (ok) { sc(); state.score += 5; state.streak++; state.ok++; if (state.streak > state.bestStreak) state.bestStreak = state.streak; this.style.background = '#166534'; }
      else { sw(); state.streak = 0; state.bad++; this.style.background = '#991b1b'; }
      state.total++;
      hud();
      var self = this;
      setTimeout(function() {
        $('boss').style.display = 'none';
        state.isBoss = false;
        state.busy = false;
        self.style.background = '#0F1528';
        nextQ();
      }, 400);
    } catch (e) { console.log('boss click err', e); state.busy = false; }
  };
}

function tick() {
  state.timerId = setInterval(function() {
    state.timeRemaining--;
    if (state.timeRemaining <= 10 && state.timeRemaining > 0) st();
    hud();
    if (state.timeRemaining <= 0) end();
  }, 1000);
}

function end() {
  state.active = false;
  FACTOR_PUZZLE_ACTIVE = false;
  if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
  var ov = $('frenzy'); if (ov) ov.style.display = 'none';
  se();
  try { if (typeof onGameEnd === 'function') onGameEnd(function(){}); } catch(e) {}
  var npb = savePb(state.score, state.bestStreak);
  updPbUI();
  $('game').style.display = 'none';
  $('end').style.display = 'flex';
  var el = $('fs'); if (el) el.textContent = state.score + '';
  el = $('fst'); if (el) el.textContent = state.bestStreak + '';
  el = $('fc'); if (el) el.textContent = state.ok + '';
  el = $('fw'); if (el) el.textContent = state.bad + '';
  el = $('fa'); if (el) el.textContent = state.total > 0 ? Math.round(state.ok / state.total * 100) + '%' : '0%';
  el = $('pb-badge'); if (el) el.style.display = npb ? 'flex' : 'none';
  var gr = $('grade');
  if (state.total <= 0) { if (gr) { gr.textContent = '-'; gr.style.color = '#94a3b8'; } }
  else {
    var ratio = state.score / (state.totalTime * 2);
    var grade, color;
    if (ratio >= 0.8) { grade = 'S'; color = '#fbbf24'; }
    else if (ratio >= 0.6) { grade = 'A'; color = '#34d399'; }
    else if (ratio >= 0.4) { grade = 'B'; color = '#60a5fa'; }
    else if (ratio >= 0.2) { grade = 'C'; color = '#a78bfa'; }
    else { grade = 'D'; color = '#94a3b8'; }
    if (gr) { gr.textContent = grade; gr.style.color = color; }
  }
  var sh = $('share');
  if (sh) { sh.style.display = state.daily ? 'flex' : 'none'; }
  tryShowBonus();
}

function reset() {
  state.score = 0; state.streak = 0; state.bestStreak = 0;
  state.timeRemaining = state.totalTime;
  state.current = null; state.missed = []; state.prev = null;
  state.active = false; state.busy = false;
  state.ok = 0; state.bad = 0; state.total = 0;
  state.isBoss = false; state.phase = 1; state.frenzy = false;
  state.puzzleActive = false; state.puzzleType = null;
  state.recentWindow = [];
  state.adaptMin = state.baseMin; state.adaptMax = state.baseMax;
  FACTOR_PUZZLE_ACTIVE = false; state.factorPick = []; state.factorTarget = 0;
  activePU = null;
  if (puTimer) { clearInterval(puTimer); puTimer = null; }
  var pu = $('pu-bar'); if (pu) pu.innerHTML = '';
  flame(0); asked = {}; rebuildPool();
  if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
  hud();
}

function start() {
  reset();
  if (state.daily) { var d = new Date(); state.seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); rng = seededRng(state.seed); }
  else { rng = Math.random; }
  $('start').style.display = 'none';
  $('end').style.display = 'none';
  $('game').style.display = 'flex';
  state.active = true;
  updRangeIndicator();
  nextQ();
  tick();
  try { if (typeof onGameStart === 'function') onGameStart(); } catch(e) {}
}

function setMode(m) {
  state.daily = m === 'daily';
  var arc = $('mode-a'), daily = $('mode-d');
  if (arc) {
    if (m === 'arcade') { arc.style.cssText = 'flex:1;padding:8px 12px;border-radius:999px;border:1px solid #a78bfa;background:rgba(139,92,246,0.5);color:white;font-size:12px;font-weight:bold'; }
    else { arc.style.cssText = 'flex:1;padding:8px 12px;border-radius:999px;border:1px solid #334155;background:rgba(0,0,0,0.2);color:#cbd5e1;font-size:12px;font-weight:bold'; }
  }
  if (daily) {
    if (m === 'daily') { daily.style.cssText = 'flex:1;padding:8px 12px;border-radius:999px;border:1px solid #a78bfa;background:rgba(139,92,246,0.5);color:white;font-size:12px;font-weight:bold'; }
    else { daily.style.cssText = 'flex:1;padding:8px 12px;border-radius:999px;border:1px solid #334155;background:rgba(0,0,0,0.2);color:#cbd5e1;font-size:12px;font-weight:bold'; }
  }
  var lbl = $('mode-lbl'); if (lbl) lbl.textContent = m === 'daily' ? 'Daily Challenge' : 'Arcade Mode';
}
$('mode-a').onclick = function() { setMode('arcade'); };
$('mode-d').onclick = function() { setMode('daily'); };

var rbs = $$('.range-btn');
for (var i = 0; i < rbs.length; i++) {
  rbs[i].onclick = function() {
    for (var j = 0; j < rbs.length; j++) { rbs[j].style.cssText = 'font-size:12px;padding:6px 10px;border-radius:8px;border:1px solid #334155;background:rgba(0,0,0,0.2);color:#94a3b8'; }
    this.style.cssText = 'font-size:12px;padding:6px 10px;border-radius:8px;border:1px solid #a78bfa;background:rgba(139,92,246,0.5);color:white;font-weight:bold';
    var parts = this.getAttribute('data-r').split(',');
    state.baseMin = parseInt(parts[0], 10); state.baseMax = parseInt(parts[1], 10);
    state.rMin = state.baseMin; state.rMax = state.baseMax;
    state.adaptMin = state.baseMin; state.adaptMax = state.baseMax;
    rebuildPool();
  };
}

var moreBtn = $('more-ranges-btn');
var moreRanges = $('more-ranges');
if (moreBtn && moreRanges) {
  moreBtn.onclick = function() {
    var hidden = moreRanges.style.display === 'none' || moreRanges.style.display === '';
    moreRanges.style.display = hidden ? 'flex' : 'none';
    moreBtn.textContent = hidden ? '- less ranges' : '+ more ranges';
    var extras = moreRanges.querySelectorAll('.range-btn');
    for (var k = 0; k < extras.length; k++) {
      extras[k].onclick = function() {
        var all = $$('.range-btn');
        for (var x = 0; x < all.length; x++) { all[x].style.cssText = 'font-size:12px;padding:6px 10px;border-radius:8px;border:1px solid #334155;background:rgba(0,0,0,0.2);color:#94a3b8'; }
        this.style.cssText = 'font-size:12px;padding:6px 10px;border-radius:8px;border:1px solid #a78bfa;background:rgba(139,92,246,0.5);color:white;font-weight:bold';
        var parts = this.getAttribute('data-r').split(',');
        state.baseMin = parseInt(parts[0], 10); state.baseMax = parseInt(parts[1], 10);
        state.rMin = state.baseMin; state.rMax = state.baseMax;
        state.adaptMin = state.baseMin; state.adaptMax = state.baseMax;
        rebuildPool();
      };
    }
  };
}

// Toggle switches
$('toggle-tf').onclick = function() {
  state.tfMode = !state.tfMode;
  this.textContent = state.tfMode ? 'Rapid: ON' : 'Rapid: OFF';
  this.style.cssText = state.tfMode ? 'font-size:10px;padding:6px 12px;border-radius:999px;border:1px solid #a78bfa;background:rgba(139,92,246,0.3);color:white;font-weight:bold' : 'font-size:10px;padding:6px 12px;border-radius:999px;border:1px solid #334155;background:rgba(0,0,0,0.2);color:#94a3b8';
};
$('toggle-flash').onclick = function() {
  state.flashMode = !state.flashMode;
  this.textContent = state.flashMode ? 'Flash: ON' : 'Flash: OFF';
  this.style.cssText = state.flashMode ? 'font-size:10px;padding:6px 12px;border-radius:999px;border:1px solid #a78bfa;background:rgba(139,92,246,0.3);color:white;font-weight:bold' : 'font-size:10px;padding:6px 12px;border-radius:999px;border:1px solid #334155;background:rgba(0,0,0,0.2);color:#94a3b8';
};

var dbs = $$('.dur-btn');
for (var i = 0; i < dbs.length; i++) {
  dbs[i].onclick = function() {
    for (var j = 0; j < dbs.length; j++) { dbs[j].style.cssText = 'padding:10px 12px;border-radius:999px;border:1px solid #334155;background:rgba(0,0,0,0.2);color:#94a3b8;font-size:12px;font-weight:bold'; }
    this.style.cssText = 'padding:10px 12px;border-radius:999px;border:1px solid #a78bfa;background:rgba(139,92,246,0.5);color:white;font-size:12px;font-weight:bold';
    state.totalTime = parseInt(this.getAttribute('data-sec'), 10);
    state.timeRemaining = state.totalTime;
    var labels = { 120: '120 seconds', 60: '60 seconds', 30: '30 seconds' };
    var tc = $('tc'); if (tc) tc.textContent = labels[state.totalTime] || '60 seconds';
    hud();
  };
}

var tbs = $$('.theme-btn');
for (var i = 0; i < tbs.length; i++) {
  tbs[i].onclick = function() {
    for (var j = 0; j < tbs.length; j++) { tbs[j].style.cssText = 'border:1px solid #334155;border-radius:999px;width:32px;height:32px'; }
    this.style.cssText = 'border:2px solid #a78bfa;border-radius:999px;width:32px;height:32px';
    var theme = this.getAttribute('data-theme');
    document.body.className = document.body.className.replace(/theme-\w+/g, '').trim() + ' ' + theme;
    try { localStorage.setItem('sifir-theme', theme); } catch (e) {}
  };
}

$('snd').onclick = function() {
  state.soundOn = !state.soundOn;
  try { localStorage.setItem('sifir-sound', state.soundOn); } catch (e) {}
  soundUI();
};

$('rpb').onclick = function() {
  if (confirm('Reset your personal best?')) { pb = { score: 0, streak: 0 }; try { localStorage.setItem('sifir-pb', JSON.stringify(pb)); } catch (e) {} updPbUI(); }
};

$('share').onclick = function() {
  var txt = 'Sifir Sprint Daily - Score: ' + state.score + ', Streak: ' + state.bestStreak;
  if (navigator.share) { try { navigator.share({ title: 'Sifir Sprint', text: txt, url: 'https://sifir-sprint.vercel.app' }); } catch (e) {} }
  else { try { navigator.clipboard.writeText(txt); } catch (e) {} }
};

// Bonus time via rewarded ad
$('bonus-btn').onclick = function() {
  if (typeof onRequestBonusTime === 'function') {
    onRequestBonusTime(function(watched) {
      if (watched) {
        $('bonus-btn').style.display = 'none';
        hud();
      } else {
        $('bonus-btn').style.opacity = '0.5';
        setTimeout(function() { $('bonus-btn').style.opacity = '1'; }, 2000);
      }
    });
  }
};

// Show bonus button if AdMob available
function tryShowBonus() {
  var btn = $('bonus-btn');
  if (btn && typeof AdMob !== 'undefined' && typeof onRequestBonusTime === 'function') {
    btn.style.display = 'flex';
  }
}

$('start-btn').onclick = start;
$('again-btn').onclick = start;

document.onkeydown = function(e) {
  if (e.code === 'Space' && e.target.tagName !== 'BUTTON') { e.preventDefault(); if ($('start').style.display !== 'none') start(); }
};

soundUI();
console.log('Sifir Sprint v2 loaded');

} catch(e) { console.log('Init error:', e); }