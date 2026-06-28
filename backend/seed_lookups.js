const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultLookups = [
  // priorities
  { type: 'priority', name: 'Normal' },
  { type: 'priority', name: 'Urgent' },
  { type: 'priority', name: 'ASAP' },
  
  // departments
  { type: 'department', name: 'Acrylic' },
  { type: 'department', name: 'Ceramic' },
  { type: 'department', name: 'Metal' },
  { type: 'department', name: 'Crown & Bridge' },
  { type: 'department', name: 'Orthodontics' },
  
  // enclosures
  { type: 'enclosure', name: 'Bite' },
  { type: 'enclosure', name: 'Impression' },
  { type: 'enclosure', name: 'Photos' },
  { type: 'enclosure', name: 'Old Restoration' },
  { type: 'enclosure', name: 'Articulator' },
  
  // payment_modes
  { type: 'payment_mode', name: 'Cash' },
  { type: 'payment_mode', name: 'Cheque' },
  { type: 'payment_mode', name: 'Bank Transfer' },
  { type: 'payment_mode', name: 'GPay/PhonePe' },
  
  // tax_options
  { type: 'tax_option', name: '5% GST' },
  { type: 'tax_option', name: '12% GST' },
  { type: 'tax_option', name: '18% GST' },
  
  // categories
  { type: 'category', name: 'Regular' },
  { type: 'category', name: 'VIP' },
  { type: 'category', name: 'Staff' },
  
  // price_bands
  { type: 'price_band', name: 'Standard Rate' },
  { type: 'price_band', name: 'Premium Rate' },
  
  // hold_reasons
  { type: 'hold_reason', name: 'Improper Impression' },
  { type: 'hold_reason', name: 'Design Clarification' },
  { type: 'hold_reason', name: 'Incomplete Instructions' },
  
  // time_slots
  { type: 'time_slot', name: 'Morning' },
  { type: 'time_slot', name: 'Afternoon' },
  { type: 'time_slot', name: 'Evening' },
  
  // credit_adjustment_types
  { type: 'credit_adjustment_type', name: 'Discount' },
  { type: 'credit_adjustment_type', name: 'Bad Debt' },
  { type: 'credit_adjustment_type', name: 'Write-Off' },
  
  // stock_categories
  { type: 'stock_category', name: 'Acrylic Materials' },
  { type: 'stock_category', name: 'Ceramic Materials' },
  { type: 'stock_category', name: 'Metal Alloys' },
  { type: 'stock_category', name: 'Teeth Sets' },
  
  // delivery_methods
  { type: 'delivery_method', name: 'Delivery Boy' },
  { type: 'delivery_method', name: 'Courier Service' },
  { type: 'delivery_method', name: 'Self Pickup' },
  
  // routes
  { type: 'route', name: 'Route A' },
  { type: 'route', name: 'Route B' },
  { type: 'route', name: 'Route C' },
  
  // collection_centres
  { type: 'collection_centre', name: 'Main Office' },
  { type: 'collection_centre', name: 'Sohar Branch' },
  
  // shade_guides
  { type: 'shade_guide', name: 'VITA Classical' },
  { type: 'shade_guide', name: 'VITA 3D-MASTER' },
  
  // manufacturer_labs
  { type: 'manufacturer_lab', name: 'Internal Lab' },
  { type: 'manufacturer_lab', name: 'Partner Lab' }
];

async function main() {
  console.log('Seeding default lookups...');
  for (const lookup of defaultLookups) {
    const existing = await prisma.settingLookup.findFirst({
      where: {
        type: lookup.type,
        name: lookup.name
      }
    });
    if (!existing) {
      await prisma.settingLookup.create({ data: lookup });
      console.log(`Created lookup: [${lookup.type}] ${lookup.name}`);
    }
  }
  console.log('Lookup seeding completed successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
