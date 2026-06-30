

        window.applySortAndPagination = function(data, containerId) {
            currentRenderContainer = containerId;
            let sort1 = 'None';
            let sort2 = 'Ascending';
            const s1El = document.querySelector('input[name="sort1"]:checked');
            const s2El = document.querySelector('input[name="sort2"]:checked');
            if (s1El) sort1 = s1El.value;
            if (s2El) sort2 = s2El.value;

            let sorted = [...data];
            if (sort1 !== 'None') {
                sorted.sort((a, b) => {
                    let valA = a[sort1] || a.id || '';
                    let valB = b[sort1] || b.id || '';
                    if (typeof valA === 'string') valA = valA.toLowerCase();
                    if (typeof valB === 'string') valB = valB.toLowerCase();
                    
                    if (valA < valB) return sort2 === 'Ascending' ? -1 : 1;
                    if (valA > valB) return sort2 === 'Ascending' ? 1 : -1;
                    return 0;
                });
            }

            const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
            if (currentPage > totalPages) currentPage = totalPages;
            
            const start = (currentPage - 1) * itemsPerPage;
            const paginated = sorted.slice(start, start + itemsPerPage);
            
            setTimeout(() => renderPaginationControls(sorted.length, totalPages, containerId), 100);
            return paginated;
        };

        
        window.renderPaginationControls = function(totalItems, totalPages, containerId) {
            let container = document.getElementById('pagination-controls');
            if (!container) {
                container = document.createElement('div');
                container.id = 'pagination-controls';
                container.style = 'display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; border-top: 1px solid #e2e8f0; background: #fff;';
            }
            
            let tbody = document.getElementById(containerId);
            if (!tbody) tbody = document.querySelector('table tbody'); // Fallback to first table body
            if (tbody) {
                const card = tbody.closest('.card') || tbody.closest('.main-content') || tbody.parentElement;
                if (card) {
                    card.appendChild(container);
                }
            }
            
            const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems || 1);
            const endItem = Math.min(currentPage * itemsPerPage, totalItems);
            
            container.innerHTML = '<div style="font-size: 13px; color: #64748b;">Showing ' + startItem + ' to ' + endItem + ' of ' + totalItems + ' entries</div>' +
                '<div style="display: flex; gap: 5px;">' +
                    '<button type="button" onclick="changePage(-1)" ' + (currentPage === 1 ? 'disabled' : '') + ' style="padding: 5px 10px; border: 1px solid #cbd5e1; background: ' + (currentPage === 1 ? '#f1f5f9' : '#fff') + '; color: #334155; border-radius: 4px; cursor: ' + (currentPage === 1 ? 'not-allowed' : 'pointer') + ';">Previous</button>' +
                    '<span style="padding: 5px 10px; font-size: 13px; font-weight: bold;">Page ' + currentPage + ' of ' + totalPages + '</span>' +
                    '<button type="button" onclick="changePage(1)" ' + (currentPage === totalPages ? 'disabled' : '') + ' style="padding: 5px 10px; border: 1px solid #cbd5e1; background: ' + (currentPage === totalPages ? '#f1f5f9' : '#fff') + '; color: #334155; border-radius: 4px; cursor: ' + (currentPage === totalPages ? 'not-allowed' : 'pointer') + ';">Next</button>' +
                '</div>';
        };
    

        window.changePage = function(delta) {
            currentPage += delta;
            if(currentRenderFn) currentRenderFn();
        };
    

        window.renderOrdersInner = function(dataToRender) {
            let orders = window.applySortAndPagination ? window.applySortAndPagination(dataToRender, 'orders-table-tbody') : dataToRender;
            const status = document.getElementById('filter-status').value;
            
            const tbody = document.querySelector('#orders-table tbody');
            tbody.id = 'orders-table-tbody'; // ensure ID exists
            tbody.innerHTML = '';

            const thead = document.querySelector('#orders-table thead tr');

            let extraHeaders = '';
            if (status === 'On Hold') {
                extraHeaders = '<th>On Hold From</th><th>Hold Reason</th>';
            } else if (status === 'Cancelled') {
                extraHeaders = '<th>Cancelled On</th><th>Cancelled Reason</th>';
            }

            let headersHtml = '<th style="width: 30px;"><input type="checkbox" onclick="toggleSelectAll(this)"></th>';
            const visibleCols = gridSettings ? gridSettings.columns.filter(c => c.visible !== false) : ALL_COLUMNS;
            
            visibleCols.forEach(col => {
                headersHtml += `<th>${col.caption || col.name}</th>`;
            });
            headersHtml += extraHeaders + '<th style="width: 100px; text-align: center;">Actions</th>';
            
            if (thead) thead.innerHTML = headersHtml;

            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="15" style="text-align:center; padding:20px; color:#666;">No orders found.</td></tr>';
                return;
            }

            orders.forEach((order, index) => {
                const tr = document.createElement('tr');
                tr.className = 'order-row';
                if (order.priority === 'Urgent') tr.classList.add('priority-urgent');

                let tdHtml = `<td style="text-align: center;"><input type="checkbox" class="order-checkbox" value="${order.id}"></td>`;

                visibleCols.forEach(col => {
                    let cellVal = '';
                    switch (col.key) {
                        case 'sr': cellVal = index + 1; break;
                        case 'orderNumber': cellVal = `<strong>${order.orderNumber || order.id}</strong>`; break;
                        case 'orderDate': cellVal = order.receivedDate ? new Date(order.receivedDate).toLocaleDateString() : '-'; break;
                        case 'dueDate': cellVal = order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '-'; break;
                        case 'clientName': cellVal = order.client ? `<a href="client_viewer.html?id=${order.clientId}" class="client-link" onclick="event.stopPropagation()">${order.client.name}</a>` : 'Unknown'; break;
                        case 'patientName': cellVal = order.patientName || '-'; break;
                        case 'product': 
                            if (order.jobs && order.jobs.length > 0) {
                                const uniqueProducts = [...new Set(order.jobs.map(j => j.productName || j.productType || '-').filter(Boolean))];
                                cellVal = uniqueProducts.map(p => `<span class="product-badge" style="background: ${getProductColor(p)}20; color: ${getProductColor(p)}; margin-right: 4px; display: inline-block; margin-bottom: 2px;">${p}</span>`).join('');
                            } else {
                                cellVal = `<span class="product-badge" style="background: ${getProductColor(order.productType)}20; color: ${getProductColor(order.productType)}">${order.productName || '-'}</span>`; 
                            }
                            break;
                        case 'model': cellVal = order.modelNumber || '-'; break;
                        case 'status':
                            if (status === 'On Hold') {
                                cellVal = `<span class="status-badge" style="background: #fbbf2420; color: #d97706; border: 1px solid #fbbf24;">On Hold</span>`;
                            } else {
                                cellVal = `<span class="status-badge" style="background: ${getStatusColor(order.status)}20; color: ${getStatusColor(order.status)}; border: 1px solid ${getStatusColor(order.status)}40">${order.status}</span>`;
                            }
                            break;
                    }
                    tdHtml += `<td>${cellVal}</td>`;
                });

                if (status === 'On Hold') {
                    tdHtml += `<td>${order.holdDate ? new Date(order.holdDate).toLocaleDateString() : '-'}</td><td>${order.holdReason || '-'}</td>`;
                } else if (status === 'Cancelled') {
                    tdHtml += `<td>${order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : '-'}</td><td>${order.cancelledReason || '-'}</td>`;
                }

                tdHtml += `
                    <td class="action-cell" onclick="event.stopPropagation()">
                        <div class="action-buttons">
                            <button class="btn-action btn-edit" title="Edit Order" onclick="openEditModal(${order.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action btn-invoice" title="View/Generate Invoice" onclick="viewOrderInvoice(${order.id})">
                                <i class="fas fa-file-invoice"></i>
                            </button>
                        </div>
                    </td>
                `;

                tr.innerHTML = tdHtml;
                tr.onclick = () => openEditModal(order.id);
                tbody.appendChild(tr);
            });
        };
    



    window.editOrderJobs = [];
    window.editingJobIndex = -1;

    window.clearActiveEditFields = function() {
        document.getElementById('eo-prod-name').textContent = 'PRODUCT';
        document.getElementById('eo-prod-name').dataset.type = 'General';
        document.getElementById('eo-rate').value = 0;
        document.getElementById('eo-units').value = 1;
        document.getElementById('eo-total-charge-text').textContent = '0';
        document.querySelectorAll('.tooth-num').forEach(t => t.classList.remove('selected'));
        if (document.getElementById('eo-slabs-container')) document.getElementById('eo-slabs-container').style.display = 'none';
        if (document.getElementById('eo-custom-unit-text-container')) {
            document.getElementById('eo-custom-unit-text-container').style.display = 'none';
            document.getElementById('eo-custom-unit-text').value = '';
        }
        window.editingJobIndex = -1;
    };

    window.saveActiveEditJob = function() {
        const eoProdName = document.getElementById('eo-prod-name').textContent.trim();
        if (!eoProdName || eoProdName === 'PRODUCT') {
            alert('Please select a product first.');
            return;
        }
        
        const selectedTeethElements = document.querySelectorAll('.tooth-num.selected');
        const selectedTeeth = Array.from(selectedTeethElements).map(el => el.getAttribute('data-tooth')).sort();
        const customUnitContainer = document.getElementById('eo-custom-unit-text-container');
        let customTeethText = '';
        if (customUnitContainer && customUnitContainer.style.display === 'block') {
            customTeethText = document.getElementById('eo-custom-unit-text').value;
        }
        const isSlabsVisible = document.getElementById('eo-slabs-container') && document.getElementById('eo-slabs-container').style.display === 'block';
        const unitsVal = parseInt(document.getElementById('eo-units').value) || 1;

        const job = {
            productName: eoProdName,
            productType: document.getElementById('eo-prod-name').dataset.type || 'General',
            teethSelection: customTeethText ? customTeethText : selectedTeeth.join(', '),
            units: unitsVal,
            price: parseFloat(document.getElementById('eo-rate').value) || 0,
            totalAmount: parseFloat(document.getElementById('eo-total-charge-text').textContent) || 0,
            slab1Rate: isSlabsVisible ? parseFloat(document.getElementById('eo-slab1-rate').value) : null,
            slab2Rate: isSlabsVisible ? parseFloat(document.getElementById('eo-slab2-rate').value) : null,
            slab1Units: isSlabsVisible ? Math.min(unitsVal, 1) : null,
            slab2Units: isSlabsVisible ? Math.max(0, unitsVal - 1) : null
        };
        
        if (window.editingJobIndex >= 0) {
            window.editOrderJobs[window.editingJobIndex] = job;
        } else {
            window.editOrderJobs.push(job);
        }
        window.editingJobIndex = -1;
        
        window.renderEditOrderJobs();
        window.clearActiveEditFields();
        alert('Item saved successfully!');
    };

    window.editJobInList = function(idx) {
        window.editingJobIndex = idx;
        const j = window.editOrderJobs[idx];
        
        document.getElementById('eo-prod-name').textContent = j.productName || j.product || 'PRODUCT';
        document.getElementById('eo-prod-name').dataset.type = j.productType || 'General';
        
        const rateVal = j.price !== undefined ? j.price : (j.rate !== undefined ? j.rate : j.unitRate || 0);
        document.getElementById('eo-rate').value = rateVal;
        document.getElementById('eo-units').value = j.units || 1;
        document.getElementById('eo-total-charge-text').textContent = (j.totalAmount !== undefined ? j.totalAmount : j.total || 0).toFixed(3);
        
        // Load teeth Selection
        document.querySelectorAll('.tooth-num').forEach(t => t.classList.remove('selected'));
        const teethStr = j.teethSelection || (Array.isArray(j.teeth) ? j.teeth.join(', ') : j.teeth) || '';
        if (teethStr) {
            const teeth = teethStr.split(',').map(t => t.trim());
            document.querySelectorAll('.tooth-num').forEach(t => {
                if (teeth.includes(t.getAttribute('data-tooth'))) t.classList.add('selected');
            });
        }
        
        // Handle slabs
        const slabsContainer = document.getElementById('eo-slabs-container');
        const slabProducts = ['RPD', 'FLEXIBLE RPD', 'CAST PARTIAL', 'RPD REPAIR AND ADD TEETH'];
        const pName = (j.productName || j.product || '').toUpperCase();
        const pType = (j.productType || 'General').toUpperCase();
        const isSlabProduct = slabProducts.includes(pName) || (pName.includes('RPD') && pName !== 'AAA');
        const isSpecialRpd = pName === 'RPD' || pName.includes('FLEXIBLE RPD') || pName.includes('PARTIAL RPD');
        if (slabsContainer) {
            slabsContainer.style.display = isSlabProduct ? 'block' : 'none';
        }
        
        const customUnitContainer = document.getElementById('eo-custom-unit-text-container');
        if (customUnitContainer) {
            customUnitContainer.style.display = isSlabProduct ? 'block' : 'none';
        }
        if (isSlabProduct && customUnitContainer) {
            const isNumericTeeth = teethStr.split(',').map(t => parseInt(t.trim())).some(t => !isNaN(t));
            if (!isNumericTeeth && teethStr) {
                document.getElementById('eo-custom-unit-text').value = teethStr;
            } else {
                document.getElementById('eo-custom-unit-text').value = '';
            }
        }
        
        const s1 = document.getElementById('eo-slab1-rate');
        if (s1) s1.value = (j.slab1Rate !== null && j.slab1Rate !== undefined) ? j.slab1Rate : (isSpecialRpd ? 17 : rateVal);
        const s2 = document.getElementById('eo-slab2-rate');
        if (s2) s2.value = (j.slab2Rate !== null && j.slab2Rate !== undefined) ? j.slab2Rate : 2;
        
        updateEditOrderCalculation();
    };

    window.renderEditOrderJobs = function() {
        const wrapper = document.getElementById('eo-jobs-wrapper');
        if (!wrapper) return;
        
        let html = `<table style="width:100%; border-collapse: collapse; font-size: 13px; text-align: left; margin-bottom: 10px; border: 1px solid #e5e7eb;">
            <thead>
                <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                    <th style="padding: 6px;">Product</th>
                    <th style="padding: 6px; text-align:center;">Units</th>
                    <th style="padding: 6px; text-align:right;">Rate</th>
                    <th style="padding: 6px; text-align:right;">Total</th>
                    <th style="padding: 6px; text-align:center;">Action</th>
                </tr>
            </thead>
            <tbody>`;
            
        let grandTotal = 0;
        window.editOrderJobs.forEach((j, idx) => {
            let total = parseFloat(j.totalAmount !== undefined ? j.totalAmount : j.total) || 0;
            let price = parseFloat(j.price !== undefined ? j.price : (j.rate || j.unitRate)) || 0;
            
            grandTotal += total;
            html += `<tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 6px; font-weight: 600; color: #1f2937;">${j.productName || j.product || '-'}</td>
                <td style="padding: 6px; text-align:center;">
                    <input type="number" value="${j.units || 1}" style="width:50px; text-align:center; padding:2px; border:1px solid #ccc; border-radius:4px;" onchange="updateEditJob(${idx}, 'units', this.value)">
                </td>
                <td style="padding: 6px; text-align:right;">
                    <input type="number" step="any" value="${price}" style="width:70px; text-align:right; padding:2px; border:1px solid #ccc; border-radius:4px;" onchange="updateEditJob(${idx}, 'rate', this.value)">
                </td>
                <td style="padding: 6px; text-align:right; font-weight:bold; color: #111827;">${total.toFixed(3)}</td>
                <td style="padding: 6px; text-align:center;">
                    <button type="button" onclick="editJobInList(${idx})" style="color:#3b82f6; background:none; border:none; cursor:pointer; margin-right:8px;" title="Edit Job"><i class="fas fa-edit"></i></button>
                    <button type="button" onclick="removeEditJob(${idx})" style="color:#ef4444; background:none; border:none; cursor:pointer;" title="Remove Job"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
        
        html += `</tbody></table>`;
        wrapper.innerHTML = html;
        
        const tcText = document.getElementById('eo-total-charge-text');
        if (tcText) tcText.textContent = grandTotal.toFixed(3);
        
        const tcInput = document.getElementById('eo-total');
        if (tcInput) tcInput.value = grandTotal.toFixed(3);
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
        if (window.editingJobIndex === idx) {
            window.clearActiveEditFields();
        } else if (window.editingJobIndex > idx) {
            window.editingJobIndex--;
        }
        window.renderEditOrderJobs();
    };
    

        let currentPage = 1;
        let itemsPerPage = 50;
        let allFetchedData = [];
        let currentRenderFn = null;
        let currentRenderContainer = null;
    


                
                function handleNewPickupStaffChange(select) {
                    if (select.value === '__add_new__') {
                        const newStaff = prompt("Enter new staff name:");
                        if (newStaff && newStaff.trim() !== '') {
                            const opt = document.createElement('option');
                            opt.value = newStaff.trim();
                            opt.textContent = newStaff.trim();
                            select.insertBefore(opt, select.querySelector('option[value="__add_new__"]'));
                            select.value = newStaff.trim();
                        } else {
                            select.value = '';
                        }
                    }
                }

                function openEnclosuresModal() {
                    document.getElementById('enclosures-modal').style.display = 'flex';
                }

                function closeEnclosuresModal() {
                    document.getElementById('enclosures-modal').style.display = 'none';
                }

                function saveEnclosures() {
                    const selected = [];
                    document.querySelectorAll('.enclosure-cb:checked').forEach(cb => selected.push(cb.value));
                    
                    const otherInput = document.getElementById('other-enclosure-input').value;
                    if (otherInput.trim() !== '') {
                        otherInput.split(',').forEach(val => {
                            if (val.trim() !== '') selected.push(val.trim());
                        });
                    }

                    const displayArea = document.getElementById('enclosures-display-area');
                    displayArea.innerHTML = '';

                    if (selected.length === 0) {
                        displayArea.innerHTML = '<span id="no-enclosures-text">No Enclosures found</span>';
                    } else {
                        selected.forEach(enc => {
                            const badge = document.createElement('span');
                            badge.textContent = enc;
                            badge.style.cssText = 'background: #e0f2fe; color: #0284c7; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; border: 1px solid #bae6fd;';
                            displayArea.appendChild(badge);
                        });
                    }
                    closeEnclosuresModal();
                }

                function addPickupProductRow() {
                    const container = document.getElementById('pickup-products-list');
                    const rowId = 'prod-row-' + Date.now();
                    
                    const rowHtml = `
                        <div id="${rowId}" class="pickup-box" style="display: flex; gap: 10px; align-items: center; padding: 10px;">
                            <div style="flex: 2;">
                                <label class="pickup-label">Product Name</label>
                                <input type="text" class="pickup-input" list="work-type-options" placeholder="Select or type product...">
                            </div>
                            <div style="flex: 1;">
                                <label class="pickup-label">Quantity</label>
                                <input type="number" class="pickup-input" value="1" min="1">
                            </div>
                            <div style="flex: 1;">
                                <label class="pickup-label">Tooth/Shade Notes</label>
                                <input type="text" class="pickup-input" placeholder="e.g. 11,12 / A2">
                            </div>
                            <div style="margin-top: 15px;">
                                <button type="button" class="pickup-btn-small" style="color: #dc2626;" onclick="document.getElementById('${rowId}').remove()"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `;
            sections.forEach(s => {
                const el = document.getElementById(s);
                if (el) el.style.display = 'none';
            });

            const btnNewOrder = document.getElementById('btn-new-order');
            const btnNewPickup = document.getElementById('btn-new-pickup');

            if (sectionId === 'pickup-search' || sectionId === 'do-pickups' || sectionId === 'create-orders') {
                document.getElementById('section-pickups').style.display = 'block';
                document.getElementById('page-title').textContent = sectionId === 'pickup-search' ? 'Search Pickup Requests' :
                    sectionId === 'do-pickups' ? 'Do Pickups' : 'Create Orders';
                btnNewOrder.style.display = 'none';
                btnNewPickup.style.display = 'block';
                loadPickups();
            } else if (sectionId === 'new-pickup') {
                document.getElementById('section-new-pickup').style.display = 'block';
                document.getElementById('page-title').textContent = 'New Pickup Request';
            } else if (sectionId === 'section-overview') {
                document.getElementById('section-overview').style.display = 'block';
                loadOverviewStats();
            } else if (sectionId === 'section-calendar') {
                document.getElementById('section-calendar').style.display = 'block';
                document.getElementById('page-title').textContent = 'Calendar';
                btnNewOrder.style.display = 'none';
                btnNewPickup.style.display = 'none';
                renderCalendar();
            } else if (sectionId === 'section-client-detail') {
                document.getElementById('section-client-detail').style.display = 'block';
            } else if (sectionId === 'section-edit-order') {
                document.getElementById('section-edit-order').style.display = 'block';
            } else {
                document.getElementById('section-orders').style.display = 'block';
                document.getElementById('page-title').textContent = 'Search';
                btnNewOrder.style.display = 'block';
                btnNewPickup.style.display = 'none';
            }

            // Update sidebar active state
            document.querySelectorAll('.sidebar-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(sectionId)) {
                    link.classList.add('active');
                }
            });
        }

        async function loadPickups() {
            const search = document.getElementById('pickup-search-input').value;
            const status = document.getElementById('pickup-filter-status').value;
            const clientId = document.getElementById('pickup-filter-client').value;

            try {
                let url = `${API_BASE}/pickups?`;
                if (status && status !== 'Ignore') url += `status=${status}&`;
                if (search) url += `search=${encodeURIComponent(search)}&`;
                if (clientId) url += `clientId=${clientId}&`;

                const response = await fetch(url);
                const pickups = await response.json();

                const tbody = document.querySelector('#pickups-table tbody');
                tbody.innerHTML = '';

                if (pickups.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:#666;">No pickup requests found.</td></tr>';
                    return;
                }

                pickups.forEach((pickup, idx) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td style="padding:10px; border-bottom:1px solid #f3f4f6;">${idx + 1}</td>
                        <td style="padding:10px; border-bottom:1px solid #f3f4f6;">P-${pickup.id}</td>
                        <td style="padding:10px; border-bottom:1px solid #f3f4f6;">${pickup.client ? pickup.client.name : 'Unknown'}</td>
                        <td style="padding:10px; border-bottom:1px solid #f3f4f6;">${pickup.patientName || ''}</td>
                        <td style="padding:10px; border-bottom:1px solid #f3f4f6;">${new Date(pickup.createdAt).toLocaleDateString('en-GB')}</td>
                        <td style="padding:10px; border-bottom:1px solid #f3f4f6;">-</td>
                        <td style="padding:10px; border-bottom:1px solid #f3f4f6;"><span style="color:${pickup.status === 'Pending' ? '#f59e0b' : '#10b981'};">${pickup.status}</span></td>
                        <td style="padding:10px; border-bottom:1px solid #f3f4f6;">
                            <button class="btn-toolbar" onclick="deletePickup(${pickup.id})"><i class="fas fa-trash"></i></button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            } catch (error) { console.error(error); }
        }

        async function savePickupRequest() {
            const clientId = document.getElementById('new-pickup-client').value;
            const patientName = document.getElementById('new-pickup-patient').value;
            const productType = document.getElementById('new-pickup-type').value;

            if (!clientId) { alert('Please select a client'); return; }

            const data = { clientId, patientName, productType, status: 'Pending' };

            try {
                const res = await fetch(`${API_BASE}/pickups`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (res.ok) {
                    alert('Pickup request saved!');
                    showSection('pickup-search');
                }
            } catch (err) { console.error(err); }
        }

        let currentOverviewCriteria = 'Current Status';

        function setOverviewCriteria(criteria) {
            currentOverviewCriteria = criteria;
            document.getElementById('overview-current-criteria-label').textContent = criteria;

            // Update active button
            document.querySelectorAll('.overview-criteria-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent === criteria) btn.classList.add('active');
            });

            loadOverviewStats();
        }

        async function loadOverviewStats() {
            const date = document.getElementById('overview-date-picker').value;
            const url = `${API_BASE}/overview/stats?date=${date}&criteria=${encodeURIComponent(currentOverviewCriteria)}`;

            try {
                const res = await fetch(url);
                const stats = await res.json();

                const statuses = ['New', 'In Production', 'Complete', 'Delivered', 'On Hold', 'Try In', 'Cancelled'];
                statuses.forEach(s => {
                    const id = `ov-${s.replace(' ', '')}`;
                    const el = document.getElementById(id);
                    if (el) el.textContent = stats[s] || 0;
                });
            } catch (err) { console.error(err); }
        }

        let currentCalMonth = new Date().getMonth();
        let currentCalYear = new Date().getFullYear();

        function changeCalendarMonth(delta) {
            currentCalMonth += delta;
            if (currentCalMonth < 0) { currentCalMonth = 11; currentCalYear--; }
            if (currentCalMonth > 11) { currentCalMonth = 0; currentCalYear++; }
            renderCalendar();
        }

        function refreshCalendar() { renderCalendar(); }

        async function renderCalendar() {
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            document.getElementById('calendar-month-year').textContent = `${monthNames[currentCalMonth]}, ${currentCalYear}`;

            const criteria = document.querySelector('input[name="cal-criteria"]:checked').value;
            const display = document.querySelector('input[name="cal-display"]:checked').value;

            // Fetch stats from backend
            let stats = {};
            try {
                const res = await fetch(`${API_BASE}/calendar/stats?month=${currentCalMonth}&year=${currentCalYear}&criteria=${encodeURIComponent(criteria)}`);
                stats = await res.json();
            } catch (err) { console.error(err); }

            const firstDay = new Date(currentCalYear, currentCalMonth, 1).getDay();
            const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();

            const tbody = document.getElementById('calendar-body');
            tbody.innerHTML = '';

            let date = 1;
            for (let i = 0; i < 6; i++) {
                const row = document.createElement('tr');
                for (let j = 0; j < 7; j++) {
                    const cell = document.createElement('td');
                    cell.style.border = '1px solid #ddd';
                    cell.style.height = '100px';
                    cell.style.verticalAlign = 'top';
                    cell.style.padding = '5px';
                    cell.style.width = '14.28%';

                    if (i === 0 && j < firstDay) {
                        // Empty cell
                    } else if (date > daysInMonth) {
                        // Empty cell
                    } else {
                        const dayDate = date;
                        const dateKey = `${currentCalYear}-${String(currentCalMonth + 1).padStart(2, '0')}-${String(dayDate).padStart(2, '0')}`;

                        cell.innerHTML = `<div style="font-weight:700; margin-bottom:5px;">${dayDate}</div>`;
                        cell.style.cursor = 'pointer';
                        cell.onclick = () => openCalendarDayModal(dateKey);

                        // Add badges if stats exist
                        if (stats[dateKey]) {
                            const dayStats = stats[dateKey];
                            const badgeContainer = document.createElement('div');
                            badgeContainer.style.display = 'flex';
                            badgeContainer.style.flexWrap = 'wrap';
                            badgeContainer.style.gap = '2px';

                            if (display === 'All Status' || display === 'Total Orders') {
                                Object.keys(dayStats).forEach(status => {
                                    if (status === 'Total' && display !== 'Total Orders') return;
                                    if (status !== 'Total' && display === 'Total Orders') return;

                                    const badge = document.createElement('span');
                                    badge.textContent = dayStats[status];
                                    badge.style.padding = '1px 4px';
                                    badge.style.fontSize = '10px';
                                    badge.style.color = '#fff';
                                    badge.style.borderRadius = '2px';
                                    badge.style.background = getStatusColor(status);
                                    if (status === 'Total') badge.style.background = '#374151';
                                    badgeContainer.appendChild(badge);
                                });
                            } else {
                                if (dayStats[display]) {
                                    const badge = document.createElement('span');
                                    badge.textContent = dayStats[display];
                                    badge.style.padding = '1px 4px';
                                    badge.style.fontSize = '10px';
                                    badge.style.color = '#fff';
                                    badge.style.borderRadius = '2px';
                                    badge.style.background = getStatusColor(display);
                                    badgeContainer.appendChild(badge);
                                }
                            }
                            cell.appendChild(badgeContainer);
                        }
                        date++;
                    }
                    row.appendChild(cell);
                }
                tbody.appendChild(row);
                if (date > daysInMonth) break;
            }
        }

        async function openCalendarDayModal(dateKey) {
            const criteria = document.querySelector('input[name="cal-criteria"]:checked').value;
            document.getElementById('calendar-day-title').textContent = `Orders for ${dateKey} (Criteria: ${criteria})`;

            try {
                const res = await fetch(`${API_BASE}/calendar/orders?date=${dateKey}&criteria=${encodeURIComponent(criteria)}`);
                const orders = await res.json();

                const tbody = document.getElementById('calendar-day-body');
                tbody.innerHTML = '';

                if (orders.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">No orders found for this day.</td></tr>';
                } else {
                    orders.forEach(o => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td style="padding:8px; border:1px solid #ddd;">${o.id}</td>
                            <td style="padding:8px; border:1px solid #ddd;"><a href="shipments.html?clientId=${o.clientId}" style="color:#3b82f6; text-decoration:none;">${o.client ? o.client.name : ''}</a></td>
                            <td style="padding:8px; border:1px solid #ddd;">${o.patientName}</td>
                            <td style="padding:8px; border:1px solid #ddd;">${o.status}</td>
                        `;
                        tbody.appendChild(row);
                    });
                }
                document.getElementById('calendar-day-modal').style.display = 'flex';
            } catch (err) { console.error(err); }
        }

        function closeCalendarDayModal() {
            document.getElementById('calendar-day-modal').style.display = 'none';
        }

        function emailClient() {
            if (currentClientEmail) {
                window.location.href = `mailto:${currentClientEmail}?subject=Price List&body=Dear Client, Please find the price list attached.`;
            } else {
                alert("Client email not found.");
            }
        }

        async function searchLocation(targetId) {
            const clientId = document.getElementById('new-pickup-client').value;
            if (!clientId) {
                alert('Please select a client first.');
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/clients/${clientId}`);
                if (res.ok) {
                    const client = await res.json();
                    document.getElementById(targetId).value = client.address || 'No address found for this client.';
                } else {
                    alert('Could not fetch client address.');
                }
            } catch (err) {
                console.error(err);
                alert('Error connecting to server.');
            }
        }

        function addLocation(targetId) {
            const address = prompt('Enter manual address:');
            if (address) {
                document.getElementById(targetId).value = address;
            }
        }

        async function addStaffQuick() {
            const name = prompt('Enter new staff name:');
            if (!name) return;
            try {
                const res = await fetch(`${API_BASE}/staff`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name, role: 'Delivery' })
                });
                if (res.ok) {
                    alert('Staff added successfully.');
                    // Refresh staff dropdowns
                    if (typeof loadStaffForAssign === 'function') {
                        loadStaffForAssign();
                    }
                } else {
                    alert('Error adding staff.');
                }
            } catch (err) {
                console.error(err);
                alert('Connection error.');
            }
        }

        async function saveFullPickupRequest() {
            const clientId = document.getElementById('new-pickup-client').value;
            const staffId = document.getElementById('new-pickup-staff').value;
            const patientName = document.querySelector('.pickup-input[value="11/06/26"]').parentElement.parentElement.querySelector('input').value; // Selecting via sibling
            
            // Collect all products
            const products = [];
            document.querySelectorAll('#pickup-products-list .pickup-row').forEach(row => {
                const type = row.querySelector('select').value;
                const name = row.querySelector('input').value;
                if (type || name) products.push(`${type}: ${name}`);
            });

            // Collect notes and locations
            const pickupLoc = document.getElementById('pickup-location-input').value;
            const dropLoc = document.getElementById('drop-location-input').value;
            
            const enclosures = [];
            document.querySelectorAll('.enclosure-cb:checked').forEach(cb => enclosures.push(cb.value));

            const fullNotes = `
Pickup Location: ${pickupLoc}
Drop Location: ${dropLoc}
Enclosures: ${enclosures.join(', ')}
Products: ${products.join(' | ')}
            `.trim();

            const body = {
                clientId: parseInt(clientId),
                staffId: staffId ? parseInt(staffId) : null,
                patientName: patientName,
                productType: products[0] || 'Pickup',
                status: 'Pending',
                notes: fullNotes
            };

            if (!clientId) {
                alert('Please select a client.');
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/pickups`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (res.ok) {
                    alert('Pickup request saved successfully!');
                    showSection('section-orders');
                    loadPickups();
                } else {
                    const err = await res.json();
                    alert('Error saving pickup: ' + (err.error || 'Unknown error'));
                }
            } catch (err) {
                console.error(err);
                alert('Network error.');
            }
        }

        async function deletePickup(id) {
            if (!confirm('Are you sure you want to delete this pickup request?')) return;
            try {
                const res = await fetch(`${API_BASE}/pickups/${id}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    alert('Pickup request deleted successfully.');
                    loadPickups();
                } else {
                    const err = await res.json();
                    alert('Error deleting pickup: ' + (err.error || 'Unknown error'));
                }
            } catch (err) {
                console.error(err);
                alert('Network error while deleting pickup.');
            }
        }

        async function loadOrders(statusParam = null, title = null, advParams = '') {
            if (title) document.getElementById('page-title').textContent = title;
            showSection('section-orders');

            const search = document.getElementById('order-search-input').value;
            const clientSearch = document.getElementById('filter-client').value;
            const status = statusParam || document.getElementById('filter-status').value;

            const dateFrom = document.getElementById('date-from') ? document.getElementById('date-from').value : '';
            const dateTo = document.getElementById('date-to') ? document.getElementById('date-to').value : '';
            const searchDateField = document.getElementById('search-date-field') ? document.getElementById('search-date-field').value : (gridSettings ? gridSettings.options.defaultDateSearch : 'Order Date');
            
            let dateFieldStr = 'receivedDate';
            if (searchDateField === 'Due Date') dateFieldStr = 'dueDate';
            else if (searchDateField === 'Status Date') dateFieldStr = 'updatedAt';

            try {
                let url = `${API_BASE}/orders?`;
                if (status && status !== 'all' && status !== 'Ignore') url += `status=${encodeURIComponent(status)}&`;
                if (search) url += `search=${encodeURIComponent(search)}&`;
                if (clientSearch) url += `clientSearch=${encodeURIComponent(clientSearch)}&`;
                if (dateFrom) url += `dateFrom=${encodeURIComponent(dateFrom)}&`;
                if (dateTo) url += `dateTo=${encodeURIComponent(dateTo)}&`;
                url += `dateField=${dateFieldStr}&`;
                if (advParams) url += advParams;

                const response = await fetch(url);
                if (!response.ok) throw new Error('API Response Error');
                let orders = await response.json();

                // Sort client-side
                if (gridSettings && gridSettings.options) {
                    sortOrders(
                        orders,
                        gridSettings.options.sortColumn1,
                        gridSettings.options.sortDirection1,
                        gridSettings.options.sortColumn2,
                        gridSettings.options.sortDirection2
                    );
                }

                const tbody = document.querySelector('#orders-table tbody');
                tbody.innerHTML = '';

                const thead = document.querySelector('#orders-table thead tr');

                let extraHeaders = '';
                if (status === 'On Hold') {
                    extraHeaders = '<th>On Hold From</th><th>Hold Reason</th>';
                } else if (status === 'Cancelled') {
                    extraHeaders = '<th>Cancelled On</th><th>Cancelled Reason</th>';
                }

                let theadHTML = `<th style="width:30px;"><input type="checkbox" onclick="toggleSelectAll(this)"></th>`;
                theadHTML += `<th>#</th>`;

                if (gridSettings && gridSettings.columns) {
                    gridSettings.columns.forEach(col => {
                        theadHTML += `<th>${col.caption}</th>`;
                    });
                } else {
                    theadHTML += `<th>Order #</th><th>Order Date</th><th>Client</th><th>Patient</th><th>Products</th><th>Model #</th><th>Status</th><th>Due Date</th><th>Invoice #</th><th>Amount</th>`;
                }

                theadHTML += extraHeaders;
                theadHTML += `<th>Actions</th>`;
                thead.innerHTML = theadHTML;

                if (orders.length === 0) {
                    const colCount = (gridSettings ? gridSettings.columns.length : 8) + 3 + (extraHeaders !== '' ? 2 : 0);
                    tbody.innerHTML = `<tr><td colspan="${colCount}" style="text-align:center; padding:20px; color:#666;">No orders found.</td></tr>`;
                    return;
                }

                orders.forEach((order, idx) => {
                    const row = document.createElement('tr');
                    row.dataset.orderId = order.id;
                    const statusColor = getStatusColor(order.status);
                    
                    if (['On Hold', 'New', 'Try In', 'Cancelled'].includes(order.status)) {
                        row.style.backgroundColor = statusColor + '15';
                    }

                    let extraCols = '';
                    if (status === 'On Hold') {
                        extraCols = `
                            <td style="font-weight: 500;">${order.holdFrom ? new Date(order.holdFrom).toLocaleDateString('en-GB') : '-'}</td>
                            <td style="font-weight: 500;">${order.holdReason || '-'}</td>
                        `;
                    } else if (status === 'Cancelled') {
                        extraCols = `
                            <td style="font-weight: 500;">${order.cancelledOn ? new Date(order.cancelledOn).toLocaleDateString('en-GB') : '-'}</td>
                            <td style="font-weight: 500;">${order.cancelledReason || '-'}</td>
                        `;
                    }

                    let rowHTML = `<td><input type="checkbox" class="order-checkbox" data-id="${order.id}"></td>`;
                    rowHTML += `<td>${idx + 1}</td>`;

                    const cols = gridSettings ? gridSettings.columns : DEFAULT_GRID_SETTINGS.columns;
                    cols.forEach(col => {
                        switch (col.key) {
                            case 'orderNo':
                                rowHTML += `<td><a href="javascript:void(0)" onclick="openEditModal(${order.id})" style="color:#3b82f6; text-decoration:none; font-weight:700;">${order.orderNumber || order.id}</a></td>`;
                                break;
                            case 'orderDate':
                                rowHTML += `<td>${new Date(order.receivedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>`;
                                break;
                            case 'client':
                                rowHTML += `<td><a href="shipments.html?clientId=${order.clientId}" style="color:#3b82f6; text-decoration:none; font-weight:600;">${order.client ? order.client.name : ''}</a></td>`;
                                break;
                            case 'patientName':
                                rowHTML += `<td>${order.patientName || '-'}</td>`;
                                break;
                            case 'products':
                                let displayProducts = '';
                                if (order.jobs && order.jobs.length > 0) {
                                    displayProducts = [...new Set(order.jobs.map(j => j.productName || j.productType).filter(Boolean))].join(', ');
                                } else {
                                    displayProducts = order.productName || order.productType || '-';
                                }
                                rowHTML += `<td style="color: ${getProductColor(order.productType)}; font-weight: 600;">${displayProducts}</td>`;
                                break;
                            case 'modelNo':
                                rowHTML += `<td style="font-weight: 500;">${order.modelNumber || '-'}</td>`;
                                break;
                            case 'status':
                                rowHTML += `<td style="font-weight: 600; color: ${statusColor};"><span style="display:inline-block; width:10px; height:10px; background:${statusColor}; border-radius:2px; margin-right:5px;"></span>${order.status}</td>`;
                                break;
                            case 'dueDate':
                                rowHTML += `<td style="color: ${order.status === 'overdue' ? '#ef4444' : '#374151'}; font-weight: 500;">${order.dueDate ? new Date(order.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''}</td>`;
                                break;
                            case 'receivedDate':
                                rowHTML += `<td>${order.receivedDate ? new Date(order.receivedDate).toLocaleDateString('en-GB') : '-'}</td>`;
                                break;
                            case 'assignTo':
                                rowHTML += `<td>${order.assignTo || '-'}</td>`;
                                break;
                            case 'department':
                                rowHTML += `<td>${order.department || '-'}</td>`;
                                break;
                            case 'deliveryMethod':
                                rowHTML += `<td>${order.deliveryMethod || '-'}</td>`;
                                break;
                            case 'invoiceNo':
                                rowHTML += `<td>${order.invoice ? (order.invoice.invoiceNumber || order.invoice.id) : '-'}</td>`;
                                break;
                            case 'amount':
                                rowHTML += `<td>OMR ${(order.totalAmount || 0).toFixed(3)}</td>`;
                                break;
                        }
                    });

                    rowHTML += extraCols;
                    rowHTML += `
                        <td>
                            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                                <a href="javascript:void(0)" onclick="openEditModal(${order.id})" style="color:#3b82f6; text-decoration:none; font-size:12px; font-weight:600; padding:3px 8px; border:1px solid #3b82f6; border-radius:4px; white-space:nowrap;" title="Quick View"><i class="fas fa-eye" style="margin-right:3px;"></i>Quick View</a>
                                <a href="javascript:void(0)" onclick="sendWhatsApp(${order.id})" style="color:#25D366; text-decoration:none; font-size:12px; font-weight:600; padding:3px 8px; border:1px solid #25D366; border-radius:4px; white-space:nowrap;" title="WhatsApp"><i class="fab fa-whatsapp" style="margin-right:3px;"></i>WhatsApp</a>
                            </div>
                        </td>
                    `;
                    row.innerHTML = rowHTML;
                    tbody.appendChild(row);
                });
            } catch (error) {
                console.error('Fetch error:', error);
            }
        }

        function getStatusColor(status) {
            const colors = {
                'New': '#3b82f6',
                'In Production': '#8b5cf6',
                'Complete': '#10b981',
                'On Hold': '#f59e0b',
                'Cancelled': '#ef4444',
                'Try In': '#ec4899',
                'Delivered': '#1e3a8a',
                'Repeat': '#6b7280',
                'Repair': '#6b7280'
            };
            return colors[status] || '#9ca3af';
        }

        function getProductColor(type) {
            const t = (type || '').toUpperCase();
            if (t.includes('SPECIAL TRAY')) return '#ec4899'; // Pink
            if (t.includes('REPAIR')) return '#10b981'; // Green
            return '#2563eb'; // Blue default
        }

        async function shipOrder(orderId, clientId) {
            if (!confirm('Are you sure you want to ship this order?')) return;
            try {
                const res = await fetch(`${API_BASE}/shipment-notes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderIds: [orderId],
                        clientId: clientId,
                        noteDate: new Date().toISOString()
                    })
                });
                if (res.ok) {
                    alert('Order marked as Shipped/Delivered!');
                    // After shipment, update order status to Delivered
                    await fetch(`${API_BASE}/orders/${orderId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'Delivered' })
                    });
                    openClientDetail(clientId); // Refresh view
                }
            } catch (err) { console.error(err); }
        }

        async function generateInvoice(orderId, clientId) {
            try {
                const res = await fetch(`${API_BASE}/invoices`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderIds: [orderId],
                        clientId: clientId
                    })
                });
                if (res.ok) {
                    const invoice = await res.json();
                    alert('Invoice generated successfully!');
                    window.open(`invoice.html?id=${invoice.id}`, '_blank');
                    openClientDetail(clientId); // Refresh view
                } else {
                    const data = await res.json();
                    alert('Error: ' + data.error);
                }
            } catch (err) { console.error(err); }
        }

        async function generateShipment(orderId, clientId) {
            try {
                const res = await fetch(`${API_BASE}/shipment-notes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderIds: [orderId],
                        clientId: clientId,
                        noteNumber: 'DN-' + Date.now().toString().slice(-6),
                        deliveryMode: 'Courier',
                        notes: '',
                        noteDate: new Date().toISOString()
                    })
                });
                if (res.ok) {
                    const note = await res.json();
                    alert('Shipment Note generated successfully!');
                    window.open(`delivery_note.html?id=${note.id}`, '_blank');
                    if (typeof openClientDetail === 'function' && document.getElementById('client-details-overlay') && document.getElementById('client-details-overlay').style.display === 'block') {
                        openClientDetail(clientId);
                    } else {
                        loadOrders();
                    }
                } else {
                    const data = await res.json();
                    alert('Error: ' + data.error);
                }
            } catch (err) { console.error(err); }
        }

        function viewOrderInvoice(id) {
            window.open(`invoice.html?id=${id}&type=order`, '_blank');
        }

        function showEditTab(tabName) {
            console.log("Switching edit tab to:", tabName);
            const detail = document.getElementById('eo-tab-detail-content');
            const images = document.getElementById('eo-tab-images-content');
            const log = document.getElementById('eo-tab-log-content');

            if (detail) detail.style.display = 'none';
            if (images) images.style.display = 'none';
            if (log) log.style.display = 'none';

            const btnD = document.getElementById('eo-btn-detail');
            const btnI = document.getElementById('eo-btn-images');
            const btnL = document.getElementById('eo-btn-log');

            [btnD, btnI, btnL].forEach(b => {
                if (b) {
                    b.classList.remove('active');
                    b.style.background = '#e5e7eb';
                    b.style.color = '#333';
                    b.style.fontWeight = 'normal';
                }
            });

            const target = document.getElementById('eo-tab-' + tabName + '-content');
            const targetBtn = document.getElementById('eo-btn-' + tabName);

            if (target) target.style.display = 'block';
            if (targetBtn) {
                targetBtn.classList.add('active');
                targetBtn.style.background = '#fff';
                targetBtn.style.color = '#ec4899';
                targetBtn.style.fontWeight = '700';
            }
        }

        async function saveAndPrintOrderEdit() {
            await saveOrderEdit(true); // pass flag or just print after
        }

        async function saveOrderEdit(printAfter = false) {
            console.log("saveOrderEdit clicked!");
            alert("Save processing started! Please wait...");
            const id = document.getElementById('eo-id').value;
            const selectedTeethElements = document.querySelectorAll('.tooth-num.selected');
            const selectedTeeth = Array.from(selectedTeethElements).map(el => el.getAttribute('data-tooth')).sort();

            const customUnitContainer = document.getElementById('eo-custom-unit-text-container');
            let customTeethText = '';
            if (customUnitContainer && customUnitContainer.style.display === 'block') {
                customTeethText = document.getElementById('eo-custom-unit-text').value;
            }

            const eoProdName = document.getElementById('eo-prod-name').textContent.trim();
            const isSlabsVisible = document.getElementById('eo-slabs-container') && document.getElementById('eo-slabs-container').style.display === 'block';
            const unitsVal = parseInt(document.getElementById('eo-units').value) || 1;

            if (eoProdName && eoProdName !== 'PRODUCT') {
                const job = {
                    productName: eoProdName,
                    productType: document.getElementById('eo-prod-name').dataset.type || 'General',
                    teethSelection: customTeethText ? customTeethText : selectedTeeth.join(', '),
                    units: unitsVal,
                    price: parseFloat(document.getElementById('eo-rate').value) || 0,
                    totalAmount: parseFloat(document.getElementById('eo-total-charge-text').textContent) || 0,
                    slab1Rate: isSlabsVisible ? parseFloat(document.getElementById('eo-slab1-rate').value) : null,
                    slab2Rate: isSlabsVisible ? parseFloat(document.getElementById('eo-slab2-rate').value) : null,
                    slab1Units: isSlabsVisible ? Math.min(unitsVal, 1) : null,
                    slab2Units: isSlabsVisible ? Math.max(0, unitsVal - 1) : null
                };
                
                if (window.editingJobIndex >= 0) {
                    window.editOrderJobs[window.editingJobIndex] = job;
                } else {
                    window.editOrderJobs.push(job);
                }
                window.editingJobIndex = -1;
                clearActiveEditFields();
            }

            let grandTotal = 0;
            if (window.editOrderJobs && window.editOrderJobs.length > 0) {
                window.editOrderJobs.forEach(j => {
                    grandTotal += parseFloat(j.totalAmount) || 0;
                });
            }

            const shades = {
                main: document.getElementById('eo-shade-main') ? document.getElementById('eo-shade-main').value : '',
                s1: document.getElementById('eo-shade-1') ? document.getElementById('eo-shade-1').value : '',
                s2: document.getElementById('eo-shade-2') ? document.getElementById('eo-shade-2').value : '',
                s3: document.getElementById('eo-shade-3') ? document.getElementById('eo-shade-3').value : '',
                notes: document.getElementById('eo-shade-notes') ? document.getElementById('eo-shade-notes').value : ''
            };

            const data = {
                patientName: document.getElementById('eo-patient-name').value,
                totalAmount: grandTotal || parseFloat(document.getElementById('eo-total').value) || 0,
                price: grandTotal || parseFloat(document.getElementById('eo-total').value) || 0,
                modelNumber: document.getElementById('eo-model').value,
                receivedDate: document.getElementById('eo-date').value,
                dueDate: document.getElementById('eo-due').value,
                doctorName: document.getElementById('eo-sub-doctor') ? document.getElementById('eo-sub-doctor').value : null,
                teethSelection: customTeethText ? customTeethText : selectedTeeth.join(', '),
                deliveryMethod: document.getElementById('eo-delivery-method') ? document.getElementById('eo-delivery-method').value : null,
                assignTo: document.getElementById('eo-assign-to') ? document.getElementById('eo-assign-to').value : null,
                department: document.getElementById('eo-department') ? document.getElementById('eo-department').value : null,
                dropLocation: document.getElementById('eo-drop-location') ? document.getElementById('eo-drop-location').value : null,
                productName: eoProdName,
                productType: document.getElementById('eo-prod-name').dataset.type || 'General',
                unitRate: parseFloat(document.getElementById('eo-rate').value) || 0,
                units: unitsVal,
                status: document.getElementById('eo-status-select').value,
                holdReason: document.getElementById('eo-status-select').value === 'On Hold' ? (document.getElementById('eo-hold-reason') ? document.getElementById('eo-hold-reason').value : null) : null,
                holdFrom: document.getElementById('eo-status-select').value === 'On Hold' ? new Date().toISOString() : null,
                shades: JSON.stringify(shades),
                slab1Rate: isSlabsVisible ? parseFloat(document.getElementById('eo-slab1-rate').value) : null,
                slab2Rate: isSlabsVisible ? parseFloat(document.getElementById('eo-slab2-rate').value) : null,
                slab1Units: isSlabsVisible ? Math.min(unitsVal, 1) : null,
                slab2Units: isSlabsVisible ? Math.max(0, unitsVal - 1) : null,
                jobs: window.editOrderJobs
            };

            try {
                const res = await fetch(`${API_BASE}/orders/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (res.ok) {
                    // Handle image uploads
                    const fileInput = document.getElementById('eo-image-input');
                    if (fileInput && fileInput.files.length > 0) {
                        const formData = new FormData();
                        for (let i = 0; i < fileInput.files.length; i++) {
                            formData.append('files', fileInput.files[i]);
                        }
                        try {
                            await fetch(`${API_BASE}/orders/${id}/images`, {
                                method: 'POST',
                                body: formData
                            });
                        } catch (uErr) { console.error("Upload failed", uErr); }
                    }

                    if (printAfter) {
                        window.print();
                    } else {
                        alert('Order updated successfully!');
                    }
                    showSection('section-orders');
                    loadOrders();
                } else {
                    const errBody = await res.json();
                    alert('Failed to update order: ' + JSON.stringify(errBody));
                }
            } catch (err) {
                console.error(err);
                alert('Network or server error: ' + err.message);
            }
        };

        async function deleteOrderEdit() {
            const id = document.getElementById('eo-id').value;
            if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;


            try {
                const res = await fetch(`${API_BASE}/orders/${id}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    alert('Order deleted successfully.');
                    showSection('section-orders');
                    loadOrders();
                } else {
                    const err = await res.json();
                    alert('Error deleting order: ' + err.error);
                }
            } catch (err) {
                console.error(err);
                alert('Server error while deleting order.');
            }
        }

        async function sendWhatsApp(id) {
            try {
                const res = await fetch(`${API_BASE}/orders/${id}`);
                if (!res.ok) throw new Error('Order not found');
                const order = await res.json();
                const client = order.client;
                if (!client) {
                    alert('Client not found for this order.');
                    return;
                }
                const phone = client.cellPhone || client.phone;
                if (!phone) {
                    alert('No phone number found for this client.');
                    return;
                }
                
                let cleanPhone = phone.replace(/[^0-9+]/g, '');
                if (!cleanPhone.startsWith('+') && cleanPhone.length <= 8) {
                    cleanPhone = '968' + cleanPhone;
                } else if (cleanPhone.startsWith('+')) {
                    cleanPhone = cleanPhone.substring(1);
                }
                
                const message = encodeURIComponent(`Hello ${client.name}, this is regarding your Order #${order.orderNumber || order.id} for patient ${order.patientName || 'N/A'}.`);
                const url = `https://wa.me/${cleanPhone}?text=${message}`;
                window.open(url, '_blank');
            } catch (err) {
                console.error(err);
                alert('Failed to send WhatsApp message.');
            }
        }

        async function openEditModal(id) {
            showSection('section-edit-order');
            // Reset to detail tab whenever opening modal
            setTimeout(() => showEditTab('detail'), 10);
            try {
                const res = await fetch(`${API_BASE}/orders/${id}`);
                const order = await res.json();

                editOrderJobs = order.jobs || [];
                editingJobIndex = editOrderJobs.length > 0 ? 0 : -1;
                
                if (editOrderJobs.length === 0 && (order.productName || order.productType)) {
                    editOrderJobs.push({
                        productName: order.productName,
                        productType: order.productType || 'General',
                        teethSelection: order.teethSelection || '',
                        units: order.units || 1,
                        price: (order.unitRate !== undefined && order.unitRate !== null) ? order.unitRate : (order.units ? (order.totalAmount / order.units) : 0),
                        totalAmount: order.totalAmount || 0,
                        slab1Rate: order.slab1Rate,
                        slab2Rate: order.slab2Rate,
                        slab1Units: order.slab1Units,
                        slab2Units: order.slab2Units
                    });
                    editingJobIndex = 0;
                }
                
                window.renderEditOrderJobs();

                document.getElementById('eo-id').value = order.id;

                // Helper to format ISO date to YYYY-MM-DD for input[type="date"]
                const fmtDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

                document.getElementById('eo-date').value = fmtDate(order.receivedDate);
                document.getElementById('eo-due').value = fmtDate(order.dueDate);
                document.getElementById('eo-in').value = fmtDate(order.receivedDate);

                document.getElementById('eo-total').value = order.totalAmount || 0;
                document.getElementById('eo-model').value = order.modelNumber || '';

                document.getElementById('eo-cli-name').textContent = order.client ? order.client.name : 'Unknown';
                document.getElementById('eo-priceband').textContent = order.client ? (order.client.priceBand || '-') : '-';
                document.getElementById('eo-cli-balance').textContent = order.client ? (order.client.balance || 0) : 0;
                document.getElementById('eo-inv-num').textContent = order.invoiceId || '-';
                document.getElementById('eo-ship-num').textContent = order.shipmentNote ? order.shipmentNote.noteNumber : (order.shipmentNoteId || '-');

                document.getElementById('eo-prod-name').textContent = order.productName || order.productType || 'PRODUCT';
                document.getElementById('eo-prod-name').dataset.type = order.productType || 'General';
                document.getElementById('eo-rate').value = (order.unitRate !== undefined && order.unitRate !== null) ? order.unitRate : (order.units ? (order.totalAmount / order.units).toFixed(3) : 0);

                const slabsContainer = document.getElementById('eo-slabs-container');
                const slabProducts = ['RPD', 'FLEXIBLE RPD', 'CAST PARTIAL', 'RPD REPAIR AND ADD TEETH'];
                const pName = (order.productName || '').toUpperCase();
                const pType = (order.productType || '').toUpperCase();
                const isSlabProduct = slabProducts.some(sp => pName.includes(sp) || pType.includes(sp));
                const isSpecialRpd = pName === 'RPD' || pName.includes('FLEXIBLE RPD') || pName.includes('PARTIAL RPD');
                if (slabsContainer) {
                    slabsContainer.style.display = isSlabProduct ? 'block' : 'none';
                }
                const customUnitContainer = document.getElementById('eo-custom-unit-text-container');
                if (customUnitContainer) {
                    customUnitContainer.style.display = isSlabProduct ? 'block' : 'none';
                }
                const stdRate = (order.slab1Rate !== null && order.slab1Rate !== undefined) ? order.slab1Rate : (isSpecialRpd ? 17 : (order.units ? (order.totalAmount / order.units) : 17));
                const s1 = document.getElementById('eo-slab1-rate');
                if (s1) s1.value = stdRate;

                const s2 = document.getElementById('eo-slab2-rate');
                if (s2) s2.value = (order.slab2Rate !== null && order.slab2Rate !== undefined) ? order.slab2Rate : 2;
                document.getElementById('eo-total-charge-text').textContent = order.totalAmount || 0;
                document.getElementById('eo-patient-name').value = order.patientName || '';

                const statusDate = order.statusDate || order.updatedAt || order.receivedDate;
                const statusSelect = document.getElementById('eo-status-select');
                statusSelect.value = order.status || 'New';
                document.getElementById('eo-status-text').textContent = `on ${new Date(statusDate).toLocaleDateString('en-GB')}`;
                
                const holdReasonContainer = document.getElementById('eo-hold-reason-container');
                if (holdReasonContainer) {
                    holdReasonContainer.style.display = (order.status === 'On Hold') ? 'block' : 'none';
                }
                const holdReasonInput = document.getElementById('eo-hold-reason');
                if (holdReasonInput) {
                    holdReasonInput.value = order.holdReason || '';
                }
                
                statusSelect.onchange = function() {
                    if (holdReasonContainer) {
                        holdReasonContainer.style.display = (this.value === 'On Hold') ? 'block' : 'none';
                    }
                };

                // Reset teeth UI and select if any
                document.querySelectorAll('.tooth-num').forEach(t => t.classList.remove('selected'));
                if (order.teethSelection) {
                    const teeth = order.teethSelection.split(',').map(t => t.trim());
                    document.querySelectorAll('.tooth-num').forEach(t => {
                        if (teeth.includes(t.getAttribute('data-tooth'))) t.classList.add('selected');
                    });
                }

                if (order.units) document.getElementById('eo-units').value = order.units;
                updateEditOrderCalculation();

                if (order.shades) {
                    const shades = JSON.parse(order.shades);
                    document.getElementById('eo-shade-main').value = shades.main || '';
                    document.getElementById('eo-shade-1').value = shades.s1 || '';
                    document.getElementById('eo-shade-2').value = shades.s2 || '';
                    document.getElementById('eo-shade-3').value = shades.s3 || '';
                    document.getElementById('eo-shade-notes').value = shades.notes || '';
                }

                if (order.doctorName) {
                    const subDoctorSelect = document.getElementById('eo-sub-doctor');
                    if (subDoctorSelect) subDoctorSelect.value = order.doctorName;
                }

                if (order.deliveryMethod) document.getElementById('eo-delivery-method').value = order.deliveryMethod;
                if (order.assignTo) document.getElementById('eo-assign-to').value = order.assignTo;
                if (order.department) document.getElementById('eo-department').value = order.department;
                if (order.dropLocation) document.getElementById('eo-drop-location').value = order.dropLocation;

                // Load and show existing images
                loadOrderImages(id);
            } catch (err) { console.error(err); }
        }

        function toggleToothEdit(el, num) {
            el.classList.toggle('selected');
            const count = document.querySelectorAll('#section-edit-order .tooth-num.selected').length;
            document.getElementById('eo-units').value = count > 0 ? count : 1;
            updateEditOrderCalculation();
        }

        function selectArchEdit(arch) {
            const upper = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'];
            const lower = ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38'];
            let target = [];
            if (arch === 'upper') target = upper;
            else if (arch === 'lower') target = lower;
            else if (arch === 'all') target = [...upper, ...lower];

            document.querySelectorAll('#section-edit-order .tooth-num').forEach(el => {
                if (target.includes(el.getAttribute('data-tooth'))) {
                    el.classList.add('selected');
                }
            });
            const count = document.querySelectorAll('#section-edit-order .tooth-num.selected').length;
            document.getElementById('eo-units').value = count > 0 ? count : 1;
            updateEditOrderCalculation();
        }

        function clearTeethEdit() {
            document.querySelectorAll('#section-edit-order .tooth-num').forEach(el => el.classList.remove('selected'));
            document.getElementById('eo-units').value = 1;
            updateEditOrderCalculation();
        }

        function getGrandTotalEditOrder(activeCharge) {
            let sum = 0;
            if (window.editOrderJobs) {
                window.editOrderJobs.forEach((j, idx) => {
                    if (idx !== window.editingJobIndex) {
                        sum += parseFloat(j.totalAmount !== undefined ? j.totalAmount : j.total) || 0;
                    }
                });
            }
            return sum + activeCharge;
        }

        function updateEditOrderCalculation(fromRateInput = false) {
            const units = parseInt(document.getElementById('eo-units').value) || 0;

            const slabsContainer = document.getElementById('eo-slabs-container');
            const isSlabActive = slabsContainer && slabsContainer.style.display === 'block';

            let total = 0;
            if (isSlabActive && !fromRateInput) {
                const slab1Rate = parseFloat(document.getElementById('eo-slab1-rate').value) || 0;
                const slab2Rate = parseFloat(document.getElementById('eo-slab2-rate').value) || 0;

                let slab1Units = Math.min(units, 1);
                let slab2Units = Math.max(0, units - 1);

                if (document.getElementById('eo-slab1-units-display')) document.getElementById('eo-slab1-units-display').textContent = `${slab1Units} / 1`;
                if (document.getElementById('eo-slab2-units-display')) document.getElementById('eo-slab2-units-display').textContent = slab2Units;

                total = (slab1Units * slab1Rate) + (slab2Units * slab2Rate);
                document.getElementById('eo-rate').value = units > 0 ? (total / units).toFixed(3) : 0;
                
                const slabTotalDisp = document.getElementById('eo-slab-total-display');
                if (slabTotalDisp) slabTotalDisp.textContent = total.toFixed(3);
                
                const rc = document.getElementById('eo-rate-container');
                if (rc) rc.style.display = 'none';
            } else {
                const rate = parseFloat(document.getElementById('eo-rate').value) || 0;
                total = units * rate;
                
                const rc = document.getElementById('eo-rate-container');
                if (rc) rc.style.display = 'flex';
            }

            document.getElementById('eo-total-charge-text').textContent = total.toFixed(3);
            
            const grandTotal = getGrandTotalEditOrder(total);
            document.getElementById('eo-total').value = grandTotal.toFixed(3);
        }

        async function openEditProductModal() {
            try {
                const res = await fetch(`${API_BASE}/products`);
                const products = await res.json();

                const modal = document.createElement('div');
                modal.id = 'edit-product-modal';
                modal.className = 'modal-overlay';
                modal.style.zIndex = '11000';
                modal.innerHTML = `
                    <div class="modal-content" style="width: 600px; padding: 20px; background: #fff; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                            <h3>Select Product</h3>
                            <button onclick="closeEditProductModal()" style="border:none; background:none; font-size:20px; cursor:pointer;">&times;</button>
                        </div>
                        <input type="text" id="edit-prod-search" placeholder="Search products..." style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ddd;">
                        <div style="max-height: 400px; overflow-y: auto;">
                            <table style="width:100%; border-collapse:collapse;">
                                <thead style="background:#f3f4f6;">
                                    <tr><th style="padding:10px; text-align:left; font-weight:700; color:#1e293b;">NAME</th></tr>
                                </thead>
                                <tbody id="edit-prod-list">
                                    ${products.map(p => `
                                        <tr onclick='selectEditProduct(${JSON.stringify(p)})' style="cursor:pointer; border-bottom:1px solid #eee;">
                                            <td style="padding:10px;">${p.name}</td>

                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                document.getElementById('edit-prod-search').oninput = (e) => {
                    const search = e.target.value.toLowerCase();
                    const filtered = products.filter(p => p.name.toLowerCase().includes(search));
                    document.getElementById('edit-prod-list').innerHTML = filtered.map(p => `
                        <tr onclick='selectEditProduct(${JSON.stringify(p)})' style="cursor:pointer; border-bottom:1px solid #eee;">
                            <td style="padding:10px;">${p.name}</td>

                        </tr>
                    `).join('');
                };
            } catch (err) { console.error(err); }
        }

        function closeEditProductModal() {
            const m = document.getElementById('edit-product-modal');
            if (m) m.remove();
        }

        function selectEditProduct(p) {
            document.getElementById('eo-prod-name').textContent = p.name;
            document.getElementById('eo-prod-name').dataset.type = p.type || 'General';
            document.getElementById('eo-rate').value = p.charge;

            const slabsContainer = document.getElementById('eo-slabs-container');
            const slabProducts = ['RPD', 'FLEXIBLE RPD', 'CAST PARTIAL', 'RPD REPAIR AND ADD TEETH'];
            const productName = (p.name || '').toUpperCase();
            const productType = (p.type || '').toUpperCase();
            const isSlabProduct = slabProducts.includes(productName) || (productName.includes('RPD') && productName !== 'AAA');
            const isSpecialRpd = productName === 'RPD' || productName.includes('FLEXIBLE RPD') || productName.includes('PARTIAL RPD');
            if (slabsContainer) {
                slabsContainer.style.display = isSlabProduct ? 'block' : 'none';
            }
            if (isSlabProduct) {
                const s1 = document.getElementById('eo-slab1-rate');
                if (s1) s1.value = p.charge || 0;
                const s2 = document.getElementById('eo-slab2-rate');
                if (s2) s2.value = 2;
            }
            updateEditOrderCalculation();
            closeEditProductModal();
        }

        // Duplicates removed

        async function resumeProduction() {
            const id = document.getElementById('eo-id').value;
            if (!confirm("Resume production for this case?")) return;
            
            try {
                const res = await fetch(`${API_BASE}/orders/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'In Production', holdFrom: null, holdReason: null })
                });
                if (res.ok) {
                    alert("Case resumed!");
                    showSection('section-orders');
                    loadOrders();
                }
            } catch (err) { console.error(err); }
        }

        function customPrompt(title, datalistId = null) {
            return new Promise((resolve) => {
                const overlay = document.createElement('div');
                overlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; display:flex; align-items:center; justify-content:center;";
                
                const modal = document.createElement('div');
                modal.style = "background:#fff; padding:20px; border-radius:8px; width:400px; max-width:90%; font-family:'Inter', sans-serif; box-shadow:0 4px 6px rgba(0,0,0,0.1);";
                
                modal.innerHTML = `
                    <h3 style="margin-top:0; margin-bottom:15px; color:#1f2937; font-size:16px;">${title}</h3>
                    <input type="text" id="custom-prompt-input" ${datalistId ? `list="${datalistId}"` : ''} style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px; margin-bottom:20px; font-size:14px; box-sizing:border-box;">
                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                        <button id="custom-prompt-cancel" style="padding:8px 16px; border:1px solid #ccc; background:#fff; border-radius:4px; cursor:pointer; font-weight:500;">Cancel</button>
                        <button id="custom-prompt-ok" style="padding:8px 16px; border:none; background:#3b82f6; color:#fff; border-radius:4px; cursor:pointer; font-weight:500;">OK</button>
                    </div>
                `;
                overlay.appendChild(modal);
                document.body.appendChild(overlay);

                const input = modal.querySelector('#custom-prompt-input');
                const cancelBtn = modal.querySelector('#custom-prompt-cancel');
                const okBtn = modal.querySelector('#custom-prompt-ok');

                input.focus();

                const cleanup = () => {
                    if (document.body.contains(overlay)) {
                        document.body.removeChild(overlay);
                    }
                };

                cancelBtn.onclick = () => {
                    cleanup();
                    resolve(null);
                };

                okBtn.onclick = () => {
                    cleanup();
                    resolve(input.value);
                };

                input.onkeyup = (e) => {
                    if (e.key === 'Enter') okBtn.onclick();
                    if (e.key === 'Escape') cancelBtn.onclick();
                };
            });
        }

        async function bulkUpdateStatus(newStatus) {
            const selectedIds = Array.from(document.querySelectorAll('#orders-table tbody input[type="checkbox"]:checked'))
                .map(cb => cb.closest('tr').dataset.orderId);

            if (selectedIds.length === 0) {
                alert("Please select at least one order!");
                return;
            }

            let extraData = {};
            if (newStatus === 'On Hold') {
                const reason = await customPrompt("Enter Hold Reason (optional):", "hold-reason-list");
                if (reason === null) return;
                extraData = { holdFrom: new Date().toISOString(), holdReason: reason };
            } else if (newStatus === 'Cancelled') {
                const reason = await customPrompt("Enter Cancelled Reason (optional):");
                if (reason === null) return;
                extraData = { cancelledOn: new Date().toISOString(), cancelledReason: reason };
            } else {
                if (!confirm(`Are you sure you want to mark ${selectedIds.length} orders as ${newStatus}?`)) return;
            }

            try {
                for (const id of selectedIds) {
                    await fetch(`${API_BASE}/orders/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus, ...extraData })
                    });
                }
                alert("Bulk update successful!");
                loadOrders();
            } catch (err) { console.error(err); alert("Error during bulk update."); }
        }

        function toggleSelectAll(master) {
            const checkboxes = document.querySelectorAll('#orders-table tbody input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = master.checked);
        }

        function downloadInvoicePDF(id) {
            window.open(`invoice.html?id=${id}&download=true`, '_blank');
        }

        function exportToCSV() {
            const table = document.getElementById('orders-table');
            let csv = [];
            const rows = table.querySelectorAll('tr');

            for (let i = 0; i < rows.length; i++) {
                const row = [], cols = rows[i].querySelectorAll('td, th');
                for (let j = 1; j < cols.length - 1; j++) {
                    let text = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, " ").replace(/(\s\s)/gm, " ");
                    row.push('"' + text + '"');
                }
                csv.push(row.join(","));
            }

            const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
            const downloadLink = document.createElement("a");
            downloadLink.download = "orders_export.csv";
            downloadLink.href = window.URL.createObjectURL(csvFile);
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
            downloadLink.click();
        }

        function toggleSelectAll(master) {
            const checkboxes = document.querySelectorAll('#orders-table tbody input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = master.checked);
        }


        async function openClientDetail(clientId) {
            if (!clientId) {
                alert("Client ID not found for this order.");
                return;
            }
            showSection('section-client-detail');

            // Clear previous data
            document.getElementById('cd-client-name').textContent = 'Loading...';
            document.getElementById('cd-orders-body').innerHTML = '';
            document.getElementById('cd-shipments-body').innerHTML = '';
            document.getElementById('cd-invoices-body').innerHTML = '';

            try {
                const res = await fetch(`${API_BASE}/clients/${clientId}`);
                if (!res.ok) throw new Error('Client not found');
                const client = await res.json();
                currentClientId = client.id;

                document.getElementById('cd-client-name').textContent = client.name;
                document.getElementById('cd-client-code').textContent = 'CL' + String(client.id).padStart(3, '0');
                document.getElementById('cd-address').textContent = client.address || '...';
                document.getElementById('cd-contact').textContent = client.contactPerson || '...';
                document.getElementById('cd-phone').textContent = client.phone || '...';
                document.getElementById('cd-reg-date').textContent = client.createdAt ? new Date(client.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
                document.getElementById('cd-balance').textContent = client.balance || '0';

                // Populate Orders
                const orders = client.orders || [];
                document.getElementById('cd-orders-body').innerHTML = orders.map(o => `
                    <tr>
                        <td style="padding:10px; border-bottom:1px solid #eee;"><a href="shipments.html?clientId=${clientId}" style="color:#3b82f6; font-weight:700; text-decoration:none;">${o.id}</a></td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${new Date(o.receivedDate).toLocaleDateString()}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${o.productName || o.productType || '...'}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;"><span style="background:#f3f4f6; padding:2px 6px; border-radius:4px;">${o.status}</span></td>
                        <td style="padding:10px; border-bottom:1px solid #eee; color:#10b981; font-weight:700;">${o.shipmentNote ? o.shipmentNote.noteNumber : (o.shipmentNoteId || '-')}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee; font-weight:700;">OMR ${(o.totalAmount || 0).toFixed(3)}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">
                            <div style="display:flex; gap:5px;">
                                <button class="btn-toolbar" title="Edit" onclick="openEditModal(${o.id})" style="background:none; border:1px solid #ddd; padding:4px 8px; cursor:pointer;"><i class="fas fa-edit"></i></button>
                                ${o.status !== 'Delivered' ? `<button class="btn-toolbar" title="Ship" onclick="shipOrder(${o.id}, ${clientId})" style="background:#ec4899; color:#fff; border:none; padding:4px 8px; cursor:pointer;"><i class="fas fa-truck"></i> Ship</button>` : ''}
                                ${o.status === 'Delivered' && !o.invoiceId ? `<button class="btn-toolbar" title="Invoice" onclick="generateInvoice(${o.id}, ${clientId})" style="background:#10b981; color:#fff; border:none; padding:4px 8px; cursor:pointer;"><i class="fas fa-file-invoice"></i> Invoice</button>` : ''}
                            </div>
                        </td>
                    </tr>
                `).join('');

                // Populate Shipments
                const shipments = client.shipmentNotes || [];
                document.getElementById('cd-shipments-body').innerHTML = shipments.map(s => {
                    const shipmentTotal = (s.orders || []).reduce((sum, o) => sum + (o.netAmount || o.totalAmount || 0), 0);
                    return `
                        <tr>
                            <td style="padding:10px; border-bottom:1px solid #eee;">${s.noteNumber || s.id}</td>
                            <td style="padding:10px; border-bottom:1px solid #eee;">${new Date(s.noteDate || s.createdAt).toLocaleDateString()}</td>
                            <td style="padding:10px; border-bottom:1px solid #eee;">OMR ${shipmentTotal.toFixed(3)}</td>
                            <td style="padding:10px; border-bottom:1px solid #eee;">
                                <button class="btn-toolbar" style="background:none; border:none; color:#3b82f6; cursor:pointer;" onclick="window.print()"><i class="fas fa-print"></i></button>
                            </td>
                        </tr>
                    `;
                }).join('');

                // Populate Payments (Receipts)
                const receipts = client.receipts || [];
                document.getElementById('cd-payments-body').innerHTML = receipts.map(r => `
                    <tr>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${new Date(r.receiptDate || r.createdAt).toLocaleDateString()}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${r.receiptNumber || r.id}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${r.paymentMethod || 'Cash'}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee; font-weight:700; color:#10b981;">${(r.amount || 0).toFixed(3)}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${(r.balanceAfter || 0).toFixed(3)}</td>
                    </tr>
                `).join('');

                // Populate Invoices
                const invoices = client.invoices || [];
                document.getElementById('cd-invoices-body').innerHTML = invoices.map(i => `
                    <tr>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${i.invoiceNumber || i.id}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${new Date(i.invoiceDate).toLocaleDateString()}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">OMR ${(i.netAmount || 0).toFixed(3)}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${i.status || 'Unpaid'}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee;">
                            <button class="btn-toolbar" style="background:none; border:none; color:#3b82f6; cursor:pointer;" onclick="window.open('invoice.html?id=${i.id}&print=true', '_blank')"><i class="fas fa-print"></i></button>
                        </td>
                    </tr>
                `).join('');

                if (invoices.length > 0) {
                    const lastInv = invoices[invoices.length - 1];
                    document.getElementById('cd-last-invoice').textContent = lastInv.invoiceNumber || lastInv.id;
                }

            } catch (err) {
                console.error(err);
                document.getElementById('cd-client-name').textContent = 'Error loading client';
            }
        }

        function showCDTab(tabName, btn) {
            document.querySelectorAll('.cd-tab-content').forEach(c => c.style.display = 'none');
            document.querySelectorAll('.profile-tab').forEach(b => b.classList.remove('active'));

            document.getElementById('cd-tab-' + tabName).style.display = 'block';
            btn.classList.add('active');
        }

        document.addEventListener('DOMContentLoaded', async () => {
            const today = new Date().toISOString().split('T')[0];

            const ovDatePicker = document.getElementById('overview-date-picker');
            if (ovDatePicker) ovDatePicker.value = today;

            // Initialize Grid Settings and Date Filter Controls
            initGridSettings();
            renderDateFilterControls();

            await loadClients();
            await loadOrders();

            // Handle deep linking from other pages
            const urlParams = new URLSearchParams(window.location.search);
            const editOrderId = urlParams.get('editOrder');
            const clientId = urlParams.get('clientId');

            if (editOrderId) {
                openEditModal(editOrderId);
            } else if (clientId) {
                openClientDetail(clientId);
            }

            // Image Preview/Selection logic for Edit Order
            const eoInput = document.getElementById('eo-image-input');
            if (eoInput) {
                eoInput.addEventListener('change', function (e) {
                    if (e.target.files.length > 0) {
                        alert(e.target.files.length + " files selected. Click 'Save' to upload.");
                    }
                });
            }

            // Prevent default behavior of sidebar links
            document.querySelectorAll('.sidebar-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    if (link.getAttribute('href') === 'javascript:void(0)' || link.getAttribute('href') === '#') {
                        e.preventDefault();
                    }
                });
            });
        });
        async function openConfirmInvoiceModal() {
            const selectedIds = Array.from(document.querySelectorAll('#orders-table tbody input[type="checkbox"]:checked'))
                .map(cb => cb.closest('tr').dataset.orderId);

            if (selectedIds.length === 0) {
                alert("Please select at least one order to generate invoices!");
                return;
            }

            // Fetch selected orders data
            const orders = [];
            for (const id of selectedIds) {
                const res = await fetch(`${API_BASE}/orders/${id}`);
                const order = await res.json();
                orders.push(order);
            }

            // Group by client
            const clientsMap = {};
            orders.forEach(o => {
                const cid = o.clientId;
                if (!clientsMap[cid]) {
                    clientsMap[cid] = {
                        client: o.client,
                        orders: [],
                        total: 0
                    };
                }
                clientsMap[cid].orders.push(o);
                clientsMap[cid].total += (o.totalAmount || 0);
            });

            const clientList = Object.values(clientsMap);

            // Create modal
            const modal = document.createElement('div');
            modal.id = 'confirm-invoice-modal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content" style="width: 900px; max-width: 95%; background:#fff; border-radius:4px; overflow:hidden;">
                    <div class="modal-header" style="padding:15px; border-bottom:1px solid #ddd; background:#f8f9fa; display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="font-size: 18px; margin: 0; font-weight:700; color:#333;">Confirm invoices to be generated</h2>
                        <button onclick="closeConfirmInvoiceModal()" style="background:none; border:none; font-size:20px; cursor:pointer;">&times;</button>
                    </div>
                    <div style="padding: 20px;">
                        <div style="display: flex; gap: 30px; margin-bottom: 20px;">
                            <div>
                                <label style="display: block; font-size: 11px; color: #666; margin-bottom: 5px;">Tax</label>
                                <select id="invoice-tax-type" style="padding: 4px; border: 1px solid #ccc; font-size: 13px;">
                                    <option value="0">None 0%</option>
                                    <option value="5">GST 5%</option>
                                    <option value="12">GST 12%</option>
                                    <option value="18">GST 18%</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; font-size: 11px; color: #666; margin-bottom: 5px;">Invoice Date</label>
                                <input type="date" id="confirm-invoice-date" value="${new Date().toISOString().split('T')[0]}" style="padding: 4px; border: 1px solid #ccc; width: 130px; font-size: 13px;">
                            </div>
                        </div>
                        
                        <div style="font-size: 13px; display: flex; gap: 15px; margin-bottom: 15px;">
                            <span>View</span>
                            <label><input type="radio" name="inv-view-type" value="headers" checked> Headers</label>
                            <label><input type="radio" name="inv-view-type" value="composite"> Composite</label>
                            <label style="margin-left: 20px;"><input type="checkbox"> View Details</label>
                        </div>
                        
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #ddd;">
                            <thead>
                                <tr style="background: #f3f4f6; text-align: left;">
                                    <th style="padding: 8px; border: 1px solid #ddd; width: 30px;">#</th>
                                    <th style="padding: 8px; border: 1px solid #ddd;">Client</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; width: 80px;">Job Total</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; width: 60px;">Tax</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; width: 80px;">Amount</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; width: 80px;">Pay Terms</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; width: 100px;">Due Date</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; width: 80px;">Orders</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${clientList.map((item, idx) => {
                const payTerms = item.client.paymentTermsDays || 0;
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + payTerms);
                return `
                                    <tr>
                                        <td style="padding: 8px; border: 1px solid #ddd;">${idx + 1}</td>
                                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${item.client.name}</td>
                                        <td style="padding: 8px; border: 1px solid #ddd;">${item.total.toFixed(0)}</td>
                                        <td style="padding: 8px; border: 1px solid #ddd;">0</td>
                                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${item.total.toFixed(0)}</td>
                                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${payTerms} days</td>
                                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${dueDate.toLocaleDateString('en-GB')}</td>
                                        <td style="padding: 8px; border: 1px solid #ddd; color: #3b82f6; display: flex; align-items: center; gap: 5px;">
                                            <i class="far fa-folder-open"></i> ${item.orders.length}
                                        </td>
                                    </tr>
                                `}).join('')}
                            </tbody>
                        </table>
                        
                        <div style="margin-top: 20px; display: flex; gap: 10px;">
                            <button onclick="saveGeneratedInvoices()" style="padding: 8px 25px; background: #fff; border: 1px solid #3b82f6; color: #3b82f6; border-radius: 3px; cursor: pointer; font-weight: 700;">Save Invoice</button>
                            <button onclick="closeConfirmInvoiceModal()" style="padding: 8px 20px; background: #fff; border: 1px solid #ddd; color: #666; border-radius: 3px; cursor: pointer;">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.dataset.orders = JSON.stringify(orders);
        }

        function closeConfirmInvoiceModal() {
            const modal = document.getElementById('confirm-invoice-modal');
            if (modal) modal.remove();
        }

        async function saveGeneratedInvoices() {
            const modal = document.getElementById('confirm-invoice-modal');
            const orders = JSON.parse(modal.dataset.orders);
            const clientsMap = {};

            orders.forEach(o => {
                if (!clientsMap[o.clientId]) clientsMap[o.clientId] = [];
                clientsMap[o.clientId].push(o.id);
            });

            const invoiceDate = document.getElementById('confirm-invoice-date').value;
            const taxPercentage = parseFloat(document.getElementById('invoice-tax-type').value) || 0;

            for (const clientId in clientsMap) {
                const orderIds = clientsMap[clientId];

                // Fetch full order data to compute gross
                const ordersToInvoice = orders.filter(o => o.clientId == clientId);
                const grossAmount = ordersToInvoice.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                const taxAmount = grossAmount * (taxPercentage / 100);
                const netAmount = grossAmount + taxAmount;

                const res = await fetch(`${API_BASE}/invoices`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderIds: orderIds,
                        clientId: parseInt(clientId),
                        invoiceDate: invoiceDate,
                        grossAmount: grossAmount,
                        taxAmount: taxAmount,
                        netAmount: netAmount
                    })
                });
                if (res.ok) {
                    const invoice = await res.json();
                    window.open(`invoice.html?id=${invoice.id}`, '_blank');
                }
            }

            alert('Invoices generated successfully!');
            closeConfirmInvoiceModal();
            loadOrders();
        }
        function createTeethGrid(selection) {
            if (!selection || selection.trim() === "") return 'N/A';
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
                    <div style="display:table;width:180px;table-layout:fixed;margin:0;border-collapse:collapse;">
                        <div style="display:table-row;">
                            <div style="display:table-cell;width:50%;height:20px;vertical-align:middle;white-space:nowrap;padding:2px 0;border-right:1.5px solid #333;border-bottom:1.5px solid #333;text-align:right;">${renderQuadRight(1)}</div>
                            <div style="display:table-cell;width:50%;height:20px;vertical-align:middle;white-space:nowrap;padding:2px 0;border-bottom:1.5px solid #333;text-align:left;">${renderQuadLeft(2)}</div>
                        </div>
                        <div style="display:table-row;">
                            <div style="display:table-cell;width:50%;height:20px;vertical-align:middle;white-space:nowrap;padding:2px 0;border-right:1.5px solid #333;text-align:right;">${renderQuadRight(4)}</div>
                            <div style="display:table-cell;width:50%;height:20px;vertical-align:middle;white-space:nowrap;padding:2px 0;text-align:left;">${renderQuadLeft(3)}</div>
                        </div>
                    </div>
                `;
            } catch (e) {
                return selection;
            }
        }
        ﻿        ﻿        async function bulkPrintOrders(type) {
            const selectedCbs = document.querySelectorAll('.order-checkbox:checked');
            if (selectedCbs.length === 0) {
                alert('Please select at least one order to print.');
                return;
            }

            const selectedIds = Array.from(selectedCbs).map(cb => cb.dataset.id);
            let copies = 1;
            
            if (['Model Label', 'Mailing Labels', 'Dispatch Labels'].includes(type)) {
                let input = prompt(`How many copies of ${type} do you want to print per order?`, "1");
                if (input === null) return;
                copies = parseInt(input, 10);
                if (isNaN(copies) || copies <= 0) copies = 1;
            }

            try {
                const orders = [];
                for (const id of selectedIds) {
                    const res = await fetch(`${API_BASE}/orders/${id}`);
                    if (res.ok) orders.push(await res.json());
                }

                if (type === 'Delivery Note') {
                    let missing = [];
                    orders.forEach(o => {
                        if (o.shipmentNoteId) {
                            window.open(`delivery_note.html?id=${o.shipmentNoteId}&print=true`, '_blank');
                        } else {
                            missing.push(o.id);
                        }
                    });
                    if (missing.length > 0) alert(`Orders without Delivery Note: ${missing.join(', ')}`);
                    return;
                }

                if (type === 'Invoice') {
                    let missing = [];
                    orders.forEach(o => {
                        if (o.invoiceId) {
                            window.open(`invoice.html?id=${o.invoiceId}&print=true`, '_blank');
                        } else {
                            missing.push(o.id);
                        }
                    });
                    if (missing.length > 0) alert(`Orders without Invoice: ${missing.join(', ')}`);
                    return;
                }

                const printWin = window.open('', '', 'width=900,height=600');
                
                let styles = `
                    body { font-family: Arial, Helvetica, sans-serif; padding: 20px; color: #000; margin: 0; }
                    .page-break { page-break-after: always; }
                    .page-break:last-child { page-break-after: avoid; }
                    
                    /* Lab Slip Styles */
                    .lab-slip-container { width: 210mm; margin: 0 auto; padding: 20px; box-sizing: border-box; }
                    .ls-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
                    .ls-lab-name { font-size: 24px; font-weight: bold; margin: 0 0 5px 0; text-transform: uppercase; }
                    .ls-address { font-size: 14px; line-height: 1.4; }
                    .ls-contact { font-size: 14px; line-height: 1.4; text-align: right; }
                    .ls-title { text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 15px; }
                    .ls-table { width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 15px; font-size: 14px; }
                    .ls-table td, .ls-table th { border: 1px solid #000; padding: 6px 10px; }
                    .ls-teeth-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                    .ls-teeth-table td { border: none !important; text-align: center; padding: 2px; }
                    .ls-teeth-cross td { border-bottom: 1px solid #000 !important; }
                    .ls-teeth-center { border-right: 1px solid #000 !important; }
                    .ls-box { border: 1px solid #000; padding: 6px 10px; margin-bottom: 15px; font-weight: bold; }
                    .ls-process-table { width: 100%; border-collapse: collapse; font-size: 14px; font-weight: bold; }
                    .ls-process-table td { padding: 4px 10px; vertical-align: top; }
                    .ls-border-box { border: 1px solid #000; padding: 4px 10px; display: inline-block; min-width: 150px; }
                    
                    /* Model Label / Order Sticker Styles */
                    .sticker-container { width: 300px; padding: 15px; font-family: Arial, sans-serif; color: #000080; font-weight: bold; display: inline-block; margin: 10px; border: 1px dashed #ccc; }
                    .sticker-barcode { text-align: center; margin-bottom: 5px; }
                    .sticker-barcode img { height: 40px; }
                    .sticker-order { text-align: center; font-size: 14px; margin-bottom: 5px; color: #000; }
                    .sticker-client { font-size: 14px; text-transform: uppercase; margin-bottom: 2px; }
                    .sticker-product { font-size: 14px; text-transform: uppercase; margin-bottom: 2px; }
                    .sticker-date { font-size: 14px; text-transform: uppercase; }
                    
                    /* Job Sticker Styles */
                    .job-sticker-container { width: 350px; padding: 15px; font-family: Arial, sans-serif; display: inline-block; margin: 10px; border: 1px solid #000; box-shadow: 2px 2px 5px rgba(0,0,0,0.2); }
                    .js-row-top { display: flex; justify-content: space-between; font-size: 18px; margin-bottom: 5px; }
                    .js-client { font-size: 16px; text-transform: uppercase; margin-bottom: 15px; }
                    .js-product { font-size: 16px; text-transform: uppercase; margin-bottom: 10px; }
                    .js-teeth-cross { width: 150px; height: 30px; border-bottom: 2px solid #000080; position: relative; margin-top: 10px; }
                    .js-teeth-cross::after { content: ""; position: absolute; top: -10px; bottom: -10px; left: 50%; border-left: 2px solid #000080; }
                    
                    /* Dispatch / Mailing Labels Styles */
                    .mail-label-container { width: 300px; padding: 20px; font-family: Arial, sans-serif; color: #000080; font-weight: bold; display: inline-block; margin: 10px; border: 1px dashed #ccc; font-size: 16px; line-height: 1.4; }
                `;

                let htmlContent = '';
                
                orders.forEach(o => {
                    for(let i=0; i<copies; i++) {
                        let clientName = o.client ? o.client.name : 'N/A';
                        let city = o.client && o.client.city ? o.client.city : '';
                        let product = o.productName || o.productType || '';
                        let orderDate = o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'}) : '';
                        let dueDate = o.dueDate ? new Date(o.dueDate).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'}) : '';
                        let printedDate = new Date().toLocaleDateString('en-GB', {day: 'numeric', month: 'short'}) + ', ' + new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
                        let teethUnits = o.units || 1;
                        let notes = o.specialInstructions || '';
                        
                        if (type === 'Lab Slip') {
                            htmlContent += `
                            <div class="page-break">
                                <div class="lab-slip-container">
                                    <div class="ls-header">
                                        <div>
                                            <h1 class="ls-lab-name">SOHAR DENTAL LABORATORY</h1>
                                            <div class="ls-address">AL HAMBAR, C.R.NO. 3203549,<br>MOH NO. 1771,<br>WEST SOHAR Pin - 311</div>
                                        </div>
                                        <div class="ls-contact">
                                            Phone : +968 99622728<br>email : sohardentallab@gmail.com
                                        </div>
                                    </div>
                                    <div class="ls-title">Lab Slip</div>
                                    
                                    <table class="ls-table">
                                        <tr>
                                            <td style="width: 33%;">Order #<br><strong>${o.id}</strong></td>
                                            <td style="width: 33%;">Model #<br><strong>${o.patientName || 'N/A'}</strong></td>
                                            <td style="width: 33%;">Order Date<br><strong>${orderDate}</strong></td>
                                        </tr>
                                        <tr>
                                            <td>Due Date<br><strong>${dueDate}</strong></td>
                                            <td>Patient<br><strong>${o.patientName}</strong></td>
                                            <td>Printed<br><strong>${printedDate}</strong></td>
                                        </tr>
                                        <tr>
                                            <td colspan="2"><strong>M/s ${clientName.toUpperCase()}</strong></td>
                                            <td>${city.toUpperCase()}</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2"><strong>${teethUnits} ${product.toUpperCase()}</strong></td>
                                            <td style="text-align: right;">${product.toUpperCase()}</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2" style="padding: 0;">
                                                <table class="ls-teeth-table">
                                                    <tr class="ls-teeth-cross">
                                                        <td style="width:12.5%">8</td><td style="width:12.5%">7</td><td style="width:12.5%">6</td><td style="width:12.5%">5</td><td style="width:12.5%">4</td><td style="width:12.5%">3</td><td style="width:12.5%">2</td><td class="ls-teeth-center" style="width:12.5%">1</td>
                                                        <td style="width:12.5%">1</td><td style="width:12.5%">2</td><td style="width:12.5%">3</td><td style="width:12.5%">4</td><td style="width:12.5%">5</td><td style="width:12.5%">6</td><td style="width:12.5%">7</td><td style="width:12.5%">8</td>
                                                    </tr>
                                                    <tr>
                                                        <td>8</td><td>7</td><td>6</td><td>5</td><td>4</td><td>3</td><td>2</td><td class="ls-teeth-center">1</td>
                                                        <td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td>
                                                    </tr>
                                                </table>
                                            </td>
                                            <td style="text-align: center; vertical-align: middle;">Units<br><strong>${teethUnits}</strong></td>
                                        </tr>
                                    </table>
                                    
                                    <div class="ls-box">Notes : ${notes}</div>
                                    <div class="ls-box">Comments : </div>
                                    
                                    <table class="ls-process-table">
                                        <tr>
                                            <td style="border-bottom: 2px solid #000; padding-bottom: 2px; margin-bottom: 10px;">Enclosure</td>
                                            <td style="border-bottom: 2px solid #000; padding-bottom: 2px; text-align: center;">#</td>
                                            <td style="border-bottom: 2px solid #000; padding-bottom: 2px;">Process</td>
                                            <td style="border-bottom: 2px solid #000; padding-bottom: 2px;">Stage</td>
                                            <td style="border-bottom: 2px solid #000; padding-bottom: 2px;">Checked by</td>
                                        </tr>
                                        <tr>
                                            <td style="padding-top: 10px;"></td>
                                            <td style="padding-top: 10px;"></td>
                                            <td style="padding-top: 10px;">Assigned to &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</td>
                                            <td style="padding-top: 10px;">Model</td>
                                            <td style="padding-top: 10px;">________________</td>
                                        </tr>
                                        <tr>
                                            <td><div class="ls-border-box">Shade</div></td>
                                            <td></td>
                                            <td>Special Tray <span style="float:right">_________</span></td>
                                            <td>Waxup</td>
                                            <td>________________</td>
                                        </tr>
                                        <tr>
                                            <td></td><td></td>
                                            <td>Wax Trial <span style="float:right">_________</span></td>
                                            <td>Metal</td>
                                            <td>________________</td>
                                        </tr>
                                        <tr>
                                            <td></td><td></td>
                                            <td>Setting Trial <span style="float:right">_________</span></td>
                                            <td>Ceramic</td>
                                            <td>________________</td>
                                        </tr>
                                        <tr>
                                            <td></td><td></td>
                                            <td>Finish <span style="float:right">_________</span></td>
                                            <td>CAD/CAM</td>
                                            <td>________________</td>
                                        </tr>
                                        <tr>
                                            <td></td><td></td><td></td>
                                            <td>Cast Partial</td>
                                            <td>________________</td>
                                        </tr>
                                        <tr>
                                            <td></td><td></td><td></td>
                                            <td>Denture</td>
                                            <td>________________</td>
                                        </tr>
                                        <tr>
                                            <td></td><td></td><td></td>
                                            <td>Misc</td>
                                            <td>________________</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                            `;
                        }
                        else if (type === 'Model Label' || type === 'Order Sticker') {
                            htmlContent += `
                            <div class="sticker-container page-break">
                                <div class="sticker-barcode">
                                    <img src="https://barcodeapi.org/api/128/${o.id}" alt="Barcode">
                                </div>
                                <div class="sticker-order">${o.id}</div>
                                <div class="sticker-client">M/S ${clientName}</div>
                                <div class="sticker-product">${product}</div>
                                <div class="sticker-date">${orderDate} ${new Date(o.orderDate).getFullYear().toString().substr(-2)}</div>
                            </div>
                            `;
                        }
                        else if (type === 'Job Sticker') {
                            htmlContent += `
                            <div class="job-sticker-container page-break">
                                <div class="js-row-top">
                                    <span>${o.id}</span>
                                    <span>${orderDate}</span>
                                </div>
                                <div class="js-client">M/s ${clientName}</div>
                                <div class="js-product">${product}</div>
                                <div class="js-teeth-cross"></div>
                            </div>
                            `;
                        }
                        else if (type === 'Dispatch Labels') {
                            htmlContent += `
                            <div class="mail-label-container page-break">
                                <div>${o.id}</div>
                                <div>${clientName.toUpperCase()}</div>
                                <div>-${product.toUpperCase()}</div>
                                <div>${orderDate}</div>
                            </div>
                            `;
                        }
                        else if (type === 'Mailing Labels') {
                            htmlContent += `
                            <div class="mail-label-container page-break">
                                <div>M/S ${clientName.toUpperCase()}</div>
                                <div>${city.toUpperCase()}</div>
                            </div>
                            `;
                        }
                    }
                });

                printWin.document.write(`
                    <html>
                    <head>
                        <title>Printing - ${type}</title>
                        <style>${styles}</style>
                    </head>
                    <body>
                        ${htmlContent}
                        <script>
                            setTimeout(() => { window.print(); window.close(); }, 800);
                        

                            setTimeout(() => { window.print(); window.close(); }, 500);
                        <\/script>
                    </body>
                    </html>
                `);
                printWin.document.close();
            } catch (err) {
                console.error(err);
                alert('Failed to load products for price list.');
            }
        }

        // GRID DISPLAY SETTINGS LOGIC AND FUNCTIONS
        const ALL_COLUMNS = [
            { name: 'Order No', caption: 'Order #', key: 'orderNo', defaultVisible: true },
            { name: 'Order Date', caption: 'Order Date', key: 'orderDate', defaultVisible: true },
            { name: 'Client', caption: 'Client', key: 'client', defaultVisible: true },
            { name: 'Patient Name', caption: 'Patient', key: 'patientName', defaultVisible: true },
            { name: 'Products', caption: 'Products', key: 'products', defaultVisible: true },
            { name: 'Model #', caption: 'Model #', key: 'modelNo', defaultVisible: true },
            { name: 'Status', caption: 'Status', key: 'status', defaultVisible: true },
            { name: 'Due Date', caption: 'Due Date', key: 'dueDate', defaultVisible: true },
            { name: 'Received Date', caption: 'Received Date', key: 'receivedDate', defaultVisible: false },
            { name: 'Assign To', caption: 'Assign To', key: 'assignTo', defaultVisible: false },
            { name: 'Department', caption: 'Department', key: 'department', defaultVisible: false },
            { name: 'Delivery Method', caption: 'Delivery Method', key: 'deliveryMethod', defaultVisible: false },
            { name: 'Invoice #', caption: 'Invoice #', key: 'invoiceNo', defaultVisible: true },
            { name: 'Amount', caption: 'Amount', key: 'amount', defaultVisible: true }
        ];

        const DEFAULT_GRID_SETTINGS = {
            columns: ALL_COLUMNS.filter(c => c.defaultVisible).map(c => ({ name: c.name, caption: c.caption, key: c.key, visible: true })),
            options: {
                defaultDateSearch: 'Order Date',
                finalDeliveryDueDateRange: 'Month To Date',
                orderDateRange: 'Month To Date',
                dateInRange: 'Month To Date',
                statusDateRange: 'Month To Date',
                sortColumn1: 'Order Date',
                sortDirection1: 'Desc',
                sortColumn2: 'Order #',
                sortDirection2: 'Desc'
            }
        };

        let gridSettings = null;
        let draftSettings = null;

        function initGridSettings() {
            const saved = localStorage.getItem('grid_display_settings');
            if (saved) {
                try {
                    gridSettings = JSON.parse(saved);
                } catch (e) {
                    console.error(e);
                }
            }
            if (!gridSettings || !gridSettings.columns || !gridSettings.options) {
                gridSettings = JSON.parse(JSON.stringify(DEFAULT_GRID_SETTINGS));
            } else {
                // Ensure new default visible columns (like invoiceNo and amount) are present and visible if not already there
                const defaultVisibleKeys = ['invoiceNo', 'amount'];
                defaultVisibleKeys.forEach(key => {
                    const exists = gridSettings.columns.some(c => c.key === key);
                    if (!exists) {
                        const colObj = ALL_COLUMNS.find(c => c.key === key);
                        if (colObj) {
                            gridSettings.columns.push({ name: colObj.name, caption: colObj.caption, key: colObj.key, visible: true });
                        }
                    }
                });
            }
        }

        function getDateRangeDates(rangeName) {
            const todayObj = new Date();
            const todayStr = todayObj.toISOString().split('T')[0];
            
            switch (rangeName) {
                case 'Today':
                    return { from: todayStr, to: todayStr };
                case 'Yesterday': {
                    const yesterday = new Date();
                    yesterday.setDate(todayObj.getDate() - 1);
                    const yStr = yesterday.toISOString().split('T')[0];
                    return { from: yStr, to: yStr };
                }
                case 'This Week': {
                    const day = todayObj.getDay();
                    const diff = todayObj.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                    const monday = new Date(todayObj.setDate(diff));
                    return { from: monday.toISOString().split('T')[0], to: todayStr };
                }
                case 'Month To Date': {
                    const firstDay = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);
                    return { from: firstDay.toISOString().split('T')[0], to: todayStr };
                }
                case 'This Month': {
                    const firstDay = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);
                    const lastDay = new Date(todayObj.getFullYear(), todayObj.getMonth() + 1, 0);
                    return { from: firstDay.toISOString().split('T')[0], to: lastDay.toISOString().split('T')[0] };
                }
                case 'Last Month': {
                    const firstDay = new Date(todayObj.getFullYear(), todayObj.getMonth() - 1, 1);
                    const lastDay = new Date(todayObj.getFullYear(), todayObj.getMonth(), 0);
                    return { from: firstDay.toISOString().split('T')[0], to: lastDay.toISOString().split('T')[0] };
                }
                case 'All Time':
                default:
                    return { from: '', to: '' };
            }
        }

        function renderDateFilterControls() {
            const container = document.getElementById('dynamic-date-filter-container');
            if (!container) return;
            
            const searchField = gridSettings.options.defaultDateSearch;
            let rangeName = 'Month To Date';
            if (searchField === 'Order Date') rangeName = gridSettings.options.orderDateRange;
            else if (searchField === 'Due Date') rangeName = gridSettings.options.finalDeliveryDueDateRange;
            else if (searchField === 'Date In') rangeName = gridSettings.options.dateInRange;
            else if (searchField === 'Status Date') rangeName = gridSettings.options.statusDateRange;
            
            const dates = getDateRangeDates(rangeName);
            
            container.innerHTML = `
                <div style="font-size:12px; display:flex; align-items:center; gap:8px;">
                    <select id="search-date-field" style="padding:4px; font-weight:bold; border:1px solid #ccc;" onchange="handleDateFieldChange(this.value)">
                        <option value="Order Date" ${searchField === 'Order Date' ? 'selected' : ''}>Order Date</option>
                        <option value="Due Date" ${searchField === 'Due Date' ? 'selected' : ''}>Due Date</option>
                        <option value="Date In" ${searchField === 'Date In' ? 'selected' : ''}>Date In</option>
                        <option value="Status Date" ${searchField === 'Status Date' ? 'selected' : ''}>Status Date</option>
                    </select>
                    <select id="search-date-range" style="padding:4px; border:1px solid #ccc;" onchange="handleDateRangeChange(this.value)">
    <option value="Custom Date">Custom Date</option>
    <option value="Recent">Recent</option>
    <option value="Today">Today</option>
    <option value="Yesterday">Yesterday</option>
    <option value="This week from Sunday">This week from Sunday</option>
    <option value="Month To Date" selected>Month To Date</option>
    <option value="Last 7 Days">Last 7 Days</option>
    <option value="Last Full Week">Last Full Week</option>
    <option value="Last Full Month">Last Full Month</option>
    <option value="Last 30 Days">Last 30 Days</option>
    <option value="Year To Date">Year To Date</option>
    <option value="Financial Year To Date">Financial Year To Date</option>
    <option value="Last 6 Months">Last 6 Months</option>
    <option value="Last 12 Months">Last 12 Months</option>
                        </select>
                </div>
                <input type="date" id="date-from" value="${dates.from}" style="padding:4px; border:1px solid #ccc;">
                <input type="date" id="date-to" value="${dates.to}" style="padding:4px; border:1px solid #ccc;">
                <button class="btn-action" onclick="loadOrders()"><i class="fas fa-sync-alt"></i></button>
            `;
        }

        function handleDateFieldChange(field) {
            gridSettings.options.defaultDateSearch = field;
            localStorage.setItem('grid_display_settings', JSON.stringify(gridSettings));
            
            let rangeName = 'Month To Date';
            if (field === 'Order Date') rangeName = gridSettings.options.orderDateRange;
            else if (field === 'Due Date') rangeName = gridSettings.options.finalDeliveryDueDateRange;
            else if (field === 'Date In') rangeName = gridSettings.options.dateInRange;
            else if (field === 'Status Date') rangeName = gridSettings.options.statusDateRange;
            
            const rangeSelect = document.getElementById('search-date-range');
            if (rangeSelect) rangeSelect.value = rangeName;
            
            const dates = getDateRangeDates(rangeName);
            document.getElementById('date-from').value = dates.from;
            document.getElementById('date-to').value = dates.to;
            
            loadOrders();
        }

        function handleDateRangeChange(rangeName) {
            const field = document.getElementById('search-date-field').value;
            if (field === 'Order Date') gridSettings.options.orderDateRange = rangeName;
            else if (field === 'Due Date') gridSettings.options.finalDeliveryDueDateRange = rangeName;
            else if (field === 'Date In') gridSettings.options.dateInRange = rangeName;
            else if (field === 'Status Date') gridSettings.options.statusDateRange = rangeName;
            
            localStorage.setItem('grid_display_settings', JSON.stringify(gridSettings));

            const dates = getDateRangeDates(rangeName);
            document.getElementById('date-from').value = dates.from;
            document.getElementById('date-to').value = dates.to;
            
            loadOrders();
        }

        function sortOrders(orders, sortCol1, sortDir1, sortCol2, sortDir2) {
            const getValue = (order, col) => {
                switch (col) {
                    case 'Order Date':
                        return order.receivedDate ? new Date(order.receivedDate).getTime() : 0;
                    case 'Order #':
                        return order.orderNumber || order.id || 0;
                    case 'Client':
                        return order.client ? order.client.name.toLowerCase() : '';
                    case 'Patient':
                        return order.patientName ? order.patientName.toLowerCase() : '';
                    case 'Products':
                        return (order.productName || order.productType || '').toLowerCase();
                    case 'Model #':
                        return order.modelNumber ? order.modelNumber.toLowerCase() : '';
                    case 'Status':
                        return order.status ? order.status.toLowerCase() : '';
                    case 'Due Date':
                        return order.dueDate ? new Date(order.dueDate).getTime() : 0;
                    default:
                        return 0;
                }
            };

            orders.sort((a, b) => {
                let valA = getValue(a, sortCol1);
                let valB = getValue(b, sortCol1);

                if (valA < valB) return sortDir1 === 'Asc' ? -1 : 1;
                if (valA > valB) return sortDir1 === 'Asc' ? 1 : -1;

                let valA2 = getValue(a, sortCol2);
                let valB2 = getValue(b, sortCol2);

                if (valA2 < valB2) return sortDir2 === 'Asc' ? -1 : 1;
                if (valA2 > valB2) return sortDir2 === 'Asc' ? 1 : -1;

                return 0;
            });
        }

        // Modal triggers and tab switcher
        function openGridSettingsModal(event) {
            if (event) event.preventDefault();
            
            draftSettings = JSON.parse(JSON.stringify(gridSettings));
            
            const modal = document.createElement('div');
            modal.id = 'grid-settings-modal';
            modal.className = 'modal-overlay';
            modal.style.alignItems = 'flex-start';
            // Position near the click or near the top of the viewport
            let topOffset = 80;
            if (event && event.clientY) {
                topOffset = Math.max(20, Math.min(event.clientY - 60, window.innerHeight - 450));
            }
            modal.style.paddingTop = topOffset + 'px';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Grid Display Settings</h3>
                        <button class="close-btn" onclick="closeGridSettingsModal()">&times;</button>
                    </div>
                    <div class="tabs-container">
                        <button class="tab-btn active" id="btn-settings-tab-columns" onclick="switchSettingsTab('columns')">Columns</button>
                        <button class="tab-btn" id="btn-settings-tab-options" onclick="switchSettingsTab('options')">Options</button>
                    </div>
                    
                    <div id="settings-tab-content-columns">
                        <div style="max-height: 250px; overflow-y: auto; border: none; margin-bottom: 12px;">
                            <table class="columns-table">
                                <thead>
                                    <tr>
                                        <th style="width: 35px; text-align: center;">Sr</th>
                                        <th>Name</th>
                                        <th>Caption</th>
                                        <th style="width: 35px; text-align: center;"></th>
                                    </tr>
                                </thead>
                                <tbody id="grid-settings-columns-tbody">
                                </tbody>
                            </table>
                        </div>
                        <div class="footer-actions" style="display: flex; align-items: center; justify-content: space-between; margin-top: 15px;">
                            <button type="button" class="btn-modal-action" id="btn-grid-ok" style="width: 75px; height: 30px; border: 1px solid #ccc; background: #fff; color: #0056b3; font-weight: bold; cursor: pointer; font-size: 13px; border-radius: 4px;">OK</button>
                            
                            <div style="position: relative; width: 140px;">
                                <button type="button" class="btn-modal-action" id="btn-add-fields-trigger" style="width: 100%; height: 30px; border: 1px solid #ccc; background: #fff; color: #007bff; font-weight: bold; cursor: pointer; font-size: 13px; border-radius: 4px; display: flex; align-items: center; justify-content: center; gap: 4px;"><i class="fas fa-plus"></i> Add Fields</button>
                                <div id="add-fields-dropdown-container" style="display: none; position: absolute; top: 35px; left: 0; background: #fff; border: 1px solid #ccc; padding: 5px; z-index: 99999; box-shadow: 0 4px 15px rgba(0,0,0,0.2); width: 200px; border-radius: 4px;">
                                    <select id="add-fields-select" style="width:100%; padding:4px;">
                                    </select>
                                </div>
                            </div>
                            
                            <button type="button" class="btn-modal-action" id="btn-grid-reset" style="width: 75px; height: 30px; border: 1px solid #ccc; background: #fff; color: #0056b3; font-weight: bold; cursor: pointer; font-size: 13px; border-radius: 4px;">Reset</button>
                        </div>
                    </div>
                    
                    <div id="settings-tab-content-options" style="display: none;">
                        <div class="settings-section-box">
                            <label style="font-weight: bold; font-size: 12px; display: block; margin-bottom: 4px;">Default Date Search</label>
                            <select id="opt-default-date-search" style="width: 100%; padding: 4px; border: 1px solid #000; font-size: 13px;">
                                <option value="Order Date">Order Date</option>
                                <option value="Due Date">Due Date</option>
                                <option value="Date In">Date In</option>
                                <option value="Status Date">Status Date</option>
                            </select>
                        </div>
                        
                        <div class="settings-section-box">
                            <div class="settings-section-box-title" style="font-weight: bold; font-size: 12px; margin-bottom: 8px;">Default Date Ranges</div>
<div style="margin-bottom: 6px;">

    <label style="display:block; font-size:11px; font-weight:700; margin-bottom:2px;">Order Date</label>
    <select id="opt-order-date" style="width:100%; padding:4px; border:1px solid #333; margin-bottom:8px; font-size:12px;">
    <option value="Custom Date">Custom Date</option>
    <option value="Recent">Recent</option>
    <option value="Today">Today</option>
    <option value="Yesterday">Yesterday</option>
    <option value="This week from Sunday">This week from Sunday</option>
    <option value="Month To Date" selected>Month To Date</option>
    <option value="Last 7 Days">Last 7 Days</option>
    <option value="Last Full Week">Last Full Week</option>
    <option value="Last Full Month">Last Full Month</option>
    <option value="Last 30 Days">Last 30 Days</option>
    <option value="Year To Date">Year To Date</option>
    <option value="Financial Year To Date">Financial Year To Date</option>
    <option value="Last 6 Months">Last 6 Months</option>
    <option value="Last 12 Months">Last 12 Months</option>
                        </select>

    <label style="display:block; font-size:11px; font-weight:700; margin-bottom:2px;">Date In</label>
    <select id="opt-date-in" style="width:100%; padding:4px; border:1px solid #333; margin-bottom:8px; font-size:12px;">
    <option value="Custom Date">Custom Date</option>
    <option value="Recent">Recent</option>
    <option value="Today">Today</option>
    <option value="Yesterday">Yesterday</option>
    <option value="This week from Sunday">This week from Sunday</option>
    <option value="Month To Date" selected>Month To Date</option>
    <option value="Last 7 Days">Last 7 Days</option>
    <option value="Last Full Week">Last Full Week</option>
    <option value="Last Full Month">Last Full Month</option>
    <option value="Last 30 Days">Last 30 Days</option>
    <option value="Year To Date">Year To Date</option>
    <option value="Financial Year To Date">Financial Year To Date</option>
    <option value="Last 6 Months">Last 6 Months</option>
    <option value="Last 12 Months">Last 12 Months</option>
                        </select>

    <label style="display:block; font-size:11px; font-weight:700; margin-bottom:2px;">Status Date</label>
    <select id="opt-status-date" style="width:100%; padding:4px; border:1px solid #333; margin-bottom:8px; font-size:12px;">
    <option value="Custom Date">Custom Date</option>
    <option value="Recent">Recent</option>
    <option value="Today">Today</option>
    <option value="Yesterday">Yesterday</option>
    <option value="This week from Sunday">This week from Sunday</option>
    <option value="Month To Date" selected>Month To Date</option>
    <option value="Last 7 Days">Last 7 Days</option>
    <option value="Last Full Week">Last Full Week</option>
    <option value="Last Full Month">Last Full Month</option>
    <option value="Last 30 Days">Last 30 Days</option>
    <option value="Year To Date">Year To Date</option>
    <option value="Financial Year To Date">Financial Year To Date</option>
    <option value="Last 6 Months">Last 6 Months</option>
    <option value="Last 12 Months">Last 12 Months</option>
                        </select>

</div>
</div>
<div class="settings-section-box">
                            <div class="settings-section-box-title" style="font-weight: bold; font-size: 12px; margin-bottom: 8px;">Sort</div>
                            <div style="margin-bottom: 8px;">
                                <label style="display: block; font-size: 11px; font-weight: bold; margin-bottom: 2px;">Column 1</label>
                                <div style="display: flex; align-items: center;">
                                    <select id="opt-sort-col-1" style="width: 170px; padding: 4px; border: 1px solid #000; font-size: 13px;">
                                        <option value="Order Date">Order Date</option>
                                        <option value="Order #">Order #</option>
                                        <option value="Client">Client</option>
                                        <option value="Patient">Patient</option>
                                        <option value="Products">Products</option>
                                        <option value="Model #">Model #</option>
                                        <option value="Status">Status</option>
                                        <option value="Due Date">Due Date</option>
                                    </select>
                                    <div style="display: flex; gap: 8px; margin-left: auto; align-items: center; font-size: 13px;">
                                        <label style="display: flex; align-items: center; gap: 3px; cursor: pointer;"><input type="radio" name="opt-sort-dir-1" value="Asc" style="margin:0;"> Asc</label>
                                        <label style="display: flex; align-items: center; gap: 3px; cursor: pointer;"><input type="radio" name="opt-sort-dir-1" value="Desc" style="margin:0;"> Desc</label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label style="display: block; font-size: 11px; font-weight: bold; margin-bottom: 2px;">Column 2</label>
                                <div style="display: flex; align-items: center;">
                                    <select id="opt-sort-col-2" style="width: 170px; padding: 4px; border: 1px solid #000; font-size: 13px;">
                                        <option value="Order Date">Order Date</option>
                                        <option value="Order #">Order #</option>
                                        <option value="Client">Client</option>
                                        <option value="Patient">Patient</option>
                                        <option value="Products">Products</option>
                                        <option value="Model #">Model #</option>
                                        <option value="Status">Status</option>
                                        <option value="Due Date">Due Date</option>
                                    </select>
                                    <div style="display: flex; gap: 8px; margin-left: auto; align-items: center; font-size: 13px;">
                                        <label style="display: flex; align-items: center; gap: 3px; cursor: pointer;"><input type="radio" name="opt-sort-dir-2" value="Asc" style="margin:0;"> Asc</label>
                                        <label style="display: flex; align-items: center; gap: 3px; cursor: pointer;"><input type="radio" name="opt-sort-dir-2" value="Desc" style="margin:0;"> Desc</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="footer-actions" style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-start;">
                            <button type="button" class="btn-modal-action" id="btn-grid-opts-ok" style="flex: none; width: 75px; height: 30px; border: 1px solid #ccc; background: #fff; color: #0056b3; font-weight: bold; cursor: pointer; font-size: 13px; border-radius: 4px;">OK</button>
                            <button type="button" class="btn-modal-action" id="btn-grid-opts-reset" style="flex: none; width: 75px; height: 30px; border: 1px solid #ccc; background: #fff; color: #0056b3; font-weight: bold; cursor: pointer; font-size: 13px; border-radius: 4px;">Reset</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Initialize options tab values (wrapped in try/catch so buttons still work if this fails)
            try {
                const setVal = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
                setVal('opt-default-date-search', draftSettings.options.defaultDateSearch);
                setVal('opt-due-range', draftSettings.options.finalDeliveryDueDateRange);
                setVal('opt-order-range', draftSettings.options.orderDateRange);
                setVal('opt-date-in-range', draftSettings.options.dateInRange);
                setVal('opt-status-range', draftSettings.options.statusDateRange);
                setVal('opt-sort-col-1', draftSettings.options.sortColumn1);
                setVal('opt-sort-col-2', draftSettings.options.sortColumn2);
                
                const dir1 = document.querySelector(`input[name="opt-sort-dir-1"][value="${draftSettings.options.sortDirection1 || 'Desc'}"]`);
                if (dir1) dir1.checked = true;
                const dir2 = document.querySelector(`input[name="opt-sort-dir-2"][value="${draftSettings.options.sortDirection2 || 'Desc'}"]`);
                if (dir2) dir2.checked = true;
                
                const setChange = (id, fn) => { const el = document.getElementById(id); if (el) el.onchange = fn; };
                setChange('opt-default-date-search', (e) => draftSettings.options.defaultDateSearch = e.target.value);
                setChange('opt-due-range', (e) => draftSettings.options.finalDeliveryDueDateRange = e.target.value);
                setChange('opt-order-range', (e) => draftSettings.options.orderDateRange = e.target.value);
                setChange('opt-date-in-range', (e) => draftSettings.options.dateInRange = e.target.value);
                setChange('opt-status-range', (e) => draftSettings.options.statusDateRange = e.target.value);
                setChange('opt-sort-col-1', (e) => draftSettings.options.sortColumn1 = e.target.value);
                setChange('opt-sort-col-2', (e) => draftSettings.options.sortColumn2 = e.target.value);
                
                document.querySelectorAll('input[name="opt-sort-dir-1"]').forEach(r => r.onchange = (e) => draftSettings.options.sortDirection1 = e.target.value);
                document.querySelectorAll('input[name="opt-sort-dir-2"]').forEach(r => r.onchange = (e) => draftSettings.options.sortDirection2 = e.target.value);
            } catch (optErr) {
                console.error('Error initializing options tab:', optErr);
            }

            renderColumnsTable();
            
            // Bind button click handlers programmatically (more reliable than inline onclick)
            const btnOk = document.getElementById('btn-grid-ok');
            if (btnOk) btnOk.addEventListener('click', function(e) { e.stopPropagation(); saveGridSettings(); });
            
            const btnAddFields = document.getElementById('btn-add-fields-trigger');
            if (btnAddFields) btnAddFields.addEventListener('click', function(e) { e.stopPropagation(); e.preventDefault(); toggleAddFieldsDropdown(e); });
            
            const btnReset = document.getElementById('btn-grid-reset');
            if (btnReset) btnReset.addEventListener('click', function(e) { e.stopPropagation(); resetColumnsDraft(); });
            
            const addFieldsSelect = document.getElementById('add-fields-select');
            if (addFieldsSelect) addFieldsSelect.addEventListener('change', function() { handleAddFieldSelect(this); });
            
            const btnOptsOk = document.getElementById('btn-grid-opts-ok');
            if (btnOptsOk) btnOptsOk.addEventListener('click', function(e) { e.stopPropagation(); saveGridSettings(); });

            const btnOptsReset = document.getElementById('btn-grid-opts-reset');
            if (btnOptsReset) btnOptsReset.addEventListener('click', function(e) { e.stopPropagation(); resetOptionsDraft(); });
            
            modal.onclick = (e) => {
                if (e.target === modal) closeGridSettingsModal();
            };
        }

        function closeGridSettingsModal() {
            const modal = document.getElementById('grid-settings-modal');
            if (modal) modal.remove();
        }

        function switchSettingsTab(tabName) {
            const colsTab = document.getElementById('settings-tab-content-columns');
            const optsTab = document.getElementById('settings-tab-content-options');
            
            const btnCols = document.getElementById('btn-settings-tab-columns');
            const btnOpts = document.getElementById('btn-settings-tab-options');
            
            if (tabName === 'columns') {
                if (colsTab) colsTab.style.display = 'block';
                if (optsTab) optsTab.style.display = 'none';
                
                if (btnCols) btnCols.classList.add('active');
                if (btnOpts) btnOpts.classList.remove('active');
            } else {
                if (colsTab) colsTab.style.display = 'none';
                if (optsTab) optsTab.style.display = 'block';
                
                if (btnCols) btnCols.classList.remove('active');
                if (btnOpts) btnOpts.classList.add('active');
            }
        }

        function renderColumnsTable() {
            const tbody = document.getElementById('grid-settings-columns-tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            
            draftSettings.columns.forEach((col, idx) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="text-align:center;">${idx + 1}</td>
                    <td style="font-weight: 500;">${col.name}</td>
                    <td><input type="text" value="${col.caption}" oninput="updateDraftCaption('${col.key}', this.value)" style="width: 100%; box-sizing: border-box; padding: 2px 5px; border: 1px solid #ccc; border-radius: 4px; font-size: 11px;"></td>
                    <td style="text-align:center;"><button type="button" class="delete-btn" onclick="removeColumnDraft('${col.key}')">&times;</button></td>
                `;
                tbody.appendChild(row);
            });

            updateAddFieldsDropdown();
        }

        function updateAddFieldsDropdown() {
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
        }

        function toggleAddFieldsDropdown(event) {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            const container = document.getElementById('add-fields-dropdown-container');
            if (container) {
                const isHidden = container.style.display === 'none' || !container.style.display;
                container.style.display = isHidden ? 'block' : 'none';
                // Ensure dropdown is populated when shown
                if (isHidden) updateAddFieldsDropdown();
            }
        }

        function handleAddFieldSelect(select) {
            const key = select.value;
            if (!key) return;
            
            const colInfo = ALL_COLUMNS.find(c => c.key === key);
            if (colInfo) {
                draftSettings.columns.push({
                    name: colInfo.name,
                    caption: colInfo.caption,
                    key: colInfo.key,
                    visible: true
                });
                renderColumnsTable();
            }
            
            const container = document.getElementById('add-fields-dropdown-container');
            if (container) container.style.display = 'none';
            
            select.value = '';
        }

        function removeColumnDraft(key) {
            draftSettings.columns = draftSettings.columns.filter(c => c.key !== key);
            renderColumnsTable();
        }

        function updateDraftCaption(key, captionValue) {
            const col = draftSettings.columns.find(c => c.key === key);
            if (col) col.caption = captionValue;
        }

        function resetColumnsDraft() {
            draftSettings.columns = ALL_COLUMNS.filter(c => c.defaultVisible).map(c => ({ name: c.name, caption: c.caption, key: c.key, visible: true }));
            renderColumnsTable();
        }

        function resetOptionsDraft() {
            draftSettings.options = JSON.parse(JSON.stringify(DEFAULT_GRID_SETTINGS.options));
            
            document.getElementById('opt-default-date-search').value = draftSettings.options.defaultDateSearch;
            document.getElementById('opt-due-range').value = draftSettings.options.finalDeliveryDueDateRange;
            document.getElementById('opt-order-range').value = draftSettings.options.orderDateRange;
            document.getElementById('opt-date-in-range').value = draftSettings.options.dateInRange;
            document.getElementById('opt-status-range').value = draftSettings.options.statusDateRange;
            
            document.getElementById('opt-sort-col-1').value = draftSettings.options.sortColumn1;
            document.getElementById('opt-sort-col-2').value = draftSettings.options.sortColumn2;
            
            document.querySelector(`input[name="opt-sort-dir-1"][value="${draftSettings.options.sortDirection1}"]`).checked = true;
            document.querySelector(`input[name="opt-sort-dir-2"][value="${draftSettings.options.sortDirection2}"]`).checked = true;
        }

        function saveGridSettings() {
            try {
                gridSettings = JSON.parse(JSON.stringify(draftSettings));
                localStorage.setItem('grid_display_settings', JSON.stringify(gridSettings));
                
                renderDateFilterControls();
                closeGridSettingsModal();
                loadOrders();
            } catch (err) {
                console.error('Error saving grid settings:', err);
                alert('Settings saved with errors. Page will reload.');
                closeGridSettingsModal();
                location.reload();
            }
        }
    

        document.addEventListener('DOMContentLoaded', () => {
            if (typeof loadStaffForAssign === 'function') {
                loadStaffForAssign();
            }
        });
    