const fs = require('fs');
const Tesseract = require('tesseract.js');
const path = 'C:\\Users\\Vaibhav\\Desktop\\sdl\\report order';
const files = fs.readdirSync(path).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));

async function run() {
    for (const f of files) {
        try {
            const { data: { text } } = await Tesseract.recognize(`${path}\\${f}`, 'eng');
            const lines = text.split('\n');
            const matchReports = ['Client wise Invoiced Order Jobs', 'by ProductType', 'Product - Summary', 'Orders Jobs- by Due Date', 'Client, Product wise Invoiced Order Job Summary'];
            if (matchReports.some(r => text.includes(r))) {
                console.log(`\n\n--- MATCH IN ${f} ---`);
                console.log(lines.slice(0, 20).join('\n'));
            }
        } catch (e) {
            console.error(e);
        }
    }
}
run();
