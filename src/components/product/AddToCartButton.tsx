"use client";

import { Button } from "@/components/ui/Button";
import { Product, useCartStore } from "@/lib/store";
import { toast } from "sonner";

interface AddToCartButtonProps {
    product: Product;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    className?: string;
    children?: React.ReactNode;
}

export function AddToCartButton({ product, variant = 'primary', size = 'lg', className, children = "Add to Bag" }: AddToCartButtonProps) {
    const { addItem } = useCartStore();

    return (
        <Button
            variant={variant}
            size={size}
            className={`${className || ''} active:scale-[0.97] transition-transform`}
            onClick={() => {
                addItem(product);
                toast.success(`${product.name} ajouté !`, {
                    description: 'Retrouvez-le dans votre panier.'
                });
            }}
        >
            {children}
        </Button>
    );
}
