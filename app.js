// ==================================
// グローバル変数
// ==================================
let grade1Kanji = [];
let grade2Kanji = [];
let grade3Kanji = [];
let grade4Kanji = [];
let grade5Kanji = [];
let grade6Kanji = [];
let selectedQuestions = [];

// 🆕 テストモード（3つのモード）
const TEST_MODES = {
    PRACTICE: {
        name: '練習＋テスト',
        value: 'practice',
        leftSection: 'reading-test',   // 左=読みテスト（練習）
        rightSection: 'writing-test',  // 右=書きテスト
        questionCount: 10  // 🔧 10問（左右同じ10問を使用）
    },
    TEST10: {
        name: 'テスト10問',
        value: 'test10',
        leftSection: null,              // 左=なし
        rightSection: 'writing-test',   // 右=書きテスト
        questionCount: 10  // 右側だけ10問
    },
    TEST20: {
        name: 'テスト20問',
        value: 'test20',
        leftSection: 'writing-test',    // 左=書きテスト
        rightSection: 'writing-test',   // 右=書きテスト
        questionCount: 20  // 合計20問（左10問＋右10問）
    }
};

let currentTestMode = TEST_MODES.PRACTICE; // デフォルトは漢字練習モード
const MODE_STORAGE_KEY = 'kanji_test_mode';

// 🆕 最近出た漢字の履歴管理
let recentKanjiHistory = []; // [{kanji: '友', timestamp: 1234567890}, ...]
const HISTORY_STORAGE_KEY = 'kanji_recent_history';
const MAX_HISTORY_SIZE = 100; // 最大100個まで履歴を保持
const EXCLUDE_SETTING_KEY = 'kanji_exclude_setting'; // 🆕 除外設定の保存キー
const GRADE_COUNT_KEY = 'kanji_grade_count'; // 🆕 学年別問題数の保存キー

// 出題禁止漢字リスト（一〜十の数字は簡単すぎるため除外）
const EXCLUDED_KANJI = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

// 編集モード関連
let isEditMode = false;
let currentEditIndex = -1;
let editedQuestions = {}; // {"漢字": {sentence, onyomi, kunyomi, ...}} 漢字をキーにして管理
const STORAGE_KEY = 'kanji_worksheet_edits';

// 🆕 漢字選択機能
let selectedKanji = {
    1: [],  // 小1で選択された漢字
    2: [],  // 小2で選択された漢字
    3: [],  // 小3で選択された漢字
    4: [],  // 小4で選択された漢字
    5: [],  // 小5で選択された漢字
    6: []   // 小6で選択された漢字
};
const KANJI_SELECTION_KEY = 'kanji_selection';

// 🆕 学年データ（拡張性を考慮）
const GRADES = [
    { grade: 1, label: '小1', total: 80 },
    { grade: 2, label: '小2', total: 160 },
    { grade: 3, label: '小3', total: 200 },
    { grade: 4, label: '小4', total: 202 },
    { grade: 5, label: '小5', total: 193 },
    { grade: 6, label: '小6', total: 191 }
];

// ==================================
// 初期化処理
// ==================================
document.addEventListener('DOMContentLoaded', async () => {
    // JSONデータの読み込み
    await loadKanjiData();
    
    // 🆕 漢字選択状態の読み込み
    loadKanjiSelection();
    
    // 🆕 テストモードの読み込み
    loadTestMode();
    
    // 🆕 最近出た漢字の履歴を読み込み
    loadRecentHistory();
    
    // 🆕 除外設定を読み込み
    loadExcludeSetting();
    
    // 🆕 学年別問題数を読み込み
    loadGradeCount();
    
    // 🆕 漢字選択UIの構築
    buildKanjiSelectionUI();
    
    // 🆕 アコーディオンの状態を復元（デフォルトは閉じた状態）
    restoreAccordionState();
    
    // 🆕 生徒名を読み込み
    loadStudentName();
    
    // 今日の日付をセット
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('print-date').value = today;
    
    // イベントリスナーの設定
    setupEventListeners();
    
    // 保存された編集を読み込み
    loadSavedEdits();
});

// ==================================
// JSONデータの読み込み
// ==================================
async function loadKanjiData() {
    try {
        const [response1, response2, response3, response4, response5, response6] = await Promise.all([
            fetch('data/grade1_kanji.json'),
            fetch('data/grade2_kanji.json'),
            fetch('data/grade3_kanji.json'),
            fetch('data/grade4_kanji.json'),
            fetch('data/grade5_kanji.json'),
            fetch('data/grade6_kanji.json')
        ]);
        
        grade1Kanji = await response1.json();
        grade2Kanji = await response2.json();
        grade3Kanji = await response3.json();
        grade4Kanji = await response4.json();
        grade5Kanji = await response5.json();
        grade6Kanji = await response6.json();
        
        // 🆕 LocalStorageから編集データを読み込み（あれば上書き）
        const editedData = localStorage.getItem('kanji_edited_data');
        if (editedData) {
            try {
                const parsed = JSON.parse(editedData);
                grade1Kanji = parsed[1] || grade1Kanji;
                grade2Kanji = parsed[2] || grade2Kanji;
                grade3Kanji = parsed[3] || grade3Kanji;
                grade4Kanji = parsed[4] || grade4Kanji;
                grade5Kanji = parsed[5] || grade5Kanji;
                grade6Kanji = parsed[6] || grade6Kanji;
                console.log('✅ 編集データを読み込みました');
            } catch (error) {
                console.warn('編集データの読み込みに失敗:', error);
            }
        }
        
        console.log(`小1漢字: ${grade1Kanji.length}字 読み込み完了`);
        console.log(`小2漢字: ${grade2Kanji.length}字 読み込み完了`);
        console.log(`小3漢字: ${grade3Kanji.length}字 読み込み完了`);
        console.log(`小4漢字: ${grade4Kanji.length}字 読み込み完了`);
        console.log(`小5漢字: ${grade5Kanji.length}字 読み込み完了`);
        console.log(`小6漢字: ${grade6Kanji.length}字 読み込み完了`);
    } catch (error) {
        console.error('JSONファイルの読み込みエラー:', error);
        alert('漢字データの読み込みに失敗しました。');
    }
}


// ==================================
// イベントリスナーの設定
// ==================================
function setupEventListeners() {
    document.getElementById('generate-btn').addEventListener('click', generatePrint);
    document.getElementById('practice-btn').addEventListener('click', goToPractice);
    document.getElementById('print-btn').addEventListener('click', handlePrint);
    document.getElementById('back-btn').addEventListener('click', backToSettings);
    document.getElementById('regenerate-btn').addEventListener('click', generatePrint);
    
    // 編集モード関連
    document.getElementById('edit-mode-btn').addEventListener('click', toggleEditMode);
    document.getElementById('save-edit-btn').addEventListener('click', saveAllEdits);
    document.getElementById('cancel-edit-btn').addEventListener('click', closeEditDialog);
    document.getElementById('save-question-btn').addEventListener('click', saveQuestionEdit);
    
    // 🆕 解答表示切り替え
    document.getElementById('toggle-answer-btn').addEventListener('click', toggleAnswerSection);
    
    // 🆕 漢字選択アコーディオン切り替え
    document.getElementById('kanji-selection-toggle').addEventListener('click', toggleAccordion);
    
    // 🆕 漢字選択タブ切り替え
    document.querySelectorAll('.kanji-tab').forEach(tab => {
        tab.addEventListener('click', () => switchKanjiTab(tab.dataset.grade));
    });
    
    // 🆕 全選択・全解除・反転ボタン（各学年）
    GRADES.forEach(gradeInfo => {
        const grade = gradeInfo.grade;
        document.getElementById(`select-all-grade${grade}`).addEventListener('click', () => selectAllKanji(grade));
        document.getElementById(`deselect-all-grade${grade}`).addEventListener('click', () => deselectAllKanji(grade));
        document.getElementById(`invert-grade${grade}`).addEventListener('click', () => invertKanjiSelection(grade));
    });
    
    // 🆕 漢字検索機能
    document.getElementById('kanji-search-input').addEventListener('input', handleKanjiSearch);
    document.getElementById('kanji-search-input').addEventListener('keydown', handleSearchKeydown);
    document.getElementById('kanji-search-clear').addEventListener('click', clearKanjiSearch);
    
    // 🆕 モード選択の変更検知
    document.querySelectorAll('input[name="test-mode"]').forEach(radio => {
        radio.addEventListener('change', handleModeChange);
    });
    
    // 🆕 生徒名の入力時に自動保存
    const studentNameInput = document.getElementById('student-name');
    if (studentNameInput) {
        studentNameInput.addEventListener('input', saveStudentName);
        studentNameInput.addEventListener('change', saveStudentName);
    }
    
    // 🆕 学年別問題数の変更検知
    GRADES.forEach(gradeInfo => {
        const grade = gradeInfo.grade;
        document.getElementById(`grade${grade}-count`).addEventListener('change', () => {
            updateQuestionCountStatus();
            saveGradeCount(); // 🆕 変更時に保存
        });
    });
    
    // 🆕 除外設定の変更検知
    document.getElementById('exclude-recent').addEventListener('change', saveExcludeSetting);
    
    // 初回表示時にステータスを更新
    updateQuestionCountStatus();
}

// ==================================
// 問題数ステータスの更新
// ==================================
function updateQuestionCountStatus() {
    // モードに応じた目標問題数を取得
    const targetTotal = currentTestMode.questionCount;
    
    let currentTotal = 0;
    
    GRADES.forEach(gradeInfo => {
        const grade = gradeInfo.grade;
        const count = parseInt(document.getElementById(`grade${grade}-count`).value) || 0;
        currentTotal += count;
    });
    
    document.getElementById('mode-name').textContent = currentTestMode.name;
    document.getElementById('current-total').textContent = currentTotal;
    document.getElementById('target-total').textContent = targetTotal;
    
    const validationSpan = document.getElementById('count-validation');
    if (currentTotal === targetTotal) {
        validationSpan.textContent = '✓';
        validationSpan.className = 'validation-ok';
    } else {
        validationSpan.textContent = '✗';
        validationSpan.className = 'validation-error';
    }
}

