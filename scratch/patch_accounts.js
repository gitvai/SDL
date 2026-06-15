const fs = require('fs');
let html = fs.readFileSync('accounts.html', 'utf8');

// 1. Add Fields button
const addRecordBtn = `<button class="btn-toolbar primary" onclick="location.href='new-order.html'"><i class="fas fa-plus"></i> New Order</button>`;
if (html.includes(addRecordBtn)) {
    html = html.replace(addRecordBtn, addRecordBtn + `\n                <a href="javascript:void(0)" style="margin-left:auto; font-size:13px; color:#3b82f6; text-decoration:none; font-weight:700;" onclick="openFieldsModal()">Fields</a>`);
}

// 2. Add data-col to thead
html = html.replace(
    `thead.innerHTML = '<tr style="background:#f3f4f6;"><th style="width:30px;"><input type="checkbox" onclick="toggleSelectAll(this)"></th><th>#</th><th>Invoice #</th><th>Order #</th><th>Invoice Date</th><th>Client</th><th>Amount</th><th>Due Date</th><th>Paid</th><th>Balance</th><th>Actions</th></tr>';`,
    `thead.innerHTML = '<tr style="background:#f3f4f6;"><th style="width:30px;"><input type="checkbox" onclick="toggleSelectAll(this)"></th><th data-col="sr">#</th><th data-col="invoiceNumber">Invoice #</th><th data-col="orderNumber">Order #</th><th data-col="invoiceDate">Invoice Date</th><th data-col="clientName">Client</th><th data-col="amount">Amount</th><th data-col="dueDate">Due Date</th><th data-col="paid">Paid</th><th data-col="balance">Balance</th><th data-col="actions">Actions</th></tr>';`
);

html = html.replace(
    `thead.innerHTML = '<tr style="background:#f3f4f6;"><th style="width:30px;"><input type="checkbox" onclick="toggleSelectAll(this)"></th><th>#</th><th>Order #</th><th>Order Date</th><th>Client</th><th>Patient</th><th>Product</th><th>Model #</th><th>Status</th><th>Actions</th></tr>';`,
    `thead.innerHTML = '<tr style="background:#f3f4f6;"><th style="width:30px;"><input type="checkbox" onclick="toggleSelectAll(this)"></th><th data-col="sr">#</th><th data-col="orderNumber">Order #</th><th data-col="orderDate">Order Date</th><th data-col="clientName">Client</th><th data-col="patientName">Patient</th><th data-col="product">Product</th><th data-col="model">Model #</th><th data-col="status">Status</th><th data-col="actions">Actions</th></tr>';`
);

html = html.replace(
    `thead.innerHTML = '<tr style="background:#f3f4f6;"><th style="width:30px;"><input type="checkbox" onclick="toggleSelectAll(this)"></th><th>#</th><th>Receipt #</th><th>Date</th><th>Client</th><th>Amount</th><th>Applied</th><th>Balance</th><th>Actions</th></tr>';`,
    `thead.innerHTML = '<tr style="background:#f3f4f6;"><th style="width:30px;"><input type="checkbox" onclick="toggleSelectAll(this)"></th><th data-col="sr">#</th><th data-col="receiptNumber">Receipt #</th><th data-col="receiptDate">Date</th><th data-col="clientName">Client</th><th data-col="amount">Amount</th><th data-col="applied">Applied</th><th data-col="balance">Balance</th><th data-col="actions">Actions</th></tr>';`
);

html = html.replace(
    `thead.innerHTML = '<tr style="background:#f3f4f6;"><th style="width:30px;"><input type="checkbox" onclick="toggleSelectAll(this)"></th><th>Sr</th><th>Adj. #</th><th>Adj. Date</th><th>Client</th><th>Amount</th><th>Adjustment Type</th><th>Applied To</th><th>Edit</th></tr>';`,
    `thead.innerHTML = '<tr style="background:#f3f4f6;"><th style="width:30px;"><input type="checkbox" onclick="toggleSelectAll(this)"></th><th data-col="sr">Sr</th><th data-col="adjustmentNumber">Adj. #</th><th data-col="adjustmentDate">Adj. Date</th><th data-col="clientName">Client</th><th data-col="amount">Amount</th><th data-col="type">Adjustment Type</th><th data-col="appliedTo">Applied To</th><th data-col="actions">Edit</th></tr>';`
);

