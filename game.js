// ==================== STATE ====================
const state = {
  score: 0, streak: 0, bestStreak: 0, timeRemaining: 60, totalTime: 60,
  currentQuestion: null, missedQueue: [], prevQText: null,
  timerId: null, isActive: false, isBusy: false,
  soundOn: true, rMin: 2, rMax: 5,
  correct: 0, wrong: 0, total: 0,
  isBoss: false, phase: 1, frenzy: false, bossAnswered: false,
  daily: false, seed: null
};

let asked = new Set();
let pool1 = [], pool2 = [], pool3 = [];
let activePowerup = null, puTimer = null;
let bossVal = null;

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ==================== HELPERS ====================
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function seededRng(seed) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}
let rng = Math.random;

function rand(min, max) { return Math.floor(rng() * (max - min + 1)) + min; }

function buildPool(min, max) {
  const pool = [], seen = new Set();
  for (let a = min; a <= max; a++) {
    for (let b = min; b <= max; b++) {
      const key = a + 'x' + b;
      if (!seen.has(key)) { seen.add(key); pool.push({ q: a + ' \u00d7 ' + b, a: a * b }); }
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
  const pools = { 1: pool1, 2: pool2, 3: pool3 };
  let p = pools[phase] || pool1;
  if (p.length === 0) {
    const r = { 1: [2, 5], 2: [4, 9], 3: [7, 12] };
    const [mn, mx] = r[phase] || [2, 5];
    p = shuffle(buildPool(mn, mx));
    if (phase === 1) pool1 = p; else if (phase === 2) pool2 = p; else pool3 = p;
  }
  for (let i = 0; i < p.length; i++) {
    const key = p[i].q;
    if (!asked.has(key)) { asked.add(key); return p.splice(i, 1)[0]; }
  }
  asked.clear();
  if (p.length > 0) { asked.add(p[0].q); return p.splice(0, 1)[0]; }
  const a = rand(state.rMin, state.rMax), b = rand(state.rMin, state.rMax);
  return { q: a + ' \u00d7 ' + b, a: a * b };
}

// ==================== SOUND ====================
let actx = null;
function ctx() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); return actx; }
function tone(f, d, t) {
  if (!state.soundOn) return;
  try { const c = ctx(), o = c.createOscillator(), g = c.createGain(); o.type = t || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.15, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(c.currentTime); o.stop(c.currentTime + d); } catch (_) {}
}
function sndCorrect() { tone(523, 0.15); setTimeout(() => tone(659, 0.15), 80); setTimeout(() => tone(784, 0.2), 160); }
function sndWrong() { tone(200, 0.25, 'sawtooth'); setTimeout(() => tone(150, 0.3, 'sawtooth'), 120); }
function sndTick() { tone(880, 0.05, 'square'); }
function sndEnd() { tone(440, 0.2); setTimeout(() => tone(350, 0.2), 200); setTimeout(() => tone(260, 0.4), 400); }
function sndBoss() { tone(330, 0.2, 'sawtooth'); setTimeout(() => tone(440, 0.2, 'sawtooth'), 150); setTimeout(() => tone(550, 0.3, 'sawtooth'), 300); }
function sndPU() { tone(880, 0.1); setTimeout(() => tone(1100, 0.15), 80); }

// ==================== PERSISTENCE ====================
let pb = { score: 0, streak: 0 };
try { const s = localStorage.getItem('sifir-pb'); if (s) pb = JSON.parse(s); } catch (_) {}
try { const s = localStorage.getItem('sifir-sound'); if (s === 'false') state.soundOn = false; } catch (_) {}
try { const t = localStorage.getItem('sifir-theme'); if (t) { document.body.className = document.body.className.replace(/theme-\w+/g, '').trim() + ' ' + t; } } catch (_) {}

function updPb() {
  $('pb-score').textContent = pb.score + ' correct';
  $('pb-streak').textContent = pb.streak + ' streak';
  $('pb-motive').textContent = pb.score > 0 ? 'Can you beat your top score today? 🔥' : 'First sprint? Let\'s go! 🚀';
}
updPb();

