import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

// Next.js App Router default parser disables the Body stream transformation
// allowing us to read the raw body directly via req.text()

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get("stripe-signature");

        if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
            return new NextResponse("Missing signature or webhook secret", { status: 400 });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2023-10-16" as any // Fallback any casting for version compatibility
        });

        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        // ============================
        // 💳 Paiement Réussi
        // ============================
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.orderId;

            if (!orderId) {
                return new NextResponse("No orderId inside metadata", { status: 400 });
            }

            try {
                const order = await prisma.order.findUnique({
                    where: { id: orderId },
                    include: { items: true }
                });

                if (!order) {
                    console.error(`[STRIPE WEBHOOK] Order ${orderId} not found.`);
                    return new NextResponse("Order not found", { status: 404 });
                }

                if (order.status === "PAYMENT_CONFIRMED" || order.status === "DELIVERED") {
                    console.log(`[STRIPE WEBHOOK] Idempotency Shield Active. Event duplicated for Order ${orderId}`);
                    return NextResponse.json({ received: true });
                }

                await prisma.$transaction(async (tx) => {
                    await tx.order.update({
                        where: { id: orderId },
                        data: { status: "PAYMENT_CONFIRMED" }
                    });

                    for (const item of order.items) {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { decrement: item.quantity } }
                        });
                    }
                });

                console.log(`[STRIPE WEBHOOK] Order ${orderId} confirmed & Stock decremented!`);
            } catch (err) {
                console.error("Order Update Transaction Failed", err);
            }
        }

        // ============================
        // ❌ Paiement Échoué ou Expiré
        // ============================
        const failedEvents = [
            "checkout.session.async_payment_failed",
            "checkout.session.expired",
            "payment_intent.payment_failed"
        ];

        if (failedEvents.includes(event.type)) {
            let orderId: string | undefined;

            if (event.type === "payment_intent.payment_failed") {
                const intent = event.data.object as Stripe.PaymentIntent;
                orderId = intent.metadata?.orderId;
            } else {
                const session = event.data.object as Stripe.Checkout.Session;
                orderId = session.metadata?.orderId;
            }

            if (orderId) {
                try {
                    await prisma.order.update({
                        where: { id: orderId },
                        data: { status: "PAYMENT_FAILED" }
                    });
                    console.error(`[STRIPE WEBHOOK] Payment failed/expired for Order ${orderId}. Status updated to PAYMENT_FAILED.`);
                } catch (err) {
                    console.error("Order Failure Update Failed", err);
                }
            } else {
                console.error(`[STRIPE WEBHOOK] Received ${event.type} but no orderId found in metadata.`);
            }
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("Stripe Webhook Error:", error);
        return new NextResponse(`Webhook error: ${(error as Error).message}`, { status: 400 });
    }
}
