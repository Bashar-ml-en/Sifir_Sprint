# Sifir Sprint ⏱️

A 60-second times-tables arcade quiz game. Mobile-first, zero backend, single-page static site.

## 🎮 How to Play

1. Choose a timer duration: **30s / 1 min / 2 min**
2. Answer as many multiplication questions (2×2 through 12×12) as possible before time runs out
3. Wrong answers get **queued and resurface** within the same round — spaced repetition mechanics
4. Beat your personal best (saved in your browser)

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | Tailwind CSS (CDN) |
| Fonts | Plus Jakarta Sans + JetBrains Mono (Google Fonts) |
| Sound | Web Audio API (no files) |
| Persistence | `localStorage` (personal best) |
| Deploy | Vercel → [sifir-sprint.vercel.app](https://sifir-sprint.vercel.app) |

## 📁 Structure

```
index.html   ← Everything: HTML, CSS, JS (single file, ~600 lines)
.gitignore
README.md
```

## 🚀 Local Dev

Just open `index.html` in any browser — no build step, no installs.

```bash
open index.html
```

## 🌐 Deploy

Connected to Vercel via GitHub. Pushing to `main` auto-deploys.

```
https://sifir-sprint.vercel.app
```