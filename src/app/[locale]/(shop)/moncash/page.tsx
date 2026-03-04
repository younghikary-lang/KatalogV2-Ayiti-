"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";

export default function MonCashSimulator() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const router = useRouter();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    useEffect(() => {
        if (!orderId) {
            router.push('/');
        }
    }, [orderId, router]);

    const handlePayment = async () => {
        setStatus('loading');
        try {
            const res = await fetch('/api/webhooks/moncash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType: 'successful_payment',
                    orderId: orderId,
                    transactionId: 'MC-' + Math.floor(Math.random() * 1000000)
                })
            });

            if (res.ok) {
                setStatus('success');
                setTimeout(() => {
                    router.push('/success');
                }, 1500);
            } else {
                alert("Erreur de simulation Webhook MonCash");
                setStatus('idle');
            }
        } catch (e) {
            alert("Erreur réseau");
            setStatus('idle');
        }
    };

    if (!orderId) return null;

    return (
        <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-4 m-0 overflow-hidden fixed inset-0 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-extrabold text-3xl tracking-tighter shadow-inner">
                        MC
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">MonCash Checkout</h1>
                <p className="text-gray-500 text-sm">Ceci est un simulateur du portail Digicel pour Haïti. Commande <strong className="text-gray-800">#{orderId.slice(-6).toUpperCase()}</strong></p>

                <div className="pt-6">
                    <button
                        onClick={handlePayment}
                        disabled={status !== 'idle'}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 text-lg shadow-md"
                    >
                        {status === 'loading' ? 'Traitement...' : status === 'success' ? 'Paiement Validé ✅' : 'Confirmer (Simulation)'}
                    </button>
                    <button
                        onClick={() => router.push('/checkout')}
                        disabled={status !== 'idle'}
                        className="w-full mt-3 text-red-600 hover:bg-red-50 font-medium py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
}
