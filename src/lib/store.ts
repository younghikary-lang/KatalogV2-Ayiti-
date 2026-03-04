import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_PRODUCTS } from './mock-data';

export type Product = typeof MOCK_PRODUCTS[0];

export interface CartItem extends Product {
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    isHydrated: boolean;
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    setCartOpen: (isOpen: boolean) => void;
    setHydrated: (state: boolean) => void;
    cartTotal: () => number;
    cartCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            isHydrated: false,
            setHydrated: (state) => set({ isHydrated: state }),
            addItem: (product) => {
                const currentItems = get().items;
                const existingItem = currentItems.find(item => item.id === product.id);

                if (existingItem) {
                    set({
                        items: currentItems.map(item =>
                            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                        ),
                        isOpen: true,
                    });
                } else {
                    set({
                        items: [...currentItems, { ...product, quantity: 1 }],
                        isOpen: true,
                    });
                }
            },
            removeItem: (productId) => {
                set({ items: get().items.filter(item => item.id !== productId) });
            },
            updateQuantity: (productId, quantity) => {
                set({
                    items: get().items.map(item =>
                        item.id === productId ? { ...item, quantity } : item
                    )
                });
            },
            clearCart: () => set({ items: [] }),
            toggleCart: () => set({ isOpen: !get().isOpen }),
            setCartOpen: (isOpen) => set({ isOpen }),
            cartTotal: () => {
                return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
            },
            cartCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'katalog-v2-cart',
            partialize: (state) => ({
                items: state.items,
                isOpen: state.isOpen
            }),
            merge: (persistedState: unknown, currentState) => ({
                ...currentState,
                items: (persistedState as { items: CartItem[] })?.items || [],
                isOpen: (persistedState as { isOpen: boolean })?.isOpen || false,
            }),
            onRehydrateStorage: () => (state) => {
                console.log('✅ Zustand Cart Store Hydrated:', state);
                state?.setHydrated(true);
            },
        }
    )
);