// ==================================
// プリント生成
// ==================================
function generatePrint() {
    console.log('🎯 プリント生成開始');
    
    // 🆕 モードによって自動的に問題数を決定
    const totalQuestions = currentTestMode.questionCount;
    console.log(`📝 必要問題数: ${totalQuestions}問 (${currentTestMode.name}モード)`);
    
    // 学年別の問題数取得とデータマップ
    const gradeDataMap = {
        1: grade1Kanji,
        2: grade2Kanji,
        3: grade3Kanji,
        4: grade4Kanji,
        5: grade5Kanji,
        6: grade6Kanji
    };
    
    // 🆕 学年別の問題数を取得
    const gradeCounts = {};
    let actualTotal = 0;
    
    GRADES.forEach(gradeInfo => {
        const grade = gradeInfo.grade;
        const count = parseInt(document.getElementById(`grade${grade}-count`).value) || 0;
        gradeCounts[grade] = count;
        actualTotal += count;
    });
    
    // 🆕 問題数の合計チェック
    console.log(`📊 学年別問題数:`, gradeCounts);
    console.log(`📊 合計: ${actualTotal}問`);
    
    if (actualTotal !== totalQuestions) {
        alert(`❌ 問題数の合計が一致していません。\n\n${currentTestMode.name}モード: ${totalQuestions}問\n現在の合計: ${actualTotal}問\n\n各学年の問題数を調整してください。`);
        return;
    }
    
    // 🆕 除外する漢字リストを取得
    const excludedKanji = getExcludedKanji();
    
    // 各学年の選択漢字チェックと問題生成
    selectedQuestions = [];
    
    for (const gradeInfo of GRADES) {
        const grade = gradeInfo.grade;
        const count = gradeCounts[grade];
        
        if (count === 0) continue;
        
        console.log(`\n📚 小${grade}漢字の処理開始`);
        console.log(`  必要数: ${count}問`);
        console.log(`  選択済み漢字数: ${selectedKanji[grade].length}個`);
        
        // 選択された漢字のみを使用
        let gradeSelected = gradeDataMap[grade].filter(k => selectedKanji[grade].includes(k.kanji));
        console.log(`  フィルター後: ${gradeSelected.length}個`);
        
        // 🆕 最近出た漢字を除外
        if (excludedKanji.length > 0) {
            gradeSelected = gradeSelected.filter(k => !excludedKanji.includes(k.kanji));
            console.log(`  除外後: ${gradeSelected.length}個`);
        }
        
        // 選択数チェック
        if (gradeSelected.length < count) {
            console.error(`❌ 小${grade}漢字が不足しています`);
            alert(`小${grade}漢字の選択が不足しています（除外後）。\n必要: ${count}問\n選択可能: ${gradeSelected.length}個\n\n除外設定を変更するか、もっと漢字を選択してください。`);
            return;
        }
        
        console.log(`  ✅ 選択可能: ${gradeSelected.length}個 >= ${count}問`);
        
        // ランダムに選択
        const selected = getRandomItems(gradeSelected, count);
        selectedQuestions.push(...selected);
    }
    
    // シャッフル（順番をランダムに）
    shuffleArray(selectedQuestions);
    
    // 例文を生成
    generateSentences();
    
    // 🆕 出題した漢字を履歴に追加
    const usedKanji = selectedQuestions.map(q => q.kanji);
    addToHistory(usedKanji);
    
    // プリント表示
    displayPrint();
    
    // 画面切り替え
    document.getElementById('settings-screen').classList.add('hidden');
    const printScreen = document.getElementById('print-screen');
    printScreen.classList.remove('hidden');
    printScreen.classList.add('active');  // 🆕 表示中であることを明示
}

// ==================================
// 手書き練習ページへ遷移
// ==================================
function goToPractice() {
    console.log('🎯 手書き練習へ遷移');
    
    // 学年別問題数を取得
    const gradeCounts = {};
    for (const gradeInfo of GRADES) {
        const count = parseInt(document.getElementById(`grade${gradeInfo.grade}-count`).value) || 0;
        gradeCounts[gradeInfo.grade] = count;
    }
    
    // 合計問題数を確認
    const totalQuestions = Object.values(gradeCounts).reduce((sum, count) => sum + count, 0);
    
    if (totalQuestions === 0) {
        alert('❌ 練習する漢字を選択してください。\n\n学年別問題数を1以上に設定してください。');
        return;
    }
    
    // 学年別データマップ
    const gradeDataMap = {
        1: grade1Kanji,
        2: grade2Kanji,
        3: grade3Kanji,
        4: grade4Kanji,
        5: grade5Kanji,
        6: grade6Kanji
    };
    
    // 選択された漢字を収集
    const practiceKanjiList = [];
    
    for (const gradeInfo of GRADES) {
        const grade = gradeInfo.grade;
        const count = gradeCounts[grade];
        
        if (count > 0) {
            const gradeKanji = gradeDataMap[grade];
            
            // 選択された漢字をフィルタリング
            const gradeSelected = gradeKanji.filter(k => 
                selectedKanji[grade] && selectedKanji[grade].includes(k.kanji)
            );
            
            if (gradeSelected.length < count) {
                alert(`❌ 小${grade}の漢字が足りません。\n\n必要: ${count}個\n利用可能: ${gradeSelected.length}個\n\nもっと漢字を選択してください。`);
                return;
            }
            
            // ランダムに選択
            const selected = getRandomItems(gradeSelected, count);
            practiceKanjiList.push(...selected);
        }
    }
    
    // シャッフル
    practiceKanjiList.sort(() => Math.random() - 0.5);
    
    console.log(`📚 練習する漢字: ${practiceKanjiList.length}個`);
    console.log(`🎯 テストモード: ${currentTestMode.name}`);
    
    // URLパラメータとして渡す（テストモード情報も含める）
    const kanjiParam = encodeURIComponent(JSON.stringify(practiceKanjiList));
    const modeParam = currentTestMode.value; // 'practice', 'test10', 'test20'
    window.location.href = `practice.html?kanji=${kanjiParam}&mode=${modeParam}`;
}

// ==================================
// 配列からランダムにn個取得
// ==================================
function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// ==================================
// 配列をシャッフル
// ==================================
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ==================================
// 例文を生成（選択された漢字のみ使用）
// ==================================
function generateSentences() {
    // 🆕 選択された漢字のみを使用（全学年対応）
    const allowedKanjiList = [
        ...selectedKanji[1],
        ...selectedKanji[2],
        ...selectedKanji[3],
        ...selectedKanji[4],
        ...selectedKanji[5],
        ...selectedKanji[6]
    ];
    
    selectedQuestions.forEach(question => {
        const kanji = question.kanji;
        let processedSentence = '';
        let attempts = 0;
        const maxAttempts = 5;
        
        // 🆕 編集済みデータがあればそれを使用
        const editedData = editedQuestions[kanji];
        if (editedData && editedData.sentence) {
            question.sentence = editedData.sentence;
            
            // 読みも編集データを反映
            const yomiParts = [];
            if (editedData.onyomi) yomiParts.push(editedData.onyomi);
            if (editedData.kunyomi) yomiParts.push(editedData.kunyomi);
            if (yomiParts.length > 0) {
                question.yomi = yomiParts.join('、');
            }
            
            // 処理済み文を生成
            question.processedSentence = processTextForTest(question.sentence, kanji, allowedKanjiList);
            console.log(`編集済みデータを適用 [${kanji}]: ${question.sentence}`);
            return; // 以降の処理をスキップ
        }
        
        // 🚫 CSVの例文は品質が低いため使用しない
        // const testSentenceData = grade1TestSentences[kanji] || grade2TestSentences[kanji] || grade3TestSentences[kanji] || grade4TestSentences[kanji] || grade5TestSentences[kanji] || grade6TestSentences[kanji];
        
        // if (testSentenceData) {
        //     // 音読み・訓読みからランダムに選択（両方ある場合）
        //     const sentences = [];
        //     if (testSentenceData.onyomi) sentences.push(testSentenceData.onyomi);
        //     if (testSentenceData.kunyomi) sentences.push(testSentenceData.kunyomi);
        //     
        //     if (sentences.length > 0) {
        //         const selectedSentence = sentences[Math.floor(Math.random() * sentences.length)];
        //         question.sentence = selectedSentence;
        //         question.processedSentence = selectedSentence; // 🔧 そのまま使用（処理不要）
        //         console.log(`✅ テスト例文使用 [${kanji}]: ${selectedSentence}`);
        //         return; // 処理完了
        //     }
        // }
        
        // 最大5回まで再試行（正しい文章が生成されるまで）
        while (attempts < maxAttempts) {
            // JSONに含まれる例文から文章形式を優先的に選択
            if (question.examples && question.examples.length > 0) {
                const selectedExample = selectBestExample(question.examples, kanji);
                question.sentence = selectedExample;
                
                // 🆕 JSONのreadingsを使ってカタカナ変換済みの文を取得
                if (question.readings && question.readings[selectedExample]) {
                    question.processedSentence = question.readings[selectedExample];
                    console.log(`✅ JSONの例文使用 [${kanji}]: ${selectedExample} → ${question.processedSentence}`);
                    break; // 処理完了
                }
            } else {
                // 例文がない場合は簡単な文を生成
                question.sentence = `${kanji}を見る。`;
            }
            
            // readingsがない場合は自動処理
            // 文章を処理（問題漢字→カタカナ、範囲外漢字→ひらがな）
            processedSentence = processTextForTest(question.sentence, kanji, allowedKanjiList);
            
            // 品質チェック
            const checkResult = validateSentence(processedSentence, question.sentence);
            
            if (checkResult.isValid) {
                // 問題なし、ループを抜ける
                question.processedSentence = processedSentence;
                break;
            } else {
                // 問題あり：修正を試みる
                console.warn(`問題検出 [${kanji}]: ${checkResult.issues.join(', ')}`);
                
                // 修正を試みる
                const fixed = fixSentenceIssues(processedSentence, question.sentence, kanji, allowedKanjiList);
                
                if (fixed.isFixed) {
                    question.processedSentence = fixed.sentence;
                    console.log(`自動修正成功 [${kanji}]: ${fixed.sentence}`);
                    break;
                }
                
                // 修正できない場合は別の例文を試す
                attempts++;
                
                if (attempts >= maxAttempts) {
                    // 最終的に修正できない場合はデフォルト文を使用
                    console.error(`修正失敗 [${kanji}]: デフォルト文を使用`);
                    question.sentence = `${kanji}を使う`;
                    question.processedSentence = processTextForTest(question.sentence, kanji, allowedKanjiList);
                }
            }
        }
    });
}

// ==================================
// テキスト処理（問題漢字→カタカナ、範囲外漢字→ひらがな）
// ==================================
function processTextForTest(text, targetKanji, allowedKanji) {
    // ステップ1: 問題漢字をカタカナに変換（文脈考慮してパターンマッチ）
    let processed = replaceKanjiWithKatakana(text, targetKanji);
    
    // ステップ2: 範囲外の漢字をひらがなに変換
    let result = '';
    for (let char of processed) {
        if (isKanji(char)) {
            // 出題範囲内の漢字ならそのまま、それ以外はひらがなに
            if (allowedKanji.includes(char)) {
                result += char;
            } else {
                result += kanjiToHiragana(char);
            }
        } else {
            result += char;
        }
    }
    
    return result;
}

