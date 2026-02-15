const fs = require('fs');
const content = fs.readFileSync('c:/Users/Adalmir/Desktop/apenas teste/redflix/src/app/dashred/page.tsx', 'utf8');

function checkPairs(text, open, close) {
    let count = 0;
    let pos = 0;
    while ((pos = text.indexOf(open, pos)) !== -1) {
        count++;
        pos += open.length;
    }
    let closeCount = 0;
    pos = 0;
    while ((pos = text.indexOf(close, pos)) !== -1) {
        closeCount++;
        pos += close.length;
    }
    return { open: count, close: closeCount };
}

console.log('Braces:', checkPairs(content, '{', '}'));
console.log('Parens:', checkPairs(content, '(', ')'));
console.log('Squares:', checkPairs(content, '[', ']'));
console.log('Angle Open:', (content.match(/<(?![0-9\s])/g) || []).length);
console.log('Angle Close:', (content.match(/>/g) || []).length);
