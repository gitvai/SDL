        async function bulkPrintOrders(type) {
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
                                            Phone : +96899622728<br>email : sohardentallab@gmail.com
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
                        </script>
                    </body>
                    </html>
                `);
                printWin.document.close();
            } catch (err) {
                console.error(err);
                alert('Error generating print view.');
            }
        }
