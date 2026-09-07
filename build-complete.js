var fs = require('fs');
var basePath = 'C:\\Krackedvs-hack';

// ==================== INDEX.HTML ====================
var html = `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Sifir Sprint - Times-Tables Arcade</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'], mono: ['"JetBrains Mono"', 'monospace'] },
          colors: { arcade: { bg: '#070A14', surface: '#0F1528', card: 'rgba(20,28,52,0.72)', purple: '#8B5CF6', purpleGlow: '#A855F7', indigo: '#6366F1', violetGlow: '#7C3AED', textMuted: '#94A3B8', textDim: '#64748B' } },
          animation: { 'float-slow': 'float 7s ease-in-out infinite', 'pulse-glow': 'pulseGlow 2.8s ease-in-out infinite', 'drift-1': 'drift1 14s linear infinite', 'drift-2': 'drift2 18s linear infinite', 'drift-3': 'drift3 12s linear infinite', 'drift-4': 'drift4 16s linear infinite', 'combo-pop': 'comboPop 0.4s ease-out', 'shake': 'shake 0.3s ease', 'frenzy-pulse': 'frenzyPulse 0.4s ease-in-out infinite', 'boss-enter': 'bossEnter 0.5s ease-out', 'flame-burn': 'flameBurn 0.6s ease-in-out infinite', 'flash-pulse': 'flashPulse 0.4s ease-out' },
          keyframes: {
            float: { '0%,100%': { transform: 'translateY(0px) scale(1)' }, '50%': { transform: 'translateY(-6px) scale(1.03)' } },
            pulseGlow: { '0%,100%': { opacity: '0.45' }, '50%': { opacity: '0.8' } },
            drift1: { '0%': { transform: 'translateY(110vh) rotate(0deg)', opacity: '0' }, '10%': { opacity: '0.14' }, '90%': { opacity: '0.14' }, '100%': { transform: 'translateY(-10vh) rotate(35deg)', opacity: '0' } },
            drift2: { '0%': { transform: 'translateY(110vh) rotate(15deg)', opacity: '0' }, '15%': { opacity: '0.12' }, '85%': { opacity: '0.12' }, '100%': { transform: 'translateY(-10vh) rotate(-25deg)', opacity: '0' } },
            drift3: { '0%': { transform: 'translateY(110vh) rotate(-10deg)', opacity: '0' }, '10%': { opacity: '0.15' }, '90%': { opacity: '0.15' }, '100%': { transform: 'translateY(-10vh) rotate(20deg)', opacity: '0' } },
            drift4: { '0%': { transform: 'translateY(110vh) rotate(25deg)', opacity: '0' }, '20%': { opacity: '0.1' }, '80%': { opacity: '0.1' }, '100%': { transform: 'translateY(-10vh) rotate(-40deg)', opacity: '0' } },
            comboPop: { '0%': { transform: 'scale(0.5)', opacity: '0' }, '50%': { transform: 'scale(1.3)', opacity: '1' }, '100%': { transform: 'scale(1)', opacity: '1' } },
            shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } },
            frenzyPulse: { '0%,100%': { opacity: '0.15' }, '50%': { opacity: '0.35' } },
            bossEnter: { '0%': { transform: 'scale(0.3) rotate(-10deg)', opacity: '0' }, '60%': { transform: 'scale(1.15) rotate(3deg)', opacity: '1' }, '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' } },
            flameBurn: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.12)' } },
            flashPulse: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)', opacity: '0' } }
          }
        }
      }
    }
  </script>
  <style>
    @media (prefers-reduced-motion: reduce) { .ambient-element { animation: none !important; } }
    .neon-glow { box-shadow: 0 0 20px -3px rgba(168,85,247,0.45), inset 0 0 12px -2px rgba(139,92,246,0.25); }
    .btn-glow { box-shadow: 0 10px 30px -4px rgba(139,92,246,0.55), 0 0 20px 0px rgba(99,102,241,0.35); }
    .btn-glow:active { transform: scale(0.96); box-shadow: 0 6px 18px -2px rgba(139,92,246,0.6); }
    .glass { background: rgba(18,24,46,0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(168,85,247,0.2); }
    .ab, .ba { transition: background 0.08s, border-color 0.08s, transform 0.08s; background:#0F1528; border:2px solid rgba(139,92,246,0.2); border-radius:16px; color:white; font-size:1.25rem; font-weight:700; padding:20px 16px; line-height:1; min-height:68px; }
    .ab:active:not(:disabled), .ba:active:not(:disabled) { transform: scale(0.95); }
    .ab.correct, .ba.correct { background: #166534 !important; border-color: #22c55e !important; }
    .ab.wrong, .ba.wrong { background: #991b1b !important; border-color: #ef4444 !important; }
    .ab:disabled { opacity:0.6; cursor:default; }
    .tf-btn { transition:all 0.08s; border-radius:50%; width:72px; height:72px; font-size:2rem; display:flex; align-items:center; justify-content:center; border:3px solid; cursor:pointer; }
    .tf-btn:active { transform:scale(0.9); }
    .tf-btn:disabled { opacity:0.5; }
    #tbar { transition: width 0.3s linear, background 0.3s ease; }
    #timer.warning { color: #f87171 !important; animation: pulse 0.5s ease infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    .screen { animation: fadeIn 0.25s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .theme-space { --tp: #8B5CF6; --ts: #A855F7; --ta: #FBBF24; --tb: #070A14; --tbf: #0F1528; }
    .theme-ocean { --tp: #06B6D4; --ts: #0891B2; --ta: #22D3EE; --tb: #042F2E; --tbf: #083344; }
    .theme-neon { --tp: #EC4899; --ts: #F43F5E; --ta: #10B981; --tb: #0A0A0F; --tbf: #1A1A2E; }
    .theme-candy { --tp: #F472B6; --ts: #FB923C; --ta: #34D399; --tb: #1C1917; --tbf: #292524; }
    [class*="theme-"] { background: var(--tb, #070A14); }
    [class*="theme-"] .glass { background: rgba(18,24,46,0.7); }
  </style>
</head>
<body class="theme-space h-full text-white font-sans antialiased select-none flex flex-col justify-between items-center overflow-x-hidden relative min-h-screen">

  <div class="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
    <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-gradient-to-b from-purple-700/25 via-indigo-900/15 to-transparent rounded-full blur-[90px] animate-pulse-glow"></div>
    <div class="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[380px] h-[380px] bg-gradient-to-t from-violet-900/20 via-indigo-950/10 to-transparent rounded-full blur-[80px]"></div>
    <div class="ambient-element absolute left-[12%] text-purple-400/20 text-3xl font-mono font-bold animate-drift-1">7 x 8</div>
    <div class="ambient-element absolute left-[82%] text-indigo-400/20 text-2xl font-mono font-bold animate-drift-2">9 x 6</div>
  </div>

  <div id="frenzy" class="fixed inset-0 pointer-events-none z-20 hidden" style="background:radial-gradient(ellipse at center,transparent 40%,rgba(239,68,68,0.2) 100%);"></div>

  <!-- START -->
  <div id="start" class="screen relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between items-center px-6 py-8 text-center">
    <div class="w-full flex items-center justify-between pt-2">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/25 text-[11px] font-semibold text-purple-300 tracking-wider uppercase">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        <span id="mode-lbl">Arcade Mode</span>
      </div>
      <div class="flex items-center gap-1 text-[12px] font-mono font-semibold text-slate-400"><span class="text-purple-400">&#9889;</span> SPEED QUIZ</div>
    </div>
    <div class="w-full flex flex-col items-center my-auto py-4">
      <div class="relative mb-5 flex items-center justify-center animate-float-slow">
        <div class="absolute w-20 h-20 bg-purple-500/35 rounded-full blur-xl animate-pulse-glow"></div>
        <div class="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-[#231B47] to-[#131733] border border-purple-400/40 p-3.5 flex items-center justify-center">
          <svg class="w-9 h-9 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="5"/><path d="M10 2h4"/><line x1="19.5" y1="5.5" x2="18" y2="7"/><circle cx="12" cy="14" r="8"/><polyline points="12 10 12 14 15 14" stroke="#E9D5FF" stroke-width="2.2"/><circle cx="12" cy="14" r="1.2" fill="#E9D5FF"/></svg>
        </div>
      </div>
      <h1 class="text-4xl sm:text-[42px] font-extrabold tracking-tight text-white mb-2 leading-none">Sifir Sprint</h1>
      <p class="text-[15px] font-medium text-[#94A3B8] max-w-[310px] leading-snug mb-1.5">Answer as many times-tables as you can in <span class="text-purple-300 font-semibold underline decoration-purple-500/40 underline-offset-2" id="tc">60 seconds</span>!</p>
      <p class="text-xs text-[#64748B] max-w-[290px] mb-4">Wrong answers come back around so learn as you go.</p>

      <div class="w-full max-w-[330px] flex gap-2 mb-4">
        <button id="mode-a" class="flex-1 py-2 px-3 rounded-full border border-purple-400 bg-purple-950/80 text-white text-xs font-bold">Arcade</button>
        <button id="mode-d" class="flex-1 py-2 px-3 rounded-full border border-slate-700/80 bg-slate-900/40 text-slate-300 text-xs font-bold">Daily</button>
      </div>

      <div class="w-full max-w-[340px] glass rounded-2xl px-4 py-3 mb-4 flex items-center justify-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-amber-300 shrink-0">
          <svg class="w-4 h-4 fill-amber-400" viewBox="0 0 24 24"><path d="M6 2h12v4.5A5.5 5.5 0 0 1 12.5 12h-1A5.5 5.5 0 0 1 6 6.5V2z"/></svg>
        </div>
        <div class="text-left leading-tight">
          <div class="text-[13px] font-bold text-purple-200"><span>Your best: <span class="text-white font-extrabold text-[14px]" id="pb-score">0</span> <span class="text-amber-300 font-bold" id="pb-streak">0 streak</span></span></div>
          <p class="text-[11px] text-purple-300/80 mt-0.5" id="pb-motive">First sprint? Let's go!</p>
        </div>
      </div>

      <div class="w-full max-w-[340px] mb-3">
        <span class="text-[11px] font-extrabold tracking-[0.16em] uppercase text-[#64748B] block mb-2">Numbers:</span>
        <div id="range-container" class="flex flex-col items-center gap-1.5">
          <div class="flex gap-1.5 justify-center flex-wrap">
            <button class="range-btn text-[11px] py-1.5 px-2.5 rounded-lg border border-purple-400 bg-purple-950/80 text-white font-bold" data-r="1,10">1-10</button>
            <button class="range-btn text-[11px] py-1.5 px-2.5 rounded-lg border border-slate-700/80 bg-slate-900/40 text-slate-300" data-r="10,20">10-20</button>
            <button class="range-btn text-[11px] py-1.5 px-2.5 rounded-lg border border-slate-700/80 bg-slate-900/40 text-slate-300" data-r="20,30">20-30</button>
            <button class="range-btn text-[11px] py-1.5 px-2.5 rounded-lg border border-slate-700/80 bg-slate-900/40 text-slate-300" data-r="30,40">30-40</button>
          </div>
          <div id="more-ranges" class="flex gap-1.5 justify-center flex-wrap" style="display:none;">
            <button class="range-btn text-[11px] py-1.5 px-2.5 rounded-lg border border-slate-700/80 bg-slate-900/40 text-slate-300" data-r="40,50">40-50</button>
            <button class="range-btn text-[11px] py-1.5 px-2.5 rounded-lg border border-slate-700/80 bg-slate-900/40 text-slate-300" data-r="50,60">50-60</button>
            <button class="range-btn text-[11px] py-1.5 px-2.5 rounded-lg border border-slate-700/80 bg-slate-900/40 text-slate-300" data-r="60,70">60-70</button>
            <button class="range-btn text-[11px] py-1.5 px-2.5 rounded-lg border border-slate-700/80 bg-slate-900/40 text-slate-300" data-r="70,80">70-80</button>
            <button class="range-btn text-[11px] py-1.5 px-2.5 rounded-lg border border-slate-700/80 bg-slate-900/40 text-slate-300" data-r="80,90">80-90</button>
            <button class="range-btn text-[11px] py-1.5 px-2.5 rounded-lg border border-slate-700/80 bg-slate-900/40 text-slate-300" data-r="90,100">90-100</button>
          </div>
          <button id="more-ranges-btn" class="text-[10px] text-[#64748B] hover:text-purple-300 transition-colors underline underline-offset-2">+ more ranges</button>
        </div>
      </div>

      <!-- Mode toggles -->
      <div class="w-full max-w-[340px] mb-3 flex gap-2 justify-center flex-wrap">
        <button id="toggle-tf" class="text-[10px] py-1.5 px-3 rounded-full border border-slate-700/80 bg-slate-900/40 text-slate-400 transition-all">Rapid: OFF</button>
        <button id="toggle-flash" class="text-[10px] py-1.5 px-3 rounded-full border border-slate-700/80 bg-slate-900/40 text-slate-400 transition-all">Flash: OFF</button>
      </div>

      <div class="w-full max-w-[330px] flex items-center justify-center gap-2 mb-2.5">
        <span class="text-[11px] font-extrabold tracking-[0.16em] uppercase text-[#64748B]">Timer:</span>
      </div>
      <div class="w-full max-w-[330px] grid grid-cols-3 gap-2.5 mb-4">
        <button class="dur-btn px-3 py-2.5 rounded-full border border-slate-700/80 bg-slate-900/40 text-slate-300 text-xs sm:text-[13px] font-bold" data-sec="120">2 min</button>
        <button class="dur-btn selected px-3 py-2.5 rounded-full border border-purple-400 bg-purple-950/80 text-white text-xs sm:text-[13px] font-bold neon-glow" data-sec="60">1 min</button>
        <button class="dur-btn px-3 py-2.5 rounded-full border border-slate-700/80 bg-slate-900/40 text-slate-300 text-xs sm:text-[13px] font-bold" data-sec="30">30 s</button>
      </div>

      <div class="w-full max-w-[340px] mb-4">
        <span class="text-[11px] font-extrabold tracking-[0.16em] uppercase text-[#64748B] block mb-2">Theme:</span>
        <div class="flex gap-2 justify-center">
          <button class="theme-btn w-8 h-8 rounded-full border-2 border-purple-400" data-theme="theme-space" style="background:linear-gradient(135deg,#8B5CF6,#A855F7);"></button>
          <button class="theme-btn w-8 h-8 rounded-full border border-slate-700/80" data-theme="theme-ocean" style="background:linear-gradient(135deg,#06B6D4,#0891B2);"></button>
          <button class="theme-btn w-8 h-8 rounded-full border border-slate-700/80" data-theme="theme-neon" style="background:linear-gradient(135deg,#EC4899,#F43F5E);"></button>
          <button class="theme-btn w-8 h-8 rounded-full border border-slate-700/80" data-theme="theme-candy" style="background:linear-gradient(135deg,#F472B6,#FB923C);"></button>
        </div>
      </div>

      <div class="w-full max-w-[330px] flex flex-col items-center">
        <button id="start-btn" class="w-full py-4 px-8 rounded-full text-white font-extrabold text-lg tracking-wide btn-glow transition-all flex items-center justify-center gap-2 group cursor-pointer" style="background:linear-gradient(135deg,#8B5CF6,#A855F7);">
          <span>Start Sprint</span>
          <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/></svg>
        </button>
        <span class="text-[11px] text-slate-500 mt-2">Press Space or Tap to Jump In</span>
      </div>
    </div>
    <footer class="w-full flex items-center justify-between pb-2 pt-4 px-2">
      <button id="snd" aria-label="Toggle Sound" class="w-11 h-11 rounded-full border border-slate-700/80 bg-slate-900/50 flex items-center justify-center active:scale-90">
        <svg id="snd-on" class="w-5 h-5 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
        <svg id="snd-off" class="w-5 h-5 text-slate-500 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
      </button>
      <button id="rpb" class="text-[11px] text-slate-500 hover:text-slate-300 underline underline-offset-2">Reset PB</button>
    </footer>
  </div>

  <!-- GAME -->
  <div id="game" class="screen relative z-10 w-full max-w-[430px] min-h-screen flex flex-col px-6 py-8" style="display:none;">
    <div id="pu-bar" class="w-full flex gap-2 mb-2 justify-center min-h-[36px]"></div>
    <div class="w-full flex items-center justify-between gap-2 mb-1">
      <div class="flex gap-2 flex-1">
        <div class="flex-1 bg-[#0F1528]/80 rounded-xl py-2.5 px-2 text-center border border-purple-500/10">
          <span class="block text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Score</span>
          <span class="block text-xl font-extrabold text-white" id="score">0</span>
        </div>
        <div class="flex-1 bg-[#0F1528]/80 rounded-xl py-2.5 px-2 text-center border border-purple-500/10">
          <span class="block text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Combo</span>
          <span class="block text-xl font-extrabold text-amber-300 flex items-center justify-center gap-1" id="streak">0 <span id="flame"></span></span>
        </div>
        <div class="flex-1 bg-[#0F1528]/80 rounded-xl py-2.5 px-2 text-center border border-purple-500/10">
          <span class="block text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Best</span>
          <span class="block text-xl font-extrabold text-purple-300" id="bstreak">0</span>
        </div>
      </div>
      <div class="w-16 bg-[#0F1528]/80 rounded-xl py-2.5 px-2 text-center border border-purple-500/10">
        <span class="block text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Time</span>
        <span class="block text-xl font-extrabold text-[#fbbf24]" id="timer">60</span>
      </div>
    </div>
    <div class="w-full h-1.5 bg-slate-800/60 rounded-full overflow-hidden mb-6">
      <div id="tbar" class="h-full w-full rounded-full" style="background:linear-gradient(90deg,#6366f1,#8b5cf6);"></div>
    </div>
    <div class="flex-1 flex items-center justify-center relative">
      <div id="qt" class="text-[3.2rem] sm:text-[3.8rem] font-extrabold text-white tracking-tight text-center"></div>
      <div id="combo" class="absolute -top-2 right-4 text-amber-400 font-extrabold text-lg animate-combo-pop hidden pointer-events-none" style="z-index:5;"></div>
    </div>
    <div id="phase" class="text-center text-xs font-bold uppercase tracking-widest text-slate-600 mb-1">READY</div>
    <!-- Range indicator -->
    <div id="range-indicator" class="text-center text-[10px] text-slate-500 mb-1"></div>
    <!-- 4 answer buttons -->
    <div id="ab-container" class="w-full grid grid-cols-2 gap-3 mt-auto pb-4">
      <button class="ab font-sans font-bold" data-index="0"></button>
      <button class="ab font-sans font-bold" data-index="1"></button>
      <button class="ab font-sans font-bold" data-index="2"></button>
      <button class="ab font-sans font-bold" data-index="3"></button>
    </div>
    <!-- True/False buttons -->
    <div id="tf-container" class="w-full hidden justify-center gap-6 mt-auto pb-4">
      <button id="tf-true" class="tf-btn" style="background:rgba(34,197,94,0.15);border-color:#22c55e;color:#22c55e;">&#10003;</button>
      <button id="tf-false" class="tf-btn" style="background:rgba(239,68,68,0.15);border-color:#ef4444;color:#ef4444;">&#10007;</button>
    </div>
  </div>

  <!-- BOSS -->
  <div id="boss" class="fixed inset-0 z-30 flex items-center justify-center bg-black/70 hidden" style="backdrop-filter:blur(4px);">
    <div class="text-center">
      <div class="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 mb-2 animate-combo-pop">BOSS BATTLE</div>
      <p id="bq" class="text-5xl sm:text-6xl font-extrabold text-white animate-boss-enter mb-6"></p>
      <div class="grid grid-cols-2 gap-3 max-w-[320px] mx-auto">
        <button class="ba font-sans font-bold text-lg py-4 px-4 min-h-[60px]" data-index="0"></button>
        <button class="ba font-sans font-bold text-lg py-4 px-4 min-h-[60px]" data-index="1"></button>
        <button class="ba font-sans font-bold text-lg py-4 px-4 min-h-[60px]" data-index="2"></button>
        <button class="ba font-sans font-bold text-lg py-4 px-4 min-h-[60px]" data-index="3"></button>
      </div>
    </div>
  </div>

  <!-- END -->
  <div id="end" class="screen relative z-10 w-full max-w-[430px] min-h-screen flex flex-col items-center justify-center px-6 py-10 text-center" style="display:none;">
    <div class="relative mb-4 flex items-center justify-center">
      <div class="absolute w-20 h-20 bg-purple-500/35 rounded-full blur-xl animate-pulse-glow"></div>
      <div class="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-[#231B47] to-[#131733] border border-amber-400/40 p-3.5 flex items-center justify-center">
        <svg class="w-9 h-9 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      </div>
    </div>
    <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-1">Time's Up!</h1>
    <p class="text-[15px] text-[#94A3B8] mb-3">Here's how you performed.</p>
    <div id="grade" class="text-5xl font-extrabold mb-3"></div>
    <div class="w-full max-w-[340px] flex gap-3 mb-4">
      <div class="flex-1 glass rounded-2xl py-5 px-3 text-center"><span class="block text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-1.5">Score</span><span class="block text-3xl sm:text-4xl font-extrabold text-white" id="fs">0</span></div>
      <div class="flex-1 glass rounded-2xl py-5 px-3 text-center"><span class="block text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-1.5">Best Streak</span><span class="block text-3xl sm:text-4xl font-extrabold text-amber-300" id="fst">0</span></div>
    </div>
    <div class="w-full max-w-[340px] glass rounded-2xl px-4 py-3 mb-4">
      <div class="grid grid-cols-3 gap-2 text-center">
        <div><span class="block text-[9px] font-bold uppercase tracking-widest text-[#64748B]">Correct</span><span class="block text-lg font-extrabold text-emerald-400" id="fc">0</span></div>
        <div><span class="block text-[9px] font-bold uppercase tracking-widest text-[#64748B]">Wrong</span><span class="block text-lg font-extrabold text-red-400" id="fw">0</span></div>
        <div><span class="block text-[9px] font-bold uppercase tracking-widest text-[#64748B]">Accuracy</span><span class="block text-lg font-extrabold text-purple-300" id="fa">0%</span></div>
      </div>
    </div>
    <div id="pb-badge" class="w-full max-w-[330px] mb-4" style="display:none;">
      <div class="py-2 px-4 rounded-full bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs font-bold text-center animate-combo-pop flex items-center justify-center gap-2">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span>New Personal Best!</span>
      </div>
    </div>
    <button id="share" class="w-full max-w-[330px] mb-3 py-2.5 px-4 rounded-full border border-purple-500/30 bg-purple-950/20 text-purple-300 text-xs font-bold transition-all hidden items-center justify-center gap-2">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
      <span>Share Score</span>
    </button>
    <button id="again-btn" class="w-full max-w-[330px] py-4 px-8 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white font-extrabold text-lg tracking-wide btn-glow transition-all flex items-center justify-center gap-2 group cursor-pointer" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);">
      <span>Play Again</span>
      <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
    </button>
  </div>

  <script src="game.js"></script>
</body>
</html>`;

