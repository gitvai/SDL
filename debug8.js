const fs = require('fs');
const code = fs.readFileSync('new-order.html', 'utf8');
const lines = code.split('\n');
lines.forEach((l, i) => { if (l.includes('id="teeth-selection-area"')) console.log(i + ': ' + l.trim()); });
