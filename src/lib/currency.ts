import { create } from 'zustand';

interface SettingsStore {
    htgRate: number;
    setHtgRate: (rate: number) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
    htgRate: 135.0, // Default fallback
    setHtgRate: (rate) => set({ htgRate: rate })
}));

/**
 * Formats a USD amount into USD currency string.
 */
export function formatUSD(usdAmount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(usdAmount);
}

/**
 * Converts a USD amount to HTG and formats it as a currency string.
 */
export function formatHTG(usdAmount: number, rate: number = 135.0): string {
    const htgAmount = usdAmount * rate;
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'HTG',
        maximumFractionDigits: 0
    }).format(htgAmount);
}

/**
 * Hook for Client Components to automatically use the synchronized HTG Rate
 */
export function useCurrency() {
    const htgRate = useSettingsStore(state => state.htgRate);

    return {
        formatUSD,
        formatHTG: (usdAmount: number) => formatHTG(usdAmount, htgRate),
        htgRate,
    };
}