// ==================================
// 漢字かどうかを判定
// ==================================
function isKanji(char) {
    const code = char.charCodeAt(0);
    return (code >= 0x4E00 && code <= 0x9FFF) || // CJK統合漢字
           (code >= 0x3400 && code <= 0x4DBF);   // CJK統合漢字拡張A
}

// ==================================
// 漢字をひらがなに変換
// ==================================
function kanjiToHiragana(kanji) {
    // JSONデータから読みを取得
    const kanjiData = [...grade1Kanji, ...grade2Kanji].find(k => k.kanji === kanji);
    
    if (kanjiData && kanjiData.yomi) {
        // 訓読み（ひらがな）を優先的に返す
        const readings = kanjiData.yomi.split('、');
        for (let reading of readings) {
            if (isHiraganaOnly(reading)) {
                return reading;
            }
        }
        // 訓読みがない場合は音読みをひらがなに変換
        const yomi = readings[0];
        return katakanaToHiragana(yomi);
    }
    
    // 見つからない場合はそのまま返す
    return kanji;
}

// ==================================
// 漢字をカタカナに変換（文脈を考慮してパターン置換）
// ==================================
function replaceKanjiWithKatakana(text, kanji) {
    // JSONデータから読みを取得
    const kanjiData = [...grade1Kanji, ...grade2Kanji].find(k => k.kanji === kanji);
    
    if (kanjiData && kanjiData.readings) {
        // readingsフィールドから最長一致するパターンを探す（長い順にソート）
        const patterns = Object.keys(kanjiData.readings).sort((a, b) => b.length - a.length);
        
        for (let pattern of patterns) {
            if (text.includes(pattern)) {
                const reading = kanjiData.readings[pattern];
                // パターン全体を読みで置換（最初の1回のみ）
                return text.replace(pattern, reading);
            }
        }
    }
    
    // readingsフィールドがない場合、漢字を結果だけ変換
    if (kanjiData && kanjiData.yomi) {
        const readings = kanjiData.yomi.split('、');
        let katakanaReading = '';
        
        // 訓読みを優先
        for (let reading of readings) {
            if (isHiraganaOnly(reading)) {
                katakanaReading = hiraganaToKatakana(reading);
                break;
            }
        }
        
        // 訓読みがない場合は音読み
        if (!katakanaReading) {
            katakanaReading = readings[0];
        }
        
        // 漢字だけを置換
        return text.replace(kanji, katakanaReading);
    }
    
    // データがない場合はそのまま
    return text;
}

// ==================================
// ひらがなをカタカナに変換
// ==================================
function hiraganaToKatakana(str) {
    return str.replace(/[ぁ-ん]/g, (match) => {
        const chr = match.charCodeAt(0) + 0x60;
        return String.fromCharCode(chr);
    });
}

// ==================================
// プリント表示
// ==================================
function displayPrint() {
    // 🆕 モードによって異なる表示処理に分岐
    if (currentTestMode.value === 'test10') {
        displayTest10Print();  // テスト10問（右側のみ）
    } else if (currentTestMode.value === 'test20') {
        displayTest20Print();  // テスト20問（左右両方）
    } else {
        displayPracticePrint();  // 練習＋テスト（デフォルト）
    }
}

