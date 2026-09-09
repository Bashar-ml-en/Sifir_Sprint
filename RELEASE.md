# Sifir Sprint — Release Guide

## Prerequisites

| Item | Android | iOS |
|------|---------|-----|
| Computer | Windows/macOS/Linux | **macOS only** |
| IDE | Android Studio | Xcode 15+ |
| SDK | JDK 17+ | Xcode Command Line Tools |
| Account | Google Play Developer ($25)  | Apple Developer ($99/yr) |
| Device | Any Android phone | iPhone 8+ for testing |

---

## 1. Prepare the Icons

Replace the SVG placeholder icons with real PNGs:
- Download a 1024×1024 PNG of the stopwatch app icon
- https://easyappicon.com — free resize to all needed sizes
- Save to `icon-{48,72,96,128,144,152,192,384,512}.png`
- Android: copy `icon-512.png` as `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png`
- iOS: open Xcode → Assets.xcassets → AppIcon → drag in each size

---

## 2. Android Release

### Generate signed AAB
```bash
# Create keystore (one time only)
keytool -genkey -v -keystore sifir-sprint.keystore \
  -alias sifir-key -keyalg RSA -keysize 2048 -validity 10000

# Build the final AAB
npx cap sync android
cd android
./gradlew bundleRelease
```

The AAB will be at:
`android/app/build/outputs/bundle/release/app-release.aab`

### Upload to Google Play Console
1. Go to https://play.google.com/console
2. Create app → name "Sifir Sprint"
3. Upload the AAB in **Production** track
4. Fill store listing:
   - **Title**: Sifir Sprint
   - **Description**: Beat the 60-second times-tables challenge! Wrong answers come back around — so learn as you go. Puzzles, power-ups, boss battles, and adaptive difficulty keep every round fresh.
   - **Category**: Educational → Brain Games
5. Complete **Content Rating** questionnaire
6. Set **Pricing & Distribution** → Free

---

## 3. iOS Release

### Prerequisites (macOS only)
```bash
npx cap sync ios
npx cap open ios
```

### In Xcode
1. Select your Team in Signing & Capabilities
2. Set Bundle Identifier: `com.sifir.sprint`
3. Set Deployment Target: iOS 16.0
4. Product → Archive
5. Distribute App → App Store Connect

### App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Create a new app → Bundle ID matches Xcode
3. Fill in name, description, keywords, support URL
4. Upload screenshots (iPhone 6.7" and 5.5" required)
5. Submit for Review (24-48 hours typical)

---

## 4. Post-Launch Checklist

- [ ] Test on a physical Android device
- [ ] Test on a physical iPhone
- [ ] Verify PWA works offline (service worker)
- [ ] Verify haptic feedback on both platforms
- [ ] Check console for errors
- [ ] Update versionCode/versionName for updates

---

## 5. Making Updates

```bash
# 1. Change version in android/variables.gradle (versionCode + 1)
# 2. Update version in Xcode project settings
# 3. Rebuild
npx cap sync
cd android && ./gradlew bundleRelease
# 4. Upload new AAB to Google Play Console
```

## 6. Monetization (Future)

When ready, add:
1. `npm install @capacitor-community/admob`
2. Google AdMob → create Banner ad unit
3. Add ad unit ID to `capacitor.config.json`
4. Google Play Billing → create `remove_ads` in-app product
5. Uncomment the AdMob code path in `game.js`