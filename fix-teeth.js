const fs = require('fs');

function processFile(filename) {
    let html = fs.readFileSync(filename, 'utf8');

    // 1. Add JOB_COLORS right after let orderJobs = []; or similar
    if (!html.includes('const JOB_COLORS')) {
        html = html.replace('let allClients = [];', `const JOB_COLORS = ['#ec4899', '#9f1239', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316'];\n        let allClients = [];`);
    }

    // 2. In saveAndAddNewJob, assign color
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

    // 3. Update updateTeethUI to render multi-colors
    // Find updateTeethUI start
    const updateTeethUIPattern = /function updateTeethUI\(fromRateInput = false, fromManualTeeth = false, fromManualUnit = false\) \{/;
    html = html.replace(updateTeethUIPattern, `function updateTeethUI(fromRateInput = false, fromManualTeeth = false, fromManualUnit = false) {
            // Reset all visual states
            document.querySelectorAll('#teeth-selection-area .tooth-num').forEach(el => {
                el.style.border = '';
                el.style.color = '';
                el.style.backgroundColor = '';
                el.classList.remove('selected');
            });

            // Draw outlines for previously added jobs
            if (typeof orderJobs !== 'undefined') {
                orderJobs.forEach((job, idx) => {
                    if (typeof editingJobIndex !== 'undefined' && editingJobIndex === idx) return; // Skip if currently editing this job
                    if (job.teeth && Array.isArray(job.teeth)) {
                        job.teeth.forEach(t => {
                            if(isNaN(t)) return; // skip custom text
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

            // Draw solid fill for currently selected teeth
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
`);

    fs.writeFileSync(filename, html);
    console.log("Processed " + filename);
}

processFile('new-order.html');
processFile('edit-order.html');
