const fs = require('fs');

const file = 'data/grade4_kanji.json';
const content = fs.readFileSync(file, 'utf8');

// Position 19632
const position = 19632;
const start = Math.max(0, position - 200);
const end = Math.min(content.length, position + 200);

console.log('=== Context around position 19632 ===');
console.log(content.substring(start, position) + '⚠️⚠️⚠️' + content.substring(position, end));

// Try to find line number
const lines = content.substring(0, position).split('\n');
console.log(`\nLine number: ${lines.length}`);
console.log(`Column: ${lines[lines.length - 1].length + 1}`);
