import prisma from "@/lib/prisma";

export async function getGlobalHtgRate(): Promise<number> {
    try {
        const setting = await prisma.setting.findUnique({
            where: { key: 'HTG_RATE' }
        });

        if (setting && !isNaN(parseFloat(setting.value))) {
            return parseFloat(setting.value);
        }
    } catch (error) {
        console.error("Error fetching HTG_RATE from DB:", error);
    }

    // Default fallback if not defined in DB
    return 135.0;
}
