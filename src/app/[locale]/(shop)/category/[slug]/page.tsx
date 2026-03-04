import { ProductCard } from "@/components/product/ProductCard";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { CategoryFilter } from "@/components/category/CategoryFilter";

export const revalidate = 3600;
export const dynamicParams = true;

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { sort, price } = await searchParams;

    const capitalizedCategoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

    let products = MOCK_PRODUCTS.filter(p => p.categoryRef?.slug === slug);

    if (price === 'under50') products = products.filter(p => p.price < 50);
    if (price === '50to150') products = products.filter(p => p.price >= 50 && p.price <= 150);
    if (price === 'over150') products = products.filter(p => p.price > 150);

    if (sort === 'newest') products = [...products].sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
    if (sort === 'price_asc') products = [...products].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') products = [...products].sort((a, b) => b.price - a.price);

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
            <div className="mb-12 border-b border-border pb-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                    Shop {capitalizedCategoryName}
                </h1>
                <p className="mt-4 text-xl text-muted-foreground">
                    Explore the latest {slug} models and accessories.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                <aside className="w-full lg:w-72 flex-shrink-0">
                    <CategoryFilter />
                </aside>

                <div className="flex-1">
                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center glass-surface border border-white/5 rounded-3xl">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">No products found</h2>
                            <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
