const fs = require('fs');
let html = fs.readFileSync('office.html', 'utf8');

// 1. In fetchProducts, save unique types globally
html = html.replace(
    /const uniqueTypes = \[\.\.\.new Set\(allProducts\.map\(p => p\.type\)\.filter\(t => t\)\)\];/g, 
    "const uniqueTypes = [...new Set(allProducts.map(p => p.type).filter(t => t))];\n                window.uniqueProductTypes = uniqueTypes;"
);

// 2. Add populateProductTypes function
const populateFn = `
        function populateProductTypes(selectedValue = 'General') {
            const typeSelect = document.getElementById('prod-type');
            const defaultTypes = ['PFM', 'Zirconia', 'E-Max', 'Denture', 'Implant', 'General'];
            let types = [...new Set([...defaultTypes, ...(window.uniqueProductTypes || [])])];
            
            typeSelect.innerHTML = types.map(t => \`<option value="\${t}">\${t}</option>\`).join('') + '<option value="Other">Other (Custom)</option>';
            
            if (types.includes(selectedValue)) {
                typeSelect.value = selectedValue;
                document.getElementById('prod-type-new').style.display = 'none';
                document.getElementById('prod-type-new').required = false;
            } else {
                typeSelect.value = 'Other';
                document.getElementById('prod-type-new').style.display = 'block';
                document.getElementById('prod-type-new').value = selectedValue;
                document.getElementById('prod-type-new').required = true;
            }
        }
`;
html = html.replace('function openProductModal() {', populateFn + '\n        function openProductModal() {');

// 3. Update openProductModal to use populateProductTypes
html = html.replace(
    /document\.getElementById\('prod-type'\)\.value = 'General';[\s\n]*document\.getElementById\('prod-type-new'\)\.value = '';[\s\n]*document\.getElementById\('prod-type-new'\)\.style\.display = 'none';[\s\n]*document\.getElementById\('prod-type-new'\)\.required = false;/g,
    "populateProductTypes('General');"
);

// 4. Update editProduct to use populateProductTypes
// We need to replace the big chunk in editProduct
const editProductOld = `                const typeSelect = document.getElementById('prod-type');
                let found = Array.from(typeSelect.options).some(opt => opt.value === p.type);
                if (found) {
                    typeSelect.value = p.type;
                    document.getElementById('prod-type-new').style.display = 'none';
                    document.getElementById('prod-type-new').required = false;
                } else {
                    typeSelect.value = 'Other';
                    document.getElementById('prod-type-new').style.display = 'block';
                    document.getElementById('prod-type-new').value = p.type;
                    document.getElementById('prod-type-new').required = true;
                }`;

html = html.replace(editProductOld, "populateProductTypes(p.type);");

fs.writeFileSync('office.html', html);
console.log('Fixed office.html product types bugs');
