const fs = require('fs');

const ordersHTML = fs.readFileSync('orders.html', 'utf8');
const startTag = `            const modal = document.createElement('div');`;
const endTag = `            document.body.appendChild(modal);`;
let modalStr = ordersHTML.substring(ordersHTML.indexOf(startTag), ordersHTML.indexOf(endTag) + endTag.length);

function patchSafely(file) {
    let html = fs.readFileSync(file, 'utf8');

    // 1. Change onclick="openFieldsModal()" to onclick="openGridSettingsModal(event)"
    html = html.replace(/onclick="openFieldsModal\(\)"/g, `onclick="openGridSettingsModal(event)"`);

    // 2. Remove old modal HTML and JS using regex
    // The old modal starts with <!-- Fields Settings Modal --> and ends with // --- End Fields Logic --- </script>
    const oldModalRegex = /<!-- Fields Settings Modal -->[\s\S]*?\/\/ --- End Fields Logic ---/g;
    html = html.replace(oldModalRegex, '');

    // Prepare new JS logic wrapped in <script>
    const jsLogic = `
<script>
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
                
                if ('${file}' === 'shipments.html') {
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
        if ('${file}' === 'shipments.html') {
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
        let draftSettings = { columns: [] };
        let gridUserFields = JSON.parse(localStorage.getItem('${file}FieldsSettings')) || {};

        window.openGridSettingsModal = function(event) {
            currentActiveTabSettingsType = detectActiveType();
            if(!ALL_COLUMNS_DEF[currentActiveTabSettingsType]) currentActiveTabSettingsType = Object.keys(ALL_COLUMNS_DEF)[0];
            
            ALL_COLUMNS = ALL_COLUMNS_DEF[currentActiveTabSettingsType];
            
            const hiddenCols = gridUserFields[currentActiveTabSettingsType] || [];
            draftSettings.columns = ALL_COLUMNS.filter(c => !hiddenCols.includes(c.key)).map(c => ({...c, visible: true}));

            const existingModal = document.getElementById('grid-settings-modal');
            if (existingModal) existingModal.remove();

${modalStr}

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
                tr.innerHTML = \`
                    <td style="text-align: center; color: #666;">\${index + 1}</td>
                    <td>\${col.name}</td>
                    <td><input type="text" class="caption-input" data-index="\${index}" value="\${col.caption || col.name}" readonly style="width: 100%; border: 1px solid #ddd; padding: 4px; background:#f9f9f9;"></td>
                    <td style="text-align: center;"><button type="button" class="remove-col-btn" onclick="removeColumn(\${index})" style="background: none; border: none; color: #dc3545; font-weight: bold; cursor: pointer; font-size: 16px;">&times;</button></td>
                \`;
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
            const visibleKeys = draftSettings.columns.map(c => c.key);
            const hiddenCols = ALL_COLUMNS.filter(c => !visibleKeys.includes(c.key)).map(c => c.key);
            gridUserFields[currentActiveTabSettingsType] = hiddenCols;
            localStorage.setItem('${file}FieldsSettings', JSON.stringify(gridUserFields));
            applyColumnVisibility(currentActiveTabSettingsType);
            closeGridSettingsModal();
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
                css += \`th[data-col="\${colKey}"], td[data-col="\${colKey}"] { display: none !important; }\\n\`;
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
</script>
`;

    // 3. Inject new logic at the EXACT end of the file before the final </body>
    const lastBodyIdx = html.lastIndexOf('</body>');
    if (lastBodyIdx !== -1) {
        html = html.substring(0, lastBodyIdx) + jsLogic + '\n' + html.substring(lastBodyIdx);
        fs.writeFileSync(file, html);
        console.log('Successfully patched ' + file);
    } else {
        console.error('ERROR: Could not find </body> in ' + file);
    }
}

patchSafely('shipments.html');
patchSafely('accounts.html');
