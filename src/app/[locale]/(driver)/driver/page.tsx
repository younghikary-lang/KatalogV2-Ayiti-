import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DriverOrders } from "@/components/driver/DriverOrders";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function DriverDashboard() {
    const t = await getTranslations('Dashboard');
    const session = await auth();

    if (!session?.user?.id) return null;

    const orders = await prisma.order.findMany({
        where: { driverId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                select: { name: true, quantity: true }
            }
        }
    });

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{t('driver')}</h1>
                <SignOutButton />
            </div>

            <DriverOrders orders={orders} />
        </div>
    );
}
