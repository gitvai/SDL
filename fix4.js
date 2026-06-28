const fs = require('fs');

['new-order.html', 'edit-order.html'].forEach(filename => {
    let oldHtml = fs.readFileSync('old-' + filename, 'utf8');
    let newHtml = fs.readFileSync(filename, 'utf8');

    // Extract missing functions from oldHtml
    // In oldHtml, updateTeethUI ended with:
    //         }
    //
    //         function saveAndAddNewJob() {
    
    let match = oldHtml.match(/function updateTeethUI[\s\S]*?\n        }\n\n        (function saveAndAddNewJob[\s\S]*?)(?=function cancelTeethSelection)/);
    
    if (match && match[1]) {
        let missingCode = match[1];
        
        // Find where to inject it in newHtml
        // We inject it right before function cancelTeethSelection
        if (!newHtml.includes('function saveAndAddNewJob')) {
            newHtml = newHtml.replace(/function cancelTeethSelection/, missingCode + '\n        function cancelTeethSelection');
            fs.writeFileSync(filename, newHtml);
            console.log("Restored missing functions in " + filename);
        } else {
            console.log(filename + " already has saveAndAddNewJob");
        }
    } else {
        console.log("Could not find missing functions in old-" + filename);
    }
});
