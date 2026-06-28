const fs = require('fs');
const Tesseract = require('tesseract.js');
const path = 'C:\\Users\\Vaibhav\\Desktop\\sdl\\report order';
const files = fs.readdirSync(path).filter(f => f.endsWith('.png') || f.endsWith('.jpg')).slice(0, 5);

async function run() {
    for (const f of files) {
        console.log(`Analyzing ${f}...`);
        const { data: { text } } = await Tesseract.recognize(
            `${path}\\${f}`,
            'eng'
        );
        console.log(`--- ${f} ---`);
        console.log(text.split('\n').slice(0, 15).join('\n'));
    }
}
run();
