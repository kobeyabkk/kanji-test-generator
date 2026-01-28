// 小2データ変換スクリプト
const fs = require('fs');

// 元データを読み込み
const sourceData = JSON.parse(fs.readFileSync('syou2_original.json', 'utf8'));

// 変換
const convertedData = sourceData.map(item => {
  const result = {
    kanji: item.kanji,
    yomi: item.yomi,
    meaning: item.meaning,
    examples: [item.example1, item.example2],
    readings: {}
  };
  
  // readingsオブジェクトを構築
  result.readings[item.example1] = item.reading1;
  result.readings[item.example2] = item.reading2;
  
  return result;
});

// 変換後のデータを保存
fs.writeFileSync('data/grade2_kanji.json', JSON.stringify(convertedData, null, 2), 'utf8');

console.log('✅ 変換完了！');
console.log(`漢字数: ${convertedData.length}字`);
