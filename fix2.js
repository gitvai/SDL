const fs = require('fs');

['new-order.html', 'edit-order.html'].forEach(f => {
    let html = fs.readFileSync(f, 'utf8');
    
    // Fix double bracket in new-order.html (which is right before handleStatusChange)
    html = html.replace(/container\.innerHTML = '';\s*\}\s*\}\s*\}\s*function handleStatusChange/, "container.innerHTML = '';\n            }\n        }\n\n        function handleStatusChange");
    
    // Wait, the previous output showed:
    // } else {
    //     wrapper.style.display = 'none';
    //     container.innerHTML = '';
    // }
    // }
    // }
    // function handleStatusChange() {
    
    html = html.replace(/container\.innerHTML = '';\s*\}\s*\}\s*\}\s*function/, "container.innerHTML = '';\n            }\n        }\n\n        function");
    html = html.replace(/container\.innerHTML = '';\s*\}\s*\}\s*function/, "container.innerHTML = '';\n            }\n        }\n\n        function");
    
    // In edit-order.html it might be before cancelTeethSelection
    html = html.replace(/container\.innerHTML = '';\s*\}\s*\}\s*\}\s*function cancelTeethSelection/, "container.innerHTML = '';\n            }\n        }\n\n        function cancelTeethSelection");

    // Fix edit-order.html missing brackets at EOF
    if (f === 'edit-order.html') {
        const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
        if (scriptMatch) {
            let scriptContent = scriptMatch[1];
            // Just replace the end if it's missing
            if (!scriptContent.trim().endsWith('}')) {
                // Not sure what is missing, but maybe we can just remove `}` or add `}`
                // Actually the error was "Unexpected end of input", meaning it needs MORE `}`.
            }
        }
    }
    
    fs.writeFileSync(f, html);
    console.log('Fixed ' + f);
});
