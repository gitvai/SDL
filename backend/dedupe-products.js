const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany();
    const seen = new Set();
    const toDelete = [];

    for (const p of products) {
        if (!p.name) continue;
        const key = p.name.trim().toLowerCase();
        if (seen.has(key)) {
            toDelete.push(p.id);
        } else {
            seen.add(key);
        }
    }

    console.log('Total products:', products.length);
    console.log('Duplicate products to delete:', toDelete.length);

    if (toDelete.length > 0) {
        const res = await prisma.product.deleteMany({
            where: { id: { in: toDelete } }
        });
        console.log('Deleted:', res.count);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
