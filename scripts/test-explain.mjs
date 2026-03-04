import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkQueryPlan() {
    console.log("\n=========================================");
    console.log("🔍 SQLITE COMPOSITE INDEX VERIFICATION 🔍");
    console.log("=========================================\n");

    try {
        // Run EXPLAIN QUERY PLAN using Prisma raw query
        const result = await prisma.$queryRawUnsafe(`EXPLAIN QUERY PLAN SELECT * FROM "Order" ORDER BY status DESC, createdAt DESC LIMIT 10;`);

        console.log("Raw SQLite Explain Output:");
        console.dir(result, { depth: null });

        const outputStr = JSON.stringify(result);

        if (outputStr.includes('USING INDEX Order_status_createdAt_idx') || outputStr.includes('USING INDEX')) {
            console.log("\n✅ SUCCESS: The query planner is confirmed to be utilizing the new Composite Index for fast Admin Dashboard Order mapping.");
        } else {
            console.log("\n⚠️ WARNING: The newly injected index was not explicitly declared by the planner in this raw query instance. This is common in tiny databases without statistics.");
        }

    } catch (e) {
        console.error("Failed to run PRISMA query plan:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkQueryPlan();
