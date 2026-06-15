const fs = require('fs');

function injectPagination(filename) {
    let content = fs.readFileSync(filename, 'utf8');

    if (content.includes('let currentPage = 1;')) {
        console.log('Already patched ' + filename);
        return;
    }

    const globals = `
        let currentPage = 1;
        let itemsPerPage = 50;
        let allFetchedData = [];
        let currentRenderFn = null;
        let currentRenderContainer = null;
    `;

    const methods = `
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
            
            const tbody = document.getElementById(containerId);
            if (tbody) {
                const card = tbody.closest('.card') || tbody.parentElement;
                card.appendChild(container);
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
    `;

    content = content.replace(/<script>/, '<script>\n' + globals + '\n');
    content = content.replace(/<\/script>/, '\n' + methods + '\n</script>');
    fs.writeFileSync(filename, content);
    console.log('Patched ' + filename);
}

injectPagination('orders.html');
injectPagination('shipments.html');
injectPagination('accounts.html');
