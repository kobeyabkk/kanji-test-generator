# Context-Kanji: 漢字学習AIアプリ

小学生向けの「文脈の中で漢字を学ぶ」Webアプリケーション

## 🎯 プロジェクト概要

このアプリは、選択した漢字を使ってAIが物語を生成し、その物語から学習用の例文を作成します。

### 主な機能

- **AIストーリー生成**: 選択した漢字を含む短い物語を自動生成
- **3つの候補システム**: 
  - Context（ストーリー文脈）
  - Standard（一般的短文）
  - Unique（面白い短文）
- **学年別漢字選択**: 小学1〜6年生の1,026漢字から選択可能
- **編集機能**: ワンクリックで候補を切り替え、手動編集も可能
- **印刷機能**: A4横向き・縦書きで印刷可能

## 🚀 開発開始

### 前提条件

- Node.js 18以上
- OpenAI APIキー

### セットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.localにOpenAI APIキーを設定

# 開発サーバーの起動
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## 📁 プロジェクト構造

```
context-kanji/
├── app/                 # Next.js App Router
│   ├── page.tsx        # メインページ
│   ├── layout.tsx      # レイアウト
│   └── api/            # API Routes
├── components/          # Reactコンポーネント
├── lib/                # ユーティリティ
├── public/             # 静的ファイル
│   └── data/           # 漢字データ（JSON）
└── types/              # TypeScript型定義
```

## 🎨 技術スタック

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI API (gpt-4o-mini)
- **Icons**: Lucide React
- **Deployment**: Cloudflare Pages

## 📝 開発ロードマップ

### Phase 1: プロトタイプ（3日）
- [x] プロジェクト初期化
- [ ] 漢字選択UI
- [ ] OpenAI API連携
- [ ] ストーリー生成機能

### Phase 2: エディタUI（4日）
- [ ] 3候補表示
- [ ] 入替ボタンUI
- [ ] 手動編集機能
- [ ] プレビュー機能

### Phase 3: 印刷機能（3日）
- [ ] A4横向き・縦書きレイアウト
- [ ] 読みテスト/書きテストの切り替え
- [ ] 解答ページ生成
- [ ] PDF出力対応

## 🔐 環境変数

以下の環境変数を `.env.local` に設定してください：

```
OPENAI_API_KEY=your_openai_api_key_here
```

## 📄 ライセンス

Proprietary - プログラミングのKOBEYA専用

## 👨‍💻 開発者

鈴木政路（すずき まさみち）
プログラミングのKOBEYA - バンコク
