// ==========================================
// グローバル変数
// ==========================================
let kanjiList = []; // 練習する漢字リスト
let isPracticeMode = true; // true: 練習モード, false: テストモード
let testMode = 'practice'; // 'practice', 'test10', 'test20'
let activeCanvases = []; // アクティブなCanvas要素（練習モード用）
let activeSVGs = []; // アクティブなSVG要素（テストモード用）
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// ペン設定
let penWidth = 6;
let penColor = '#000000';
let isEraserMode = false; // 消しゴムモード
let eraserWidth = 20; // 消しゴムのデフォルト幅

// SVG描画用の状態
let currentPath = null;
let pathData = '';

// ==========================================
// 初期化
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    // URLパラメータから漢字リストとテストモードを取得
    loadKanjiFromParams();

    // イベントリスナー設定
    setupEventListeners();

    // 漢字が選択されているか確認
    if (kanjiList.length === 0) {
        alert('練習する漢字が選択されていません。\n設定画面から漢字を選択してください。');
        window.location.href = 'index.html';
        return;
    }

    // テストモードに応じて初期状態を設定
    if (testMode === 'test10' || testMode === 'test20') {
        // テスト10問またはテスト20問の場合は、最初からテストモードを表示
        isPracticeMode = false;
    } else {
        // 練習＋テストの場合は、最初は練習モードを表示
        isPracticeMode = true;
    }

    // 画面を生成
    generatePracticeScreen();
    generateTestScreen();

    // 初期表示を更新
    updateMode();

    // 🆕 画面回転・リサイズを検知してCanvasを再調整
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
});

// ==========================================
// Canvas解像度の再調整（DPR対応・描画内容保持）
// ==========================================
function resizeCanvasToDisplaySize(canvas, { preserve = true } = {}) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
        return;
    }

    const dpr = window.devicePixelRatio || 1;
    const targetWidth = Math.round(rect.width * dpr);
    const targetHeight = Math.round(rect.height * dpr);

    const needsResize = canvas.width !== targetWidth || canvas.height !== targetHeight || canvas._dpr !== dpr;
    if (!needsResize) {
        // サイズ変更不要の場合、transformだけ確認
        const ctx = canvas._ctx || canvas.getContext('2d');
        if (!canvas._transformSet) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            canvas._ctx = ctx;
            canvas._dpr = dpr;
            canvas._transformSet = true;
        }
        return; // 早期リターン（高速化）
    }

    let snapshot = null;
    if (preserve && canvas.width && canvas.height) {
        snapshot = document.createElement('canvas');
        snapshot.width = canvas.width;
        snapshot.height = canvas.height;
        const snapshotCtx = snapshot.getContext('2d');
        snapshotCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas._ctx = ctx;
    canvas._dpr = dpr;
    canvas._transformSet = true;

    if (snapshot) {
        ctx.drawImage(snapshot, 0, 0, rect.width, rect.height);
    }
}

function scheduleCanvasResize(canvas) {
    requestAnimationFrame(() => {
        resizeCanvasToDisplaySize(canvas, { preserve: true });
    });
}

function refreshTestCanvases() {
    document.querySelectorAll('canvas.test-canvas').forEach(canvas => {
        resizeCanvasToDisplaySize(canvas, { preserve: true });
    });
}

// ==========================================
// 画面回転・リサイズ時の処理
// ==========================================
function handleResize() {
    console.log('🔄 画面の向きが変わりました');

    // 🔧 描画中の場合は停止
    isDrawing = false;

    // ✅ 表示サイズに合わせてCanvasを再調整（描画内容は保持）
    refreshTestCanvases();
    console.log('✅ 描画を一時停止し、Canvasを再調整しました');
}

