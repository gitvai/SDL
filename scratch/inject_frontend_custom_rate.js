const fs = require('fs');

function injectFrontendCustomRate() {
    let content = fs.readFileSync('new-order.html', 'utf8');

    const customRateFn = `
        async function fetchCustomRate(clientId, productName) {
            if (!clientId || !productName) return;
            try {
                const res = await fetch(\`\${API_BASE}/client-product-rate?clientId=\${clientId}&productName=\${encodeURIComponent(productName)}\`);
                if (!res.ok) return;
                const data = await res.json();
                if (data && data.rate !== null && data.rate !== undefined) {
                    console.log("Found custom rate for client:", data.rate);
                    
                    const slabsContainer = document.getElementById('slabs-container');
                    const isSlabProduct = slabsContainer && slabsContainer.style.display === 'block';
                    
                    if (isSlabProduct) {
                        const s1 = document.getElementById('slab1-rate');
                        if (s1) s1.value = data.rate;
                    } else {
                        const rateInput = document.getElementById('unit-rate');
                        if (rateInput) rateInput.value = data.rate;
                    }
                    updateTeethUI(true);
                }
            } catch (e) {
                console.error("Error fetching custom rate:", e);
            }
        }
    `;

    // Inject function definition
    if (!content.includes('function fetchCustomRate')) {
        content = content.replace('function selectProduct(p) {', customRateFn + '\n        function selectProduct(p) {');
    }

    // Inject the call inside selectProduct
    const injectCall = `
              if (nameDisplay) nameDisplay.textContent = p.name;
              if (rateInput) rateInput.value = p.charge || 0;
              
              updateTeethUI(true);
              if (window.fetchCustomRate) {
                  window.fetchCustomRate(selectedClientId, p.name);
              }
    `;

    if (!content.includes('window.fetchCustomRate(selectedClientId, p.name)')) {
        content = content.replace(/if \(nameDisplay\) nameDisplay\.textContent = p\.name;\s*if \(rateInput\) rateInput\.value = p\.charge \|\| 0;/m, injectCall);
    }

    fs.writeFileSync('new-order.html', content);
    console.log("Injected custom rate logic into new-order.html");
}

injectFrontendCustomRate();
