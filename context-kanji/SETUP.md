# Context-Kanji セットアップガイド

## 🚀 クイックスタート

### 1. 依存関係のインストール

プロジェクトフォルダで以下のコマンドを実行：

```bash
cd context-kanji
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成して、OpenAI APIキーを設定：

```bash
cp .env.example .env.local
```

`.env.local` を開いて、以下のように設定：

```
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**OpenAI APIキーの取得方法：**
1. https://platform.openai.com/api-keys にアクセス
2. 「Create new secret key」をクリック
3. 生成されたキーをコピーして `.env.local` に貼り付け

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

---

## 📁 プロジェクト構造

```
context-kanji/
├── app/                      # Next.js App Router
│   ├── page.tsx             # メインページ
│   ├── layout.tsx           # レイアウト
│   ├── globals.css          # グローバルCSS
│   └── api/                 # API Routes
│       └── generate/
│           └── route.ts     # AI生成API
├── components/              # Reactコンポーネント
│   ├── KanjiSelector.tsx   # 漢字選択UI
│   ├── QuestionEditor.tsx  # 問題編集UI
│   └── PrintPreview.tsx    # 印刷プレビュー
├── lib/                     # ユーティリティ
│   └── utils.ts
├── public/                  # 静的ファイル
│   └── data/                # 漢字データ（JSON）
│       ├── grade1_kanji.json
│       ├── grade2_kanji.json
│       ├── grade3_kanji.json
│       ├── grade4_kanji.json
│       ├── grade5_kanji.json
│       └── grade6_kanji.json
├── types/                   # TypeScript型定義
│   └── index.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 🎯 使い方

### Step 1: 漢字選択
1. 学年タブから学年を選択
2. 漢字をクリックして5〜20個選択
3. 「問題を作成する」ボタンをクリック

### Step 2: 編集
1. AIが生成した例文を確認
2. 3つの候補（ストーリー/一般/ユニーク）から選択
3. 必要に応じて手動編集
4. 「印刷プレビューへ」をクリック

### Step 3: 印刷
1. 読みテスト/書きテストを選択
2. 必要に応じて解答を表示
3. 「印刷する」ボタンでPDF保存

---

## 🔧 カスタマイズ

### プロンプトの調整

`app/api/generate/route.ts` の `systemPrompt` を編集することで、AIの生成内容をカスタマイズできます。

### スタイルの変更

- メインカラー: `tailwind.config.ts` の `primary` と `secondary` を変更
- レイアウト: 各コンポーネントのTailwind CSSクラスを編集

---

## 📦 ビルドとデプロイ

### ローカルビルド

```bash
npm run build
npm run start
```

### Cloudflare Pages へのデプロイ

1. Cloudflareダッシュボードにログイン
2. Pages > Create a project
3. GitHubリポジトリを接続
4. ビルド設定：
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output directory: `.next`
5. 環境変数に `OPENAI_API_KEY` を追加
6. Deploy

---

## ⚠️ トラブルシューティング

### APIキーエラー

```
Error: OpenAI API key is not set
```

→ `.env.local` ファイルが正しく設定されているか確認

### ビルドエラー

```
npm install
```

で依存関係を再インストール

### 生成が遅い

- 10個以上の漢字を選択すると2回APIを呼び出すため時間がかかります
- 最初は5〜10個でテストすることをお勧めします

---

## 💰 コスト目安

- gpt-4o-mini使用
- 10問生成: 約$0.002（0.3円）
- 20問生成: 約$0.004（0.6円）
- 月100回使用: 約$0.40（60円）

---

## 📞 サポート

問題が発生した場合は、以下をご確認ください：

1. Node.js バージョン（18以上推奨）
2. OpenAI APIキーの有効性
3. ブラウザのコンソールログ

---

**開発：プログラミングのKOBEYA**
**更新日：2025年1月**
