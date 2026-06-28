const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/Vaibhav/Desktop/sdl/sdl';

function searchInFile(filePath, query) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.toLowerCase().includes(query.toLowerCase())) {
      console.log(`Found "${query}" in: ${filePath}`);
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          console.log(`  Line ${index + 1}: ${line.trim()}`);
        }
      });
    }
  } catch (err) {
    // ignore
  }
}

function searchRecursive(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'backend') {
        searchRecursive(fullPath, query);
      }
    } else {
      if (file.endsWith('.html') || file.endsWith('.js')) {
        searchInFile(fullPath, query);
      }
    }
  }
}

searchRecursive(directory, 'Paid to');
searchRecursive(directory, 'Bank a/c');
searchRecursive(directory, 'NetBanking');
