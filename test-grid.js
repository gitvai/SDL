const fs = require('fs');
const code = fs.readFileSync('new-order.html', 'utf8');
const start = code.indexOf('class="teeth-grid"');
console.log(code.substring(start, start + 800));
