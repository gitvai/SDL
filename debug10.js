const fs = require('fs');
const code = fs.readFileSync('new-order.html', 'utf8');
const { JSDOM } = require('jsdom');
const dom = new JSDOM(code);
console.log("Total .tooth-num:", dom.window.document.querySelectorAll('.tooth-num').length);
console.log("Total #teeth-selection-area .tooth-num:", dom.window.document.querySelectorAll('#teeth-selection-area .tooth-num').length);