// ==================================
// 漢字練習モードの表示（既存処理を関数化）
// ==================================
function displayPracticePrint() {
    // ヘッダー情報
    const studentName = document.getElementById('student-name').value || '__________';
    const printDate = document.getElementById('print-date').value;
    
    // 🆕 練習＋テストモードでは最初の10問だけを使う
    const questionsToDisplay = selectedQuestions.slice(0, 10);
    const totalQuestions = questionsToDisplay.length;
    const questionsPerPage = 10; // 1ページあたり10問
    const needsSecondPage = totalQuestions > questionsPerPage;
    
    // 🆕 問題数が1以上の学年を取得してタイトルを更新
    const enabledGrades = [];
    questionsToDisplay.forEach(question => {
        // 各問題が属する学年を特定
        for (const gradeInfo of GRADES) {
            const grade = gradeInfo.grade;
            const gradeData = [grade1Kanji, grade2Kanji, grade3Kanji, grade4Kanji, grade5Kanji, grade6Kanji][grade - 1];
            if (gradeData.some(k => k.kanji === question.kanji)) {
                if (!enabledGrades.includes(gradeInfo.label)) {
                    enabledGrades.push(gradeInfo.label);
                }
                break;
            }
        }
    });
    
    const gradeTitle = enabledGrades.length > 0 ? enabledGrades.join('・') : '小学生';
    
    // 🆕 2ページ目が必要な場合は、既存のprint-containerを複製
    const printScreen = document.getElementById('print-screen');
    const existingContainers = printScreen.querySelectorAll('.print-container');
    
    // 既存の2ページ目以降を削除
    if (existingContainers.length > 1) {
        for (let i = 1; i < existingContainers.length; i++) {
            existingContainers[i].remove();
        }
    }
    
    // 1ページ目のタイトルとヘッダー情報を更新
    document.querySelector('.print-title').textContent = `${gradeTitle}漢字練習プリント`;
    document.getElementById('display-name').textContent = studentName;
    
    if (printDate) {
        const date = new Date(printDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        document.getElementById('display-date').textContent = `${year}年${month}月${day}日`;
    } else {
        document.getElementById('display-date').textContent = '____年____月____日';
    }
    
    // 🆕 2ページ目が必要な場合、2ページ目のコンテナを作成
    let page2Container = null;
    if (needsSecondPage) {
        page2Container = existingContainers[0].cloneNode(true);
        page2Container.classList.add('page-2');
        
        // 2ページ目のID要素を更新
        page2Container.querySelector('#display-name').id = 'display-name-2';
        page2Container.querySelector('#display-date').id = 'display-date-2';
        
        // 2ページ目のタイトルも更新
        page2Container.querySelector('.print-title').textContent = `${gradeTitle}漢字練習プリント（2ページ目）`;
        
        // ヘッダー情報を設定
        page2Container.querySelector('#display-name-2').textContent = studentName;
        if (printDate) {
            const date = new Date(printDate);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            page2Container.querySelector('#display-date-2').textContent = `${year}年${month}月${day}日`;
        } else {
            page2Container.querySelector('#display-date-2').textContent = '____年____月____日';
        }
        
        // print-controlsの直前に挿入
        const printControls = printScreen.querySelector('.print-controls');
        printScreen.insertBefore(page2Container, printControls);
    }
    
    // 🆕 練習欄の生成（4分割レイアウト）
    const printContainer = document.querySelector('.print-container');
    
    // 🔧 既存の練習アイテムをすべて削除
    printContainer.querySelectorAll('.practice-item').forEach(el => el.remove());
    
    // 2ページ目があればそちらも削除
    if (needsSecondPage && page2Container) {
        page2Container.querySelectorAll('.practice-item').forEach(el => el.remove());
    }
    
    questionsToDisplay.forEach((question, index) => {
        const practiceItem = document.createElement('div');
        practiceItem.className = 'practice-item';
        
        // 🆕 漢字をキーにして編集データを取得
        const editedData = editedQuestions[question.kanji];
        const isEdited = editedData && editedData.isEdited;
        
        if (isEdited) {
            practiceItem.style.background = 'rgba(46, 204, 113, 0.1)';
        }
        
        // 漢字と読み仮名のコンテナ
        const kanjiContainer = document.createElement('div');
        kanjiContainer.className = 'kanji-container';
        
        // 音読みと訓読みを分離（編集データを優先）
        let readings;
        if (editedData) {
            readings = {
                onyomi: editedData.onyomi || null,
                kunyomi: editedData.kunyomi || null
            };
        } else {
            readings = separateReadings(question.yomi);
        }
        
        // 音読み（右側）
        if (readings.onyomi) {
            const onyomiDiv = document.createElement('div');
            onyomiDiv.className = 'practice-onyomi';
            onyomiDiv.textContent = readings.onyomi;
            kanjiContainer.appendChild(onyomiDiv);
        }
        
        // 漢字（中央）
        const kanjiDiv = document.createElement('div');
        kanjiDiv.className = 'practice-kanji';
        kanjiDiv.textContent = question.kanji;
        kanjiContainer.appendChild(kanjiDiv);
        
        // 訓読み（左側）
        if (readings.kunyomi) {
            const kunyomiDiv = document.createElement('div');
            kunyomiDiv.className = 'practice-kunyomi';
            kunyomiDiv.textContent = readings.kunyomi;
            kanjiContainer.appendChild(kunyomiDiv);
        }
        
        const boxesContainer = document.createElement('div');
        boxesContainer.className = 'practice-boxes';
        
        // 4つの練習枠を作成
        for (let i = 0; i < 4; i++) {
            const box = document.createElement('div');
            box.className = 'practice-box';
            
            // 🆕 1つ目のマスになぞり用の薄い漢字を表示
            if (i === 0) {
                const traceKanji = document.createElement('div');
                traceKanji.className = 'trace-kanji';
                traceKanji.textContent = question.kanji;
                box.appendChild(traceKanji);
            }
            
            boxesContainer.appendChild(box);
        }
        
        practiceItem.appendChild(kanjiContainer);
        practiceItem.appendChild(boxesContainer);
        
        // 🆕 個別配置：各問題の座標を計算
        const pageIndex = Math.floor(index / questionsPerPage);
        const questionIndex = index % questionsPerPage;
        const isTopHalf = questionIndex < 5;
        const columnIndex = questionIndex % 5;
        
        // 座標計算（右側、縦書きなので右から左へ）
        const rightBase = 2; // 右端からの開始位置(mm)
        const columnWidth = (143 - 4) / 5; // 右半分の幅を5等分
        const topBase = isTopHalf ? 14 : (105 + 4); // 上半分 or 下半分
        
        practiceItem.style.position = 'absolute';
        practiceItem.style.right = `${rightBase + (columnIndex * columnWidth)}mm`;
        practiceItem.style.top = `${topBase}mm`;
        practiceItem.style.width = `${columnWidth - 2}mm`;
        practiceItem.style.height = isTopHalf ? 'calc(50% - 12mm)' : 'calc(50% - 12mm)';
        
        // ページを判定
        if (pageIndex === 0) {
            printContainer.appendChild(practiceItem);
        } else if (page2Container) {
            page2Container.appendChild(practiceItem);
        }
    });
    
    // 🆕 テスト欄の生成（4分割レイアウト）
    // 🔧 既存のテストアイテムをすべて削除
    printContainer.querySelectorAll('.test-item').forEach(el => el.remove());
    
    // 2ページ目があればそちらも削除
    if (needsSecondPage && page2Container) {
        page2Container.querySelectorAll('.test-item').forEach(el => el.remove());
    }
    
    questionsToDisplay.forEach((question, index) => {
        const testItem = document.createElement('div');
        testItem.className = 'test-item';
        
        // 🆕 漢字をキーにして編集データを取得
        const editedData = editedQuestions[question.kanji];
        const isEdited = editedData && editedData.isEdited;
        
        if (isEdited) {
            testItem.style.background = 'rgba(46, 204, 113, 0.1)';
        }
        
        // 🆕 問題番号と問題文を1つのテキストに統合
        const questionText = document.createElement('div');
        questionText.className = 'test-question-text';
        questionText.textContent = `${index + 1} ${question.processedSentence}`;
        
        // 解答欄
        const answerLine = document.createElement('div');
        answerLine.className = 'answer-line';
        answerLine.textContent = '（　　　　　　）';
        
        testItem.appendChild(questionText);
        testItem.appendChild(answerLine);
        
        // 🆕 個別配置：各問題の座標を計算
        const pageIndex = Math.floor(index / questionsPerPage);
        const questionIndex = index % questionsPerPage;
        const isTopHalf = questionIndex < 5;
        const columnIndex = questionIndex % 5;
        
        // 座標計算（左側、縦書きなので右から左へ）
        const leftBase = 2; // 左端からの開始位置(mm)
        const columnWidth = (143 - 4) / 5; // 左半分の幅を5等分
        const topBase = isTopHalf ? 14 : (105 + 4); // 上半分 or 下半分
        
        testItem.style.position = 'absolute';
        testItem.style.left = `${leftBase + ((4 - columnIndex) * columnWidth)}mm`; // 左側は逆順
        testItem.style.top = `${topBase}mm`;
        testItem.style.width = `${columnWidth - 2}mm`;
        testItem.style.height = isTopHalf ? 'calc(50% - 12mm)' : 'calc(50% - 12mm)';
        
        // ページを判定
        if (pageIndex === 0) {
            printContainer.appendChild(testItem);
        } else if (page2Container) {
            page2Container.appendChild(testItem);
        }
    });
}

// ==================================
// 🆕 テスト10問モードの表示（右側のみ）
// ==================================
function displayTest10Print() {
    const studentName = document.getElementById('student-name').value || '__________';
    const printDate = document.getElementById('print-date').value;
    
    // 学年タイトルを取得
    const enabledGrades = [];
    selectedQuestions.forEach(question => {
        for (const gradeInfo of GRADES) {
            const grade = gradeInfo.grade;
            const gradeData = [grade1Kanji, grade2Kanji, grade3Kanji, grade4Kanji, grade5Kanji, grade6Kanji][grade - 1];
            if (gradeData.some(k => k.kanji === question.kanji)) {
                if (!enabledGrades.includes(gradeInfo.label)) {
                    enabledGrades.push(gradeInfo.label);
                }
                break;
            }
        }
    });
    
    const gradeTitle = enabledGrades.length > 0 ? enabledGrades.join('・') : '小学生';
    
    // ヘッダー情報を更新
    document.querySelector('.print-title').textContent = `${gradeTitle}漢字テスト（10問）`;
    document.getElementById('display-name').textContent = studentName;
    
    if (printDate) {
        const date = new Date(printDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        document.getElementById('display-date').textContent = `${year}年${month}月${day}日`;
    } else {
        document.getElementById('display-date').textContent = '____年____月____日';
    }
    
    const printContainer = document.querySelector('.print-container');
    
    // 既存のアイテムをすべて削除
    printContainer.querySelectorAll('.practice-item, .test-item').forEach(el => el.remove());
    
    // 右側にテスト問題を配置
    selectedQuestions.forEach((question, index) => {
        const testItem = document.createElement('div');
        testItem.className = 'test-item';
        
        const editedData = editedQuestions[question.kanji];
        if (editedData && editedData.isEdited) {
            testItem.style.background = 'rgba(46, 204, 113, 0.1)';
        }
        
        const questionText = document.createElement('div');
        questionText.className = 'test-question-text';
        questionText.textContent = `${index + 1} ${question.processedSentence}`;
        
        const answerLine = document.createElement('div');
        answerLine.className = 'answer-line';
        answerLine.textContent = '（　　　　　　）';
        
        testItem.appendChild(questionText);
        testItem.appendChild(answerLine);
        
        // 右側に配置（練習欄の位置）
        const isTopHalf = index < 5;
        const columnIndex = index % 5;
        const rightBase = 2;
        const columnWidth = (143 - 4) / 5;
        const topBase = isTopHalf ? 14 : (105 + 4);
        
        testItem.style.position = 'absolute';
        testItem.style.right = `${rightBase + (columnIndex * columnWidth)}mm`;
        testItem.style.top = `${topBase}mm`;
        testItem.style.width = `${columnWidth - 2}mm`;
        testItem.style.height = isTopHalf ? 'calc(50% - 12mm)' : 'calc(50% - 12mm)';
        
        printContainer.appendChild(testItem);
    });
}

// ==================================
// 🆕 テスト20問モードの表示（左右両方）
// ==================================
function displayTest20Print() {
    const studentName = document.getElementById('student-name').value || '__________';
    const printDate = document.getElementById('print-date').value;
    
    // 学年タイトルを取得
    const enabledGrades = [];
    selectedQuestions.forEach(question => {
        for (const gradeInfo of GRADES) {
            const grade = gradeInfo.grade;
            const gradeData = [grade1Kanji, grade2Kanji, grade3Kanji, grade4Kanji, grade5Kanji, grade6Kanji][grade - 1];
            if (gradeData.some(k => k.kanji === question.kanji)) {
                if (!enabledGrades.includes(gradeInfo.label)) {
                    enabledGrades.push(gradeInfo.label);
                }
                break;
            }
        }
    });
    
    const gradeTitle = enabledGrades.length > 0 ? enabledGrades.join('・') : '小学生';
    
    // ヘッダー情報を更新
    document.querySelector('.print-title').textContent = `${gradeTitle}漢字テスト（20問）`;
    document.getElementById('display-name').textContent = studentName;
    
    if (printDate) {
        const date = new Date(printDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        document.getElementById('display-date').textContent = `${year}年${month}月${day}日`;
    } else {
        document.getElementById('display-date').textContent = '____年____月____日';
    }
    
    const printContainer = document.querySelector('.print-container');
    
    // 既存のアイテムをすべて削除
    printContainer.querySelectorAll('.practice-item, .test-item').forEach(el => el.remove());
    
    // 左右両方にテスト問題を配置
    selectedQuestions.forEach((question, index) => {
        const testItem = document.createElement('div');
        testItem.className = 'test-item';
        
        const editedData = editedQuestions[question.kanji];
        if (editedData && editedData.isEdited) {
            testItem.style.background = 'rgba(46, 204, 113, 0.1)';
        }
        
        const questionText = document.createElement('div');
        questionText.className = 'test-question-text';
        questionText.textContent = `${index + 1} ${question.processedSentence}`;
        
        const answerLine = document.createElement('div');
        answerLine.className = 'answer-line';
        answerLine.textContent = '（　　　　　　）';
        
        testItem.appendChild(questionText);
        testItem.appendChild(answerLine);
        
        // 座標計算
        const isRightHalf = index < 10;  // 1-10問は右側、11-20問は左側
        const questionIndex = index % 10;
        const isTopHalf = questionIndex < 5;
        const columnIndex = questionIndex % 5;
        const columnWidth = (143 - 4) / 5;
        const topBase = isTopHalf ? 14 : (105 + 4);
        
        testItem.style.position = 'absolute';
        testItem.style.top = `${topBase}mm`;
        testItem.style.width = `${columnWidth - 2}mm`;
        testItem.style.height = isTopHalf ? 'calc(50% - 12mm)' : 'calc(50% - 12mm)';
        
        if (isRightHalf) {
            // 右側（1-10問）
            const rightBase = 2;
            testItem.style.right = `${rightBase + (columnIndex * columnWidth)}mm`;
        } else {
            // 左側（11-20問）
            const leftBase = 2;
            testItem.style.left = `${leftBase + ((4 - columnIndex) * columnWidth)}mm`;
        }
        
        printContainer.appendChild(testItem);
    });
}

// ==================================
// 設定画面に戻る
// ==================================
function backToSettings() {
    // 解答セクションを非表示にリセット
    const answerSection = document.getElementById('answer-section');
    if (answerSection) {
        answerSection.classList.add('hidden');
        answerSection.innerHTML = '';
    }
    
    const toggleBtn = document.getElementById('toggle-answer-btn');
    if (toggleBtn) {
        toggleBtn.textContent = '👁️ 解答を表示';
    }
    
    const printScreen = document.getElementById('print-screen');
    printScreen.classList.add('hidden');
    printScreen.classList.remove('active');  // 🆕 非表示状態を明示
    document.getElementById('settings-screen').classList.remove('hidden');
}

// ==================================
// 🆕 印刷ハンドラー
// ==================================
function handlePrint() {
    // 印刷前にユーザーに案内
    const message = `
📋 印刷設定の確認

印刷ダイアログで以下を設定してください：

✅ 用紙サイズ：A4
✅ 向き：横向き
✅ カラー：オフ（白黒）

これで印刷コストを節約できます！
    `.trim();
    
    // アラートは表示せず、直接印刷
    window.print();
}

// ==================================
// 🆕 解答表示切り替え
// ==================================
function toggleAnswerSection() {
    const answerSection = document.getElementById('answer-section');
    const toggleBtn = document.getElementById('toggle-answer-btn');
    
    if (answerSection.classList.contains('hidden')) {
        // 解答を表示
        generateAnswerSection();
        answerSection.classList.remove('hidden');
        toggleBtn.textContent = '🙈 解答を非表示';
    } else {
        // 解答を非表示
        answerSection.classList.add('hidden');
        toggleBtn.textContent = '👁️ 解答を表示';
    }
}

// ==================================
// 🆕 解答セクションを生成（問題と同じA4縦書きレイアウト）
// ==================================
function generateAnswerSection() {
    const answerSection = document.getElementById('answer-section');
    answerSection.innerHTML = '';
    
    const title = document.createElement('h3');
    title.textContent = '📋 解答一覧';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    title.style.color = '#2c3e50';
    answerSection.appendChild(title);
    
    // 解答用のprint-containerを作成（問題ページと同じ構造）
    const answerContainer = document.createElement('div');
    answerContainer.className = 'print-container answer-container';
    
    selectedQuestions.forEach((question, index) => {
        const answerItem = document.createElement('div');
        answerItem.className = 'answer-test-item';
        
        // 編集データを優先
        const editedData = editedQuestions[question.kanji];
        let displaySentence = editedData?.sentence || question.sentence || '';
        
        if (currentTestMode.value === 'reading') {
            // 🎯 読みテストモード：問題と同じ文章表示 + 解答（ひらがな読み）を青色で表示
            const restoredSentence = restoreKatakanaToKanji(displaySentence, question.kanji, question.readingType);
            
            // 問題文（漢字に傍線）
            const questionText = document.createElement('div');
            questionText.className = 'test-question-text';
            
            const sentenceWithUnderline = restoredSentence.replace(
                new RegExp(question.kanji, 'g'),
                `<span class="target-kanji-underline">${question.kanji}</span>`
            );
            
            questionText.innerHTML = `${index + 1} ${sentenceWithUnderline}`;
            answerItem.appendChild(questionText);
            
            // 🆕 解答欄（ひらがな読みを青色で表示）
            const answerLine = document.createElement('div');
            answerLine.className = 'answer-line answer-text';
            
            let displayReading = '';
            if (editedData) {
                if (question.readingType === 'onyomi' && editedData.onyomi) {
                    displayReading = editedData.onyomi;
                } else if (question.readingType === 'kunyomi' && editedData.kunyomi) {
                    displayReading = editedData.kunyomi;
                }
            }
            
            if (!displayReading && question.reading) {
                displayReading = question.reading;
            }
            
            // カタカナをひらがなに変換
            displayReading = katakanaToHiragana(displayReading || '？');
            
            answerLine.textContent = `（${displayReading}）`;
            answerItem.appendChild(answerLine);
            
        } else {
            // 🎯 漢字練習モード：問題と同じカタカナ穴埋め文章 + 解答（漢字）を赤色で表示
            const questionText = document.createElement('div');
            questionText.className = 'test-question-text';
            questionText.textContent = `${index + 1} ${question.processedSentence || displaySentence}`;
            answerItem.appendChild(questionText);
            
            // 🆕 解答欄（漢字を赤色で表示）
            const answerLine = document.createElement('div');
            answerLine.className = 'answer-line answer-kanji-text';
            answerLine.textContent = `（${question.kanji}）`;
            answerItem.appendChild(answerLine);
        }
        
        // 🆕 絶対配置で位置を設定（問題ページと完全に同じロジック）
        const questionsPerHalf = 10;
        const isRightHalf = index < questionsPerHalf;
        const questionIndex = index % questionsPerHalf;
        const isTopHalf = questionIndex < 5;
        const columnIndex = questionIndex % 5;
        
        const rightBase = 12;
        const leftBase = 2;
        const columnWidth = (143 - 4) / 5;
        const topBase = isTopHalf ? 14 : (105 + 4);
        
        answerItem.style.position = 'absolute';
        
        if (isRightHalf) {
            answerItem.style.right = `${rightBase + (columnIndex * columnWidth)}mm`;
        } else {
            answerItem.style.left = `${leftBase + ((4 - columnIndex) * columnWidth)}mm`;
        }
        
        answerItem.style.top = `${topBase}mm`;
        answerItem.style.width = `${columnWidth - 2}mm`;
        answerItem.style.height = isTopHalf ? 'calc(50% - 12mm)' : 'calc(50% - 12mm)';
        
        answerContainer.appendChild(answerItem);
    });
    
    answerSection.appendChild(answerContainer);
}

// ==================================
// 🆕 最近出た漢字の履歴管理
// ==================================

// 履歴を読み込み
function loadRecentHistory() {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (saved) {
        try {
            recentKanjiHistory = JSON.parse(saved);
            console.log(`✅ 漢字履歴を読み込みました: ${recentKanjiHistory.length}件`);
        } catch (error) {
            console.error('履歴の読み込みエラー:', error);
            recentKanjiHistory = [];
        }
    }
}

// 履歴を保存
function saveRecentHistory() {
    // 最大サイズを超えた分は削除
    if (recentKanjiHistory.length > MAX_HISTORY_SIZE) {
        recentKanjiHistory = recentKanjiHistory.slice(-MAX_HISTORY_SIZE);
    }
    
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(recentKanjiHistory));
    console.log(`💾 漢字履歴を保存しました: ${recentKanjiHistory.length}件`);
}

// 出題した漢字を履歴に追加
function addToHistory(kanjiList) {
    const timestamp = Date.now();
    kanjiList.forEach(kanji => {
        recentKanjiHistory.push({
            kanji: kanji,
            timestamp: timestamp
        });
    });
    saveRecentHistory();
}

// 除外する漢字リストを取得
function getExcludedKanji() {
    const excludeCount = parseInt(document.getElementById('exclude-recent').value) || 0;
    
    if (excludeCount === 0) {
        return [];
    }
    
    // 最新のN件を取得
    const recentItems = recentKanjiHistory.slice(-excludeCount);
    const excludedSet = new Set(recentItems.map(item => item.kanji));
    
    console.log(`🚫 除外する漢字: ${excludedSet.size}個`);
    return Array.from(excludedSet);
}

// 🆕 除外設定を読み込み
function loadExcludeSetting() {
    const saved = localStorage.getItem(EXCLUDE_SETTING_KEY);
    if (saved) {
        document.getElementById('exclude-recent').value = saved;
        console.log(`✅ 除外設定を読み込みました: ${saved}問`);
    } else {
        console.log(`✅ 除外設定: デフォルト (0問)`);
    }
}

// 🆕 除外設定を保存
function saveExcludeSetting() {
    const value = document.getElementById('exclude-recent').value;
    localStorage.setItem(EXCLUDE_SETTING_KEY, value);
    console.log(`💾 除外設定を保存しました: ${value}問`);
}

// 🆕 学年別問題数を保存
function saveGradeCount() {
    const gradeCounts = {};
    GRADES.forEach(gradeInfo => {
        const grade = gradeInfo.grade;
        const count = parseInt(document.getElementById(`grade${grade}-count`).value) || 0;
        gradeCounts[grade] = count;
    });
    localStorage.setItem(GRADE_COUNT_KEY, JSON.stringify(gradeCounts));
    console.log(`💾 学年別問題数を保存しました:`, gradeCounts);
}

// 🆕 学年別問題数を読み込み
function loadGradeCount() {
    const saved = localStorage.getItem(GRADE_COUNT_KEY);
    if (saved) {
        try {
            const gradeCounts = JSON.parse(saved);
            GRADES.forEach(gradeInfo => {
                const grade = gradeInfo.grade;
                const count = gradeCounts[grade] || 0;
                const selectElement = document.getElementById(`grade${grade}-count`);
                if (selectElement) {
                    selectElement.value = count;
                }
            });
            console.log(`📖 学年別問題数を読み込みました:`, gradeCounts);
            updateQuestionCountStatus(); // 読み込み後にステータスを更新
        } catch (e) {
            console.error('❌ 学年別問題数の読み込みエラー:', e);
        }
    }
}

// ==================================
// 🆕 生徒名の保存・読み込み
// ==================================

const STUDENT_NAME_KEY = 'kanji_student_name';

// 生徒名を保存
function saveStudentName() {
    const studentNameInput = document.getElementById('student-name');
    if (studentNameInput) {
        const studentName = studentNameInput.value.trim();
        localStorage.setItem(STUDENT_NAME_KEY, studentName);
        console.log(`💾 生徒名を保存しました: "${studentName}"`);
    }
}

// 生徒名を読み込み
function loadStudentName() {
    const saved = localStorage.getItem(STUDENT_NAME_KEY);
    const studentNameInput = document.getElementById('student-name');
    if (studentNameInput && saved !== null) {
        studentNameInput.value = saved;
        console.log(`📖 生徒名を読み込みました: "${saved}"`);
    }
}

// 履歴をクリア（デバッグ用）
function clearHistory() {
    recentKanjiHistory = [];
    saveRecentHistory();
    console.log('🗑️ 履歴をクリアしました');
}

// ==================================
// 🆕 モード切り替え関連
// ==================================

// モード変更ハンドラー
function handleModeChange(e) {
    const selectedMode = e.target.value;
    
    if (selectedMode === 'practice') {
        currentTestMode = TEST_MODES.PRACTICE;
    } else if (selectedMode === 'test10') {
        currentTestMode = TEST_MODES.TEST10;
    } else if (selectedMode === 'test20') {
        currentTestMode = TEST_MODES.TEST20;
    }
    
    // LocalStorageに保存
    localStorage.setItem(MODE_STORAGE_KEY, selectedMode);
    
    // 問題数ステータスを更新
    updateQuestionCountStatus();
    
    console.log(`✅ モード切り替え: ${currentTestMode.name}`);
}

// モード設定の読み込み
function loadTestMode() {
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (savedMode) {
        const radioButton = document.querySelector(`input[name="test-mode"][value="${savedMode}"]`);
        if (radioButton) {
            radioButton.checked = true;
            if (savedMode === 'test10') {
                currentTestMode = TEST_MODES.TEST10;
            } else if (savedMode === 'test20') {
                currentTestMode = TEST_MODES.TEST20;
            } else {
                currentTestMode = TEST_MODES.PRACTICE;
            }
        }
    }
}

// 🆕 カタカナ表記を漢字に復元する関数
function restoreKatakanaToKanji(sentence, targetKanji, readingType) {
    /*
     * 例文中のカタカナを対象漢字に戻す
     * 
     * 例: 「兄ダイがいる」+ 漢字「弟」+ 読み「ダイ」 → 「兄弟がいる」
     *     「オトウトと遊ぶ」+ 漢字「弟」+ 読み「オトウト」 → 「弟と遊ぶ」
     */
    
    if (!sentence || !targetKanji) {
        return sentence;
    }
    
    // カタカナ部分を検出（連続するカタカナ）
    const katakanaPattern = /[ァ-ヴー]+/g;
    const matches = sentence.match(katakanaPattern);
    
    if (!matches || matches.length === 0) {
        return sentence; // カタカナがなければそのまま返す
    }
    
    // 最も長いカタカナ部分を対象漢字に置換
    let longestMatch = matches.reduce((a, b) => a.length >= b.length ? a : b);
    const restoredSentence = sentence.replace(longestMatch, targetKanji);
    
    return restoredSentence;
}

// ==================================
// ユーティリティ関数
// ==================================

// 音読みと訓読みを分離
function separateReadings(yomiString) {
    const readings = yomiString.split('、');
    let onyomi = [];
    let kunyomi = [];
    
    readings.forEach(reading => {
        // カタカナまたは漢字音が含まれているか簡易判定
        // ひらがなのみ = 訓読み、それ以外 = 音読み
        if (isHiraganaOnly(reading)) {
            kunyomi.push(reading);
        } else {
            onyomi.push(reading);
        }
    });
    
    return {
        onyomi: onyomi.length > 0 ? onyomi[0] : null,  // 最初の音読みのみ
        kunyomi: kunyomi.length > 0 ? kunyomi[0] : null // 最初の訓読みのみ
    };
}

// ひらがなのみかチェック
function isHiraganaOnly(str) {
    return /^[ぁ-ん]+$/.test(str);
}

// カタカナをひらがなに変換
function katakanaToHiragana(str) {
    return str.replace(/[\u30a1-\u30f6]/g, (match) => {
        const chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
    });
}

// ==================================
// 例文から最適なものを選択（完全ランダム）
// ==================================
function selectBestExample(examples, kanji) {
    // すべての例文からランダムに選択
    // ユーザーが編集できるので、すべての例文を使用
    return examples[Math.floor(Math.random() * examples.length)];
}

// ==================================
// 文章形式かどうかを判定
// ==================================
function isSentenceFormat(text) {
    // 以下の条件のいずれかを満たせば文章と判定
    // 1. 動詞の終止形で終わる（〜る、〜す、〜く、〜つ、〜う、〜ぶ、〜む、〜ぬ等）
    // 2. 助詞（を、に、へ、が、の、で、から、と等）を含む
    // 3. 副詞（少し、早く等）で終わる場合は除外
    
    const verbEndings = /[るすくつうぶむぬ]$/;
    const particles = /[をにへがのでからと]/;
    
    // 「少し」「早く」などの副詞を除外
    const adverbs = ['少し', '早く', '多く', '大きく', '小さく'];
    if (adverbs.includes(text)) {
        return false;
    }
    
    return verbEndings.test(text) || particles.test(text);
}

// ==================================
// 熟語を文章に変換
// ==================================
function convertToSentence(text, kanji) {
    // 熟語や単語を自然な文章に変換
    // 例: 「英語」→「英語を勉強する」、「外国」→「外国に行く」
    
    // 基本的なパターンマッチング
    if (text.includes('語')) {
        return `${text}を勉強する`;
    } else if (text.includes('国')) {
        return `${text}に行く`;
    } else if (text.includes('校') || text.includes('園') || text.includes('場')) {
        return `${text}に行く`;
    } else if (text.includes('日') || text.includes('月') || text.includes('年')) {
        return `今日は${text}です`;
    } else if (text.includes('車') || text.includes('船') || text.includes('電')) {
        return `${text}に乗る`;
    } else if (text.includes('力') || text.includes('気')) {
        return `${text}がある`;
    } else if (text.includes('色') || text.includes('形')) {
        return `${text}を見る`;
    } else {
        // デフォルトは「を見る」「がある」「を使う」のいずれか
        const patterns = [
            `${text}を見る`,
            `${text}がある`,
            `${text}について学ぶ`
        ];
        return patterns[Math.floor(Math.random() * patterns.length)];
    }
}

// ==================================
// 文章の品質チェック
// ==================================
function validateSentence(processedText, originalText) {
    const issues = [];
    
    // チェック1: 重複文字列の検出（をを、がが、つつ、るる等）
    const duplicatePatterns = [
        /(.)\1{2,}/g,           // 同じ文字が3回以上連続
        /[をにへがのでから]{2,}/g,  // 助詞の連続
        /[るすくつうぶむぬ]{2,}/g   // 動詞語尾の連続
    ];
    
    for (let pattern of duplicatePatterns) {
        const matches = processedText.match(pattern);
        if (matches) {
            issues.push(`重複検出: ${matches.join(', ')}`);
        }
    }
    
    // チェック2: 熟語のみになっていないか（助詞や動詞がない）
    const hasParticle = /[をにへがのでからと]/.test(processedText);
    const hasVerb = /[るすくつうぶむぬ]$/.test(processedText);
    const isShort = processedText.length <= 4;
    
    if (!hasParticle && !hasVerb && isShort) {
        issues.push('熟語のみ（文章になっていない）');
    }
    
    // チェック3: カタカナだけの文になっていないか
    const katakanaOnly = /^[ァ-ヴー]+$/.test(processedText);
    if (katakanaOnly) {
        issues.push('カタカナのみ');
    }
    
    // チェック4: 不自然な文字の組み合わせ
    const strangePatterns = [
        /[ァ-ヴー]{5,}/,  // カタカナが5文字以上連続
        /[を]{2,}/,        // 「を」の連続
        /[が]{2,}/,        // 「が」の連続
        /[に]{3,}/         // 「に」が3回以上
    ];
    
    for (let pattern of strangePatterns) {
        if (pattern.test(processedText)) {
            issues.push('不自然な文字パターン');
            break;
        }
    }
    
    return {
        isValid: issues.length === 0,
        issues: issues
    };
}

// ==================================
// 文章の問題を自動修正
// ==================================
function fixSentenceIssues(processedText, originalText, kanji, allowedKanji) {
    let fixed = processedText;
    let isFixed = false;
    
    // 修正1: 重複文字列の削除
    // 「をを」→「を」、「がが」→「が」、「つつ」→「つ」等
    fixed = fixed.replace(/(.)\1+/g, '$1');
    
    // 修正2: 熟語のみの場合は文章に変換
    const hasParticle = /[をにへがのでからと]/.test(fixed);
    const hasVerb = /[るすくつうぶむぬ]$/.test(fixed);
    
    if (!hasParticle && !hasVerb && fixed.length <= 4) {
        // 熟語を文章に変換
        fixed = convertToSentence(originalText, kanji);
        // 再度処理
        fixed = processTextForTest(fixed, kanji, allowedKanji);
        isFixed = true;
    }
    
    // 修正後の検証
    const validation = validateSentence(fixed, originalText);
    
    return {
        isFixed: validation.isValid || isFixed,
        sentence: fixed,
        appliedFixes: validation.isValid ? ['重複削除'] : []
    };
}

// ==================================
// 編集モード機能
// ==================================

// 編集モードのON/OFF切り替え
function toggleEditMode() {
    isEditMode = !isEditMode;
    
    const editBtn = document.getElementById('edit-mode-btn');
    const saveBtn = document.getElementById('save-edit-btn');
    const printBtn = document.getElementById('print-btn');
    const regenerateBtn = document.getElementById('regenerate-btn');
    
    if (isEditMode) {
        editBtn.textContent = '✏️ 編集中...';
        editBtn.style.background = '#e67e22';
        saveBtn.classList.remove('hidden');
        printBtn.classList.add('hidden');
        regenerateBtn.classList.add('hidden');
        
        // 編集ボタンを表示
        displayEditButtons();
    } else {
        editBtn.textContent = '✏️ 編集モード';
        editBtn.style.background = '#f39c12';
        saveBtn.classList.add('hidden');
        printBtn.classList.remove('hidden');
        regenerateBtn.classList.remove('hidden');
        
        // 編集ボタンを非表示
        removeEditButtons();
    }
}

// 編集ボタンを表示
function displayEditButtons() {
    // 練習欄に編集ボタンを追加
    const practiceItems = document.querySelectorAll('.practice-item');
    practiceItems.forEach((item, index) => {
        if (!item.querySelector('.edit-buttons')) {
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'edit-buttons';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = '✏️';
            editBtn.title = '編集';
            editBtn.onclick = () => openEditDialog(index);
            
            const replaceBtn = document.createElement('button');
            replaceBtn.className = 'replace-btn';
            replaceBtn.textContent = '🔄';
            replaceBtn.title = '例文変更';
            replaceBtn.onclick = () => replaceExample(index);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '🗑️';
            deleteBtn.title = '削除';
            deleteBtn.onclick = () => deleteQuestion(index);
            
            buttonsContainer.appendChild(editBtn);
            buttonsContainer.appendChild(replaceBtn);
            buttonsContainer.appendChild(deleteBtn);
            item.appendChild(buttonsContainer);
        }
    });
    
    // テスト欄にも視覚的な表示を追加
    const testItems = document.querySelectorAll('.test-item');
    testItems.forEach((item, index) => {
        item.style.background = 'rgba(243, 156, 18, 0.05)';
        item.style.cursor = 'pointer';
        item.onclick = () => openEditDialog(index);
    });
    
    // 🆕 読みテストアイテムにも編集機能を追加
    const readingTestItems = document.querySelectorAll('.reading-test-item');
    readingTestItems.forEach((item, index) => {
        item.style.background = 'rgba(243, 156, 18, 0.05)';
        item.style.cursor = 'pointer';
        item.onclick = () => openEditDialog(index);
    });
}

// 編集ボタンを削除
function removeEditButtons() {
    document.querySelectorAll('.edit-buttons').forEach(btn => btn.remove());
    document.querySelectorAll('.test-item').forEach(item => {
        item.style.background = '';
        item.style.cursor = '';
        item.onclick = null;
    });
    // 🆕 読みテストアイテムもリセット
    document.querySelectorAll('.reading-test-item').forEach(item => {
        item.style.background = '';
        item.style.cursor = '';
        item.onclick = null;
    });
}

// 編集ダイアログを開く
function openEditDialog(index) {
    currentEditIndex = index;
    const question = selectedQuestions[index];
    
    // 🆕 漢字をキーにして編集済みデータを取得
    const editedData = editedQuestions[question.kanji] || {};
    
    // フォームに現在の値をセット
    document.getElementById('edit-sentence').value = editedData.sentence || question.sentence;
    document.getElementById('edit-kanji').value = question.kanji;
    
    // 読み仮名を取得
    const readings = separateReadings(question.yomi);
    document.getElementById('edit-onyomi').value = editedData.onyomi || readings.onyomi || '';
    document.getElementById('edit-kunyomi').value = editedData.kunyomi || readings.kunyomi || '';
    
    // ダイアログを表示
    document.getElementById('edit-dialog').classList.remove('hidden');
}

// 編集ダイアログを閉じる
function closeEditDialog() {
    document.getElementById('edit-dialog').classList.add('hidden');
    currentEditIndex = -1;
}

// 個別の質問の編集を保存
function saveQuestionEdit() {
    if (currentEditIndex < 0) return;
    
    const sentence = document.getElementById('edit-sentence').value;
    const onyomi = document.getElementById('edit-onyomi').value;
    const kunyomi = document.getElementById('edit-kunyomi').value;
    
    // 質問データを更新
    const question = selectedQuestions[currentEditIndex];
    
    // 🆕 漢字をキーにして編集データを保存
    editedQuestions[question.kanji] = {
        sentence: sentence,
        onyomi: onyomi,
        kunyomi: kunyomi,
        isEdited: true
    };
    
    // 質問データを更新
    question.sentence = sentence;
    
    // 読みを結合して更新
    const yomiParts = [];
    if (onyomi) yomiParts.push(onyomi);
    if (kunyomi) yomiParts.push(kunyomi);
    question.yomi = yomiParts.join('、');
    
    // 処理済み文を再生成（🆕 選択された漢字のみを使用）
    const allowedKanjiList = [
        ...selectedKanji[1],
        ...selectedKanji[2],
        ...selectedKanji[3],
        ...selectedKanji[4],
        ...selectedKanji[5],
        ...selectedKanji[6]
    ];
    
    question.processedSentence = processTextForTest(sentence, question.kanji, allowedKanjiList);
    
    // 表示を更新
    displayPrint();
    
    // 編集モードの場合は編集ボタンを再表示
    if (isEditMode) {
        displayEditButtons();
    }
    
    // ダイアログを閉じる
    closeEditDialog();
    
    console.log(`質問${currentEditIndex + 1}を編集しました`);
}

// 例文を別のものに切り替え
function replaceExample(index) {
    const question = selectedQuestions[index];
    const kanjiData = [...grade1Kanji, ...grade2Kanji].find(k => k.kanji === question.kanji);
    
    if (!kanjiData || !kanjiData.examples || kanjiData.examples.length <= 1) {
        alert('この漢字には別の例文がありません。');
        return;
    }
    
    // 現在の例文以外からランダムに選択
    const otherExamples = kanjiData.examples.filter(ex => ex !== question.sentence);
    const newExample = otherExamples[Math.floor(Math.random() * otherExamples.length)];
    
    // 新しい例文で質問を更新
    question.sentence = newExample;
    
    // 処理済み文を再生成（🆕 選択された漢字のみを使用）
    const allowedKanjiList = [
        ...selectedKanji[1],
        ...selectedKanji[2],
        ...selectedKanji[3],
        ...selectedKanji[4],
        ...selectedKanji[5],
        ...selectedKanji[6]
    ];
    
    question.processedSentence = processTextForTest(newExample, question.kanji, allowedKanjiList);
    
    // 🆕 漢字をキーにして編集済みとしてマーク
    editedQuestions[question.kanji] = {
        sentence: newExample,
        onyomi: separateReadings(question.yomi).onyomi || '',
        kunyomi: separateReadings(question.yomi).kunyomi || '',
        isEdited: true
    };
    
    // 表示を更新
    displayPrint();
    
    // 編集モードの場合は編集ボタンを再表示
    if (isEditMode) {
        displayEditButtons();
    }
    
    console.log(`質問${index + 1}の例文を変更しました: ${newExample}`);
}

// 質問を削除して別の漢字を追加
function deleteQuestion(index) {
    if (!confirm(`問題${index + 1}を削除して、別の漢字に変更しますか？`)) {
        return;
    }
    
    const question = selectedQuestions[index];
    
    // 🆕 選択された漢字から取得
    const grade1Selected = grade1Kanji.filter(k => selectedKanji[1].includes(k.kanji));
    const grade2Selected = grade2Kanji.filter(k => selectedKanji[2].includes(k.kanji));
    
    const allKanji = [...grade1Selected, ...grade2Selected];
    
    // 現在出題中の漢字を除外
    const usedKanji = selectedQuestions.map(q => q.kanji);
    const availableKanji = allKanji.filter(k => !usedKanji.includes(k.kanji));
    
    if (availableKanji.length === 0) {
        alert('選択された漢字の中に他の漢字がありません。');
        return;
    }
    
    // ランダムに新しい漢字を選択
    const newKanji = availableKanji[Math.floor(Math.random() * availableKanji.length)];
    
    // 質問を置き換え
    selectedQuestions[index] = newKanji;
    
    // 🆕 選択された漢字のみを使用
    const allowedKanjiList = [
        ...selectedKanji[1],
        ...selectedKanji[2],
        ...selectedKanji[3],
        ...selectedKanji[4],
        ...selectedKanji[5],
        ...selectedKanji[6]
    ];
    
    if (newKanji.examples && newKanji.examples.length > 0) {
        const selectedExample = selectBestExample(newKanji.examples, newKanji.kanji);
        newKanji.sentence = selectedExample;
    } else {
        newKanji.sentence = `${newKanji.kanji}を見る。`;
    }
    
    newKanji.processedSentence = processTextForTest(newKanji.sentence, newKanji.kanji, allowedKanjiList);
    
    // 🆕 古い漢字の編集データは保持（次回出題時に使用）
    // 削除しないため、この行を削除: delete editedQuestions[index];
    
    // 表示を更新
    displayPrint();
    
    // 編集モードの場合は編集ボタンを再表示
    if (isEditMode) {
        displayEditButtons();
    }
    
    console.log(`質問${index + 1}を削除し、「${newKanji.kanji}」に変更しました`);
}

// 全ての編集をLocalStorageに保存
function saveAllEdits() {
    try {
        // 🆕 漢字ごとの編集データをそのまま保存
        const saveData = {
            timestamp: new Date().toISOString(),
            editedKanji: editedQuestions  // {"海": {...}, "空": {...}}
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
        alert('編集内容を保存しました！\n次回このページを開いたときに編集内容が読み込まれます。\n\n保存された漢字: ' + Object.keys(editedQuestions).join('、'));
        console.log('編集内容を保存しました:', saveData);
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました。');
    }
}

// 保存された編集をLocalStorageから読み込み
function loadSavedEdits() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const data = JSON.parse(savedData);
            console.log('保存された編集を読み込みました:', data);
            
            // 🆕 漢字ごとの編集データを復元
            if (data.editedKanji) {
                editedQuestions = data.editedKanji;
                console.log('編集済み漢字:', Object.keys(editedQuestions).join('、'));
            }
        }
    } catch (error) {
        console.error('読み込みエラー:', error);
    }
}

