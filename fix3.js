const fs = require('fs');

['new-order.html', 'edit-order.html'].forEach(filename => {
    let html = fs.readFileSync(filename, 'utf8');

    // 1. Add JOB_COLORS
    if (!html.includes('const JOB_COLORS')) {
        html = html.replace('let allClients = [];', `const JOB_COLORS = ['#ec4899', '#9f1239', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316'];\n        let allClients = [];`);
    }

    // 2. Add color property in saveAndAddNewJob
    if(!html.includes('JOB_COLORS[editingJobIndex % JOB_COLORS.length]')) {
        html = html.replace(
            /if \(editingJobIndex >= 0\) \{\s+orderJobs\[editingJobIndex\] = job;\s+editingJobIndex = -1;\s+\} else \{\s+orderJobs\.push\(job\);\s+\}/,
            `if (editingJobIndex >= 0) {
                job.color = orderJobs[editingJobIndex].color || JOB_COLORS[editingJobIndex % JOB_COLORS.length];
                orderJobs[editingJobIndex] = job;
                editingJobIndex = -1;
            } else {
                job.color = JOB_COLORS[orderJobs.length % JOB_COLORS.length];
                orderJobs.push(job);
            }`
        );
    }

    // 3. Replace updateTeethUI safely
    if(!html.includes('el.style.border = \'2px solid \' + activeColor')) {
        const updateTeethUIPattern = /function updateTeethUI[\s\S]*?(?=function cancelTeethSelection)/;
        html = html.replace(updateTeethUIPattern, `function updateTeethUI(fromRateInput = false, fromManualTeeth = false, fromManualUnit = false) {
            let unitCount;
            if (fromManualUnit) {
                unitCount = parseInt(document.getElementById('unit-count').value) || 0;
            } else if (fromRateInput) {
                unitCount = parseInt(document.getElementById('unit-count').value) || 0;
                if (selectedTeeth.length > 0 && unitCount === 0) {
                    unitCount = selectedTeeth.length;
                    document.getElementById('unit-count').value = unitCount;
                }
            } else {
                unitCount = selectedTeeth.length;
                document.getElementById('unit-count').value = unitCount;
            }
            if(document.getElementById('slab-total-units')) document.getElementById('slab-total-units').value = unitCount;
            
            if (!fromManualTeeth) {
                document.getElementById('selected-teeth-list').value = selectedTeeth.every(t => !isNaN(t)) ? [...selectedTeeth].sort((a,b) => a - b).join(', ') : selectedTeeth.join(', ');
            }
            
            const rateInput = document.getElementById('unit-rate');
            const slab1RateInput = document.getElementById('slab1-rate');
            const slab2RateInput = document.getElementById('slab2-rate');
            const totalText = document.getElementById('total-price');

            let total = 0;
            const slabsContainer = document.getElementById('slabs-container');
            const isSlabActive = slabsContainer && slabsContainer.style.display === 'block';

            if (isSlabActive) {
                const s1Rate = parseFloat(slab1RateInput.value) || 0;
                const s2Rate = parseFloat(slab2RateInput.value) || 0;
                
                let slab1Units = Math.min(unitCount, 1);
                let slab2Units = Math.max(0, unitCount - 1);
                
                if(document.getElementById('slab1-units-display')) document.getElementById('slab1-units-display').textContent = slab1Units + ' / 1';
                if(document.getElementById('slab2-units-display')) document.getElementById('slab2-units-display').textContent = slab2Units;
                
                total = (slab1Units * s1Rate) + (slab2Units * s2Rate);
                if(document.getElementById('slab-total-display')) document.getElementById('slab-total-display').textContent = total.toFixed(2);
            } else {
                const rate = parseFloat(rateInput.value) || 0;
                total = unitCount * rate;
            }
            
            totalText.value = total.toFixed(2);

            // Apply visual colors
            document.querySelectorAll('#teeth-selection-area .tooth-num').forEach(el => {
                el.style.border = '';
                el.style.color = '';
                el.style.backgroundColor = '';
                el.classList.remove('selected');
            });

            if (typeof orderJobs !== 'undefined') {
                orderJobs.forEach((job, idx) => {
                    if (typeof editingJobIndex !== 'undefined' && editingJobIndex === idx) return;
                    if (job.teeth && Array.isArray(job.teeth)) {
                        job.teeth.forEach(t => {
                            if(isNaN(t)) return;
                            const el = document.querySelector('#teeth-selection-area .tooth-num[onclick*="' + t + '"]');
                            if (el) {
                                el.style.border = '2px solid ' + (job.color || '#ec4899');
                                el.style.color = (job.color || '#ec4899');
                                el.style.borderRadius = '50%';
                            }
                        });
                    }
                });
            }

            let activeColor = '#ec4899';
            if (typeof editingJobIndex !== 'undefined' && editingJobIndex !== -1 && orderJobs[editingJobIndex]) {
                activeColor = orderJobs[editingJobIndex].color || activeColor;
            } else if (typeof orderJobs !== 'undefined') {
                activeColor = JOB_COLORS[orderJobs.length % JOB_COLORS.length] || activeColor;
            }

            selectedTeeth.forEach(t => {
                if(isNaN(t)) return;
                const el = document.querySelector('#teeth-selection-area .tooth-num[onclick*="' + t + '"]');
                if (el) {
                    el.classList.add('selected');
                    el.style.backgroundColor = activeColor;
                    el.style.color = '#fff';
                    el.style.border = '2px solid ' + activeColor;
                    el.style.borderRadius = '50%';
                }
            });
        }

        `);
    }

    // 4. Replace renderJobsList safely
    if(!html.includes('function generateGlobalTeethGridHTML()')) {
        let endMatch;
        if (filename === 'new-order.html') {
            endMatch = html.match(/function handleStatusChange\(\) \{/);
        } else {
            endMatch = html.match(/function handleStatusChange\(\) \{/);
            if (!endMatch) endMatch = html.match(/function showAddProductModal\(\) \{/);
            if (!endMatch) endMatch = html.match(/function removeJob\(/);
        }
        
        let startIdx = html.indexOf('function renderJobsList() {');
        let endIdx = endMatch ? endMatch.index : -1;
        
        if (startIdx !== -1 && endIdx !== -1) {
            let oldFunc = html.substring(startIdx, endIdx);

            html = html.replace(oldFunc, `function generateQuadrantHTML(teeth, isLeft) {
            let html = '<div style="display:flex; gap:6px;">';
            teeth.forEach(t => {
                let circleColors = [];
                if (typeof orderJobs !== 'undefined') {
                    orderJobs.forEach((j, idx) => {
                        if (j.teeth && j.teeth.includes(t.toString())) {
                            circleColors.push(j.color || '#ec4899');
                        }
                    });
                }
                let style = 'width:22px; height:22px; text-align:center; font-weight:600; color:#444; display:flex; justify-content:center; align-items:center; box-sizing:border-box;';
                if (circleColors.length > 0) {
                    let mainColor = circleColors[0];
                    style += 'border: 2px solid ' + mainColor + '; border-radius: 50%; color: ' + mainColor + ';';
                }
                let displayNum = (t % 10);
                html += '<div style="' + style + '">' + displayNum + '</div>';
            });
            html += '</div>';
            return html;
        }

        function generateGlobalTeethGridHTML() {
            if (typeof orderJobs === 'undefined' || orderJobs.length === 0) return '';
            let html = '<div style="display:flex; justify-content:center; margin-bottom: 20px; user-select:none; font-size:18px;">';
            html += '<div style="display:flex; flex-direction:column; align-items:center; gap:0;">';
            html += '<div style="display:flex; gap:12px; align-items:center; border-bottom: 1px solid #444; padding-bottom:6px;">';
            html += generateQuadrantHTML([18,17,16,15,14,13,12,11], true) + '<div style="width:1px; height:25px; background:#444;"></div>' + generateQuadrantHTML([21,22,23,24,25,26,27,28], false);
            html += '</div>';
            html += '<div style="display:flex; gap:12px; align-items:center; padding-top:6px;">';
            html += generateQuadrantHTML([48,47,46,45,44,43,42,41], true) + '<div style="width:1px; height:25px; background:#444;"></div>' + generateQuadrantHTML([31,32,33,34,35,36,37,38], false);
            html += '</div>';
            html += '</div></div>';
            return html;
        }

        function renderJobsList() {
            const container = document.getElementById('jobs-container');
            const wrapper = document.getElementById('added-jobs-list');
            if (orderJobs.length > 0) {
                wrapper.style.display = 'block';
                let html = generateGlobalTeethGridHTML();
                html += '<div style="display:flex; flex-direction:column; gap:10px;">';
                orderJobs.forEach((j, idx) => {
                    const color = j.color || '#ec4899';
                    const teethStr = j.teeth && j.teeth.length > 0 && j.teeth.every(t => !isNaN(t)) ? j.teeth.sort((a,b) => a - b).join(',') : (j.teeth ? j.teeth.join(', ') : '');
                    const productType = j.productType || 'General';
                    html += '<div style="border-bottom:1px solid #ddd; padding-bottom:10px; font-size:13px; position:relative;">';
                    html += '    <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">';
                    html += '        <div style="width:14px; height:14px; background:' + color + '; border:1px solid #ccc;"></div>';
                    html += '        <div style="border:1px solid #ccc; padding:2px 6px; font-size:11px; color:#555; background:#f9f9f9; border-radius:3px;">' + productType + '</div>';
                    html += '        <div style="border:1px solid ' + color + '; padding:2px 6px; font-size:11px; color:' + color + '; text-transform:uppercase; border-radius:3px; font-weight:600;">' + productType + '</div>';
                    html += '    </div>';
                    html += '    <div style="display:flex; align-items:center; gap:10px; font-weight:bold; font-size:14px; color:#0056b3;">';
                    html += '        <div>' + j.product + '</div>';
                    html += '        <div style="color:#333;">' + teethStr + '</div>';
                    html += '    </div>';
                    html += '    <div style="display:flex; align-items:center; gap:20px; margin-top:4px; color:#555;">';
                    html += '        <div>' + j.units + ' Units @' + j.rate + '</div>';
                    html += '        <div>Total charge: <span style="font-weight:bold; color:#111;">' + parseFloat(j.total).toFixed(2) + '</span></div>';
                    html += '    </div>';
                    html += '    <div style="position:absolute; right:0; bottom:10px; display:flex; gap:10px;">';
                    html += '        <button type="button" onclick="editJobInList(' + idx + ')" style="padding:4px 8px; border:1px solid #ccc; background:#fff; cursor:pointer; color:#0056b3; border-radius:3px;"><i class="fas fa-edit"></i></button>';
                    html += '        <button type="button" onclick="removeJob(' + idx + ')" style="padding:4px 8px; border:1px solid #ec4899; background:#fff; cursor:pointer; color:#ec4899; border-radius:3px;"><i class="fas fa-trash"></i></button>';
                    html += '    </div>';
                    html += '</div>';
                });
                html += '</div>';
                container.innerHTML = html;
            } else {
                wrapper.style.display = 'none';
                container.innerHTML = '';
            }
        }

        `);
        }
    }

    fs.writeFileSync(filename, html);
    console.log("Fixed " + filename);
});
