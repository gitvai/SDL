const fs = require('fs');

function fixProductDisplay() {
    let content = fs.readFileSync('orders.html', 'utf8');

    const searchStr = `let displayProducts = order.productName || order.productType || '-';
                                if (order.jobs && order.jobs.length > 0) {
                                    displayProducts += ', ' + order.jobs.map(j => j.productName || j.productType).join(', ');
                                }`;
    
    const replacementStr = `let displayProducts = '';
                                if (order.jobs && order.jobs.length > 0) {
                                    displayProducts = order.jobs.map(j => j.productName || j.productType).join(', ');
                                } else {
                                    displayProducts = order.productName || order.productType || '-';
                                }`;
    
    if (content.includes(searchStr)) {
        content = content.replace(searchStr, replacementStr);
        fs.writeFileSync('orders.html', content);
        console.log('Fixed product display duplicate bug in orders.html');
    } else {
        console.log('String not found in orders.html! Maybe whitespace differences.');
    }
}

fixProductDisplay();
