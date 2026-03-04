import Image from "next/image";
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations('Home');
  const featuredProduct = MOCK_PRODUCTS.find(p => p.id === "p2"); // Sneakers Air Max Pro
  const bestsellers = MOCK_PRODUCTS.filter(p => ["p1", "p3", "p4", "p5"].includes(p.id));

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] max-h-[900px] flex items-center justify-center overflow-hidden bg-[#0b1120] text-white">
        <div className="absolute inset-0 z-0">
          {featuredProduct && (
            <Image
              src={featuredProduct.image}
              alt={featuredProduct.name}
              fill
              className="object-cover opacity-60 scale-105 animate-pulse-slow"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-4 mt-20">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 drop-shadow-xl">
            {t('heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl font-light text-shadow-sm">
            {t('heroSubtitle')}
          </p>
          <div className="flex gap-4">
            <Link href="/checkout">
              <Button size="lg" className="rounded-full px-8 bg-white text-[#0f172a] hover:bg-gray-200">
                {t('buyNow')}
              </Button>
            </Link>
            <Link href={`/product/${featuredProduct?.id}`}>
              <Button size="lg" variant="ghost" className="rounded-full px-8 text-white hover:bg-white/20">
                {t('learnMore')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="w-full border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">{t('shopByCategory')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Vêtements", id: "vetements", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600" },
              { name: "Chaussures", id: "chaussures", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600" },
              { name: "Accessoires", id: "accessoires", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600" },
              { name: "Montres", id: "montres", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600" },
            ].map((cat) => (
              <Link key={cat.id} href={`/category/${cat.id}`} className="group block relative h-64 rounded-3xl overflow-hidden category-card">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover opacity-50 mix-blend-overlay transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
                  <h3 className="text-2xl font-bold text-white tracking-widest uppercase drop-shadow-lg">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="w-full border-t border-white/5 bg-[#0b1120]/50 backdrop-blur-md py-24 relative z-10">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl font-bold tracking-tight">{t('theLatest')} <span className="text-muted-foreground font-medium">{t('takeALook')}</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
