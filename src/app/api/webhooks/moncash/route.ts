import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Webhook Asynchrone MonCash (Emulation de l'API Digicel)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // En production: On vérifierait ici le Header x-moncash-signature
        // crypto.createHmac('sha256', MONCASH_SECRET)

        if (body.eventType === 'successful_payment' && body.orderId) {
            const order = await prisma.order.findUnique({
                where: { id: body.orderId },
                include: { items: true }
            });

            if (!order) {
                console.error(`[MONCASH WEBHOOK] Order ${body.orderId} not found.`);
                return new NextResponse("Order not found", { status: 404 });
            }

            if (order.status === "PAYMENT_CONFIRMED" || order.status === "DELIVERED") {
                console.log(`[MONCASH WEBHOOK] Idempotency Shield Active for Order ${body.orderId}`);
                return NextResponse.json({ received: true });
            }

            await prisma.$transaction(async (tx) => {
                await tx.order.update({
                    where: { id: body.orderId },
                    data: {
                        status: "PAYMENT_CONFIRMED",
                        paymentReference: body.transactionId
                    }
                });

                for (const item of order.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } }
                    });
                }
            });

            console.log(`[MONCASH WEBHOOK] Order ${body.orderId} confirmed via Async Payment Gateway & Stock decremented!`);
            return NextResponse.json({ received: true });
        }

        return new NextResponse("Invalid event type", { status: 400 });
    } catch (error) {
        console.error("MonCash Webhook Error:", error);
        return new NextResponse(`Webhook error: ${(error as Error).message}`, { status: 500 });
    }
}
