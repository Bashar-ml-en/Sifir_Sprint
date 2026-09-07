try {

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

var actx = null;
function ctx() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); return actx; }
function tone(f, d, t) {
  if (!state.soundOn) return;
  try { var c = ctx(), o = c.createOscillator(), g = c.createGain(); o.type = t || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.15, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(c.currentTime); o.stop(c.currentTime + d); } catch (e) { console.log('tone error', e); }
}
function sc() { tone(523, 0.15); setTimeout(function() { tone(659, 0.15); }, 80); setTimeout(function() { tone(784, 0.2); }, 160); }
function sw() { tone(200, 0.25, 'sawtooth'); setTimeout(function() { tone(150, 0.3, 'sawtooth'); }, 120); }
function st() { tone(880, 0.05, 'square'); }
function se() { tone(440, 0.2); setTimeout(function() { tone(350, 0.2); }, 200); setTimeout(function() { tone(260, 0.4); }, 400); }
function sb() { tone(330, 0.2, 'sawtooth'); setTimeout(function() { tone(440, 0.2, 'sawtooth'); }, 150); setTimeout(function() { tone(550, 0.3, 'sawtooth'); }, 300); }
function sp() { tone(880, 0.1); setTimeout(function() { tone(1100, 0.15); }, 80); }

var pb = { score: 0, streak: 0 };
try { var s = localStorage.getItem('sifir-pb'); if (s) pb = JSON.parse(s); } catch (e) {}
try { var s = localStorage.getItem('sifir-sound'); if (s === 'false') state.soundOn = false; } catch (e) {}
try { var t = localStorage.getItem('sifir-theme'); if (t) { document.body.className = document.body.className.replace(/theme-\w+/g, '').trim() + ' ' + t; } } catch (e) {}

function updPbUI() {
  var el = $('pb-score'); if (el) el.textContent = pb.score + ' correct';
  el = $('pb-streak'); if (el) el.textContent = pb.streak + ' streak';
  el = $('pb-motive'); if (el) el.textContent = pb.score > 0 ? 'Can you beat your top score?' : 'First sprint?\'s go!';
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
    asked = {};
    var el = $('phase');
    if (el) { el.textContent = 'PHASE ' + ph; el.style.color = ['', '#22c55e', '#f59e0b', '#ef4444'][ph]; }
    if (!state.daily) { var ranges = ['', { mn: 2, mx: 5 }, { mn: 4, mx: 9 }, { mn: 7, mx: 12 }]; state.rMin = ranges[ph].mn; state.rMax = ranges[ph].mx; }
  }
}

function updFrenzy(t) {
  var ov = $('frenzy');
  if (t <= 10 && t > 0) { state.frenzy = true; if (ov) ov.style.display = ''; }
  else { state.frenzy = false; if (ov) ov.style.display = 'none'; }
}

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
  var qt = $('qt'); if (qt) qt.textContent = q.q;
  var os = new Set(); os.add(q.a);
  while (os.size < 4) { var off = rand(1, 6) * (Math.random() < 0.5 ? 1 : -1); var v = q.a + off; if (v >= 0) os.add(v); }
  var fa = shuffle(Array.from(os));
  var abs = $$('.ab');
  for (var i = 0; i < abs.length; i++) {
    abs[i].innerHTML = fa[i] + '';
    abs[i].setAttribute('dv', fa[i] + '');
    abs[i].disabled = false;
    abs[i].className = 'ab';
  }
  state.busy = false;
}

var abs = $$('.ab');
for (var i = 0; i < abs.length; i++) {
  abs[i].onclick = function() {
    try {
      if (state.busy || !state.active) return;
      state.busy = true;
      var v = this.getAttribute('dv');
      if (!v) { state.busy = false; return; }
      var sel = parseInt(v, 10);
      if (isNaN(sel)) { state.busy = false; return; }
      var q = state.current;
      if (!q) { state.busy = false; return; }
      var ok = sel === q.a;
      if (ok) {
        sc();
        state.score += Math.round(1 + state.streak * 0.5);
        state.streak++;
        state.ok++;
        if (state.streak > state.bestStreak) state.bestStreak = state.streak;
        this.className = 'ab correct';
        if (state.streak >= 3) {
          var pop = $('combo');
          if (pop) { pop.textContent = 'x' + Math.round((1 + state.streak * 0.5) * 10) / 10; pop.style.display = ''; setTimeout(function() { pop.style.display = 'none'; }, 600); }
        }
        flame(state.streak);
      } else {
        sw();
        state.streak = 0;
        state.bad++;
        this.className = 'ab wrong';
        flame(0);
        state.missed.push({ q: q.q, a: q.a });
      }
      state.total++;
      hud();
      var self = this;
      setTimeout(function() { self.className = 'ab'; nextQ(); }, 300);
    } catch (e) { console.log('click err', e); state.busy = false; }
  };
}

