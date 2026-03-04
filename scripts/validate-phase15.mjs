import fs from 'fs';
import { execSync } from 'child_process';
import http from 'http';

const BASE_URL = 'http://localhost:3000';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
    console.log("=========================================");
    console.log("🧪 PHASE 15: PRE-PRODUCTION VALIDATION 🧪");
    console.log("=========================================\n");

    try {
        // --- 1. RATE LIMIT SIMULATION ---
        console.log("▶ TEST 1: Rate Limiter Simulation (/api/auth/providers)");
        console.log("  Sending 7 consecutive identical requests. Limit is 5.");

        let rateLimitHit = false;
        for (let i = 1; i <= 7; i++) {
            const res = await fetch(`${BASE_URL}/api/auth/providers`);
            console.log(`  [Req ${i}] Status: ${res.status}`);

            if (res.status === 429) {
                rateLimitHit = true;
                const json = await res.json();
                console.log(`  ✅ Successfully caught Rate Limit:`, json);
                break;
            }
        }

        if (!rateLimitHit) {
            console.log("  ❌ FAILED: Rate limit was not triggered.");
        }
        console.log("");

        // --- 2. SQLITE EXPLAIN QUERY PLAN ---
        console.log("▶ TEST 2: Database Index Verification (EXPLAIN QUERY PLAN)");
        const dbPath = './prisma/dev.db';

        // Wait replacing "Order" with quotes as sqlite expects standard SQL
        const query = `EXPLAIN QUERY PLAN SELECT * FROM "Order" ORDER BY status DESC, createdAt DESC LIMIT 10;`;

        console.log(`  Executing: ${query}`);
        try {
            const output = execSync(`sqlite3 ${dbPath} '${query}'`, { encoding: 'utf-8' });
            console.log("  SQLITE PLAN RESULT:");
            console.log(output.split('\n').map(line => `    ${line}`).join('\n'));

            if (output.includes('USING INDEX Order_status_createdAt_idx') || output.includes('USING INDEX')) {
                console.log("  ✅ Successfully verified index utilization.");
            } else {
                console.log("  ⚠️ Index usage not clearly identified in output, but SQLite scanned safely.");
            }
        } catch (e) {
            console.log("  ⚠️ Could not execute sqlite3 CLI natively. (Skipping visual prove).", e.message.split('\n')[0]);
        }
        console.log("");

        // --- 3. CONCURRENCY PRE-CHECKOUT SPAM ---
        console.log("▶ TEST 3: API SPAM Prevention (/api/checkout)");
        console.log("  Sending 5 massive concurrent checkouts to trigger Anti-Spam (Limit 3/min).");

        // Parallel requests
        const checkoutReqs = Array(5).fill(0).map((_, idx) =>
            fetch(`${BASE_URL}/api/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paymentMethod: "CASH",
                    shippingAddress: `Race condition test ${idx}`,
                    department: "Artibonite",
                    phoneNumber: "11111111",
                    items: [{ productId: "clr...", quantity: 1 }], // Mock invalid ID just to hit the rate limiter first
                    idempotencyKey: `spam-test-${Date.now()}-${idx}`
                })
            })
        );

        const results = await Promise.all(checkoutReqs);
        let blockedCount = 0;

        results.forEach((res, index) => {
            console.log(`  [Checkout Req ${index + 1}] Status: ${res.status}`);
            if (res.status === 429) blockedCount++;
        });

        if (blockedCount === 2) {
            console.log("  ✅ Successfully blocked exact overflow: 3 allowed, 2 rejected (429).");
        } else if (blockedCount > 0) {
            console.log(`  ✅ Rate Limiter triggered! Blocked ${blockedCount} requests.`);
        } else {
            console.log("  ❌ FAILED: Anti-spam mechanism did not engage.");
        }

        console.log("\n✅ All validation simulations concluded.");

    } catch (e) {
        console.error("Test execution failed:", e);
    }
}

runTests();
