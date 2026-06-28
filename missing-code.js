        function confirmTeeth() {

            // Auto-fill patient name in the detailed form if it was entered earlier
            const topPatientName = document.getElementById('patient-name').value;
            if (topPatientName && !document.getElementById('patient-name-detail').value) {
                document.getElementById('patient-name-detail').value = topPatientName;
            }
            document.getElementById('order-details-area').style.display = 'block';
        }

        let orderJobs = [];
        let editingJobIndex = -1;

        function handleAddProductFromBottom() {
            if (selectedProduct) {
                // If a product is currently active, save it first
                saveAndAddNewJob();
                // Then scroll back up to the product selection area
                document.getElementById('step-2').scrollIntoView({ behavior: 'smooth' });
            } else {
                // If no product is currently active, just scroll back up
                document.getElementById('step-2').scrollIntoView({ behavior: 'smooth' });
                alert('Please select a product from the list to add.');
            }
        }

        function saveAndAddNewJob() {
            if (!selectedProduct) {
                alert('Please select a product first.');
                return;
            }
            
            const slabsContainer = document.getElementById('slabs-container');
            const isSlabActive = slabsContainer && slabsContainer.style.display === 'block';

            const customUnitContainer = document.getElementById('custom-unit-text-container');
            let customTeethText = '';
            if (customUnitContainer && customUnitContainer.style.display === 'block') {
                customTeethText = document.getElementById('custom-unit-text').value;
            }

            const job = {
                product: selectedProduct.name,
                productType: selectedProductType || 'General',
                teeth: customTeethText ? [customTeethText] : [...selectedTeeth],
                units: document.getElementById('unit-count').value,
                rate: document.getElementById('unit-rate').value,
                total: document.getElementById('total-price').value,
                slab1Rate: isSlabActive ? parseFloat(document.getElementById('slab1-rate').value) : null,
                slab2Rate: isSlabActive ? parseFloat(document.getElementById('slab2-rate').value) : null,
                slab1Units: isSlabActive ? Math.min(parseInt(document.getElementById('unit-count').value)||0, 1) : null,
                slab2Units: isSlabActive ? Math.max(0, (parseInt(document.getElementById('unit-count').value)||0) - 1) : null
            };

            if (editingJobIndex >= 0) {
                orderJobs[editingJobIndex] = job;
                editingJobIndex = -1;
            } else {
                orderJobs.push(job);
            }
            
            // Show jobs list
            renderJobsList();
            
            // Clear selection
            selectedTeeth = [];
            document.querySelectorAll('.tooth-num.selected').forEach(el => el.classList.remove('selected'));
            updateTeethUI();
            if (customUnitContainer) document.getElementById('custom-unit-text').value = '';
            
            // Back to product selection
            cancelTeethSelection();
            
            alert('Job saved! You can now select another product.');
            console.log("Current Jobs:", orderJobs);
        }


        function removeJob(index) {
            orderJobs.splice(index, 1);
            if (editingJobIndex === index) {
                editingJobIndex = -1;
                selectedTeeth = [];
                document.querySelectorAll('.tooth-num.selected').forEach(el => el.classList.remove('selected'));
                updateTeethUI();
                cancelTeethSelection();
            } else if (editingJobIndex > index) {
                editingJobIndex--;
            }
            renderJobsList();
        }

        function editJobInList(idx) {
            editingJobIndex = idx;
            const j = orderJobs[idx];
            
            // Set active selection
            document.getElementById('selected-product-name').textContent = j.product;
            document.getElementById('unit-rate').value = j.rate;
            document.getElementById('unit-count').value = j.units;
            document.getElementById('total-price').value = j.total;
            
            selectedProduct = { name: j.product, charge: j.rate };
            selectedProductType = j.productType || 'General';
            
            selectedTeeth = j.teeth ? [...j.teeth] : [];
            updateTeethUI();
            
            const slabsContainer = document.getElementById('slabs-container');
            const slabProducts = ['RPD', 'FLEXIBLE RPD', 'CAST PARTIAL', 'RPD REPAIR AND ADD TEETH'];
            const productNameUpper = (j.product || '').toUpperCase();
            const isSlabProduct = slabProducts.some(sp => productNameUpper.includes(sp));
            
            if (slabsContainer) {
                slabsContainer.style.display = isSlabProduct ? 'block' : 'none';
            }
            
            const customUnitContainer = document.getElementById('custom-unit-text-container');
            if (customUnitContainer) {
                customUnitContainer.style.display = isSlabProduct ? 'block' : 'none';
            }
            if (isSlabProduct && customUnitContainer) {
                if (j.teeth && j.teeth.length === 1 && isNaN(j.teeth[0])) {
                    document.getElementById('custom-unit-text').value = j.teeth[0];
                } else {
                    document.getElementById('custom-unit-text').value = '';
                }
            }
            
            const s1 = document.getElementById('slab1-rate');
            if (s1) s1.value = (j.slab1Rate !== null && j.slab1Rate !== undefined) ? j.slab1Rate : j.rate;
            const s2 = document.getElementById('slab2-rate');
            if (s2) s2.value = (j.slab2Rate !== null && j.slab2Rate !== undefined) ? j.slab2Rate : 2;
            
            updateTeethUI();
            
            document.getElementById('product-selection-area').style.display = 'none';
            document.getElementById('teeth-selection-area').style.display = 'block';
        }

        function renderJobsList() {
            const container = document.getElementById('jobs-container');
            const wrapper = document.getElementById('added-jobs-list');
            if (orderJobs.length > 0) {
                wrapper.style.display = 'block';
                let tableHtml = `
                    <div style="overflow-x:auto;">
                    <table style="width:100%; border-collapse: collapse; font-size: 13px; text-align: left; margin-bottom: 10px; border: 1px solid #e5e7eb;">
                        <thead>
                            <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                                <th style="padding: 8px 12px;">#</th>
                                <th style="padding: 8px 12px;">Product</th>
                                <th style="padding: 8px 12px;">Teeth</th>
                                <th style="padding: 8px 12px; text-align:center;">Units</th>
                                <th style="padding: 8px 12px; text-align:right;">Rate/unit</th>
                                <th style="padding: 8px 12px; text-align:right;">Total</th>
                                <th style="padding: 8px 12px; text-align:center;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                orderJobs.forEach((j, idx) => {
                    tableHtml += `
                        <tr style="border-bottom: 1px solid #e5e7eb; background-color: #ffffff;" onmouseover="this.style.backgroundColor='#f3f4f6'" onmouseout="this.style.backgroundColor='#ffffff'">
                            <td style="padding: 8px 12px; color: #6b7280;">${idx + 1}</td>
                            <td style="padding: 8px 12px; font-weight: 600; color: #1f2937;">${j.product}</td>
                            <td style="padding: 8px 12px; color: #4b5563;">${j.teeth ? j.teeth.sort((a,b) => a - b).join(', ') : ''}</td>
                            <td style="padding: 8px 12px; text-align:center; color: #4b5563;">${j.units}</td>
                            <td style="padding: 8px 12px; text-align:right; color: #4b5563;">${j.rate}</td>
                            <td style="padding: 8px 12px; text-align:right; font-weight: 600; color: #111827;">${parseFloat(j.total).toFixed(2)}</td>
                            <td style="padding: 8px 12px; text-align:center;">
                                <button type="button" onclick="editJobInList(${idx})" style="background:none; border:none; color:#3b82f6; font-size:14px; cursor:pointer; margin-right:8px;" title="Edit Job">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button type="button" onclick="removeJob(${idx})" style="background:none; border:none; color:#ef4444; font-size:14px; cursor:pointer;" title="Remove Job">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                tableHtml += `
                        </tbody>
                    </table>
                    </div>
                `;
                
                container.innerHTML = tableHtml;
            } else {
                wrapper.style.display = 'none';
                container.innerHTML = '';
            }
        }

        function handleStatusChange() {
            const status = document.getElementById('order-status').value;
            const area = document.getElementById('hold-reason-area');
            const label = document.getElementById('reason-label');
            
            if (status === 'Hold' || status === 'Cancelled') {
                area.style.display = 'block';
                label.textContent = status + ' Reason';
            } else {
                area.style.display = 'none';
            }
        }

