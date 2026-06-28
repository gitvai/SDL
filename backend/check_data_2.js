const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lookups = await prisma.settingLookup.findMany();
  const settings = await prisma.systemSetting.findMany();
  console.log(`SettingLookup count: ${lookups.length}`);
  console.log('Types of lookups present:', [...new Set(lookups.map(l => l.type))]);
  console.log(`SystemSetting count: ${settings.length}`);
  console.log('Keys of settings present:', settings.map(s => s.key));
}

main().finally(() => prisma.$disconnect());
