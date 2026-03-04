import { NextRequest, NextResponse } from "next/server";
import { CheckoutSchema, ApiResponse } from "@/lib/validations";
import { createOrder } from "@/app/actions/order";
import { withErrorHandler } from "@/lib/api-handler";

export const POST = withErrorHandler(async (req: NextRequest) => {
    const body = await req.json();

    // 🛡️ 1. Native Zod parsing (Throws ZodError to the global wrapper)
    const data = CheckoutSchema.parse(body);

    // 🚀 2. Execute verified backend logic
    const result = await createOrder(
        data.paymentMethod,
        data.items.map(i => ({ id: i.productId, quantity: i.quantity })),
        data.shippingAddress,
        data.phoneNumber,
        data.idempotencyKey,
        data.department,
        data.manualPaymentDetails || {}
    );

    if (!result.success) {
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                message: result.error || "Failed to process checkout",
            },
            { status: 422 } // Unprocessable Entity
        );
    }

    return NextResponse.json<ApiResponse<{ orderId: string, checkoutUrl?: string, publicTrackingToken?: string, total?: number }>>(
        {
            success: true,
            message: "Order created successfully",
            data: {
                orderId: result.orderId as string,
                checkoutUrl: result.checkoutUrl as string | undefined,
                publicTrackingToken: result.publicTrackingToken as string | undefined,
                total: result.total as number | undefined
            }
        },
        { status: 201 } // Created
    );
}, { rateLimit: { limit: 3, windowMs: 60000 } });
