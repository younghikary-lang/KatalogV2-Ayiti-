import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { OrderList } from "@/components/admin/OrderList";
import { UsersList } from "@/components/admin/UsersList";
import { ProductsList } from "@/components/admin/ProductsList";
import { SettingsList } from "@/components/admin/SettingsList";
import { getGlobalHtgRate } from "@/lib/settings";
import { Package, ShoppingCart, AlertTriangle, DollarSign, Users, Truck, Settings } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function AdminDashboard({
    searchParams
}: {
    searchParams: { tab?: string, page?: string, status?: string, search?: string }
}) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        redirect("/login");
    }

    const t = await getTranslations('Dashboard');
    const params = await searchParams; // Next 15 searchParams resolution

    const activeTab = params.tab || 'orders';
    const page = Number(params.page) || 1;
    const searchFilter = params.search || undefined;

    // 📊 Global KPIs Computation
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();
    const pendingPayments = await prisma.order.count({ where: { status: "PENDING" } });

    const revenueData = await prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ["PAYMENT_CONFIRMED", "DELIVERED", "PAID"] } }
    });
    const totalRevenue = revenueData._sum.total || 0;

    // 📑 Data Fetching based on Active Tab
    let tabContent = null;

    if (activeTab === 'orders') {
        const orders = await prisma.order.findMany({
            where: {
                phoneNumber: searchFilter ? { contains: searchFilter } : undefined
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            skip: (page - 1) * 20,
            include: { items: { select: { name: true, quantity: true } } }
        });
        const drivers = await prisma.user.findMany({ where: { role: "driver", active: true }, select: { id: true, name: true } });
        tabContent = <OrderList orders={orders as any} drivers={drivers} currentFilters={{ search: searchFilter, page }} />;
    } else if (activeTab === 'products') {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: { categoryRef: true }
        });
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });
        tabContent = <ProductsList initialProducts={products as any} categories={categories as any} />;
    } else if (activeTab === 'users') {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: searchFilter || "" } },
                    { email: { contains: searchFilter || "" } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        const clientCount = await prisma.user.count({ where: { role: 'CLIENT' } });
        const driverCount = await prisma.user.count({ where: { role: 'driver' } });

        tabContent = <UsersList initialUsers={users} clientCount={clientCount} driverCount={driverCount} />;
    } else if (activeTab === 'settings') {
        const currentRate = await getGlobalHtgRate();
        tabContent = <SettingsList currentRate={currentRate} />;
    } else {
        tabContent = (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground glass-surface rounded-3xl border border-white/5">
                <Package className="w-12 h-12 mb-4 opacity-20" />
                <p>Le module "{activeTab}" est en cours de développement.</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#f8f9fa] dark:bg-[#0b1120] min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header (Capture 15) */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
                        <p className="text-sm text-green-500 font-medium flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Accès sécurisé
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium hover:bg-white/5 transition-colors bg-white dark:bg-[#1d1d1f] shadow-sm">
                            <Truck className="w-4 h-4" /> Scan Livraison
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a202c] dark:bg-white text-white dark:text-black font-medium text-sm shadow-md hover:opacity-90 transition-opacity">
                            <Package className="w-4 h-4" /> Nouveau produit
                        </button>
                    </div>
                </div>

                {/* KPI Cards (Capture 15) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-[#1d1d1f] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                            <Package className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-black text-foreground">{totalProducts}</p>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Produits catalog</p>
                    </div>
                    <div className="bg-white dark:bg-[#1d1d1f] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-black text-foreground">{totalOrders}</p>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Total Commandes</p>
                    </div>
                    <div className="bg-white dark:bg-[#1d1d1f] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-black text-foreground">{pendingPayments}</p>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Paiements en attente</p>
                    </div>
                    <div className="bg-white dark:bg-[#1d1d1f] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-black text-foreground">{totalRevenue}</p>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Revenus HTG</p>
                    </div>
                </div>

                {/* Scrollable Tabs */}
                <div className="flex overflow-x-auto gap-2 pb-4 mb-4 scrollbar-hide">
                    <Link href="?tab=products" className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'products' ? 'bg-[#1a202c] dark:bg-white text-white dark:text-black shadow-md' : 'bg-white dark:bg-[#1d1d1f] text-muted-foreground hover:text-foreground border border-gray-200 dark:border-white/5'}`}>
                        <Package className="w-4 h-4" /> Produits
                    </Link>
                    <Link href="?tab=orders" className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-[#1a202c] dark:bg-white text-white dark:text-black shadow-md' : 'bg-white dark:bg-[#1d1d1f] text-muted-foreground hover:text-foreground border border-gray-200 dark:border-white/5'}`}>
                        <ShoppingCart className="w-4 h-4" /> Commandes
                    </Link>
                    <Link href="?tab=payments" className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'payments' ? 'bg-[#1a202c] dark:bg-white text-white dark:text-black shadow-md' : 'bg-white dark:bg-[#1d1d1f] text-muted-foreground hover:text-foreground border border-gray-200 dark:border-white/5'}`}>
                        <DollarSign className="w-4 h-4" /> Paiements
                    </Link>
                    <Link href="?tab=users" className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-[#1a202c] dark:bg-white text-white dark:text-black shadow-md' : 'bg-white dark:bg-[#1d1d1f] text-muted-foreground hover:text-foreground border border-gray-200 dark:border-white/5'}`}>
                        <Users className="w-4 h-4" /> Utilisateurs
                    </Link>
                    <Link href="?tab=drivers" className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'drivers' ? 'bg-[#1a202c] dark:bg-white text-white dark:text-black shadow-md' : 'bg-white dark:bg-[#1d1d1f] text-muted-foreground hover:text-foreground border border-gray-200 dark:border-white/5'}`}>
                        <Truck className="w-4 h-4" /> Livreurs
                    </Link>
                    <Link href="?tab=settings" className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-[#1a202c] dark:bg-white text-white dark:text-black shadow-md' : 'bg-white dark:bg-[#1d1d1f] text-muted-foreground hover:text-foreground border border-gray-200 dark:border-white/5'}`}>
                        <Settings className="w-4 h-4" /> Paramètres
                    </Link>
                </div>

                {/* Tab Component Area */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {tabContent}
                </div>

            </div>
        </div>
    );
}
