const fs = require('fs');
const Tesseract = require('tesseract.js');
const path = require('path');

const imgDir = 'C:\\Users\\Vaibhav\\Desktop\\sdl\\report order';
const files = fs.readdirSync(imgDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));

async function run() {
    let output = '';
    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        console.log(`Processing ${i+1}/${files.length}: ${f}`);
        try {
            const { data: { text } } = await Tesseract.recognize(path.join(imgDir, f), 'eng');
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            
            output += `\n\n========================================\n`;
            output += `IMAGE: ${f}\n`;
            output += `========================================\n`;
            output += lines.slice(0, 30).join('\n') + '\n';
        } catch (e) {
            console.error(`Error on ${f}:`, e);
        }
    }
    fs.writeFileSync('C:\\Users\\Vaibhav\\Desktop\\sdl\\sdl\\ocr_results_full.txt', output);
    console.log('Done!');
}
run();