function savePb(score, streak) {
  if (score > pb.score || (score === pb.score && streak > pb.streak)) {
    pb = { score, streak };
    try { localStorage.setItem('sifir-pb', JSON.stringify(pb)); } catch (_) {}
    return true;
  }
  return false;
}

function soundUI() {
  const on = $('snd-on'), off = $('snd-off');
  if (state.soundOn) { on.classList.remove('hidden'); off.classList.add('hidden'); }
  else { on.classList.add('hidden'); off.classList.remove('hidden'); }
}
soundUI();

// ==================== FLAME ====================
function flame(s) {
  const el = $('flame');
  if (s < 3) { el.textContent = ''; return; }
  el.textContent = ['🔥', '🔥🔥', '🔥🔥🔥', '🔥🔥🔥🔥'][Math.min(3, Math.floor((s - 3) / 2))];
}

// ==================== POWERUPS ====================
function grantPU() {
  if (state.isBoss || !state.isActive) return;
  const types = [{ id: 'freeze', name: '⏸ Freeze', dur: 4000 }, { id: 'double', name: '🟢 2x Pts', dur: 8000 }];
  const t = types[Math.floor(Math.random() * 2)];
  const bar = $('pu-bar');
  const btn = document.createElement('button');
  btn.textContent = t.name; btn.dataset.id = t.id;
  btn.className = 'px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-[11px] font-bold transition-all active:scale-90';
  btn.onclick = () => {
    if (activePowerup) return;
    clearTimeout(puTimer);
    activePowerup = t; sndPU();
    btn.textContent = '✓ Active';
    btn.className = 'px-3 py-1 rounded-full border border-emerald-400 bg-emerald-800/50 text-white text-[11px] font-bold';
    puTimer = setTimeout(() => { activePowerup = null; btn.remove(); }, t.dur);
    setTimeout(() => { for (const c of bar.children) if (c !== btn) c.remove(); }, 200);
  };
  bar.appendChild(btn);
}

function mult() {
  let m = 1 + state.streak * 0.5;
  if (activePowerup && activePowerup.id === 'double') m *= 2;
  if (state.frenzy) m *= 1.5;
  return Math.round(m * 10) / 10;
}

// ==================== PHASE ====================
function getPhase(t, total) {
  const r = (total - t) / total;
  if (r < 0.3) return 1;
  if (r < 0.6) return 2;
  return 3;
}

function updPhase(t, total) {
  const ph = getPhase(t, total);
  if (ph !== state.phase) {
    state.phase = ph;
    asked.clear();
    const labels = ['', 'EASY', 'MEDIUM', 'HARD'], colors = ['', 'text-emerald-400', 'text-amber-400', 'text-red-400'];
    const ranges = ['', { mn: 2, mx: 5 }, { mn: 4, mx: 9 }, { mn: 7, mx: 12 }];
    const el = $('phase');
    el.textContent = 'PHASE ' + ph + ' \u2022 ' + labels[ph];
    el.className = 'text-center text-[10px] font-bold uppercase tracking-widest ' + colors[ph] + ' mb-1 transition-all';
    if (!state.daily) { state.rMin = ranges[ph].mn; state.rMax = ranges[ph].mx; }
  }
}

// ==================== FRENZY ====================
function updFrenzy(t) {
  const ov = $('frenzy');
  if (t <= 10 && t > 0) { state.frenzy = true; ov.classList.remove('hidden'); }
  else { state.frenzy = false; ov.classList.add('hidden'); }
}

// ==================== BOSS ====================
function bossTrigger() {
  state.isBoss = true; sndBoss();
  const a = rand(12, 20), b = rand(12, 20);
  bossVal = { a: a * b, q: a + ' \u00d7 ' + b };
  $('bq').textContent = bossVal.q;
  const opts = shuffle([bossVal.a, bossVal.a + rand(1, 4) * (Math.random() < 0.5 ? 1 : -1), bossVal.a + rand(1, 4) * (Math.random() < 0.5 ? 1 : -1), bossVal.a + rand(1, 4) * (Math.random() < 0.5 ? 1 : -1)]);
  // Ensure no duplicates and no negatives
  const os = new Set(); opts.forEach(v => { if (v >= 0) os.add(v); });
  while (os.size < 4) { const off = rand(1, 6) * (Math.random() < 0.5 ? 1 : -1); const v = bossVal.a + off; if (v >= 0) os.add(v); }
  const finalOpts = shuffle([...os]);
  $$('.ba').forEach((btn, i) => {
    btn.textContent = finalOpts[i]; btn.dataset.v = finalOpts[i];
    btn.className = 'ba font-sans font-bold text-lg py-4 px-4 min-h-[60px] border-2 border-amber-500/40 rounded-2xl bg-[#1A1A2E] text-white';
    btn.disabled = false;
  });
  $('boss').classList.remove('hidden');
  $('game').classList.add('animate-shake');
  setTimeout(() => $('game').classList.remove('animate-shake'), 300);
}

