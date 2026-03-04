"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function updateHtgRate(newRate: number) {
    const session = await auth();
    // Use type assertion carefully, or just check role
    if (!session?.user || (session.user as any).role !== 'admin') {
        throw new Error("Unauthorized");
    }

    if (newRate <= 0) {
        throw new Error("Invalid exchange rate.");
    }

    try {
        await prisma.setting.upsert({
            where: { key: 'HTG_RATE' },
            update: { value: newRate.toString() },
            create: {
                key: 'HTG_RATE',
                value: newRate.toString(),
                description: 'Taux de change Global USD vers HTG'
            }
        });

        // Revalidate the caching for product pages
        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error) {
        console.error("Failed to update HTG Rate:", error);
        return { success: false, error: "Database update failed." };
    }
}
