const fs = require('fs');

function fixPaginationContainer(filename) {
    let content = fs.readFileSync(filename, 'utf8');

    // Update window.renderPaginationControls
    const replacement = `
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
    `;

    // We will replace the existing renderPaginationControls implementation with this fixed one
    const regex = /window\.renderPaginationControls = function\(totalItems, totalPages, containerId\) \{[\s\S]*?\};\s*window\.changePage/m;
    content = content.replace(regex, replacement + '\n\n        window.changePage');

    fs.writeFileSync(filename, content);
    console.log('Fixed pagination container in ' + filename);
}

fixPaginationContainer('orders.html');
fixPaginationContainer('shipments.html');
fixPaginationContainer('accounts.html');
