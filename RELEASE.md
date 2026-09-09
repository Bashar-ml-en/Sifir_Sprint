# Sifir Sprint — Android Release Guide

## Prerequisites

| Item | Required |
|------|----------|
| Computer | Windows, macOS, or Linux |
| IDE | Android Studio (latest) |
| SDK | JDK 17+ |
| Account | Google Play Developer ($25 one-time fee) |
| Device | Any Android phone for testing |

---

## Step 1: Set Up AdMob (Required Before Publishing)

1. Go to https://admob.google.com and sign in
2. Create a new app → "Add your app manually"
3. Get your **App ID** (format: `ca-app-pub-XXXXXXXX~XXXXXXXX`)
4. Create a **Banner** ad unit → get the ad unit ID
5. Create an **Interstitial** ad unit → get the ad unit ID
6. Create a **Rewarded** ad unit → get the ad unit ID

**Update these IDs in your project:**

File: `capacitor.config.json`
- Set `AdMob.appId` to your real App ID

File: `ads.js`
- Set `ADMOB_APP_ID` to your real App ID
- Set `BANNER_AD_ID` to your real Banner ad unit ID
- Set `INTERSTITIAL_AD_ID` to your real Interstitial ad unit ID
- Set `REWARDED_AD_ID` to your real Rewarded ad unit ID
- Set `isTesting: false` in `showBannerAd()`

---

## Step 2: Replace Placeholder App Icons

The repo includes SVG icons as placeholders. Before publishing:
1. Design a 1024x1024 PNG app icon
2. Use https://easyappicon.com to resize to all Android mipmap sizes
3. Replace the SVG files in the project root and Android res folders

---

## Step 3: Generate Signed AAB

```bash
# 1. Create a keystore (one-time, keep this file safe)
keytool -genkey -v -keystore sifir-sprint.keystore \
  -alias sifir-key -keyalg RSA -keysize 2048 -validity 10000

# 2. Sync web assets
npx cap sync android

# 3. Open Android Studio
npx cap open android

# 4. In Android Studio: Build → Generate Signed Bundle / APK
#    - Select Android App Bundle
#    - Choose your keystore file
#    - Enter passwords
#    - Select "release" build variant
#    - Click Finish
```

The signed AAB will be at:
`android/app/release/app-release.aab`

---

## Step 4: Upload to Google Play Console

1. Go to https://play.google.com/console
2. Create a new app → App name: **Sifir Sprint**
3. Upload the AAB file to **Production** track
4. Fill out store listing:
   - **Title**: Sifir Sprint
   - **Short description**: 60-second times-tables arcade. Answer fast, learn faster!
   - **Full description**: Beat the clock in this fast-paced multiplication quiz. Wrong answers come back around — so learn as you go. Featuring puzzles, power-ups, boss battles, adaptive difficulty, and rapid True/False mode.
   - **Category**: Educational → Brain Games
5. Upload screenshots (2-8 phone screenshots, 7" tablet optional)
   - Show the start screen, game screen with question, end screen with score
6. Complete **Content Rating** questionnaire
7. Set **Pricing & Distribution** → Free

---

## Step 5: Update the App (Future Versions)

```bash
# 1. Update version
#    Edit android/variables.gradle -> increase minSdkVersion's versionCode
#    Also update android/app/build.gradle -> versionCode +1, versionName

# 2. Rebuild
npx cap sync android
# Then open Android Studio and generate a new signed AAB

# 3. Upload the new AAB to Google Play Console
```

---

## Monetization Model

| Feature | Free User | After Watching Ad |
|---------|-----------|-------------------|
| Full game (60s sprint) | ✅ | — |
| Banner ads during play | ✅ after 3 games | — |
| Interstitial every 5 games | ✅ after 3 games | — |
| Bonus +5 seconds | ❌ | ✅ (watch rewarded video) |
| Remove all ads (future IAP) | ❌ | One-time purchase planned |

**Ad frequency:**
- First 3 games: no ads (grace period)
- Game 4+: banner ad at bottom during play
- Every 5th game: interstitial ad between rounds
- Optional: rewarded video for +5s bonus time

---

## One-Time Pre-Launch Checklist

- [ ] AdMob account created and ad units approved
- [ ] Real AdMob IDs inserted into `capacitor.config.json` and `ads.js`
- [ ] `isTesting` set to `false` in `ads.js`
- [ ] App icons replaced with real PNGs
- [ ] Keystore generated and backed up safely
- [ ] Signed AAB generated
- [ ] Game tested on physical Android device
- [ ] `npx cap sync android` ran with latest changes