const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products in Product table.`);

    const existingMaterials = await prisma.material.findMany();
    const existingNames = new Set(existingMaterials.map(m => m.name.toUpperCase()));

    let count = 0;
    for (const product of products) {
        const name = product.name;
        if (!existingNames.has(name.toUpperCase())) {
            let category = "Ortho"; // Default
            const nameUpper = name.toUpperCase();
            if (nameUpper.includes("ZIRCON") || nameUpper.includes("ZIRC")) {
                category = "Zircon";
            } else if (nameUpper.includes("CERAMIC") || nameUpper.includes("EMAX") || nameUpper.includes("E MAX") || nameUpper.includes("VENEER")) {
                category = "Ceramic";
            } else if (nameUpper.includes("METAL") || nameUpper.includes("COPING") || nameUpper.includes("ALLOY") || nameUpper.includes("BAND")) {
                category = "Metal";
            } else if (nameUpper.includes("RESIN") || nameUpper.includes("FILM") || nameUpper.includes("PRINTER")) {
                category = "Resins";
            }

            await prisma.material.create({
                data: {
                    name: name,
                    category: category,
                    stock: Math.floor(Math.random() * 30) + 10, // default stock between 10 and 40
                    unit: "pc",
                    minStock: 5
                }
            });
            count++;
        }
    }
    console.log(`Successfully added ${count} products to Material table.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
