const fs = require('fs');

const files = [
  'accounts.html', 'accounts_scripts.js', 'clients.html', 'client_viewer.html',
  'delivery_note.html', 'edit-order.html', 'index.html', 'invoice.html',
  'live_office.html', 'new-order.html', 'office.html', 'orders.html',
  'reports.html', 'script.js', 'settings.html', 'shipments.html',
  'shipments_scripts.js', 'transitions.js'
];

const target = "const API_BASE = (window.location.protocol === 'file:' || isLocalhost) ? 'http://localhost:5000/api' : window.location.origin + '/api';";

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log('File does not exist:', file);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');
  
  const searchStr = "const API_BASE = (window.location.protocol === 'file:' || isLocalhost) ? 'http://localhost:5000/api' : (window.location.hostname === 'sdl-backend-l5r2.onrender.com' ? window.location.origin + '/api' : 'https://sdl-backend-l5r2.onrender.com/api');";
  
  if (content.includes('sdl-backend-l5r2.onrender.com')) {
    if (content.includes(searchStr)) {
      content = content.replace(searchStr, target);
      console.log('Modified (string exact replacement):', file);
    } else {
      // Regexp fallback
      const oldLength = content.length;
      content = content.replace(/const\s+API_BASE\s*=\s*\(window\.location\.protocol\s*===\\s*'file:'\s*\|\|\s*isLocalhost\)\s*\?\s*'http:\/\/localhost:5000\/api'\s*:\s*\(window\.location\.hostname\s*===\s*'[a-zA-Z0-9\-\.]+'\s*\?\s*window\.location\.origin\s*\+\s*'\/api'\s*:\s*'https:\/\/[a-zA-Z0-9\-\.]+\/api'\);/g, target);
      if (content.length !== oldLength) {
        console.log('Modified (regex replacement):', file);
      } else {
        // Simple replace on domain name
        content = content.split("(window.location.hostname === 'sdl-backend-l5r2.onrender.com' ? window.location.origin + '/api' : 'https://sdl-backend-l5r2.onrender.com/api')").join("window.location.origin + '/api'");
        console.log('Modified (fallback replacement):', file);
      }
    }
    fs.writeFileSync(file, content, 'utf8');
  } else {
    console.log('Already dynamic or pattern not found:', file);
  }
});
