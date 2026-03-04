import { getTranslations } from "next-intl/server";
import { trackOrder } from "@/app/actions/order";
import { format } from "date-fns";
import { CheckCircle2, Clock, Truck, PlayCircle, Search, Lock, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { OrderTracker } from "@/components/tracking/OrderTracker";
import { QRCodeSVG } from 'qrcode.react';

export default async function TrackOrderPage(props: { params: Promise<{ orderId: string }> }) {
    const params = await props.params;
    const t = await getTranslations('Dashboard');

    // Server-side fetch without auth requirements
    const result = await trackOrder(params.orderId);

    if (!result.success || !result.order) {
        return (
            <div className="w-full max-w-3xl mx-auto px-4 py-24 text-center">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-30" />
                <h1 className="text-2xl font-bold mb-4">Commande Introuvable</h1>
                <p className="text-muted-foreground mb-8">Nous n'avons pas pu trouver la commande #{params.orderId}. Vérifiez le lien que vous avez reçu par email ou WhatsApp.</p>
                <Link href="/" className="btn-primary py-3 px-8 rounded-xl font-medium inline-block relative overflow-hidden group">
                    <span className="relative z-10">Retour à la boutique</span>
                </Link>
            </div>
        );
    }

    const { order } = result;

    const qrValue = `${process.env.NEXT_PUBLIC_APP_URL || 'https://katalog.com'}/verify/${order.publicTrackingToken}`;

    return (
        <div className="w-full bg-[#f8f9fa] dark:bg-[#0b1120] min-h-screen pb-24">
            {/* Top Success Banner */}
            <div className="bg-[#1a202c] dark:bg-black pt-16 pb-24 px-4 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 text-white mb-6 shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Commande confirmée!</h1>
                <p className="text-gray-400 text-sm">Merci pour votre achat</p>
            </div>

            <div className="max-w-md mx-auto px-4 -mt-16 space-y-4">
                {/* QR Code Card */}
                <div className="bg-white dark:bg-[#1d1d1f] rounded-3xl p-8 text-center shadow-xl shadow-black/5">
                    <div className="bg-gray-50 dark:bg-black/50 p-6 rounded-2xl inline-block mb-6">
                        <QRCodeSVG value={qrValue} size={200} level="H" includeMargin={true} className="rounded-xl" />
                    </div>

                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-500 font-medium text-sm mb-4">
                        <Lock className="w-4 h-4" />
                        <span>Code sécurisé</span>
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Code de commande</p>
                    <p className="font-mono text-xl font-bold text-foreground tracking-widest">{order.publicTrackingToken.split('-')[0].toUpperCase()}</p>
                    <p className="text-[10px] text-muted-foreground mt-2 mb-8">KATALOG BOUTIK HAITI</p>

                    <div className="flex gap-4">
                        <button className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" /> Télécharger
                        </button>
                        <button className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                            <Share2 className="w-4 h-4" /> Partager
                        </button>
                    </div>
                </div>

                {/* Timeline Card */}
                <div className="bg-white dark:bg-[#1d1d1f] rounded-3xl p-6 shadow-xl shadow-black/5">
                    <h3 className="font-bold text-lg mb-6 text-foreground">Suivi de commande</h3>
                    <OrderTracker order={order} />
                </div>

                {/* Order Details Card */}
                <div className="bg-white dark:bg-[#1d1d1f] rounded-3xl p-6 shadow-xl shadow-black/5">
                    <h3 className="font-bold text-lg mb-6 text-foreground">Détails de la commande</h3>

                    <div className="space-y-4 mb-6">
                        {order.items?.map((item: any, i: number) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-black/50 rounded-xl flex items-center justify-center text-xs text-muted-foreground">{item.quantity}x</div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground line-clamp-2">{item.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Qté: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-white/5 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Sous-total</span>
                            <span className="text-foreground">${order.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Livraison</span>
                            <span className="text-foreground">$0.00</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-100 dark:border-white/5">
                            <span>Total</span>
                            <span>${order.total.toFixed(2)} USD</span>
                        </div>
                    </div>
                </div>

                {/* Shipping Address Card */}
                <div className="bg-white dark:bg-[#1d1d1f] rounded-3xl p-6 shadow-xl shadow-black/5">
                    <h3 className="font-bold text-lg mb-4 text-foreground">Adresse de livraison</h3>
                    <p className="text-sm text-muted-foreground mb-1">{order.phoneNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.shippingAddress}, {order.department}</p>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-500 p-4 rounded-xl flex items-start gap-3 mt-8">
                    <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-bold mb-1">Commande sécurisée</p>
                        <p className="text-green-600/80 dark:text-green-500/80 text-xs">Seul votre QR code peut confirmer la livraison. Ne le partagez avec personne d'autre que votre livreur Katalog.</p>
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <Link href="/" className="flex-1 py-4 text-center rounded-2xl bg-white dark:bg-[#1d1d1f] font-medium border border-gray-200 dark:border-white/5">Mes commandes</Link>
                    <Link href="/" className="flex-1 py-4 text-center rounded-2xl bg-[#1a202c] dark:bg-white text-white dark:text-black font-medium">Accueil</Link>
                </div>
            </div>
        </div>
    );
}
