# Sifir Sprint ⏱️

A 60-second times-tables arcade quiz game. Mobile-first, zero backend, single-page static site — wrapped for Android with Capacitor. Monetized with AdMob banner ads + optional remove-ads in-app purchase.

## 🎮 How to Play

1. Choose a timer duration: **30s / 1 min / 2 min**
2. Answer as many multiplication questions (2×2 through 12×12) as possible before time runs out
3. Wrong answers get **queued and resurface** within the same round — spaced repetition mechanics
4. Beat your personal best (saved in your browser's localStorage)

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | Tailwind CSS (CDN) |
| Fonts | Plus Jakarta Sans + JetBrains Mono (Google Fonts) |
| Sound | Web Audio API (zero files) |
| Persistence | localStorage (personal best + purchase state) |
| Android Shell | Capacitor 8 |
| Ads | Google AdMob (banner) |
| IAP | Google Play Billing (remove ads) |
| Web Deploy | Vercel → sifir-sprint.vercel.app |

## 📁 Project Structure

`
├── index.html              ← Full app: HTML + CSS + JS + AdMob/IAP
├── dist/                   ← Web assets for Android build
├── android/                ← Native Android project (Capacitor)
├── package.json            ← Node build scripts
├── capacitor.config.json   ← Capacitor config (AdMob app ID, splash)
├── vercel.json             ← Vercel static deploy config
├── README.md
└── .gitignore
`

## 🚀 Local Web Dev

`ash
open index.html
`

## 📱 Build for Android

Prerequisites: Android Studio + JDK 17.

`ash
npm install
npx cap sync android
npx cap open android
`

Then in Android Studio: **Build → Build Bundle(s) / APK(s)**

---

## 📲 Google Play Release Guide

### Step 1: Developer Account
- Sign up at https://play.google.com/console/signup
- Pay the one-time  USD registration fee

### Step 2: Generate a Signed Keystore
`ash
keytool -genkey -v -keystore sifir-sprint-keystore.jks \
  -alias sifir-key -keyalg RSA -keysize 2048 -validity 10000
`
Store this file safely. You'll need it for every update.

### Step 3: Create a Signed AAB
In Android Studio:
1. Build → Generate Signed Bundle / APK → Android App Bundle
2. Select your keystore, enter passwords and key alias
3. Choose **release** build variant
4. Output: ndroid/app/release/app-release.aab

### Step 4: Upload to Play Console
1. Create a new app in Google Play Console
2. Fill in app name: "Sifir Sprint"
3. Upload the AAB file
4. Fill out **Store Listing** (description, screenshots, icon, feature graphic)
5. Complete **Content Rating** questionnaire (choose "Education" or "Brain Games")
6. Set **Pricing & Distribution** → Free (or paid, your choice)

### Step 5: Review & Publish
The app goes through Google's review process (usually 1-3 days). Once approved, it goes live.

---

## 💰 Monetization Setup

### AdMob Banner Ads
1. Go to https://admob.google.com and sign in
2. Create a new app → "Add your app manually"
3. Get your **App ID** (format: ca-app-pub-XXXX~YYYY)
4. Create a **Banner ad unit** → get the ad unit ID (ca-app-pub-XXXX/YYYY)
5. Update capacitor.config.json with your App ID
6. Update the banner ad unit ID in index.html (search for ca-app-pub-3940256099942544/6300978111)
7. Run 
px cap sync android to apply changes

> **Note:** The current IDs are Google's test ad IDs. Replace them with your real IDs before publishing.

### Remove Ads IAP (In-App Purchase)
1. In Google Play Console → your app → **Monetize → Products → In-app products**
2. Create a managed product with:
   - Product ID: emove_ads
   - Title: "Remove Ads"
   - Price: your choice (e.g., .99)
3. The button on the start screen already calls this product ID
4. Test with a closed test track before publishing

### Earnings Flow
| Feature | Free User | Paid User |
|---------|-----------|-----------|
| Full game | ✓ | ✓ |
| Banner ads | ✓ | ✗ |
| Remove ads | ✗ | ✓ (one-time purchase) |

---

## 🧪 Testing

Web: https://sifir-sprint.vercel.app
