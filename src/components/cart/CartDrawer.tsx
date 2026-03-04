"use client";

import { useCartStore } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { X, Minus, Plus, ShoppingBag, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Link } from '@/i18n/routing';
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function CartDrawer() {
    const { items, isOpen, isHydrated, setCartOpen, removeItem, updateQuantity, cartTotal } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const t = useTranslations('Cart');
    const { formatHTG, formatUSD } = useCurrency();

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted || !isHydrated) return null;

    const total = cartTotal();
    const FREE_SHIPPING_THRESHOLD = 500;
    const progress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const remaining = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-[#0b1120]/60 backdrop-blur-sm z-[60] transition-opacity"
                    onClick={() => setCartOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-background shadow-2xl z-[70] transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
            >
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
                    <button
                        onClick={() => setCartOpen(false)}
                        className="p-2 rounded-full hover:bg-muted transition-colors text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {items.length > 0 && (
                    <div className="px-6 pt-6">
                        <div className="bg-muted/30 rounded-2xl p-4 border border-white/5 shadow-inner">
                            {remaining > 0 ? (
                                <p className="text-sm font-medium text-foreground mb-3">
                                    {t.rich('progressRemaining', {
                                        value: '$' + remaining.toFixed(2),
                                        amount: (chunks) => <span className="text-accent font-bold">{chunks}</span>
                                    })}
                                </p>
                            ) : (
                                <p className="text-sm font-medium text-green-500 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> {t('progressUnlocked')}
                                </p>
                            )}
                            <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-700 ease-out ${remaining === 0 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]'}`}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                            <ShoppingBag className="w-16 h-16 opacity-20" />
                            <p className="text-xl font-medium">{t('empty')}</p>
                            <Button variant="outline" onClick={() => setCartOpen(false)} className="mt-4">
                                {t('continueShopping')}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-6 group">
                                    <div className="relative w-24 h-24 bg-muted/30 rounded-2xl p-2 flex-shrink-0">
                                        <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg text-foreground line-clamp-1">{item.name}</h3>
                                                <p className="text-muted-foreground">{formatUSD(item.price)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center gap-3 bg-muted/50 rounded-full p-1 border border-border/50">
                                                <button
                                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background shadow-sm transition-colors disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-4 text-center font-medium text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background shadow-sm transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    removeItem(item.id);
                                                    toast.info(`${item.name} retiré du panier.`);
                                                }}
                                                className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-2"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="border-t border-border p-6 bg-muted/10">
                        <div className="flex justify-between items-center mb-6 text-xl">
                            <span className="font-semibold">{t('subtotal')}</span>
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-foreground">{formatUSD(total)}</span>
                                <span className="font-medium text-sm text-accent">~ {formatHTG(total)}</span>
                            </div>
                        </div>
                        <Link href="/checkout" onClick={() => setCartOpen(false)}>
                            <Button size="lg" className="btn-primary w-full text-lg h-14 rounded-2xl active:scale-[0.98] transition-all">
                                {t('checkout')}
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
