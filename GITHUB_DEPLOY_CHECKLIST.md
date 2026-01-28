# 漢字テストジェネレーター - デプロイ用ファイルリスト

## 📁 ルートディレクトリ
- index.html
- style.css (⭐ 重要: 480px対応版)
- app.js
- practice.html
- practice.css
- practice.js
- editor.html
- editor.js
- manifest.json
- service-worker.js
- README.md

## 📁 data/
- grade1_kanji.json
- grade2_kanji.json
- grade3_kanji.json
- grade4_kanji.json
- grade5_kanji.json
- grade6_kanji.json

## 📁 icons/
- icon-512x512.png
- icon-192x192.png
- favicon.ico

## 📁 その他（オプション）
- check_duplicates.html
- check_missing.html
- json_validator.html
- DEPLOYMENT.md
- version.txt

---

## 🔍 ダウンロード方法

### オプション1：ZIPでダウンロード
1. **ファイルエクスプローラー**タブをクリック
2. プロジェクトフォルダを右クリック
3. **Download as ZIP**を選択

### オプション2：個別にダウンロード
各ファイルを右クリック → **Download**

---

## ⚠️ 重要：style.cssの確認

ダウンロード後、テキストエディタでstyle.cssを開いて以下を確認：

```css
/* 細長い画面対応 */
@media (max-width: 480px) {
    .container {
        padding: 8px;
        width: calc(100vw - 10px);
        border-radius: 6px;
    }
}
```

このコードが含まれていることを確認してください。
