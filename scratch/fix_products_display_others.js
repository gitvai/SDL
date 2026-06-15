const fs = require('fs');

function fixProductDisplayRegex(filename) {
    let content = fs.readFileSync(filename, 'utf8');

    const searchRegex = /let displayProducts = order\.productName \|\| order\.productType \|\| '-';\s*if \(order\.jobs && order\.jobs\.length > 0\) \{\s*displayProducts \+= ', ' \+ order\.jobs\.map\(j => j\.productName \|\| j\.productType\)\.join\(', '\);\s*\}/m;
    
    const replacementStr = `let displayProducts = '';
                                if (order.jobs && order.jobs.length > 0) {
                                    displayProducts = order.jobs.map(j => j.productName || j.productType).join(', ');
                                } else {
                                    displayProducts = order.productName || order.productType || '-';
                                }`;
    
    if (searchRegex.test(content)) {
        content = content.replace(searchRegex, replacementStr);
        fs.writeFileSync(filename, content);
        console.log('Fixed product display duplicate bug in ' + filename + ' using regex!');
    } else {
        console.log('Regex not found in ' + filename);
    }
}

fixProductDisplayRegex('accounts.html');
fixProductDisplayRegex('shipments.html');
