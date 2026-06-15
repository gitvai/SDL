const fs = require('fs');

function fixTableDisplay() {
    let content = fs.readFileSync('orders.html', 'utf8');

    const searchStr = `case 'product': cellVal = \`<span class="product-badge" style="background: \${getProductColor(order.productType)}20; color: \${getProductColor(order.productType)}">\${order.productName || '-'}</span>\`; break;`;

    const replaceStr = `case 'product': 
                            if (order.jobs && order.jobs.length > 0) {
                                cellVal = order.jobs.map(j => \`<span class="product-badge" style="background: \${getProductColor(j.productType)}20; color: \${getProductColor(j.productType)}; margin-right: 4px; display: inline-block; margin-bottom: 2px;">\${j.productName || j.productType || '-'}</span>\`).join('');
                            } else {
                                cellVal = \`<span class="product-badge" style="background: \${getProductColor(order.productType)}20; color: \${getProductColor(order.productType)}">\${order.productName || '-'}</span>\`; 
                            }
                            break;`;

    if (content.includes(searchStr)) {
        content = content.replace(searchStr, replaceStr);
        fs.writeFileSync('orders.html', content);
        console.log("Fixed default table products display in orders.html");
    } else {
        console.log("Could not find the exact string. Checking with regex...");
        const regex = /case 'product': cellVal = `<span class="product-badge"[^>]+>\${order\.productName \|\| '-'\}<\/span>`; break;/g;
        if (regex.test(content)) {
            content = content.replace(regex, replaceStr);
            fs.writeFileSync('orders.html', content);
            console.log("Fixed via regex");
        } else {
            console.log("Still could not find it. Dumping context...");
        }
    }
}

fixTableDisplay();
