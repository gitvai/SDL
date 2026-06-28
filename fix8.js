const fs = require('fs');

function fixHtml(file) {
    let content = fs.readFileSync(file, 'utf8');

    // Find updateTeethUI
    const startIdx = content.indexOf('function updateTeethUI(fromRateInput = false, fromManualTeeth = false, fromManualUnit = false) {');
    if (startIdx === -1) {
        console.error("Could not find updateTeethUI in", file);
        return;
    }
    
    // Find the end of updateTeethUI
    // It's followed by `function handleAddProductFromBottom()`
    const nextFuncIdx = content.indexOf('function handleAddProductFromBottom()', startIdx);
    
    // But updateTeethUI ends with:
    // document.getElementById('order-details-area').style.display = 'block';
    // }
    const endStr = "document.getElementById('order-details-area').style.display = 'block';\n        }";
    const endIdx = content.indexOf(endStr, startIdx);
    
    if (endIdx === -1 || endIdx > nextFuncIdx) {
        console.error("Could not find end of updateTeethUI in", file);
        return;
    }
    
    const realEndIdx = endIdx + endStr.length;
    
    const newUpdateTeethUI = `function updateTeethUI(fromRateInput = false, fromManualTeeth = false, fromManualUnit = false) {
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
                const s1r = parseFloat(slab1RateInput.value) || 0;
                const s2r = parseFloat(slab2RateInput.value) || 0;
                if (unitCount >= 1) {
                    total = s1r + (unitCount - 1) * s2r;
                }
            } else {
                const rate = parseFloat(rateInput.value) || 0;
                total = unitCount * rate;
            }
            
            totalText.value = total.toFixed(2);
            
            let activeColor = '#ec4899';
            if (typeof editingJobIndex !== 'undefined' && editingJobIndex >= 0 && orderJobs[editingJobIndex]) {
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
                
                // Parse correct tNum from onclick attribute!
                const onclickAttr = el.getAttribute('onclick');
                if (!onclickAttr) return;
                const match = onclickAttr.match(/toggleTooth\\(this,\\s*(\\d+)\\)/);
                if (!match) return;
                const tNum = parseInt(match[1]);
                
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

            if (selectedTeeth.length > 0 || unitCount > 0) {
                document.getElementById('teeth-grid-container').style.display = 'block';
            }
            document.getElementById('order-details-area').style.display = 'block';
        }`;

    content = content.substring(0, startIdx) + newUpdateTeethUI + content.substring(realEndIdx);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Fixed", file);
}

fixHtml('new-order.html');
fixHtml('edit-order.html');
