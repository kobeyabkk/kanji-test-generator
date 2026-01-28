// ==================================
// グローバル変数
// ==================================
let allGradesData = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: []
};

let currentGrade = 1;
let modifiedData = {};
let originalData = {};

// ==================================
// 初期化
// ==================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    setupEventListeners();
    renderTable();
});

// ==================================
// データ読み込み
// ==================================
async function loadAllData() {
    try {
        for (let grade = 1; grade <= 6; grade++) {
            const response = await fetch(`data/grade${grade}_kanji.json`);
            const data = await response.json();
            allGradesData[grade] = data;
            originalData[grade] = JSON.parse(JSON.stringify(data)); // ディープコピー
        }
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('kanji-table').style.display = 'table';
        updateStats();
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        document.getElementById('loading').textContent = 'データの読み込みに失敗しました。';
    }
}

// ==================================
// イベントリスナー設定
// ==================================
function setupEventListeners() {
    // タブ切り替え
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentGrade = parseInt(tab.dataset.grade);
            renderTable();
        });
    });

    // 検索
    document.getElementById('search-input').addEventListener('input', (e) => {
        renderTable(e.target.value);
    });

    // リセット
    document.getElementById('reset-btn').addEventListener('click', () => {
        if (confirm('すべての変更をデフォルトに戻しますか？')) {
            localStorage.removeItem('kanji_edited_data');
            allGradesData = JSON.parse(JSON.stringify(originalData));
            modifiedData = {};
            renderTable();
            updateStats();
            alert('✅ デフォルトに戻しました。');
        }
    });
}

// ==================================
// テーブル描画
// ==================================
function renderTable(searchQuery = '') {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    const data = allGradesData[currentGrade];
    const query = searchQuery.toLowerCase();

    let displayCount = 0;

    data.forEach((item, index) => {
        // 検索フィルター
        if (query) {
            const searchText = [
                item.kanji,
                item.yomi,
                item.meaning,
                ...(item.examples || []),
                ...Object.values(item.readings || {})
            ].join(' ').toLowerCase();

            if (!searchText.includes(query)) {
                return;
            }
        }

        displayCount++;

        const row = document.createElement('tr');
        const isModified = modifiedData[`${currentGrade}-${index}`];
        if (isModified) {
            row.classList.add('modified');
        }

        const examples = item.examples || [];
        const readings = item.readings || {};

        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="kanji-cell">${item.kanji}</td>
            <td><input class="editable" type="text" data-field="yomi" data-index="${index}" value="${item.yomi || ''}"></td>
            <td><input class="editable" type="text" data-field="meaning" data-index="${index}" value="${item.meaning || ''}"></td>
            <td><input class="editable" type="text" data-field="example1" data-index="${index}" value="${examples[0] || ''}"></td>
            <td><input class="editable" type="text" data-field="reading1" data-index="${index}" value="${readings[examples[0]] || ''}"></td>
            <td><input class="editable" type="text" data-field="example2" data-index="${index}" value="${examples[1] || ''}"></td>
            <td><input class="editable" type="text" data-field="reading2" data-index="${index}" value="${readings[examples[1]] || ''}"></td>
            <td>
                <button class="action-btn btn-save" onclick="saveRow(${index})">保存</button>
            </td>
        `;

        tbody.appendChild(row);

        // 編集イベント
        row.querySelectorAll('.editable').forEach(input => {
            input.addEventListener('change', () => {
                markAsModified(index);
            });
        });
    });

    document.getElementById('display-count').textContent = displayCount;
}

// ==================================
// 行を変更済みにマーク
// ==================================
function markAsModified(index) {
    modifiedData[`${currentGrade}-${index}`] = true;
    updateStats();
}

// ==================================
// 行を保存
// ==================================
function saveRow(index) {
    const inputs = document.querySelectorAll(`[data-index="${index}"]`);
    const item = allGradesData[currentGrade][index];

    // 保存前の例文を記録（読み仮名の古いキーを削除するため）
    const oldExample1 = item.examples ? item.examples[0] : '';
    const oldExample2 = item.examples ? item.examples[1] : '';

    let newExample1 = '';
    let newExample2 = '';
    let newReading1 = '';
    let newReading2 = '';

    // まず全ての値を取得
    inputs.forEach(input => {
        const field = input.dataset.field;
        const value = input.value.trim();

        if (field === 'yomi') {
            item.yomi = value;
        } else if (field === 'meaning') {
            item.meaning = value;
        } else if (field === 'example1') {
            newExample1 = value;
        } else if (field === 'example2') {
            newExample2 = value;
        } else if (field === 'reading1') {
            newReading1 = value;
        } else if (field === 'reading2') {
            newReading2 = value;
        }
    });

    // 例文を更新
    if (!item.examples) item.examples = [];
    item.examples[0] = newExample1;
    item.examples[1] = newExample2;

    // 読み仮名を更新（古いキーを削除してから新しいキーで保存）
    if (!item.readings) item.readings = {};
    
    // 古いキーを削除
    if (oldExample1 && oldExample1 !== newExample1) {
        delete item.readings[oldExample1];
    }
    if (oldExample2 && oldExample2 !== newExample2) {
        delete item.readings[oldExample2];
    }
    
    // 新しいキーで保存
    if (newExample1) {
        item.readings[newExample1] = newReading1;
    }
    if (newExample2) {
        item.readings[newExample2] = newReading2;
    }

    markAsModified(index);
    
    // 🆕 LocalStorageに自動保存
    try {
        localStorage.setItem('kanji_edited_data', JSON.stringify(allGradesData));
        console.log('✅ 自動保存完了');
    } catch (error) {
        console.error('保存エラー:', error);
        alert('❌ 保存に失敗しました。');
    }
    
    // 保存した行の背景色を変更（視覚的フィードバック）
    const row = document.querySelector(`[data-index="${index}"]`).closest('tr');
    if (row && !row.classList.contains('modified')) {
        row.classList.add('modified');
    }
    
    // 保存完了を一瞬だけ強調表示（緑色に変更）
    row.style.backgroundColor = '#d4edda';
    setTimeout(() => {
        row.style.backgroundColor = '';
    }, 800);
}

// ==================================
// 統計更新
// ==================================
function updateStats() {
    let totalCount = 0;
    for (let grade = 1; grade <= 6; grade++) {
        totalCount += allGradesData[grade].length;
    }

    const modifiedCount = Object.keys(modifiedData).length;

    document.getElementById('total-count').textContent = totalCount;
    document.getElementById('modified-count').textContent = modifiedCount;
}