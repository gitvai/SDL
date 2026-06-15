const fs = require('fs');

const fixModal = (filename) => {
    let content = fs.readFileSync(filename, 'utf8');
    
    const startStr = "const modal = document.createElement('div');";
    const endStr = "document.body.appendChild(modal);";
    
    const startIndex = content.indexOf(startStr, content.indexOf('window.openGridSettingsModal'));
    const endIndex = content.indexOf(endStr, startIndex);
    
    if (startIndex !== -1 && endIndex !== -1) {
        const correctModal = `const modal = document.createElement('div');
            modal.id = 'grid-settings-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.background = 'rgba(0,0,0,0.5)';
            modal.style.zIndex = '999999';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';

            let tableRows = '';
            draftSettings.columns.forEach(col => {
                tableRows += \`
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding:10px;">\${col.name}</td>
                        <td style="padding:10px; text-align:right;">
                            <button class="btn-action" style="padding:4px 8px; font-size:12px; color:var(--accent-red); border-color:var(--accent-red);" onclick="removeField('\${col.key}')"><i class="fas fa-times"></i> Remove</button>
                        </td>
                    </tr>
                \`;
            });

            modal.innerHTML = \`
                <div style="background:#fff; width:500px; border-radius:8px; padding:20px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
                        <h3 style="margin:0; font-size:16px;">Grid Settings</h3>
                        <button onclick="closeGridSettingsModal()" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
                    </div>
                    
                    <div style="margin-bottom:15px; position:relative;">
                        <button id="btn-add-fields-trigger" class="btn-action primary" style="width:100%; text-align:left; display:flex; justify-content:space-between; align-items:center;">
                            <span><i class="fas fa-plus"></i> Add Fields</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div id="add-fields-dropdown-container" style="display:none; position:absolute; top:100%; left:0; width:100%; background:#fff; border:1px solid #ddd; border-radius:4px; margin-top:5px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); z-index:10;">
                            <select id="add-fields-select" size="6" style="width:100%; border:none; outline:none; padding:5px;">
                                <!-- Options populated dynamically -->
                            </select>
                        </div>
                    </div>

                    <div style="max-height:300px; overflow-y:auto; border:1px solid #eee; border-radius:4px;">
                        <table style="width:100%; border-collapse:collapse; font-size:13px;" id="grid-settings-table">
                            <tbody id="grid-settings-tbody">
                                \${tableRows}
                            </tbody>
                        </table>
                    </div>

                    <div style="display:flex; justify-content:space-between; margin-top:20px; padding-top:15px; border-top:1px solid #eee;">
                        <button id="btn-grid-reset" class="btn-action" style="color:#666;"><i class="fas fa-undo"></i> Reset to Default</button>
                        <div>
                            <button onclick="closeGridSettingsModal()" class="btn-action" style="margin-right:10px;">Cancel</button>
                            <button id="btn-grid-ok" class="btn-action primary">OK</button>
                        </div>
                    </div>
                </div>
            \`;
            document.body.appendChild(modal);`;
            
        content = content.substring(0, startIndex) + correctModal + content.substring(endIndex + endStr.length);
        fs.writeFileSync(filename, content);
        console.log('Fixed ' + filename);
    } else {
        console.log('Could not find injection point in ' + filename);
    }
};

fixModal('shipments.html');
fixModal('accounts.html');
