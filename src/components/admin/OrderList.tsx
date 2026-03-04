"use client";

import { useState } from "react";
import { updateOrderStatus, assignDriver } from "@/app/actions/order";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";

type Order = {
    id: string;
    status: string;
    total: number;
    shippingAddress: string | null;
    phoneNumber: string | null;
    createdAt: Date;
    driverId: string | null;
    paymentProvider: string;
    paymentProofUrl: string | null;
    paymentTransactionId: string | null;
    items: { name: string; quantity: number }[];
};

type Driver = {
    id: string;
    name: string | null;
};

export function OrderList({ orders, drivers, currentFilters = {} }: {
    orders: Order[],
    drivers: Driver[],
    currentFilters?: { status?: string, provider?: string, search?: string, page?: number }
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    // Modal State
    const [proofModalOpen, setProofModalOpen] = useState(false);
    const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

    // Filter State
    const [searchPhone, setSearchPhone] = useState(currentFilters.search || "");
    const [statusFilter, setStatusFilter] = useState(currentFilters.status || "");
    const [providerFilter, setProviderFilter] = useState(currentFilters.provider || "");

    const handleStatusChange = async (orderId: string, status: string) => {
        setIsLoading(orderId);
        await updateOrderStatus(orderId, status);
        setIsLoading(null);
        router.refresh();
    };

    const handleDriverChange = async (orderId: string, driverId: string) => {
        setIsLoading(orderId);
        await assignDriver(orderId, driverId);
        setIsLoading(null);
        router.refresh();
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        if (providerFilter) params.set("provider", providerFilter);
        if (searchPhone) params.set("search", searchPhone);

        router.push(`/admin?${params.toString()}`);
    };

    return (
        <div className="mt-12 bg-[#0b1120]/50 border border-white/5 rounded-2xl overflow-hidden glass-surface">

            {/* Filters Header */}
            <div className="p-4 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between bg-white/[0.01]">
                <div className="flex flex-wrap gap-3 flex-1">
                    <input
                        type="text"
                        placeholder="Chercher par téléphone..."
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-accent w-full max-w-[200px]"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-accent"
                    >
                        <option value="">Tous les Statuts</option>
                        <option value="PENDING">PENDING</option>
                        <option value="PAYMENT_INITIATED">PAYMENT_INITIATED</option>
                        <option value="PAYMENT_CONFIRMED">PAYMENT_CONFIRMED</option>
                        <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
                        <option value="ASSIGNED">ASSIGNED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <select
                        value={providerFilter}
                        onChange={(e) => setProviderFilter(e.target.value)}
                        className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-accent"
                    >
                        <option value="">Tous les Fournisseurs</option>
                        <option value="STRIPE">STRIPE</option>
                        <option value="MONCASH">MONCASH</option>
                        <option value="NATCHCASH">NATCASH</option>
                        <option value="CASH">CASH</option>
                    </select>
                </div>
                <button
                    onClick={applyFilters}
                    className="bg-accent hover:bg-accent/90 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                    Filtrer
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-foreground">
                    <thead className="bg-white/5 text-xs uppercase text-muted-foreground">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Status & Provider</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Client Info</th>
                            <th className="px-6 py-4">Items</th>
                            <th className="px-6 py-4">Driver (Actions)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 font-mono text-xs">{order.id.slice(-6)}</td>
                                <td className="px-6 py-4 max-w-[200px]">
                                    <div className="flex flex-col gap-2 items-start">
                                        <OrderStatusBadge status={order.status} />
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            disabled={isLoading === order.id}
                                            className="bg-[#0f172a] border border-white/10 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-accent text-xs w-full"
                                        >
                                            <option value="PENDING">➔ PENDING</option>
                                            <option value="PAYMENT_INITIATED">➔ INIT (Wait)</option>
                                            <option value="PAYMENT_CONFIRMED">➔ CONFIRM</option>
                                            <option value="PAYMENT_FAILED">➔ FAILED</option>
                                            <option value="ASSIGNED">➔ ASSIGN</option>
                                            <option value="DELIVERED">➔ DELIVERED</option>
                                            <option value="CANCELLED">➔ CANCEL</option>
                                        </select>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <span className="text-xs text-muted-foreground">Provider: <strong className="text-white/80">{order.paymentProvider || "N/A"}</strong></span>
                                            {order.paymentTransactionId && (
                                                <span className="text-[10px] font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded uppercase">{order.paymentTransactionId}</span>
                                            )}
                                            {order.paymentProofUrl && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedProofUrl(order.paymentProofUrl);
                                                        setProofModalOpen(true);
                                                    }}
                                                    className="text-xs text-accent text-left hover:underline flex items-center gap-1 mt-0.5"
                                                >
                                                    🖼️ Voir Preuve
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">${order.total.toFixed(2)}</td>
                                <td className="px-6 py-4 max-w-xs truncate">
                                    <p>{order.phoneNumber}</p>
                                    <p className="text-muted-foreground text-xs truncate">{order.shippingAddress}</p>
                                </td>
                                <td className="px-6 py-4 text-xs">
                                    {order.items.map((item, i) => (
                                        <div key={i}>{item.quantity}x {item.name}</div>
                                    ))}
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={order.driverId || ""}
                                        onChange={(e) => handleDriverChange(order.id, e.target.value)}
                                        disabled={isLoading === order.id}
                                        className="bg-[#0f172a] border border-white/10 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-accent"
                                    >
                                        <option value="">Unassigned</option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Proof Modal */}
            {proofModalOpen && selectedProofUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="relative bg-[#1d1d1f] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-white/10 shadow-2xl">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                            <h3 className="font-bold text-lg">Preuve de Paiement</h3>
                            <button
                                onClick={() => setProofModalOpen(false)}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 flex justify-center items-center bg-black/40">
                            <img
                                src={selectedProofUrl}
                                alt="Preuve de paiement"
                                className="max-w-full h-auto rounded-xl shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