$$('.ba').forEach(btn => {
  btn.onclick = function() {
    if (state.isBusy || !state.isActive) return;
    state.isBusy = true;
    const sel = parseInt(this.dataset.v, 10);
    const ok = sel === bossVal.a;
    if (ok) { this.classList.add('correct'); sndCorrect(); state.score += 5; state.streak++; state.correct++; if (state.streak > state.bestStreak) state.bestStreak = state.streak; }
    else { this.classList.add('wrong'); sndWrong(); state.streak = 0; state.wrong++; }
    state.total++;
    hud();
    setTimeout(() => {
      $('boss').classList.add('hidden'); state.isBoss = false; state.isBusy = false;
      nextQ();
    }, 400);
  };
});

// ==================== CORE ====================
function nextQ() {
  if (!state.isActive) {
    state.isBusy = false;
    return;
  }
  // If boss battle is showing, wait - don't update buttons
  if (state.isBoss) {
    state.isBusy = false;
    return;
  }
  let q;
  const useMissed = state.missedQueue.length >= 3 && Math.random() < 0.4;
  if (useMissed) {
    q = state.missedQueue.shift();
    if (q.q === state.prevQText) { state.missedQueue.push(q); q = state.missedQueue.shift(); }
  } else {
    let att = 0;
    do { q = draw(state.phase); att++; } while (q.q === state.prevQText && att < 50);
  }
  state.currentQuestion = q;
  state.prevQText = q.q;
  $('qt').textContent = q.q;
  const opts = shuffle([q.a, q.a + rand(1, 4) * (Math.random() < 0.5 ? 1 : -1), q.a + rand(1, 4) * (Math.random() < 0.5 ? 1 : -1), q.a + rand(1, 4) * (Math.random() < 0.5 ? 1 : -1)]);
  const os = new Set(); opts.forEach(v => { if (v >= 0) os.add(v); });
  while (os.size < 4) { const off = rand(1, 6) * (Math.random() < 0.5 ? 1 : -1); const v = q.a + off; if (v >= 0) os.add(v); }
  const finalOpts = shuffle([...os]);
  $$('.ab').forEach((btn, i) => {
    btn.textContent = finalOpts[i]; btn.dataset.v = finalOpts[i];
    btn.className = 'ab font-sans font-bold text-lg sm:text-xl py-5 px-4 min-h-[68px] border-2 border-purple-500/20 rounded-2xl bg-[#0F1528] text-white';
    btn.disabled = false;
  });
  state.isBusy = false;
}

function afterAnswer() {
  state.total++; hud();
  setTimeout(function() {
    state.isBusy = false;
    nextQ();
  }, 300);
}

$$('.ab').forEach(function(btn) {
  btn.onclick = function() {
    if (state.isBusy || !state.isActive || btn.disabled) return;
    state.isBusy = true;
    btn.disabled = true;
    var sel = parseInt(this.dataset.v, 10);
    var q = state.currentQuestion;
    if (!q) { state.isBusy = false; return; }
    var ok = sel === q.a;
    if (ok) {
      this.className = 'ab font-sans font-bold text-lg sm:text-xl py-5 px-4 min-h-[68px] border-2 border-purple-500/20 rounded-2xl bg-[#0F1528] text-white correct';
      sndCorrect();
      state.score += Math.round(mult()); state.streak++; state.correct++;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      if (state.streak >= 3) {
        var pop = $('combo');
        pop.textContent = 'x' + mult();
        pop.classList.remove('hidden', 'animate-combo-pop');
        void pop.offsetWidth;
        pop.classList.add('animate-combo-pop');
        setTimeout(function() { pop.classList.add('hidden'); }, 600);
      }
      flame(state.streak);
      if (state.correct > 0 && state.correct % 7 === 0) { try { grantPU(); } catch(_) {} }
      if (state.correct > 0 && state.correct % 10 === 0) { setTimeout(function() { try { bossTrigger(); } catch(_) {} }, 300); }
    } else {
      this.className = 'ab font-sans font-bold text-lg sm:text-xl py-5 px-4 min-h-[68px] border-2 border-purple-500/20 rounded-2xl bg-[#0F1528] text-white wrong';
      sndWrong();
      state.streak = 0; state.wrong++;
      flame(0);
      state.missedQueue.push({ q: q.q, a: q.a });
    }
    afterAnswer();
  };
});

