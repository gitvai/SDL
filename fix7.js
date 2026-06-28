const fs = require('fs');
['new-order.html', 'edit-order.html'].forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    const updateUiStart = 'function updateTeethUI(fromRateInput = false, fromManualTeeth = false, fromManualUnit = false) {';
    
    if (code.includes(updateUiStart)) {
        if (!code.includes('// teeth selector grid multi-color inject')) {
            const injection = `
            document.querySelectorAll('.tooth-num').forEach(el => {
                const onclickAttr = el.getAttribute('onclick');
                if (!onclickAttr) return;
                const match = onclickAttr.match(/toggleTooth\\(this,\\s*(\\d+)\\)/);
                if (!match) return;
                const tNum = parseInt(match[1]);

                let circleColors = []; // teeth selector grid multi-color inject
                if (typeof orderJobs !== 'undefined') {
                    orderJobs.forEach((job, idx) => {
                        if (typeof editingJobIndex !== 'undefined' && editingJobIndex === idx) return;
                        if (job.teeth && (job.teeth.includes(tNum.toString()) || job.teeth.includes(tNum))) {
                            let c = job.color || JOB_COLORS[idx % JOB_COLORS.length] || '#ec4899';
                            if (!circleColors.includes(c)) circleColors.push(c);
                        }
                    });
                }
                
                if (selectedTeeth.includes(tNum.toString()) || selectedTeeth.includes(tNum)) {
                    let currentColor = '#ec4899';
                    if (typeof editingJobIndex !== 'undefined' && editingJobIndex >= 0 && orderJobs[editingJobIndex]) {
                        currentColor = orderJobs[editingJobIndex].color || JOB_COLORS[editingJobIndex % JOB_COLORS.length] || '#ec4899';
                    } else if (typeof orderJobs !== 'undefined') {
                        currentColor = JOB_COLORS[orderJobs.length % JOB_COLORS.length] || '#ec4899';
                    }
                    if (!circleColors.includes(currentColor)) circleColors.push(currentColor);
                }

                if (circleColors.length === 0) {
                    el.style.background = 'transparent';
                    el.style.color = '#0056b3';
                    el.style.border = 'none';
                    el.classList.remove('selected');
                } else if (circleColors.length === 1) {
                    el.style.background = circleColors[0];
                    el.style.color = '#fff';
                    el.style.borderRadius = '50%';
                    el.style.border = 'none';
                    el.classList.add('selected');
                } else {
                    let stops = [];
                    let step = 100 / circleColors.length;
                    circleColors.forEach((c, i) => {
                        stops.push(c + ' ' + (i * step) + '% ' + ((i + 1) * step) + '%');
                    });
                    el.style.background = 'linear-gradient(white, white) padding-box, conic-gradient(' + stops.join(', ') + ') border-box';
                    el.style.color = circleColors[0];
                    el.style.border = '2px solid transparent';
                    el.style.borderRadius = '50%';
                    el.classList.add('selected');
                }
            });
`;
            code = code.replace(updateUiStart, updateUiStart + '\n' + injection);
            fs.writeFileSync(file, code);
            console.log('Fixed ' + file);
        } else {
            console.log(file + ' already has the fix inside updateTeethUI');
        }
    }
});