// ==========================================
// URLパラメータから漢字リストとテストモードを読み込み
// ==========================================
function loadKanjiFromParams() {
    const params = new URLSearchParams(window.location.search);
    const kanjiParam = params.get('kanji');
    const modeParam = params.get('mode');
    
    console.log('🔍 URLパラメータ解析:');
    console.log('  - 現在のURL:', window.location.href);
    console.log('  - kanjiParam存在:', !!kanjiParam);
    console.log('  - modeParam:', modeParam);

    if (kanjiParam) {
        try {
            kanjiList = JSON.parse(decodeURIComponent(kanjiParam));
            console.log(`📚 URLから読み込んだ漢字数: ${kanjiList.length}問`);
        } catch (e) {
            console.error('❌ kanjiパラメータのパースエラー:', e);
        }
    } else {
        console.log('⚠️ kanjiパラメータがありません');
    }

    if (modeParam) {
        testMode = modeParam; // 'practice', 'test10', 'test20'
        console.log(`📋 テストモード: ${testMode}`);

        // 🆕 テスト10問モードの場合、kanjiListを10問に制限
        if (testMode === 'test10' && kanjiList.length > 10) {
            kanjiList = kanjiList.slice(0, 10);
            console.log(`✂️ テスト10問モード: 漢字を10問に制限しました`);
        }

        // 🆕 練習＋テストモードの場合も10問に制限
        if (testMode === 'practice' && kanjiList.length > 10) {
            kanjiList = kanjiList.slice(0, 10);
            console.log(`✂️ 練習＋テストモード: 漢字を10問に制限しました`);
        }
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
        isEraserMode = false; // ペン色変更時は消しゴムモード解除
        updateEraserButton();
    });

    // 🆕 消しゴム太さスライダー
    document.getElementById('eraser-width').addEventListener('input', (e) => {
        eraserWidth = parseInt(e.target.value);
        document.getElementById('eraser-width-value').textContent = `${eraserWidth}px`;

        // 🆕 消しゴムモード中の場合はカーソルを更新
        if (isEraserMode) {
            updateEraserButton();
        }
    });

    // 消しゴムボタン
    document.getElementById('eraser-btn').addEventListener('click', toggleEraser);
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
// テスト画面を生成（SVG版 - iPad Safari対応）
// ==========================================
function generateTestScreen() {
    const container = document.getElementById('test-grid');
    container.innerHTML = '';
    activeSVGs = []; // SVGリストをリセット

    // 🆕 テスト20問の場合は、kanjiListを2倍にする
    let testKanjiList = kanjiList;
    if (testMode === 'test20') {
        testKanjiList = [...kanjiList, ...kanjiList]; // 同じ漢字を2回出題
        console.log(`📝 テスト20問: ${testKanjiList.length}問`);
    }

    testKanjiList.forEach((kanji, index) => {
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

        // 🆕 SVGを使用（iPad Safari対応）
        const svg = createSVGCanvas(80, 200);
        svg.className = 'test-svg';
        svg.dataset.index = index;
        answerZone.appendChild(svg);

        // SVGイベントを設定
        setupSVGEvents(svg);
        activeSVGs.push(svg);

        // 下のカッコ
        const bracketBottom = document.createElement('span');
        bracketBottom.className = 'bracket';
        bracketBottom.textContent = '︶';
        answerZone.appendChild(bracketBottom);

        card.appendChild(answerZone);

        container.appendChild(card);
    });

    console.log(`✅ テスト画面生成完了: ${testKanjiList.length}問（SVG使用）`);
}

// ==========================================
// SVG Canvasを作成
// ==========================================
function createSVGCanvas(width, height) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.touchAction = 'none';
    svg.style.cursor = 'crosshair';
    return svg;
}

// ==========================================
// SVGの描画イベントを設定
// ==========================================
function setupSVGEvents(svg) {
    // マウスイベント
    svg.addEventListener('mousedown', handleSVGMouseDown);
    svg.addEventListener('mousemove', handleSVGMouseMove);
    svg.addEventListener('mouseup', handleSVGMouseUp);
    svg.addEventListener('mouseout', handleSVGMouseUp);

    // タッチイベント（iPad Safari対応）
    svg.addEventListener('touchstart', handleSVGTouchStart, { passive: false });
    svg.addEventListener('touchmove', handleSVGTouchMove, { passive: false });
    svg.addEventListener('touchend', handleSVGTouchEnd, { passive: false });
}

// ==========================================
// SVG描画：マウスイベント
// ==========================================
function handleSVGMouseDown(e) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isEraserMode) {
        eraseAtPoint(svg, x, y);
    } else {
        startSVGPath(svg, x, y);
    }
    isDrawing = true;
}

function handleSVGMouseMove(e) {
    if (!isDrawing) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isEraserMode) {
        eraseAtPoint(svg, x, y);
    } else {
        continueSVGPath(x, y);
    }
}

function handleSVGMouseUp() {
    isDrawing = false;
    currentPath = null;
    pathData = '';
}

// ==========================================
// SVG描画：タッチイベント（iPad Safari対応）
// ==========================================
function handleSVGTouchStart(e) {
    e.preventDefault();
    const svg = e.currentTarget;
    const touch = e.touches[0];
    const rect = svg.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    console.log(`✏️ SVGタッチ開始: (${x.toFixed(1)}, ${y.toFixed(1)})`);

    if (isEraserMode) {
        eraseAtPoint(svg, x, y);
    } else {
        startSVGPath(svg, x, y);
    }
    isDrawing = true;
}

function handleSVGTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;

    const svg = e.currentTarget;
    const touch = e.touches[0];
    const rect = svg.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (isEraserMode) {
        eraseAtPoint(svg, x, y);
    } else {
        continueSVGPath(x, y);
    }
}