function bossTrigger() {
  state.isBoss = true; sb();
  var a = rand(12, 20), b = rand(12, 20);
  bossAns = { a: a * b, q: a + ' x ' + b };
  var bq = $('bq'); if (bq) bq.textContent = bossAns.q;
  var os = new Set(); os.add(bossAns.a);
  while (os.size < 4) { var off = rand(1, 6) * (Math.random() < 0.5 ? 1 : -1); var v = bossAns.a + off; if (v >= 0) os.add(v); }
  var fa = shuffle(Array.from(os));
  var bas = $$('.ba');
  for (var i = 0; i < bas.length; i++) {
    bas[i].innerHTML = fa[i] + '';
    bas[i].setAttribute('dv', fa[i] + '');
    bas[i].disabled = false;
  }
  var boss = $('boss'); if (boss) boss.style.display = '';
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
        var boss = $('boss'); if (boss) boss.style.display = 'none';
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
  if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
  var ov = $('frenzy'); if (ov) ov.style.display = 'none';
  se();
  var npb = savePb(state.score, state.bestStreak);
  updPbUI();
  var g = $('game'); if (g) g.style.display = 'none';
  var e = $('end'); if (e) e.style.display = 'flex';
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
}

function reset() {
  state.score = 0; state.streak = 0; state.bestStreak = 0;
  state.timeRemaining = state.totalTime;
  state.current = null; state.missed = []; state.prev = null;
  state.active = false; state.busy = false;
  state.ok = 0; state.bad = 0; state.total = 0;
  state.isBoss = false; state.phase = 1; state.frenzy = false;
  activePU = null;
  if (puTimer) { clearInterval(puTimer); puTimer = null; }
  var pu = $('pu-bar'); if (pu) pu.innerHTML = '';
  flame(0); asked = {};
  if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
  hud();
}

function start() {
  reset();
  if (state.daily) { var d = new Date(); state.seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); rng = seededRng(state.seed); }
  else { rng = Math.random; }
  if (!state.daily) { state.rMin = 2; state.rMax = 5; }
  var startEl = $('start'); if (startEl) startEl.style.display = 'none';
  var endEl = $('end'); if (endEl) endEl.style.display = 'none';
  var game = $('game'); if (game) game.style.display = 'flex';
  state.active = true;
  nextQ();
  tick();
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
    state.rMin = parseInt(parts[0], 10);
    state.rMax = parseInt(parts[1], 10);
  };
}

// More ranges toggle
var moreBtn = $('more-ranges-btn');
var moreRanges = $('more-ranges');
if (moreBtn && moreRanges) {
  moreBtn.onclick = function() {
    var hidden = moreRanges.style.display === 'none' || moreRanges.style.display === '';
    moreRanges.style.display = hidden ? 'flex' : 'none';
    moreBtn.textContent = hidden ? '- less ranges' : '+ more ranges';
    // Re-bind onclick for newly visible range buttons
    var extras = moreRanges.querySelectorAll('.range-btn');
    for (var k = 0; k < extras.length; k++) {
      extras[k].onclick = function() {
        var all = $$('.range-btn');
        for (var x = 0; x < all.length; x++) { all[x].style.cssText = 'font-size:12px;padding:6px 10px;border-radius:8px;border:1px solid #334155;background:rgba(0,0,0,0.2);color:#94a3b8'; }
        this.style.cssText = 'font-size:12px;padding:6px 10px;border-radius:8px;border:1px solid #a78bfa;background:rgba(139,92,246,0.5);color:white;font-weight:bold';
        var parts = this.getAttribute('data-r').split(',');
        state.rMin = parseInt(parts[0], 10);
        state.rMax = parseInt(parts[1], 10);
      };
    }
  };
}

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

$('start-btn').onclick = start;
$('again-btn').onclick = start;

document.onkeydown = function(e) {
  if (e.code === 'Space' && e.target.tagName !== 'BUTTON') { e.preventDefault(); if ($('start').style.display !== 'none') start(); }
};

soundUI();
console.log('Sifir Sprint loaded OK');

} catch(e) { console.log('Sifir Sprint init error:', e); }