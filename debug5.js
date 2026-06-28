const fs = require('fs');
const { JSDOM } = require('jsdom');
let html = fs.readFileSync('new-order.html', 'utf8');

const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://localhost'
});

setTimeout(() => {
    try {
        dom.window.console.log = console.log;
        dom.window.handleTeethManualInput('17, 18');
        const teeth = Array.from(dom.window.document.querySelectorAll('.tooth-num'));
        const selected = teeth.filter(t => t.textContent === '8' || t.textContent === '7');
        selected.forEach(t => {
            console.log("Tooth", t.textContent, "Classes:", t.className, "Style:", t.getAttribute('style'));
        });
    } catch(e) {
        console.error("Error:", e);
    }
}, 1000);
