const fs = require('fs');

const fixAdvancedModal = (filename) => {
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
            modal.style.fontFamily = "'Inter', sans-serif";

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
                            <button onclick="removeField('\${col.key}')" style="background:none; border:none; font-size:18px; font-weight:bold; cursor:pointer;">&times;</button>
                        </td>
                    </tr>
                \`;
            });

            modal.innerHTML = \`
                <div style="background:#fff; width:450px; border-radius:6px; padding:20px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <h3 style="margin:0; font-size:16px; font-weight:700; color:#333;">Grid Display Settings</h3>
                        <button onclick="closeGridSettingsModal()" style="background:none; border:none; font-size:20px; color:#999; cursor:pointer;">&times;</button>
                    </div>
                    
                    <div style="display:flex; margin-bottom:15px; border:1px solid #333;">
                        <button id="tab-columns" style="flex:1; padding:8px; font-size:18px; font-weight:500; background:#fff; border:1px solid #ff006e; border-right:none; color:#ff006e; cursor:pointer;" onclick="switchGridTab('columns')">Columns</button>
                        <button id="tab-options" style="flex:1; padding:8px; font-size:18px; font-weight:500; background:#e2e8f0; border:1px solid #333; border-left:none; color:#475569; cursor:pointer;" onclick="switchGridTab('options')">Options</button>
                    </div>

                    <!-- Columns Tab -->
                    <div id="grid-content-columns">
                        <div style="max-height:250px; overflow-y:auto; border:1px solid #333; margin-bottom:15px;">
                            <table style="width:100%; border-collapse:collapse; font-size:14px; text-align:left;">
                                <thead style="background:#fff; border-bottom:1px solid #333; position:sticky; top:0;">
                                    <tr>
                                        <th style="padding:6px 10px; border-right:1px solid #333; width:30px; text-align:center;">Sr</th>
                                        <th style="padding:6px 10px; border-right:1px solid #333;">Name</th>
                                        <th style="padding:6px 10px; border-right:1px solid #333;">Caption</th>
                                        <th style="padding:6px 10px; width:30px; text-align:center;"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    \${tableRows}
                                </tbody>
                            </table>
                        </div>
                        
                        <div style="display:flex; justify-content:space-between; align-items:center; position:relative;">
                            <button id="btn-grid-ok" style="padding:6px 25px; border:1px solid #ccc; background:#fff; color:#1d4ed8; font-weight:700; border-radius:4px; cursor:pointer;">OK</button>
                            <button id="btn-add-fields-trigger" style="padding:6px 15px; border:none; background:#fff; color:#3b82f6; font-weight:700; font-size:14px; cursor:pointer;">+ Add Fields</button>
                            <button id="btn-grid-reset" style="padding:6px 25px; border:1px solid #ccc; background:#fff; color:#1d4ed8; font-weight:700; border-radius:4px; cursor:pointer;">Reset</button>

                            <!-- Dropdown for add fields -->
                            <div id="add-fields-dropdown-container" style="display:none; position:absolute; bottom:100%; left:50%; transform:translateX(-50%); width:200px; background:#fff; border:1px solid #333; box-shadow: 0 5px 15px rgba(0,0,0,0.2); z-index:10; margin-bottom:5px;">
                                <select id="add-fields-select" size="6" style="width:100%; border:none; outline:none; padding:5px; font-size:13px;">
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Options Tab -->
                    <div id="grid-content-options" style="display:none;">
                        <div style="border:1px solid #333; padding:12px; margin-bottom:12px;">
                            <label style="display:block; font-size:12px; font-weight:700; margin-bottom:5px;">Default Date Search</label>
                            <select style="width:100%; padding:4px; border:1px solid #333; font-size:12px;"><option>Order Date</option></select>
                        </div>

                        <div style="border:1px solid #333; padding:12px; margin-bottom:12px;">
                            <label style="display:block; font-size:12px; font-weight:700; margin-bottom:8px;">Default Date Ranges</label>
                            
                            <label style="display:block; font-size:11px; font-weight:700; margin-bottom:2px;">Final Delivery Due Date</label>
                            <select style="width:100%; padding:4px; border:1px solid #333; margin-bottom:8px; font-size:12px;"><option>Month To Date</option></select>

                            <label style="display:block; font-size:11px; font-weight:700; margin-bottom:2px;">Order Date</label>
                            <select style="width:100%; padding:4px; border:1px solid #333; margin-bottom:8px; font-size:12px;"><option>Month To Date</option></select>

                            <label style="display:block; font-size:11px; font-weight:700; margin-bottom:2px;">Date In</label>
                            <select style="width:100%; padding:4px; border:1px solid #333; margin-bottom:8px; font-size:12px;"><option>Month To Date</option></select>

                            <label style="display:block; font-size:11px; font-weight:700; margin-bottom:2px;">Status Date</label>
                            <select style="width:100%; padding:4px; border:1px solid #333; font-size:12px;"><option>Month To Date</option></select>
                        </div>

                        <div style="border:1px solid #333; padding:12px; margin-bottom:12px;">
                            <label style="display:block; font-size:12px; font-weight:700; margin-bottom:8px;">Sort</label>
                            
                            <label style="display:block; font-size:11px; font-weight:700; margin-bottom:2px;">Column 1</label>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <select style="width:60%; padding:4px; border:1px solid #333; font-size:12px;"><option>Order Date</option></select>
                                <div>
                                    <label style="font-size:12px; margin-right:5px;"><input type="radio" name="sort1" value="asc"> Asc</label>
                                    <label style="font-size:12px;"><input type="radio" name="sort1" value="desc" checked> Desc</label>
                                </div>
                            </div>

                            <label style="display:block; font-size:11px; font-weight:700; margin-bottom:2px;">Column 2</label>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <select style="width:60%; padding:4px; border:1px solid #333; font-size:12px;"><option>Order #</option></select>
                                <div>
                                    <label style="font-size:12px; margin-right:5px;"><input type="radio" name="sort2" value="asc"> Asc</label>
                                    <label style="font-size:12px;"><input type="radio" name="sort2" value="desc" checked> Desc</label>
                                </div>
                            </div>
                        </div>

                        <div style="display:flex; justify-content:flex-start; gap:15px;">
                            <button style="padding:6px 25px; border:1px solid #ccc; background:#fff; color:#1d4ed8; font-weight:700; border-radius:4px; cursor:pointer;" onclick="closeGridSettingsModal()">OK</button>
                            <button style="padding:6px 25px; border:1px solid #ccc; background:#fff; color:#1d4ed8; font-weight:700; border-radius:4px; cursor:pointer;">Reset</button>
                        </div>
                    </div>
                </div>
            \`;
            document.body.appendChild(modal);`;
            
        content = content.substring(0, startIndex) + correctModal + content.substring(endIndex + endStr.length);
        
        // Ensure switchGridTab exists
        if (!content.includes('function switchGridTab')) {
            const scriptStr = `
        window.switchGridTab = function(tab) {
            if (tab === 'columns') {
                document.getElementById('grid-content-columns').style.display = 'block';
                document.getElementById('grid-content-options').style.display = 'none';
                document.getElementById('tab-columns').style.background = '#fff';
                document.getElementById('tab-columns').style.color = '#ff006e';
                document.getElementById('tab-columns').style.border = '1px solid #ff006e';
                document.getElementById('tab-columns').style.borderRight = 'none';
                
                document.getElementById('tab-options').style.background = '#e2e8f0';
                document.getElementById('tab-options').style.color = '#475569';
                document.getElementById('tab-options').style.border = '1px solid #333';
                document.getElementById('tab-options').style.borderLeft = 'none';
            } else {
                document.getElementById('grid-content-columns').style.display = 'none';
                document.getElementById('grid-content-options').style.display = 'block';
                
                document.getElementById('tab-options').style.background = '#fff';
                document.getElementById('tab-options').style.color = '#ff006e';
                document.getElementById('tab-options').style.border = '1px solid #ff006e';
                document.getElementById('tab-options').style.borderLeft = 'none';

                document.getElementById('tab-columns').style.background = '#e2e8f0';
                document.getElementById('tab-columns').style.color = '#475569';
                document.getElementById('tab-columns').style.border = '1px solid #333';
                document.getElementById('tab-columns').style.borderRight = 'none';
            }
        };
        `;
            content = content.replace('window.openGridSettingsModal =', scriptStr + '\n        window.openGridSettingsModal =');
        }

        fs.writeFileSync(filename, content);
        console.log('Fixed Advanced Modal ' + filename);
    } else {
        console.log('Could not find injection point in ' + filename);
    }
};

fixAdvancedModal('shipments.html');
fixAdvancedModal('accounts.html');
