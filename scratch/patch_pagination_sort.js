const fs = require('fs');

const patchFile = (filename, renderFuncName, dataVarName, tbodyId) => {
    let content = fs.readFileSync(filename, 'utf8');

    // Add pagination variables at the top of script if not exist
    if (!content.includes('let currentPage = 1;')) {
        content = content.replace(/<script>/, `<script>\n        let currentPage = 1;\n        let itemsPerPage = 50;\n        let allFetchedData = [];\n`);
    }

    // Inject sorting and pagination wrapper
    const wrapperLogic = `
        function applySortAndPagination(data) {
            // 1. Client-Side Sort
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

            // 2. Pagination
            const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
            if (currentPage > totalPages) currentPage = totalPages;
            
            const start = (currentPage - 1) * itemsPerPage;
            const paginated = sorted.slice(start, start + itemsPerPage);
            
            renderPaginationControls(sorted.length, totalPages);
            return paginated;
        }

        function renderPaginationControls(totalItems, totalPages) {
            let container = document.getElementById('pagination-controls');
            if (!container) {
                container = document.createElement('div');
                container.id = 'pagination-controls';
                container.style = 'display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; border-top: 1px solid #e2e8f0; background: #fff;';
                
                // Find the table's parent card and append there
                const tbody = document.getElementById('${tbodyId}');
                if (tbody) {
                    const card = tbody.closest('.card') || tbody.parentElement;
                    card.appendChild(container);
                }
            }
            
            container.innerHTML = \`
                <div style="font-size: 13px; color: #64748b;">
                    Showing \${Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to \${Math.min(currentPage * itemsPerPage, totalItems)} of \${totalItems} entries
                </div>
                <div style="display: flex; gap: 5px;">
                    <button onclick="changePage(-1)" \${currentPage === 1 ? 'disabled' : ''} style="padding: 5px 10px; border: 1px solid #cbd5e1; background: \${currentPage === 1 ? '#f1f5f9' : '#fff'}; color: #334155; border-radius: 4px; cursor: \${currentPage === 1 ? 'not-allowed' : 'pointer'};">Previous</button>
                    <span style="padding: 5px 10px; font-size: 13px; font-weight: bold;">Page \${currentPage} of \${totalPages}</span>
                    <button onclick="changePage(1)" \${currentPage === totalPages ? 'disabled' : ''} style="padding: 5px 10px; border: 1px solid #cbd5e1; background: \${currentPage === totalPages ? '#f1f5f9' : '#fff'}; color: #334155; border-radius: 4px; cursor: \${currentPage === totalPages ? 'not-allowed' : 'pointer'};">Next</button>
                </div>
            \`;
        }

        window.changePage = function(delta) {
            currentPage += delta;
            ${renderFuncName}(allFetchedData);
        };
    `;

    if (!content.includes('function applySortAndPagination')) {
        const inlineScriptStart = content.indexOf('<script>');
        if (inlineScriptStart !== -1) {
            const inlineScriptEnd = content.indexOf('</script>', inlineScriptStart);
            if (inlineScriptEnd !== -1) {
                content = content.slice(0, inlineScriptEnd) + wrapperLogic + '\n' + content.slice(inlineScriptEnd);
            }
        }
    }
    
    // We need to modify the place where the render function processes its data array
    // E.g., `renderOrders(orders)` -> `const pageData = applySortAndPagination(orders); ... use pageData instead of orders`
    
    const regex = new RegExp(`function ${renderFuncName}\\((\\w+)\\) \\{`);
    content = content.replace(regex, `function ${renderFuncName}($1) {
            allFetchedData = $1;
            $1 = applySortAndPagination($1);
    `);

    fs.writeFileSync(filename, content);
    console.log('Patched ' + filename);
};

// We need to apply this to:
// 1. orders.html (renderOrders, data is orders, tbody is orders-tbody)
patchFile('orders.html', 'renderOrders', 'orders', 'orders-tbody');

// 2. shipments.html (renderShipments, data is shipments, tbody is ??? wait, shipments has multiple tables.
// shipments.html: renderShipments(shipments) -> 'shipment-notes-tbody'
// renderOrdersToDeliver(orders) -> 'orders-deliver-tbody'
// renderTryIn(history) -> 'try-in-tbody'
// Since shipments has multiple tabs, we can't just use one tbodyId easily. Let's make the wrapper smart.
