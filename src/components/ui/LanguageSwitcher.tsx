"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    function switchLocale(newLocale: 'fr' | 'ht') {
        // Keep the current pathname for the new locale
        router.replace(pathname, { locale: newLocale });
    }

    return (
        <div className="flex items-center gap-2 px-2 py-1 glass-surface rounded-full border border-white/5 mx-2">
            <button
                onClick={() => switchLocale('fr')}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${locale === 'fr' ? 'bg-accent text-white font-medium' : 'text-muted-foreground hover:text-white'}`}
            >
                FR
            </button>
            <button
                onClick={() => switchLocale('ht')}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${locale === 'ht' ? 'bg-accent text-white font-medium' : 'text-muted-foreground hover:text-white'}`}
            >
                HT
            </button>
        </div>
    );
}
