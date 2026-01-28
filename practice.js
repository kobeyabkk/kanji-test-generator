// ==========================================
// グローバル変数
// ==========================================
let kanjiList = []; // 練習する漢字リスト
let isPracticeMode = true; // true: 練習モード, false: テストモード
let activeCanvases = []; // アクティブなCanvas要素
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// ペン設定
let penWidth = 6;
let penColor = '#000000';

// ==========================================
// 初期化
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    // URLパラメータから漢字リストを取得
    loadKanjiFromParams();

    // イベントリスナー設定
    setupEventListeners();

    // 漢字が選択されているか確認
    if (kanjiList.length === 0) {
        alert('練習する漢字が選択されていません。\n設定画面から漢字を選択してください。');
        window.location.href = 'index.html';
        return;
    }

    // 画面を生成
    generatePracticeScreen();
    generateTestScreen();
});

// ==========================================
// URLパラメータから漢字リストを読み込み
// ==========================================
function loadKanjiFromParams() {
    const params = new URLSearchParams(window.location.search);
    const kanjiParam = params.get('kanji');
    
    if (kanjiParam) {
        kanjiList = JSON.parse(decodeURIComponent(kanjiParam));
    }
}

// ==========================================
// イベントリスナー設定
// ==========================================
function setupEventListeners() {
    // ボタンイベント
    document.getElementById('clear-btn').addEventListener('click', clearAllCanvases);
    document.getElementById('screenshot-btn').addEventListener('click', takeScreenshot);
    document.getElementById('mode-switch-btn').addEventListener('click', switchMode);
    document.getElementById('back-btn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    document.getElementById('restart-btn').addEventListener('click', restartPractice);

    // ペン設定イベント
    document.getElementById('pen-width').addEventListener('input', (e) => {
        penWidth = parseInt(e.target.value);
        document.getElementById('pen-width-value').textContent = `${penWidth}px`;
    });

    document.getElementById('pen-color').addEventListener('input', (e) => {
        penColor = e.target.value;
    });
}

// ==========================================
// 練習画面を生成
// ==========================================
function generatePracticeScreen() {
    const container = document.getElementById('practice-grid');
    container.innerHTML = '';

    kanjiList.forEach((kanji, index) => {
        const item = document.createElement('div');
        item.className = 'practice-item';

        // ヘッダー（漢字+読み仮名）
        const header = document.createElement('div');
        header.className = 'practice-kanji-header';

        const kanjiSpan = document.createElement('span');
        kanjiSpan.className = 'practice-kanji-large';
        kanjiSpan.textContent = kanji.kanji;
        header.appendChild(kanjiSpan);

        const yomiSpan = document.createElement('span');
        yomiSpan.className = 'practice-yomi';
        yomiSpan.textContent = kanji.yomi;
        header.appendChild(yomiSpan);

        item.appendChild(header);

        // 練習ボックス（4つ）
        const boxesDiv = document.createElement('div');
        boxesDiv.className = 'practice-boxes';

        for (let i = 0; i < 4; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'practice-canvas-wrapper';

            // 背景Canvas（十字ガイド線）
            const bgCanvas = document.createElement('canvas');
            bgCanvas.className = 'practice-bg-canvas';
            bgCanvas.width = 200;
            bgCanvas.height = 200;
            
            // 十字ガイド線を描画
            const bgCtx = bgCanvas.getContext('2d');
            bgCtx.strokeStyle = '#cccccc';
            bgCtx.lineWidth = 1;
            bgCtx.setLineDash([5, 5]); // 点線
            
            // 縦線
            bgCtx.beginPath();
            bgCtx.moveTo(100, 0);
            bgCtx.lineTo(100, 200);
            bgCtx.stroke();
            
            // 横線
            bgCtx.beginPath();
            bgCtx.moveTo(0, 100);
            bgCtx.lineTo(200, 100);
            bgCtx.stroke();

            // ガイドCanvas（右上のマスのみ表示）
            const guideCanvas = document.createElement('canvas');
            guideCanvas.className = 'practice-guide-canvas';
            guideCanvas.width = 200;
            guideCanvas.height = 200;

            // 右上のマス（i === 1）のみガイドに漢字を描画
            if (i === 1) {
                const guideCtx = guideCanvas.getContext('2d');
                guideCtx.font = 'bold 150px "Noto Sans JP"';
                guideCtx.fillStyle = '#000000';
                guideCtx.textAlign = 'center';
                guideCtx.textBaseline = 'middle';
                guideCtx.fillText(kanji.kanji, 100, 100);
            }

            // 描画Canvas
            const drawCanvas = document.createElement('canvas');
            drawCanvas.className = 'practice-draw-canvas';
            drawCanvas.width = 200;
            drawCanvas.height = 200;
            drawCanvas.dataset.index = index;
            drawCanvas.dataset.box = i;
            drawCanvas.dataset.type = 'practice';

            wrapper.appendChild(bgCanvas);
            wrapper.appendChild(guideCanvas);
            wrapper.appendChild(drawCanvas);
            boxesDiv.appendChild(wrapper);

            // Canvasの描画イベントを設定
            setupCanvasEvents(drawCanvas);
        }

        item.appendChild(boxesDiv);
        container.appendChild(item);
    });
}

// ==========================================
// テスト画面を生成
// ==========================================
function generateTestScreen() {
    const container = document.getElementById('test-grid');
    container.innerHTML = '';

    kanjiList.forEach((kanji, index) => {
        const card = document.createElement('div');
        card.className = 'test-item';

        // 問題文を取得
        const sentence = kanji.examples && kanji.examples[0] 
            ? kanji.examples[0] 
            : `${kanji.kanji}を書く`;
        
        let processedSentence = sentence;
        if (kanji.readings && kanji.readings[sentence]) {
            processedSentence = kanji.readings[sentence];
        }

        // 右側：問題文エリア
        const questionZone = document.createElement('div');
        questionZone.className = 'question-zone';
        
        // 番号
        const numberSpan = document.createElement('span');
        numberSpan.className = 'number';
        numberSpan.textContent = `${index + 1}.`;
        questionZone.appendChild(numberSpan);
        
        // 問題文（テキストノードとして追加、改行なし）
        const textNode = document.createTextNode(processedSentence);
        questionZone.appendChild(textNode);
        
        card.appendChild(questionZone);

        // 左側：解答欄エリア
        const answerZone = document.createElement('div');
        answerZone.className = 'answer-zone';
        
        // 上のカッコ
        const bracketTop = document.createElement('span');
        bracketTop.className = 'bracket';
        bracketTop.textContent = '︵';
        answerZone.appendChild(bracketTop);
        
        // 下のカッコ
        const bracketBottom = document.createElement('span');
        bracketBottom.className = 'bracket';
        bracketBottom.textContent = '︶';
        answerZone.appendChild(bracketBottom);
        
        card.appendChild(answerZone);

        container.appendChild(card);
    });
}

// ==========================================
// Canvasの描画イベントを設定
// ==========================================
function setupCanvasEvents(canvas) {
    // マウスイベント
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // タッチイベント
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);

    activeCanvases.push(canvas);
}

