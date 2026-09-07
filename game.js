var state = {
  score: 0, streak: 0, bestStreak: 0, timeRemaining: 60, totalTime: 60,
  current: null, missed: [], prev: null,
  timerId: null, active: false, busy: false,
  soundOn: true, rMin: 2, rMax: 5,
  ok: 0, bad: 0, total: 0,
  isBoss: false, phase: 1, frenzy: false,
  daily: false, seed: null
};

var asked = {};
var pool1 = [], pool2 = [], pool3 = [];
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

function initPools() {
  pool1 = shuffle(buildPool(2, 5));
  pool2 = shuffle(buildPool(4, 9));
  pool3 = shuffle(buildPool(7, 12));
}
initPools();

function draw(phase) {
  var pools = { 1: pool1, 2: pool2, 3: pool3 };
  var p = pools[phase] || pool1;
  if (p.length === 0) {
    var r = { 1: [2, 5], 2: [4, 9], 3: [7, 12] };
    var mn = r[phase][0], mx = r[phase][1];
    p = shuffle(buildPool(mn, mx));
    if (phase === 1) pool1 = p; else if (phase === 2) pool2 = p; else pool3 = p;
  }
  for (var i = 0; i < p.length; i++) {
    var key = p[i].q;
    if (!asked[key]) { asked[key] = true; return p.splice(i, 1)[0]; }
  }
  asked = {};
  if (p.length > 0) { asked[p[0].q] = true; return p.splice(0, 1)[0]; }
  var a = rand(state.rMin, state.rMax), b = rand(state.rMin, state.rMax);
  return { q: a + ' x ' + b, a: a * b };
}

// Sound
var actx = null;
function ctx() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); return actx; }
function tone(f, d, t) {
  if (!state.soundOn) return;
  try { var c = ctx(), o = c.createOscillator(), g = c.createGain(); o.type = t || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.15, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(c.currentTime); o.stop(c.currentTime + d); } catch (e) {}
}
function sc() { tone(523, 0.15); setTimeout(function() { tone(659, 0.15); }, 80); setTimeout(function() { tone(784, 0.2); }, 160); }
function sw() { tone(200, 0.25, 'sawtooth'); setTimeout(function() { tone(150, 0.3, 'sawtooth'); }, 120); }
function st() { tone(880, 0.05, 'square'); }
function se() { tone(440, 0.2); setTimeout(function() { tone(350, 0.2); }, 200); setTimeout(function() { tone(260, 0.4); }, 400); }
function sb() { tone(330, 0.2, 'sawtooth'); setTimeout(function() { tone(440, 0.2, 'sawtooth'); }, 150); setTimeout(function() { tone(550, 0.3, 'sawtooth'); }, 300); }
function sp() { tone(880, 0.1); setTimeout(function() { tone(1100, 0.15); }, 80); }

// Persistence
var pb = { score: 0, streak: 0 };
try { var s = localStorage.getItem('sifir-pb'); if (s) pb = JSON.parse(s); } catch (e) {}
try { var s = localStorage.getItem('sifir-sound'); if (s === 'false') state.soundOn = false; } catch (e) {}
try { var t = localStorage.getItem('sifir-theme'); if (t) { document.body.className = document.body.className.replace(/theme-\w+/g, '').trim() + ' ' + t; } } catch (e) {}

function updPbUI() {
  $('pb-score').textContent = pb.score + ' correct';
  $('pb-streak').textContent = pb.streak + ' streak';
  $('pb-motive').textContent = pb.score > 0 ? 'Can you beat your top score?' : 'First sprint? Let\'s go!';
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
  $('snd-on').classList.toggle('hidden', !state.soundOn);
  $('snd-off').classList.toggle('hidden', state.soundOn);
}
soundUI();

function flame(s) {
  var el = $('flame');
  if (s < 3) { el.textContent = ''; return; }
  el.textContent = ['x', 'xx', 'xxx', 'xxxx'][Math.min(3, Math.floor((s - 3) / 2))];
}

