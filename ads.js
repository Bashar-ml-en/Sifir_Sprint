// ============ AdMob Integration ============
// Test IDs (replace with real ones from AdMob dashboard before publishing):
var ADMOB_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
var BANNER_AD_ID = 'ca-app-pub-3940256099942544/6300978111';
var INTERSTITIAL_AD_ID = 'ca-app-pub-3940256099942544/1033173712';
var REWARDED_AD_ID = 'ca-app-pub-3940256099942544/5224354917';

var totalGamesPlayed = 0;
var adsRemoved = false;

try {
  var saved = localStorage.getItem('sifir-noads');
  if (saved === 'true') adsRemoved = true;
  totalGamesPlayed = parseInt(localStorage.getItem('sifir-games') || '0', 10);
} catch (e) {}

// Grace period: no ads for first 3 games
var GRACE_PERIOD = 3;

function initAds() {
  if (adsRemoved || typeof AdMob === 'undefined') return;
  try { AdMob.initialize(); } catch (e) { console.log('AdMob init error:', e); }
}

function showBannerAd() {
  if (adsRemoved || typeof AdMob === 'undefined') return;
  if (totalGamesPlayed < GRACE_PERIOD) return; // Grace period
  try {
    AdMob.showBanner({
      adId: BANNER_AD_ID,
      position: 'bottom',
      margin: 0,
      isTesting: true  // Set to false before publishing
    });
  } catch (e) {}
}

function hideBannerAd() {
  if (typeof AdMob === 'undefined') return;
  try { AdMob.hideBanner(); } catch (e) {}
}

function showInterstitialAd(callback) {
  if (adsRemoved || typeof AdMob === 'undefined') {
    if (callback) callback();
    return;
  }
  if (totalGamesPlayed < GRACE_PERIOD) {
    // Track game but no ad yet
    if (callback) callback();
    return;
  }
  // Interstitial every 5 games
  if ((totalGamesPlayed - GRACE_PERIOD) % 5 !== 0) {
    if (callback) callback();
    return;
  }
  try {
    AdMob.prepareInterstitial({ adId: INTERSTITIAL_AD_ID });
    AdMob.showInterstitial().then(function() {
      if (callback) callback();
    }).catch(function() {
      if (callback) callback();
    });
  } catch (e) {
    if (callback) callback();
  }
}

function showRewardedAd(callback) {
  if (adsRemoved || typeof AdMob === 'undefined') {
    if (callback) callback(false);
    return;
  }
  try {
    AdMob.prepareRewardVideoAd({ adId: REWARDED_AD_ID });
    AdMob.showRewardedVideoAd().then(function() {
      // User watched the full ad — reward them
      if (callback) callback(true);
    }).catch(function() {
      if (callback) callback(false);
    });
  } catch (e) {
    if (callback) callback(false);
  }
}

function trackGamePlayed() {
  totalGamesPlayed++;
  try { localStorage.setItem('sifir-games', totalGamesPlayed + ''); } catch (e) {}
}

// ============ Hooking into game.js flow ============
// These functions are called from game.js

function onGameStart() {
  initAds();
  showBannerAd();
}

function onGameEnd(callback) {
  hideBannerAd();
  trackGamePlayed();
  showInterstitialAd(callback);
}

function onRequestBonusTime(callback) {
  showRewardedAd(function(watched) {
    if (watched) {
      // +5 seconds rewarded
      if (typeof state !== 'undefined' && state) {
        state.timeRemaining += 5;
        state.totalTime += 5;
      }
    }
    if (callback) callback(watched);
  });
}