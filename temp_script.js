
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const API_BASE = (window.location.protocol === 'file:' || (isLocalhost && window.location.port !== '5000')) ? 'https://sdl-backend-l5r2.onrender.com/api' : window.location.origin + '/api';

        function createTeethGrid(selection) {
            if (!selection || selection.trim() === "") return '-';
            try {
                const teeth = selection.split(',').map(s => s.trim()).filter(s => s !== "");
                const quadrants = { 1: [], 2: [], 3: [], 4: [] };
                teeth.forEach(t => {
                    const val = parseInt(t);
                    if (isNaN(val)) return;
                    let q = Math.floor(val / 10);
                    const n = val % 10;
                    if (q === 5) q = 1;
                    if (q === 6) q = 2;
                    if (q === 7) q = 3;
                    if (q === 8) q = 4;
                    if (quadrants[q]) quadrants[q].push(n);
                });
                
                // Helper to render 8 cells per quadrant
                // UR (Q1) and LR (Q4) go from 8 down to 1
                const renderQuadRight = (quad) => {
                    let html = '<table style="width:100%; height:100%; table-layout:fixed; border-collapse:collapse; border:none; margin:0; padding:0;"><tr style="border:none;">';
                    for (let i = 8; i >= 1; i--) {
                        const hasTooth = quadrants[quad].includes(i);
                        html += `<td style="border:none; padding:0 !important; text-align:center; width:12.5%; vertical-align:middle; font-size:10px; font-weight:800;">${hasTooth ? i : '&nbsp;'}</td>`;
                    }
                    html += '</tr></table>';
                    return html;
                };

                // UL (Q2) and LL (Q3) go from 1 to 8
                const renderQuadLeft = (quad) => {
                    let html = '<table style="width:100%; height:100%; table-layout:fixed; border-collapse:collapse; border:none; margin:0; padding:0;"><tr style="border:none;">';
                    for (let i = 1; i <= 8; i++) {
                        const hasTooth = quadrants[quad].includes(i);
                        html += `<td style="border:none; padding:0 !important; text-align:center; width:12.5%; vertical-align:middle; font-size:10px; font-weight:800;">${hasTooth ? i : '&nbsp;'}</td>`;
                    }
                    html += '</tr></table>';
                    return html;
                };
                return `
                    <div class="teeth-chart">
                        <div class="teeth-row">
                            <div class="teeth-quad ur">${renderQuadRight(1)}</div>
                            <div class="teeth-quad ul">${renderQuadLeft(2)}</div>
                        </div>
                        <div class="teeth-row">
                            <div class="teeth-quad lr">${renderQuadRight(4)}</div>
                            <div class="teeth-quad ll">${renderQuadLeft(3)}</div>
                        </div>
                    </div>
                `;
            } catch (e) {
                console.error("Error creating teeth grid:", e);
                return selection;
            }
        }

        // Category Filtering
        document.querySelectorAll('.sub-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                filterReports();
            });
        });

        // Search Filtering
        document.getElementById('report-search').addEventListener('input', filterReports);

        function filterReports() {
            const activeTab = document.querySelector('.sub-tab.active').textContent;
            const searchText = document.getElementById('report-search').value.toLowerCase();
            const items = document.querySelectorAll('.report-item');
            let visibleCount = 0;

            items.forEach(item => {
                const categories = item.dataset.category.split(',');
                const title = item.querySelector('span').textContent.toLowerCase();
                
                const matchesCategory = (activeTab === 'Favourites') || categories.includes(activeTab);
                const matchesSearch = title.includes(searchText);

                if (matchesCategory && matchesSearch) {
                    item.style.display = 'flex';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            document.getElementById('report-count').textContent = `${visibleCount} Reports`;
        }

        // Real Data Report Generation
        async function runReport(name) {
            showToast(`Generating report: ${name}...`);
            document.getElementById('report-placeholder').style.display = 'none';
            document.getElementById('report-screen').style.display = 'flex';
            document.getElementById('modal-report-title').textContent = name;
            document.getElementById('modal-report-title-top').textContent = name;
            document.getElementById('report-viewer-content').innerHTML = `
                <div style="text-align:center; padding:50px; color:#666;">
                    <i class="fas fa-spinner fa-spin" style="font-size:30px; margin-bottom:15px;"></i>
                    <p>Fetching real data from server...</p>
                </div>
            `;
            
            try {
                let data = [];
                let headers = [];
                let rows = [];

                if (name === 'All Clients Outstanding') {
                    const res = await fetch(`${API_BASE}/invoices`);
                    const allInvoices = await res.json();
                    data = allInvoices.filter(inv => (inv.balanceAmount || 0) > 0);
                    headers = ['Invoice #', 'Client', 'Date', 'Net Amount', 'Paid', 'Balance'];
                    rows = data.map(inv => [
                        inv.invoiceNumber, 
                        inv.client ? inv.client.name : 'Unknown',
                        new Date(inv.invoiceDate).toLocaleDateString(),
                        (inv.netAmount || 0).toFixed(2),
                        (inv.paidAmount || 0).toFixed(2),
                        (inv.balanceAmount || 0).toFixed(2)
                    ]);
                } else if (name === 'Client Payments' || name === 'Client wise payments') {
                    const res = await fetch(`${API_BASE}/receipts`);
                    data = await res.json();
                    headers = ['Receipt #', 'Client', 'Date', 'Mode', 'Amount'];
                    rows = data.map(r => [
                        r.receiptNumber,
                        r.client ? r.client.name : 'Unknown',
                        new Date(r.receiptDate).toLocaleDateString(),
                        r.paymentMode || 'Cash',
                        (r.amount || 0).toFixed(2)
                    ]);
                } else if (name === 'City wise Clients') {
                    const res = await fetch(`${API_BASE}/clients`);
                    data = await res.json();
                    headers = ['City', 'Client Name', 'Code', 'Contact'];
                    rows = data.map(c => [
                        c.city || 'N/A',
                        c.name,
                        c.code || '-',
                        c.cellPhone || '-'
                    ]).sort((a, b) => a[0].localeCompare(b[0]));
                } else if (name === 'Orders Jobs- by Due Date') {
                    const res = await fetch(`${API_BASE}/orders`);
                    data = await res.json();
                    headers = ['Due Date', 'Type', 'Client', 'Product', 'Order #', 'Order Date', 'Model #', 'Patient', 'Status', 'Shade'];
                    let newRows = [];
                    data.filter(o => o.dueDate)
                        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                        .forEach(o => {
                            if (o.jobs && o.jobs.length > 0) {
                                o.jobs.forEach(j => {
                                    newRows.push([
                                        new Date(o.dueDate).toLocaleDateString('en-GB'),
                                        j.productType || '-',
                                        o.client ? o.client.name : 'Unknown',
                                        j.productName || '-',
                                        o.orderNumber || o.id,
                                        o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB') : '-',
                                        o.modelNumber || '-',
                                        o.patientName || '-',
                                        o.status || '-',
                                        [j.shade1, j.shade2, j.shade3].filter(s => s).join('/') || '-'
                                    ]);
                                });
                            } else {
                                newRows.push([
                                    new Date(o.dueDate).toLocaleDateString('en-GB'),
                                    o.productType || '-',
                                    o.client ? o.client.name : 'Unknown',
                                    o.productName || '-',
                                    o.orderNumber || o.id,
                                    o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB') : '-',
                                    o.modelNumber || '-',
                                    o.patientName || '-',
                                    o.status || '-',
                                    [o.shade1, o.shade2, o.shade3].filter(s => s).join('/') || '-'
                                ]);
                            }
                        });
                    rows = newRows;
                } else if (name === 'Client, Product wise Invoiced Order Job Summary') {
                    const res = await fetch(`${API_BASE}/orders`);
                    const allOrders = await res.json();
                    data = allOrders.filter(o => o.invoiceId);
                    const groups = {};
                    data.forEach(o => {
                        const clientName = o.client ? o.client.name : 'Unknown';
                        if (o.jobs && o.jobs.length > 0) {
                            o.jobs.forEach(j => {
                                const prod = j.productName || j.productType || 'Unknown';
                                const key = clientName + '||' + prod;
                                if (!groups[key]) groups[key] = { clientName, prod, count: 0, units: 0, amount: 0 };
                                groups[key].count++;
                                groups[key].units += (j.units || 0);
                                groups[key].amount += (j.totalAmount || 0);
                            });
                        } else {
                            const prod = o.productName || o.productType || 'Unknown';
                            const key = clientName + '||' + prod;
                            if (!groups[key]) groups[key] = { clientName, prod, count: 0, units: 0, amount: 0 };
                            groups[key].count++;
                            groups[key].units += (o.units || 0);
                            groups[key].amount += (o.netAmount || o.totalAmount || 0);
                        }
                    });
                    headers = ['Client', 'Product', 'Order Count', 'Total Units', 'Net Amount'];
                    rows = Object.values(groups).map(g => [
                        g.clientName,
                        g.prod,
                        g.count,
                        g.units,
                        g.amount.toFixed(2)
                    ]).sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
                } else if (name === 'Due Date wise Order Jobs') {
                    const res = await fetch(`${API_BASE}/orders`);
                    data = await res.json();
                    headers = ['Due Date', 'Trial Date', 'Order #', 'Client', 'Patient', 'Product', 'Teeth', 'Units', 'Shade', 'Amount', 'Status'];
                    let newRows = [];
                    data.filter(o => o.dueDate && !['Complete', 'Delivered', 'Cancelled'].includes(o.status))
                        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                        .forEach(o => {
                            if (o.jobs && o.jobs.length > 0) {
                                o.jobs.forEach(j => {
                                    newRows.push([
                                        new Date(o.dueDate).toLocaleDateString('en-GB'),
                                        o.trialDate ? new Date(o.trialDate).toLocaleDateString('en-GB') : '-',
                                        o.orderNumber || o.id,
                                        o.client ? o.client.name : 'Unknown',
                                        o.patientName || '-',
                                        j.productName || j.productType || '-',
                                        createTeethGrid(j.teethSelection),
                                        j.units || '1',
                                        [j.shade1, j.shade2, j.shade3].filter(s => s).join('/') || '-',
                                        (j.totalAmount || 0).toFixed(2),
                                        o.status
                                    ]);
                                });
                            } else {
                                newRows.push([
                                    new Date(o.dueDate).toLocaleDateString('en-GB'),
                                    o.trialDate ? new Date(o.trialDate).toLocaleDateString('en-GB') : '-',
                                    o.orderNumber || o.id,
                                    o.client ? o.client.name : 'Unknown',
                                    o.patientName || '-',
                                    o.productName || o.productType || '-',
                                    createTeethGrid(o.teethSelection),
                                    o.units || '1',
                                    [o.shade1, o.shade2, o.shade3].filter(s => s).join('/') || '-',
                                    (o.netAmount || o.totalAmount || 0).toFixed(2),
                                    o.status
                                ]);
                            }
                        });
                    rows = newRows;
                } else if (name === 'Monthly Collection Amount') {
                    const res = await fetch(`${API_BASE}/receipts`);
                    const receipts = await res.json();
                    const monthly = {};
                    receipts.forEach(r => {
                        const month = new Date(r.receiptDate).toLocaleString('default', { month: 'short', year: 'numeric' });
                        monthly[month] = (monthly[month] || 0) + (r.amount || 0);
                    });
                    headers = ['Month', 'Collection Amount'];
                    rows = Object.entries(monthly).map(([m, val]) => [m, val.toFixed(2)]);
                } else if (name === 'Client wise invoices') {
                    const res = await fetch(`${API_BASE}/invoices`);
                    data = await res.json();
                    headers = ['Client', 'Invoice #', 'Date', 'Total'];
                    rows = data.map(inv => [
                        inv.client ? inv.client.name : 'Unknown',
                        inv.invoiceNumber,
                        new Date(inv.invoiceDate).toLocaleDateString(),
                        (inv.netAmount || 0).toFixed(2)
                    ]).sort((a, b) => a[0].localeCompare(b[0]));
                } else if (name === 'Daily Collection Amount') {
                    const res = await fetch(`${API_BASE}/receipts`);
                    const receipts = await res.json();
                    const daily = {};
                    receipts.forEach(r => {
                        const date = new Date(r.receiptDate).toLocaleDateString();
                        daily[date] = (daily[date] || 0) + (r.amount || 0);
                    });
                    headers = ['Date', 'Collection Amount'];
                    rows = Object.entries(daily).map(([d, val]) => [d, val.toFixed(2)]).sort((a, b) => new Date(b[0]) - new Date(a[0]));
                } else if (name.includes('Adjustment')) {
                    const res = await fetch(`${API_BASE}/adjustments`);
                    data = await res.json();
                    if (name.includes('Credit')) data = data.filter(a => a.type === 'Credit');
                    headers = ['Date', 'Client', 'Type', 'Amount', 'Reason'];
                    rows = data.map(a => [
                        new Date(a.date).toLocaleDateString(),
                        a.client ? a.client.name : 'Unknown',
                        a.type,
                        (a.amount || 0).toFixed(2),
                        a.reason || '-'
                    ]);
                } else if (name === 'Sales Manager wise collections') {
                    const res = await fetch(`${API_BASE}/receipts`);
                    const receipts = await res.json();
                    const managerData = {};
                    receipts.forEach(r => {
                        const mgr = (r.client && r.client.salesManager) || 'None';
                        managerData[mgr] = (managerData[mgr] || 0) + (r.amount || 0);
                    });
                    headers = ['Sales Manager', 'Total Collection'];
                    rows = Object.entries(managerData).map(([mgr, val]) => [mgr, val.toFixed(2)]);
                } else if (name === 'Scheduled Date wise Pickup Requests') {
                    const res = await fetch(`${API_BASE}/pickups`);
                    const pickups = await res.json();
                    headers = ['Scheduled Date', 'Client', 'Patient', 'Product', 'Status'];
                    rows = pickups
                        .filter(p => p.pickupDate)
                        .sort((a, b) => new Date(a.pickupDate) - new Date(b.pickupDate))
                        .map(p => [
                            new Date(p.pickupDate).toLocaleDateString(),
                            p.client ? p.client.name : 'Unknown',
                            p.patientName || '-',
                            p.productType || '-',
                            p.status
                        ]);
                } else if (name.includes('Pickup')) {
                    const res = await fetch(`${API_BASE}/pickups`);
                    data = await res.json();
                    if (name.includes('Done')) data = data.filter(p => p.status === 'Completed');
                    headers = ['ID', 'Client', 'Date', 'Staff/Driver', 'Status'];
                    rows = data.map(p => [
                        p.id,
                        p.client ? p.client.name : 'Unknown',
                        new Date(p.requestDate).toLocaleDateString(),
                        p.assignedTo || 'Unassigned',
                        p.status
                    ]);
                } else if (name === 'Daily Expense') {
                    const res = await fetch(`${API_BASE}/expenses`);
                    const expenses = await res.json();
                    const daily = {};
                    expenses.forEach(e => {
                        const date = new Date(e.date).toLocaleDateString();
                        daily[date] = (daily[date] || 0) + (e.amount || 0);
                    });
                    headers = ['Date', 'Total Expense'];
                    rows = Object.entries(daily).map(([d, val]) => [d, val.toFixed(2)]).sort((a, b) => new Date(b[0]) - new Date(a[0]));
                } else if (name === 'Monthly Expense') {
                    const res = await fetch(`${API_BASE}/expenses`);
                    const expenses = await res.json();
                    const monthly = {};
                    expenses.forEach(e => {
                        const month = new Date(e.date).toLocaleString('default', { month: 'short', year: 'numeric' });
                        monthly[month] = (monthly[month] || 0) + (e.amount || 0);
                    });
                    headers = ['Month', 'Total Expense'];
                    rows = Object.entries(monthly).map(([m, val]) => [m, val.toFixed(2)]);
                } else if (name === 'Expense Head wise expenses') {
                    const res = await fetch(`${API_BASE}/expenses`);
                    const expenses = await res.json();
                    const categoryData = {};
                    expenses.forEach(e => {
                        const cat = e.category || 'General';
                        categoryData[cat] = (categoryData[cat] || 0) + (e.amount || 0);
                    });
                    headers = ['Expense Category', 'Total Amount'];
                    rows = Object.entries(categoryData).map(([cat, val]) => [cat, val.toFixed(2)]);
                } else if (name === 'Expenses List') {
                    const res = await fetch(`${API_BASE}/expenses`);
                    data = await res.json();
                    headers = ['Date', 'Category', 'Description', 'Amount'];
                    rows = data.map(e => [
                        new Date(e.date).toLocaleDateString(),
                        e.category,
                        e.description || '-',
                        (e.amount || 0).toFixed(2)
                    ]);
                } else if (name === 'Item Definitions' || name.includes('Stock Position')) {
                    const res = await fetch(`${API_BASE}/materials`);
                    data = await res.json();
                    headers = ['Category', 'Item Name', 'Current Stock', 'Unit'];
                    rows = data.map(m => [
                        m.category || 'General',
                        m.name,
                        (m.stock || 0).toFixed(2),
                        m.unit || 'pcs'
                    ]).sort((a, b) => a[0].localeCompare(b[0]));
                } else if (name === 'Invoice List' || name.includes('Invoiced Orders')) {
                    const res = await fetch(`${API_BASE}/invoices`);
                    data = await res.json();
                    headers = ['Invoice #', 'Client', 'Date', 'Amount', 'Status'];
                    rows = data.map(inv => [
                        inv.invoiceNumber,
                        inv.client ? inv.client.name : 'Unknown',
                        new Date(inv.invoiceDate).toLocaleDateString(),
                        (inv.netAmount || 0).toFixed(2),
                        inv.status
                    ]);
                } else if (name === 'Daily Invoice Amount') {
                    const res = await fetch(`${API_BASE}/invoices`);
                    const invoices = await res.json();
                    const daily = {};
                    invoices.forEach(inv => {
                        const date = new Date(inv.invoiceDate).toLocaleDateString();
                        daily[date] = (daily[date] || 0) + (inv.netAmount || 0);
                    });
                    headers = ['Date', 'Total Invoiced'];
                    rows = Object.entries(daily).map(([d, val]) => [d, val.toFixed(2)]).sort((a, b) => new Date(b[0]) - new Date(a[0]));
                } else if (name === 'Client wise Invoiced Order Jobs') {
                    const res = await fetch(`${API_BASE}/orders`);
                    const allOrders = await res.json();
                    data = allOrders.filter(o => o.invoiceId);
                    headers = ['Client', 'Order #', 'Patient', 'Product', 'Invoice ID', 'Amount'];
                    let newRows = [];
                    data.forEach(o => {
                        if (o.jobs && o.jobs.length > 0) {
                            o.jobs.forEach(j => {
                                newRows.push([
                                    o.client ? o.client.name : 'Unknown',
                                    o.orderNumber || o.id,
                                    o.patientName,
                                    j.productName || j.productType || '-',
                                    o.invoiceId,
                                    (j.totalAmount || 0).toFixed(2)
                                ]);
                            });
                        } else {
                            newRows.push([
                                o.client ? o.client.name : 'Unknown',
                                o.orderNumber || o.id,
                                o.patientName,
                                o.productName || o.productType || '-',
                                o.invoiceId,
                                (o.netAmount || o.totalAmount || 0).toFixed(2)
                            ]);
                        }
                    });
                    rows = newRows.sort((a, b) => a[0].localeCompare(b[0]));
                } else if (name.includes('Tax Information') || name.includes('GST')) {
                    const res = await fetch(`${API_BASE}/invoices`);
                    data = await res.json();
                    headers = ['Invoice #', 'Client', 'Gross', 'Tax', 'Net'];
                    rows = data.map(inv => [
                        inv.invoiceNumber,
                        inv.client ? inv.client.name : 'Unknown',
                        (inv.grossAmount || 0).toFixed(2),
                        (inv.taxAmount || 0).toFixed(2),
                        (inv.netAmount || 0).toFixed(2)
                    ]);
                } else if (name === 'Orders Jobs- by ProductType') {
                    const res = await fetch(`${API_BASE}/orders`);
                    const orders = await res.json();
                    const typeData = {};
                    orders.forEach(o => {
                        if (o.jobs && o.jobs.length > 0) {
                            o.jobs.forEach(j => {
                                const type = j.productType || 'Unknown';
                                typeData[type] = (typeData[type] || 0) + 1;
                            });
                        } else {
                            const type = o.productType || 'Unknown';
                            typeData[type] = (typeData[type] || 0) + 1;
                        }
                    });
                    headers = ['Product Type', 'Order Count'];
                    rows = Object.entries(typeData).map(([type, count]) => [type, count]).sort((a, b) => a[0].localeCompare(b[0]));
                } else if (name === 'Orders Jobs- by ProductType,Product - Summary' || name === 'Shipped Orders Jobs- by ProductType,Product - Summary' || name === 'Shipped Orders Jobs- by ProductType, Product - Summary') {
                    const res = await fetch(`${API_BASE}/orders`);
                    let orders = await res.json();
                    if (name.includes('Shipped')) {
                        orders = orders.filter(o => ['Dispatched', 'Delivered'].includes(o.shippingStatus));
                    }
                    const typeData = {};
                    orders.forEach(o => {
                        if (o.jobs && o.jobs.length > 0) {
                            o.jobs.forEach(j => {
                                const type = j.productType || 'Unknown';
                                const prod = j.productName || '-';
                                const key = type + '||' + prod;
                                typeData[key] = (typeData[key] || 0) + 1;
                            });
                        } else {
                            const type = o.productType || 'Unknown';
                            const prod = o.productName || '-';
                            const key = type + '||' + prod;
                            typeData[key] = (typeData[key] || 0) + 1;
                        }
                    });
                    headers = ['Product Type', 'Product Name', 'Order Count'];
                    rows = Object.entries(typeData).map(([key, count]) => {
                        const [type, prod] = key.split('||');
                        return [type, prod, count];
                    }).sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
                } else if (name.includes('Daily Order Activity')) {
                    const res = await fetch(`${API_BASE}/orders`);
                    const orders = await res.json();
                    const daily = {};
                    orders.forEach(o => {
                        const date = new Date(o.createdAt).toLocaleDateString();
                        daily[date] = (daily[date] || 0) + 1;
                    });
                    headers = ['Date', 'New Orders'];
                    rows = Object.entries(daily).map(([d, count]) => [d, count]).sort((a, b) => new Date(b[0]) - new Date(a[0]));
                } else if (name.includes('Shipment') || name.includes('Shipped')) {
                    const res = await fetch(`${API_BASE}/orders`);
                    data = await res.json();
                    data = data.filter(o => ['Dispatched', 'Delivered'].includes(o.shippingStatus));
                    headers = ['Shipment #', 'Order #', 'Client', 'Date', 'Status'];
                    rows = data.map(o => [
                        o.shipmentNoteId || '-',
                        o.orderNumber || o.id,
                        o.client ? o.client.name : 'Unknown',
                        new Date(o.updatedAt).toLocaleDateString(),
                        o.shippingStatus || 'Unknown'
                    ]);
                } else if (name === 'Employee Master List' || name === 'Department wise Employees') {
                    const res = await fetch(`${API_BASE}/staff`);
                    data = await res.json();
                    headers = ['ID', 'Name', 'Role', 'Department', 'Status'];
                    rows = data.map(s => [s.id, s.name, s.role || '-', s.department || 'General', s.status]);
                    if (name.includes('Department')) rows.sort((a, b) => a[3].localeCompare(b[3]));
                } else if (name === 'Salary Slip Summary') {
                    const res = await fetch(`${API_BASE}/staff`);
                    data = await res.json();
                    headers = ['Staff Name', 'Role', 'Monthly Salary'];
                    rows = data.map(s => [s.name, s.role || '-', (s.salary || 0).toFixed(2)]);
                } else if (name === 'Attendance Log') {
                    headers = ['Date', 'Staff Name', 'Status', 'In Time', 'Out Time'];
                    rows = [['2024-05-07', 'John Doe', 'Present', '09:00 AM', '06:00 PM']]; // Mock
                } else {
                    // Fallback for unimplemented reports
                    document.getElementById('report-viewer-content').innerHTML = `
                        <div style="text-align:center; padding:50px; color:#666;">
                            <i class="fas fa-exclamation-triangle" style="font-size:30px; margin-bottom:15px; color:#f59e0b;"></i>
                            <p style="font-size:16px; font-weight:600;">Report Logic Not Implemented</p>
                            <p>The data processing logic for "<strong>${name}</strong>" is not yet available.</p>
                            <button onclick="closeModal()" style="margin-top:20px; padding:8px 20px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer;">Close</button>
                        </div>
                    `;
                    return;
                }

                renderTableReport(name, headers, rows);
            } catch (err) {
                console.error(err);
                document.getElementById('report-viewer-content').innerHTML = `
                    <div style="text-align:center; padding:50px; color:#ef4444;">
                        <i class="fas fa-exclamation-triangle" style="font-size:30px; margin-bottom:15px;"></i>
                        <p>Error fetching data from server. Please ensure backend is running.</p>
                    </div>
                `;
            }
        }

        function closeModal() {
            document.getElementById('report-placeholder').style.display = 'flex';
            document.getElementById('report-screen').style.display = 'none';
        }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            toast.textContent = msg;
            toast.style.opacity = '1';
            setTimeout(() => {
                toast.style.opacity = '0';
            }, 3000);
        }

        
        function exportReportToCSV() {
            const title = document.getElementById('modal-report-title').textContent || 'Export';
            const table = document.querySelector('#report-viewer-content table');
            if (!table) return alert('No table data to export');
            let csv = [];
            for (let i = 0; i < table.rows.length; i++) {
                let row = [], cols = table.rows[i].querySelectorAll('td, th');
                for (let j = 0; j < cols.length; j++) {
                    let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, ' ').replace(/"/g, '""');
                    row.push('"' + data + '"');
                }
                csv.push(row.join(','));
            }
            const csvData = new Blob([csv.join('\n')], { type: 'text/csv' });
            const csvUrl = URL.createObjectURL(csvData);
            const hiddenElement = document.createElement('a');
            hiddenElement.href = csvUrl;
            hiddenElement.target = '_blank';
            hiddenElement.download = title.replace(/\s+/g, '_') + '_' + new Date().toISOString().slice(0,10) + '.csv';
            hiddenElement.click();
        }

        function renderTableReport(name, headers, rows) {
            const container = document.getElementById('report-viewer-content');
            
            let html = `
                <div style="max-width:1000px; margin:0 auto;">
                    <div style="text-align:center; margin-bottom:30px;">
                        <h2 style="margin:0; letter-spacing:1px;">SOHAR DENTAL LAB</h2>
                        <p style="margin:5px 0; color:#666; font-size:14px;">Operational Excellence Report</p>
                        <h3 style="margin:20px 0 10px 0; color:#1a56db; text-transform:uppercase;">${name}</h3>
                        <p style="font-size:11px; color:#999;">Generated on ${new Date().toLocaleString()}</p>
                    </div>
            `;

            if (name === 'Due Date wise Order Jobs' || name === 'Orders Jobs- by Due Date') {
                // Group by Due Date (index 0)
                const grouped = {};
                rows.forEach(r => {
                    const date = r[0];
                    if (!grouped[date]) grouped[date] = [];
                    grouped[date].push(r);
                });
                
                Object.keys(grouped).forEach(date => {
                    html += `
                        <h4 style="background:#e5e7eb; padding:8px 12px; margin-top:20px; margin-bottom:0; font-size:14px; border:1px solid #ccc; border-bottom:none;">Due Date: ${date}</h4>
                        <table style="width:100%; border-collapse:collapse; font-size:13px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom:20px;">
                            <thead>
                                <tr style="background:#f3f4f6; text-align:left;">
                                    ${headers.slice(1).map(h => `<th style="padding:10px; border:1px solid #ccc; border-bottom:2px solid #ccc;">${h}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                    `;
                    grouped[date].forEach(row => {
                        html += `<tr style="background:#fff;">${row.slice(1).map((val, idx) => {
                            const align = (!isNaN(parseFloat(val)) && headers[idx+1].toLowerCase().includes('amount')) ? 'right' : 'left';
                            return `<td style="padding:8px 10px; border:1px solid #e5e7eb; text-align:${align};">${val}</td>`;
                        }).join('')}</tr>`;
                    });
                    html += `</tbody></table>`;
                });
            } else {
                // Default flat table
                const numericColIndices = headers.map((h, i) => (h.toLowerCase().includes('amount') || h.toLowerCase().includes('total') || h.toLowerCase().includes('balance')) ? i : -1).filter(i => i !== -1);
                
                let totals = {};
                numericColIndices.forEach(idx => totals[idx] = 0);
                
                if (numericColIndices.length > 0) {
                    rows.forEach(row => {
                        numericColIndices.forEach(idx => {
                            const val = parseFloat(row[idx] ? String(row[idx]).replace(/,/g, '') : '0');
                            if (!isNaN(val)) totals[idx] += val;
                        });
                    });
                }
                
                html += `
                    <table style="width:100%; border-collapse:collapse; font-size:13px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <thead>
                            <tr style="background:#f3f4f6; text-align:left;">
                                ${headers.map(h => `<th style="padding:10px; border:1px solid #ccc; border-bottom:2px solid #ccc;">${h}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                `;
                rows.forEach(row => {
                    html += `<tr style="background:#fff; transition:background 0.2s;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='#fff'">
                        ${row.map((val, idx) => {
                            const isNum = numericColIndices.includes(idx);
                            const align = isNum ? 'right' : 'left';
                            const bold = isNum ? 'font-weight:600;' : '';
                            return `<td style="padding:8px 10px; border:1px solid #e5e7eb; text-align:${align}; ${bold}">${val}</td>`;
                        }).join('')}
                    </tr>`;
                });
                html += `</tbody>`;
                if (numericColIndices.length > 0) {
                    const firstNumericIdx = numericColIndices[0];
                    html += `
                        <tfoot>
                            <tr style="background:#f3f4f6; font-weight:bold;">
                                ${headers.map((h, i) => {
                                    if (numericColIndices.includes(i)) {
                                        return `<td style="padding:10px; border:1px solid #ccc; text-align:right;">${totals[i].toFixed(2)}</td>`;
                                    } else if (i === 0 && firstNumericIdx > 0) {
                                        return `<td style="padding:10px; border:1px solid #ccc; text-align:right;" colspan="${firstNumericIdx}">Total</td>`;
                                    } else if (i < firstNumericIdx && i !== 0) {
                                        return '';
                                    } else {
                                        return `<td style="padding:10px; border:1px solid #ccc;"></td>`;
                                    }
                                }).join('')}
                            </tr>
                        </tfoot>
                    `;
                }
                html += `</table>`;
            }

            html += `</div>`;
            container.innerHTML = html;
        }

    