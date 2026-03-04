import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { BuyNowButton } from "@/components/product/BuyNowButton";
import { Button } from "@/components/ui/Button";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { Product } from "@/lib/store";
import { formatHTG, formatUSD } from "@/lib/currency";
import { getGlobalHtgRate } from "@/lib/settings";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/components/product/ProductCard";

export const revalidate = 3600;
export const dynamicParams = true;

type Props = {
    params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params;
    const t = await getTranslations('Product');
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    const htgRate = await getGlobalHtgRate();

    if (!product) {
        notFound();
    }

    const relatedProducts = MOCK_PRODUCTS
        .filter(p => p.categoryRef?.id === product.categoryRef?.id && p.id !== id)
        .slice(0, 4);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.image.startsWith('http') ? product.image : `${process.env.NEXT_PUBLIC_APP_URL || 'https://katalog.ht'}${product.image}`,
        description: product.description,
        sku: product.id,
        offers: {
            '@type': 'Offer',
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://katalog.ht'}/fr/product/${product.id}`,
            priceCurrency: 'USD',
            price: product.price,
            itemCondition: product.isNew ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
            availability: (product.stock && product.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        }
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12 md:py-24">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
                {/* Image Gallery Side */}
                <div className="relative aspect-square md:aspect-[4/5] bg-white dark:bg-[#0f172a] rounded-3xl overflow-hidden p-8 flex items-center justify-center shadow-lg dark:shadow-none border border-white/5">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-12 transition-transform duration-700 hover:scale-105"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>

                {/* Details Side */}
                <div className="flex flex-col justify-center">
                    <p className="text-accent font-semibold tracking-wider uppercase mb-2 text-sm">
                        {product.isNew ? t('new') : `${t('category')}: ${product.categoryRef?.name}`}
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
                        {product.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="flex items-end gap-3">
                            <p className="text-3xl font-bold tracking-tight text-foreground">
                                {formatUSD(product.price)}
                            </p>
                            <p className="text-xl font-medium text-accent/80 pb-1">
                                ~ {formatHTG(product.price, htgRate)}
                            </p>
                        </div>
                        {product.stock && product.stock < 10 && (
                            <span className="text-xs font-semibold text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full animate-pulse">
                                {t('onlyXLeft', { stock: product.stock })}
                            </span>
                        )}
                    </div>

                    <div className="prose prose-lg dark:prose-invert mb-8 text-muted-foreground font-light">
                        <p>{product.description}</p>
                        <p className="mt-4">{t('tagline', { name: product.name })}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-12">
                        <AddToCartButton product={product as Product} size="lg" className="flex-[2] text-lg">{t('addToBag')}</AddToCartButton>
                        <BuyNowButton product={product as Product} size="lg" variant="secondary" className="flex-1 text-lg w-full">{t('buyNow')}</BuyNowButton>
                    </div>

                    <div className="space-y-6 border-t border-border pt-8">
                        <div className="flex items-start gap-4">
                            <Truck className="w-6 h-6 text-accent mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-foreground">{t('freeDeliveryTitle')}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{t('freeDeliveryDesc')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <RotateCcw className="w-6 h-6 text-accent mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-foreground">{t('freeReturnsTitle')}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{t('freeReturnsDesc')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <ShieldCheck className="w-6 h-6 text-accent mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-foreground">{t('premiumWarrantyTitle')}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{t('premiumWarrantyDesc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products Carousel */}
            {relatedProducts.length > 0 && (
                <div className="mt-24 pt-12 border-t border-border/50">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground mb-8">
                        Vous aimerez aussi
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p.id} product={p as Product} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