function handleSVGTouchEnd(e) {
    e.preventDefault();
    isDrawing = false;
    currentPath = null;
    pathData = '';
}

// ==========================================
// SVGパスの描画
// ==========================================
function startSVGPath(svg, x, y) {
    // 新しいパス要素を作成
    currentPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    currentPath.setAttribute('fill', 'none');
    currentPath.setAttribute('stroke', penColor);
    currentPath.setAttribute('stroke-width', penWidth);
    currentPath.setAttribute('stroke-linecap', 'round');
    currentPath.setAttribute('stroke-linejoin', 'round');

    pathData = `M ${x} ${y}`;
    currentPath.setAttribute('d', pathData);
    svg.appendChild(currentPath);

    lastX = x;
    lastY = y;
}

function continueSVGPath(x, y) {
    if (!currentPath) return;

    pathData += ` L ${x} ${y}`;
    currentPath.setAttribute('d', pathData);

    lastX = x;
    lastY = y;
}

// ==========================================
// SVG消しゴム機能
// ==========================================
function eraseAtPoint(svg, x, y) {
    const eraserRadius = eraserWidth / 2;
    const paths = svg.querySelectorAll('path');

    paths.forEach(path => {
        // パスのバウンディングボックスを取得
        try {
            const bbox = path.getBBox();
            // 消しゴムの範囲内にパスがあるかチェック
            if (isPointNearRect(x, y, eraserRadius, bbox)) {
                // より詳細なチェック：パスの各セグメントをチェック
                if (isPathNearPoint(path, x, y, eraserRadius)) {
                    path.remove();
                }
            }
        } catch (e) {
            // getBBoxが失敗した場合（空のパスなど）
        }
    });
}

function isPointNearRect(x, y, radius, rect) {
    // ポイントが矩形の拡張範囲内にあるかチェック
    return x >= rect.x - radius &&
           x <= rect.x + rect.width + radius &&
           y >= rect.y - radius &&
           y <= rect.y + rect.height + radius;
}

function isPathNearPoint(path, x, y, radius) {
    const pathD = path.getAttribute('d');
    if (!pathD) return false;

    // パスの座標を抽出
    const coords = pathD.match(/[\d.]+/g);
    if (!coords) return false;

    // 各座標ペアをチェック
    for (let i = 0; i < coords.length - 1; i += 2) {
        const px = parseFloat(coords[i]);
        const py = parseFloat(coords[i + 1]);
        const distance = Math.sqrt(Math.pow(px - x, 2) + Math.pow(py - y, 2));
        if (distance <= radius * 2) {
            return true;
        }
    }
    return false;
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

    // タッチイベント（パッシブではなく、preventDefault可能にする）
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    activeCanvases.push(canvas);
}

// ==========================================
// 描画開始（マウス）
// ==========================================
function startDrawing(e) {
    const canvas = e.target;

    // 🔧 初回のみCanvasサイズを調整（高速化）
    if (!canvas._initialized) {
        resizeCanvasToDisplaySize(canvas, { preserve: true });
        canvas._initialized = true;
    }

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

    // 消しゴムモードの場合
    if (isEraserMode) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = eraserWidth;
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penWidth;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    lastX = currentX;
    lastY = currentY;
}

// ==========================================
// 描画停止
// ==========================================
function stopDrawing() {
    isDrawing = false;
    // 🆕 消しゴムモードの影響を残さないようにリセット
    // すべてのCanvasのコンテキストを通常描画モードに戻す
    activeCanvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';
    });
}

// ==========================================
// タッチ開始
// ==========================================
function handleTouchStart(e) {
    e.preventDefault();
    const canvas = e.target;
    const touch = e.touches[0];

    // 🔧 初回のみCanvasサイズを調整（高速化）
    if (!canvas._initialized) {
        resizeCanvasToDisplaySize(canvas, { preserve: true });
        canvas._initialized = true;
    }

    const rect = canvas.getBoundingClientRect();

    const touchX = touch.clientX;
    const touchY = touch.clientY;

    lastX = touchX - rect.left;
    lastY = touchY - rect.top;

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

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    lastX = currentX;
    lastY = currentY;
}

// ==========================================
// タッチ終了
// ==========================================
function handleTouchEnd(e) {
    e.preventDefault();
    isDrawing = false;
    // 🆕 消しゴムモードの影響を残さないようにリセット
    activeCanvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';
    });
}

