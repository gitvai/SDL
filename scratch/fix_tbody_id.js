const fs = require('fs');

function fixTbody(filename) {
    let content = fs.readFileSync(filename, 'utf8');
    
    // Find the tbody that comes right before ${tableRows} in the modal
    content = content.replace(/<tbody>\s*\$\{tableRows\}\s*<\/tbody>/, '<tbody id="grid-settings-tbody">\n                                    ${tableRows}\n                                </tbody>');
    
    fs.writeFileSync(filename, content);
    console.log('Fixed tbody in ' + filename);
}

fixTbody('shipments.html');
fixTbody('accounts.html');
