// @ts-nocheck
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simple slugify function
const slugify = (str: string) =>
    str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

async function runBackfill(isDryRun: boolean = true) {
    console.log(`\n======================================================`);
    console.log(`🚀 STARTING CATEGORY BACKFILL | MODE: ${isDryRun ? "DRY-RUN 🧪" : "LIVE 🔴"}`);
    console.log(`======================================================\n`);

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Fetch all products
            const products = await tx.product.findMany({});
            console.log(`[LOG] Found ${products.length} products to evaluate.`);

            let mappedCount = 0;

            // 🛡️ Safeguard: Normalize, trim, and filter null/empty categories
            const normalizedCategories = products
                .map(p => (p.category ? p.category.trim().toLowerCase() : null))
                .filter((c): c is string => c !== null && c.length > 0);

            const uniqueCategories = new Set(normalizedCategories);
            console.log(`[LOG] Unique normalized string categories found: ${uniqueCategories.size} (${Array.from(uniqueCategories).join(', ')})`);

            const categoryMap = new Map<string, string>(); // Maps legacy name to new categoryId

            // 2. Process or Create Categories
            for (const categoryName of Array.from(uniqueCategories)) {
                const slug = slugify(categoryName);
                if (isDryRun) {
                    console.log(`[DRY-RUN] Would create/find Category: "${categoryName}" (slug: ${slug})`);
                    categoryMap.set(categoryName, `mock-id-${slug}`);
                } else {
                    const category = await tx.category.upsert({
                        where: { slug: slug },
                        update: {}, // Do nothing if it exists
                        create: { name: categoryName, slug: slug }
                    });
                    console.log(`[LIVE] Resolved Category in DB: "${category.name}" (ID: ${category.id})`);
                    categoryMap.set(categoryName, category.id);
                }
            }

            // 3. Map Products
            for (const product of products) {
                if (product.categoryId) {
                    console.log(`[SKIP] Product "${product.name}" already has categoryId ${product.categoryId}`);
                    continue;
                }

                // Strictly evaluate normalized legacy field
                const normalizedCat = product.category ? product.category.trim().toLowerCase() : null;

                if (!normalizedCat) {
                    console.warn(`[WARN] Product "${product.name}" has invalid or empty legacy category. Attempting to process anyway...`);
                }

                const targetCategoryId = normalizedCat ? categoryMap.get(normalizedCat) : undefined;

                if (!targetCategoryId) {
                    console.warn(`[WARN] No target category found for product "${product.name}" (normalized category: ${normalizedCat})`);
                    continue;
                }

                if (isDryRun) {
                    console.log(`[DRY-RUN] Would link Product "${product.name}" to categoryId: ${targetCategoryId}`);
                    mappedCount++;
                } else {
                    await tx.product.update({
                        where: { id: product.id },
                        data: { categoryId: targetCategoryId }
                    });
                    console.log(`[LIVE] Linked Product "${product.name}" to categoryId: ${targetCategoryId}`);
                    mappedCount++;
                }
            }

            // 🛡️ Safeguard: Integrity Validation Check (Runs inside transaction)
            if (!isDryRun) {
                console.log(`\n🔍 Validating Data Integrity within Transaction...`);
                // Query tx for products missing a categoryId
                const unmappedProducts = await tx.product.findMany({
                    where: { categoryId: null }
                });

                if (unmappedProducts.length > 0) {
                    console.error(`\n❌ INTEGRITY ERROR: Found ${unmappedProducts.length} products with null categoryId!`);
                    for (const p of unmappedProducts) {
                        console.error(`   - Product: "${p.name}" (ID: ${p.id}, Legacy Category: "${p.category}")`);
                    }
                    throw new Error("Data Integrity Check Failed: Silent mappings missed some products. Rolling back transaction.");
                } else {
                    console.log(`✅ Integrity Check Passed: All products securely mapped to a relational Category!`);
                }
            }

            return { totalEvaluated: products.length, mappedCount, categoriesProcessed: uniqueCategories.size };
        }, {
            timeout: 10000 // 10s wait
        });

        console.log(`\n======================================================`);
        console.log(`✅ BACKFILL COMPLETE `);
        console.log(`======================================================`);
        console.log(`📊 METRICS:`);
        console.log(`- Products Evaluated: ${result.totalEvaluated}`);
        console.log(`- Unique Categories: ${result.categoriesProcessed}`);
        console.log(`- Products Mapped: ${result.mappedCount}`);

        if (isDryRun) {
            console.log(`\n🧪 DRY-RUN FINISHED. No database changes were committed.`);
        } else {
            console.log(`\n🔴 LIVE RUN FINISHED. Changes permanently committed to database.`);
        }

    } catch (error) {
        console.error("\n❌ MIGRATION FAILED. Database Transaction safely rolled back.");
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect()
    }
}

// Execute logic
const modeParam = process.argv[2];
const isDryRun = modeParam !== "--live";

runBackfill(isDryRun);
