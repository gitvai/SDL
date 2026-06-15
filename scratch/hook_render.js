const fs = require('fs');

function hookRender(filename, regex, wrapperContainer) {
    let content = fs.readFileSync(filename, 'utf8');
    
    // Replace: function renderOrders(orders) {
    // With: function renderOrders(ordersData) {
    //           allFetchedData = ordersData;
    //           currentRenderFn = () => renderOrders(allFetchedData);
    //           let orders = window.applySortAndPagination(ordersData, 'wrapperContainer');
    
    content = content.replace(regex, function(match, funcName, paramName) {
        return `function ${funcName}(${paramName}Data) {\n` +
               `    allFetchedData = ${paramName}Data;\n` +
               `    currentRenderFn = () => ${funcName}(allFetchedData);\n` +
               `    let ${paramName} = window.applySortAndPagination ? window.applySortAndPagination(${paramName}Data, '${wrapperContainer}') : ${paramName}Data;\n`;
    });
    
    fs.writeFileSync(filename, content);
    console.log('Hooked render loop in ' + filename + ' for ' + wrapperContainer);
}

// 1. orders.html -> renderOrders(orders) -> tbody id="orders-tbody"
hookRender('orders.html', /function (renderOrders)\((\w+)\) \{/, 'orders-tbody');

// 2. shipments.html -> renderShipments(shipments) -> 'shipment-notes-tbody'
hookRender('shipments.html', /function (renderShipments)\((\w+)\) \{/, 'shipment-notes-tbody');
// shipments.html -> renderOrdersToDeliver(orders) -> 'orders-deliver-tbody'
hookRender('shipments.html', /function (renderOrdersToDeliver)\((\w+)\) \{/, 'orders-deliver-tbody');

// 3. accounts.html -> renderTable(items, type) -> 'accounts-tbody'
// Wait, accounts.html has function renderTable(items, type)
let accContent = fs.readFileSync('accounts.html', 'utf8');
accContent = accContent.replace(/function renderTable\(items, type\) \{/, 
`function renderTable(itemsData, type) {
    allFetchedData = itemsData;
    currentRenderFn = () => renderTable(allFetchedData, type);
    let items = window.applySortAndPagination ? window.applySortAndPagination(itemsData, 'accounts-tbody') : itemsData;
`);
fs.writeFileSync('accounts.html', accContent);
console.log('Hooked renderTable in accounts.html');

