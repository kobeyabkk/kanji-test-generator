const fs = require('fs');

const files = [
    'data/grade1_kanji.json',
    'data/grade2_kanji.json',
    'data/grade3_kanji.json',
    'data/grade4_kanji.json',
    'data/grade5_kanji.json',
    'data/grade6_kanji.json'
];

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        JSON.parse(content);
        console.log(`✅ ${file} is valid`);
    } catch (error) {
        console.error(`❌ ${file} has error:`, error.message);
    }
});
