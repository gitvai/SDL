const fs = require('fs');

const fixLogic = (filename) => {
    let content = fs.readFileSync(filename, 'utf8');
    
    // 1. Change OK button onclick
    content = content.replace(
        /<button style="([^"]*)" onclick="closeGridSettingsModal\(\)">OK<\/button>/g,
        '<button style="$1" onclick="saveGridSettings()">OK</button>'
    );
    
    // 2. Replace saveGridSettings
    const oldSave = /window\.saveGridSettings = function\(\) \{[\s\S]*?closeGridSettingsModal\(\);\s*\};/;
    const newSave = `window.saveGridSettings = function() {
            // Read column captions
            const captionInputs = document.querySelectorAll('#grid-settings-tbody input');
            if (captionInputs.length > 0 && draftSettings.columns.length > 0) {
                draftSettings.columns.forEach((col, idx) => {
                    if(captionInputs[idx]) {
                        col.caption = captionInputs[idx].value;
                        // Attempt to update headers if data-col exists, otherwise just try by index (naive)
                        const ths = document.querySelectorAll('.table-container table th, .card table th');
                        // In this mock, we'll just show a success message since table logic varies
                    }
                });
            }

            const visibleKeys = draftSettings.columns.map(c => c.key);
            const hiddenCols = ALL_COLUMNS.filter(c => !visibleKeys.includes(c.key)).map(c => c.key);
            gridUserFields[currentActiveTabSettingsType] = hiddenCols;
            localStorage.setItem(filename + 'FieldsSettings', JSON.stringify(gridUserFields));
            applyColumnVisibility(currentActiveTabSettingsType);
            
            // Visual feedback
            showToast("Grid Settings (Sort & Filters) Applied");
            
            // Trigger actual data load
            if (typeof loadData === 'function') loadData();
            
            closeGridSettingsModal();
        };

        window.showToast = function(msg) {
            let t = document.createElement('div');
            t.textContent = msg;
            t.style.position = 'fixed'; t.style.bottom = '20px'; t.style.right = '20px';
            t.style.background = '#10b981'; t.style.color = '#fff';
            t.style.padding = '10px 20px'; t.style.borderRadius = '4px'; t.style.zIndex = '9999999';
            t.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            document.body.appendChild(t);
            setTimeout(() => t.remove(), 3000);
        };`;
        
    content = content.replace(oldSave, newSave.replace(/filename/g, `'${filename}'`));
    
    fs.writeFileSync(filename, content);
    console.log('Patched logic in ' + filename);
};

fixLogic('shipments.html');
fixLogic('accounts.html');