function grantPU() {
  if (state.isBoss || !state.active) return;
  var types = [{ id: 'freeze', name: 'Freeze', dur: 4000 }, { id: 'double', name: '2x Pts', dur: 8000 }];
  var t = types[Math.floor(Math.random() * 2)];
  var bar = $('pu-bar');
  var btn = document.createElement('button');
  btn.textContent = t.name;
  btn.style.cssText = 'padding:4px 12px;border-radius:999px;border:1px solid rgba(52,211,153,0.4);background:rgba(6,78,59,0.3);color:#6ee7b7;font-size:11px;font-weight:bold';
  btn.onclick = function() {
    if (activePU) return;
    clearTimeout(puTimer);
    activePU = t; sp();
    btn.textContent = 'Active';
    btn.style.cssText = 'padding:4px 12px;border-radius:999px;border:1px solid #34d399;background:rgba(6,78,59,0.5);color:white;font-size:11px;font-weight:bold';
    puTimer = setTimeout(function() { activePU = null; btn.remove(); }, t.dur);
    setTimeout(function() { var c = bar.children; for (var i = 0; i < c.length; i++) { if (c[i] !== btn) c[i].remove(); } }, 200);
  };
  bar.appendChild(btn);
}

function mult() {
  var m = 1 + state.streak * 0.5;
  if (activePU && activePU.id === 'double') m *= 2;
  if (state.frenzy) m *= 1.5;
  return Math.round(m * 10) / 10;
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
    asked = {};
    var colors = ['', 'text-green-400', 'text-yellow-400', 'text-red-400'];
    var ranges = ['', { mn: 2, mx: 5 }, { mn: 4, mx: 9 }, { mn: 7, mx: 12 }];
    var el = $('phase');
    el.textContent = 'PHASE ' + ph;
    el.className = 'text-center text-xs font-bold uppercase tracking-widest ' + colors[ph] + ' mb-1';
    if (!state.daily) { state.rMin = ranges[ph].mn; state.rMax = ranges[ph].mx; }
  }
}

function updFrenzy(t) {
  if (t <= 10 && t > 0) { state.frenzy = true; $('frenzy').classList.remove('hidden'); }
  else { state.frenzy = false; $('frenzy').classList.add('hidden'); }
}

function bossTrigger() {
  state.isBoss = true; sb();
  var a = rand(12, 20), b = rand(12, 20);
  bossAns = { a: a * b, q: a + ' x ' + b };
  $('bq').textContent = bossAns.q;
  var os = new Set(); os.add(bossAns.a);
  while (os.size < 4) { var off = rand(1, 6) * (Math.random() < 0.5 ? 1 : -1); var v = bossAns.a + off; if (v >= 0) os.add(v); }
  var fa = shuffle(Array.from(os));
  var bas = $$('.ba');
  for (var i = 0; i < bas.length; i++) {
    bas[i].textContent = fa[i];
    bas[i].value = fa[i];
    bas[i].disabled = false;
  }
  $('boss').classList.remove('hidden');
}

// Boss handler
var bas = $$('.ba');
for (var i = 0; i < bas.length; i++) {
  bas[i].onclick = function() {
    if (state.busy || !state.active) return;
    state.busy = true;
    var sel = parseInt(this.value, 10);
    var ok = sel === bossAns.a;
    this.className = ok ? 'ba correct' : 'ba wrong';
    if (ok) { sc(); state.score += 5; state.streak++; state.ok++; if (state.streak > state.bestStreak) state.bestStreak = state.streak; }
    else { sw(); state.streak = 0; state.bad++; }
    state.total++;
    hud();
    var self = this;
    setTimeout(function() {
      $('boss').classList.add('hidden');
      state.isBoss = false;
      state.busy = false;
      self.className = 'ba';
      nextQ();
    }, 400);
  };
}

function nextQ() {
  if (!state.active) { state.busy = false; return; }
  if (state.isBoss) { state.busy = false; return; }
  var q;
  var useMissed = state.missed.length >= 3 && Math.random() < 0.4;
  if (useMissed) {
    q = state.missed.shift();
    if (q.q === state.prev) { state.missed.push(q); q = state.missed.shift(); }
  } else {
    var att = 0;
    do { q = draw(state.phase); att++; } while (q.q === state.prev && att < 50);
  }
  state.current = q;
  state.prev = q.q;
  $('qt').textContent = q.q;
  var os = new Set(); os.add(q.a);
  while (os.size < 4) { var off = rand(1, 6) * (Math.random() < 0.5 ? 1 : -1); var v = q.a + off; if (v >= 0) os.add(v); }
  var fa = shuffle(Array.from(os));
  var abs = $$('.ab');
  for (var i = 0; i < abs.length; i++) {
    abs[i].textContent = fa[i];
    abs[i].value = fa[i];
    abs[i].disabled = false;
    abs[i].className = 'ab';
  }
  state.busy = false;
}

