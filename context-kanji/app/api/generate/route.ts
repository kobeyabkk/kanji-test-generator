import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// OpenAI クライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { kanji } = await request.json()

    if (!Array.isArray(kanji) || kanji.length === 0) {
      return NextResponse.json(
        { error: '漢字が指定されていません' },
        { status: 400 }
      )
    }

    if (kanji.length > 20) {
      return NextResponse.json(
        { error: '最大20個まで選択できます' },
        { status: 400 }
      )
    }

    // Gemini様推奨のプロンプト戦略：1回のAPIコールで全て完結
    // 10個ずつに分割して処理
    const results = []
    const batchSize = 10
    
    for (let i = 0; i < kanji.length; i += batchSize) {
      const batch = kanji.slice(i, i + batchSize)
      const grade = 1 // 仮の学年（実際は選択された漢字の学年を使用）
      
      const systemPrompt = `あなたはプロの小学生向け国語教師です。
以下のステップでJSONデータを作成してください。

Step 1: ユーザーが指定した全ての漢字（${batch.join('、')}）を含んだ、小学${grade}年生向けの楽しい物語を作成する。
Step 2: その物語から、各漢字を含む一文を抽出する。
Step 3: 抽出した文が、それ1文だけで意味が通じるように主語や背景を補完してリライトする（これをContext文とする）。
Step 4: 各漢字について、物語とは無関係な「一般的な短文」と「面白い短文」を作成する。

重要な注意点：
- 小学${grade}年生が理解できる平易な言葉を使う
- 指示語（それ、あれ、そこ）や省略された主語を必ず補完する
- 面白い短文は子供が楽しめる内容にする
- 各文は15〜25文字程度にする

出力は以下のJSON形式のみで行ってください。余計な会話は不要です。`

      const userPrompt = `以下の漢字で物語と例文を作成してください：${batch.join('、')}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('AIからの応答が空です')
      }

      const data = JSON.parse(content)
      results.push(data)
    }

    // 複数バッチの結果を統合
    const combinedQuestions = results.flatMap(r => r.questions || [])

    return NextResponse.json({
      story: results.map(r => r.story).join('\n\n'),
      questions: combinedQuestions,
    })

  } catch (error: any) {
    console.error('AI生成エラー:', error)
    
    // OpenAI APIエラーの詳細をログ
    if (error?.response) {
      console.error('API Response:', error.response.status, error.response.data)
    }

    return NextResponse.json(
      { 
        error: 'AIの生成に失敗しました',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
