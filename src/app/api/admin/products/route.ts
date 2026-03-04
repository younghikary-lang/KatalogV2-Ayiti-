import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ProductSchema } from "@/lib/validations";
import { withErrorHandler, UnauthorizedError } from "@/lib/api-handler";

const ADMIN_RATE_LIMIT = { limit: 60, windowMs: 60000 };

export const GET = withErrorHandler(async (req: Request) => {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        throw new UnauthorizedError("Unauthorized access to Admin API");
    }

    const products = await prisma.product.findMany({
        include: { categoryRef: true },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: products });
}, { rateLimit: ADMIN_RATE_LIMIT });

export const POST = withErrorHandler(async (req: Request) => {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        throw new UnauthorizedError("Unauthorized access to Admin API");
    }

    const body = await req.json();

    // Auto-throws ZodError to be caught by withErrorHandler
    const data = ProductSchema.parse(body);

    const { categoryId, ...restData } = data;

    // Execute Prisma creation
    const product = await prisma.product.create({
        data: {
            ...restData,
            categoryId: categoryId as string,
        },
        include: { categoryRef: true }
    });

    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, data: product }, { status: 201 });
}, { rateLimit: ADMIN_RATE_LIMIT });
