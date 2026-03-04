"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Stripe from "stripe";

export async function linkGuestOrders(userId: string, phoneNumber: string) {
    if (!phoneNumber) return { success: false, error: "No phone number provided" };
    try {
        await prisma.order.updateMany({
            where: {
                clientId: null,
                phoneNumber: phoneNumber
            },
            data: {
                clientId: userId
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to link guest orders:", error);
        return { success: false, error: "Failed to link orders" };
    }
}

export async function createOrder(
    paymentMethod: string,
    items: { id: string; quantity: number }[],
    shippingAddress: string,
    phoneNumber: string,
    idempotencyKey: string,
    department?: string,
    manualPaymentDetails?: {
        transactionId?: string;
        phone?: string;
        proofUrl?: string;
    }
) {
    try {
        const session = await auth();
        // Session optionnelle pour autoriser le Guest Checkout
        const userId = session?.user?.id || null;

        const existingOrder = await prisma.order.findUnique({
            where: { idempotencyKey }
        });

        if (existingOrder) {
            return {
                success: true,
                orderId: existingOrder.id,
                total: existingOrder.total
            };
        }

        if (!items || items.length === 0) {
            return { success: false, error: "Cart is empty" };
        }

        // 🛡️ Strict Quantity Validation
        for (const item of items) {
            if (item.quantity <= 0 || item.quantity > 50) {
                return { success: false, error: "Invalid quantity detected. Max 50 per item." };
            }
        }

        let orderResponse: any = null;

        try {
            // 🔴 ENTER ISOLATED TRANSACTION
            orderResponse = await prisma.$transaction(async (tx) => {
                let computedSubtotal = 0;
                const validatedProducts = [];

                // 🟢 1. Atomic Optimistic Stock Decrement & Price Accumulation
                for (const item of items) {
                    const product = await tx.product.update({
                        where: { id: item.id },
                        data: { stock: { decrement: item.quantity } }
                    });

                    if (product.stock < 0) {
                        // Rollback transaction immediately
                        throw new Error(`Stock insuffisant pour ${product.name}. Reste: 0`);
                    }

                    validatedProducts.push({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: item.quantity
                    });

                    computedSubtotal += (product.price * item.quantity);
                }

                // 🟢 2. Delivery & Discount Computations
                let deliveryFee = 500; // Defaut ou Zone Port-au-Prince
                if (department && department !== "Ouest") {
                    deliveryFee = 1500; // Province
                }

                const isMember = !!userId;
                const discount = isMember ? computedSubtotal * 0.05 : 0;
                const computedTotal = (computedSubtotal + deliveryFee) - discount;

                // 🟢 3. Provider mapping
                let paymentProvider = "CASH";
                let status = "PENDING";

                if (paymentMethod === "stripe") {
                    paymentProvider = "STRIPE";
                    status = "PAYMENT_INITIATED";
                } else if (paymentMethod === "moncash") {
                    paymentProvider = "MONCASH";
                    status = "PENDING"; // En attente de vérification manuelle
                } else if (paymentMethod === "natcash") {
                    paymentProvider = "NATCASH";
                    status = "PENDING";
                } else {
                    paymentProvider = paymentMethod.toUpperCase();
                    status = "PENDING";
                }

                // 🟢 4. Persist Order Inside Transaction
                const order = await tx.order.create({
                    data: {
                        total: parseFloat(computedTotal.toFixed(2)),
                        status,
                        paymentProvider,
                        clientId: userId,
                        shippingAddress,
                        department,
                        phoneNumber,
                        paymentTransactionId: manualPaymentDetails?.transactionId,
                        paymentPhoneNumber: manualPaymentDetails?.phone,
                        paymentProofUrl: manualPaymentDetails?.proofUrl,
                        idempotencyKey,
                        items: {
                            create: validatedProducts
                        }
                    }
                });

                return {
                    success: true,
                    orderId: order.id,
                    total: order.total,
                    publicTrackingToken: order.publicTrackingToken
                };
            });

        } catch (txError: any) {
            // DB Transaction Rolled Back. Catch expected Out of Stock errors.
            return { success: false, error: txError.message };
        }

        // 🟢 Async WhatsApp Notification (Non-blocking)
        if (phoneNumber && orderResponse?.success) {
            Promise.resolve().then(async () => {
                // Simuler l'envoi WhatsApp (A remplacer par twilio ou meta graph api)
                if (phoneNumber && process.env.NEXT_PUBLIC_APP_URL) {
                    console.log(`[WHATSAPP API STUB] Sent notification to ${phoneNumber}: "Merci pour votre commande Katalog! Total payé: ${orderResponse.total.toFixed(2)}$. Suivi en direct: ${process.env.NEXT_PUBLIC_APP_URL}/fr/track/${orderResponse.publicTrackingToken}"`);
                } else if (phoneNumber) {
                    console.log(`[WHATSAPP API STUB] Sent notification to ${phoneNumber}: "Merci pour votre commande Katalog! Total payé: ${orderResponse.total.toFixed(2)}$"`);
                }
            }).catch(e => console.error("WhatsApp delivery failed silently", e));
        }

        if (paymentMethod === "stripe") {
            if (!process.env.STRIPE_SECRET_KEY) {
                console.error("Stripe is not configured in environment variables.");
                return { success: false, error: "Configuration de paiement invalide." };
            }

            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" as any });

            const stripeSession = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout`,
                client_reference_id: orderResponse.orderId,
                customer_email: session?.user?.email || undefined,
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: { name: `Commande Katalog (#${orderResponse.orderId.slice(-6)})` },
                        unit_amount: Math.round(orderResponse.total * 100),
                    },
                    quantity: 1,
                }],
                metadata: {
                    orderId: orderResponse.orderId
                }
            });

            await prisma.order.update({
                where: { id: orderResponse.orderId },
                data: { stripeSessionId: stripeSession.id }
            });

            return { success: true, checkoutUrl: stripeSession.url, orderId: orderResponse.orderId, publicTrackingToken: orderResponse.publicTrackingToken };
        }

        if (paymentMethod === "moncash") {
            // Local fallback simulation since we bypass redirect logic in this dummy implementation
            return {
                success: true,
                provider: 'moncash',
                orderId: orderResponse.orderId,
                publicTrackingToken: orderResponse.publicTrackingToken
            };
        }

        return { success: true, orderId: orderResponse.orderId, publicTrackingToken: orderResponse.publicTrackingToken, total: orderResponse.total };
    } catch (error: any) {
        console.error("[CRITICAL DB FAULT] Order creation failed. Error Details:", error.message || error);
        return { success: false, error: "Failed to create order. See server logs." };
    }
}

