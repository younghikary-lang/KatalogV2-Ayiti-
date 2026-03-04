"use client";

import { useState } from "react";
import { refuseOrder, markDelivered } from "@/app/actions/order";
import { useRouter } from "next/navigation";

type OrderItem = { name: string; quantity: number };

type Order = {
    id: string;
    status: string;
    total: number;
    shippingAddress: string | null;
    phoneNumber: string | null;
    items: OrderItem[];
};

export function DriverOrders({ orders }: { orders: Order[] }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleRefuse = async (orderId: string) => {
        setIsLoading(orderId);
        await refuseOrder(orderId);
        setIsLoading(null);
        router.refresh();
    };

    const handleDeliver = async (orderId: string) => {
        setIsLoading(orderId);
        await markDelivered(orderId);
        setIsLoading(null);
        router.refresh();
    };

    if (orders.length === 0) {
        return (
            <div className="text-center py-12 glass-surface rounded-2xl border border-white/5">
                <p className="text-muted-foreground">Aucune commande assignée pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
                <div key={order.id} className={`glass-surface rounded-2xl p-6 border-l-4 ${order.status === 'DELIVERED' ? 'border-l-green-500 opacity-60' : 'border-l-orange-500'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Ordre: #{order.id.slice(-6)}</h2>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-white/10 text-white">
                                {order.status}
                            </span>
                        </div>
                        <p className="font-bold text-accent">${order.total.toFixed(2)}</p>
                    </div>

                    <div className="space-y-2 mb-6 text-sm text-gray-300">
                        <p><strong className="text-white">Adresse:</strong> {order.shippingAddress}</p>
                        <p><strong className="text-white">Téléphone:</strong> {order.phoneNumber}</p>
                        <div className="mt-2 border-t border-white/10 pt-2">
                            <p className="font-medium text-white mb-1">Articles:</p>
                            <ul className="list-disc pl-5 opacity-80">
                                {order.items.map((item, idx) => (
                                    <li key={idx}>{item.quantity}x {item.name}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {order.status !== 'DELIVERED' && (
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => handleDeliver(order.id)}
                                disabled={isLoading === order.id}
                                className="flex-1 btn-primary py-2 rounded-xl text-sm font-medium hover:brightness-110 disabled:opacity-50"
                            >
                                {isLoading === order.id ? '...' : 'Livré'}
                            </button>
                            <button
                                onClick={() => handleRefuse(order.id)}
                                disabled={isLoading === order.id}
                                className="flex-1 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                            >
                                Refuser
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
