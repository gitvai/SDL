const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('new-order.html', 'utf8');

const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://localhost'
});

setTimeout(() => {
    try {
        console.log("Calling handleTeethManualInput...");
        dom.window.handleTeethManualInput('17, 18');
        const teeth = Array.from(dom.window.document.querySelectorAll('.tooth-num'));
        const selected = teeth.filter(t => t.style.background !== 'transparent' && t.style.background !== '');
        console.log("Selected length:", selected.length);
        selected.forEach(t => {
            console.log("Tooth HTML:", t.outerHTML);
        });
    } catch(e) {
        console.error("Error:", e);
    }
}, 1000);
