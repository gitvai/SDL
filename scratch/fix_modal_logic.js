const fs = require('fs');

function fixDetectionLogic(file) {
    let html = fs.readFileSync(file, 'utf8');
    
    // We will replace the openGridSettingsModal function body
    const searchFunctionStart = `function openGridSettingsModal(event) {`;
    const searchFunctionEndStr = `            renderColumnsTable();\n        }`;
    const startIdx = html.indexOf(searchFunctionStart);
    if (startIdx !== -1) {
        const endIdx = html.indexOf(searchFunctionEndStr, startIdx) + searchFunctionEndStr.length;
        const oldFunc = html.substring(startIdx, endIdx);
        
        // We also need to fix the logic in setTimeout and window.loadTab
        // Let's replace the whole script block that we injected
        const blockStart = `// --- GRID SETTINGS MODAL LOGIC ---`;
        const blockEnd = `// --- END GRID SETTINGS MODAL LOGIC ---`;
        const bStartIdx = html.indexOf(blockStart);
        const bEndIdx = html.indexOf(blockEnd) + blockEnd.length;
        
        if (bStartIdx !== -1 && bEndIdx !== -1) {
            let block = html.substring(bStartIdx, bEndIdx);
            
            // Replace the type detection logic
            const newDetectionLogic = `
        function detectActiveType() {
            let type = '';
            const profileTabActive = document.querySelector('.profile-tab.active');
            if (profileTabActive) {
                const tabText = profileTabActive.textContent.trim().toLowerCase();
                if (tabText === 'summary') type = 'client-summary';
                else if (tabText === 'shipments' || tabText === 'notes') type = 'note';
                else if (tabText === 'orders') type = 'order';
                else if (tabText === 'invoices') type = 'invoice';
                else if (tabText === 'payments' || tabText === 'receipts') type = 'receipt';
                else type = 'order';
            } else {
                const title = document.getElementById('page-title');
                const titleText = title ? title.textContent.trim().toLowerCase() : '';
                
                if ('${file}' === 'shipments.html') {
                    if (titleText.includes('note')) type = 'note';
                    else type = 'order';
                } else {
                    if (titleText.includes('invoice')) type = 'invoice';
                    else if (titleText.includes('receipt') || titleText.includes('payment')) type = 'receipt';
                    else if (titleText.includes('journal') || titleText.includes('credit') || titleText.includes('adjustment')) type = 'adjustment';
                    else type = 'invoice';
                }
            }
            return type;
        }`;

            // We will inject detectActiveType() at the top of the block
            block = block.replace(`let currentActiveTabSettingsType = 'invoice';`, `let currentActiveTabSettingsType = 'invoice';\n` + newDetectionLogic);
            
            // In openGridSettingsModal
            block = block.replace(
                `const activeTabBtn = document.querySelector('.tab-btn.active');\n            if(!activeTabBtn) return;\n            \n            if ('${file}' === 'shipments.html') {\n                currentActiveTabSettingsType = 'client-summary';\n                if(activeTabBtn.dataset.tab === 'notes') currentActiveTabSettingsType = 'note';\n                else if(activeTabBtn.dataset.tab === 'orders') currentActiveTabSettingsType = 'order';\n            } else {\n                currentActiveTabSettingsType = 'invoice';\n                if(activeTabBtn.dataset.tab === 'orders') currentActiveTabSettingsType = 'order';\n                else if(activeTabBtn.dataset.tab === 'receipts') currentActiveTabSettingsType = 'receipt';\n                else if(activeTabBtn.dataset.tab === 'adjustments') currentActiveTabSettingsType = 'adjustment';\n            }`,
                `currentActiveTabSettingsType = detectActiveType();\n            if(!ALL_COLUMNS_DEF[currentActiveTabSettingsType]) currentActiveTabSettingsType = Object.keys(ALL_COLUMNS_DEF)[0];`
            );
            
            // In setTimeout
            block = block.replace(
                `const activeTabBtn = document.querySelector('.tab-btn.active');\n            if(activeTabBtn) {\n                let type = '';\n                if ('${file}' === 'shipments.html') {\n                    type = 'client-summary';\n                    if(activeTabBtn.dataset.tab === 'notes') type = 'note';\n                    else if(activeTabBtn.dataset.tab === 'orders') type = 'order';\n                } else {\n                    type = 'invoice';\n                    if(activeTabBtn.dataset.tab === 'orders') type = 'order';\n                    else if(activeTabBtn.dataset.tab === 'receipts') type = 'receipt';\n                    else if(activeTabBtn.dataset.tab === 'adjustments') type = 'adjustment';\n                }\n                applyColumnVisibility(type);\n            }`,
                `let type = detectActiveType();\n            if(ALL_COLUMNS_DEF[type]) applyColumnVisibility(type);`
            );
            
            // In window.loadTab
            block = block.replace(
                `let type = '';\n                if ('${file}' === 'shipments.html') {\n                    type = 'client-summary';\n                    if(tabId === 'notes') type = 'note';\n                    else if(tabId === 'orders') type = 'order';\n                } else {\n                    type = 'invoice';\n                    if(tabId === 'orders') type = 'order';\n                    else if(tabId === 'receipts') type = 'receipt';\n                    else if(tabId === 'adjustments') type = 'adjustment';\n                }`,
                `setTimeout(() => { let type = detectActiveType(); if(ALL_COLUMNS_DEF[type]) applyColumnVisibility(type); }, 100);`
            );
            
            // We also need to hook into sidebar clicks so visibility is updated!
            const sidebarHook = `
            document.querySelectorAll('.sidebar-link').forEach(link => {
                link.addEventListener('click', () => {
                    setTimeout(() => { let type = detectActiveType(); if(ALL_COLUMNS_DEF[type]) applyColumnVisibility(type); }, 100);
                });
            });
            `;
            block = block.replace(`// --- END GRID SETTINGS MODAL LOGIC ---`, sidebarHook + `\n        // --- END GRID SETTINGS MODAL LOGIC ---`);
            
            html = html.substring(0, bStartIdx) + block + html.substring(bEndIdx);
            fs.writeFileSync(file, html);
            console.log(file + ' logic fixed.');
        }
    }
}

fixDetectionLogic('shipments.html');
fixDetectionLogic('accounts.html');