// ==========================================
// 描画開始（マウス）
// ==========================================
function startDrawing(e) {
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
    isDrawing = true;
}

// ==========================================
// 描画（マウス）
// ==========================================
function draw(e) {
    if (!isDrawing) return;

    const canvas = e.target;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    // スケール調整
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(lastX * scaleX, lastY * scaleY);
    ctx.lineTo(currentX * scaleX, currentY * scaleY);
    ctx.stroke();

    lastX = currentX;
    lastY = currentY;
}

// ==========================================
// 描画停止
// ==========================================
function stopDrawing() {
    isDrawing = false;
}

// ==========================================
// タッチ開始
// ==========================================
function handleTouchStart(e) {
    e.preventDefault();
    const canvas = e.target;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
    isDrawing = true;
}

// ==========================================
// タッチ移動
// ==========================================
function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = e.target;
    const ctx = canvas.getContext('2d');
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;

    // スケール調整
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(lastX * scaleX, lastY * scaleY);
    ctx.lineTo(currentX * scaleX, currentY * scaleY);
    ctx.stroke();

    lastX = currentX;
    lastY = currentY;
}

// ==========================================
// 全てのCanvasをクリア
// ==========================================
function clearAllCanvases() {
    // 現在表示されている画面のCanvasのみクリア
    const currentScreen = isPracticeMode ? 'practice-screen' : 'test-screen';
    const screenElement = document.getElementById(currentScreen);
    
    screenElement.querySelectorAll('canvas.practice-draw-canvas, canvas.test-canvas').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}