// ==========================================
// 全てのCanvasとSVGをクリア
// ==========================================
function clearAllCanvases() {
    // 現在表示されている画面のCanvas/SVGのみクリア
    const currentScreen = isPracticeMode ? 'practice-screen' : 'test-screen';
    const screenElement = document.getElementById(currentScreen);

    // Canvas（練習モード）をクリア
    screenElement.querySelectorAll('canvas.practice-draw-canvas, canvas.test-canvas').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // 🆕 SVG（テストモード）をクリア
    screenElement.querySelectorAll('svg.test-svg').forEach(svg => {
        // SVG内のすべてのpath要素を削除
        svg.querySelectorAll('path').forEach(path => path.remove());
    });
}

// ==========================================
// モード切り替え
// ==========================================
function switchMode() {
    // 🆕 テスト10問またはテスト20問の場合は、練習モードに戻れない
    if (testMode === 'test10' || testMode === 'test20') {
        // テストモードのみなので、何もしない
        return;
    }

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

    // 🆕 テスト10問またはテスト20問の場合は、モード切り替えボタンを非表示
    if (testMode === 'test10' || testMode === 'test20') {
        modeSwitchBtn.style.display = 'none';
    } else {
        modeSwitchBtn.style.display = 'flex';
    }

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
        // 🆕 SVGに移行したため、Canvasの再調整は不要
        // SVGはDOMベースなので、表示時の初期化処理不要
    }
}

// ==========================================
// 最初から練習
// ==========================================
function restartPractice() {
    if (confirm('全ての描画内容がクリアされます。\n最初からやり直しますか？')) {
        // 全てのCanvasをクリア（練習モード）
        activeCanvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        // 🆕 全てのSVGをクリア（テストモード）
        activeSVGs.forEach(svg => {
            svg.querySelectorAll('path').forEach(path => path.remove());
        });

        // 練習モードに戻る
        isPracticeMode = true;
        updateMode();
    }
}

// ==========================================
// 消しゴムモード切り替え
// ==========================================
function toggleEraser() {
    isEraserMode = !isEraserMode;
    updateEraserButton();

    // 🆕 ペンモードに戻るときは、すべてのCanvasを通常描画モードにリセット
    if (!isEraserMode) {
        activeCanvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            ctx.globalCompositeOperation = 'source-over';
        });
    }
}

function updateEraserButton() {
    const eraserBtn = document.getElementById('eraser-btn');
    const cursorSize = eraserWidth;
    const eraserCursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${cursorSize}" height="${cursorSize}" viewBox="0 0 ${cursorSize} ${cursorSize}"><circle cx="${cursorSize / 2}" cy="${cursorSize / 2}" r="${cursorSize / 2 - 1}" fill="none" stroke="rgba(255,87,34,0.8)" stroke-width="2"/></svg>') ${cursorSize / 2} ${cursorSize / 2}, crosshair`;

    if (isEraserMode) {
        eraserBtn.classList.add('active');
        eraserBtn.textContent = '✏️ ペンに戻る';

        // 消しゴムモード時はカーソルを変更（Canvas）
        activeCanvases.forEach(canvas => {
            canvas.style.cursor = eraserCursor;
        });
        
        // 🆕 SVGも消しゴムカーソルに変更
        activeSVGs.forEach(svg => {
            svg.style.cursor = eraserCursor;
        });
    } else {
        eraserBtn.classList.remove('active');
        eraserBtn.textContent = '🧹 消しゴム';

        // ペンモード時は通常のカーソルに戻す（Canvas）
        activeCanvases.forEach(canvas => {
            canvas.style.cursor = 'crosshair';
        });
        
        // 🆕 SVGも通常カーソルに戻す
        activeSVGs.forEach(svg => {
            svg.style.cursor = 'crosshair';
        });
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

            // 🆕 File System Access API を優先的に使用（Chrome, Edge）
            if ('showSaveFilePicker' in window) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: filename,
                        types: [{
                            description: 'PNG画像',
                            accept: { 'image/png': ['.png'] }
                        }]
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    alert('✅ スクリーンショットを保存しました！');
                    return;
                } catch (err) {
                    if (err.name === 'AbortError') {
                        // ユーザーがキャンセルした場合
                        return;
                    }
                    console.warn('File System Access API失敗:', err);
                    // フォールバック: 通常のダウンロードへ
                }
            }

            // iPad/iPhoneの場合：共有メニューを表示
            if (navigator.share && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                try {
                    const file = new File([blob], filename, { type: 'image/png' });
                    await navigator.share({
                        title: `漢字${modeName}`,
                        text: `漢字${modeName}のスクリーンショット`,
                        files: [file]
                    });
                    // 共有メニューで保存先を選択できます：
                    // - 写真に保存
                    // - ファイルに保存
                    // - その他のアプリに共有
                    return;
                } catch (err) {
                    if (err.name === 'AbortError') {
                        return;
                    }
                    console.warn('Web Share API失敗:', err);
                }
            }

            // フォールバック: 通常のダウンロード
            downloadBlob(blob, filename);
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
