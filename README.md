# Sifir Sprint ⏱️

A 60-second times-tables arcade quiz game. Mobile-first, zero backend, single-page static site — wrapped for Android with Capacitor.

## 🎮 How to Play

1. Choose a timer duration: **30s / 1 min / 2 min**
2. Answer as many multiplication questions (2×2 through 12×12) as possible before time runs out
3. Wrong answers get **queued and resurface** within the same round — spaced repetition mechanics
4. Beat your personal best (saved in your browser's `localStorage`)

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | Tailwind CSS (CDN) |
| Fonts | Plus Jakarta Sans + JetBrains Mono (Google Fonts) |
| Sound | Web Audio API (zero files) |
| Persistence | `localStorage` (personal best) |
| Android Shell | Capacitor 8 |
| Web Deploy | Vercel → [sifir-sprint.vercel.app](https://sifir-sprint.vercel.app) |

## 📁 Project Structure

```
├── index.html              ← The full web app (HTML + CSS + JS)
├── dist/                   ← Web assets copied for Android build
├── android/                ← Native Android project (Capacitor)
├── package.json            ← Node scripts for building
├── capacitor.config.json   ← Capacitor configuration
├── vercel.json             ← Vercel static deploy config
├── README.md
└── .gitignore
```

## 🚀 Local Web Dev

Just open `index.html` in any browser — no build step, no installs.

```bash
open index.html
```

## 📱 Build for Android (APK/AAB)

Prerequisites: [Android Studio](https://developer.android.com/studio) and JDK 17+.

```bash
# 1. Install dependencies
npm install

# 2. Sync web assets to Android project
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. In Android Studio: Build → Build Bundle(s) / APK(s)
```

The generated APK/AAB will be in `android/app/build/outputs/`.

### Splash Screen
The app has a dark splash screen (#070A14) that shows for 1.5s on launch.

## 🌐 Web Deploy

Connected to Vercel via GitHub. Pushing to `main` auto-deploys.

## 📲 Google Play Release Checklist

Before submitting to Google Play Console:

1. Generate a signed APK/AAB in Android Studio
2. Create app icon (at least 512×512px) in `android/app/src/main/res/`
3. Fill out store listing in Google Play Console
4. Upload the AAB, complete content rating questionnaire
5. Set up pricing & distribution (free)

## 🧪 Testing

Play it right now on the web: [https://sifir-sprint.vercel.app](https://sifir-sprint.vercel.app)