fs.writeFileSync(basePath + '\\index.html', html);
console.log('Wrote index.html: ' + html.length + ' bytes');

// ==================== GAME.JS ====================
var js = `try {

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
function sc() { tone(523, 0.15); setTimeout(function() { tone(659, 0.15); }, 80); setTimeout(function() { tone(784, 0.2); }, 160); }
function sw() { tone(200, 0.25, 'sawtooth'); setTimeout(function() { tone(150, 0.3, 'sawtooth'); }, 120); }
function st() { tone(880, 0.05, 'square'); }
function se() { tone(440, 0.2); setTimeout(function() { tone(350, 0.2); }, 200); setTimeout(function() { tone(260, 0.4); }, 400); }
function sb() { tone(330, 0.2, 'sawtooth'); setTimeout(function() { tone(440, 0.2, 'sawtooth'); }, 150); setTimeout(function() { tone(550, 0.3, 'sawtooth'); }, 300); }
function sp() { tone(880, 0.1); setTimeout(function() { tone(1100, 0.15); }, 80); }
function spuzzle() { tone(660, 0.1, 'triangle'); setTimeout(function() { tone(880, 0.15, 'triangle'); }, 100); }

var pb = { score: 0, streak: 0 };
try { var s = localStorage.getItem('sifir-pb'); if (s) pb = JSON.parse(s); } catch (e) {}
try { var s = localStorage.getItem('sifir-sound'); if (s === 'false') state.soundOn = false; } catch (e) {}
try { var t = localStorage.getItem('sifir-theme'); if (t) { document.body.className = document.body.className.replace(/theme-\\\w+/g, '').trim() + ' ' + t; } } catch (e) {}

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
    document.body.className = document.body.className.replace(/theme-\\\w+/g, '').trim() + ' ' + theme;
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
console.log('Sifir Sprint v2 loaded');

} catch(e) { console.log('Init error:', e); }`;

fs.writeFileSync(basePath + '\\game.js', js);
console.log('Wrote game.js: ' + js.length + ' bytes');
console.log('All files written successfully');