// ==========================================
// モード切り替え
// ==========================================
function switchMode() {
    isPracticeMode = !isPracticeMode;
    updateMode();
}

// ==========================================
// モード表示を更新
// ==========================================
function updateMode() {
    const practiceScreen = document.getElementById('practice-screen');
    const testScreen = document.getElementById('test-screen');
    const modeTitle = document.getElementById('mode-title');
    const modeSubtitle = document.getElementById('mode-subtitle');
    const modeSwitchBtn = document.getElementById('mode-switch-btn');

    if (isPracticeMode) {
        practiceScreen.classList.remove('hidden');
        testScreen.classList.add('hidden');
        modeTitle.textContent = '✏️ 漢字練習モード';
        modeSubtitle.textContent = '漢字をなぞって練習しましょう';
        modeSwitchBtn.textContent = '練習完了 → テスト開始';
    } else {
        practiceScreen.classList.add('hidden');
        testScreen.classList.remove('hidden');
        modeTitle.textContent = '📝 テストモード';
        modeSubtitle.textContent = '問題文を見て、漢字を書きましょう';
        modeSwitchBtn.textContent = 'テスト完了 → 練習に戻る';
    }
}

// ==========================================
// 最初から練習
// ==========================================
function restartPractice() {
    if (confirm('全ての描画内容がクリアされます。\n最初からやり直しますか？')) {
        // 全てのCanvasをクリア
        activeCanvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
        
        // 練習モードに戻る
        isPracticeMode = true;
        updateMode();
    }
}

// ==========================================
// スクリーンショットを撮って保存
// ==========================================
async function takeScreenshot() {
    try {
        // html2canvasライブラリを動的に読み込み
        if (typeof html2canvas === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
            document.head.appendChild(script);
            
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
        }

        // 現在表示されている画面をキャプチャ
        const targetElement = isPracticeMode 
            ? document.getElementById('practice-screen') 
            : document.getElementById('test-screen');

        // html2canvasでスクリーンショットを作成
        const canvas = await html2canvas(targetElement, {
            backgroundColor: '#ffffff',
            scale: 2, // 高解像度
            logging: false
        });

        // Canvasを画像に変換
        canvas.toBlob(async (blob) => {
            const date = new Date();
            const timestamp = date.toISOString().slice(0, 19).replace(/:/g, '-');
            const modeName = isPracticeMode ? '練習' : 'テスト';
            const filename = `漢字${modeName}_${timestamp}.png`;

            // スマホ・タブレット対応
            if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                // Web Share API（モバイル）
                try {
                    const file = new File([blob], filename, { type: 'image/png' });
                    await navigator.share({
                        title: `漢字${modeName}`,
                        text: `漢字${modeName}のスクリーンショット`,
                        files: [file]
                    });
                } catch (err) {
                    // シェアがキャンセルされた場合は通常のダウンロード
                    if (err.name !== 'AbortError') {
                        downloadBlob(blob, filename);
                    }
                }
            } else {
                // PC・その他
                downloadBlob(blob, filename);
            }
        }, 'image/png');

    } catch (error) {
        console.error('スクリーンショットエラー:', error);
        alert('スクリーンショットの保存に失敗しました。\n\nブラウザのスクリーンショット機能をご利用ください。');
    }
}

// ==========================================
// Blobをダウンロード
// ==========================================
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // 成功メッセージ
    alert('✅ スクリーンショットを保存しました！');
}
