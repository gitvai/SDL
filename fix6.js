const fs = require('fs');

function replaceFunctions(filename) {
    let html = fs.readFileSync(filename, 'utf8');

    // Replace generateQuadrantHTML
    let pattern1 = /function generateQuadrantHTML\([\s\S]*?return html;\s*\}/;
    let newFunc1 = `function generateQuadrantHTML(teeth, isLeft) {
            let html = '<div style="display:flex; gap:6px;">';
            teeth.forEach(t => {
                let circleColors = [];
                if (typeof orderJobs !== 'undefined') {
                    orderJobs.forEach((j, idx) => {
                        let c = j.color || JOB_COLORS[idx % JOB_COLORS.length] || '#ec4899';
                        if (j.teeth && (j.teeth.includes(t.toString()) || j.teeth.includes(parseInt(t)))) {
                            if (!circleColors.includes(c)) circleColors.push(c);
                        }
                    });
                }
                
                let style = 'width:22px; height:22px; text-align:center; font-weight:600; color:#444; display:flex; justify-content:center; align-items:center; box-sizing:border-box; border-radius:50%; ';
                
                if (circleColors.length === 1) {
                    style += 'border: 2px solid ' + circleColors[0] + '; color: ' + circleColors[0] + ';';
                } else if (circleColors.length > 1) {
                    let stops = [];
                    let step = 100 / circleColors.length;
                    circleColors.forEach((c, i) => {
                        stops.push(c + ' ' + (i * step) + '% ' + ((i + 1) * step) + '%');
                    });
                    style += 'border: 2px solid transparent; color: ' + circleColors[0] + '; ';
                    style += 'background: linear-gradient(white, white) padding-box, conic-gradient(' + stops.join(', ') + ') border-box;';
                }
                
                let displayNum = (t % 10);
                html += '<div style="' + style + '">' + displayNum + '</div>';
            });
            html += '</div>';
            return html;
        }`;
    html = html.replace(pattern1, newFunc1);

    // Replace updateTeethUI
    let pattern2 = /function updateTeethUI\([\s\S]*?(?=function confirmTeeth)/;
    let newFunc2 = `function updateTeethUI(fromRateInput = false, fromManualTeeth = false, fromManualUnit = false) {
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

            let activeColor = '#ec4899';
            if (typeof editingJobIndex !== 'undefined' && editingJobIndex !== -1 && orderJobs[editingJobIndex]) {
                activeColor = orderJobs[editingJobIndex].color || activeColor;
            } else if (typeof orderJobs !== 'undefined') {
                activeColor = JOB_COLORS[orderJobs.length % JOB_COLORS.length] || activeColor;
            }

            // Apply visual colors
            document.querySelectorAll('#teeth-selection-area .tooth-num').forEach(el => {
                el.style.border = '';
                el.style.color = '';
                el.style.background = '';
                el.style.backgroundColor = '';
                el.classList.remove('selected');
                
                const tNum = parseInt(el.getAttribute('data-tooth') || el.textContent);
                
                let circleColors = [];
                if (typeof orderJobs !== 'undefined') {
                    orderJobs.forEach((job, idx) => {
                        if (typeof editingJobIndex !== 'undefined' && editingJobIndex === idx) return;
                        if (job.teeth && (job.teeth.includes(tNum.toString()) || job.teeth.includes(tNum))) {
                            let c = job.color || JOB_COLORS[idx % JOB_COLORS.length] || '#ec4899';
                            if (!circleColors.includes(c)) circleColors.push(c);
                        }
                    });
                }
                
                let isSelected = selectedTeeth.includes(tNum) || selectedTeeth.includes(tNum.toString());
                if (isSelected) {
                    el.classList.add('selected');
                }
                
                let innerBg = isSelected ? activeColor : 'white';
                let textColor = isSelected ? 'white' : (circleColors.length > 0 ? circleColors[0] : '');

                if (circleColors.length === 0) {
                    if (isSelected) {
                        el.style.backgroundColor = activeColor;
                        el.style.color = textColor;
                        el.style.border = '2px solid ' + activeColor;
                        el.style.borderRadius = '50%';
                    }
                } else if (circleColors.length === 1) {
                    el.style.border = '2px solid ' + circleColors[0];
                    el.style.backgroundColor = innerBg;
                    el.style.color = textColor;
                    el.style.borderRadius = '50%';
                } else {
                    let stops = [];
                    let step = 100 / circleColors.length;
                    circleColors.forEach((c, i) => {
                        stops.push(c + ' ' + (i * step) + '% ' + ((i + 1) * step) + '%');
                    });
                    el.style.border = '2px solid transparent';
                    el.style.background = 'linear-gradient(' + innerBg + ',' + innerBg + ') padding-box, conic-gradient(' + stops.join(', ') + ') border-box';
                    el.style.color = textColor;
                    el.style.borderRadius = '50%';
                }
            });
        }

        `;
    
    html = html.replace(pattern2, newFunc2);
    fs.writeFileSync(filename, html);
    console.log("Updated " + filename);
}

replaceFunctions('new-order.html');
replaceFunctions('edit-order.html');
