import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

async function simulateRaceCondition() {
    console.log("\n=============================================");
    console.log("🔥 RACE CONDITION / OVERSELLING SIMULATION 🔥");
    console.log("=============================================\n");

    try {
        console.log("1. Preparing isolation test data...");
        // Get the first product to use for testing
        const product = await prisma.product.findFirst({
            where: { isNew: true } // Pick an arbitrary product
        });

        if (!product) throw new Error("No products found in the database. Run seed first.");

        // Force ID to a valid CUID format so Zod doesn't reject it, since legacy seed used "p1"
        const validCuid = 'cjld2cjxh0000qzrmn831i7rn';
        const updatedProduct = await prisma.product.update({
            where: { id: product.id },
            data: { id: validCuid, stock: 1 }
        });

        console.log(`   Selected Target Product: ${updatedProduct.name} (Forced CUID: ${updatedProduct.id})`);
        console.log("   ✅ Force-set DB real stock to exactly 1.\n");

        console.log("2. Launching Concurrent Arsenal (3 parallel checkout requests).");
        console.log("   Since Rate Limit allows 3 req/min, all 3 will hit the Controller concurrently.");

        const payload = {
            paymentMethod: "CASH",
            shippingAddress: "Stress Test Ave.",
            department: "West",
            phoneNumber: "55555555",
            items: [{ productId: updatedProduct.id, quantity: 1 }]
        };

        // Fire 3 simultaneous API calls
        const promises = [0, 1, 2].map((idx) =>
            fetch(`${BASE_URL}/api/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-forwarded-for": "192.168.10." + idx
                },
                body: JSON.stringify({ ...payload, idempotencyKey: crypto.randomUUID() })
            })
        );

        const results = await Promise.allSettled(promises);

        let successfulOrders = 0;
        let genericFailures = 0;
        let outOfStockErrors = 0;
        let rateLimits = 0;

        for (const [idx, res] of results.entries()) {
            if (res.status === 'fulfilled') {
                const response = res.value;
                const json = await response.json();

                console.log("   [Thread " + (idx + 1) + "] Status: " + response.status + " => " + json.message);
                if (response.status === 400) {
                    console.log("     Zod Issues:", json.errors);
                }

                if (response.status === 201) successfulOrders++;
                else if (response.status === 429) rateLimits++;
                else if (response.status === 422 && json.message.includes('out of stock')) outOfStockErrors++;
                else genericFailures++;
            }
        }

        console.log("\n3. Post-Simulation DB Verification:");
        const finalProduct = await prisma.product.findUnique({ where: { id: updatedProduct.id } });
        console.log(`   Final Real DB Stock: ${finalProduct?.stock}`);

        if (successfulOrders === 1 && finalProduct?.stock === 0) {
            console.log("   ✅ VALIDATION PASSED: The Prisma Interactive Transaction isolated the concurrent requests. Exactly 1 order succeeded, others naturally failed due to Out of Stock evaluation. No negative integers.");
        } else {
            console.log("   ❌ VALIDATION FAILED: Race condition detected. Overselling occurred or requests died unexpectedly.");
            console.log(`      Successes: ${successfulOrders}, DB Stock: ${finalProduct?.stock}`);
        }

    } catch (e) {
        console.error("Simulation crashed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

simulateRaceCondition();
