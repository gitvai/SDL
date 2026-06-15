const fs = require('fs');
let html = fs.readFileSync('shipments.html', 'utf8');

// 1. Add Fields button
const exportBtnSearch = `<button class="btn-toolbar" onclick="showExportModal()"><i class="fas fa-file-export"></i> Export</button>`;
if (html.includes(exportBtnSearch)) {
    html = html.replace(exportBtnSearch, exportBtnSearch + `\n                            <a href="javascript:void(0)" style="margin-left:auto; font-size:13px; color:#3b82f6; text-decoration:none; font-weight:700;" onclick="openFieldsModal()">Fields</a>`);
}

// 2. Add data-col to thead
html = html.replace(
    `thead.innerHTML = '<tr style="background:#f3f4f6;"><th style="width:30px;"><input type="checkbox" onclick="toggleSelectAll(this)"></th><th>#</th><th>Code</th><th>Phone</th><th>Area</th><th>Client Name</th><th>Balance</th><th>Shipments</th><th>Actions</th></tr>';`,
    `thead.innerHTML = '<tr style="background:#f3f4f6;"><th style="width:30px;"><input type="checkbox" onclick="toggleSelectAll(this)"></th><th data-col="sr">#</th><th data-col="code">Code</th><th data-col="phone">Phone</th><th data-col="area">Area</th><th data-col="clientName">Client Name</th><th data-col="balance">Balance</th><th data-col="shipments">Shipments</th><th data-col="actions">Actions</th></tr>';`
);

html = html.replace(
    `thead.innerHTML = '<tr style="background:#f3f4f6;"><th style="width:30px;"><input type="checkbox" onclick="toggleSelectAll(this)"></th><th>#</th><th>Note #</th><th>Order #</th><th>Note Date</th><th>Client</th><th>Amount</th><th>Actions</th></tr>';`,
    `thead.innerHTML = '<tr style="background:#f3f4f6;"><th style="width:30px;"><input type="checkbox" onclick="toggleSelectAll(this)"></th><th data-col="sr">#</th><th data-col="noteNumber">Note #</th><th data-col="orderNumber">Order #</th><th data-col="noteDate">Note Date</th><th data-col="clientName">Client</th><th data-col="amount">Amount</th><th data-col="actions">Actions</th></tr>';`
);

html = html.replace(
    `thead.innerHTML = '<tr style="background:#f3f4f6;"><th style="width:30px;"><input type="checkbox" onclick="toggleSelectAll(this)"></th><th>#</th><th>Order #</th><th>Order Date</th><th>Client</th><th>Patient</th><th>Product</th><th>Model #</th><th>Status</th><th>Actions</th></tr>';`,
    `thead.innerHTML = '<tr style="background:#f3f4f6;"><th style="width:30px;"><input type="checkbox" onclick="toggleSelectAll(this)"></th><th data-col="sr">#</th><th data-col="orderNumber">Order #</th><th data-col="orderDate">Order Date</th><th data-col="clientName">Client</th><th data-col="patientName">Patient</th><th data-col="product">Product</th><th data-col="model">Model #</th><th data-col="status">Status</th><th data-col="actions">Actions</th></tr>';`
);

// 3. Add data-col to tbody tds
// Client summary
const clientSummaryHTML = `<td><input type="checkbox"></td>
                        <td>\${idx + 1}</td>
                        <td style="font-weight:bold; color:#111827;">\${item.code}</td>
                        <td>-</td>
                        <td>-</td>
                        <td><span class="client-link" onclick="showClientProfile(\${item.id})">\${item.name}</span></td>
                        <td>-</td>
                        <td>-</td>
                        <td>`;
const newClientSummaryHTML = `<td><input type="checkbox"></td>
                        <td data-col="sr">\${idx + 1}</td>
                        <td data-col="code" style="font-weight:bold; color:#111827;">\${item.code}</td>
                        <td data-col="phone">-</td>
                        <td data-col="area">-</td>
                        <td data-col="clientName"><span class="client-link" onclick="showClientProfile(\${item.id})">\${item.name}</span></td>
                        <td data-col="balance">-</td>
                        <td data-col="shipments">-</td>
                        <td data-col="actions">`;
