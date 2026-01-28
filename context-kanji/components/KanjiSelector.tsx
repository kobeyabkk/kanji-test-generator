'use client'

import { useState, useEffect } from 'react'
import { KanjiData } from '@/types'
import { ChevronDown, ChevronUp, Search, Check, X } from 'lucide-react'

interface KanjiSelectorProps {
  onKanjiSelected: (kanji: string[]) => void
}

export default function KanjiSelector({ onKanjiSelected }: KanjiSelectorProps) {
  const [gradeData, setGradeData] = useState<{ [key: number]: KanjiData[] }>({})
  const [selectedGrade, setSelectedGrade] = useState<number>(1)
  const [selectedKanji, setSelectedKanji] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // 漢字データの読み込み
  useEffect(() => {
    const loadKanjiData = async () => {
      try {
        const grades = [1, 2, 3, 4, 5, 6]
        const data: { [key: number]: KanjiData[] } = {}
        
        for (const grade of grades) {
          const response = await fetch(`/data/grade${grade}_kanji.json`)
          data[grade] = await response.json()
        }
        
        setGradeData(data)
      } catch (error) {
        console.error('漢字データの読み込みエラー:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadKanjiData()
  }, [])

  const currentKanjiList = gradeData[selectedGrade] || []
  const filteredKanji = searchQuery
    ? currentKanjiList.filter(k => 
        k.kanji.includes(searchQuery) || 
        k.yomi.includes(searchQuery) || 
        k.meaning.includes(searchQuery)
      )
    : currentKanjiList

  const handleKanjiToggle = (kanji: string) => {
    const newSelected = new Set(selectedKanji)
    if (newSelected.has(kanji)) {
      newSelected.delete(kanji)
    } else {
      if (newSelected.size >= 20) {
        alert('最大20個まで選択できます')
        return
      }
      newSelected.add(kanji)
    }
    setSelectedKanji(newSelected)
  }

  const handleSelectAll = () => {
    const newSelected = new Set(currentKanjiList.slice(0, 20).map(k => k.kanji))
    setSelectedKanji(newSelected)
  }

  const handleClearAll = () => {
    setSelectedKanji(new Set())
  }

  const handleGenerate = () => {
    if (selectedKanji.size < 5) {
      alert('最低5個の漢字を選択してください')
      return
    }
    onKanjiSelected(Array.from(selectedKanji))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">学習したい漢字を選択</h2>
        <p className="text-gray-600">
          5〜20個の漢字を選択してください。AIが物語を生成します。
        </p>
      </div>

      {/* 選択状況 */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm">選択中の漢字</p>
            <p className="text-3xl font-bold">{selectedKanji.size} / 20</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearAll}
              disabled={selectedKanji.size === 0}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              クリア
            </button>
            <button
              onClick={handleGenerate}
              disabled={selectedKanji.size < 5}
              className="bg-white text-orange-600 px-6 py-2 rounded-lg font-bold hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <span>問題を作成する</span>
              {selectedKanji.size >= 5 && <Check className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 学年タブ */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex gap-2 mb-4 flex-wrap">
          {[1, 2, 3, 4, 5, 6].map(grade => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedGrade === grade
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              小{grade} ({gradeData[grade]?.length || 0}字)
            </button>
          ))}
        </div>

        {/* 検索バー */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="漢字・読み・意味で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* 一括選択ボタン */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
          >
            先頭20個を選択
          </button>
        </div>

        {/* 漢字グリッド */}
        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2">
          {filteredKanji.map(kanjiData => (
            <button
              key={kanjiData.kanji}
              onClick={() => handleKanjiToggle(kanjiData.kanji)}
              className={`aspect-square flex items-center justify-center text-2xl font-bold rounded-lg border-2 transition-all hover:scale-105 ${
                selectedKanji.has(kanjiData.kanji)
                  ? 'bg-orange-500 text-white border-orange-600 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
              }`}
              title={`${kanjiData.kanji} (${kanjiData.yomi})`}
            >
              {kanjiData.kanji}
            </button>
          ))}
        </div>

        {filteredKanji.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            検索結果がありません
          </div>
        )}
      </div>
    </div>
  )
}
