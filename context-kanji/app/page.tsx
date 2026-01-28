'use client'

import { useState } from 'react'
import KanjiSelector from '@/components/KanjiSelector'
import QuestionEditor from '@/components/QuestionEditor'
import PrintPreview from '@/components/PrintPreview'
import { Question } from '@/types'
import { BookOpen, Sparkles } from 'lucide-react'

type Step = 'select' | 'edit' | 'print'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('select')
  const [selectedKanji, setSelectedKanji] = useState<string[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleKanjiSelected = async (kanji: string[]) => {
    setSelectedKanji(kanji)
    setIsGenerating(true)
    
    try {
      // AI生成APIを呼び出す
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kanji }),
      })
      
      if (!response.ok) throw new Error('生成に失敗しました')
      
      const data = await response.json()
      
      // レスポンスをQuestion型に変換
      const generatedQuestions: Question[] = data.questions.map((q: any, index: number) => ({
        id: `q${index + 1}`,
        targetKanji: q.kanji,
        selectedSentence: q.context_sentence,
        candidates: {
          context: q.context_sentence,
          standard: q.standard_sentence,
          unique: q.unique_sentence,
        },
        yomi: q.yomi,
        selectedType: 'context' as const,
      }))
      
      setQuestions(generatedQuestions)
      setCurrentStep('edit')
    } catch (error) {
      console.error('生成エラー:', error)
      alert('問題の生成に失敗しました。もう一度お試しください。')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleQuestionsEdited = (editedQuestions: Question[]) => {
    setQuestions(editedQuestions)
  }

  const handleGoToPrint = () => {
    setCurrentStep('print')
  }

  const handleBackToSelect = () => {
    setCurrentStep('select')
    setSelectedKanji([])
    setQuestions([])
  }

  const handleBackToEdit = () => {
    setCurrentStep('edit')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-green-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b-2 border-orange-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-2 rounded-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Context-Kanji</h1>
                <p className="text-sm text-gray-600">文脈の中で漢字を学ぶ</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>プログラミングのKOBEYA</span>
            </div>
          </div>
        </div>
      </header>

      {/* プログレスバー */}
      <div className="bg-white border-b no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <StepIndicator 
              step={1} 
              label="漢字選択" 
              active={currentStep === 'select'} 
              completed={currentStep !== 'select'} 
            />
            <div className="flex-1 h-1 bg-gray-200 mx-4">
              <div 
                className={`h-full bg-orange-500 transition-all duration-500 ${
                  currentStep === 'edit' ? 'w-1/2' : currentStep === 'print' ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            <StepIndicator 
              step={2} 
              label="編集" 
              active={currentStep === 'edit'} 
              completed={currentStep === 'print'} 
            />
            <div className="flex-1 h-1 bg-gray-200 mx-4">
              <div 
                className={`h-full bg-orange-500 transition-all duration-500 ${
                  currentStep === 'print' ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            <StepIndicator 
              step={3} 
              label="印刷" 
              active={currentStep === 'print'} 
              completed={false} 
            />
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isGenerating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AIが物語を作成中...</h3>
              <p className="text-gray-600">少々お待ちください</p>
            </div>
          </div>
        )}

        {currentStep === 'select' && (
          <KanjiSelector onKanjiSelected={handleKanjiSelected} />
        )}

        {currentStep === 'edit' && (
          <QuestionEditor 
            questions={questions}
            onQuestionsEdited={handleQuestionsEdited}
            onGoToPrint={handleGoToPrint}
            onBackToSelect={handleBackToSelect}
          />
        )}

        {currentStep === 'print' && (
          <PrintPreview 
            questions={questions}
            onBackToEdit={handleBackToEdit}
          />
        )}
      </main>
    </div>
  )
}

function StepIndicator({ step, label, active, completed }: { 
  step: number
  label: string
  active: boolean
  completed: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${
          active 
            ? 'bg-orange-500 text-white' 
            : completed 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {step}
      </div>
      <span className={`text-sm font-medium ${active ? 'text-orange-600' : completed ? 'text-green-600' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  )
}
