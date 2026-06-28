const fs = require('fs');

const missingCode = fs.readFileSync('missing-code.js', 'utf8');

// The new renderJobsList block
const newRenderJobsList = `
        function generateQuadrantHTML(teeth, isLeft) {
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
`;

// Replace old renderJobsList in missingCode
const renderJobsPattern = /function renderJobsList\(\) \{[\s\S]*?(?=function handleStatusChange)/;
let modifiedCode = missingCode.replace(renderJobsPattern, newRenderJobsList + '\n        ');

// Add job.color logic to saveAndAddNewJob
modifiedCode = modifiedCode.replace(
    /if \(editingJobIndex >= 0\) \{\s*orderJobs\[editingJobIndex\] = job;\s*editingJobIndex = -1;\s*\} else \{\s*orderJobs\.push\(job\);\s*\}/,
    `if (editingJobIndex >= 0) {
                job.color = orderJobs[editingJobIndex].color || JOB_COLORS[editingJobIndex % JOB_COLORS.length];
                orderJobs[editingJobIndex] = job;
                editingJobIndex = -1;
            } else {
                job.color = JOB_COLORS[orderJobs.length % JOB_COLORS.length];
                orderJobs.push(job);
            }`
);

['new-order.html', 'edit-order.html'].forEach(filename => {
    let html = fs.readFileSync(filename, 'utf8');

    // Only inject if confirmTeeth is missing
    if (!html.includes('function confirmTeeth()')) {
        html = html.replace('function cancelTeethSelection() {', modifiedCode + '\n        function cancelTeethSelection() {');
        fs.writeFileSync(filename, html);
        console.log("Injected missing code into " + filename);
    } else {
        console.log(filename + " already has confirmTeeth");
    }
});
