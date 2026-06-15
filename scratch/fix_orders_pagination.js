const fs = require('fs');

function fixOrdersPagination() {
    let content = fs.readFileSync('orders.html', 'utf8');

    // Currently: 
    // const tbody = document.querySelector('#orders-table tbody');
    // tbody.innerHTML = '';
    // ... loop over `orders.forEach` ...
    // ... catch (error) ...

    const renderFnInject = `
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
                headersHtml += \`<th>\${col.caption || col.name}</th>\`;
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

                let tdHtml = \`<td style="text-align: center;"><input type="checkbox" class="order-checkbox" value="\${order.id}"></td>\`;

                visibleCols.forEach(col => {
                    let cellVal = '';
                    switch (col.key) {
                        case 'sr': cellVal = index + 1; break;
                        case 'orderNumber': cellVal = \`<strong>\${order.orderNumber || order.id}</strong>\`; break;
                        case 'orderDate': cellVal = order.receivedDate ? new Date(order.receivedDate).toLocaleDateString() : '-'; break;
                        case 'dueDate': cellVal = order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '-'; break;
                        case 'clientName': cellVal = order.client ? \`<a href="client_viewer.html?id=\${order.clientId}" class="client-link" onclick="event.stopPropagation()">\${order.client.name}</a>\` : 'Unknown'; break;
                        case 'patientName': cellVal = order.patientName || '-'; break;
                        case 'product': cellVal = \`<span class="product-badge" style="background: \${getProductColor(order.productType)}20; color: \${getProductColor(order.productType)}">\${order.productName || '-'}</span>\`; break;
                        case 'model': cellVal = order.modelNumber || '-'; break;
                        case 'status':
                            if (status === 'On Hold') {
                                cellVal = \`<span class="status-badge" style="background: #fbbf2420; color: #d97706; border: 1px solid #fbbf24;">On Hold</span>\`;
                            } else {
                                cellVal = \`<span class="status-badge" style="background: \${getStatusColor(order.status)}20; color: \${getStatusColor(order.status)}; border: 1px solid \${getStatusColor(order.status)}40">\${order.status}</span>\`;
                            }
                            break;
                    }
                    tdHtml += \`<td>\${cellVal}</td>\`;
                });

                if (status === 'On Hold') {
                    tdHtml += \`<td>\${order.holdDate ? new Date(order.holdDate).toLocaleDateString() : '-'}</td><td>\${order.holdReason || '-'}</td>\`;
                } else if (status === 'Cancelled') {
                    tdHtml += \`<td>\${order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : '-'}</td><td>\${order.cancelledReason || '-'}</td>\`;
                }

                tdHtml += \`
                    <td class="action-cell" onclick="event.stopPropagation()">
                        <div class="action-buttons">
                            <button class="btn-action btn-edit" title="Edit Order" onclick="openEditModal(\${order.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action btn-invoice" title="View/Generate Invoice" onclick="viewOrderInvoice(\${order.id})">
                                <i class="fas fa-file-invoice"></i>
                            </button>
                        </div>
                    </td>
                \`;

                tr.innerHTML = tdHtml;
                tr.onclick = () => openEditModal(order.id);
                tbody.appendChild(tr);
            });
        };
    `;

    if (!content.includes('window.renderOrdersInner = function')) {
        content = content.replace(/const tbody = document\.querySelector\('#orders-table tbody'\);[\s\S]*?tbody\.appendChild\(tr\);\n\s*\}\);\n\s*\} catch \(error\) \{/m, 
            `allFetchedData = orders;\n                currentRenderFn = () => window.renderOrdersInner(allFetchedData);\n                window.renderOrdersInner(allFetchedData);\n            } catch (error) {`
        );
        content = content.replace(/<\/script>/, renderFnInject + '\n</script>');
    }

    fs.writeFileSync('orders.html', content);
    console.log('Fixed pagination logic in orders.html');
}

fixOrdersPagination();
