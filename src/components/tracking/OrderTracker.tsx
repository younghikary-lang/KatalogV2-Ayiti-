"use client";

import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { CheckCircle2, Clock, Truck, PlayCircle } from "lucide-react";
import { useTranslations } from "next-intl";

type OrderItem = {
    name: string;
    quantity: number;
    price: number;
};

type OrderData = {
    id: string;
    status: string;
    total: number;
    paymentProvider: string;
    shippingAddress: string | null;
    createdAt: Date;
    items: OrderItem[];
};

export function OrderTracker({ order }: { order: OrderData }) {
    const t = useTranslations('Dashboard');

    const getStatusStep = (status: string) => {
        switch (status) {
            case 'PENDING':
            case 'PAYMENT_INITIATED': return 1;
            case 'PAYMENT_CONFIRMED': return 2;
            case 'ASSIGNED': return 3;
            case 'DELIVERED': return 4;
            case 'PAYMENT_FAILED': return 0;
            default: return 0;
        }
    };

    const currentStep = getStatusStep(order.status);

    return (
        <div className="glass-surface p-8 rounded-3xl border border-white/5 space-y-12">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-black/20 rounded-2xl border border-white/5">
                <div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">Détails de Paye</h3>
                    <p className="text-sm text-gray-400 mt-1">Méthode: {order.paymentProvider}</p>
                </div>
                <div className="mt-4 md:mt-0 text-left md:text-right flex flex-col items-end">
                    <p className="text-3xl font-black text-accent mb-2">${order.total.toFixed(2)}</p>
                    <OrderStatusBadge status={order.status} />
                </div>
            </div>

            {/* Timeline Wrapper */}
            {order.status !== 'CANCELLED' && order.status !== 'PAYMENT_FAILED' ? (
                <div className="relative pt-6 pb-12 px-4 md:px-0">
                    {/* Background Track */}
                    <div className="absolute top-[2.75rem] left-[10%] right-[10%] h-1.5 bg-gray-800 rounded-full z-0"></div>
                    {/* Active Track */}
                    <div
                        className="absolute top-[2.75rem] left-[10%] h-1.5 bg-gradient-to-r from-blue-500 to-accent rounded-full z-0 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        style={{ width: `${(Math.max(1, currentStep) - 1) * 33.33}%` }}
                    ></div>

                    <div className="relative z-10 flex justify-between">
                        {/* 1. Placement */}
                        <div className={`flex flex-col items-center gap-4 w-1/4 transition-opacity duration-500 ${currentStep >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-[#0b1120] border-4 transition-colors duration-500 ${currentStep >= 1 ? 'border-accent text-accent shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-gray-800 text-gray-500'}`}>
                                <Clock className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <span className="block text-sm font-bold text-white mb-1">Enregistrée</span>
                                <span className="text-xs text-gray-500 hidden sm:block">Commande générée</span>
                            </div>
                        </div>

                        {/* 2. Validation */}
                        <div className={`flex flex-col items-center gap-4 w-1/4 transition-opacity duration-500 ${currentStep >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-[#0b1120] border-4 transition-colors duration-500 ${currentStep >= 2 ? 'border-accent text-accent shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-gray-800 text-gray-500'}`}>
                                <PlayCircle className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <span className="block text-sm font-bold text-white mb-1">Validée</span>
                                <span className="text-xs text-gray-500 hidden sm:block">Paiement certifié</span>
                            </div>
                        </div>

                        {/* 3. Dispatch */}
                        <div className={`flex flex-col items-center gap-4 w-1/4 transition-opacity duration-500 ${currentStep >= 3 ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-[#0b1120] border-4 transition-colors duration-500 ${currentStep >= 3 ? 'border-accent text-accent shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-gray-800 text-gray-500'}`}>
                                <Truck className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <span className="block text-sm font-bold text-white mb-1">En Route</span>
                                <span className="text-xs text-gray-500 hidden sm:block">Chauffeur localisé</span>
                            </div>
                        </div>

                        {/* 4. Complete */}
                        <div className={`flex flex-col items-center gap-4 w-1/4 transition-opacity duration-500 ${currentStep >= 4 ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-[#0b1120] border-4 transition-colors duration-500 ${currentStep >= 4 ? 'border-green-500 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-gray-800 text-gray-500'}`}>
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <span className="block text-sm font-bold text-white mb-1">Livrée</span>
                                <span className="text-xs text-gray-500 hidden sm:block">Colis à destination</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-8 text-center bg-red-500/10 rounded-2xl border border-red-500/20">
                    <p className="text-lg text-red-500 font-bold mb-2">Commande Interrompue</p>
                    <p className="text-sm text-red-400">Le statut final de cette commande ne permet pas son acheminement (Annulation ou Défaut de paiement).</p>
                </div>
            )}

            {/* Receipt Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h4 className="font-semibold text-white/50 uppercase tracking-widest text-xs">Acheteur</h4>
                    <div className="bg-black/20 p-5 rounded-xl border border-white/5">
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{order.shippingAddress || "Aucun point de chute déclaré."}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-white/50 uppercase tracking-widest text-xs">Articles Transportés ({order.items.length})</h4>
                    <div className="space-y-3">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#0f172a] rounded-lg flex items-center justify-center font-bold text-accent">
                                        x{item.quantity}
                                    </div>
                                    <p className="text-sm font-medium text-gray-200">{item.name}</p>
                                </div>
                                <p className="text-sm text-gray-400 font-mono">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
