const fs = require('fs');
let html = fs.readFileSync('reports.html', 'utf8');

// Add Export CSV button next to Print button
const exportCsvBtn = `
                    <button class="btn-action" style="padding:4px 12px; font-size:12px; background:#10b981; color:#fff; border:1px solid #059669; cursor:pointer;" onclick="exportReportToCSV()"><i class="fas fa-file-csv"></i> Export CSV</button>
                    <button class="btn-action" style="padding:4px 12px; font-size:12px; background:#fff; border:1px solid #ccc; cursor:pointer;" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
`;
html = html.replace('<button class="btn-action" style="padding:4px 12px; font-size:12px; background:#fff; border:1px solid #ccc; cursor:pointer;" onclick="window.print()"><i class="fas fa-print"></i> Print</button>', exportCsvBtn);

// Group by logic in renderTableReport
// We'll wrap the renderTableReport with a new version that checks for grouping
const newRenderTableReport = `
        function exportReportToCSV() {
            const title = document.getElementById('modal-report-title').textContent || 'Export';
            const table = document.querySelector('#report-viewer-content table');
            if (!table) return alert('No table data to export');
            let csv = [];
            for (let i = 0; i < table.rows.length; i++) {
                let row = [], cols = table.rows[i].querySelectorAll('td, th');
                for (let j = 0; j < cols.length; j++) {
                    let data = cols[j].innerText.replace(/(\\r\\n|\\n|\\r)/gm, ' ').replace(/"/g, '""');
                    row.push('"' + data + '"');
                }
                csv.push(row.join(','));
            }
            const csvData = new Blob([csv.join('\\n')], { type: 'text/csv' });
            const csvUrl = URL.createObjectURL(csvData);
            const hiddenElement = document.createElement('a');
            hiddenElement.href = csvUrl;
            hiddenElement.target = '_blank';
            hiddenElement.download = title.replace(/\\s+/g, '_') + '_' + new Date().toISOString().slice(0,10) + '.csv';
            hiddenElement.click();
        }

        function renderTableReport(name, headers, rows) {
            const container = document.getElementById('report-viewer-content');
            
            let html = \`
                <div style="max-width:1000px; margin:0 auto;">
                    <div style="text-align:center; margin-bottom:30px;">
                        <h2 style="margin:0; letter-spacing:1px;">SOHAR DENTAL LAB</h2>
                        <p style="margin:5px 0; color:#666; font-size:14px;">Operational Excellence Report</p>
                        <h3 style="margin:20px 0 10px 0; color:#1a56db; text-transform:uppercase;">\${name}</h3>
                        <p style="font-size:11px; color:#999;">Generated on \${new Date().toLocaleString()}</p>
                    </div>
            \`;

            if (name === 'Due Date wise Order Jobs' || name === 'Orders Jobs- by Due Date') {
                // Group by Due Date (index 0)
                const grouped = {};
                rows.forEach(r => {
                    const date = r[0];
                    if (!grouped[date]) grouped[date] = [];
                    grouped[date].push(r);
                });
                
                Object.keys(grouped).forEach(date => {
                    html += \`
                        <h4 style="background:#e5e7eb; padding:8px 12px; margin-top:20px; margin-bottom:0; font-size:14px; border:1px solid #ccc; border-bottom:none;">Due Date: \${date}</h4>
                        <table style="width:100%; border-collapse:collapse; font-size:13px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom:20px;">
                            <thead>
                                <tr style="background:#f3f4f6; text-align:left;">
                                    \${headers.slice(1).map(h => \`<th style="padding:10px; border:1px solid #ccc; border-bottom:2px solid #ccc;">\${h}</th>\`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                    \`;
                    grouped[date].forEach(row => {
                        html += \`<tr style="background:#fff;">\${row.slice(1).map((val, idx) => {
                            const align = (!isNaN(parseFloat(val)) && headers[idx+1].toLowerCase().includes('amount')) ? 'right' : 'left';
                            return \`<td style="padding:8px 10px; border:1px solid #e5e7eb; text-align:\${align};">\${val}</td>\`;
                        }).join('')}</tr>\`;
                    });
                    html += \`</tbody></table>\`;
                });
            } else {
                // Default flat table
                let total = 0;
                const numericColIdx = headers.findIndex(h => h.toLowerCase().includes('amount') || h.toLowerCase().includes('total') || h.toLowerCase().includes('balance'));
                
                if (numericColIdx !== -1) {
                    rows.forEach(row => {
                        const val = parseFloat(row[numericColIdx].replace(/,/g, ''));
                        if (!isNaN(val)) total += val;
                    });
                }
                
                html += \`
                    <table style="width:100%; border-collapse:collapse; font-size:13px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <thead>
                            <tr style="background:#f3f4f6; text-align:left;">
                                \${headers.map(h => \`<th style="padding:10px; border:1px solid #ccc; border-bottom:2px solid #ccc;">\${h}</th>\`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                \`;
                rows.forEach(row => {
                    html += \`<tr style="background:#fff; transition:background 0.2s;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='#fff'">
                        \${row.map((val, idx) => {
                            const align = idx === numericColIdx ? 'right' : 'left';
                            const bold = idx === numericColIdx ? 'font-weight:600;' : '';
                            return \`<td style="padding:8px 10px; border:1px solid #e5e7eb; text-align:\${align}; \${bold}">\${val}</td>\`;
                        }).join('')}
                    </tr>\`;
                });
                html += \`</tbody>\`;
                if (numericColIdx !== -1) {
                    html += \`
                        <tfoot>
                            <tr style="background:#f3f4f6; font-weight:bold;">
                                \${headers.map((h, i) => i === numericColIdx ? \`<td style="padding:10px; border:1px solid #ccc; text-align:right;">\${total.toFixed(2)}</td>\` : (i === 0 ? \`<td style="padding:10px; border:1px solid #ccc; text-align:right;" colspan="\${numericColIdx}">Total</td>\` : (i < numericColIdx ? '' : \`<td style="padding:10px; border:1px solid #ccc;"></td>\`))).join('')}
                            </tr>
                        </tfoot>
                    \`;
                }
                html += \`</table>\`;
            }

            html += \`</div>\`;
            container.innerHTML = html;
        }
`;

// Replace the old renderTableReport
const startRegex = /function renderTableReport\(name, headers, rows\) \{/;
// Wait, regex replacement for a big chunk is risky. Let's do it cleanly by finding start and end.
const startIdx = html.indexOf('function renderTableReport(name, headers, rows) {');
if (startIdx !== -1) {
    const nextFuncIdx = html.indexOf('</script>', startIdx);
    if (nextFuncIdx !== -1) {
        const pre = html.substring(0, startIdx);
        const post = html.substring(nextFuncIdx);
        html = pre + newRenderTableReport + '\n    ' + post;
    }
}

fs.writeFileSync('reports.html', html);
console.log('Fixed reports.html (Due Date grouping & Export CSV)');
