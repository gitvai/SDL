const fs = require('fs');
let html = fs.readFileSync('edit-order.html', 'utf8');
html = html.replace(/<option>Hold<\/option>/g, '<option value="On Hold">On Hold</option>');
fs.writeFileSync('edit-order.html', html);
console.log('Fixed edit-order.html');
