'use client'

import { useState } from 'react'
import { Question } from '@/types'
import { ArrowLeft, Printer, Eye, EyeOff } from 'lucide-react'

interface PrintPreviewProps {
  questions: Question[]
  onBackToEdit: () => void
}

export default function PrintPreview({ questions, onBackToEdit }: PrintPreviewProps) {
  const [mode, setMode] = useState<'practice' | 'test'>('test')
  const [showAnswers, setShowAnswers] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* コントロールパネル */}
      <div className="bg-white rounded-lg shadow-sm p-6 no-print">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">印刷プレビュー</h2>
            <p className="text-gray-600">モードを選択して印刷してください</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setMode('test')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                mode === 'test'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👁️ 読みテスト
            </button>
            <button
              onClick={() => setMode('practice')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                mode === 'practice'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✍️ 書きテスト
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="px-6 py-3 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center gap-2"
            >
              {showAnswers ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              {showAnswers ? '解答を隠す' : '解答を表示'}
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-colors flex items-center gap-2 shadow-lg"
            >
              <Printer className="w-5 h-5" />
              印刷する
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onBackToEdit}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            編集に戻る
          </button>
        </div>
      </div>

      {/* 印刷エリア */}
      <div className="print-container bg-white rounded-lg shadow-lg p-8 mx-auto" style={{ maxWidth: '297mm' }}>
        {/* ヘッダー */}
        <div className="mb-8 pb-4 border-b-2 border-gray-300">
          <h1 className="text-3xl font-bold text-center mb-4">
            {mode === 'test' ? '漢字読みテスト' : '漢字書き取りテスト'}
          </h1>
          <div className="flex justify-between items-center text-sm">
            <div>
              <label className="inline-block mr-2">名前:</label>
              <span className="inline-block border-b border-gray-400 w-48">　　　　　　　　　　</span>
            </div>
            <div>
              <label className="inline-block mr-2">日付:</label>
              <span className="inline-block border-b border-gray-400 w-32">　　　　　　</span>
            </div>
          </div>
        </div>

        {/* 問題 */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="flex items-start gap-4 pb-4 border-b border-gray-200">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center font-bold text-orange-700">
                {index + 1}
              </div>
              
              <div className="flex-1">
                {mode === 'test' ? (
                  // 読みテストモード
                  <div>
                    <p className="text-xl mb-3">
                      {question.selectedSentence.split('').map((char, i) => 
                        char === question.targetKanji ? (
                          <span key={i} className="font-bold underline decoration-2 decoration-orange-500 underline-offset-4">
                            {char}
                          </span>
                        ) : (
                          char
                        )
                      )}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">読み:</span>
                      <div className="flex-1 border-b-2 border-gray-300 h-8"></div>
                    </div>
                  </div>
                ) : (
                  // 書きテストモード
                  <div>
                    <p className="text-xl mb-3">
                      {question.selectedSentence.replace(
                        question.targetKanji, 
                        '＿＿＿'
                      )}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((box) => (
                        <div 
                          key={box}
                          className="aspect-square border-2 border-gray-300 rounded"
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 解答欄 */}
        {showAnswers && (
          <div className="mt-12 pt-8 border-t-2 border-gray-300">
            <h2 className="text-2xl font-bold text-center mb-6 text-green-700">解答</h2>
            <div className="grid grid-cols-2 gap-4">
              {questions.map((question, index) => (
                <div key={question.id} className="flex items-center gap-3">
                  <span className="font-bold text-gray-700">{index + 1}.</span>
                  {mode === 'test' ? (
                    <span className="text-lg">
                      {question.targetKanji}　→　<span className="text-blue-600 font-bold">{question.yomi}</span>
                    </span>
                  ) : (
                    <span className="text-lg">
                      <span className="text-red-600 font-bold text-2xl">{question.targetKanji}</span>
                      <span className="text-gray-600 ml-2">（{question.yomi}）</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
