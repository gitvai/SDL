const fs = require('fs');
const { JSDOM } = require('jsdom');
let html = fs.readFileSync('new-order.html', 'utf8');

// Inject console.log inside updateTeethUI
html = html.replace('if (selectedTeeth.includes(tNum.toString()) || selectedTeeth.includes(tNum)) {',
    'console.log("Checking tNum:", tNum, "selectedTeeth:", selectedTeeth);\nif (selectedTeeth.includes(tNum.toString()) || selectedTeeth.includes(tNum)) {');

const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://localhost'
});

setTimeout(() => {
    try {
        console.log("Calling handleTeethManualInput...");
        dom.window.console.log = console.log;
        dom.window.handleTeethManualInput('17, 18');
    } catch(e) {
        console.error("Error:", e);
    }
}, 1000);