html = html.replace(clientSummaryHTML, newClientSummaryHTML);

// Note
const noteHTML = `<td><input type="checkbox"></td>
                        <td>\${idx + 1}</td>
                        <td><a href="#" class="client-link" onclick="openEditModal('shipment', \${item.id}); return false;">\${item.noteNumber}</a></td>
                        <td>\${item.orders ? item.orders.map(o => o.orderNumber || ('#' + o.id)).join(', ') : (item.orderIds ? item.orderIds.map(oid => '#' + oid).join(', ') : 'N/A')}</td>
                        <td>\${displayDate(item.noteDate)}</td>
                        <td>\${clientHtml}</td>
                        <td style="font-weight:bold; color:#10b981;">\${totalAmount.toFixed(2)}</td>
                        <td>`;
const newNoteHTML = `<td><input type="checkbox"></td>
                        <td data-col="sr">\${idx + 1}</td>
                        <td data-col="noteNumber"><a href="#" class="client-link" onclick="openEditModal('shipment', \${item.id}); return false;">\${item.noteNumber}</a></td>
                        <td data-col="orderNumber">\${item.orders ? item.orders.map(o => o.orderNumber || ('#' + o.id)).join(', ') : (item.orderIds ? item.orderIds.map(oid => '#' + oid).join(', ') : 'N/A')}</td>
                        <td data-col="noteDate">\${displayDate(item.noteDate)}</td>
                        <td data-col="clientName">\${clientHtml}</td>
                        <td data-col="amount" style="font-weight:bold; color:#10b981;">\${totalAmount.toFixed(2)}</td>
                        <td data-col="actions">`;
html = html.replace(noteHTML, newNoteHTML);

// Order
const orderHTML = `<td><input type="checkbox"></td>
                        <td>\${idx + 1}</td>
                        <td><a href="#" class="client-link" onclick="window.open('edit-order.html?id='+\${item.id}, '_blank'); return false;">\${item.orderNumber || item.id}</a></td>
                        <td>\${displayDate(item.receivedDate)}</td>
                        <td>\${clientHtml}</td>
                        <td>\${item.patientName || '-'}</td>
                        <td>\${productName}</td>
                        <td>\${item.toothNumber || '-'}</td>
                        <td><span class="status-badge" style="background:\${statusColors.bg}; color:\${statusColors.text};">\${item.status}</span></td>
                        <td>`;
const newOrderHTML = `<td><input type="checkbox"></td>
                        <td data-col="sr">\${idx + 1}</td>
                        <td data-col="orderNumber"><a href="#" class="client-link" onclick="window.open('edit-order.html?id='+\${item.id}, '_blank'); return false;">\${item.orderNumber || item.id}</a></td>
                        <td data-col="orderDate">\${displayDate(item.receivedDate)}</td>
                        <td data-col="clientName">\${clientHtml}</td>
                        <td data-col="patientName">\${item.patientName || '-'}</td>
                        <td data-col="product">\${productName}</td>
                        <td data-col="model">\${item.toothNumber || '-'}</td>
                        <td data-col="status"><span class="status-badge" style="background:\${statusColors.bg}; color:\${statusColors.text};">\${item.status}</span></td>
                        <td data-col="actions">`;
html = html.replace(orderHTML, newOrderHTML);

// 4. Inject Modal HTML
const modalHTML = `
<!-- Fields Settings Modal -->
<div id="fields-settings-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:99999; align-items:center; justify-content:center;">
    <div style="background:#fff; width:400px; border-radius:8px; padding:20px; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
        <h3 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px; font-family:'Inter', sans-serif;">Select Fields</h3>
        <div id="fields-checklist" style="max-height:300px; overflow-y:auto; padding:10px 0; font-family:'Inter', sans-serif; font-size:14px;">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:15px;">
            <button onclick="document.getElementById('fields-settings-modal').style.display='none'" style="padding:8px 15px; border:1px solid #ccc; background:#fff; border-radius:4px; cursor:pointer;">Cancel</button>
            <button onclick="saveFieldsSettings()" style="padding:8px 15px; border:none; background:#3b82f6; color:#fff; border-radius:4px; cursor:pointer; font-weight:bold;">Save</button>
        </div>
    </div>
</div>
`;
html = html.replace('</body>', modalHTML + '\n</body>');

