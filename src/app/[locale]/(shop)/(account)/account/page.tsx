import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { CheckCircle2, Clock, Truck, PlayCircle, User } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function AccountPage() {
    const t = await getTranslations('Dashboard');
    const session = await auth();

    if (!session?.user?.id) return (
        <div className="w-full text-center py-24">
            <h1 className="text-2xl font-semibold mb-4 text-foreground">Accès Refusé</h1>
            <p className="text-muted-foreground">Veuillez vous connecter pour voir vos commandes.</p>
        </div>
    );

    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, createdAt: true }
    });

    const orders = await prisma.order.findMany({
        where: { clientId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            items: true
        }
    });

    const getStatusStep = (status: string) => {
        switch (status) {
            case 'PENDING':
            case 'PAYMENT_INITIATED': return 1;
            case 'PAYMENT_CONFIRMED': return 2;
            case 'PAYMENT_FAILED': return 0;
            case 'ASSIGNED': return 3;
            case 'DELIVERED': return 4;
            default: return 0;
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

            {/* Header Profile Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 glass-surface p-8 rounded-3xl border border-white/5">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center border-2 border-accent/50">
                        <User className="w-10 h-10 text-accent" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{dbUser?.name || 'Client'}</h1>
                        <p className="text-muted-foreground">{dbUser?.email}</p>
                        <p className="text-xs text-white/40 mt-1">Membre depuis le {dbUser?.createdAt ? format(dbUser.createdAt, 'dd MMM yyyy') : 'N/A'}</p>
                    </div>
                </div>
                <SignOutButton />
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-foreground mb-8">Historique des Commandes</h2>

                {orders.length === 0 ? (
                    <div className="text-center py-16 glass-surface rounded-3xl border border-white/5">
                        <p className="text-xl text-muted-foreground">Vous n'avez pas encore passé de commande.</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {orders.map(order => {
                            const currentStep = getStatusStep(order.status);

                            return (
                                <div key={order.id} className="glass-surface p-8 rounded-3xl border border-white/5 space-y-8">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-6">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Commande Mofify #{order.id.slice(-8).toUpperCase()}</p>
                                            <p className="font-semibold">{format(order.createdAt, 'dd MMM yyyy, HH:mm')}</p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-sm text-muted-foreground mb-1">Total</p>
                                            <p className="text-xl font-bold text-accent">${order.total.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Timeline UI */}
                                    {order.status !== 'CANCELLED' ? (
                                        <div className="relative pt-4 pb-8">
                                            <div className="absolute top-8 left-[10%] right-[10%] h-1 bg-white/10 rounded-full z-0"></div>
                                            <div className="absolute top-8 left-[10%] h-1 bg-accent rounded-full z-0 transition-all duration-1000" style={{ width: `${(Math.max(1, currentStep) - 1) * 33.33}%` }}></div>

                                            <div className="relative z-10 flex justify-between">
                                                {/* Step 1 */}
                                                <div className={`flex flex-col items-center gap-3 w-1/4 ${currentStep >= 1 ? 'text-accent opacity-100' : 'text-muted-foreground opacity-50'}`}>
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-[#0b1120] border-2 transition-colors ${currentStep >= 1 ? 'border-accent' : 'border-white/20'}`}>
                                                        <Clock className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-xs font-semibold uppercase tracking-wider text-center">En Attente</span>
                                                </div>
                                                {/* Step 2 */}
                                                <div className={`flex flex-col items-center gap-3 w-1/4 ${currentStep >= 2 ? 'text-accent opacity-100' : 'text-muted-foreground opacity-50'}`}>
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-[#0b1120] border-2 transition-colors ${currentStep >= 2 ? 'border-accent' : 'border-white/20'}`}>
                                                        <PlayCircle className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-xs font-semibold uppercase tracking-wider text-center">Payé / Validé</span>
                                                </div>
                                                {/* Step 3 */}
                                                <div className={`flex flex-col items-center gap-3 w-1/4 ${currentStep >= 3 ? 'text-accent opacity-100' : 'text-muted-foreground opacity-50'}`}>
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-[#0b1120] border-2 transition-colors ${currentStep >= 3 ? 'border-accent' : 'border-white/20'}`}>
                                                        <Truck className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-xs font-semibold uppercase tracking-wider text-center">En Route</span>
                                                </div>
                                                {/* Step 4 */}
                                                <div className={`flex flex-col items-center gap-3 w-1/4 ${currentStep >= 4 ? 'text-green-500 opacity-100' : 'text-muted-foreground opacity-50'}`}>
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-[#0b1120] border-2 transition-colors ${currentStep >= 4 ? 'border-green-500' : 'border-white/20'}`}>
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-xs font-semibold uppercase tracking-wider text-center">Livré</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-6 text-center text-red-500 font-semibold bg-red-500/10 rounded-2xl border border-red-500/20">
                                            Commande Annulée
                                        </div>
                                    )}

                                    {/* Articles */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-foreground">Articles ({order.items.length})</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                                                        <p className="text-xs text-muted-foreground">Qté: {item.quantity} • ${item.price.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-white/10 text-sm text-gray-400">
                                        <p>Livré à: {order.shippingAddress || "Adresse non spécifiée"}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