function hud() {
  $('score').textContent = state.score;
  $('streak').textContent = state.streak;
  $('bstreak').textContent = state.bestStreak;
  $('timer').textContent = state.timeRemaining;
  $('timer').className = state.timeRemaining <= 10 ? 'block text-xl font-extrabold warning' : 'block text-xl font-extrabold text-[#fbbf24]';
  const r = state.timeRemaining / state.totalTime;
  $('tbar').style.width = (r * 100) + '%';
  $('tbar').style.background = r <= 1 / 6 ? 'linear-gradient(90deg,#ef4444,#dc2626)' : r <= 0.5 ? 'linear-gradient(90deg,#f59e0b,#f97316)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)';
  updPhase(state.timeRemaining, state.totalTime);
  updFrenzy(state.timeRemaining);
}

function tick() {
  state.timerId = setInterval(() => {
    state.timeRemaining--;
    if (state.timeRemaining <= 10 && state.timeRemaining > 0) sndTick();
    hud();
    if (state.timeRemaining <= 0) end();
  }, 1000);
}

function grade(sc, total) {
  const r = sc / (total * 2);
  if (r >= 0.8) return { g: 'S', c: 'text-amber-400' };
  if (r >= 0.6) return { g: 'A', c: 'text-emerald-400' };
  if (r >= 0.4) return { g: 'B', c: 'text-blue-400' };
  if (r >= 0.2) return { g: 'C', c: 'text-purple-400' };
  return { g: 'D', c: 'text-slate-400' };
}

function end() {
  state.isActive = false;
  clearInterval(state.timerId); state.timerId = null;
  $('frenzy').classList.add('hidden');
  sndEnd();
  const npb = savePb(state.score, state.bestStreak);
  updPb();
  $('game').style.display = 'none';
  $('end').style.display = 'flex';
  $('fs').textContent = state.score;
  $('fst').textContent = state.bestStreak;
  $('fc').textContent = state.correct;
  $('fw').textContent = state.wrong;
  $('fa').textContent = state.total > 0 ? Math.round(state.correct / state.total * 100) + '%' : '0%';
  $('pb-badge').style.display = npb ? 'flex' : 'none';
  const g = grade(state.score, state.totalTime);
  const ge = $('grade');
  ge.textContent = g.g;
  ge.className = 'text-5xl font-extrabold mb-3 ' + g.c + ' animate-combo-pop';
  const sh = $('share');
  if (state.daily) { sh.classList.remove('hidden'); sh.classList.add('flex'); }
  else { sh.classList.add('hidden'); sh.classList.remove('flex'); }
}

function reset() {
  state.score = 0; state.streak = 0; state.bestStreak = 0;
  state.timeRemaining = state.totalTime;
  state.currentQuestion = null; state.missedQueue = []; state.prevQText = null;
  state.isActive = false; state.isBusy = false;
  state.correct = 0; state.wrong = 0; state.total = 0;
  state.isBoss = false; state.phase = 1; state.frenzy = false;
  activePowerup = null;
  if (puTimer) { clearTimeout(puTimer); puTimer = null; }
  $('pu-bar').innerHTML = '';
  flame(0);
  asked.clear();
  if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
  hud();
}