// 5. Inject JS Logic
const jsLogic = `
        // --- Fields Logic ---
        const ALL_FIELDS = {
            'client-summary': [
                { key: 'sr', name: '#' }, { key: 'code', name: 'Code' }, { key: 'phone', name: 'Phone' },
                { key: 'area', name: 'Area' }, { key: 'clientName', name: 'Client Name' },
                { key: 'balance', name: 'Balance' }, { key: 'shipments', name: 'Shipments' }, { key: 'actions', name: 'Actions' }
            ],
            'note': [
                { key: 'sr', name: '#' }, { key: 'noteNumber', name: 'Note #' }, { key: 'orderNumber', name: 'Order #' },
                { key: 'noteDate', name: 'Note Date' }, { key: 'clientName', name: 'Client' },
                { key: 'amount', name: 'Amount' }, { key: 'actions', name: 'Actions' }
            ],
            'order': [
                { key: 'sr', name: '#' }, { key: 'orderNumber', name: 'Order #' }, { key: 'orderDate', name: 'Order Date' },
                { key: 'clientName', name: 'Client' }, { key: 'patientName', name: 'Patient' }, { key: 'product', name: 'Product' },
                { key: 'model', name: 'Model #' }, { key: 'status', name: 'Status' }, { key: 'actions', name: 'Actions' }
            ]
        };

        let userFields = JSON.parse(localStorage.getItem('shipmentsFieldsSettings')) || {};

        function openFieldsModal() {
            const activeTabBtn = document.querySelector('.tab-btn.active');
            if(!activeTabBtn) return;
            const activeTab = activeTabBtn.dataset.tab;
            let type = 'client-summary';
            if(activeTab === 'notes') type = 'note';
            else if(activeTab === 'orders') type = 'order';

            const modal = document.getElementById('fields-settings-modal');
            const container = document.getElementById('fields-checklist');
            container.innerHTML = '';
            
            const columns = ALL_FIELDS[type];
            const hiddenCols = userFields[type] || [];

            columns.forEach(col => {
                const checked = !hiddenCols.includes(col.key) ? 'checked' : '';
                container.innerHTML += \`
                    <label style="display:flex; align-items:center; gap:10px; margin-bottom:10px; cursor:pointer;">
                        <input type="checkbox" value="\${col.key}" \${checked}>
                        <span>\${col.name}</span>
                    </label>
                \`;
            });
            
            modal.dataset.activeType = type;
            modal.style.display = 'flex';
        }

        function saveFieldsSettings() {
            const modal = document.getElementById('fields-settings-modal');
            const type = modal.dataset.activeType;
            const checkboxes = document.querySelectorAll('#fields-checklist input[type="checkbox"]');
            
            const hiddenCols = [];
            checkboxes.forEach(cb => {
                if (!cb.checked) hiddenCols.push(cb.value);
            });
            
            userFields[type] = hiddenCols;
            localStorage.setItem('shipmentsFieldsSettings', JSON.stringify(userFields));
            
            applyColumnVisibility(type);
            modal.style.display = 'none';
        }

        function applyColumnVisibility(type) {
            const hiddenCols = userFields[type] || [];
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
        }
        
        // Initial call
        setTimeout(() => {
            const activeTab = document.querySelector('.tab-btn.active');
            if(activeTab) {
                let type = 'client-summary';
                if(activeTab.dataset.tab === 'notes') type = 'note';
                else if(activeTab.dataset.tab === 'orders') type = 'order';
                applyColumnVisibility(type);
            }
        }, 500);

        // --- End Fields Logic ---
`;
html = html.replace('</script>\n</body>', jsLogic + '\n</script>\n</body>');

// Make sure applyColumnVisibility is called when tabs switch
html = html.replace(
    `            loadTab(tabId);`,
    `            loadTab(tabId);\n            let type = 'client-summary';\n            if(tabId === 'notes') type = 'note';\n            else if(tabId === 'orders') type = 'order';\n            if(typeof applyColumnVisibility !== 'undefined') applyColumnVisibility(type);`
);

fs.writeFileSync('shipments.html', html);
console.log('Patch complete.');