// ==================================
// 漢字選択機能
// ==================================

// 漢字選択UIの構築
function buildKanjiSelectionUI() {
    // 🆕 全学年のデータマップを作成
    const gradeDataMap = {
        1: grade1Kanji,
        2: grade2Kanji,
        3: grade3Kanji,
        4: grade4Kanji,
        5: grade5Kanji,
        6: grade6Kanji
    };
    
    GRADES.forEach(gradeInfo => {
        const grade = gradeInfo.grade;
        const kanjiList = gradeDataMap[grade]; // 🔧 修正：正しい学年のデータを取得
        const gridElement = document.getElementById(`kanji-grid-grade${grade}`);
        
        gridElement.innerHTML = '';
        
        kanjiList.forEach((kanjiData, index) => {
            const kanji = kanjiData.kanji;
            
            // 禁止漢字は表示しない
            if (EXCLUDED_KANJI.includes(kanji)) {
                return;
            }
            
            const isSelected = selectedKanji[grade].includes(kanji);
            
            const kanjiItem = document.createElement('div');
            kanjiItem.className = `kanji-item ${isSelected ? 'selected' : ''}`;
            kanjiItem.dataset.kanji = kanji;
            kanjiItem.dataset.grade = grade;
            
            kanjiItem.innerHTML = `
                <span class="checkmark">✓</span>
                <div class="kanji-char">${kanji}</div>
                <div class="kanji-reading">${kanjiData.yomi.split('、')[0]}</div>
            `;
            
            kanjiItem.addEventListener('click', () => toggleKanjiSelection(grade, kanji, kanjiItem));
            
            gridElement.appendChild(kanjiItem);
        });
    });
    
    updateSelectionCounts();
}