export async function updateOrderStatus(orderId: string, status: string) {
    try {
        const session = await auth();
        if (!session?.user || (session.user as any).role !== 'admin') {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

export async function assignDriver(orderId: string, driverId: string) {
    try {
        const session = await auth();
        if (!session?.user || (session.user as any).role !== 'admin') {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.order.update({
            where: { id: orderId },
            data: {
                driverId,
                status: 'ASSIGNED'
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to assign driver:", error);
        return { success: false, error: "Failed to assign driver" };
    }
}

export async function refuseOrder(orderId: string) {
    try {
        const session = await auth();
        if (!session?.user || (session.user as any).role !== 'driver') {
            return { success: false, error: "Unauthorized" };
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { paymentProvider: true }
        });

        const newStatus = order?.paymentProvider === 'STRIPE' ? 'PAYMENT_CONFIRMED' : 'PENDING';

        await prisma.order.update({
            where: { id: orderId, driverId: session.user.id },
            data: {
                driverId: null,
                status: newStatus
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to refuse order:", error);
        return { success: false, error: "Failed to refuse order" };
    }
}

export async function markDelivered(orderId: string) {
    try {
        const session = await auth();
        if (!session?.user || (session.user as any).role !== 'driver') {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.order.update({
            where: { id: orderId, driverId: session.user.id },
            data: { status: 'DELIVERED' }
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to mark delivered:", error);
        return { success: false, error: "Failed to mark delivered" };
    }
}

export async function trackOrder(trackingToken: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { publicTrackingToken: trackingToken },
            select: {
                id: true,
                publicTrackingToken: true,
                status: true,
                total: true,
                paymentProvider: true,
                shippingAddress: true,
                phoneNumber: true,
                department: true,
                createdAt: true,
                items: {
                    select: {
                        name: true,
                        quantity: true,
                        price: true
                    }
                }
            }
        });

        if (!order) {
            return { success: false, error: "Commande introuvable" };
        }

        return { success: true, order };
    } catch (error) {
        console.error("Failed to track order:", error);
        return { success: false, error: "Erreur serveur lors de la recherche" };
    }
}
