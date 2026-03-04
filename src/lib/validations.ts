import { z } from "zod";

// Schema for adding/updating products in the Admin Dashboard
export const ProductSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.number().positive("Price must be positive"),
    stock: z.number().int().nonnegative("Stock must be 0 or positive"),
    categoryId: z.string().min(1, "Category is required"),
    image: z.string().url("Must be a valid image URL"),
    isNew: z.boolean().default(false),
    slug: z.string().optional(),
    sku: z.string().optional(),
});

// Schema for updating Cart Quantities
export const CartItemSchema = z.object({
    productId: z.string().cuid("Invalid Product ID"),
    quantity: z.number().int().min(1, "Quantity must be at least 1").max(50, "Maximum 50 items allowed"),
});

export const CartUpdateSchema = z.object({
    items: z.array(CartItemSchema),
});

// Schema for Checkout processing
export const CheckoutSchema = z.object({
    items: z.array(CartItemSchema).min(1, "Cart cannot be empty"),
    shippingAddress: z.string().min(5, "Shipping address is too short"),
    department: z.string().optional(),
    phoneNumber: z.string().regex(/^\d{8}$/, "Phone number must be exactly 8 digits"),
    paymentMethod: z.enum(["CASH", "MONCASH", "CARD"], {
        message: "Invalid payment method",
    }),
    idempotencyKey: z.string().uuid("Invalid idempotency key"),
    manualPaymentDetails: z.object({
        transactionId: z.string().optional(),
        phone: z.string().optional(),
        proofUrl: z.string().optional(),
    }).optional(),
});

// Global API Response standard
export type ApiResponse<T = undefined> = {
    success: boolean;
    message?: string;
    data?: T;
    errors?: z.ZodIssue[];
};
