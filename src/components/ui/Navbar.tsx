"use client";

import { Link } from '@/i18n/routing';
import { ShoppingBag, Menu, User } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { SmartSearch } from './SmartSearch';

export function Navbar({ session }: { session?: any }) {
    const { cartCount, toggleCart, isHydrated } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const t = useTranslations('Navbar');

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const totalItems = cartCount();

    const role = session?.user?.role;
    let accountLink = '/login';
    let accountLabel = t('login');

    if (session?.user) {
        if (role === 'admin') {
            accountLink = '/admin';
            accountLabel = 'Dashboard';
        } else if (role === 'driver') {
            accountLink = '/driver';
            accountLabel = 'Livraisons';
        } else {
            accountLink = '/account';
            accountLabel = 'Mon Compte';
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border glass transition-all duration-300">
            <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Mobile Menu & Search */}
                <div className="flex flex-1 items-center gap-4 sm:hidden">
                    <button className="text-foreground hover:text-accent transition-colors" aria-label="Open Menu">
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="sm:hidden -ml-2">
                        <SmartSearch />
                    </div>
                </div>

                {/* Logo */}
                <Link href="/" className="flex flex-1 sm:flex-none justify-center sm:justify-start items-center">
                    <Image
                        src="/brand/katalog-logo.png"
                        alt="KatalogV2 Logo"
                        width={200}
                        height={100}
                        className="h-[44px] sm:h-[56px] w-auto object-contain"
                        priority
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden flex-1 sm:flex items-center justify-center gap-8 text-sm font-medium">
                    <Link href="/category/vetements" className="text-foreground/80 hover:text-foreground transition-colors">Vêtements</Link>
                    <Link href="/category/chaussures" className="text-foreground/80 hover:text-foreground transition-colors">Chaussures</Link>
                    <Link href="/category/accessoires" className="text-foreground/80 hover:text-foreground transition-colors">Accessoires</Link>
                </nav>

                {/* Right Actions */}
                <div className="flex flex-1 items-center justify-end gap-3 sm:gap-6">
                    <LanguageSwitcher />
                    <Link href={accountLink} className="hidden sm:flex items-center gap-2 text-foreground hover:text-accent transition-colors text-sm font-medium" aria-label={accountLabel}>
                        <User className="h-5 w-5" />
                        <span className="hidden lg:inline">{accountLabel}</span>
                    </Link>
                    <div className="hidden sm:block">
                        <SmartSearch />
                    </div>
                    <button
                        onClick={toggleCart}
                        className="relative text-foreground hover:text-accent transition-colors flex items-center gap-2"
                        aria-label="Cart"
                    >
                        <ShoppingBag className="h-5 w-5" />
                        {mounted && isHydrated && totalItems > 0 && (
                            <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
