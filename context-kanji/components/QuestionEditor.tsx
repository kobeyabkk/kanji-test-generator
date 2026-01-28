'use client'

import { useState } from 'react'
import { Question } from '@/types'
import { ArrowLeft, ArrowRight, RefreshCw, Edit2, Save } from 'lucide-react'

interface QuestionEditorProps {
  questions: Question[]
  onQuestionsEdited: (questions: Question[]) => void
  onGoToPrint: () => void
  onBackToSelect: () => void
}

export default function QuestionEditor({ 
  questions, 
  onQuestionsEdited, 
  onGoToPrint,
  onBackToSelect 
}: QuestionEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  const handleCandidateSelect = (index: number, type: 'context' | 'standard' | 'unique') => {
    const updated = [...questions]
    updated[index] = {
      ...updated[index],
      selectedSentence: updated[index].candidates[type],
      selectedType: type,
    }
    onQuestionsEdited(updated)
  }

  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setEditText(questions[index].selectedSentence)
  }

  const handleSaveEdit = () => {
    if (editingIndex === null) return
    
    const updated = [...questions]
    updated[editingIndex] = {
      ...updated[editingIndex],
      selectedSentence: editText,
      selectedType: 'context', // カスタム編集時はcontextタイプに
    }
    onQuestionsEdited(updated)
    setEditingIndex(null)
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditText('')
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">問題を編集</h2>
        <p className="text-gray-600">
          各問題の例文を確認し、必要に応じて候補を切り替えたり手動編集できます。
        </p>
      </div>

      {/* 問題リスト */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start gap-4">
              {/* 問題番号と漢字 */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white text-3xl font-bold">
                  {question.targetKanji}
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  {question.yomi}
                </p>
              </div>

              {/* 問題内容 */}
              <div className="flex-1 space-y-3">
                {/* 選択中の例文 */}
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                  {editingIndex === index ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          保存
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <p className="text-lg text-gray-900 flex-1">
                        {index + 1}. {question.selectedSentence}
                      </p>
                      <button
                        onClick={() => handleStartEdit(index)}
                        className="ml-4 p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                        title="手動編集"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 候補切り替えボタン */}
                {editingIndex !== index && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCandidateSelect(index, 'context')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        question.selectedType === 'context'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📖 ストーリー
                    </button>
                    <button
                      onClick={() => handleCandidateSelect(index, 'standard')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        question.selectedType === 'standard'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📝 一般
                    </button>
                    <button
                      onClick={() => handleCandidateSelect(index, 'unique')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        question.selectedType === 'unique'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ✨ ユニーク
                    </button>
                  </div>
                )}

                {/* 候補プレビュー */}
                {editingIndex !== index && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div className={`p-2 rounded border ${
                      question.selectedType === 'context' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}>
                      <p className="text-gray-600 text-xs mb-1">ストーリー:</p>
                      <p className="text-gray-800">{question.candidates.context}</p>
                    </div>
                    <div className={`p-2 rounded border ${
                      question.selectedType === 'standard' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}>
                      <p className="text-gray-600 text-xs mb-1">一般:</p>
                      <p className="text-gray-800">{question.candidates.standard}</p>
                    </div>
                    <div className={`p-2 rounded border ${
                      question.selectedType === 'unique' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}>
                      <p className="text-gray-600 text-xs mb-1">ユニーク:</p>
                      <p className="text-gray-800">{question.candidates.unique}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-6">
        <button
          onClick={onBackToSelect}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          漢字選択に戻る
        </button>
        <button
          onClick={onGoToPrint}
          className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          印刷プレビューへ
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
