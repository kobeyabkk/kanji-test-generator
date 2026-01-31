# 📱 PWA セットアップガイド

## 🎯 概要

漢字テストジェネレーターは、PWA（Progressive Web App）として動作します。

---

## ✨ PWA機能

### 1️⃣ **オフライン動作**
- プリント生成機能がオフラインで動作
- 手書き練習機能がオフラインで動作
- 漢字データ（小1〜小6、1026字）を事前キャッシュ

### 2️⃣ **インストール可能**
- PC、タブレット、スマホにアプリとしてインストール可能
- ホーム画面に追加できる
- スタンドアロンモードで動作（ブラウザUIなし）

### 3️⃣ **自動更新**
- 新しいバージョンが公開されると自動検出
- ユーザーに更新通知を表示
- ワンクリックで最新版に更新

### 4️⃣ **キャッシュ戦略**
- **Cache First**: オフライン優先、高速動作
- 静的ファイル（HTML, CSS, JS）を事前キャッシュ
- 漢字データ（JSON）を事前キャッシュ

---

## 📋 技術仕様

### Service Worker
- **ファイル**: `service-worker.js`
- **バージョン**: `2.7.34`
- **キャッシュ名**: `kanji-practice-v2.7.34`

### Manifest
- **ファイル**: `manifest.json`
- **アプリ名**: 漢字テストジェネレーター
- **アプリID**: `com.kobeya.kanjipractice`

---

## 🚀 インストール方法

### **PC（Chrome/Edge）**
1. アプリを開く: https://kanji-test-generator.pages.dev
2. アドレスバーの右端にある「インストール」アイコンをクリック
3. 「インストール」ボタンをクリック
4. デスクトップにアプリアイコンが表示される

### **iPhone/iPad（Safari）**
1. アプリを開く: https://kanji-test-generator.pages.dev
2. 共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」をタップ
4. 「追加」をタップ
5. ホーム画面にアプリアイコンが表示される

### **Android（Chrome）**
1. アプリを開く: https://kanji-test-generator.pages.dev
2. メニュー（⋮）をタップ
3. 「ホーム画面に追加」をタップ
4. 「追加」をタップ
5. ホーム画面にアプリアイコンが表示される

---

## 🔧 開発者向け情報

### Service Worker の登録

`index.html` と `practice.html` で Service Worker を登録：

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker登録成功:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ Service Worker登録失敗:', error);
      });
  });
}
```

### アップデート検出

新しい Service Worker が見つかったら、ユーザーに通知：

```javascript
navigator.serviceWorker.register('/service-worker.js')
  .then((registration) => {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // 新しいバージョンが利用可能
          if (confirm('新しいバージョンが利用可能です。更新しますか？')) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        }
      });
    });
  });
```

### キャッシュクリア

開発中にキャッシュをクリアする：

```javascript
navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_CACHE' });
```

または、Chrome DevTools で：
1. `F12` を押す
2. `Application` タブを開く
3. `Service Workers` → `Unregister` をクリック
4. `Storage` → `Clear site data` をクリック

---

## 📊 キャッシュ対象ファイル

### 静的ファイル
- `/` (ルート)
- `/index.html` (プリント生成)
- `/practice.html` (手書き練習)
- `/editor.html` (データ編集)
- `/app.js`
- `/practice.js`
- `/editor.js`
- `/style.css`
- `/practice.css`
- `/manifest.json`

### データファイル
- `/data/grade1_kanji.json` (80字)
- `/data/grade2_kanji.json` (160字)
- `/data/grade3_kanji.json` (200字)
- `/data/grade4_kanji.json` (202字)
- `/data/grade5_kanji.json` (193字)
- `/data/grade6_kanji.json` (191字)

### アイコン
- `/icons/icon-72x72.png`
- `/icons/icon-96x96.png`
- `/icons/icon-128x128.png`
- `/icons/icon-144x144.png`
- `/icons/icon-152x152.png`
- `/icons/icon-192x192.png`
- `/icons/icon-384x384.png`
- `/icons/icon-512x512.png`

---

## 🔍 トラブルシューティング

### Service Worker が登録されない
- **原因**: HTTPS接続が必要（ローカル開発は除く）
- **解決**: Cloudflare Pages で公開済みのため問題なし

### キャッシュが更新されない
- **原因**: Service Worker のバージョンが変わっていない
- **解決**: `service-worker.js` の `VERSION` を更新

### オフラインで動作しない
- **原因**: キャッシュされていない
- **解決**: オンライン時に一度アクセスしてキャッシュを作成

---

## 📱 App Store / Google Play 公開

将来、Capacitor を使ってネイティブアプリ化し、App Store / Google Play に公開予定。

詳細は `CAPACITOR_SETUP.md` を参照。

---

## 📝 参考リンク

- [PWA ドキュメント（Google）](https://web.dev/progressive-web-apps/)
- [Service Worker API（MDN）](https://developer.mozilla.org/ja/docs/Web/API/Service_Worker_API)
- [Web App Manifest（MDN）](https://developer.mozilla.org/ja/docs/Web/Manifest)

---

**制作**: プログラミングのKOBEYA  
**バージョン**: 2.7.34  
**最終更新**: 2026-01-31