// 漢字選択状態のトグル
function toggleKanjiSelection(grade, kanji, element) {
    const index = selectedKanji[grade].indexOf(kanji);
    
    if (index > -1) {
        // 選択解除
        selectedKanji[grade].splice(index, 1);
        element.classList.remove('selected');
    } else {
        // 選択
        selectedKanji[grade].push(kanji);
        element.classList.add('selected');
    }
    
    updateSelectionCounts();
    saveKanjiSelection();
}

// 全選択
function selectAllKanji(grade) {
    // 🆕 全学年対応
    const gradeDataMap = {
        1: grade1Kanji,
        2: grade2Kanji,
        3: grade3Kanji,
        4: grade4Kanji,
        5: grade5Kanji,
        6: grade6Kanji
    };
    
    const kanjiList = gradeDataMap[grade];
    selectedKanji[grade] = kanjiList
        .map(k => k.kanji)
        .filter(k => !EXCLUDED_KANJI.includes(k));
    
    // UI更新
    document.querySelectorAll(`#kanji-grid-grade${grade} .kanji-item`).forEach(item => {
        item.classList.add('selected');
    });
    
    updateSelectionCounts();
    saveKanjiSelection();
}

// 全解除
function deselectAllKanji(grade) {
    // 🆕 確認ダイアログを追加
    const gradeLabel = GRADES.find(g => g.grade === grade)?.label || `小${grade}`;
    if (!confirm(`${gradeLabel}の漢字をすべて解除しますか？\n\n解除すると、この学年から問題を出題できなくなります。`)) {
        return; // キャンセルされた場合は何もしない
    }
    
    selectedKanji[grade] = [];
    
    // UI更新
    document.querySelectorAll(`#kanji-grid-grade${grade} .kanji-item`).forEach(item => {
        item.classList.remove('selected');
    });
    
    updateSelectionCounts();
    saveKanjiSelection();
}