// Answer handler
var abs = $$('.ab');
for (var i = 0; i < abs.length; i++) {
  abs[i].index = i;
  abs[i].onclick = function() {
    if (state.busy || !state.active || this.disabled) return;
    state.busy = true;
    this.disabled = true;
    var sel = parseInt(this.value, 10);
    var q = state.current;
    if (!q) { state.busy = false; return; }
    var ok = sel === q.a;
    if (ok) {
      sc();
      state.score += Math.round(mult());
      state.streak++;
      state.ok++;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      if (state.streak >= 3) {
        var pop = $('combo');
        pop.textContent = 'x' + mult();
        pop.className = 'combo-pop';
        setTimeout(function() { pop.className = 'combo-pop hidden'; }, 600);
      }
      flame(state.streak);
      this.className = 'ab correct';
      if (state.ok > 0 && state.ok % 7 === 0) grantPU();
      if (state.ok > 0 && state.ok % 10 === 0) setTimeout(function() { bossTrigger(); }, 300);
    } else {
      sw();
      state.streak = 0;
      state.bad++;
      flame(0);
      state.missed.push({ q: q.q, a: q.a });
      this.className = 'ab wrong';
    }
    state.total++;
    hud();
    var self = this;
    setTimeout(function() {
      self.className = 'ab';
      nextQ();
    }, 300);
  };
}

function hud() {
  $('score').textContent = state.score + '';
  $('streak').textContent = state.streak + '';
  $('bstreak').textContent = state.bestStreak + '';
  $('timer').textContent = state.timeRemaining + '';
  $('timer').style.color = state.timeRemaining <= 10 ? '#f87171' : '#fbbf24';
  var r = state.timeRemaining / state.totalTime;
  $('tbar').style.width = (r * 100) + '%';
  $('tbar').style.background = r <= 1/6 ? 'linear-gradient(90deg,#ef4444,#dc2626)' : r <= 0.5 ? 'linear-gradient(90deg,#f59e0b,#f97316)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)';
  updPhase(state.timeRemaining, state.totalTime);
  updFrenzy(state.timeRemaining);
}

function tick() {
  state.timerId = setInterval(function() {
    state.timeRemaining--;
    if (state.timeRemaining <= 10 && state.timeRemaining > 0) st();
    hud();
    if (state.timeRemaining <= 0) end();
  }, 1000);
}

function grade(sc, total) {
  if (total <= 0) return { g: '-', c: 'text-slate-400' };
  var r = sc / (total * 2);
  if (r >= 0.8) return { g: 'S', c: 'text-yellow-400' };
  if (r >= 0.6) return { g: 'A', c: 'text-green-400' };
  if (r >= 0.4) return { g: 'B', c: 'text-blue-400' };
  if (r >= 0.2) return { g: 'C', c: 'text-purple-400' };
  return { g: 'D', c: 'text-slate-400' };
}

function end() {
  state.active = false;
  clearInterval(state.timerId);
  state.timerId = null;
  $('frenzy').classList.add('hidden');
  se();
  var npb = savePb(state.score, state.bestStreak);
  updPbUI();
  $('game').style.display = 'none';
  $('end').style.display = 'flex';
  $('fs').textContent = state.score + '';
  $('fst').textContent = state.bestStreak + '';
  $('fc').textContent = state.ok + '';
  $('fw').textContent = state.bad + '';
  $('fa').textContent = state.total > 0 ? Math.round(state.ok / state.total * 100) + '%' : '0%';
  $('pb-badge').style.display = npb ? 'flex' : 'none';
  var g = grade(state.score, state.totalTime);
  $('grade').textContent = g.g;
  $('grade').className = 'text-5xl font-extrabold mb-3 ' + g.c;
  if (state.daily) { $('share').classList.remove('hidden'); $('share').style.display = 'flex'; }
  else { $('share').classList.add('hidden'); }
}

