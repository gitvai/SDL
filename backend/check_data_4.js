const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lookups = await prisma.settingLookup.findMany();
  console.log('All lookups:', lookups);
}

main().finally(() => prisma.$disconnect());
