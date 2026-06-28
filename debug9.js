const fs = require('fs');
const { JSDOM } = require('jsdom');
let html = fs.readFileSync('new-order.html', 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });

setTimeout(() => {
    try { 
        dom.window.handleTeethManualInput('17, 18'); 
    } catch(e) {
        console.error("handleTeethManualInput error:", e);
    }
    const teeth = Array.from(dom.window.document.querySelectorAll('.tooth-num'));
    const t8 = teeth.find(t => t.textContent === '8');
    if (t8) {
        console.log("cssText:", t8.style.cssText);
    }
    process.exit(0);
}, 1000);
