
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const API_BASE = (window.location.protocol === 'file:' || isLocalhost) ? 'http://localhost:5000/api' : window.location.origin + '/api';
        const JOB_COLORS = ['#ec4899', '#9f1239', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316'];
        let allClients = [];
        let selectedClientId = null;
        let selectedProduct = null;
        let selectedTeeth = [];
        let selectedProductType = 'General';

        async function loadClients() {
            try {
                const res = await fetch(`${API_BASE}/clients` + ( `clients`.includes('?') ? '&' : '?' ) + '_t=' + Date.now());
                allClients = await res.json();
                renderClients(allClients);
                populateDoctors();
            } catch (err) { console.error(err); }
        }

        function renderClients(clients) {
            const tbody = document.getElementById('client-table-body');
            tbody.innerHTML = '';
            clients.forEach((c, idx) => {
                const row = document.createElement('tr');
                row.onclick = () => selectClient(c);
                row.innerHTML = `<td>${idx+1}</td><td style="color:#0056b3; font-weight:700;">${c.name}</td><td>${String(c.id).padStart(5,'0')}</td><td>Regular</td><td>Self</td><td><i class="fas fa-info-circle" style="color:#007bff;"></i></td>`;
                tbody.appendChild(row);
            });
        }

        function selectClient(client) {
            selectedClientId = client.id;
            document.getElementById('display-client-name').textContent = client.name;
            showStep(2);
            loadProducts();
        }

        function showStep(s) {
            document.getElementById('step-1').style.display = s===1?'block':'none';
            document.getElementById('step-2').style.display = s===2?'block':'none';
        }

        // FALLBACK DATA (Categorized for better filtering)
        const FALLBACK_TYPES = ["ACRYLIC", "ACRYLIC COMPLETE DENTURE", "ACRYLIC FACING", "BILATERAL DENTURE FRAME", "BITE RIMS", "BITE SPLINT", "BLEACHING TRAY", "CEMENT RETAIN PFM", "CERAMIC", "COLD CURE REPAIR", "DUPLICATION OF CASTS", "DURACETAL PARTIAL DENTURE", "DURAFLEX PARTIAL DENTURE", "EMAX VENEER", "FLEXIBLE", "FLEXIBLE RPD BITE RIM U/L", "FLEXIBLE RPD REPAIR", "FULL METAL", "FULL PALATAL COVERAGE FRAME", "HABIT BREAKER", "HAWLEY'S APPLIANCE", "HAWLEY'S APPLIANCE WITH EXPANSION SCREW", "HYBRID DENTURE", "IN LAY", "MATERIALS", "METAL", "METAL TRAIL", "MONILITHIUM", "ORTHO", "ORTHO RETRACTER", "PFM", "PFM FACING", "SCAN", "SOLDERED TPA MOLAR TUBE", "SPACE MAINTAINER REPAIR", "SPACE MAINTAINER WITH RPD", "STUDY MODEL", "ZIRCON CORE CUTBACK", "ZIRCON REPAIR", "ZIRCONIUM"];
        
        const rawProducts = ["2D EXPANSION SCREW", "AAA", "ACRYLIC BRIDGE", "ACRYLIC CROWN", "ACRYLIC CROWN HEAT CURE", "ACRYLISATION", "ADDING TOOTH", "ADDING TOOTH WITH CLASP", "AGAR AGAR DUPLICATION", "ANTERIOR BITE PLANE", "ANTERIOR FIXED BITE PLANE WITH MOLAR TUBES", "ANTERIOR REPOSITIONING SPLINT", "BANDED HYRAX RME", "BANDED HYRAX RME WITH MOLAR TUBE", "BEGGS RETAINER LOWER", "BEGGS RETAINER UPPER", "BITE PLANE", "BITE RIM LOWER", "BITE RIM U/L", "BITE RIM UPPER", "BLEACHING TRAY", "BLEACHING TRAY BOX", "BONDED HYRAX RME", "BONDED HYRAX RME WITH FACE MASK", "BPS PROBASE", "CAST PARTIAL [CC PLATE]", "CAST PARTIAL BITE RIM", "CAST PARTIAL RPD TRIAL", "CATLAN'S APPLIANCE LOWER", "CD TRIAL U/L", "CERAMIC", "CERAMIC REPAIR", "CLEAR ALIGNER LOWER", "CLEAR ALIGNER SCAN", "CLEAR ALIGNER UPPER", "CLEAR ALIGNER UPPER AND LOWER", "CLEAR RETAINER CUTTING", "CLEAR RETAINER LOWER", "CLEAR RETAINER U/L", "CLEAR RETAINER UPPER", "CLEAR RETAINER WITH BITE PLANE", "COLD CURED BITE SPLINT", "COMPLETE DENTURE", "DENTURE BITE RIM", "DENTURE CORRECTION", "DENTURE CRACK REPAIR", "DENTURE GRINDING", "DENTURE LOWER TRIAL", "DENTURE POLISHING", "DENTURE POLISHING & SMOOTHING", "DENTURE REPAIR", "DENTURE REPAIR - LOWER", "DENTURE REPAIR - UPPER", "DENTURE REPAIR AND POLISHING", "DENTURE UPPER TRIAL", "E MAX", "EMAX", "EMAX VENEER", "EXPANSION SCREW", "EXPANSION SCREW ADDITION", "FIXED LABIAL BOW WITH HOOKS", "FIXED LINGUAL ARCH", "FIXED TWIN BLOCK WTH HYRAX", "FLEXIBLE CD RELINING", "FLEXIBLE DENTURE ACRYLIZATION", "FLEXIBLE DENTURE BITE L", "FLEXIBLE DENTURE BITE U", "FLEXIBLE DENTURE LOWER", "FLEXIBLE DENTURE SPL TRAY & BITE UL", "FLEXIBLE DENTURE TRIAL L", "FLEXIBLE DENTURE TRIAL U", "FLEXIBLE DENTURE TRIAL U/L", "FLEXIBLE DENTURE U/L", "FLEXIBLE DENTURE UPPER", "FLEXIBLE L/DENTURE RELINING", "FLEXIBLE RELINING", "FLEXIBLE RPD", "FLEXIBLE RPD BITE", "FLEXIBLE RPD REPAIR", "FLEXIBLE RPD TRIAL", "FLEXIBLE TEETH ADDING", "FLEXIBLE U/DENTURE RELINING", "HABIT BREAKER FIXED", "HABIT BREAKER REMOVABLE", "HARD SPLINT LOWER", "HARD SPLINT U/L", "HARD SPLINT UPPER", "HAWLEY'S APPLIANCE WITH EXPANSION SCREW", "HAWLEY'S APPLIANCE", "HAWLEY'S APPLIANCE CLEANING", "HAWLEY'S APPLIANCE L", "HAWLEY'S APPLIANCE U", "HAWLEY'S APPLIANCE U/L", "HAWLEY'S APPLIANCE WITH ONE TEETH", "HAWLEY'S APPLIANCE WITH SOLDERED ADAMS", "HAWLEY'S APPLIANCE WITH Z SPRING", "HAWLEY'S APPLIANCE WITH Z SPRING & POSTERIOR BITE PLANE", "HAWLEY'S REPAIR", "HAWLEY'S WITH EXPANSION SCREW & TONGUE GRIP", "HAWLEY'S WITH TONGUE GUARD", "HAWLEY'S APPLIANCE WITH ANTERIOR BITEPLANE", "HEAD GEAR TUBE SPLINT", "IMPLANT PFM", "IMPRESSION TRAY", "IN LAY", "JACK SCREW WITH LABIAL BOW", "LABIALBOW CLASP", "LINGUAL ARCH", "LINGUAL ARCH WITH MOLAR TUBES", "LINGUAL ARCH WITH RPD", "LINGUAL METAL LOOPS", "LIP BUMPER WITH MOLAR TUBES", "LIP PUMBER LOWER ARCH", "LOWER DENTURE", "LOWER DENTURE TRIAL", "MARYLAND", "METAL BAR FOR IMPLANT DENTURE LOWER", "METAL BAR FOR IMPLANT DENTURE U/L", "METAL BAR FOR IMPLANT DENTURE UPPER", "METAL COPING", "METAL CROWN", "METAL TRIAL", "METAL TRIAL IMPLANT", "MICHIGAN SPLINT", "MODEL PRINT LOWER", "MODEL PRINT U/L", "MODEL PRINT UPPER", "MODEL PRINTING", "MOLAR TUBE", "MONILITHIUM", "MONOBLOCK LABIAL BOW", "MONOLITHIUM", "MORDEN DESING", "MSE EXPANTION SCREW SOLDERED", "NANCE APPLIANCE", "NANCE APPLIANCE WITH MOLAR TUBES", "NIGHT GUARD LOWER", "NIGHT GUARD U/L", "NIGHT GUARD UPPER", "ON LAY", "ORTHO FACE MASK", "ORTHO RETRACTOR", "ORTHO WIRE MESH", "PENDULUM APPLIANCE", "PFM", "PFM (PRECIOUS)", "PFM BISQUE TRIAL", "PICKUP CHARGES", "PMMA", "PNDULUM APPLIANCE", "POST CORE", "POSTERIOR BITE PLANE", "POSTERIOR BITE PLANE WITH 2D EXPANSION SCREW", "POSTERIOR BITE PLANE WITH FACE MASK", "PROBASE", "QUAD HELIX WITH BUCCAL TUBES AND BANDS", "RE TRIAL", "RELINING", "RELINING & POLISHING", "RPD", "RPD BITE RIM LOWER", "RPD BITE RIM UPPER", "RPD BITE RIM UPPER AND LOWER", "RPD LOWER", "RPD RELINING", "RPD REPAIR", "RPD REPAIR - LOWER", "RPD REPAIR - UPPER", "RPD REPAIR AND ADD TEETH", "RPD REPAIR AND POLISHING", "RPD REPAIR WITH CERAMIC TEETH", "RPD TRIAL L", "RPD TRIAL U", "RPD TRIAL U/L", "RPD UPPER", "RPD WITH CLEAR RETAINER", "RPD WITH MOLAR BANDS AND LINGUAL ARCH", "RPD WITH SAPCE MAINTAINER", "SILICON BITE SPLINT", "SILICON DUPLICATION", "SNAP ON SMILE", "SNAP ON SMILE L", "SNAP ON SMILE U", "SNAP ON SMILE U/L", "SOFT DENTURE U/L", "SOFT SPLINT LOWER", "SOFT SPLINT U/L", "SOFT SPLINT UPPER", "SOLDERED TPA MOLAR TUBE", "SOLDERING", "SPACE MAINTAINER", "SPACE MAINTAINER LOWER", "SPACE MAINTAINER REPAIR", "SPACE REGENERATOR", "SPECIAL TRAY", "SPECIAL TRAY AND BITE L", "SPECIAL TRAY AND BITE U", "SPECIAL TRAY AND BITE U/L", "SPECIAL TRAY L", "SPECIAL TRAY LOWER", "SPECIAL TRAY U", "SPECIAL TRAY U/L", "STL", "STL FILE", "STL FILE U/L", "STUDY MODEL", "TEMPORARY BRIDGE", "TEMPORARY CROWN", "TEMPORARY MARYLAND", "TONGUE GUARD", "TONGUE GUARD WITH MOLAR TUBE", "TRIAL", "TRIPLEX POURABLE", "TWIN BLOCK LOWER", "TWIN BLOCK POLISHING", "TWIN BLOCK REPAIR", "TWIN BLOCK U/L", "TWIN BLOCK UPPER", "TWIN BLOCK WITH EXPANSION SCREW", "TWIN BLOCK WITH HEAD GEAR", "TWIN BLOCK WITH Z SPRING", "TWO WAY EXPANSION SCREW", "UPPER DENTURE", "UPPER DENTURE TRIAL", "VENEER", "VENEER TRIAL", "WAXUP", "Z SPRING WITH POSTERIOR BITE PLANE", "ZIG TRIAL", "ZIRCON", "ZIRCON BISQUE TRIAL", "ZIRCON CORE", "ZIRCON CORE CUTBACK", "ZIRCON CORE TRIAL", "ZIRCON FULL CROWN", "ZIRCON IMPLANT", "ZIRCON MARYLAND", "ZIRCON POST", "ZIRCON REPAIR", "ZIRCON VENEER", "ZIRCON VENEER CORE TRIAL", "ZIRCON VENEER TRIAL"];

        const FALLBACK_PRODUCTS = rawProducts.map(n => {
            let type = "OTHER";
            if (n.includes("ZIRCON")) type = "ZIRCONIUM";
            else if (n.includes("ACRYLIC")) type = "ACRYLIC";
            else if (n.includes("PFM")) type = "PFM";
            else if (n.includes("EMAX") || n.includes("E MAX")) type = "EMAX VENEER";
            else if (n.includes("ORTHO") || n.includes("HYRAX") || n.includes("RETAINER")) type = "ORTHO";
            else if (n.includes("FLEXIBLE")) type = "FLEXIBLE";
            else if (n.includes("DENTURE")) type = "ACRYLIC COMPLETE DENTURE";
            else if (n.includes("RPD")) type = "FLEXIBLE RPD";
            else if (n.includes("BITE")) type = "BITE SPLINT";
            return { name: n, type: type, charge: 0 };
        });

        async function loadProducts() {
            try {
                // Load Product Types for dropdown
                const typesRes = await fetch(`${API_BASE}/product-types` + ( `product-types`.includes('?') ? '&' : '?' ) + '_t=' + Date.now());
                let types = [];
                if (typesRes.ok) {
                    types = await typesRes.json();
                } else {
                    types = FALLBACK_TYPES.map(n => ({ name: n }));
                }

                const typeSelect = document.getElementById('product-type-filter');
                if (typeSelect) {
                    typeSelect.innerHTML = '<option>All Product Types</option>';
                    types.forEach(t => {
                        const opt = document.createElement('option');
                        opt.value = t.name;
                        opt.textContent = t.name;
                        typeSelect.appendChild(opt);
                    });
                }

                // Load Products
                await refreshProducts();
            } catch (err) { 
                console.warn("Backend error, using fallbacks");
                const typeSelect = document.getElementById('product-type-filter');
                if (typeSelect) {
                    typeSelect.innerHTML = '<option>All Product Types</option>';
                    FALLBACK_TYPES.forEach(t => {
                        const opt = document.createElement('option');
                        opt.value = t;
                        opt.textContent = t;
                        typeSelect.appendChild(opt);
                    });
                }
                await refreshProducts();
            }
        }

        async function refreshProducts() {
            const searchInput = document.getElementById('product-search');
            const search = searchInput ? searchInput.value : '';
            const typeSelect = document.getElementById('product-type-filter');
            const type = typeSelect ? typeSelect.value : 'All Product Types';
            
            let url = `${API_BASE}/products?`;
            if (search) url += `search=${encodeURIComponent(search)}&`;
            if (type && type !== 'All Product Types') url += `type=${encodeURIComponent(type)}`;

            let products = [];
            try {
                const res = await fetch(url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now());
                if (!res.ok) throw new Error('API Error');
                products = await res.json();
            } catch (err) {
                console.warn("Backend not responding, using local fallback...");
                products = [...FALLBACK_PRODUCTS];
                
                if (type && type !== 'All Product Types') {
                    products = products.filter(p => p.type === type);
                }
                
                if (search) {
                    products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
                }
            }
            
            const tbody = document.getElementById('product-table-body');
            if (!tbody) return;
            tbody.innerHTML = '';
            products.forEach((p, idx) => {
                const row = document.createElement('tr');
                row.onclick = () => selectProduct(p);
                row.innerHTML = `<td>${idx+1}</td><td>${p.name}</td><td>${p.type || ''}</td><td>${p.charge || 0}</td>`;
                tbody.appendChild(row);
            });
        }

        
        async function fetchCustomRate(clientId, productName) {
            if (!clientId || !productName) return;
            try {
                const res = await fetch(`${API_BASE}/client-product-rate?clientId=${clientId}&productName=${encodeURIComponent(productName)}`);
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
    
        function selectProduct(p) {
            console.log("Selected Product:", p);
            selectedProduct = p; 
            selectedProductType = p.type || 'General';
            
            const productArea = document.getElementById('product-selection-area');
            const teethArea = document.getElementById('teeth-selection-area');
            const slabsContainer = document.getElementById('slabs-container');

            if (productArea) productArea.style.display = 'none';
            if (productArea) productArea.style.display = 'none';
            if (teethArea) teethArea.style.display = 'block';
            
            // Show slabs only for specific products
            const slabProducts = ['RPD', 'FLEXIBLE RPD', 'CAST PARTIAL', 'RPD REPAIR AND ADD TEETH'];
            const productName = (p.name || '').toUpperCase();
            const isSlabProduct = slabProducts.some(sp => productName.includes(sp));
            
            if (slabsContainer) {
                slabsContainer.style.display = isSlabProduct ? 'block' : 'none';
            }
            
            const customUnitTextContainer = document.getElementById('custom-unit-text-container');
            if (customUnitTextContainer) {
                customUnitTextContainer.style.display = isSlabProduct ? 'block' : 'none';
            }
            
            if (isSlabProduct) {
                const s1 = document.getElementById('slab1-rate');
                if (s1) s1.value = p.charge || 0;
                const s2 = document.getElementById('slab2-rate');
                if (s2) s2.value = 2;
            }

            const nameDisplay = document.getElementById('selected-product-name');

            const rateInput = document.getElementById('unit-rate');
            
            
              if (nameDisplay) nameDisplay.textContent = p.name;
              if (rateInput) rateInput.value = p.charge || 0;
              
              updateTeethUI(true);
              /* Disable client-specific rate overrides to enforce global rate usage
              if (window.fetchCustomRate) {
                  window.fetchCustomRate(selectedClientId, p.name);
              }
              */
    
            
            selectedTeeth = [];
            updateTeethUI();
            
            // Scroll to top of area
            window.scrollTo(0,0);
        }

        function toggleTooth(el, num) {
            const idx = selectedTeeth.indexOf(num);
            if (idx > -1) {
                selectedTeeth.splice(idx, 1);
                el.classList.remove('selected');
            } else {
                selectedTeeth.push(num);
                el.classList.add('selected');
            }
            updateTeethUI();
        }

        function selectArch(arch) {
            const ids = arch === 'upper' ? ['upper-left', 'upper-right'] : ['lower-left', 'lower-right'];
            ids.forEach(id => {
                const quadrant = document.getElementById(id);
                if (quadrant) {
                    quadrant.querySelectorAll('.tooth-num').forEach(t => {
                        if (!t.classList.contains('selected')) {
                            t.click();
                        }
                    });
                }
            });
        }

        function clearTeeth() {
            selectedTeeth = [];
            document.querySelectorAll('.tooth-num.selected').forEach(el => el.classList.remove('selected'));
            updateTeethUI();
        }

        function handleTeethManualInput(val) {
            const matches = val.match(/\d+/g) || [];
            selectedTeeth = matches.map(Number);
            
            document.querySelectorAll('.tooth-num').forEach(el => {
                const onclickAttr = el.getAttribute('onclick');
                if (onclickAttr) {
                    const match = onclickAttr.match(/toggleTooth\(this,\s*(\d+)\)/);
                    if (match) {
                        const toothNum = parseInt(match[1]);
                        if (selectedTeeth.includes(toothNum)) {
                            el.classList.add('selected');
                        } else {
                            el.classList.remove('selected');
                        }
                    }
                }
            });
            updateTeethUI(false, true, false);
        }

        function updateTeethUI(fromRateInput = false, fromManualTeeth = false, fromManualUnit = false) {
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
                job.color = orderJobs[editingJobIndex].color || JOB_COLORS[editingJobIndex % JOB_COLORS.length];
                orderJobs[editingJobIndex] = job;
                editingJobIndex = -1;
            } else {
                job.color = JOB_COLORS[orderJobs.length % JOB_COLORS.length];
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

        
        function generateQuadrantHTML(teeth, isLeft) {
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


        function cancelTeethSelection() {

            document.getElementById('product-selection-area').style.display = 'block';
            document.getElementById('teeth-selection-area').style.display = 'none';
        }

        function populateDoctors() {
            const select = document.getElementById('sub-doctor');
            if (!select) return;
            const uniqueDoctors = [...new Set(allClients.map(c => c.doctorName).filter(d => d))];
            
            const currentValue = select.value;
            const defaultOptions = `
                <option value="">Primary Doctor</option>
                <option value="__add_new__" style="font-weight:bold; color:#3b82f6;">+ Add New Doctor...</option>
            `;
            select.innerHTML = defaultOptions;
            
            if (currentValue && currentValue !== '__add_new__' && !uniqueDoctors.includes(currentValue)) {
                uniqueDoctors.push(currentValue);
            }
            
            uniqueDoctors.forEach(doc => {
                const opt = document.createElement('option');
                opt.value = doc;
                opt.textContent = doc;
                select.insertBefore(opt, select.querySelector('option[value="__add_new__"]'));
            });
            if (currentValue) select.value = currentValue;
        }

        function handleDoctorChange(select) {
            if (select.value === '__add_new__') {
                const newDoctor = prompt("Enter new doctor's name:");
                if (newDoctor && newDoctor.trim() !== '') {
                    const opt = document.createElement('option');
                    opt.value = newDoctor.trim();
                    opt.textContent = newDoctor.trim();
                    select.insertBefore(opt, select.querySelector('option[value="__add_new__"]'));
                    select.value = newDoctor.trim();
                } else {
                    select.value = "";
                }
            }
        }

        async function submitOrder() {
            if (!selectedClientId) {
                alert("Please select a client first!");
                return;
            }
            const patientName = document.getElementById('patient-name-detail').value || document.getElementById('patient-name').value;
            // Removed patient name validation as requested
            // Removed teeth selection validation as requested

            const slabsContainer = document.getElementById('slabs-container');
            const isSlabActive = slabsContainer && slabsContainer.style.display === 'block';

            const customUnitContainer = document.getElementById('custom-unit-text-container');
            let customTeethText = '';
            if (customUnitContainer && customUnitContainer.style.display === 'block') {
                customTeethText = document.getElementById('custom-unit-text').value;
            }

            if (selectedProduct) {
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
                } else {
                    orderJobs.push(job);
                }
                selectedProduct = null;
                editingJobIndex = -1;
            }

            let grandTotal = 0;
            if (orderJobs && orderJobs.length > 0) {
                orderJobs.forEach(j => {
                    grandTotal += parseFloat(j.total) || 0;
                });
            }

            const data = {
                clientId: selectedClientId,
                patientName: patientName,
                productName: document.getElementById('selected-product-name').textContent,
                productType: selectedProductType,
                teethSelection: customTeethText ? customTeethText : document.getElementById('selected-teeth-list').value,
                units: parseInt(document.getElementById('unit-count').value) || 0,
                price: grandTotal || parseFloat(document.getElementById('total-price').value) || 0,
                unitRate: parseFloat(document.getElementById('unit-rate').value) || 0,
                status: document.getElementById('order-status') ? document.getElementById('order-status').value : 'New',
                receivedDate: document.getElementById('order-date-input') ? new Date(document.getElementById('order-date-input').value).toISOString() : new Date().toISOString(),
                dueDate: document.getElementById('due-date-input') && document.getElementById('due-date-input').value ? new Date(document.getElementById('due-date-input').value).toISOString() : null,
                shade1: document.getElementById('shade1') ? document.getElementById('shade1').value : null,
                shade2: document.getElementById('shade2') ? document.getElementById('shade2').value : null,
                shade3: document.getElementById('shade3') ? document.getElementById('shade3').value : null,
                shadeNotes: document.getElementById('shade-notes') ? document.getElementById('shade-notes').value : null,
                priority: document.getElementById('priority') ? document.getElementById('priority').value : 'Normal',
                doctorName: document.getElementById('sub-doctor') ? document.getElementById('sub-doctor').value : null,
                notes: document.getElementById('order-notes') ? document.getElementById('order-notes').value : null,
                articulatorTag: document.getElementById('articulator-tag') ? document.getElementById('articulator-tag').value : null,
                orderType: document.querySelector('input[name="workType"]:checked') ? document.querySelector('input[name="workType"]:checked').value : 'New',
                department: document.getElementById('department') ? document.getElementById('department').value : null,
                modelNumber: document.getElementById('model-number-input') ? document.getElementById('model-number-input').value : null,
                assignTo: document.getElementById('assign-to') ? document.getElementById('assign-to').value : null,
                deliveryMethod: document.getElementById('delivery-method') ? document.getElementById('delivery-method').value : null,
                dropLocation: document.getElementById('drop-location') ? document.getElementById('drop-location').value : null,
                panTray: document.getElementById('pan-tray') ? document.getElementById('pan-tray').value : null,
                
                // Slabs data
                slab1Rate: isSlabActive ? parseFloat(document.getElementById('slab1-rate').value) : null,
                slab2Rate: isSlabActive ? parseFloat(document.getElementById('slab2-rate').value) : null,
                slab1Units: isSlabActive ? Math.min(parseInt(document.getElementById('unit-count').value)||0, 1) : null,
                slab2Units: isSlabActive ? Math.max(0, (parseInt(document.getElementById('unit-count').value)||0) - 1) : null
            };

            if (orderJobs && orderJobs.length > 0) {
                data.jobs = orderJobs.map(j => ({
                    productName: j.product,
                    productType: j.productType,
                    teethSelection: j.teeth ? j.teeth.join(', ') : '',
                    units: j.units,
                    price: j.rate,
                    totalAmount: j.total,
                    slab1Rate: j.slab1Rate,
                    slab2Rate: j.slab2Rate,
                    slab1Units: j.slab1Units,
                    slab2Units: j.slab2Units
                }));
            }

            try {
                const res = await fetch(`${API_BASE}/orders`, {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(data)
                });
                if (res.ok) { 
                    const order = await res.json();
                    const orderId = order.id;
                    
                    // Handle image uploads
                    const fileInput = document.getElementById('order-image-input');
                    if (fileInput && fileInput.files.length > 0) {
                        const formData = new FormData();
                        for (let i = 0; i < fileInput.files.length; i++) {
                            formData.append('files', fileInput.files[i]);
                        }
                        try {
                            await fetch(`${API_BASE}/orders/${orderId}/images`, {
                                method: 'POST',
                                body: formData
                            });
                        } catch (uploadErr) {
                            console.error("Image upload failed:", uploadErr);
                        }
                    }

                    alert("Order Created Successfully!");
                    window.location.href='orders.html'; 
                } else {
                    const err = await res.json();
                    alert("Error: " + err.error);
                }
            } catch(e) {
                console.error(e);
                alert("Server not responding. Please make sure the backend is running.");
            }
        }

        async function openQuickProductModal() {
            document.getElementById('quick-product-modal').style.display = 'flex';
        }

        function closeQuickProductModal() {
            document.getElementById('quick-product-modal').style.display = 'none';
        }

        function openEnclosuresModal() {
            const modal = document.getElementById('enclosures-modal');
            if (modal) {
                modal.style.display = 'flex';
            } else {
                alert("Error: Enclosures modal element not found!");
            }
        }
        function closeEnclosuresModal() {
            document.getElementById('enclosures-modal').style.display = 'none';
        }
        function saveEnclosures() {
            const checked = [];
            document.querySelectorAll('input[name="enclosure"]:checked').forEach(cb => {
                checked.push(cb.value);
            });
            document.getElementById('enclosures-summary').textContent = checked.join(', ');
            closeEnclosuresModal();
        }

        async function saveQuickProduct() {
            const name = document.getElementById('qp-name').value;
            const type = document.getElementById('qp-type').value;
            const charge = document.getElementById('qp-charge').value;
            const code = document.getElementById('qp-code').value;

            if (!name || !type) { alert("Please enter name and type!"); return; }

            try {
                const res = await fetch(`${API_BASE}/products`, {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ name, type, charge, code })
                });
                if (res.ok) {
                    const newProduct = await res.json();
                    alert("Product added!");
                    closeQuickProductModal();
                    await loadProducts(); // Refresh the list
                    selectProduct(newProduct);
                } else {
                    const err = await res.json();
                    alert(err.error || "Failed to add product");
                }
            } catch (err) { console.error(err); }
        }

        async function loadStaff() {
            try {
                const res = await fetch(`${API_BASE}/staff` + ( `staff`.includes('?') ? '&' : '?' ) + '_t=' + Date.now());
                const staff = await res.json();
                const select = document.getElementById('assign-to');
                if (select) {
                    const currentValue = select.value;
                    select.innerHTML = '<option></option>';
                    staff.forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s.name;
                        opt.textContent = s.name;
                        select.appendChild(opt);
                    });
                    
                    // Add "Add New" option
                    const addNewOpt = document.createElement('option');
                    addNewOpt.value = "__add_new__";
                    addNewOpt.textContent = "+ Add New Staff...";
                    addNewOpt.style.fontWeight = "bold";
                    addNewOpt.style.color = "#3b82f6";
                    select.appendChild(addNewOpt);
                    
                    if (currentValue) select.value = currentValue;
                }
            } catch (err) { console.error(err); }
        }

        async function handleStaffChange(select) {
            if (select.value === '__add_new__') {
                const newName = prompt("Enter new staff name:");
                if (newName && newName.trim() !== '') {
                    try {
                        const res = await fetch(`${API_BASE}/staff`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: newName.trim(), role: 'Technician' })
                        });
                        if (res.ok) {
                            const newStaff = await res.json();
                            alert("Staff added successfully!");
                            await loadStaff();
                            select.value = newStaff.name;
                        }
                    } catch (err) { 
                        console.error(err);
                        alert("Error adding staff");
                        select.value = "";
                    }
                } else {
                    select.value = "";
                }
            }
        }

        document.addEventListener('DOMContentLoaded', async () => {
            await loadClients();
            loadStaff();
            
            // Check for clientId in URL
            const urlParams = new URLSearchParams(window.location.search);
            const clientId = urlParams.get('clientId');
            if (clientId) {
                const client = allClients.find(c => c.id == clientId);
                if (client) {
                    selectClient(client);
                }
            }

            // Add client search listener
            const clientSearchInput = document.getElementById('client-search');
            if (clientSearchInput) {
                clientSearchInput.addEventListener('input', (e) => {
                    const val = e.target.value.toLowerCase();
                    const filtered = allClients.filter(c => 
                        (c.name && c.name.toLowerCase().includes(val)) || 
                        (c.code && c.code.toLowerCase().includes(val))
                    );
                    renderClients(filtered);
                });
            }

            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            if(document.getElementById('order-date-input')) document.getElementById('order-date-input').value = today;
            if(document.getElementById('due-date-input')) document.getElementById('due-date-input').value = tomorrowStr;
            if(document.getElementById('date-in-input')) document.getElementById('date-in-input').value = today;

            if(document.getElementById('status-date')) document.getElementById('status-date').value = today;
            if(document.getElementById('tryin-wax-date')) document.getElementById('tryin-wax-date').value = today;
            if(document.getElementById('tryin-metal-date')) document.getElementById('tryin-metal-date').value = today;
            if(document.getElementById('tryin-bisque-date')) document.getElementById('tryin-bisque-date').value = today;

            // Image Preview logic
            const imageInput = document.getElementById('order-image-input');
            const previewArea = document.getElementById('image-preview-area');
            if (imageInput && previewArea) {
                imageInput.addEventListener('change', function(e) {
                    previewArea.innerHTML = '';
                    for (const file of e.target.files) {
                        if (!file.type.startsWith('image/')) continue;
                        // Hide placeholder
                        const ph = document.getElementById('images-placeholder');
                        if (ph) ph.style.display = 'none';
                        
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const div = document.createElement('div');
                            div.className = 'image-preview-item';
                            div.style.border = '1px solid #ddd';
                            div.style.padding = '2px';
                            div.style.borderRadius = '4px';
                            div.style.background = '#fff';
                            div.innerHTML = `<img src="${event.target.result}" style="width:100%; height:100px; object-fit:cover; border-radius:2px;">
                                             <div style="font-size:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding:2px;">${file.name}</div>`;
                            previewArea.appendChild(div);
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        });
    