function start() {
  reset();
  if (state.daily) {
    const d = new Date();
    state.seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    rng = seededRng(state.seed);
  } else { rng = Math.random; }
  if (!state.daily) { state.rMin = 2; state.rMax = 5; }
  $('start').style.display = 'none';
  $('end').style.display = 'none';
  $('game').style.display = 'flex';
  state.isActive = true;
  nextQ();
  tick();
}

// ==================== UI WIRING ====================
function setMode(m) {
  state.daily = m === 'daily';
  const arc = $('mode-a'), daily = $('mode-d');
  [arc, daily].forEach(b => {
    b.classList.remove('border-purple-400', 'bg-purple-950/80', 'text-white');
    b.classList.add('border-slate-700/80', 'bg-slate-900/40', 'text-slate-300');
  });
  const a = m === 'daily' ? daily : arc;
  a.classList.remove('border-slate-700/80', 'bg-slate-900/40', 'text-slate-300');
  a.classList.add('border-purple-400', 'bg-purple-950/80', 'text-white');
  $('mode-lbl').textContent = m === 'daily' ? 'Daily Challenge' : 'Arcade Mode';
}
$('mode-a').onclick = () => setMode('arcade');
$('mode-d').onclick = () => setMode('daily');

$$('.range-btn').forEach(btn => {
  btn.onclick = () => {
    $$('.range-btn').forEach(b => {
      b.classList.remove('border-purple-400', 'bg-purple-950/80', 'text-white');
      b.classList.add('border-slate-700/80', 'bg-slate-900/40', 'text-slate-300');
    });
    btn.classList.remove('border-slate-700/80', 'bg-slate-900/40', 'text-slate-300');
    btn.classList.add('border-purple-400', 'bg-purple-950/80', 'text-white');
    const [mn, mx] = btn.dataset.r.split(',').map(Number);
    state.rMin = mn; state.rMax = mx;
  };
});

$$('.dur-btn').forEach(btn => {
  btn.onclick = () => {
    $$('.dur-btn').forEach(b => {
      b.classList.remove('selected', 'border-purple-400', 'bg-purple-950/80', 'text-white');
      b.classList.add('border-slate-700/80', 'bg-slate-900/40', 'text-slate-300');
    });
    btn.classList.remove('border-slate-700/80', 'bg-slate-900/40', 'text-slate-300');
    btn.classList.add('selected', 'border-purple-400', 'bg-purple-950/80', 'text-white');
    state.totalTime = parseInt(btn.dataset.sec, 10);
    state.timeRemaining = state.totalTime;
    const labels = { 120: '120 seconds', 60: '60 seconds', 30: '30 seconds' };
    $('tc').textContent = labels[state.totalTime] || '60 seconds';
    hud();
  };
});

$$('.theme-btn').forEach(btn => {
  btn.onclick = () => {
    $$('.theme-btn').forEach(b => {
      b.className = b.className.replace(/border-[\w-]+(\s+shadow-\[?[^\]]*\]?)?/g, 'border border-slate-700/80');
    });
    btn.className = btn.className.replace(/border-[\w/-]+/g, 'border-2 border-purple-400');
    const t = btn.dataset.theme;
    document.body.className = document.body.className.replace(/theme-\w+/g, '').trim() + ' ' + t;
    try { localStorage.setItem('sifir-theme', t); } catch (_) {}
  };
});

$('snd').onclick = () => {
  state.soundOn = !state.soundOn;
  try { localStorage.setItem('sifir-sound', state.soundOn); } catch (_) {}
  soundUI();
};

$('rpb').onclick = () => {
  if (confirm('Reset your personal best?')) { pb = { score: 0, streak: 0 }; try { localStorage.setItem('sifir-pb', JSON.stringify(pb)); } catch (_) {} updPb(); }
};

$('share').onclick = () => {
  const txt = 'Sifir Sprint Daily - Score: ' + state.score + ', Streak: ' + state.bestStreak;
  if (navigator.share) { navigator.share({ title: 'Sifir Sprint', text: txt, url: 'https://sifir-sprint.vercel.app' }); }
  else { navigator.clipboard.writeText(txt); }
};

$('start-btn').onclick = start;
$('again-btn').onclick = start;

document.onkeydown = (e) => {
  if (e.code === 'Space' && e.target.tagName !== 'BUTTON' && $('start').style.display !== 'none') { e.preventDefault(); start(); }
};