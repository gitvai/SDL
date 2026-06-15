const fs = require('fs');

function fixProductDisplayRegex() {
    let content = fs.readFileSync('orders.html', 'utf8');

    const searchRegex = /let displayProducts = order\.productName \|\| order\.productType \|\| '-';\s*if \(order\.jobs && order\.jobs\.length > 0\) \{\s*displayProducts \+= ', ' \+ order\.jobs\.map\(j => j\.productName \|\| j\.productType\)\.join\(', '\);\s*\}/m;
    
    const replacementStr = `let displayProducts = '';
                                if (order.jobs && order.jobs.length > 0) {
                                    displayProducts = order.jobs.map(j => j.productName || j.productType).join(', ');
                                } else {
                                    displayProducts = order.productName || order.productType || '-';
                                }`;
    
    if (searchRegex.test(content)) {
        content = content.replace(searchRegex, replacementStr);
        fs.writeFileSync('orders.html', content);
        console.log('Fixed product display duplicate bug in orders.html using regex!');
    } else {
        console.log('Regex still not found in orders.html!');
    }
}

fixProductDisplayRegex();