// 3. Add data-col to tbody tds
// Invoice
const invoiceHTML = `<td><input type="checkbox" class="invoice-cb"></td>
                        <td>\${index + 1}</td>
                        <td style="font-weight: 600; color: #1e3a8a;">\${item.invoiceNumber}</td>
                        <td>\${orderNumbers || '-'}</td>
                        <td>\${new Date(item.invoiceDate).toLocaleDateString()}</td>
                        <td style="font-weight: 500;">\${item.client ? item.client.name : 'Unknown'}</td>
                        <td style="font-weight: 700; color: #ec4899;">₹\${item.netAmount}</td>
                        <td>\${item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}</td>
                        <td style="color: #10b981; font-weight: 600;">₹\${item.paidAmount}</td>
                        <td style="font-weight: 700; color: \${item.balanceAmount > 0 ? '#f59e0b' : '#10b981'}">₹\${item.balanceAmount}</td>
                        <td>`;
const newInvoiceHTML = `<td><input type="checkbox" class="invoice-cb"></td>
                        <td data-col="sr">\${index + 1}</td>
                        <td data-col="invoiceNumber" style="font-weight: 600; color: #1e3a8a;">\${item.invoiceNumber}</td>
                        <td data-col="orderNumber">\${orderNumbers || '-'}</td>
                        <td data-col="invoiceDate">\${new Date(item.invoiceDate).toLocaleDateString()}</td>
                        <td data-col="clientName" style="font-weight: 500;">\${item.client ? item.client.name : 'Unknown'}</td>
                        <td data-col="amount" style="font-weight: 700; color: #ec4899;">₹\${item.netAmount}</td>
                        <td data-col="dueDate">\${item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}</td>
                        <td data-col="paid" style="color: #10b981; font-weight: 600;">₹\${item.paidAmount}</td>
                        <td data-col="balance" style="font-weight: 700; color: \${item.balanceAmount > 0 ? '#f59e0b' : '#10b981'}">₹\${item.balanceAmount}</td>
                        <td data-col="actions">`;
html = html.replace(invoiceHTML, newInvoiceHTML);

// Order
const orderHTML = `<td><input type="checkbox" class="order-cb"></td>
                        <td>\${index + 1}</td>
                        <td style="font-weight: 600; color: #1e3a8a;">\${item.orderNumber || item.id}</td>
                        <td>\${new Date(item.receivedDate).toLocaleDateString()}</td>
                        <td style="font-weight: 500;">\${item.client ? item.client.name : 'Unknown'}</td>
                        <td>\${item.patientName || '-'}</td>
                        <td>\${item.productName || '-'}</td>
                        <td>\${item.modelNumber || '-'}</td>
                        <td><span class="status-badge" style="background: \${getStatusColor(item.status)}20; color: \${getStatusColor(item.status)}; border: 1px solid \${getStatusColor(item.status)}40;">\${item.status}</span></td>
                        <td>`;
const newOrderHTML = `<td><input type="checkbox" class="order-cb"></td>
                        <td data-col="sr">\${index + 1}</td>
                        <td data-col="orderNumber" style="font-weight: 600; color: #1e3a8a;">\${item.orderNumber || item.id}</td>
                        <td data-col="orderDate">\${new Date(item.receivedDate).toLocaleDateString()}</td>
                        <td data-col="clientName" style="font-weight: 500;">\${item.client ? item.client.name : 'Unknown'}</td>
                        <td data-col="patientName">\${item.patientName || '-'}</td>
                        <td data-col="product">\${item.productName || '-'}</td>
                        <td data-col="model">\${item.modelNumber || '-'}</td>
                        <td data-col="status"><span class="status-badge" style="background: \${getStatusColor(item.status)}20; color: \${getStatusColor(item.status)}; border: 1px solid \${getStatusColor(item.status)}40;">\${item.status}</span></td>
                        <td data-col="actions">`;