function reset() {
  state.score = 0; state.streak = 0; state.bestStreak = 0;
  state.timeRemaining = state.totalTime;
  state.current = null; state.missed = []; state.prev = null;
  state.active = false; state.busy = false;
  state.ok = 0; state.bad = 0; state.total = 0;
  state.isBoss = false; state.phase = 1; state.frenzy = false;
  activePU = null;
  if (puTimer) { clearTimeout(puTimer); puTimer = null; }
  $('pu-bar').innerHTML = '';
  flame(0);
  asked = {};
  if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
  hud();
}

function start() {
  reset();
  if (state.daily) {
    var d = new Date();
    state.seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    rng = seededRng(state.seed);
  } else { rng = Math.random; }
  if (!state.daily) { state.rMin = 2; state.rMax = 5; }
  $('start').style.display = 'none';
  $('end').style.display = 'none';
  $('game').style.display = 'flex';
  state.active = true;
  nextQ();
  tick();
}

// UI
function setMode(m) {
  state.daily = m === 'daily';
  var arc = $('mode-a'), daily = $('mode-d');
  arc.className = m === 'arcade' ? 'flex-1 py-2 px-3 rounded-full border border-purple-400 bg-purple-950/80 text-white text-xs font-bold' : 'flex-1 py-2 px-3 rounded-full border border-slate-700/80 bg-slate-900/40 text-slate-300 text-xs font-bold';
  daily.className = m === 'daily' ? 'flex-1 py-2 px-3 rounded-full border border-purple-400 bg-purple-950/80 text-white text-xs font-bold' : 'flex-1 py-2 px-3 rounded-full border border-slate-700/80 bg-slate-900/40 text-slate-300 text-xs font-bold';
  $('mode-lbl').textContent = m === 'daily' ? 'Daily Challenge' : 'Arcade Mode';
}
$('mode-a').onclick = function() { setMode('arcade'); };
$('mode-d').onclick = function() { setMode('daily'); };

var rbs = $$('.range-btn');
for (var i = 0; i < rbs.length; i++) {
  rbs[i].onclick = function() {
    for (var j = 0; j < rbs.length; j++) { rbs[j].className = 'range-btn text-xs py-1.5 px-2.5 rounded-lg border border-slate-700/80 bg-slate-900/40 text-slate-300'; }
    this.className = 'range-btn text-xs py-1.5 px-2.5 rounded-lg border border-purple-400 bg-purple-950/80 text-white font-bold';
    var parts = this.getAttribute('data-r').split(',');
    state.rMin = parseInt(parts[0], 10);
    state.rMax = parseInt(parts[1], 10);
  };
}

var dbs = $$('.dur-btn');
for (var i = 0; i < dbs.length; i++) {
  dbs[i].onclick = function() {
    for (var j = 0; j < dbs.length; j++) { dbs[j].className = 'dur-btn px-3 py-2.5 rounded-full border border-slate-700/80 bg-slate-900/40 text-slate-300 text-xs font-bold'; }
    this.className = 'dur-btn selected px-3 py-2.5 rounded-full border border-purple-400 bg-purple-950/80 text-white text-xs font-bold';
    state.totalTime = parseInt(this.getAttribute('data-sec'), 10);
    state.timeRemaining = state.totalTime;
    var labels = { 120: '120 seconds', 60: '60 seconds', 30: '30 seconds' };
    $('tc').textContent = labels[state.totalTime] || '60 seconds';
    hud();
  };
}

var tbs = $$('.theme-btn');
for (var i = 0; i < tbs.length; i++) {
  tbs[i].onclick = function() {
    for (var j = 0; j < tbs.length; j++) { tbs[j].style.borderColor = '#334155'; tbs[j].style.borderWidth = '1px'; }
    this.style.borderColor = '#a78bfa';
    this.style.borderWidth = '2px';
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
  if (navigator.share) { navigator.share({ title: 'Sifir Sprint', text: txt, url: 'https://sifir-sprint.vercel.app' }); }
  else { navigator.clipboard.writeText(txt); }
};

$('start-btn').onclick = start;
$('again-btn').onclick = start;

document.onkeydown = function(e) {
  if (e.code === 'Space' && e.target.tagName !== 'BUTTON' && $('start').style.display !== 'none') { e.preventDefault(); start(); }
};