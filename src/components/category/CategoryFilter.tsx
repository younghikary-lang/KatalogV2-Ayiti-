"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal } from "lucide-react";

export function CategoryFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const sort = searchParams.get('sort') || '';
    const price = searchParams.get('price') || '';

    return (
        <div className="glass-surface p-4 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
                <SlidersHorizontal className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-lg">Filters</h3>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground block">Sort By</label>
                <select
                    value={sort}
                    onChange={(e) => router.push(pathname + '?' + createQueryString('sort', e.target.value))}
                    className="w-full bg-[#0b1120] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none transition-all appearance-none cursor-pointer"
                >
                    <option value="">Recommended</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                </select>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground block">Price Range</label>
                <select
                    value={price}
                    onChange={(e) => router.push(pathname + '?' + createQueryString('price', e.target.value))}
                    className="w-full bg-[#0b1120] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none transition-all appearance-none cursor-pointer"
                >
                    <option value="">Any Price</option>
                    <option value="under50">Under $50</option>
                    <option value="50to150">$50 to $150</option>
                    <option value="over150">Over $150</option>
                </select>
            </div>

            {(sort || price) && (
                <button
                    onClick={() => router.push(pathname)}
                    className="w-full py-2 text-xs text-muted-foreground hover:text-white transition-colors"
                >
                    Clear All Filters
                </button>
            )}
        </div>
    );
}