html = html.replace(orderHTML, newOrderHTML);

// Receipt
const receiptHTML = `<td><input type="checkbox" class="receipt-cb"></td>
                        <td>\${index + 1}</td>
                        <td style="font-weight: 600;"><a href="javascript:void(0)" style="color: #3b82f6; text-decoration: underline;" onclick="openEditModal('payment', \${item.id})">\${item.receiptNumber}</a></td>
                        <td>\${new Date(item.receiptDate).toLocaleDateString()}</td>
                        <td style="font-weight: 500;"><a href="client_viewer.html?id=\${item.clientId}" style="color: inherit; text-decoration: none;">\${item.client ? item.client.name : 'Unknown'}</a></td>
                        <td style="font-weight: 700; color: #10b981;">₹\${item.amount}</td>
                        <td style="color: #2563eb; font-weight: 600;">₹\${item.appliedAmount || 0}</td>
                        <td style="font-weight: 700; color: #f59e0b;">₹\${item.creditAmount || 0}</td>
                        <td>`;
const newReceiptHTML = `<td><input type="checkbox" class="receipt-cb"></td>
                        <td data-col="sr">\${index + 1}</td>
                        <td data-col="receiptNumber" style="font-weight: 600;"><a href="javascript:void(0)" style="color: #3b82f6; text-decoration: underline;" onclick="openEditModal('payment', \${item.id})">\${item.receiptNumber}</a></td>
                        <td data-col="receiptDate">\${new Date(item.receiptDate).toLocaleDateString()}</td>
                        <td data-col="clientName" style="font-weight: 500;"><a href="client_viewer.html?id=\${item.clientId}" style="color: inherit; text-decoration: none;">\${item.client ? item.client.name : 'Unknown'}</a></td>
                        <td data-col="amount" style="font-weight: 700; color: #10b981;">₹\${item.amount}</td>
                        <td data-col="applied" style="color: #2563eb; font-weight: 600;">₹\${item.appliedAmount || 0}</td>
                        <td data-col="balance" style="font-weight: 700; color: #f59e0b;">₹\${item.creditAmount || 0}</td>
                        <td data-col="actions">`;
html = html.replace(receiptHTML, newReceiptHTML);

// Adjustment
const adjHTML = `<td><input type="checkbox" class="adjustment-cb"></td>
                        <td>\${index + 1}</td>
                        <td style="font-weight: 600; color: #1e3a8a;"><a href="javascript:void(0)" style="color: #3b82f6; text-decoration: underline;" onclick="openEditAdjustmentModal(\${item.id})">\${item.adjustmentNumber}</a></td>
                        <td>\${new Date(item.date).toLocaleDateString()}</td>
                        <td style="font-weight: 500;"><a href="client_viewer.html?id=\${item.clientId}" style="color: inherit; text-decoration: none;">\${item.client ? item.client.name : 'Unknown'}</a></td>
                        <td style="font-weight: 700;">₹\${item.amount}</td>
                        <td style="font-weight: 600; color: \${item.type === 'Credit' ? '#10b981' : '#ef4444'}">\${displayType}</td>
                        <td>\${item.invoice ? \`<a href="javascript:void(0)" style="color: #3b82f6; text-decoration: underline;" onclick="openInvoiceDetailsModal(\${item.invoiceId})">\${item.invoice.invoiceNumber}</a>\` : '-'}</td>
                        <td>`;
const newAdjHTML = `<td><input type="checkbox" class="adjustment-cb"></td>
                        <td data-col="sr">\${index + 1}</td>
                        <td data-col="adjustmentNumber" style="font-weight: 600; color: #1e3a8a;"><a href="javascript:void(0)" style="color: #3b82f6; text-decoration: underline;" onclick="openEditAdjustmentModal(\${item.id})">\${item.adjustmentNumber}</a></td>
                        <td data-col="adjustmentDate">\${new Date(item.date).toLocaleDateString()}</td>
                        <td data-col="clientName" style="font-weight: 500;"><a href="client_viewer.html?id=\${item.clientId}" style="color: inherit; text-decoration: none;">\${item.client ? item.client.name : 'Unknown'}</a></td>
                        <td data-col="amount" style="font-weight: 700;">₹\${item.amount}</td>
                        <td data-col="type" style="font-weight: 600; color: \${item.type === 'Credit' ? '#10b981' : '#ef4444'}">\${displayType}</td>
                        <td data-col="appliedTo">\${item.invoice ? \`<a href="javascript:void(0)" style="color: #3b82f6; text-decoration: underline;" onclick="openInvoiceDetailsModal(\${item.invoiceId})">\${item.invoice.invoiceNumber}</a>\` : '-'}</td>
                        <td data-col="actions">`;
