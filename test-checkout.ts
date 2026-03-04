import { createOrder } from "./src/app/actions/order";

async function run() {
    console.log("Starting forced checkout...");
    const res = await createOrder(
        "stripe",
        [{ id: "clrtq3y610006v0xxz1234567", quantity: 1 }],
        "Port-au-Prince, Haiti",
        "50933334444",
        "test-idempotency-" + Date.now()
    );
    console.log("Result:", res);
}

run();
