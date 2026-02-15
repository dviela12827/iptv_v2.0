const fs = require('fs');
const content = fs.readFileSync('c:/Users/Adalmir/Desktop/apenas teste/redflix/src/app/dashred/page.tsx', 'utf8');

// Remove comments
const noComments = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

const tags = noComments.match(/<div|<\/div>|<div[^>]*\/>/g) || [];
// This still misses multi-line self-closing. 
// Let's use a better approach.

let depth = 0;
let pos = 0;
while (pos < noComments.length) {
    if (noComments.startsWith('</div>', pos)) {
        depth--;
        pos += 6;
    } else if (noComments.slice(pos).match(/^<div[\s\S]*?\/>/)) {
        // Self-closing
        const match = noComments.slice(pos).match(/^<div[\s\S]*?\/>/)[0];
        pos += match.length;
    } else if (noComments.startsWith('<div', pos)) {
        depth++;
        pos += 4;
    } else {
        pos++;
    }
}
console.log('Final depth:', depth);
