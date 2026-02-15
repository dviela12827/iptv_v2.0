const fs = require('fs');
const filePath = 'c:/Users/Adalmir/Desktop/apenas teste/redflix/src/app/dashred/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the extra div after the KPI grid (if I added one accidentally)
// Current state around 612:
// 612:                                     </div>
// 613:                                     </div>
// 614:                                 </div>
// 615:                                 ))}
// 616:                             </div>
content = content.replace(/<\/div>\s+<\/div>\s+<\/div>\s+\)\)\}\s+<\/div>/, '</div>\n                                    </div>\n                                </div>\n                                ))}\n                            </div>');

// 2. Fix the modal in expiring tab
// I want to ensure 4 closing divs before )} and one </div> after )}
content = content.replace(/<\/div>\s+<\/div>\s+<\/div>\s+\)\}\s+<\/div>/, '</div>\n                                    </div>\n                                </div>\n                                </div>\n                            )}\n                        </div>');

fs.writeFileSync(filePath, content);
console.log('Fixed file structural issues.');