// 選択反転
function invertKanjiSelection(grade) {
    // 🆕 全学年対応
    const gradeDataMap = {
        1: grade1Kanji,
        2: grade2Kanji,
        3: grade3Kanji,
        4: grade4Kanji,
        5: grade5Kanji,
        6: grade6Kanji
    };
    
    const kanjiList = gradeDataMap[grade];
    const allKanji = kanjiList
        .map(k => k.kanji)
        .filter(k => !EXCLUDED_KANJI.includes(k));
    
    const newSelection = allKanji.filter(k => !selectedKanji[grade].includes(k));
    selectedKanji[grade] = newSelection;
    
    // UI更新
    document.querySelectorAll(`#kanji-grid-grade${grade} .kanji-item`).forEach(item => {
        const kanji = item.dataset.kanji;
        if (selectedKanji[grade].includes(kanji)) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    
    updateSelectionCounts();
    saveKanjiSelection();
}

// タブ切り替え
function switchKanjiTab(grade) {
    // タブのアクティブ状態を更新
    document.querySelectorAll('.kanji-tab').forEach(tab => {
        if (tab.dataset.grade === String(grade)) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // パネルの表示を更新
    document.querySelectorAll('.kanji-tab-panel').forEach(panel => {
        if (panel.dataset.grade === String(grade)) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
}

// 選択数の更新
function updateSelectionCounts() {
    GRADES.forEach(gradeInfo => {
        const grade = gradeInfo.grade;
        const count = selectedKanji[grade].length;
        const total = gradeInfo.total - EXCLUDED_KANJI.length; // 禁止漢字を除外
        document.getElementById(`grade${grade}-selected-count`).textContent = count;
    });
}

// 漢字選択状態の保存
function saveKanjiSelection() {
    try {
        // 🆕 保存前のデータ検証：空配列がないかチェック
        GRADES.forEach(gradeInfo => {
            const grade = gradeInfo.grade;
            if (!selectedKanji[grade] || selectedKanji[grade].length === 0) {
                console.warn(`警告: 小${grade}の選択が0個です。この状態で保存されます。`);
            }
        });
        
        localStorage.setItem(KANJI_SELECTION_KEY, JSON.stringify(selectedKanji));
        console.log('漢字選択を保存しました', selectedKanji);
    } catch (error) {
        console.error('保存エラー:', error);
    }
}

// 漢字選択状態の読み込み
function loadKanjiSelection() {
    const gradeDataMap = {
        1: grade1Kanji,
        2: grade2Kanji,
        3: grade3Kanji,
        4: grade4Kanji,
        5: grade5Kanji,
        6: grade6Kanji
    };
    
    try {
        const saved = localStorage.getItem(KANJI_SELECTION_KEY);
        if (saved) {
            selectedKanji = JSON.parse(saved);
            console.log('✅ LocalStorageから漢字選択を読み込みました');
            
            // 🆕 詳細デバッグ：各学年のデータ状態を確認
            console.log('📊 読み込んだデータの詳細:');
            GRADES.forEach(gradeInfo => {
                const grade = gradeInfo.grade;
                const count = selectedKanji[grade]?.length || 0;
                console.log(`  小${grade}: ${count}個の漢字が選択されています`);
            });
            
            // 🆕 データの整合性チェック：各学年のデータを検証
            let needsSave = false;
            GRADES.forEach(gradeInfo => {
                const grade = gradeInfo.grade;
                
                // 学年データが存在しない、または空配列の場合
                if (!selectedKanji[grade] || !Array.isArray(selectedKanji[grade]) || selectedKanji[grade].length === 0) {
                    const totalKanji = gradeDataMap[grade].length - EXCLUDED_KANJI.length;
                    console.warn(`⚠️ 小${grade}の漢字選択データが不完全です（現在: ${selectedKanji[grade]?.length || 0}個）`);
                    console.warn(`   → 全漢字（${totalKanji}個）を自動選択します`);
                    selectedKanji[grade] = gradeDataMap[grade].map(k => k.kanji).filter(k => !EXCLUDED_KANJI.includes(k));
                    needsSave = true;
                }
            });
            
            // 修正があった場合はLocalStorageを更新
            if (needsSave) {
                localStorage.setItem(KANJI_SELECTION_KEY, JSON.stringify(selectedKanji));
                console.log('✅ 不完全なデータを修正して保存しました');
                
                // 🆕 修正後の状態を表示
                console.log('📊 修正後のデータ:');
                GRADES.forEach(gradeInfo => {
                    const grade = gradeInfo.grade;
                    const count = selectedKanji[grade]?.length || 0;
                    console.log(`  小${grade}: ${count}個の漢字`);
                });
            } else {
                console.log('✅ データは正常です。修正は不要でした。');
            }
        } else {
            // 初期状態：全て選択
            selectedKanji = {};
            GRADES.forEach(gradeInfo => {
                const grade = gradeInfo.grade;
                selectedKanji[grade] = gradeDataMap[grade].map(k => k.kanji).filter(k => !EXCLUDED_KANJI.includes(k));
            });
            console.log('初期状態：全漢字を選択');
        }
    } catch (error) {
        console.error('読み込みエラー:', error);
        // エラー時は全て選択
        selectedKanji = {};
        GRADES.forEach(gradeInfo => {
            const grade = gradeInfo.grade;
            selectedKanji[grade] = gradeDataMap[grade].map(k => k.kanji).filter(k => !EXCLUDED_KANJI.includes(k));
        });
    }
}

// ==================================
// 🆕 漢字選択アコーディオンの切り替え
// ==================================
const ACCORDION_STATE_KEY = 'kanji_accordion_collapsed';

function toggleAccordion() {
    const header = document.getElementById('kanji-selection-toggle');
    const content = document.getElementById('kanji-selection-content');
    
    const isCollapsed = content.classList.contains('collapsed');
    
    if (isCollapsed) {
        // 開く
        content.classList.remove('collapsed');
        header.classList.remove('collapsed');
        localStorage.setItem(ACCORDION_STATE_KEY, 'false');
    } else {
        // 閉じる
        content.classList.add('collapsed');
        header.classList.add('collapsed');
        localStorage.setItem(ACCORDION_STATE_KEY, 'true');
    }
}

// アコーディオンの状態を復元（デフォルト：閉じた状態）
function restoreAccordionState() {
    const savedState = localStorage.getItem(ACCORDION_STATE_KEY);
    // デフォルトは閉じた状態（savedStateがnullの場合も閉じる）
    const isCollapsed = savedState === null || savedState === 'true';
    
    if (isCollapsed) {
        const header = document.getElementById('kanji-selection-toggle');
        const content = document.getElementById('kanji-selection-content');
        content.classList.add('collapsed');
        header.classList.add('collapsed');
    }
}

// ログ出力（デバッグ用）
function logQuestions() {
    console.log('=== 出題漢字一覧 ===');
    selectedQuestions.forEach((q, i) => {
        console.log(`${i+1}. ${q.kanji} - ${q.sentence} → ${q.processedSentence}`);
    });
}

// ==================================
// 🆕 漢字検索機能
// ==================================
let searchHighlightTimeout = null;
let currentHighlightedKanji = null; // 現在ハイライト中の漢字情報を保持

function handleKanjiSearch(event) {
    const searchKanji = event.target.value.trim();
    
    // 空の場合はクリア
    if (searchKanji === '') {
        clearSearchHighlight();
        return;
    }
    
    // 漢字かどうか確認
    if (!isKanji(searchKanji)) {
        return;
    }
    
    // 全学年から検索
    let foundGrade = null;
    let foundElement = null;
    
    for (const gradeInfo of GRADES) {
        const grade = gradeInfo.grade;
        let kanjiList;
        
        // 学年に応じた漢字リストを取得
        switch(grade) {
            case 1: kanjiList = grade1Kanji; break;
            case 2: kanjiList = grade2Kanji; break;
            case 3: kanjiList = grade3Kanji; break;
            case 4: kanjiList = grade4Kanji; break;
            case 5: kanjiList = grade5Kanji; break;
            case 6: kanjiList = grade6Kanji; break;
            default: continue;
        }
        
        // 漢字が存在するか確認
        const kanjiData = kanjiList.find(k => k.kanji === searchKanji);
        
        if (kanjiData) {
            foundGrade = grade;
            // DOM要素を取得
            foundElement = document.querySelector(`#kanji-grid-grade${grade} .kanji-item[data-kanji="${searchKanji}"]`);
            break;
        }
    }
    
    if (foundGrade && foundElement) {
        // 該当学年のタブに切り替え
        switchKanjiTab(foundGrade);
        
        // アコーディオンが閉じている場合は開く
        const content = document.getElementById('kanji-selection-content');
        if (content.classList.contains('collapsed')) {
            toggleAccordion();
        }
        
        // スクロールとハイライト
        scrollToKanjiAndHighlight(foundElement);
        
        // 現在ハイライト中の漢字情報を保存
        currentHighlightedKanji = {
            kanji: searchKanji,
            grade: foundGrade,
            element: foundElement
        };
        
        console.log(`検索成功: ${searchKanji} (小${foundGrade})`);
    } else {
        console.log(`検索失敗: ${searchKanji} が見つかりませんでした`);
        clearSearchHighlight();
        currentHighlightedKanji = null;
    }
}

function scrollToKanjiAndHighlight(element) {
    // 既存のハイライトをクリア
    clearSearchHighlight();
    
    // スムーズスクロール
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
    });
    
    // ハイライトクラスを追加
    element.classList.add('search-highlight');
    
    // 3秒後にハイライトを解除
    if (searchHighlightTimeout) {
        clearTimeout(searchHighlightTimeout);
    }
    
    searchHighlightTimeout = setTimeout(() => {
        element.classList.remove('search-highlight');
        searchHighlightTimeout = null;
    }, 3000);
}

function clearSearchHighlight() {
    // 全てのハイライトを削除
    document.querySelectorAll('.kanji-item.search-highlight').forEach(item => {
        item.classList.remove('search-highlight');
    });
    
    if (searchHighlightTimeout) {
        clearTimeout(searchHighlightTimeout);
        searchHighlightTimeout = null;
    }
}

function clearKanjiSearch() {
    const searchInput = document.getElementById('kanji-search-input');
    searchInput.value = '';
    clearSearchHighlight();
    currentHighlightedKanji = null;
    searchInput.focus();
}

// Enterキー押下時の処理
function handleSearchKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        
        // ハイライト中の漢字があれば選択/非選択をトグル
        if (currentHighlightedKanji) {
            const { kanji, grade, element } = currentHighlightedKanji;
            
            // 現在の選択状態を確認
            const isCurrentlySelected = selectedKanji[grade].includes(kanji);
            
            // トグル実行
            toggleKanjiSelection(grade, kanji, element);
            
            // 状態に応じてメッセージ表示
            if (isCurrentlySelected) {
                console.log(`✗ 非選択: ${kanji} (小${grade})`);
            } else {
                console.log(`✓ 選択: ${kanji} (小${grade})`);
            }
            
            // 検索ボックスをクリアして次の入力を受け付ける
            const searchInput = document.getElementById('kanji-search-input');
            searchInput.value = '';
            
            // ハイライトを解除
            clearSearchHighlight();
            currentHighlightedKanji = null;
            
            // フォーカスを検索ボックスに戻す
            searchInput.focus();
        }
    }
}
