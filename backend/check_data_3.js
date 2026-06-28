const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clientsCount = await prisma.client.count();
  const ordersCount = await prisma.order.count();
  const invoicesCount = await prisma.invoice.count();
  const receiptsCount = await prisma.receipt.count();
  const staffCount = await prisma.staff.count();
  const lookupsCount = await prisma.settingLookup.count();
  const productsCount = await prisma.product.count();

  console.log('--- DATABASE COUNT ---');
  console.log(`Clients: ${clientsCount}`);
  console.log(`Orders: ${ordersCount}`);
  console.log(`Invoices: ${invoicesCount}`);
  console.log(`Receipts: ${receiptsCount}`);
  console.log(`Staff: ${staffCount}`);
  console.log(`Lookups: ${lookupsCount}`);
  console.log(`Products: ${productsCount}`);
}

main().finally(() => prisma.$disconnect());
