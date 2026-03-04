"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { Product } from "@/lib/store";
import { useTranslations } from "next-intl";

interface QuickViewModalProps {
    product: Product & { isNew?: boolean, stock?: number };
    isOpen: boolean;
    onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
    const t = useTranslations('Product');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="relative w-full max-w-4xl bg-white dark:bg-[#0f172a] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
                    <X className="w-5 h-5 text-foreground" />
                </button>

                <div className="relative w-full md:w-1/2 min-h-[300px] md:min-h-[400px] bg-[#f5f5f7] dark:bg-[#1d1d1f] p-8 flex items-center justify-center">
                    <Image src={product.image} alt={product.name} fill className="object-contain p-8" />
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    {product.isNew && <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-3 block">{t('new')}</span>}
                    <h2 className="text-3xl font-bold text-foreground mb-4">{product.name}</h2>
                    <p className="text-xl font-medium text-foreground mb-6">${product.price}</p>
                    <p className="text-muted-foreground mb-8 leading-relaxed">{product.description}</p>

                    {product.stock && product.stock < 10 && (
                        <p className="text-sm font-semibold text-red-500 mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            {t('orderSoon', { stock: product.stock })}
                        </p>
                    )}

                    <div className="flex gap-4 w-full">
                        <AddToCartButton product={product} variant="primary" className="flex-1 py-4 text-lg rounded-2xl">
                            {t('addToBag')}
                        </AddToCartButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
