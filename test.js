const fs = require('fs');
['shipments.html', 'accounts.html'].forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const m = content.match(/onclick="([a-zA-Z0-9_]+)/g);
    if(m) {
        console.log("---", file, "---");
        m.forEach(x => {
            let f = x.split('"')[1];
            if(!content.includes('function ' + f) && !content.includes(f + ' =') && !content.includes(f + ':')) console.log(f);
        });
    }
});
