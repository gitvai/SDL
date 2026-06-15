const fs = require('fs');

function patchEditOrderMulti() {
    let content = fs.readFileSync('orders.html', 'utf8');

    // 1. Inject global functions
    const globalFns = `
    window.editOrderJobs = [];

    window.renderEditOrderJobs = function() {
        const wrapper = document.getElementById('eo-jobs-wrapper');
        if (!wrapper) return;
        
        let html = \`<table style="width:100%; border-collapse: collapse; font-size: 13px; text-align: left; margin-bottom: 10px; border: 1px solid #e5e7eb;">
            <thead>
                <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                    <th style="padding: 6px;">Product</th>
                    <th style="padding: 6px; text-align:center;">Units</th>
                    <th style="padding: 6px; text-align:right;">Rate</th>
                    <th style="padding: 6px; text-align:right;">Total</th>
                    <th style="padding: 6px; text-align:center;">Action</th>
                </tr>
            </thead>
            <tbody>\`;
            
        let grandTotal = 0;
        window.editOrderJobs.forEach((j, idx) => {
            let total = parseFloat(j.totalAmount !== undefined ? j.totalAmount : j.total) || 0;
            let price = parseFloat(j.price !== undefined ? j.price : (j.rate || j.unitRate)) || 0;
            
            grandTotal += total;
            html += \`<tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 6px; font-weight: 600; color: #1f2937;">\${j.productName || j.product || '-'}</td>
                <td style="padding: 6px; text-align:center;">
                    <input type="number" value="\${j.units || 1}" style="width:50px; text-align:center; padding:2px; border:1px solid #ccc; border-radius:4px;" onchange="updateEditJob(\${idx}, 'units', this.value)">
                </td>
                <td style="padding: 6px; text-align:right;">
                    <input type="number" step="any" value="\${price}" style="width:70px; text-align:right; padding:2px; border:1px solid #ccc; border-radius:4px;" onchange="updateEditJob(\${idx}, 'rate', this.value)">
                </td>
                <td style="padding: 6px; text-align:right; font-weight:bold; color: #111827;">\${total.toFixed(2)}</td>
                <td style="padding: 6px; text-align:center;">
                    <button type="button" onclick="removeEditJob(\${idx})" style="color:#ef4444; background:none; border:none; cursor:pointer;" title="Remove Job"><i class="fas fa-trash"></i></button>
                </td>
            </tr>\`;
        });
        
        html += \`</tbody></table>\`;
        wrapper.innerHTML = html;
        
        const tcText = document.getElementById('eo-total-charge-text');
        if (tcText) tcText.textContent = grandTotal.toFixed(2);
        
        const tcInput = document.getElementById('eo-total');
        if (tcInput) tcInput.value = grandTotal.toFixed(2);
    };

    window.updateEditJob = function(idx, field, val) {
        const j = window.editOrderJobs[idx];
        if (field === 'units') j.units = parseInt(val) || 0;
        if (field === 'rate') { j.price = parseFloat(val) || 0; j.rate = j.price; }
        
        const r = j.price || j.rate || j.unitRate || 0;
        j.totalAmount = (j.units || 1) * r;
        j.total = j.totalAmount;
        
        window.renderEditOrderJobs();
    };

    window.removeEditJob = function(idx) {
        window.editOrderJobs.splice(idx, 1);
        window.renderEditOrderJobs();
    };
    `;

    if (!content.includes('window.renderEditOrderJobs')) {
        content = content.replace('<script>', '<script>\n' + globalFns);
    }

    // 2. Patch openEditModal
    const openModalHook = `
                document.getElementById('eo-prod-name').dataset.type = order.productType || 'General';
                document.getElementById('eo-rate').value = (order.unitRate !== undefined && order.unitRate !== null) ? order.unitRate : (order.units ? (order.totalAmount / order.units).toFixed(2) : 0);
    `;
    const openModalPatch = openModalHook + `
                // Multi-product setup
                window.editOrderJobs = (order.jobs && order.jobs.length > 0) 
                    ? JSON.parse(JSON.stringify(order.jobs)) 
                    : [{
                        productName: order.productName,
                        productType: order.productType,
                        units: order.units,
                        price: (order.unitRate !== undefined && order.unitRate !== null) ? order.unitRate : (order.units ? (order.totalAmount / order.units) : 0),
                        totalAmount: order.totalAmount
                    }];
                
                document.getElementById('eo-prod-name').style.display = 'none';
                document.getElementById('eo-rate-container').style.display = 'none';
                if (document.getElementById('eo-slabs-container')) document.getElementById('eo-slabs-container').style.display = 'none';
                
                if (!document.getElementById('eo-jobs-wrapper')) {
                    const wrap = document.createElement('div');
                    wrap.id = 'eo-jobs-wrapper';
                    wrap.style.marginTop = '10px';
                    const rc = document.getElementById('eo-rate-container');
                    rc.parentNode.insertBefore(wrap, rc);
                }
                
                window.renderEditOrderJobs();
    `;
    if (!content.includes('window.editOrderJobs = (order.jobs')) {
        content = content.replace(openModalHook, openModalPatch);
    }

    // 3. Patch selectEditProduct
    const selectHook = `
        function selectEditProduct(p) {
            document.getElementById('eo-prod-name').textContent = p.name;
            document.getElementById('eo-prod-name').dataset.type = p.type || 'General';
            document.getElementById('eo-rate').value = p.charge;
`;
    const selectPatch = `
        function selectEditProduct(p) {
            if (window.editOrderJobs) {
                window.editOrderJobs.push({
                    productName: p.name,
                    productType: p.type || 'General',
                    units: 1,
                    price: p.charge || 0,
                    totalAmount: p.charge || 0
                });
                window.renderEditOrderJobs();
                closeEditProductModal();
                return;
            }
            
            document.getElementById('eo-prod-name').textContent = p.name;
            document.getElementById('eo-prod-name').dataset.type = p.type || 'General';
            document.getElementById('eo-rate').value = p.charge;
`;
    if (!content.includes('window.editOrderJobs.push({')) {
        content = content.replace(selectHook, selectPatch);
    }

    // 4. Patch saveOrderEdit
    const saveHook = `
                slab1Units: isSlabsVisible ? Math.min(unitsVal, 1) : null,
                slab2Units: isSlabsVisible ? Math.max(0, unitsVal - 1) : null
            };

            try {
`;
    const savePatch = saveHook.replace('};', '    jobs: window.editOrderJobs\n            };');
    if (!content.includes('jobs: window.editOrderJobs')) {
        content = content.replace(saveHook, savePatch);
    }

    fs.writeFileSync('orders.html', content);
    console.log("Patched orders.html for Edit Order multi-product support");
}

patchEditOrderMulti();
