const fs = require('fs');

const fixPrecision = (filename) => {
    let content = fs.readFileSync(filename, 'utf8');
    
    // Replace: const newBalance = invoice.netAmount - newPaid;
    // With:    const newBalance = Math.round((invoice.netAmount - newPaid) * 100) / 100;
    content = content.replace(/const newBalance = invoice\.netAmount - newPaid;/g, 'const newBalance = Math.round((invoice.netAmount - newPaid) * 100) / 100;');
    
    // Same for new-order.html slab rates or totals if any (not requested but similar logic)
    // Actually the user specifically asked for accounts.html Amount - Paid = Balance
    // "accounts.html mein Javascript parseFloat() use karke calculations (Amount - Paid = Balance) kar rahi hai."
    
    fs.writeFileSync(filename, content);
    console.log('Fixed precision in ' + filename);
};

fixPrecision('accounts.html');
