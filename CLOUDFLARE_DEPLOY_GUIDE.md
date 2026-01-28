# GitHub + Cloudflare Pages デプロイガイド

## 📋 前提条件

- GitHubアカウント
- Cloudflareアカウント
- Git（インストール済み）

---

## 🔧 ステップ1：GitHubリポジトリを作成

### 1-1. GitHub.comでリポジトリ作成

1. https://github.com にアクセス
2. **New repository**をクリック
3. リポジトリ名: `kanji-test-generator`（または任意の名前）
4. **Public**を選択（無料でCloudflare Pagesを使うため）
5. **Create repository**をクリック

### 1-2. ローカルでGitリポジトリを初期化

ダウンロードしたプロジェクトフォルダで以下を実行：

```bash
cd kanji-test-generator
git init
git add .
git commit -m "Initial commit: 漢字テストジェネレーター v1.1.0"
```

### 1-3. GitHubにプッシュ

```bash
git remote add origin https://github.com/あなたのユーザー名/kanji-test-generator.git
git branch -M main
git push -u origin main
```

---

## ☁️ ステップ2：Cloudflare Pagesで公開

### 2-1. Cloudflare Pagesにアクセス

1. https://dash.cloudflare.com/ にログイン
2. 左メニューから**Workers & Pages**をクリック
3. **Create application**をクリック
4. **Pages**タブを選択
5. **Connect to Git**をクリック

### 2-2. GitHubと連携

1. **Connect GitHub account**をクリック
2. GitHubで認証
3. リポジトリ一覧から`kanji-test-generator`を選択
4. **Begin setup**をクリック

### 2-3. ビルド設定

以下の設定を入力：

- **Project name**: `kanji-test-generator`（または任意の名前）
- **Production branch**: `main`
- **Build command**: （空欄のまま）
- **Build output directory**: `/`

**Save and Deploy**をクリック

### 2-4. デプロイ完了を待つ

- デプロイには1〜2分かかります
- 完了すると、公開URLが表示されます
  - 例: `https://kanji-test-generator.pages.dev`

---

## 🔍 ステップ3：動作確認

### 3-1. 公開URLを開く

デプロイが完了したら、公開URLを開きます。

### 3-2. style.cssを確認

新しいタブで以下を開く：
```
https://あなたのプロジェクト.pages.dev/style.css
```

**Ctrl+F**で「**480px**」を検索して、見つかることを確認。

### 3-3. 細長い画面で確認

1. **F12**で開発者ツールを開く
2. **デバイスツールバー**を有効化（Ctrl+Shift+M）
3. 画面幅を**320px**に設定
4. **確認項目：**
   - ✅ すべての要素が画面内に収まる
   - ✅ 横スクロールが発生しない
   - ✅ テキストが折り返される

---

## 🎯 カスタムドメインの設定（オプション）

もし独自ドメインを使いたい場合：

1. Cloudflare Pagesの設定画面で**Custom domains**をクリック
2. **Set up a custom domain**をクリック
3. ドメイン名を入力（例: `kanji.example.com`）
4. DNS設定を行う

---

## 🔄 更新方法

ファイルを修正した後：

```bash
git add .
git commit -m "Update: 修正内容の説明"
git push
```

Cloudflare Pagesが自動的に再デプロイします（1〜2分）。

---

## 🚨 トラブルシューティング

### デプロイが失敗する場合

1. Cloudflare Pagesの**Deployments**タブで失敗ログを確認
2. ビルド設定を確認
3. リポジトリにすべてのファイルが含まれているか確認

### style.cssが更新されない場合

1. **ブラウザのキャッシュをクリア**（Ctrl+Shift+R）
2. **Service Workerをクリア**（Application → Storage → Clear site data）
3. 別のブラウザで確認

---

## 📞 次のステップ

1. ✅ GitHubリポジトリを作成
2. ✅ ファイルをアップロード
3. ✅ Cloudflare Pagesで公開
4. ✅ style.cssで「480px」を確認
5. ✅ 細長い画面で動作確認

成功したら、公開URLを教えてください！🎉