html = html.replace(adjHTML, newAdjHTML);

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
            'invoice': [
                { key: 'sr', name: '#' }, { key: 'invoiceNumber', name: 'Invoice #' }, { key: 'orderNumber', name: 'Order #' },
                { key: 'invoiceDate', name: 'Invoice Date' }, { key: 'clientName', name: 'Client' },
                { key: 'amount', name: 'Amount' }, { key: 'dueDate', name: 'Due Date' }, { key: 'paid', name: 'Paid' },
                { key: 'balance', name: 'Balance' }, { key: 'actions', name: 'Actions' }
            ],
            'order': [
                { key: 'sr', name: '#' }, { key: 'orderNumber', name: 'Order #' }, { key: 'orderDate', name: 'Order Date' },
                { key: 'clientName', name: 'Client' }, { key: 'patientName', name: 'Patient' }, { key: 'product', name: 'Product' },
                { key: 'model', name: 'Model #' }, { key: 'status', name: 'Status' }, { key: 'actions', name: 'Actions' }
            ],
            'receipt': [
                { key: 'sr', name: '#' }, { key: 'receiptNumber', name: 'Receipt #' }, { key: 'receiptDate', name: 'Date' },
                { key: 'clientName', name: 'Client' }, { key: 'amount', name: 'Amount' },
                { key: 'applied', name: 'Applied' }, { key: 'balance', name: 'Balance' }, { key: 'actions', name: 'Actions' }
            ],
            'adjustment': [
                { key: 'sr', name: 'Sr' }, { key: 'adjustmentNumber', name: 'Adj. #' }, { key: 'adjustmentDate', name: 'Adj. Date' },
                { key: 'clientName', name: 'Client' }, { key: 'amount', name: 'Amount' },
                { key: 'type', name: 'Adjustment Type' }, { key: 'appliedTo', name: 'Applied To' }, { key: 'actions', name: 'Edit' }
            ]
        };

        let userFields = JSON.parse(localStorage.getItem('accountsFieldsSettings')) || {};

        function openFieldsModal() {
            const activeTabBtn = document.querySelector('.tab-btn.active');
            if(!activeTabBtn) return;
            let type = 'invoice';
            if(activeTabBtn.dataset.tab === 'orders') type = 'order';
            else if(activeTabBtn.dataset.tab === 'receipts') type = 'receipt';
            else if(activeTabBtn.dataset.tab === 'adjustments') type = 'adjustment';

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
            localStorage.setItem('accountsFieldsSettings', JSON.stringify(userFields));
            
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
                let type = 'invoice';
                if(activeTab.dataset.tab === 'orders') type = 'order';
                else if(activeTab.dataset.tab === 'receipts') type = 'receipt';
                else if(activeTab.dataset.tab === 'adjustments') type = 'adjustment';
                applyColumnVisibility(type);
            }
        }, 500);

        // --- End Fields Logic ---
`;
html = html.replace('</script>\n</body>', jsLogic + '\n</script>\n</body>');

// Make sure applyColumnVisibility is called when tabs switch
html = html.replace(
    `            loadTab(tabId);`,
    `            loadTab(tabId);\n            let type = 'invoice';\n            if(tabId === 'orders') type = 'order';\n            else if(tabId === 'receipts') type = 'receipt';\n            else if(tabId === 'adjustments') type = 'adjustment';\n            if(typeof applyColumnVisibility !== 'undefined') applyColumnVisibility(type);`
);

fs.writeFileSync('accounts.html', html);
console.log('Patch complete.');
