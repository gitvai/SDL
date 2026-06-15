const fs = require('fs');
let html = fs.readFileSync('orders.html', 'utf8');

// Replace overview cell
html = html.replace(/<td style="padding:10px; border:1px solid #e2e8f0; color:#f59e0b;">Hold<\/td>/g, '<td style="padding:10px; border:1px solid #e2e8f0; color:#f59e0b;">On Hold</td>');
html = html.replace(/<td id="ov-Hold"/g, '<td id="ov-On Hold"');

// Replace calendar display radio
html = html.replace(/<label><input type="radio" name="cal-display" value="Hold" onchange="refreshCalendar\(\)">\s*Hold<\/label>/g, '<label><input type="radio" name="cal-display" value="On Hold" onchange="refreshCalendar()">\n                            On Hold</label>');

// Replace filter option
html = html.replace(/<option value="Hold">Hold<\/option>/g, '<option value="On Hold">On Hold</option>');

// Replace status array
html = html.replace(/const statuses = \['New', 'In Production', 'Complete', 'Delivered', 'Hold', 'Try In', 'Cancelled'\];/g, "const statuses = ['New', 'In Production', 'Complete', 'Delivered', 'On Hold', 'Try In', 'Cancelled'];");

fs.writeFileSync('orders.html', html);
console.log('Fixed orders.html hold status bugs');
