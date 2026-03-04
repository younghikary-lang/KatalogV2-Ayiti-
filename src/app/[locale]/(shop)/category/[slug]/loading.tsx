import { ProductGridSkeleton } from "@/components/product/ProductSkeleton";

export default function CategoryLoading() {
    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
                <div className="h-10 bg-muted/30 rounded w-1/4 animate-pulse" />
                <div className="h-10 bg-muted/30 rounded w-32 animate-pulse" />
            </div>
            {/* The Grid Skeleton */}
            <ProductGridSkeleton />
        </div>
    );
}
