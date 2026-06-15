const fs = require('fs');

function fixFields(filename) {
    let content = fs.readFileSync(filename, 'utf8');

    // 1. Add missing `removeField` and `renderColumnsTable`
    const logicToInject = `
        window.renderColumnsTable = function() {
            const tbody = document.getElementById('grid-settings-tbody');
            if (!tbody) return;
            let tableRows = '';
            draftSettings.columns.forEach((col, idx) => {
                tableRows += \`
                    <tr style="border-bottom: 1px solid #333;">
                        <td style="padding:6px 10px; border-right:1px solid #333; text-align:center;">\${idx + 1}</td>
                        <td style="padding:6px 10px; border-right:1px solid #333; font-size:14px; color:#333;">\${col.name}</td>
                        <td style="padding:6px 10px; border-right:1px solid #333;">
                            <input type="text" value="\${col.caption || col.name}" style="width:100%; padding:4px 6px; border:1px solid #ccc; border-radius:2px; font-size:13px;">
                        </td>
                        <td style="padding:6px 10px; text-align:center;">
                            <button onclick="removeField('\${col.key}')" style="background:none; border:none; font-size:18px; font-weight:bold; color:#ef4444; cursor:pointer;">&times;</button>
                        </td>
                    </tr>
                \`;
            });
            tbody.innerHTML = tableRows;
            
            // Also update the dropdown list
            if (window.updateAddFieldsDropdown) {
                window.updateAddFieldsDropdown();
            }
        };

        window.removeField = function(key) {
            draftSettings.columns = draftSettings.columns.filter(c => c.key !== key);
            renderColumnsTable();
        };
    `;

    // 2. Ensure they are injected into the file
    if (!content.includes('window.renderColumnsTable = function')) {
        content = content.replace(/window\.closeGridSettingsModal = function/, logicToInject + '\n        window.closeGridSettingsModal = function');
    }

    fs.writeFileSync(filename, content);
    console.log('Fixed Add Fields logic in ' + filename);
}

fixFields('shipments.html');
fixFields('accounts.html');
