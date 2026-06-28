const fs = require('fs');
const { JSDOM } = require('jsdom');
const code = fs.readFileSync('new-order.html', 'utf8');

// Mock fetch so JSDOM doesn't throw
const dom = new JSDOM(code, { 
    runScripts: 'dangerously',
    beforeParse(window) {
        window.fetch = async () => ({ ok: true, json: async () => [] });
        window.alert = console.log;
        // Mock console.log inside the page to capture it
        window.console.log = (...args) => console.log('PAGE LOG:', ...args);
    }
});

dom.window.document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Find handleTeethManualInput
        // We can just call it
        try {
            console.log('Calling handleTeethManualInput');
            dom.window.handleTeethManualInput('17, 18');
            
            // Now check the styles of the elements
            const teeth = Array.from(dom.window.document.querySelectorAll('.tooth-num'));
            const selected = teeth.filter(t => t.style.background !== 'transparent' && t.style.background !== '');
            console.log('Selected elements:', selected.length);
            selected.forEach(t => {
                console.log('Tooth:', t.textContent, 'Background:', t.style.background, 'Class:', t.className);
            });
            
            // Also check if any have .selected class
            const selectedClass = teeth.filter(t => t.classList.contains('selected'));
            console.log('Selected class elements:', selectedClass.length);
            
        } catch(e) {
            console.error('Error:', e);
        }
        process.exit(0);
    }, 500);
});
