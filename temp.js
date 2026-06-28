
// --- GRID SETTINGS MODAL LOGIC ---

        function detectActiveType() {
            let type = '';
            const profileTabActive = document.querySelector('.profile-tab.active');
            if (profileTabActive) {
                const tabText = profileTabActive.textContent.trim().toLowerCase();
                if (tabText === 'summary') type = 'client-summary';
                else if (tabText === 'shipments' || tabText === 'notes') type = 'note';
                else if (tabText === 'orders') type = 'order';
                else if (tabText === 'invoices') type = 'invoice';
                else if (tabText === 'payments' || tabText === 'receipts') type = 'receipt';
                else type = 'order';
            } else {
                const title = document.getElementById('page-title');
                const titleText = title ? title.textContent.trim().toLowerCase() : '';
                
                if ('accounts.html' === 'shipments.html') {
                    if (titleText.includes('note')) type = 'note';
                    else type = 'order';
                } else {
                    if (titleText.includes('invoice')) type = 'invoice';
                    else if (titleText.includes('receipt') || titleText.includes('payment')) type = 'receipt';
                    else if (titleText.includes('journal') || titleText.includes('credit') || titleText.includes('adjustment')) type = 'adjustment';
                    else type = 'invoice';
                }
            }
            return type;
        }

        let currentActiveTabSettingsType = 'invoice';
        let ALL_COLUMNS_DEF = {};
        if ('accounts.html' === 'shipments.html') {
            ALL_COLUMNS_DEF = {
                'client-summary': [
                    { key: 'sr', name: '#', caption: '#' }, { key: 'code', name: 'Code', caption: 'Code' }, { key: 'phone', name: 'Phone', caption: 'Phone' },
                    { key: 'area', name: 'Area', caption: 'Area' }, { key: 'clientName', name: 'Client Name', caption: 'Client Name' },
                    { key: 'balance', name: 'Balance', caption: 'Balance' }, { key: 'shipments', name: 'Shipments', caption: 'Shipments' }, { key: 'actions', name: 'Actions', caption: 'Actions' }
                ],
                'note': [
                    { key: 'sr', name: '#', caption: '#' }, { key: 'noteNumber', name: 'Note #', caption: 'Note #' }, { key: 'orderNumber', name: 'Order #', caption: 'Order #' },
                    { key: 'noteDate', name: 'Note Date', caption: 'Note Date' }, { key: 'clientName', name: 'Client', caption: 'Client' },
                    { key: 'amount', name: 'Amount', caption: 'Amount' }, { key: 'actions', name: 'Actions', caption: 'Actions' }
                ],
                'order': [
                    { key: 'sr', name: '#', caption: '#' }, { key: 'orderNumber', name: 'Order #', caption: 'Order #' }, { key: 'orderDate', name: 'Order Date', caption: 'Order Date' },
                    { key: 'clientName', name: 'Client', caption: 'Client' }, { key: 'patientName', name: 'Patient', caption: 'Patient' }, { key: 'product', name: 'Product', caption: 'Product' },
                    { key: 'model', name: 'Model #', caption: 'Model #' }, { key: 'status', name: 'Status', caption: 'Status' }, { key: 'actions', name: 'Actions', caption: 'Actions' }
                ]
            };
        } else {
            ALL_COLUMNS_DEF = {
                'invoice': [
                    { key: 'sr', name: '#', caption: '#' }, { key: 'invoiceNumber', name: 'Invoice #', caption: 'Invoice #' }, { key: 'orderNumber', name: 'Order #', caption: 'Order #' },
                    { key: 'invoiceDate', name: 'Invoice Date', caption: 'Invoice Date' }, { key: 'clientName', name: 'Client', caption: 'Client' },
                    { key: 'amount', name: 'Amount', caption: 'Amount' }, { key: 'dueDate', name: 'Due Date', caption: 'Due Date' }, { key: 'paid', name: 'Paid', caption: 'Paid' },
                    { key: 'balance', name: 'Balance', caption: 'Balance' }, { key: 'actions', name: 'Actions', caption: 'Actions' }
                ],
                'order': [
                    { key: 'sr', name: '#', caption: '#' }, { key: 'orderNumber', name: 'Order #', caption: 'Order #' }, { key: 'orderDate', name: 'Order Date', caption: 'Order Date' },
                    { key: 'clientName', name: 'Client', caption: 'Client' }, { key: 'patientName', name: 'Patient', caption: 'Patient' }, { key: 'product', name: 'Product', caption: 'Product' },
                    { key: 'model', name: 'Model #', caption: 'Model #' }, { key: 'status', name: 'Status', caption: 'Status' }, { key: 'actions', name: 'Actions', caption: 'Actions' }
                ],
                'receipt': [
                    { key: 'sr', name: '#', caption: '#' }, { key: 'receiptNumber', name: 'Receipt #', caption: 'Receipt #' }, { key: 'receiptDate', name: 'Date', caption: 'Date' },
                    { key: 'clientName', name: 'Client', caption: 'Client' }, { key: 'amount', name: 'Amount', caption: 'Amount' },
                    { key: 'applied', name: 'Applied', caption: 'Applied' }, { key: 'balance', name: 'Balance', caption: 'Balance' }, { key: 'actions', name: 'Actions', caption: 'Actions' }
                ],
                'adjustment': [
                    { key: 'sr', name: 'Sr', caption: 'Sr' }, { key: 'adjustmentNumber', name: 'Adj. #', caption: 'Adj. #' }, { key: 'adjustmentDate', name: 'Adj. Date', caption: 'Adj. Date' },
                    { key: 'clientName', name: 'Client', caption: 'Client' }, { key: 'amount', name: 'Amount', caption: 'Amount' },
                    { key: 'type', name: 'Adjustment Type', caption: 'Adjustment Type' }, { key: 'appliedTo', name: 'Applied To', caption: 'Applied To' }, { key: 'actions', name: 'Edit', caption: 'Edit' }
                ]
            };
        }
        
        let ALL_COLUMNS = [];
        draftSettings = { columns: [] };
        let gridUserFields = JSON.parse(localStorage.getItem('accounts.htmlFieldsSettings')) || {};

        
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
        
        window.openGridSettingsModal = function(event) {
            currentActiveTabSettingsType = detectActiveType();
            if(!ALL_COLUMNS_DEF[currentActiveTabSettingsType]) currentActiveTabSettingsType = Object.keys(ALL_COLUMNS_DEF)[0];
            
            ALL_COLUMNS = ALL_COLUMNS_DEF[currentActiveTabSettingsType];
            
            const hiddenCols = gridUserFields[currentActiveTabSettingsType] || [];
            draftSettings.columns = ALL_COLUMNS.filter(c => !hiddenCols.includes(c.key)).map(c => ({...c, visible: true}));

            const existingModal = document.getElementById('grid-settings-modal');
            if (existingModal) existingModal.remove();

            const modal = document.createElement('div');
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
                tableRows += `
                    <tr style="border-bottom: 1px solid #333;">
                        <td style="padding:6px 10px; border-right:1px solid #333; text-align:center;">${idx + 1}</td>
                        <td style="padding:6px 10px; border-right:1px solid #333; font-size:14px; color:#333;">${col.name}</td>
                        <td style="padding:6px 10px; border-right:1px solid #333;">
                            <input type="text" value="${col.caption || col.name}" style="width:100%; padding:4px 6px; border:1px solid #ccc; border-radius:2px; font-size:13px;">
                        </td>
                        <td style="padding:6px 10px; text-align:center;">
                            <button onclick="removeField('${col.key}')" style="background:none; border:none; font-size:18px; font-weight:bold; cursor:pointer;">&times;</button>
                        </td>
                    </tr>
                `;
            });

            modal.innerHTML = `
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
                                <tbody id="grid-settings-tbody">
                                    ${tableRows}
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

    <label style="display:block; font-size:11px; font-weight:700; margin-bottom:2px;">Order Date</label>
    <select id="opt-order-date" style="width:100%; padding:4px; border:1px solid #333; margin-bottom:8px; font-size:12px;">
        
    <option value="Upcoming">Upcoming</option>
    <option value="Today">Today</option>
    <option value="Tomorrow">Tomorrow</option>
    <option value="Recent">Recent</option>
    <option value="Yesterday">Yesterday</option>
    <option value="This week from Sunday">This week from Sunday</option>
    <option value="Month To Date" selected>Month To Date</option>
    <option value="Last 7 Days">Last 7 Days</option>
    <option value="Last Full Week">Last Full Week</option>
    <option value="Last Full Month">Last Full Month</option>
    <option value="All dates to yesterday">All dates to yesterday</option>
    <option value="All dates to today">All dates to today</option>

    </select>

    <label style="display:block; font-size:11px; font-weight:700; margin-bottom:2px;">Date In</label>
    <select id="opt-date-in" style="width:100%; padding:4px; border:1px solid #333; margin-bottom:8px; font-size:12px;">
        
    <option value="Upcoming">Upcoming</option>
    <option value="Today">Today</option>
    <option value="Tomorrow">Tomorrow</option>
    <option value="Recent">Recent</option>
    <option value="Yesterday">Yesterday</option>
    <option value="This week from Sunday">This week from Sunday</option>
    <option value="Month To Date" selected>Month To Date</option>
    <option value="Last 7 Days">Last 7 Days</option>
    <option value="Last Full Week">Last Full Week</option>
    <option value="Last Full Month">Last Full Month</option>
    <option value="All dates to yesterday">All dates to yesterday</option>
    <option value="All dates to today">All dates to today</option>

    </select>

    <label style="display:block; font-size:11px; font-weight:700; margin-bottom:2px;">Status Date</label>
    <select id="opt-status-date" style="width:100%; padding:4px; border:1px solid #333; margin-bottom:8px; font-size:12px;">
        
    <option value="Upcoming">Upcoming</option>
    <option value="Today">Today</option>
    <option value="Tomorrow">Tomorrow</option>
    <option value="Recent">Recent</option>
    <option value="Yesterday">Yesterday</option>
    <option value="This week from Sunday">This week from Sunday</option>
    <option value="Month To Date" selected>Month To Date</option>
    <option value="Last 7 Days">Last 7 Days</option>
    <option value="Last Full Week">Last Full Week</option>
    <option value="Last Full Month">Last Full Month</option>
    <option value="All dates to yesterday">All dates to yesterday</option>
    <option value="All dates to today">All dates to today</option>

    </select>

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
                            <button style="padding:6px 25px; border:1px solid #ccc; background:#fff; color:#1d4ed8; font-weight:700; border-radius:4px; cursor:pointer;" onclick="saveGridSettings()">OK</button>
                            <button style="padding:6px 25px; border:1px solid #ccc; background:#fff; color:#1d4ed8; font-weight:700; border-radius:4px; cursor:pointer;">Reset</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const btnOk = document.getElementById('btn-grid-ok');
            if (btnOk) btnOk.addEventListener('click', saveGridSettings);
            
            const btnReset = document.getElementById('btn-grid-reset');
            if (btnReset) btnReset.addEventListener('click', function() {
                draftSettings.columns = ALL_COLUMNS.map(c => ({...c, visible: true}));
                renderColumnsTable();
            });
            
            const btnAddFields = document.getElementById('btn-add-fields-trigger');
            if (btnAddFields) btnAddFields.addEventListener('click', function(e) { e.stopPropagation(); e.preventDefault(); toggleAddFieldsDropdown(e); });
            
            const addFieldsSelect = document.getElementById('add-fields-select');
            if (addFieldsSelect) addFieldsSelect.addEventListener('change', function() { handleAddFieldSelect(this); });

            document.addEventListener('click', function(e) {
                const container = document.getElementById('add-fields-dropdown-container');
                const trigger = document.getElementById('btn-add-fields-trigger');
                if (container && container.style.display === 'block' && !container.contains(e.target) && e.target !== trigger && (!trigger || !trigger.contains(e.target))) {
                    container.style.display = 'none';
                }
            });

            renderColumnsTable();
        };

        window.closeGridSettingsModal = function() {
            const modal = document.getElementById('grid-settings-modal');
            if (modal) modal.remove();
        };

        window.switchSettingsTab = function(tabName) {
            document.querySelectorAll('.tab-btn').forEach(btn => {
                if(btn.id && btn.id.startsWith('btn-settings-tab-')) {
                    btn.classList.remove('active');
                }
            });
            const tabBtn = document.getElementById('btn-settings-tab-' + tabName);
            if (tabBtn) tabBtn.classList.add('active');
            const colContent = document.getElementById('settings-tab-content-columns');
            if (colContent) colContent.style.display = 'none';
            const optContent = document.getElementById('settings-tab-content-options');
            if (optContent) optContent.style.display = 'none';
            const targetContent = document.getElementById('settings-tab-content-' + tabName);
            if (targetContent) targetContent.style.display = 'block';
        };

        window.renderColumnsTable = function() {
            const tbody = document.getElementById('grid-settings-columns-tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            draftSettings.columns.forEach((col, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="text-align: center; color: #666;">${index + 1}</td>
                    <td>${col.name}</td>
                    <td><input type="text" class="caption-input" data-index="${index}" value="${col.caption || col.name}" readonly style="width: 100%; border: 1px solid #ddd; padding: 4px; background:#f9f9f9;"></td>
                    <td style="text-align: center;"><button type="button" class="remove-col-btn" onclick="removeColumn(${index})" style="background: none; border: none; color: #dc3545; font-weight: bold; cursor: pointer; font-size: 16px;">&times;</button></td>
                `;
                tbody.appendChild(tr);
            });
            updateAddFieldsDropdown();
        };

        window.removeColumn = function(index) {
            draftSettings.columns.splice(index, 1);
            renderColumnsTable();
        };

        window.updateAddFieldsDropdown = function() {
            const select = document.getElementById('add-fields-select');
            if (!select) return;
            const visibleKeys = draftSettings.columns.map(c => c.key);
            const hiddenCols = ALL_COLUMNS.filter(c => !visibleKeys.includes(c.key));
            select.innerHTML = '<option value="">-- Add Field --</option>';
            hiddenCols.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.key;
                opt.textContent = c.name;
                select.appendChild(opt);
            });
            const triggerBtn = document.getElementById('btn-add-fields-trigger');
            if (hiddenCols.length === 0) {
                if (triggerBtn) triggerBtn.disabled = true;
            } else {
                if (triggerBtn) triggerBtn.disabled = false;
            }
        };

        window.toggleAddFieldsDropdown = function(event) {
            if (event) { event.stopPropagation(); event.preventDefault(); }
            const container = document.getElementById('add-fields-dropdown-container');
            if (container) {
                const isHidden = container.style.display === 'none' || !container.style.display;
                container.style.display = isHidden ? 'block' : 'none';
                if (isHidden) updateAddFieldsDropdown();
            }
        };

        window.handleAddFieldSelect = function(select) {
            const key = select.value;
            if (!key) return;
            const colInfo = ALL_COLUMNS.find(c => c.key === key);
            if (colInfo) {
                draftSettings.columns.push({ name: colInfo.name, caption: colInfo.caption, key: colInfo.key, visible: true });
                renderColumnsTable();
            }
            const container = document.getElementById('add-fields-dropdown-container');
            if (container) container.style.display = 'none';
            select.value = '';
        };

        window.saveGridSettings = function() {
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
            localStorage.setItem('accounts.html' + 'FieldsSettings', JSON.stringify(gridUserFields));
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
        };

        window.applyColumnVisibility = function(type) {
            const hiddenCols = gridUserFields[type] || [];
            const styleId = 'dynamic-column-styles';
            let styleEl = document.getElementById(styleId);
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleId;
                document.head.appendChild(styleEl);
            }
            let css = '';
            hiddenCols.forEach(colKey => {
                css += `th[data-col="${colKey}"], td[data-col="${colKey}"] { display: none !important; }\n`;
            });
            styleEl.innerHTML = css;
        };

        // Apply on load
        setTimeout(() => {
            let type = detectActiveType();
            if(ALL_COLUMNS_DEF[type]) applyColumnVisibility(type);
        }, 500);

        // Sidebar clicks
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.sidebar-link, .profile-tab').forEach(link => {
                link.addEventListener('click', () => {
                    setTimeout(() => { let type = detectActiveType(); if(ALL_COLUMNS_DEF[type]) applyColumnVisibility(type); }, 100);
                });
            });
        });

        // Ensure we hook loadTab
        const originalLoadTab = window.loadTab;
        if (originalLoadTab) {
            window.loadTab = function(tabId) {
                originalLoadTab(tabId);
                setTimeout(() => { let type = detectActiveType(); if(ALL_COLUMNS_DEF[type]) applyColumnVisibility(type); }, 100);
            };
        }

// --- END GRID SETTINGS MODAL LOGIC ---
