"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function SmartSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const t = useTranslations('Navbar');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const results = query
        ? MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.categoryRef?.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4)
        : [];

    return (
        <div className="relative flex items-center" ref={containerRef}>
            {isOpen ? (
                <div className="flex items-center bg-white/10 dark:bg-white/5 border border-white/20 rounded-full px-3 py-1.5 w-full sm:w-64 transition-all duration-300">
                    <Search className="h-4 w-4 text-muted-foreground mr-2" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('searchPlaceholder')}
                        className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder-muted-foreground"
                        autoFocus
                    />
                    <button onClick={() => { setIsOpen(false); setQuery(""); }} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <button onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }} className="text-foreground hover:text-accent transition-colors" aria-label="Search">
                    <Search className="h-5 w-5" />
                </button>
            )}

            {/* Results Popover */}
            {isOpen && query.length > 0 && (
                <div className="absolute top-full mt-4 right-0 w-[calc(100vw-2rem)] sm:w-96 bg-white dark:bg-[#0f172a] border border-border shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-border bg-muted/30">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Results for &quot;{query}&quot;</p>
                    </div>
                    {results.length > 0 ? (
                        <div className="max-h-[60vh] overflow-y-auto">
                            {results.map(product => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.id}`}
                                    onClick={() => { setIsOpen(false); setQuery(""); }}
                                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-white/5 last:border-0"
                                >
                                    <div className="relative w-16 h-16 bg-white rounded-lg flex-shrink-0 flex items-center justify-center">
                                        <Image src={product.image} alt={product.name} fill className="object-contain p-1" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-foreground truncate">{product.name}</h4>
                                        <p className="text-xs text-muted-foreground capitalize mt-1">{product.categoryRef?.name}</p>
                                    </div>
                                    <div className="text-sm font-semibold text-foreground">
                                        ${product.price}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-sm text-muted-foreground">No products found matching &quot;{query}&quot;</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
