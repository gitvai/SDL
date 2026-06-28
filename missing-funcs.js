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