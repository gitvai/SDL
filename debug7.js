const fs = require('fs');
const { JSDOM } = require('jsdom');
let html = fs.readFileSync('new-order.html', 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });

setTimeout(() => {
    try { dom.window.handleTeethManualInput('17, 18'); } catch(e) {}
    const teeth = Array.from(dom.window.document.querySelectorAll('.tooth-num'));
    const t8 = teeth.find(t => t.textContent === '8');
    console.log("cssText:", t8.style.cssText);
    console.log("background:", t8.style.background);
    console.log("backgroundColor:", t8.style.backgroundColor);
    console.log("color:", t8.style.color);
    process.exit(0);
}, 1000);
