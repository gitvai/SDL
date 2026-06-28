const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lookups = await prisma.settingLookup.findMany();
  const settings = await prisma.systemSetting.findMany();
  const staff = await prisma.staff.findMany();
  const products = await prisma.product.findMany();
  const productTypes = await prisma.productType.findMany();
  const materials = await prisma.material.findMany();

  console.log('--- LOOKUPS ---');
  console.log(JSON.stringify(lookups, null, 2));

  console.log('--- SETTINGS ---');
  console.log(JSON.stringify(settings, null, 2));

  console.log('--- STAFF ---');
  console.log(JSON.stringify(staff, null, 2));

  console.log('--- PRODUCTS ---');
  console.log(JSON.stringify(products, null, 2));

  console.log('--- PRODUCT TYPES ---');
  console.log(JSON.stringify(productTypes, null, 2));

  console.log('--- MATERIALS ---');
  console.log(JSON.stringify(materials, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
