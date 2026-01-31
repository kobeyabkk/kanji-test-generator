# 📱 Capacitor セットアップガイド

## 🎯 概要

Capacitor を使って、漢字テストジェネレーターをiOS/Androidのネイティブアプリに変換します。

---

## 📋 前提条件

### 必要なツール
- **Node.js**: v16以上
- **npm**: v8以上
- **iOS開発** (Macのみ):
  - Xcode 14以上
  - CocoaPods
- **Android開発**:
  - Android Studio
  - Android SDK

---

## 🚀 Capacitor のインストール

### 1️⃣ **Capacitor をインストール**

```bash
# Capacitor CLI をインストール
npm install @capacitor/cli @capacitor/core

# iOS と Android のプラットフォームをインストール
npm install @capacitor/ios @capacitor/android

# Capacitor を初期化
npx cap init
```

**設定：**
- **App name**: 漢字テストジェネレーター
- **App ID**: `com.kobeya.kanjipractice`
- **Web directory**: `.` (ルートディレクトリ)

---

## ⚙️ capacitor.config.json

プロジェクトルートに `capacitor.config.json` を作成：

\`\`\`json
{
  "appId": "com.kobeya.kanjipractice",
  "appName": "漢字テストジェネレーター",
  "webDir": ".",
  "bundledWebRuntime": false,
  "server": {
    "url": "https://kanji-test-generator.pages.dev",
    "cleartext": true
  },
  "ios": {
    "contentInset": "automatic",
    "scheme": "KanjiPractice"
  },
  "android": {
    "buildOptions": {
      "keystorePath": "",
      "keystoreAlias": ""
    }
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#667eea",
      "androidSplashResourceName": "splash",
      "androidScaleType": "CENTER_CROP",
      "showSpinner": false
    }
  }
}
\`\`\`

---

## 📱 iOS アプリのビルド

### 1️⃣ **iOS プラットフォームを追加**

\`\`\`bash
npx cap add ios
\`\`\`

### 2️⃣ **Xcode で開く**

\`\`\`bash
npx cap open ios
\`\`\`

### 3️⃣ **Xcode で設定**

1. **Bundle Identifier**: `com.kobeya.kanjipractice`
2. **Team**: 開発者アカウントを選択
3. **Deployment Target**: iOS 13.0以上
4. **Capabilities**: 必要に応じて有効化

### 4️⃣ **ビルド・実行**

- **シミュレーター**: `Product` → `Run`
- **実機**: デバイスを接続して `Product` → `Run`

### 5️⃣ **App Store への公開**

1. **Archive**: `Product` → `Archive`
2. **Upload to App Store Connect**
3. **App Store Connect** で審査提出

---

## 🤖 Android アプリのビルド

### 1️⃣ **Android プラットフォームを追加**

\`\`\`bash
npx cap add android
\`\`\`

### 2️⃣ **Android Studio で開く**

\`\`\`bash
npx cap open android
\`\`\`

### 3️⃣ **Android Studio で設定**

1. **Application ID**: `com.kobeya.kanjipractice`
2. **Min SDK**: API 22 (Android 5.1)
3. **Target SDK**: API 33 (Android 13)
4. **Build Variants**: `release` を選択

### 4️⃣ **署名キーを作成**

\`\`\`bash
# Keystore を生成
keytool -genkey -v -keystore kanji-practice.keystore -alias kanji-practice -keyalg RSA -keysize 2048 -validity 10000
\`\`\`

### 5️⃣ **build.gradle を編集**

`android/app/build.gradle` に署名設定を追加：

\`\`\`gradle
android {
  ...
  signingConfigs {
    release {
      storeFile file("../../kanji-practice.keystore")
      storePassword "YOUR_PASSWORD"
      keyAlias "kanji-practice"
      keyPassword "YOUR_PASSWORD"
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
      minifyEnabled false
      proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
  }
}
\`\`\`

### 6️⃣ **APK をビルド**

\`\`\`bash
cd android
./gradlew assembleRelease
\`\`\`

**APK の場所**: `android/app/build/outputs/apk/release/app-release.apk`

### 7️⃣ **AAB をビルド（Google Play 用）**

\`\`\`bash
./gradlew bundleRelease
\`\`\`

**AAB の場所**: `android/app/build/outputs/bundle/release/app-release.aab`

### 8️⃣ **Google Play への公開**

1. **Google Play Console** にログイン
2. **新しいアプリを作成**
3. **AAB をアップロード**
4. **審査提出**

---

## 🔄 アップデート手順

Webアプリを更新した後、ネイティブアプリも更新：

\`\`\`bash
# Web ファイルを同期
npx cap sync

# iOS をビルド
npx cap open ios

# Android をビルド
npx cap open android
\`\`\`

---

## 🎨 アイコンとスプラッシュスクリーン

### iOS
- **アイコン**: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- **スプラッシュ**: `ios/App/App/Assets.xcassets/Splash.imageset/`

### Android
- **アイコン**: `android/app/src/main/res/mipmap-*/`
- **スプラッシュ**: `android/app/src/main/res/drawable-*/splash.png`

---

## 📊 サポートする機能

✅ **オフライン動作**  
✅ **プリント生成**  
✅ **手書き練習**  
✅ **書き順確認**（オンライン必須）  
✅ **データ編集**  
✅ **LocalStorage データ永続化**

---

## 🔍 トラブルシューティング

### iOS ビルドエラー
- **原因**: CocoaPods がインストールされていない
- **解決**: `sudo gem install cocoapods`

### Android ビルドエラー
- **原因**: Gradle のバージョンが古い
- **解決**: Android Studio で Gradle をアップデート

### アプリが起動しない
- **原因**: `capacitor.config.json` の設定が間違っている
- **解決**: `appId` と `webDir` を確認

---

## 📝 参考リンク

- [Capacitor 公式ドキュメント](https://capacitorjs.com/docs)
- [iOS App Store 審査ガイドライン](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play 審査ガイドライン](https://play.google.com/about/developer-content-policy/)

---

**制作**: プログラミングのKOBEYA  
**バージョン**: 2.7.34  
**最終更新**: 2026-01-31
