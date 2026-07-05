const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultDropdowns = [
  // order_status
  { page: 'Order', dropdownKey: 'order_status', dropdownLabel: 'Order Status', optionLabel: 'New', optionValue: 'New', sortOrder: 1 },
  { page: 'Order', dropdownKey: 'order_status', dropdownLabel: 'Order Status', optionLabel: 'In Production', optionValue: 'In Production', sortOrder: 2 },
  { page: 'Order', dropdownKey: 'order_status', dropdownLabel: 'Order Status', optionLabel: 'Complete', optionValue: 'Complete', sortOrder: 3 },
  { page: 'Order', dropdownKey: 'order_status', dropdownLabel: 'Order Status', optionLabel: 'On Hold', optionValue: 'On Hold', sortOrder: 4 },
  { page: 'Order', dropdownKey: 'order_status', dropdownLabel: 'Order Status', optionLabel: 'Try In', optionValue: 'Try In', sortOrder: 5 },
  { page: 'Order', dropdownKey: 'order_status', dropdownLabel: 'Order Status', optionLabel: 'Cancelled', optionValue: 'Cancelled', sortOrder: 6 },
  { page: 'Order', dropdownKey: 'order_status', dropdownLabel: 'Order Status', optionLabel: 'Delivered', optionValue: 'Delivered', sortOrder: 7 },

  // order_type (Work Type)
  { page: 'Order', dropdownKey: 'order_type', dropdownLabel: 'Order Type', optionLabel: 'New', optionValue: 'New', sortOrder: 1 },
  { page: 'Order', dropdownKey: 'order_type', dropdownLabel: 'Order Type', optionLabel: 'Repeat', optionValue: 'Repeat', sortOrder: 2 },
  { page: 'Order', dropdownKey: 'order_type', dropdownLabel: 'Order Type', optionLabel: 'Repair', optionValue: 'Repair', sortOrder: 3 },

  // order_priority
  { page: 'Order', dropdownKey: 'order_priority', dropdownLabel: 'Order Priority', optionLabel: 'Normal', optionValue: 'Normal', sortOrder: 1 },
  { page: 'Order', dropdownKey: 'order_priority', dropdownLabel: 'Order Priority', optionLabel: 'Urgent', optionValue: 'Urgent', sortOrder: 2 },

  // hold_reason
  { page: 'Order', dropdownKey: 'hold_reason', dropdownLabel: 'Hold Reason', optionLabel: 'Payment Pending', optionValue: 'Payment Pending', sortOrder: 1 },
  { page: 'Order', dropdownKey: 'hold_reason', dropdownLabel: 'Hold Reason', optionLabel: 'Clarification Needed', optionValue: 'Clarification Needed', sortOrder: 2 },
  { page: 'Order', dropdownKey: 'hold_reason', dropdownLabel: 'Hold Reason', optionLabel: 'Doctor Unavailable', optionValue: 'Doctor Unavailable', sortOrder: 3 },
  { page: 'Order', dropdownKey: 'hold_reason', dropdownLabel: 'Hold Reason', optionLabel: 'Impression Issue', optionValue: 'Impression Issue', sortOrder: 4 },
  { page: 'Order', dropdownKey: 'hold_reason', dropdownLabel: 'Hold Reason', optionLabel: 'Shade Issue', optionValue: 'Shade Issue', sortOrder: 5 },
  { page: 'Order', dropdownKey: 'hold_reason', dropdownLabel: 'Hold Reason', optionLabel: 'Patient Not Available', optionValue: 'Patient Not Available', sortOrder: 6 },
  { page: 'Order', dropdownKey: 'hold_reason', dropdownLabel: 'Hold Reason', optionLabel: 'Duplicate Order', optionValue: 'Duplicate Order', sortOrder: 7 },
  { page: 'Order', dropdownKey: 'hold_reason', dropdownLabel: 'Hold Reason', optionLabel: 'Other', optionValue: 'Other', sortOrder: 8 },

  // shipment_status
  { page: 'Shipment', dropdownKey: 'shipment_status', dropdownLabel: 'Shipment Status', optionLabel: 'Created', optionValue: 'Created', sortOrder: 1 },
  { page: 'Shipment', dropdownKey: 'shipment_status', dropdownLabel: 'Shipment Status', optionLabel: 'Printed', optionValue: 'Printed', sortOrder: 2 },
  { page: 'Shipment', dropdownKey: 'shipment_status', dropdownLabel: 'Shipment Status', optionLabel: 'Dispatched', optionValue: 'Dispatched', sortOrder: 3 },
  { page: 'Shipment', dropdownKey: 'shipment_status', dropdownLabel: 'Shipment Status', optionLabel: 'Delivered', optionValue: 'Delivered', sortOrder: 4 },

  // shipment_partner
  { page: 'Shipment', dropdownKey: 'shipment_partner', dropdownLabel: 'Shipment Partner', optionLabel: 'Courier', optionValue: 'Courier', sortOrder: 1 },
  { page: 'Shipment', dropdownKey: 'shipment_partner', dropdownLabel: 'Shipment Partner', optionLabel: 'Self Pickup', optionValue: 'Self Pickup', sortOrder: 2 },
  { page: 'Shipment', dropdownKey: 'shipment_partner', dropdownLabel: 'Shipment Partner', optionLabel: 'Lab Delivery', optionValue: 'Lab Delivery', sortOrder: 3 },
  { page: 'Shipment', dropdownKey: 'shipment_partner', dropdownLabel: 'Shipment Partner', optionLabel: 'LOGISTICS TEAM', optionValue: 'LOGISTICS TEAM', sortOrder: 4 },
  { page: 'Shipment', dropdownKey: 'shipment_partner', dropdownLabel: 'Shipment Partner', optionLabel: 'Delivery Boy', optionValue: 'Delivery Boy', sortOrder: 5 },
  { page: 'Shipment', dropdownKey: 'shipment_partner', dropdownLabel: 'Shipment Partner', optionLabel: 'Doctors Pickup', optionValue: 'Doctors Pickup', sortOrder: 6 },
  { page: 'Shipment', dropdownKey: 'shipment_partner', dropdownLabel: 'Shipment Partner', optionLabel: 'Mail', optionValue: 'Mail', sortOrder: 7 },

  // return_type (Shipments - returns)
  { page: 'Shipment', dropdownKey: 'return_type', dropdownLabel: 'Return Type', optionLabel: 'Impression', optionValue: 'Impression', sortOrder: 1 },
  { page: 'Shipment', dropdownKey: 'return_type', dropdownLabel: 'Return Type', optionLabel: 'Wax Trial', optionValue: 'Wax Trial', sortOrder: 2 },
  { page: 'Shipment', dropdownKey: 'return_type', dropdownLabel: 'Return Type', optionLabel: 'Metal Frame', optionValue: 'Metal Frame', sortOrder: 3 },
  { page: 'Shipment', dropdownKey: 'return_type', dropdownLabel: 'Return Type', optionLabel: 'Old Restorations', optionValue: 'Old Restorations', sortOrder: 4 },
  { page: 'Shipment', dropdownKey: 'return_type', dropdownLabel: 'Return Type', optionLabel: 'Other', optionValue: 'Other', sortOrder: 5 },

  // payment_mode (used in Shipments, Accounts)
  { page: 'Account', dropdownKey: 'payment_mode', dropdownLabel: 'Payment Mode', optionLabel: 'Cash', optionValue: 'Cash', sortOrder: 1 },
  { page: 'Account', dropdownKey: 'payment_mode', dropdownLabel: 'Payment Mode', optionLabel: 'Cheque', optionValue: 'Cheque', sortOrder: 2 },
  { page: 'Account', dropdownKey: 'payment_mode', dropdownLabel: 'Payment Mode', optionLabel: 'UPI', optionValue: 'UPI', sortOrder: 3 },
  { page: 'Account', dropdownKey: 'payment_mode', dropdownLabel: 'Payment Mode', optionLabel: 'Bank Transfer', optionValue: 'Bank Transfer', sortOrder: 4 },

  // account_type
  { page: 'Account', dropdownKey: 'account_type', dropdownLabel: 'Account Type', optionLabel: 'Credit', optionValue: 'Credit', sortOrder: 1 },
  { page: 'Account', dropdownKey: 'account_type', dropdownLabel: 'Account Type', optionLabel: 'Debit', optionValue: 'Debit', sortOrder: 2 },

  // expense_category (Office)
  { page: 'Office', dropdownKey: 'expense_category', dropdownLabel: 'Expense Category', optionLabel: 'Office Supplies', optionValue: 'Office Supplies', sortOrder: 1 },
  { page: 'Office', dropdownKey: 'expense_category', dropdownLabel: 'Expense Category', optionLabel: 'Travel & Fuel', optionValue: 'Travel & Fuel', sortOrder: 2 },
  { page: 'Office', dropdownKey: 'expense_category', dropdownLabel: 'Expense Category', optionLabel: 'Meals', optionValue: 'Meals', sortOrder: 3 },
  { page: 'Office', dropdownKey: 'expense_category', dropdownLabel: 'Expense Category', optionLabel: 'Utilities', optionValue: 'Utilities', sortOrder: 4 },
  { page: 'Office', dropdownKey: 'expense_category', dropdownLabel: 'Expense Category', optionLabel: 'Maintenance', optionValue: 'Maintenance', sortOrder: 5 },
  { page: 'Office', dropdownKey: 'expense_category', dropdownLabel: 'Expense Category', optionLabel: 'Other', optionValue: 'Other', sortOrder: 6 },

  // expense_method (Office)
  { page: 'Office', dropdownKey: 'expense_method', dropdownLabel: 'Expense Method', optionLabel: 'Cash', optionValue: 'Cash', sortOrder: 1 },
  { page: 'Office', dropdownKey: 'expense_method', dropdownLabel: 'Expense Method', optionLabel: 'Bank Transfer', optionValue: 'Bank Transfer', sortOrder: 2 },
  { page: 'Office', dropdownKey: 'expense_method', dropdownLabel: 'Expense Method', optionLabel: 'UPI', optionValue: 'UPI', sortOrder: 3 },
  { page: 'Office', dropdownKey: 'expense_method', dropdownLabel: 'Expense Method', optionLabel: 'Cheque', optionValue: 'Cheque', sortOrder: 4 },

  // staff_role (Office / Settings)
  { page: 'Office', dropdownKey: 'staff_role', dropdownLabel: 'Staff Role', optionLabel: 'Technician', optionValue: 'Technician', sortOrder: 1 },
  { page: 'Office', dropdownKey: 'staff_role', dropdownLabel: 'Staff Role', optionLabel: 'Manager', optionValue: 'Manager', sortOrder: 2 },
  { page: 'Office', dropdownKey: 'staff_role', dropdownLabel: 'Staff Role', optionLabel: 'Admin', optionValue: 'Admin', sortOrder: 3 },
  { page: 'Office', dropdownKey: 'staff_role', dropdownLabel: 'Staff Role', optionLabel: 'Delivery Boy', optionValue: 'Delivery Boy', sortOrder: 4 },
  { page: 'Office', dropdownKey: 'staff_role', dropdownLabel: 'Staff Role', optionLabel: 'Lab Administrator', optionValue: 'Lab Administrator', sortOrder: 5 },
  { page: 'Office', dropdownKey: 'staff_role', dropdownLabel: 'Staff Role', optionLabel: 'Driver', optionValue: 'Driver', sortOrder: 6 },
  { page: 'Office', dropdownKey: 'staff_role', dropdownLabel: 'Staff Role', optionLabel: 'Other', optionValue: 'Other', sortOrder: 7 },

  // material_category (Office)
  { page: 'Office', dropdownKey: 'material_category', dropdownLabel: 'Material Category', optionLabel: 'Ceramic', optionValue: 'Ceramic', sortOrder: 1 },
  { page: 'Office', dropdownKey: 'material_category', dropdownLabel: 'Material Category', optionLabel: 'Metal', optionValue: 'Metal', sortOrder: 2 },
  { page: 'Office', dropdownKey: 'material_category', dropdownLabel: 'Material Category', optionLabel: 'Ortho', optionValue: 'Ortho', sortOrder: 3 },
  { page: 'Office', dropdownKey: 'material_category', dropdownLabel: 'Material Category', optionLabel: 'Resins', optionValue: 'Resins', sortOrder: 4 },
  { page: 'Office', dropdownKey: 'material_category', dropdownLabel: 'Material Category', optionLabel: 'Zircon', optionValue: 'Zircon', sortOrder: 5 },
  { page: 'Office', dropdownKey: 'material_category', dropdownLabel: 'Material Category', optionLabel: 'Acrylic', optionValue: 'Acrylic', sortOrder: 6 },

  // inward_doc_type (Office - Inventory)
  { page: 'Office', dropdownKey: 'inward_doc_type', dropdownLabel: 'Inward Document Type', optionLabel: 'Purchase', optionValue: 'Purchase', sortOrder: 1 },
  { page: 'Office', dropdownKey: 'inward_doc_type', dropdownLabel: 'Inward Document Type', optionLabel: 'Return', optionValue: 'Return', sortOrder: 2 },
  { page: 'Office', dropdownKey: 'inward_doc_type', dropdownLabel: 'Inward Document Type', optionLabel: 'Opening Balance', optionValue: 'Opening Balance', sortOrder: 3 },

  // outward_doc_type (Office - Inventory)
  { page: 'Office', dropdownKey: 'outward_doc_type', dropdownLabel: 'Outward Document Type', optionLabel: 'Consumption', optionValue: 'Consumption', sortOrder: 1 },
  { page: 'Office', dropdownKey: 'outward_doc_type', dropdownLabel: 'Outward Document Type', optionLabel: 'Issued', optionValue: 'Issued', sortOrder: 2 },
  { page: 'Office', dropdownKey: 'outward_doc_type', dropdownLabel: 'Outward Document Type', optionLabel: 'Damaged', optionValue: 'Damaged', sortOrder: 3 },

  // product_type (Office - Productions)
  { page: 'Office', dropdownKey: 'product_type', dropdownLabel: 'Product Type', optionLabel: 'PFM', optionValue: 'PFM', sortOrder: 1 },
  { page: 'Office', dropdownKey: 'product_type', dropdownLabel: 'Product Type', optionLabel: 'Zirconia', optionValue: 'Zirconia', sortOrder: 2 },
  { page: 'Office', dropdownKey: 'product_type', dropdownLabel: 'Product Type', optionLabel: 'E-Max', optionValue: 'E-Max', sortOrder: 3 },
  { page: 'Office', dropdownKey: 'product_type', dropdownLabel: 'Product Type', optionLabel: 'Denture', optionValue: 'Denture', sortOrder: 4 },
  { page: 'Office', dropdownKey: 'product_type', dropdownLabel: 'Product Type', optionLabel: 'Implant', optionValue: 'Implant', sortOrder: 5 },
  { page: 'Office', dropdownKey: 'product_type', dropdownLabel: 'Product Type', optionLabel: 'General', optionValue: 'General', sortOrder: 6 },

  // tryin_type (Settings / Orders)
  { page: 'Order', dropdownKey: 'tryin_type', dropdownLabel: 'Try-In Type', optionLabel: 'Try-In', optionValue: 'Try-In', sortOrder: 1 },
  { page: 'Order', dropdownKey: 'tryin_type', dropdownLabel: 'Try-In Type', optionLabel: 'Special Tray', optionValue: 'Special Tray', sortOrder: 2 },
  { page: 'Order', dropdownKey: 'tryin_type', dropdownLabel: 'Try-In Type', optionLabel: 'Metal/Coping Trial', optionValue: 'Metal/Coping Trial', sortOrder: 3 },
  { page: 'Order', dropdownKey: 'tryin_type', dropdownLabel: 'Try-In Type', optionLabel: 'Record Base', optionValue: 'Record Base', sortOrder: 4 },
  { page: 'Order', dropdownKey: 'tryin_type', dropdownLabel: 'Try-In Type', optionLabel: 'Setting Trial', optionValue: 'Setting Trial', sortOrder: 5 },
  { page: 'Order', dropdownKey: 'tryin_type', dropdownLabel: 'Try-In Type', optionLabel: 'Wax Test', optionValue: 'Wax Test', sortOrder: 6 },
  { page: 'Order', dropdownKey: 'tryin_type', dropdownLabel: 'Try-In Type', optionLabel: 'Bisque Trial', optionValue: 'Bisque Trial', sortOrder: 7 },
];

async function main() {
  console.log('Seeding default dropdown options...');
  let created = 0;
  for (const item of defaultDropdowns) {
    const existing = await prisma.dropdownOption.findFirst({
      where: {
        dropdownKey: item.dropdownKey,
        optionValue: item.optionValue
      }
    });
    if (!existing) {
      await prisma.dropdownOption.create({ data: item });
      console.log(`Created: [${item.dropdownKey}] ${item.optionLabel}`);
      created++;
    }
  }
  console.log(`\nSeeding completed! ${created} new options added.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
