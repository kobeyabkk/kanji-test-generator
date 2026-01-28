const fs = require('fs');

const file = 'data/grade1_kanji.json';
const content = fs.readFileSync(file, 'utf8');

console.log(`Total file size: ${content.length} bytes`);

// Position 19632
const position = 19632;
if (position > content.length) {
    console.log(`Position ${position} is beyond file size ${content.length}`);
} else {
    const start = Math.max(0, position - 150);
    const end = Math.min(content.length, position + 150);
    
    console.log('\n=== Context around position 19632 ===');
    console.log(content.substring(start, position) + ' ⚠️⚠️⚠️ ' + content.substring(position, end));
    
    // Find line number
    const lines = content.substring(0, position).split('\n');
    console.log(`\nLine: ${lines.length}, Column: ${lines[lines.length - 1].length + 1}`);
    
    // Show the problematic character
    console.log(`\nCharacter at position ${position}: "${content[position]}" (code: ${content.charCodeAt(position)})`);
}
