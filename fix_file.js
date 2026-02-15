const fs = require('fs');

const filePath = 'c:/Users/Adalmir/Desktop/apenas teste/redflix/src/app/dashred/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

// Find the line with ')}' followed by '</div>' near the end of expiring tab
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(')}') && i > 0 && lines[i - 1].includes('</div>')) {
        // Check if there are only 3 divs before
        let count = 0;
        for (let j = i - 1; j >= i - 10; j--) {
            if (lines[j].includes('</div>')) count++;
            else break;
        }
        if (count === 3) {
            console.log(`Adding missing div at line ${i}`);
            lines.splice(i, 0, '                                </div>');
            break;
        }
    }
}

fs.writeFileSync(filePath, lines.join('\n'));
