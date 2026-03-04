export function ProductSkeleton() {
    return (
        <div className="group relative flex flex-col gap-4 animate-pulse">
            {/* Image Skeleton */}
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted/30" />

            {/* Content Skeleton */}
            <div className="px-2 space-y-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted/30 rounded w-3/4" />
                        <div className="h-3 bg-muted/30 rounded w-1/2" />
                    </div>
                </div>
                {/* Price Skeleton */}
                <div className="h-5 w-24 bg-muted/30 rounded" />
            </div>
            {/* Button Skeleton */}
            <div className="h-10 w-full bg-muted/30 rounded-xl mt-2" />
        </div>
    );
}

export function ProductGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-8">
            {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    );
}
