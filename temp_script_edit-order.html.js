
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const API_BASE = (window.location.protocol === 'file:' || isLocalhost) ? 'http://localhost:5000/api' : window.location.origin + '/api';
        const JOB_COLORS = ['#ec4899', '#9f1239', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316'];
        let allClients = [];
        let selectedClientId = null;
        let selectedProduct = null;
        let currentOrderId = null;
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
                row.innerHTML = `<td>${idx + 1}</td><td style="color:#0056b3; font-weight:700;">${c.name}</td><td>${String(c.id).padStart(5, '0')}</td><td>Regular</td><td>Self</td><td><i class="fas fa-info-circle" style="color:#007bff;"></i></td>`;
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
            // Edit order is always step 2
            document.getElementById('step-1').style.display = 'none';
            document.getElementById('step-2').style.display = 'block';
        }

        // Auto-load order if ID is present
        window.onload = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const orderId = urlParams.get('id');
            if (orderId) {
                await loadOrderData(orderId);
            }
            await loadClients();
            await loadStaff();
        };

        async function loadOrderData(id) {
            currentOrderId = id;
            try {
                const res = await fetch(`${API_BASE}/orders/${id}` + ( `orders/${id}`.includes('?') ? '&' : '?' ) + '_t=' + Date.now());
                const order = await res.json();

                // Populate client and step
                selectedClientId = order.clientId;
                if (order.client) {
                    document.getElementById('display-client-name').textContent = order.client.name;
                    document.getElementById('patient-name-detail').value = order.patientName;
                }
                showStep(2);
                document.getElementById('order-details-area').style.display = 'block';

                // Populate fields
                document.getElementById('order-date-input').value = order.receivedDate ? order.receivedDate.split('T')[0] : '';
                document.getElementById('due-date-input').value = order.dueDate ? order.dueDate.split('T')[0] : '';
                document.getElementById('order-status').value = order.status;
                document.getElementById('order-notes').value = order.notes || '';
                if (order.doctorName) document.getElementById('sub-doctor').value = order.doctorName;

                // Populate Invoice and Shipment Info
                if (order.invoice) {
                    document.getElementById('display-invoice-num').textContent = order.invoice.invoiceNumber || order.invoice.id;
                }
                if (order.shipmentNote) {
                    document.getElementById('display-shipment-num').textContent = order.shipmentNote.noteNumber || order.shipmentNote.id;
                }

                // Load products and set selected
                await loadProducts();

                // If order has multiple items/jobs, load them into orderJobs and display them in the jobs list
                if (order.jobs && order.jobs.length > 0) {
                    orderJobs = order.jobs.map(j => ({
                        product: j.productName,
                        productType: j.productType || 'General',
                        teeth: j.teethSelection ? j.teethSelection.split(',').map(t => {
                            const parsed = parseInt(t.trim());
                            return isNaN(parsed) ? t.trim() : parsed;
                        }).filter(t => t !== '') : [],
                        units: j.units,
                        rate: j.price,
                        total: j.totalAmount || (j.units * j.price),
                        slab1Rate: j.slab1Rate,
                        slab2Rate: j.slab2Rate,
                        slab1Units: j.slab1Units,
                        slab2Units: j.slab2Units
                    }));
                    renderJobsList();
                    // Keep product selection visible and teeth selection hidden
                    document.getElementById('product-selection-area').style.display = 'block';
                    document.getElementById('teeth-selection-area').style.display = 'none';
                } else {
                    // Single product order: populate the single product selection view
                    // Derive unit rate from the job's price (which stores unit rate) or fallback to order.price/order.units
                    const derivedUnitRate = (order.jobs && order.jobs.length > 0) ? order.jobs[0].price : (order.units ? (order.price / order.units) : 0);
                    if (order.productName) {
                        document.getElementById('selected-product-name').textContent = order.productName;
                        selectedProduct = { name: order.productName, type: order.productType || 'General', charge: derivedUnitRate };
                        selectedProductType = order.productType || 'General';
                    }

                    const slabsContainer = document.getElementById('slabs-container');
                    const slabProducts = ['RPD', 'FLEXIBLE RPD', 'CAST PARTIAL', 'RPD REPAIR AND ADD TEETH'];
                    const productName = (order.productName || '').toUpperCase();
                    const productType = (order.productType || '').toUpperCase();
                    const isSlabProduct = slabProducts.some(sp => productName.includes(sp) || productType.includes(sp));
                    if (slabsContainer) {
                        slabsContainer.style.display = isSlabProduct ? 'block' : 'none';
                    }
                    const stdRate = (order.slab1Rate !== null && order.slab1Rate !== undefined) ? order.slab1Rate : (order.units ? (order.price / order.units) : 17);
                    const s1 = document.getElementById('slab1-rate');
                    if (s1) s1.value = stdRate;

                    const s2 = document.getElementById('slab2-rate');
                    if (s2) s2.value = (order.slab2Rate !== null && order.slab2Rate !== undefined) ? order.slab2Rate : 2;

                    if (order.teethSelection) {
                        selectedTeeth = order.teethSelection.split(',').map(t => parseInt(t.trim())).filter(t => !isNaN(t));
                        // Highlight selected teeth in the UI
                        document.querySelectorAll('.tooth-num').forEach(t => {
                            const toothNum = parseInt(t.getAttribute('data-tooth'));
                            if (selectedTeeth.includes(toothNum)) {
                                t.classList.add('selected');
                            } else {
                                t.classList.remove('selected');
                            }
                        });
                    } else {
                        selectedTeeth = [];
                        document.querySelectorAll('.tooth-num').forEach(t => t.classList.remove('selected'));
                    }

                    // Populate unit rate from job price (the actual unit rate) or derive from order total
                    const unitRateInput = document.getElementById('unit-rate');
                    if (unitRateInput) {
                        unitRateInput.value = derivedUnitRate;
                    }
                    updateTeethUI();

                    // Hide product selection and show teeth selection
                    document.getElementById('product-selection-area').style.display = 'none';
                    document.getElementById('teeth-selection-area').style.display = 'block';
                }

                // Update title
                document.querySelector('h1').textContent = 'Edit Order #' + id;
            } catch (err) { console.error(err); }
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
            const type = 'All Product Types';

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
                row.innerHTML = `<td>${idx + 1}</td><td>${p.name}</td><td>${p.type || ''}</td><td>${p.charge || 0}</td>`;
                tbody.appendChild(row);
            });
        }

        function selectProduct(p) {
            console.log("Selected Product:", p);
            selectedProduct = p;
            selectedProductType = p.type || 'General';

            const productArea = document.getElementById('product-selection-area');
            const teethArea = document.getElementById('teeth-selection-area');
            const slabsContainer = document.getElementById('slabs-container');

            if (productArea) productArea.style.display = 'none';
            if (teethArea) teethArea.style.display = 'block';

            const slabProducts = ['RPD', 'FLEXIBLE RPD', 'CAST PARTIAL', 'RPD REPAIR AND ADD TEETH'];
            const productName = (p.name || '').toUpperCase();
            const productType = (p.type || '').toUpperCase();
            const isSlabProduct = slabProducts.some(sp => productName.includes(sp) || productType.includes(sp));

            if (slabsContainer) {
                slabsContainer.style.display = isSlabProduct ? 'block' : 'none';
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

            selectedTeeth = [];
            updateTeethUI();

            // Scroll to top of area
            window.scrollTo(0, 0);
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

        async function deleteOrder() {
            if (!currentOrderId) {
                alert("Cannot delete: Order ID is missing.");
                return;
            }
            if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
            try {
                const res = await fetch(`${API_BASE}/orders/${currentOrderId}`, { method: 'DELETE' });
                if (res.ok) {
                    alert("Order deleted successfully!");
                    window.location.href = 'orders.html';
                } else {
                    alert("Failed to delete order.");
                }
            } catch (e) {
                console.error(e);
                alert("Error deleting order.");
            }
        }

        async function submitOrder() {
            if (!selectedClientId) {
                alert("Please select a client first!");
                return;
            }
            const patientNameInputDetail = document.getElementById('patient-name-detail');
            const patientNameInput = document.getElementById('patient-name');
            const patientName = (patientNameInputDetail && patientNameInputDetail.value) || (patientNameInput && patientNameInput.value) || '';
            
            const slabsContainer = document.getElementById('slabs-container');
            const isSlabActive = slabsContainer && slabsContainer.style.display === 'block';

            const customUnitContainer = document.getElementById('custom-unit-text-container');
            let customTeethText = '';
            if (customUnitContainer && customUnitContainer.style.display === 'block') {
                const customInput = document.getElementById('custom-unit-text');
                if (customInput) customTeethText = customInput.value;
            }

            if (selectedProduct) {
                const job = {
                    product: selectedProduct.name,
                    productType: selectedProductType || 'General',
                    teeth: customTeethText ? [customTeethText] : [...selectedTeeth],
                    units: document.getElementById('unit-count') ? document.getElementById('unit-count').value : '1',
                    rate: document.getElementById('unit-rate') ? document.getElementById('unit-rate').value : '0',
                    total: document.getElementById('total-price') ? document.getElementById('total-price').value : '0',
                    slab1Rate: isSlabActive && document.getElementById('slab1-rate') ? parseFloat(document.getElementById('slab1-rate').value) : null,
                    slab2Rate: isSlabActive && document.getElementById('slab2-rate') ? parseFloat(document.getElementById('slab2-rate').value) : null,
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
                productName: document.getElementById('selected-product-name') ? document.getElementById('selected-product-name').textContent : '',
                productType: selectedProductType,
                teethSelection: customTeethText ? customTeethText : (document.getElementById('selected-teeth-list') ? document.getElementById('selected-teeth-list').value : ''),
                units: parseInt(document.getElementById('unit-count') ? document.getElementById('unit-count').value : 0) || 0,
                price: grandTotal || parseFloat(document.getElementById('total-price') ? document.getElementById('total-price').value : 0) || 0,
                unitRate: parseFloat(document.getElementById('unit-rate') ? document.getElementById('unit-rate').value : 0) || 0,
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
                slab1Rate: isSlabActive && document.getElementById('slab1-rate') ? parseFloat(document.getElementById('slab1-rate').value) : null,
                slab2Rate: isSlabActive && document.getElementById('slab2-rate') ? parseFloat(document.getElementById('slab2-rate').value) : null,
                slab1Units: isSlabActive ? Math.min(parseInt(document.getElementById('unit-count').value)||0, 1) : null,
                slab2Units: isSlabActive ? Math.max(0, (parseInt(document.getElementById('unit-count').value)||0) - 1) : null
            };

            if (typeof orderJobs !== 'undefined' && orderJobs && orderJobs.length > 0) {
                data.jobs = orderJobs.map(j => ({
                    productName: j.product,
                    productType: j.productType || 'General',
                    teethSelection: (j.teeth && j.teeth.length > 0) ? (Array.isArray(j.teeth) ? j.teeth.join(', ') : j.teeth) : '',
                    units: parseInt(j.units) || 0,
                    price: parseFloat(j.rate) || 0,
                    totalAmount: parseFloat(j.total) || 0,
                    slab1Rate: j.slab1Rate,
                    slab2Rate: j.slab2Rate,
                    slab1Units: j.slab1Units,
                    slab2Units: j.slab2Units
                }));
                // Calculate total price by summing job totals
                data.totalAmount = data.jobs.reduce((sum, j) => sum + parseFloat(j.totalAmount || 0), 0);
                data.price = data.totalAmount;
            }

            try {
                let url = `${API_BASE}/orders`;
                let method = 'POST';
                if (currentOrderId) {
                    url = `${API_BASE}/orders/${currentOrderId}`;
                    method = 'PUT';
                }

                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (res.ok) {
                    alert(currentOrderId ? "Order Updated Successfully!" : "Order Created Successfully!");
                    window.location.href = 'orders.html';
                } else {
                    const err = await res.json();
                    alert("Error: " + err.error);
                }
            } catch (e) {
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
                    headers: { 'Content-Type': 'application/json' },
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

        document.addEventListener('DOMContentLoaded', () => {
            loadClients();
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            if (document.getElementById('order-date-input')) document.getElementById('order-date-input').value = today;
            if (document.getElementById('due-date-input')) document.getElementById('due-date-input').value = tomorrowStr;
            if (document.getElementById('date-in-input')) document.getElementById('date-in-input').value = today;

            if (document.getElementById('status-date')) document.getElementById('status-date').value = today;
            if (document.getElementById('tryin-wax-date')) document.getElementById('tryin-wax-date').value = today;
            if (document.getElementById('tryin-metal-date')) document.getElementById('tryin-metal-date').value = today;
            if (document.getElementById('tryin-bisque-date')) document.getElementById('tryin-bisque-date').value = today;
        });
    