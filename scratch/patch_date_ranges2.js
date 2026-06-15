const fs = require('fs');

const dateOptions = `
    <option value="Upcoming">Upcoming</option>
    <option value="Today">Today</option>
    <option value="Tomorrow">Tomorrow</option>
    <option value="Recent">Recent</option>
    <option value="Yesterday">Yesterday</option>
    <option value="This week from Sunday">This week from Sunday</option>
    <option value="Month To Date" selected>Month To Date</option>
    <option value="Last 7 Days">Last 7 Days</option>
    <option value="Last Full Week">Last Full Week</option>
    <option value="Last Full Month">Last Full Month</option>
    <option value="All dates to yesterday">All dates to yesterday</option>
    <option value="All dates to today">All dates to today</option>
`;

const htmlToInject = `
    <label style="display:block; font-size:11px; font-weight:700; margin-bottom:2px;">Order Date</label>
    <select id="opt-order-date" style="width:100%; padding:4px; border:1px solid #333; margin-bottom:8px; font-size:12px;">
        ${dateOptions}
    </select>

    <label style="display:block; font-size:11px; font-weight:700; margin-bottom:2px;">Date In</label>
    <select id="opt-date-in" style="width:100%; padding:4px; border:1px solid #333; margin-bottom:8px; font-size:12px;">
        ${dateOptions}
    </select>

    <label style="display:block; font-size:11px; font-weight:700; margin-bottom:2px;">Status Date</label>
    <select id="opt-status-date" style="width:100%; padding:4px; border:1px solid #333; margin-bottom:8px; font-size:12px;">
        ${dateOptions}
    </select>
`;

function fixDateRanges(filename) {
    let content = fs.readFileSync(filename, 'utf8');
    
    // Pattern to match the existing "Default Date Ranges" div
    // We'll replace the inner part under "Default Date Ranges" until the closing </div> before "Sort"
    
    const otherPattern = /<label style="display:block; font-size:12px; font-weight:700; margin-bottom:8px;">Default Date Ranges<\/label>[\s\S]*?(?=<\/div>\s*<div style="border:1px solid #333; padding:12px; margin-bottom:12px;">\s*<label[^>]*>Sort<\/label>)/;
    
    if (otherPattern.test(content)) {
        content = content.replace(otherPattern, 
            '<label style="display:block; font-size:12px; font-weight:700; margin-bottom:8px;">Default Date Ranges</label>\n' + htmlToInject + '\n'
        );
        fs.writeFileSync(filename, content);
        console.log('Fixed date ranges in ' + filename);
    } else {
        console.log('Pattern not found in ' + filename);
    }
}

fixDateRanges('shipments.html');
fixDateRanges('accounts.html');
