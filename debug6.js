const fs = require('fs');
const { JSDOM } = require('jsdom');
let html = fs.readFileSync('new-order.html', 'utf8');

html = html.replace("el.style.background = circleColors[0];", "console.log('Setting background to:', circleColors[0]); el.style.backgroundColor = circleColors[0];");

const dom = new JSDOM(html, { runScripts: 'dangerously' });

setTimeout(() => {
    dom.window.console.log = console.log;
    try { dom.window.handleTeethManualInput('17, 18'); } catch(e) {}
}, 500);
