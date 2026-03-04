"use client";

import { Link, useRouter } from '@/i18n/routing';
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ShoppingBag, Eye } from "lucide-react";
import { Product, useCartStore } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { QuickViewModal } from "./QuickViewModal";
import { toast } from "sonner";

interface ProductCardProps {
    product: Product & { isNew?: boolean, stock?: number };
}

export function ProductCard({ product }: ProductCardProps) {
    const { formatHTG, formatUSD } = useCurrency();
    const t = useTranslations('Product');
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const addItem = useCartStore((state) => state.addItem);
    const router = useRouter();

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
        toast.success(`${product.name} ajouté !`, { description: 'Redirection vers le paiement...' });
        router.push("/checkout");
    };

    return (
        <>
            <div className="group relative flex flex-col items-center p-6 bg-white dark:bg-[#0f172a] rounded-3xl transition-transform duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#0b1120]/20 dark:hover:shadow-white/5">
                <button onClick={() => setIsQuickViewOpen(true)} aria-label="Quick View" className="absolute top-4 right-4 z-20 p-2 opacity-0 group-hover:opacity-100 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full text-foreground hover:scale-110 transition-all duration-300 shadow-lg">
                    <Eye className="w-5 h-5" />
                </button>

                <div className="w-full text-center mb-6">
                    {product.isNew && <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-2 block">{t('new')}</span>}
                    <h3 className="text-2xl font-semibold text-foreground mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{product.description}</p>
                </div>

                <div className="relative w-full aspect-square mb-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-3xl">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain transition-transform duration-700 cubic-bezier(0.32, 0.72, 0, 1) group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>

                {product.stock && product.stock < 10 ? (
                    <div className="mb-4">
                        <span className="text-xs font-semibold text-red-500 bg-red-500/10 px-3 py-1 rounded-full">{t('onlyXLeft', { stock: product.stock })}</span>
                    </div>
                ) : (
                    <div className="mb-4 h-6"></div> // spacer
                )}

                <div className="w-full mt-auto flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center">
                        <p className="text-lg font-medium text-foreground">{t('from')} {formatUSD(product.price)}</p>
                        <p className="text-sm font-semibold text-accent/80">~ {formatHTG(product.price)}</p>
                    </div>
                    <div className="flex gap-3 w-full justify-center relative z-10 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                        <Button variant="primary" className="flex-1 md:flex-none" onClick={handleBuyNow}>{t('buy')}</Button>
                        <AddToCartButton product={product} variant="secondary" className="px-3" aria-label={t('addToBag')}>
                            <ShoppingBag className="w-5 h-5" />
                        </AddToCartButton>
                    </div>
                    <Link href={`/product/${product.id}`} className="absolute inset-0 z-0">
                        <span className="sr-only">View {product.name}</span>
                    </Link>
                </div>
            </div>
            <QuickViewModal product={product} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />
        </>
    );
}
